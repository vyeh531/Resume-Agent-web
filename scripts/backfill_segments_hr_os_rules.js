"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const BACKUP_ONLY = argv.includes("--backup-only");
const ALL = argv.includes("--all");
const LIMIT = numberArg("--limit", APPLY ? 0 : 100);
const RESUME_AFTER_ID = numberArg("--resume-after-id", 0);
const START_OFFSET = numberArg("--offset", 0);
const APPLY_CHUNK_SIZE = numberArg("--apply-chunk-size", 500);

const SELECT_COLUMNS = `
  id, chunk_id, retrieval_scope, topic, "L1", "L2", advice_type,
  problem_tags, ats_dimensions, role_family, target_roles, seniority,
  advice_card_title, user_problem_summary, action_summary,
  "P_mentor", "A_action", "I_insight", "H_hook", "E_example", "HR_os",
  retrieval_text
`;

function numberArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  if (!raw) return fallback;
  const value = Number(raw.slice(name.length + 1));
  return Number.isFinite(value) ? value : fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function compact(value, max = 900) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function has(pattern, value) {
  return pattern.test(String(value || ""));
}

function includesAny(value, patterns) {
  const text = String(value || "");
  return patterns.some((pattern) => pattern.test(text));
}

function pick(id, templates) {
  return templates[Math.abs(Number(id) || 0) % templates.length];
}

function textOf(row) {
  return [
    row.retrieval_scope,
    row.topic,
    row.L1,
    row.L2,
    row.advice_type,
    row.problem_tags,
    row.ats_dimensions,
    row.role_family,
    row.target_roles,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.P_mentor,
    row.A_action,
    row.I_insight,
  ].filter(Boolean).join(" ").toLowerCase();
}

function scopeOf(row) {
  return String(row.retrieval_scope || "").toLowerCase();
}

function classify(row) {
  const scope = scopeOf(row);
  const text = textOf(row);

  if (scope === "resume_edit") return classifyResume(row);

  if (includesAny(text, [/sponsorship|work authorization|h-?1b|opt|cpt|visa|绿卡|身份|担保|工签/i])) return "work_authorization";

  if (scope === "job_search" || includesAny(text, [/投递|内推|referral|networking|linkedin|handshake|indeed|官网|recruiter|follow up|校友|career fair|海投/i])) {
    if (includesAny(text, [/linkedin|recruiter|校友|内推|referral|networking|follow up|消息/i])) return "job_search_network";
    if (includesAny(text, [/海投|投递量|官网|平台|handshake|indeed|glassdoor|窗口|秋招|春招/i])) return "job_search_channel";
    return "job_search_general";
  }

  if (scope === "interview" || includesAny(text, [/面试|interview|mock|leetcode|刷题|case interview|technical|behavioral|追问|自我介绍/i])) {
    if (includesAny(text, [/项目|project|经历|experience|简历深挖|resume deep dive|基础知识|domain knowledge/i])) return "interview_depth";
    if (includesAny(text, [/behavior|bq|conflict|leadership|沟通|表达|presentation|story/i])) return "interview_story";
    return "interview_general";
  }

  if (scope === "career_strategy" || includesAny(text, [/职业规划|方向|定位|市场|转行|路线|gap|背景差距|保底|长期|offer|上岸|岗位选择/i])) {
    if (includesAny(text, [/方向|定位|转行|目标岗位|role|focus|路线/i])) return "career_positioning";
    if (includesAny(text, [/市场|竞争|机会|上岸|offer|大厂|小公司|公司规模/i])) return "career_market";
    return "career_general";
  }

  if (scope === "school_application" || includesAny(text, [/申请|学校|phd|master|文书|推荐信|gre|admission/i])) {
    return "school_application";
  }

  if (includesAny(text, [/linkedin|github|portfolio|作品集|个人网站|链接|contact|联系方式|邮箱|电话/i])) return "profile_links";
  if (includesAny(text, [/format|pdf|word|layout|section|date|chronological|readability|格式|排版|日期|版面|一页|字体|行距|对齐/i])) return "format_structure";
  if (includesAny(text, [/summary|headline|目标岗位原词|exact_job_title|target_role|role_alignment|定位|标题|岗位名称/i])) return "summary_positioning";
  if (includesAny(text, [/keyword|jd|ats|skills|hard_skill|技能|关键词|技术栈|工具|术语|原词/i])) {
    if (includesAny(text, [/skills only|keywords_only|只.*skills|只.*技能|经历.*证据|experience.*evidence/i])) return "keyword_in_experience";
    return "keyword_match";
  }
  if (includesAny(text, [/experience|project|bullet|evidence|经历|项目|职责|实习|工作内容|案例/i])) return "experience_evidence";
  if (includesAny(text, [/measurable|result|impact|metric|数字|量化|成果|结果|提升|降低|规模|频率/i])) return "impact_metrics";
  if (includesAny(text, [/education|coursework|gpa|课程|教育|学校|证书|training|lab/i])) return "education_signal";
  if (includesAny(text, [/short_tenure|短期|三个月|离职|稳定性|时间线/i])) return "short_tenure";
  return "general_resume";
}

function classifyResume(row) {
  const text = textOf(row);
  const title = String(row.advice_card_title || row.user_problem_summary || row.topic || "").toLowerCase();
  const primary = [
    row.topic,
    row.L1,
    row.L2,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.P_mentor,
    row.A_action,
  ].filter(Boolean).join(" ").toLowerCase();
  const tags = String(row.problem_tags || "").toLowerCase();

  if (includesAny(primary, [/sponsorship|work authorization|h-?1b|opt|cpt|visa|绿卡|身份|担保|工签/i])) return "work_authorization";
  if (includesAny(title, [/linkedin|github|portfolio|作品集|个人网站|联系方式|邮箱|电话/i])) return "profile_links";
  if (includesAny(title, [/format|pdf|word|layout|section|date|chronological|readability|格式|排版|日期|版面|一页|字体|字号|行距|对齐|页边距|空格/i])) return "format_structure";
  if (includesAny(title, [/education|coursework|gpa|课程|教育|学校|证书|training|lab/i])) return "education_signal";
  if (includesAny(title, [/short_tenure|短期|三个月|离职|稳定性|时间线|gap|空白期/i])) return "short_tenure";
  if (includesAny(title, [/summary|headline|目标岗位原词|定位|岗位名称|投所有岗位|通用简历|一份简历投|目标方向/i])) return "summary_positioning";
  if (includesAny(title, [/keyword|jd|ats|skills|hard skill|技能|关键词|技术栈|工具|术语|原词|框架|模型|library|framework|bloomberg|pitchbook/i])) return "keyword_match";
  if (includesAny(title, [/measurable|result|impact|metric|数字|量化|成果|结果|提升|降低|规模|频率|百分比/i])) return "impact_metrics";
  if (includesAny(title, [/experience|project|bullet|evidence|经历|项目|职责|实习|工作内容|案例|数据分析岗位的经历/i])) return "experience_evidence";

  if (includesAny(primary, [/linkedin|github|portfolio|作品集|个人网站|联系方式|邮箱|电话/i])) return "profile_links";
  if (includesAny(primary, [/format|pdf|word|layout|section|date|chronological|readability|格式|排版|日期|版面|一页|字体|行距|对齐|字号|页边距|空格/i])) return "format_structure";
  if (includesAny(primary, [/education|coursework|gpa|课程|教育|学校|证书|training|lab/i])) return "education_signal";
  if (includesAny(primary, [/short_tenure|短期|三个月|离职|稳定性|时间线|gap|空白期/i])) return "short_tenure";
  if (includesAny(primary, [/summary|headline|目标岗位原词|exact job title|定位|岗位名称|投所有岗位|通用简历|一份简历投|目标方向/i])) return "summary_positioning";
  if (includesAny(primary, [/skills only|只.*skills|只.*技能|经历.*证据|experience.*evidence/i])) return "keyword_in_experience";
  if (includesAny(primary, [/keyword|jd|ats|skills|hard skill|技能|关键词|技术栈|工具|术语|原词|框架|模型|library|framework/i])) return "keyword_match";
  if (includesAny(primary, [/measurable|result|impact|metric|数字|量化|成果|结果|提升|降低|规模|频率|百分比/i])) return "impact_metrics";
  if (includesAny(primary, [/experience|project|bullet|evidence|经历|项目|职责|实习|工作内容|案例/i])) return "experience_evidence";
  if (includesAny(primary, [/职业规划|方向|转行|路线|保底|长期|岗位选择/i])) return "career_positioning";

  if (includesAny(tags, [/linkedin|github|portfolio|contact/])) return "profile_links";
  if (includesAny(tags, [/format|pdf|file|layout|readability|section_order/])) return "format_structure";
  if (includesAny(tags, [/education|coursework|gpa/])) return "education_signal";
  if (includesAny(tags, [/short_tenure/])) return "short_tenure";
  if (includesAny(tags, [/exact_job_title|target_role|role_alignment|generic_resume_positioning|resume_not_tailored|low_role_specificity|weak_target_role_alignment/])) return "summary_positioning";
  if (includesAny(tags, [/skills_only|keywords_only|experience_keyword_evidence/])) return "keyword_in_experience";
  if (includesAny(tags, [/keyword|hard_skill|jd_match/])) return "keyword_match";
  if (includesAny(tags, [/measurable|result|impact|action_verbs/])) return "impact_metrics";
  if (includesAny(tags, [/experience|evidence|project|vague_project/])) return "experience_evidence";
  if (includesAny(text, [/linkedin|github|portfolio|作品集|个人网站|联系方式|邮箱|电话/i])) return "profile_links";
  if (includesAny(text, [/format|pdf|word|layout|section|date|chronological|readability|格式|排版|日期|版面|一页|字体|行距|对齐/i])) return "format_structure";
  return "general_resume";
}

const TEMPLATES = {
  summary_positioning: [
    "我第一眼会先看你到底投什么岗；定位不明确，再好的经历也容易被放到旁边。",
    "如果开头没有把目标岗位讲清楚，我会先怀疑这是通用版，继续读下去的动力会变弱。",
    "Summary 像简历的入口；入口不聚焦时，HR 很难马上判断你该被推给哪个团队。",
  ],
  keyword_match: [
    "HR 初筛其实很看 JD 原词；核心技能没出现，我很难放心把你推进下一轮。",
    "如果关键技能词扫不到，我会先担心你和岗位要求差一截，而不是主动替你补充想象。",
    "关键词不是堆给机器看的，它也帮我快速确认你是不是这类岗位的直接人选。",
  ],
  keyword_in_experience: [
    "只把技能列在 Skills 还不够，我会想看你在哪段经历里真的用过它。",
    "技能如果没有经历支撑，会像停在纸面上；我会更相信写进项目和成果里的能力。",
    "我会顺着关键词去找证据，如果 Experience 里找不到，可信度会明显打折。",
  ],
  experience_evidence: [
    "经历如果只写做了什么，我很难判断你做得多深、成果多大、是否值得面试。",
    "我扫经历时会找任务、方法和结果；只看到职责描述，会觉得信息还不够扎实。",
    "一段经历要让我看出你承担了什么价值，否则很容易被当成普通参与者。",
  ],
  impact_metrics: [
    "没有数字时，贡献会显得比较模糊；HR 也更难替你向用人部门推荐。",
    "量化结果能帮我快速判断工作强度和影响范围，没有结果的 bullet 说服力会弱很多。",
    "我不一定懂所有技术细节，但数字和结果能让我更快判断这段经历有没有分量。",
  ],
  format_structure: [
    "日期和版面不稳，我会先担心细节感；ATS 解析错，也会影响人工判断。",
    "格式不是小事，版面一乱，我会更难快速抓到经历顺序和最相关的内容。",
    "简历结构清楚时，HR 才能把注意力放在能力上；排版混乱会先消耗耐心。",
  ],
  profile_links: [
    "缺少可验证链接时，我会少一个快速确认背景和作品可信度的入口。",
    "LinkedIn、GitHub 或作品集能降低验证成本；没有入口时，很多亮点就只能停在描述里。",
    "如果岗位需要作品或代码证据，我会很自然地去找链接；找不到会影响继续评估。",
  ],
  education_signal: [
    "经验还不长时，我会看课程、证书和训练能不能补足岗位信号；相关内容别藏太深。",
    "教育背景不是只写学校名称，相关课程和训练能帮我判断你是否有基础准备。",
    "对 junior 候选人来说，课程和项目证据很重要；写清楚会更容易被理解为可培养。",
  ],
  short_tenure: [
    "短期经历如果不解释，我会先想到稳定性风险；说明性质后，判断会公平很多。",
    "时间线有疑问时，HR 很容易多想；把实习、项目周期或离职背景讲清楚更稳。",
    "短经历不是不能写，但需要让我知道它为什么短，以及你实际交付了什么。",
  ],
  general_resume: [
    "我会看这段内容能不能帮我快速判断匹配度；表达越具体，越容易被继续推进。",
    "HR 不会替候选人拼太多隐含信息；你把重点说清楚，才更容易被准确归类。",
    "这类信息写得越具体，我越容易判断你和岗位之间的连接，而不是停在泛泛印象。",
  ],
  job_search_network: [
    "从招聘流程看，被看到往往比投出去更关键；主动触达能让简历多一次被认真看的机会。",
    "如果只是平台投递，我不一定会马上看到；有针对性的跟进会提高被推进的概率。",
    "内推和招聘人触达不是走捷径，而是让合适的人更快看到你，尤其岗位竞争激烈时。",
  ],
  job_search_channel: [
    "我会更相信有策略的投递节奏；只靠单一平台，很容易错过真正有人看的入口。",
    "官网、平台和直接联系要配合使用；否则简历可能投出去了，却没有进入有效筛选池。",
    "投递不是数量越多越好，我会更看重你是否把机会投到对的渠道和时间点。",
  ],
  job_search_general: [
    "求职推进看的是持续触达和反馈闭环；只投不跟，很容易让机会停在系统里。",
    "从招聘端看，主动性本身就是信号；会跟进的人，通常也更容易被记住。",
    "我会更看重候选人是否有清楚的投递策略，而不是被动等平台给结果。",
  ],
  interview_depth: [
    "面试时我会顺着经历继续追问；如果准备不扎实，很容易让人觉得经验停在表面。",
    "简历写出来只是第一步，面试能讲清楚细节，才会让我相信这段经历是真的有深度。",
    "用人经理会追问方法、取舍和结果；答不上来时，简历上的亮点反而会变成风险。",
  ],
  interview_story: [
    "面试表达要让我听到清楚的情境、动作和结果；只讲态度，很难形成可信判断。",
    "行为面不是背答案，我会看你能不能把真实经历讲成有逻辑、有反思的故事。",
    "如果回答太散，我会难以判断沟通能力；结构清楚会让你的经历更容易被记住。",
  ],
  interview_general: [
    "面试准备不足时，候选人常常不是不会做，而是讲不清；这会直接影响录用信心。",
    "我会看你能不能把经历、能力和岗位要求连起来讲；连接不上，就很难继续推进。",
    "面试里表达的稳定度很重要，准备越具体，越能降低用人团队的不确定感。",
  ],
  career_positioning: [
    "我会更看重候选人定位是否清楚；方向越聚焦，越容易判断适合哪些岗位。",
    "如果方向摇摆太大，招聘方会担心你只是随便试试，而不是认真投入这个领域。",
    "职业定位清楚时，简历和面试都会更有主线；主线弱，就容易被看成不够匹配。",
  ],
  career_market: [
    "从招聘市场看，机会选择也很重要；只盯单一路径，会让本来可行的机会变少。",
    "我会看候选人是否理解市场现实；策略越灵活，越容易找到能先进入行业的入口。",
    "求职不是只比背景，也比机会判断；路线选得太窄，会影响整体上岸效率。",
  ],
  career_general: [
    "职业规划要能解释你为什么适合这条路；讲得清楚，招聘方才更容易相信你的选择。",
    "我会看你的准备是否和目标方向一致；行动和目标脱节时，匹配度就会被打问号。",
    "长期方向不需要完美，但要有逻辑；逻辑清楚，招聘方会更愿意给机会。",
  ],
  school_application: [
    "评审材料和求职材料一样，都需要可信主线；目标不清楚时，优势会显得分散。",
    "我会看背景、目标和材料是否互相支撑；如果连接弱，整体说服力会下降。",
    "申请或深造准备要讲清楚动机和证据；只列经历，很难让人相信方向是成熟的。",
  ],
  work_authorization: [
    "涉及 sponsorship 时，我会很快确认公司能不能支持；这会影响推进节奏，但不代表能力不足。",
    "身份信息如果处理得不清楚，招聘流程会多一层不确定；提前讲明白会让判断更顺。",
    "我会把身份要求和岗位可支持程度一起看；表达清楚，能减少后续沟通里的反复确认。",
  ],
};

function generateHrOs(row) {
  const category = classify(row);
  return {
    category,
    HR_os: pick(row.id, TEMPLATES[category] || TEMPLATES.general_resume),
  };
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
    .map(([label, value]) => `${label}: ${compact(value)}`)
    .join("\n");
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
      await pool.query("CREATE TEMP TABLE IF NOT EXISTS segment_hr_os_rule_updates (id integer PRIMARY KEY, hr_os text NOT NULL, retrieval_text text NOT NULL) ON COMMIT DROP");
      await pool.query("TRUNCATE segment_hr_os_rule_updates");
      const params = [];
      const values = chunk.map((item, index) => {
        params.push(item.id, item.new_HR_os, item.new_retrieval_text);
        const offset = index * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      });
      await pool.query(
        `INSERT INTO segment_hr_os_rule_updates (id, hr_os, retrieval_text) VALUES ${values.join(",")}`,
        params
      );
      await pool.query(`
        UPDATE segments AS target
           SET "HR_os" = updates.hr_os,
               retrieval_text = updates.retrieval_text
          FROM segment_hr_os_rule_updates AS updates
         WHERE target.id = updates.id
      `);
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }
}

function summarize(outputs) {
  return outputs.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  if (APPLY && LIMIT === 0 && !ALL) {
    throw new Error("Full apply requires --all. Use --apply --all after reviewing dry-run output.");
  }

  console.log(JSON.stringify({
    mode: APPLY ? "apply" : BACKUP_ONLY ? "backup-only" : "dry-run",
    limit: LIMIT || "all",
    resumeAfterId: RESUME_AFTER_ID,
    offset: START_OFFSET,
    applyChunkSize: APPLY_CHUNK_SIZE,
  }, null, 2));

  const auditDir = ensureDir(path.join(process.cwd(), "data", "audit"));
  const backupDir = ensureDir(path.join(process.cwd(), "data", "backups"));
  const ts = timestamp();
  const previewPath = path.join(auditDir, `hr_os_rules_preview_${ts}.json`);
  const backupPath = path.join(backupDir, `segments_hr_os_rules_${ts}.jsonl`);

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '30min'");
  const rows = await fetchRows(pool);
  console.log(`rows=${rows.length}`);

  if (!rows.length) return;
  await backupRows(rows, backupPath);
  console.log(`backup=${backupPath}`);

  if (BACKUP_ONLY) {
    console.log("Backup only. No DB updates were performed.");
    return;
  }

  const outputs = rows.map((row) => {
    const generated = generateHrOs(row);
    return {
      id: row.id,
      retrieval_scope: row.retrieval_scope || "",
      category: generated.category,
      title: row.advice_card_title || row.user_problem_summary || row.topic || "",
      old_HR_os: row.HR_os || "",
      new_HR_os: generated.HR_os,
      new_retrieval_text: buildRetrievalText(row, generated.HR_os),
    };
  });

  fs.writeFileSync(previewPath, JSON.stringify(outputs.map((item) => ({
    id: item.id,
    retrieval_scope: item.retrieval_scope,
    category: item.category,
    title: item.title,
    old_HR_os: item.old_HR_os,
    new_HR_os: item.new_HR_os,
  })), null, 2), "utf8");
  console.log(`preview=${previewPath}`);
  console.log(JSON.stringify({ rows: outputs.length, byCategory: summarize(outputs), applied: APPLY }, null, 2));

  if (APPLY) {
    await applyOutputs(pool, outputs);
    console.log(`applied=${outputs.length}`);
  } else {
    console.log("Dry run only. Re-run with --apply after reviewing preview.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
