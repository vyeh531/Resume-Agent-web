"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const DRY_RUN = argv.includes("--dry-run") || !APPLY;
const BACKUP_ONLY = argv.includes("--backup-only");
const LIMIT = numberArg("--limit", APPLY ? 0 : 100);
const BATCH_SIZE = numberArg("--batch-size", 10);
const RESUME_AFTER_ID = numberArg("--resume-after-id", 0);
const START_OFFSET = numberArg("--offset", 0);
const MODEL = stringArg("--model", "mistral:latest");
const OLLAMA_URL = stringArg("--ollama-url", "http://127.0.0.1:11434");
const TEMPERATURE = Number(stringArg("--temperature", "0.35"));
const NUM_PREDICT = numberArg("--num-predict", 180);
const MAX_RETRIES = numberArg("--max-retries", 2);
const APPLY_CHUNK_SIZE = numberArg("--apply-chunk-size", 50);

const SELECT_COLUMNS = `
  id, chunk_id, retrieval_scope, topic, "L1", "L2", advice_type,
  problem_tags, ats_dimensions, role_family, target_roles, seniority,
  advice_card_title, user_problem_summary, action_summary,
  "P_mentor", "A_action", "I_insight", "H_hook", "E_example", "HR_os",
  retrieval_text
`;

const FORBIDDEN_PATTERNS = [
  /快速筛选信号|快速篩選信號/i,
  /匹配感会被削弱|匹配感會被削弱/i,
  /暂无\s*HR|暫無\s*HR|暂无HR|暫無HR/i,
  /作为一名|身为一名|资深HR认为|資深HR認為/i,
  /这条建议|這條建議|该建议|該建議/i,
  /机器筛选的核心|機器篩選的核心|可以提高|有助于提高|有助於提高/i,
  /提高.*(机筛|機篩|通过率|通過率|匹配度)|机器主导|機器主導|意义不大|意義不大|反而制造|反而製造/i,
];

function numberArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  if (!raw) return fallback;
  const value = Number(raw.slice(name.length + 1));
  return Number.isFinite(value) ? value : fallback;
}

function stringArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  return raw ? raw.slice(name.length + 1) : fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function compact(value, max = 420) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanHr(value) {
  return String(value || "")
    .replace(/^["'「『]|["'」』]$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function chineseLength(value) {
  return Array.from(String(value || "").trim()).length;
}

function isMostlyChinese(value) {
  const text = String(value || "");
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  return cjk >= Math.max(12, Math.floor(text.length * 0.35));
}

function buildRetrievalText(row, hrOs) {
  const parts = [
    ["Topic", row.topic],
    ["L1", row.L1],
    ["L2", row.L2],
    ["Problem", row.P_mentor],
    ["Action", row.A_action],
    ["Insight", row.I_insight],
    ["Hook", row.H_hook],
    ["Example", row.E_example],
    ["HR/ATS perspective", hrOs],
    ["Advice type", row.advice_type],
    ["Role family", row.role_family],
    ["Target roles", row.target_roles],
    ["Seniority", row.seniority],
    ["ATS dimensions", row.ats_dimensions],
    ["Problem tags", row.problem_tags],
    ["Card title", row.advice_card_title],
    ["User problem", row.user_problem_summary],
    ["Action summary", row.action_summary],
  ];
  return parts
    .filter(([, value]) => String(value || "").trim())
    .map(([label, value]) => `${label}: ${compact(value, 900)}`)
    .join("\n");
}

function scopeGuidance(row) {
  const scope = String(row.retrieval_scope || "").toLowerCase();
  if (scope === "interview") {
    return "面试/用人经理视角：说明这条准备不足会如何影响面试判断、追问深度或录用信心。";
  }
  if (scope === "job_search") {
    return "招聘流程视角：说明这条投递/触达策略会如何影响简历被看到、被回复或被推进。";
  }
  if (scope === "career_strategy") {
    return "招聘市场/候选人定位视角：说明这条方向选择会如何影响岗位匹配、机会范围或长期可信度。";
  }
  if (scope === "school_application") {
    return "评审/招聘迁移视角：说明这条背景准备会如何影响材料可信度和后续机会判断。";
  }
  return "简历初筛视角：说明 HR 扫简历时会如何理解这条问题，以及它对进入下一轮的影响。";
}

function promptForBatch(rows) {
  const payload = rows.map((row) => ({
    id: row.id,
    scope: row.retrieval_scope || "",
    topic: compact([row.topic, row.L1, row.L2].filter(Boolean).join(" / "), 160),
    problem_tags: row.problem_tags || "",
    ats_dimensions: row.ats_dimensions || "",
    title: compact(row.advice_card_title || row.user_problem_summary || row.topic, 120),
    problem: compact(row.user_problem_summary || row.P_mentor, 180),
    action: compact(row.action_summary || row.A_action, 220),
    insight: compact(row.I_insight || row.P_mentor, 160),
    guidance: scopeGuidance(row),
  }));

  return [
    "你是一位在美国公司做过多年招聘筛选的资深 HR / recruiter。",
    "请为每条导师建议写一个 HR_os，也就是 HR 视角补充评价。",
    "",
    "硬性要求：",
    "1. 只输出 JSON array，不要 markdown，不要解释。",
    "2. 每个对象格式必须是 {\"id\": number, \"HR_os\": string}。",
    "2a. 必须为待处理数据里的每一个 id 都输出一个对象，不能漏掉任何 id。",
    "3. HR_os 用简体中文，45-70 个中文字左右，一句话或两个短分句。",
    "4. 口吻像真人 HR：自然、口语、专业，可以说“我会先看”“我会担心”“我会更愿意推进”。",
    "5. 优先写 HR 的真实判断：我看到这里会怎么想、会担心什么、为什么愿意/不愿意推进。",
    "6. 不要写成 AI 总结，不要说“这条建议/该建议/作为资深HR”。",
    "7. 不要写工具说明句，例如“可以提高通过率”“ATS机器筛选的核心是...”。",
    "8. 不要照抄 action，不要编造具体公司、数字、身份、学校。",
    "9. 禁止出现：“快速筛选信号”“匹配感会被削弱”“暂无HR视角”。",
    "10. 根据 scope 调整视角：resume_edit 看简历初筛；job_search 看投递推进；interview 看面试判断；career_strategy 看市场和定位。",
    "11. 必须支持导师建议，不要反驳、否定或评价这条建议没意义。",
    "",
    "好风格示例：",
    "我第一眼会先看你投什么岗；Summary 不明确，再好的经历也容易被放到旁边。",
    "只把技能列在 Skills 还不够，我会想看你在哪段经历里真的用过它。",
    "经历如果只写做了什么，我很难判断你做得多深、成果多大、是否值得面试。",
    "这份如果看起来像海投版，我会降低优先级；越贴 JD，越像认真投递。",
    "",
    "坏风格示例，不要模仿：",
    "统一属性分类可以让技能板块结构清晰，提高面试官和ATS快速定位候选人技术栈。",
    "ATS机器筛选的核心就是关键词匹配。",
    "",
    "待处理数据：",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

async function callOllama(prompt) {
  const response = await fetch(`${OLLAMA_URL.replace(/\/$/, "")}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      format: "json",
      options: {
        temperature: TEMPERATURE,
        top_p: 0.9,
        num_predict: NUM_PREDICT,
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  return String(data.response || "").trim();
}

function parseJsonArray(raw) {
  const text = String(raw || "").trim();
  const direct = safeJson(text);
  if (Array.isArray(direct)) return direct;
  if (direct && typeof direct === "object" && "id" in direct && "HR_os" in direct) return [direct];
  if (direct && Array.isArray(direct.items)) return direct.items;
  if (direct && Array.isArray(direct.results)) return direct.results;
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    const parsed = safeJson(match[0]);
    if (Array.isArray(parsed)) return parsed;
  }
  throw new Error(`Could not parse JSON array from Ollama response: ${text.slice(0, 300)}`);
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function fallbackHr(row) {
  const tags = `${row.problem_tags || ""} ${row.ats_dimensions || ""}`.toLowerCase();
  const scope = String(row.retrieval_scope || "").toLowerCase();
  const text = [
    row.topic,
    row.L1,
    row.L2,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.A_action,
  ].filter(Boolean).join(" ").toLowerCase();

  if (/interview|面试/.test(scope)) return "面试时我会顺着这块继续追问；如果准备不扎实，很容易让人觉得经验停在表面。";
  if (/job_search|投递|内推|network|linkedin/.test(`${scope} ${text}`)) return "从招聘流程看，简历被看到只是第一步；主动触达和跟进会明显提高被推进的机会。";
  if (/career_strategy|职业|方向|市场|定位/.test(`${scope} ${text}`)) return "我会更看重候选人定位是否清楚；方向越聚焦，越容易判断适合哪些岗位。";
  if (/linkedin|github|portfolio|link|contact/.test(`${tags} ${text}`)) return "缺少可验证链接时，我会少一个快速确认背景和作品可信度的入口。";
  if (/format|date|section|layout|readability/.test(`${tags} ${text}`)) return "日期和版面不稳，我会先担心细节感；ATS 解析错，也会影响人工判断。";
  if (/summary|exact_job_title|target_role|role_alignment/.test(tags)) return "我第一眼会先看你投什么岗；定位不明确，再好的经历也容易被放到旁边。";
  if (/keyword|hard_skill|jd_match|skills/.test(`${tags} ${text}`)) return "HR 初筛其实很看 JD 原词；核心技能没出现，我很难把你推到下一轮。";
  if (/experience|evidence|project|bullet/.test(`${tags} ${text}`)) return "经历如果只写做了什么，我很难判断你做得多深、成果多大、是否值得面试。";
  if (/measurable|result|impact|action_verbs|成果|量化/.test(`${tags} ${text}`)) return "没有数字时，贡献会显得比较模糊；HR 也更难替你向用人部门推荐。";
  return "我会看这条内容能不能帮我快速判断匹配度；表达越具体，越容易被继续推进。";
}

function validateOutput(row, value) {
  const hr = cleanHr(value);
  const length = chineseLength(hr);
  const issues = [];
  if (!hr) issues.push("empty");
  if (length < 34) issues.push("too_short");
  if (length > 100) issues.push("too_long");
  if (!isMostlyChinese(hr)) issues.push("not_chinese_enough");
  if (FORBIDDEN_PATTERNS.some((pattern) => pattern.test(hr))) issues.push("forbidden_phrase");

  const action = compact(row.action_summary || row.A_action, 120);
  if (action && hr.includes(action.slice(0, Math.min(24, action.length)))) {
    issues.push("copies_action");
  }
  return { ok: issues.length === 0, hr, issues };
}

async function generateBatch(rows) {
  let lastError = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const prompt = promptForBatch(rows);
      const raw = await callOllama(prompt);
      const parsed = parseJsonArray(raw);
      const byId = new Map(parsed.map((item) => [Number(item.id), item]));
      const outputs = [];
      const errors = [];
      for (const row of rows) {
        const item = byId.get(Number(row.id));
        const validation = validateOutput(row, item?.HR_os);
        if (!item) {
          errors.push({ id: row.id, issues: ["missing_id"] });
          outputs.push({ row, HR_os: fallbackHr(row), source: "fallback_missing_id" });
          continue;
        }
        if (!validation.ok) {
          errors.push({ id: row.id, issues: validation.issues, value: validation.hr });
          outputs.push({ row, HR_os: fallbackHr(row), source: "fallback_validation" });
          continue;
        }
        outputs.push({ row, HR_os: validation.hr, source: "ollama" });
      }
      if (rows.length > 1 && outputs.some((item) => item.source !== "ollama")) {
        for (let i = 0; i < outputs.length; i += 1) {
          if (outputs[i].source === "ollama") continue;
          try {
            const single = await generateBatch([outputs[i].row]);
            outputs[i] = single.outputs[0] || outputs[i];
            errors.push(...single.errors.map((error) => ({ ...error, retry: "single" })));
          } catch (error) {
            errors.push({ id: outputs[i].row.id, issues: ["single_retry_error"], error: error.message });
          }
        }
      }
      return { outputs, errors, raw };
    } catch (error) {
      lastError = error;
      if (rows.length > 1 && attempt === MAX_RETRIES) break;
      await sleep(1000 * (attempt + 1));
    }
  }

  if (rows.length > 1) {
    const outputs = [];
    const errors = [];
    for (const row of rows) {
      try {
        const single = await generateBatch([row]);
        outputs.push(...single.outputs);
        errors.push(...single.errors);
      } catch (error) {
        outputs.push({ row, HR_os: fallbackHr(row), source: "fallback_error" });
        errors.push({ id: row.id, issues: ["ollama_error"], error: error.message });
      }
    }
    return { outputs, errors, raw: "" };
  }
  throw lastError || new Error("Ollama generation failed");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRows(pool) {
  const params = [];
  const where = [];
  if (RESUME_AFTER_ID > 0) {
    params.push(RESUME_AFTER_ID);
    where.push(`id > $${params.length}`);
  }
  const limitSql = LIMIT > 0 ? `LIMIT ${LIMIT}` : "";
  const offsetSql = START_OFFSET > 0 ? `OFFSET ${START_OFFSET}` : "";
  const { rows } = await pool.query(
    `
      SELECT ${SELECT_COLUMNS}
        FROM segments
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY id
       ${limitSql}
       ${offsetSql}
    `,
    params
  );
  return rows;
}

async function backupRows(rows, backupPath) {
  const stream = fs.createWriteStream(backupPath, { flags: "a", encoding: "utf8" });
  for (const row of rows) {
    stream.write(JSON.stringify({
      id: row.id,
      old_HR_os: row.HR_os || "",
      old_retrieval_text: row.retrieval_text || "",
    }) + "\n");
  }
  await new Promise((resolve, reject) => {
    stream.end(resolve);
    stream.on("error", reject);
  });
}

async function applyOutputs(pool, outputs) {
  for (let start = 0; start < outputs.length; start += APPLY_CHUNK_SIZE) {
    const chunk = outputs.slice(start, start + APPLY_CHUNK_SIZE);
    await pool.query("BEGIN");
    try {
      for (const item of chunk) {
        await pool.query(
          `
            UPDATE segments
               SET "HR_os" = $2,
                   retrieval_text = $3
             WHERE id = $1
          `,
          [item.row.id, item.HR_os, buildRetrievalText(item.row, item.HR_os)]
        );
      }
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }
}

function printUsageSummary() {
  console.log(JSON.stringify({
    mode: APPLY ? "apply" : BACKUP_ONLY ? "backup-only" : "dry-run",
    model: MODEL,
    limit: LIMIT || "all",
    batchSize: BATCH_SIZE,
    numPredict: NUM_PREDICT,
    resumeAfterId: RESUME_AFTER_ID,
    offset: START_OFFSET,
    ollamaUrl: OLLAMA_URL,
  }, null, 2));
}

async function main() {
  if (APPLY && LIMIT === 0 && !argv.includes("--all")) {
    throw new Error("Full apply requires --all. Use --apply --all after reviewing dry-run output.");
  }
  if (BATCH_SIZE < 1 || BATCH_SIZE > 30) {
    throw new Error("--batch-size must be between 1 and 30 for reliable local generation.");
  }

  printUsageSummary();
  const auditDir = ensureDir(path.join(process.cwd(), "data", "audit"));
  const backupDir = ensureDir(path.join(process.cwd(), "data", "backups"));
  const ts = timestamp();
  const previewPath = path.join(auditDir, `hr_os_ollama_preview_${ts}.json`);
  const auditPath = path.join(auditDir, `hr_os_ollama_audit_${ts}.jsonl`);
  const backupPath = path.join(backupDir, `segments_hr_os_ollama_${ts}.jsonl`);

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '30min'");
  const rows = await fetchRows(pool);
  console.log(`rows=${rows.length}`);

  if (!rows.length) return;
  await backupRows(rows, backupPath);
  console.log(`backup=${backupPath}`);

  if (BACKUP_ONLY) {
    console.log("Backup only. No generation or DB updates were performed.");
    return;
  }

  const allOutputs = [];
  const auditStream = fs.createWriteStream(auditPath, { flags: "a", encoding: "utf8" });
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    console.log(`batch ${Math.floor(start / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)} ids=${batch[0].id}-${batch[batch.length - 1].id}`);
    const result = await generateBatch(batch);
    for (const error of result.errors) {
      auditStream.write(JSON.stringify({ type: "validation", ...error }) + "\n");
    }
    for (const output of result.outputs) {
      allOutputs.push({
        id: output.row.id,
        retrieval_scope: output.row.retrieval_scope || "",
        title: output.row.advice_card_title || output.row.topic || "",
        old_HR_os: output.row.HR_os || "",
        new_HR_os: output.HR_os,
        source: output.source,
      });
    }
    if (APPLY) {
      await applyOutputs(pool, result.outputs);
    }
  }
  await new Promise((resolve, reject) => {
    auditStream.end(resolve);
    auditStream.on("error", reject);
  });

  fs.writeFileSync(previewPath, JSON.stringify(allOutputs, null, 2), "utf8");
  console.log(`preview=${previewPath}`);
  console.log(`audit=${auditPath}`);
  console.log(JSON.stringify({
    rows: allOutputs.length,
    bySource: allOutputs.reduce((acc, row) => {
      acc[row.source] = (acc[row.source] || 0) + 1;
      return acc;
    }, {}),
    applied: APPLY,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
