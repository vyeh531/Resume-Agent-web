"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const ROLE_LOCKS = [
  {
    name: "hardware",
    allowedPattern: /\b(hardware|electrical|circuit|chip|semiconductor|vlsi|analog|pcb|embedded|firmware|mechanical|manufacturing|quality|hardware_electrical|mechanical_engineering|manufacturing_process|industrial_quality|engineering_hardware)\b|硬件|硬體|电路|電路|芯片|晶片|嵌入式|硬件工程|硬體工程/i,
    perspectivePattern: /\b(hardware engineer|electrical engineer|circuit design|logic design|analog circuit|simulation circuit|pcb|fpga|rtl|verilog|vlsi|semiconductor|tape out|adc comparator|board-level|bring up)\b|硬件|硬體|硬件工程|硬體工程|模拟电路|類比電路|电路设计|電路設計|板级测试|板級測試|芯片|晶片|嵌入式|软硬件调试|軟硬體調試/i,
  },
  {
    name: "medical_device",
    allowedPattern: /\b(medical device|medical devices|medical equipment|biomedical|healthcare|clinical|pharma|biotech|hardware|electrical|mechanical|healthcare_life_sciences|engineering_hardware|hardware_electrical|mechanical_engineering)\b|医疗器械|醫療器械|医疗设备|醫療設備|医工|醫工|生医|生醫|硬件|硬體/i,
    perspectivePattern: /\b(medical device|medical devices|medical equipment|biomedical device)\b|医疗器械|醫療器械|医疗设备|醫療設備|医工|醫工|硬件或医疗器械|硬體或醫療器械/i,
  },
  {
    name: "clinical_healthcare",
    allowedPattern: /\b(healthcare|clinical|pharma|biotech|nurse|patient|medical|life_sciences|healthcare_life_sciences)\b|医疗|醫療|临床|臨床|病患|患者|药企|藥企|生物医药|生物醫藥/i,
    perspectivePattern: /\b(clinical trial|patient|medical chart|medical record|healthcare provider|pharma|biotech)\b|临床|臨床|病患|患者|病历|病歷|医疗记录|醫療紀錄|药企|藥企|生物医药|生物醫藥/i,
  },
];

function compact(value, max = 180) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function perspectiveText(row) {
  return [
    row.I_insight,
    row.HR_os,
    row.humanized_mentor_insight,
    row.humanized_hr_perspective,
    row.humanized_mentor_insight_raw,
    row.humanized_hr_perspective_raw,
    row.humanized_mentor_insight_generalized,
    row.humanized_hr_perspective_generalized,
  ].filter(Boolean).join(" ");
}

function roleMetadataText(row) {
  return [
    row.role_family,
    row.target_roles,
    row.activation_role_family,
    row.activation_keywords,
    row.problem_tags,
    row.canonical_action_family,
    row.topic,
    row.advice_card_title,
    row.retrieval_text,
  ].filter(Boolean).join(" ");
}

(async () => {
  const pool = db.getPool();
  const { rows } = await pool.query(`
    SELECT id, chunk_id, topic, advice_card_title, canonical_action_family,
           problem_tags, role_family, target_roles, activation_role_family,
           activation_keywords, retrieval_text, "I_insight", "HR_os",
           to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
           to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
           to_jsonb(segments)->>'humanized_mentor_insight_raw' AS humanized_mentor_insight_raw,
           to_jsonb(segments)->>'humanized_hr_perspective_raw' AS humanized_hr_perspective_raw,
           to_jsonb(segments)->>'humanized_mentor_insight_generalized' AS humanized_mentor_insight_generalized,
           to_jsonb(segments)->>'humanized_hr_perspective_generalized' AS humanized_hr_perspective_generalized,
           to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status
      FROM segments
     WHERE retrieval_scope = 'resume_edit'
       AND COALESCE(action_review_status, '') != 'exclude'
  `);

  console.log(`Audited resume_edit segments for role-locked perspectives: ${rows.length}`);

  for (const lock of ROLE_LOCKS) {
    const hits = [];
    const review = [];
    for (const row of rows) {
      const perspective = perspectiveText(row);
      if (!lock.perspectivePattern.test(perspective)) continue;
      hits.push(row);
      if (!lock.allowedPattern.test(roleMetadataText(row))) review.push(row);
    }

    console.log(`\n## ${lock.name}`);
    console.log(`- perspective hits: ${hits.length}`);
    console.log(`- missing explicit matching role metadata: ${review.length}`);
    for (const row of review.slice(0, 12)) {
      console.log(`  - id=${row.id} family=${row.canonical_action_family || ""} status=${row.perspective_review_status || ""}`);
      console.log(`    meta=${compact(roleMetadataText(row), 140)}`);
      console.log(`    perspective=${compact(perspectiveText(row), 220)}`);
    }
  }
})();
