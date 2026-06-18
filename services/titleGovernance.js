"use strict";

const CASE_SPECIFIC_TITLE_TERMS = [
  /\bAlpha Research\b/i,
  /\bVADER\b/i,
  /\bMACD\b/i,
  /\bRisk Consulting\b/i,
  /\btrading book\b/i,
  /\blimits monitoring\b/i,
  /\bFinancial Advisor\b/i,
  /\bQuantitative Risk\b/i,
  /\bRCSA\b/i,
  /\bFA\b/,
  /Green Card/i,
  /H-?1B/i,
  /\bOPT\b/i,
  /\bCPT\b/i,
];

const GENERIC_TITLE = "明确简历修改重点";
const BAD_VISIBLE_TITLE_RE = /简历优化建议\s*\d+|当前报告可用的导师建议不足|优化简历与目标岗位的匹配度/i;

function splitCsv(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split(/[,;|，、\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function textOf(row = {}) {
  return [
    row.canonical_title,
    row.title,
    row.advice_card_title,
    row.user_problem_summary,
    row.P_mentor,
    row.A_action,
    row.action_summary,
    row.problem_tags,
    row.L2,
    row.topic,
  ].filter(Boolean).join(" ");
}

function primaryActionTextOf(row = {}) {
  return [
    row.A_action,
    row.action_summary,
    row.rawActionSummary,
    row.action,
    row.actionSummary,
    row.generalized_action,
    row.generalizedAction,
  ].find((value) => String(value || "").trim()) || "";
}

function actionTextOf(row = {}) {
  return [
    primaryActionTextOf(row),
    row.mentorLens,
    row.mentorInsight,
    row.reason,
    row.P_mentor,
    row.I_insight,
  ].filter(Boolean).join(" ");
}

function actionCentricTitle(row = {}) {
  const actionText = actionTextOf(row).toLowerCase();
  const fullText = textOf(row).toLowerCase();
  const tags = splitCsv(row.problem_tags || row.relatedProblemTags).join(" ").toLowerCase();
  const family = String(row.canonical_action_family || row.canonicalActionFamily || "").toLowerCase();
  const targetSection = String(row.targetSection || row.target_section || "").toLowerCase();
  const text = `${actionText} ${tags} ${family} ${targetSection}`;

  if (/linkedin/i.test(text)) return "补上 LinkedIn 链接";
  if (/github|gitlab|repo|repository|代码|代碼/.test(text)) return "补上项目代码入口";
  if (/portfolio|作品集|personal website|project link/.test(text)) return "补上作品集入口";
  if (/pdf|docx?|\bword\b|格式|版面|排版|字体|字體|spacing|行距|文件名|檔名/.test(text)) return "把提交格式整理稳";
  if (/日期|date|timeline|时间线|時間線/.test(text)) return "把经历时间线补齐";
  if (/missing_summary/.test(text) || /(?:新增|补上|補上|add|create).{0,24}summary|summary.{0,24}(?:缺少|沒有|没有|missing)/i.test(text)) return "补上 Summary 段落";
  if (/first person|第一人称|第一人稱/.test(text) && /summary/i.test(text)) return "把 Summary 语气改专业";
  if (/keyword|关键词|關鍵詞|jd|ats/.test(text) && /summary/.test(text) && /skills?/.test(text) && /experience|经历|經歷/.test(text) && /分配|放到|放进|放進|写进|寫進|补进|補進/.test(text)) return "把 JD 关键词放到对的位置";
  if (/summary|objective|简介|簡介|开头|開頭/.test(text) && /岗位原词|崗位原詞|目标岗位|目標崗位|exact.*title|job title|target role|定位|role alignment/.test(`${text} ${fullText}`)) return "让 Summary 对准目标岗位";
  if (/skills?|技能|技术栈|技術棧|工具/.test(text) && /排序|顺序|順序|靠前|前面|重排|reorder|分类|分類/.test(text)) return "把 Skills 排得更像这个岗位";
  if (/skills?|技能|hard skill|工具/.test(text) && /补|補|加入|写进|寫進|放进|放進|缺失|missing|priority keyword|关键词|關鍵詞/.test(text)) return "补上 JD 里缺的技能词";
  if (/keyword|关键词|關鍵詞|jd|ats/.test(text) && /bullet|experience|经历|經歷|项目|項目|证据|證據|使用场景|使用場景/.test(text)) return "把关键词写进真实经历";
  if (/keyword|关键词|關鍵詞|jd|ats/.test(text)) return "补上 JD 里的关键证据";
  if (/summary|objective|简介|簡介|开头|開頭/.test(text)) return "优化简历开头定位";
  if (/short_tenure_unclear|short tenure|internship|intern\b|实习|實習|短期|时长|時長|项目周期|項目週期|稳定性|穩定性|title\s*中明确标注|title\s*中明確標注/.test(text)) return "把短期经历说清楚";
  if (/action verb|动词|動詞|主动|主動|led|built|created|managed|delivered/.test(text)) return "换成更有力的动作动词";
  if (/bullet|experience|经历|經歷|项目|項目|project/.test(text) && /任务|任務|方法|工具|结果|結果|动作|動作|rewrite|改写|改成|重写|重寫/.test(text)) return "把经历改成动作和结果";
  if (/量化|数字|數字|metric|measurable|impact|成果|结果|結果|规模|規模|效率|转化|轉化|%/.test(text)) return "把成果写得更可衡量";
  if (/bullet|experience|经历|經歷|项目|項目|project/.test(text)) return "把经历证据写清楚";
  if (/education|course|coursework|gpa|certificate|课程|課程|证书|證書|教育/.test(text)) return "把教育背景信号补清楚";
  if (/version|版本|tailor|定制|客制|投递|投遞|申请方向|申請方向/.test(text)) return "按申请方向做一版简历";

  return "";
}

function titleIntent(value = "") {
  const text = String(value || "").toLowerCase();
  if (!text) return "";
  if (/keyword|关键词|關鍵詞|jd|ats/.test(text)) return "keyword";
  if (/skills?|技能|技术栈|技術棧/.test(text)) return "skills";
  if (/summary|objective|简介|簡介|开头|開頭/.test(text)) return "summary";
  if (/量化|数字|數字|metric|measurable|impact|成果|结果|結果/.test(text)) return "impact";
  if (/bullet|experience|经历|經歷|项目|項目|project/.test(text)) return "experience";
  if (/format|pdf|word|格式|版面|排版|日期|date|timeline|时间线|時間線/.test(text)) return "format";
  if (/linkedin|github|portfolio|作品集|链接|鏈接|入口/.test(text)) return "link";
  if (/education|course|gpa|certificate|课程|課程|证书|證書|教育/.test(text)) return "education";
  return "";
}

function shouldPreferActionTitle(row = {}, visibleTitle = "") {
  const actionTitle = actionCentricTitle(row);
  if (!actionTitle) return false;
  if (isBadVisibleTitle(visibleTitle)) return true;
  const actionIntent = titleIntent(actionTitle);
  const visibleIntent = titleIntent(visibleTitle);
  if (!actionIntent) return false;
  if (!visibleIntent) return true;
  return actionIntent !== visibleIntent;
}

function hasCaseSpecificTitleTerm(value = "") {
  return CASE_SPECIFIC_TITLE_TERMS.some((pattern) => pattern.test(String(value || "")));
}

function isBadVisibleTitle(value = "") {
  const title = compact(value);
  if (!title) return true;
  if (BAD_VISIBLE_TITLE_RE.test(title)) return true;
  if (title.length > 80) return true;
  if (/先/.test(title)) return true;
  if (/^(你的现状|当前|求职者|候选人|学生|HR|导师)/.test(title)) return true;
  return false;
}

function familyOf(row = {}) {
  const topicText = [row.topic, row.L1, row.L2].filter(Boolean).join(" ").toLowerCase();
  const fullText = textOf(row).toLowerCase();
  if (/format|格式|版面|排版|font|字体|spacing|行距|页边距|日期|pdf|word|section|版块|header/.test(topicText)) return "format_cleanup";
  if (/github|linkedin|portfolio|link|作品集|链接|资料入口/.test(topicText)) return "profile_links";
  if (/education|course|课程|gpa|证书|certificate|教育/.test(topicText)) return "education_signal";
  if (/skills?|技能|技术技能|工具关键词/.test(topicText)) return "skills_section";
  if (/resume|简历|bullet|经历|项目|summary|objective|jd|ats|keyword|关键词/.test(topicText)) {
    if (/summary|objective|岗位原词|目标岗位|定位/.test(topicText)) return "summary_positioning";
    if (/jd|ats|keyword|关键词/.test(topicText)) return "jd_keyword_alignment";
    if (/量化|quantif|metrics?|impact|result|成果/.test(topicText)) return "quantified_impact";
    return "experience_evidence";
  }
  if (/interview|面试|behavior|behaviour|clarification|story bank|self-presentation|sql面试|case interview|mock/.test(`${topicText} ${fullText}`)) return "interview_preparation";
  if (/求职策略|职业方向|赛道|career|投递|申请|实习管理|国际生求职|offer|target company|networking/.test(`${topicText} ${fullText}`)) return "career_strategy";
  if (/学习系统|备考|自学|刷题|练习|training plan|prep process|preparation process/.test(`${topicText} ${fullText}`)) return "learning_plan";
  if (/诚信|造假|虚假|夸大|honesty|integrity|追问/.test(`${topicText} ${fullText}`)) return "credibility_safety";
  const family = String(row.canonical_action_family || row.canonicalActionFamily || "").trim();
  if (family) return family;
  const text = textOf(row).toLowerCase();
  if (/summary|objective|岗位原词|目标岗位|position|role alignment|exact.*title/.test(text)) return "summary_positioning";
  if (/jd|ats|keyword|关键词|hard skill|skills?/.test(text)) return "jd_keyword_alignment";
  if (/experience|bullet|经历|项目|project|证据/.test(text)) return "experience_evidence";
  if (/量化|quantif|metrics?|impact|result|成果/.test(text)) return "quantified_impact";
  if (/format|格式|版面|排版|font|spacing|日期|pdf/.test(text)) return "format_cleanup";
  if (/github|linkedin|portfolio|link|作品集|链接/.test(text)) return "profile_links";
  if (/education|course|课程|gpa|证书|certificate/.test(text)) return "education_signal";
  return "overall_positioning";
}

function depthOf(row = {}) {
  const depth = String(row.action_depth || row.actionDepth || "").trim();
  if (depth) return depth;
  const text = textOf(row).toLowerCase();
  if (/改写|重写|rewrite|改成|reframe|转化/.test(text)) return "rewrite";
  if (/证据|bullet|project|项目|经历|experience|工具|方法/.test(text)) return "evidence";
  if (/结构|拆分|合并|顺序|section|排序|版块/.test(text)) return "structure";
  if (/量化|数字|metrics?|impact|结果|成果|proof/.test(text)) return "proof";
  if (/诊断|判断|识别|确认|评估|why/.test(text)) return "diagnose";
  return "rewrite";
}

function titleFromRules(row = {}) {
  const actionTitle = actionCentricTitle(row);
  if (actionTitle && shouldPreferActionTitle(row, row.canonical_title || row.title || row.advice_card_title || "")) return actionTitle;

  const family = familyOf(row);
  const depth = depthOf(row);
  const text = textOf(row).toLowerCase();
  const tags = splitCsv(row.problem_tags || row.relatedProblemTags).join(" ");

  if (/missing_exact_job_title|exact_job_title|岗位原词|精确职位/.test(`${tags} ${text}`)) return "补上目标岗位原词";

  if (family === "summary_positioning") {
    if (/不同投递岗位|多个版本|版本|tailor|定制/.test(text)) return "按岗位维护简历版本";
    if (/删除|删掉|移除|弱化|不相关|干扰/.test(text)) return "删除干扰定位内容";
    if (/skills?|技能|关键词/.test(text)) return "重排定位相关技能";
    if (/summary|objective|开头|简介/.test(text)) return "让 Summary 指向目标岗位";
    return "聚焦目标岗位定位";
  }

  if (family === "jd_keyword_alignment") {
    if (/项目|project/.test(text)) return "把项目关键词写成证据";
    if (/课程|course|coursework/.test(text)) return "补齐课程关键词信号";
    if (/summary|objective|开头/.test(text)) return "把关键词放进 Summary";
    if (/逐句|逐条|对照|精读|缺口/.test(text)) return "逐条对照 JD 缺口";
    if (/术语|terminology|同义|表达|rewrite|改写|替换/.test(text)) return "把术语改成 JD 语言";
    if (/skills?|技能|技能栏|技能列表/.test(text)) return "整理 Skills 关键词";
    if (/植入|嵌入|bullet|经历/.test(text)) return "把关键词写进经历 bullet";
    if (/加粗|高亮|bold|highlight/.test(text)) return "突出 JD 核心关键词";
    return "补齐 JD 关键词证据";
  }

  if (family === "experience_evidence") {
    if (depth === "rewrite") return "把经历改成任务-方法-结果";
    if (depth === "structure") return "重组经历 bullet 结构";
    if (depth === "proof") return "强化经历结果证据";
    if (/量化|数字|metrics?|impact|提升|降低|百分比|%/.test(text)) return "强化经历结果证据";
    if (/工具|方法|技术|framework|pipeline|流程/.test(text)) return "补清工具和方法证据";
    if (/工作|实习|intern|experience/.test(text)) return "改写工作经历 bullet";
    if (/项目|project/.test(text)) return "把项目证据写进 bullet";
    return "把经历证据写进 bullet";
  }

  if (family === "skills_section") {
    if (/项目|project|经历|experience|bullet/.test(text)) return "把技能写进经历证据";
    if (/排序|分类|结构|版块|section|skills区|skills版块/.test(text)) return "重排 Skills 结构";
    if (/学习|补充|补齐|掌握|提升|训练/.test(text)) return "补齐目标岗位技能";
    if (/工具|tool|excel|sql|python|tableau|power bi|aws|gcp|azure/.test(text)) return "补齐工具技能信号";
    return "整理 Skills 关键词";
  }

  if (family === "interview_preparation") {
    if (/sql/.test(text)) return "练习业务场景 SQL 面试";
    if (/behavior|behaviour|行为/.test(text)) return "准备行为面试故事";
    if (/clarification|澄清|复述|不理解/.test(text)) return "练习面试澄清表达";
    if (/story bank|故事库|故事/.test(text)) return "整理可复用面试故事";
    if (/self-presentation|自我介绍|jd/.test(text)) return "对齐 JD 做自我介绍";
    if (/case|business case|咨询/.test(text)) return "准备岗位案例面试";
    return "准备岗位面试表达";
  }

  if (family === "career_strategy") {
    if (/赛道|方向|track|职业方向/.test(text)) return "明确目标求职赛道";
    if (/投递|申请|职位|company|公司/.test(text)) return "制定岗位投递策略";
    if (/实习|intern/.test(text)) return "设定实习产出目标";
    if (/国际生|visa|sponsor|身份/.test(text)) return "校准国际生求职范围";
    return "明确下一步求职策略";
  }

  if (family === "learning_plan") return "建立技能学习计划";
  if (family === "credibility_safety") return "保持内容真实可追问";

  if (family === "quantified_impact") return "强化 bullet 量化结果";
  if (family === "format_cleanup") return "修复格式和版面问题";
  if (family === "profile_links") return "补齐可验证资料入口";
  if (family === "education_signal") return "补强教育背景信号";

  return GENERIC_TITLE;
}

function classifyTitleGovernance(row = {}) {
  let canonical_title = titleFromRules(row);
  if (hasCaseSpecificTitleTerm(canonical_title) || isBadVisibleTitle(canonical_title)) {
    canonical_title = titleFromRules({ ...row, canonical_title: "" });
  }
  const rawText = textOf(row);
  const highRisk = hasCaseSpecificTitleTerm(rawText);
  const tooGeneric = canonical_title === GENERIC_TITLE;
  const title_review_status = highRisk || tooGeneric ? "needs_review" : "auto_classified";
  const title_confidence = highRisk ? 0.72 : tooGeneric ? 0.58 : 0.9;
  return {
    canonical_title,
    title_review_status,
    title_source: "rule",
    title_confidence,
    titleFlags: [
      highRisk ? "source_contains_case_specific_terms" : "",
      tooGeneric ? "generic_title" : "",
    ].filter(Boolean),
  };
}

function bestDisplayTitle(card = {}, personalizedTitle = "") {
  const personalized = compact(personalizedTitle);
  const actionTitle = actionCentricTitle(card);
  if (actionTitle && shouldPreferActionTitle(card, personalized)) return actionTitle;
  if (!isBadVisibleTitle(personalized) && !hasCaseSpecificTitleTerm(personalized)) return personalized;
  const canonical = compact(card.canonicalTitle || card.canonical_title);
  if (actionTitle && shouldPreferActionTitle(card, canonical)) return actionTitle;
  if (!isBadVisibleTitle(canonical) && !hasCaseSpecificTitleTerm(canonical)) return canonical;
  const fallback = titleFromRules(card);
  return isBadVisibleTitle(fallback) ? "优化这条简历建议" : fallback;
}

module.exports = {
  GENERIC_TITLE,
  BAD_VISIBLE_TITLE_RE,
  splitCsv,
  compact,
  familyOf,
  depthOf,
  hasCaseSpecificTitleTerm,
  isBadVisibleTitle,
  actionCentricTitle,
  titleFromRules,
  classifyTitleGovernance,
  bestDisplayTitle,
};
