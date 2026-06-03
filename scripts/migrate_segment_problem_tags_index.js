"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const SOURCE = "manual_issue_tag_stability_2026_06_03";

const MANUAL_SEGMENTS = [
  {
    tag: "all_china_experience",
    dims: "E_market_fit,F_role_fit,C_content_quality",
    topic: "US market resume positioning",
    l1: "Resume ATS issue",
    l2: "All experience is China-based",
    title: "强化美国市场可信经历",
    problem: "简历经历几乎全部发生在中国，申请美国岗位时容易让招聘方觉得市场相关性、可信度和能力支撑不够强。",
    action: "优先补强美国或北美语境下可验证的经历证据：把美国课程项目、校内项目、research、volunteer、freelance、open-source 或跨国协作经历前置；中国经历保留最相关部分，但 bullet 要写清英文交付物、技术栈、业务对象、量化结果和可迁移到美国岗位的能力。",
    insight: "问题不是中国经历不能用，而是全篇都依赖中国经历时，美国招聘者缺少本地市场和可信证据锚点。简历需要主动把经历翻译成美国 JD 能理解的能力证明。",
    keywords: "all china experience,china based experience,us market,north america,market fit,experience credibility,transferable evidence",
  },
  {
    tag: "career_growth_optimization",
    dims: "F_role_fit,C_content_quality",
    topic: "Career growth resume narrative",
    l1: "Resume ATS issue",
    l2: "Career growth story can be stronger",
    title: "补强成长轨迹",
    problem: "简历基础质量已经不错，但还可以更清楚地呈现职责扩大、项目复杂度提升、影响范围增加或从执行到 ownership 的成长轨迹。",
    action: "检查 Experience 中每段经历的 bullet 顺序和措辞，把能体现成长的证据写出来：scope increase、promotion、从 supporting 到 owning、负责更大数据量/用户量/预算/团队协作范围，或从单点任务扩展到端到端交付。不要挤掉高风险 ATS 问题，只在主要问题处理后作为增强项。",
    insight: "高分简历的优化重点不是再补基础信息，而是让招聘者看到候选人的成长速度、ownership 和可承担更大职责的趋势。",
    keywords: "career growth,scope increase,promotion,ownership,trajectory,impact growth,resume narrative",
  },
];

function splitTags(value) {
  if (!value) return [];
  return [...new Set(String(value)
    .replace(/[{}"]/g, "")
    .split(/[,;|，、\n]+/)
    .map((item) => item.trim().toLowerCase().replace(/[\s-]+/g, "_").replace(/[^\p{L}\p{N}_]+/gu, ""))
    .filter(Boolean))];
}

function manualChunkId(tag) {
  return `${SOURCE}:${tag}`;
}

function compactText(value, length = 260) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

function toManualRow(segment) {
  const retrievalText = [
    segment.topic,
    segment.l1,
    segment.l2,
    segment.problem,
    segment.action,
    segment.insight,
    segment.keywords,
  ].filter(Boolean).join("\n");

  return {
    chunk_id: manualChunkId(segment.tag),
    session_id: SOURCE,
    topic: segment.topic,
    L1: segment.l1,
    L2: segment.l2,
    P_mentor: segment.problem,
    A_action: segment.action,
    I_insight: segment.insight,
    H_hook: "",
    E_example: "",
    HR_os: "",
    advice_type: "resume_edit",
    generality: "universal",
    confidence: "high",
    background_fit: 1,
    industry_fit: 1,
    mentor_name: "MentorX ATS Review",
    target_role: "universal",
    target_industry: "universal",
    classification_source: SOURCE,
    target_role_family: "universal",
    role_family: "universal",
    target_roles: "universal",
    seniority: "all",
    ats_dimensions: segment.dims,
    problem_tags: segment.tag,
    keywords: segment.keywords,
    topic_slug: segment.tag,
    retrieval_text: retrievalText,
    priority: segment.tag === "career_growth_optimization" ? 30 : 95,
    unlock_tier: "free",
    advice_card_title: segment.title,
    user_problem_summary: segment.problem,
    action_summary: segment.action,
    safe_to_show_free: 1,
    requires_ai_rewrite: 0,
    mentor_quality_score: 0.92,
    feedback_score: 0.8,
    mentor_title: "ATS Resume Reviewer",
    mentor_career_keywords: "ATS,resume editing,recruiter screening",
    mentor_career_path_display: "ATS Resume Review",
    mentor_company: "MentorX",
    retrieval_scope: "resume_edit",
  };
}

function compactManual(row) {
  return {
    id: row.id || null,
    chunk_id: row.chunk_id,
    problem_tags: row.problem_tags,
    classification_source: row.classification_source,
    title: row.advice_card_title,
    action: compactText(row.action_summary, 420),
  };
}

async function tableExists(pool, tableName) {
  const { rows } = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
          FROM information_schema.tables
         WHERE table_schema = current_schema()
           AND table_name = $1
      ) AS exists
    `,
    [tableName]
  );
  return Boolean(rows[0]?.exists);
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const hasJoinTable = await tableExists(pool, "segment_problem_tags");
  const { rows: segmentRows } = await pool.query(`
    SELECT id, problem_tags, classification_source
      FROM segments
     ORDER BY id
  `);

  const normalizedRows = [];
  const links = [];
  for (const row of segmentRows) {
    const tags = splitTags(row.problem_tags);
    const normalized = tags.join(",");
    if ((row.problem_tags || "") !== normalized) {
      normalizedRows.push({
        id: row.id,
        old_problem_tags: row.problem_tags || "",
        new_problem_tags: normalized,
      });
    }
    for (const tag of tags) {
      links.push({ segment_id: row.id, problem_tag: tag, classification_source: row.classification_source || null });
    }
  }

  const manualRows = MANUAL_SEGMENTS.map(toManualRow);
  const manualChunkIds = manualRows.map((row) => row.chunk_id);
  const { rows: existingManualRows } = await pool.query(
    `
      SELECT id, chunk_id, problem_tags, classification_source
        FROM segments
       WHERE chunk_id = ANY($1::text[])
       ORDER BY chunk_id
    `,
    [manualChunkIds]
  );
  const existingManualChunkIds = new Set(existingManualRows.map((row) => row.chunk_id));
  const inserts = manualRows.filter((row) => !existingManualChunkIds.has(row.chunk_id));
  for (const row of inserts) {
    links.push({ segment_id: null, problem_tag: row.problem_tags, classification_source: row.classification_source });
  }

  console.log(JSON.stringify({
    apply: APPLY,
    joinTableExists: hasJoinTable,
    segments: segmentRows.length,
    normalizedRowsToUpdate: normalizedRows.length,
    currentJoinLinksFromSegments: links.filter((row) => row.segment_id != null).length,
    manualConfigured: manualRows.length,
    manualAlreadyPresent: existingManualRows.length,
    manualToInsert: inserts.length,
    sampleNormalize: normalizedRows.slice(0, 8),
    manualInserts: inserts.map(compactManual),
  }, null, 2));

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segment_problem_tags_migration_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({
    source: SOURCE,
    normalizedRows,
    manualInserts: inserts.map(compactManual),
    existingManualRows,
  }, null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS segment_problem_tags (
        segment_id integer NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
        problem_tag text NOT NULL,
        classification_source text,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (segment_id, problem_tag)
      )
    `);
    await pool.query("CREATE INDEX IF NOT EXISTS idx_segment_problem_tags_problem_tag ON segment_problem_tags (problem_tag)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_segment_problem_tags_segment_id ON segment_problem_tags (segment_id)");

    if (normalizedRows.length) {
      await pool.query(`
        CREATE TEMP TABLE segment_problem_tag_normalize_updates (
          id integer PRIMARY KEY,
          problem_tags text
        ) ON COMMIT DROP
      `);
      for (const row of normalizedRows) {
        await pool.query(
          "INSERT INTO segment_problem_tag_normalize_updates (id, problem_tags) VALUES ($1, $2)",
          [row.id, row.new_problem_tags]
        );
      }
      await pool.query(`
        UPDATE segments AS target
           SET problem_tags = updates.problem_tags
          FROM segment_problem_tag_normalize_updates AS updates
         WHERE target.id = updates.id
      `);
    }

    if (inserts.length) {
      await pool.query("LOCK TABLE segments IN EXCLUSIVE MODE");
      const { rows: maxRows } = await pool.query("SELECT COALESCE(MAX(id), 0) AS max_id FROM segments");
      const nextId = Number(maxRows[0].max_id) + 1;
      const insertsWithIds = inserts.map((row, index) => ({ id: nextId + index, ...row }));
      const columns = Object.keys(insertsWithIds[0]);
      for (const row of insertsWithIds) {
        const params = columns.map((column) => row[column]);
        const placeholders = params.map((_, index) => `$${index + 1}`).join(", ");
        await pool.query(
          `INSERT INTO segments (${columns.map((column) => `"${column}"`).join(", ")}) VALUES (${placeholders})`,
          params
        );
      }
    }

    await pool.query("DELETE FROM segment_problem_tags");
    await pool.query(`
      INSERT INTO segment_problem_tags (segment_id, problem_tag, classification_source)
      SELECT s.id,
             tag.problem_tag,
             s.classification_source
        FROM segments AS s
        CROSS JOIN LATERAL unnest(
          regexp_split_to_array(regexp_replace(COALESCE(s.problem_tags, ''), '["{}[:space:]]', '', 'g'), ',')
        ) AS tag(problem_tag)
       WHERE tag.problem_tag <> ''
      ON CONFLICT (segment_id, problem_tag) DO UPDATE
            SET classification_source = EXCLUDED.classification_source
    `);

    await pool.query("COMMIT");
    console.log(`Applied normalize=${normalizedRows.length} manualInserts=${inserts.length}`);
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
