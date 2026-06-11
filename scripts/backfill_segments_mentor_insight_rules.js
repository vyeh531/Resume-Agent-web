"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const { categoriesOf, detailTermsOf } = require("./audit_segments_perspective_tone");

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const ALL = argv.includes("--all");
const OVERWRITE = argv.includes("--overwrite");
const FAST_LANE_ONLY = argv.includes("--fast-lane-only");
const LIMIT = numberArg("--limit", APPLY ? 0 : 500);
const RESUME_AFTER_ID = numberArg("--resume-after-id", 0);
const START_OFFSET = numberArg("--offset", 0);
const APPLY_CHUNK_SIZE = numberArg("--apply-chunk-size", 500);
const SCOPE = stringArg("--scope", "resume_edit");
const OUT_DIR = stringArg("--out-dir", path.join("artifacts", "mentor-insight-rules"));
const APPLY_FILE = stringArg("--apply-file", "");
const PERSPECTIVE_SOURCE = "mentor_rules_from_p_mentor";
const BULK_SAFE_MODE = !argv.includes("--strict-review");

const SELECT_COLUMNS = `
  id, chunk_id, retrieval_scope, topic, "L1", "L2", advice_type,
  problem_tags, ats_dimensions, role_family, target_roles, seniority,
  advice_card_title, user_problem_summary, action_summary,
  "P_mentor", "A_action", "I_insight", "H_hook", "E_example", "HR_os",
  retrieval_text,
  to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
  to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
  to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
  to_jsonb(segments)->>'perspective_source' AS perspective_source,
  to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
`;

const STRONG_REVIEW_CATEGORIES = new Set([
  "positioning",
  "keyword",
  "portfolio",
  "education",
  "truthfulness",
  "collaboration",
]);

const MENTOR_OVERACTIVE_PATTERNS = [
  /我会帮你/,
  /我会先帮/,
  /我会陪你/,
  /我会从.{0,12}(?:下手|开始|改)/,
  /我会把.{0,28}(?:放|补|拆|收|写|改|接|标|删|理顺|讲清楚)/,
];

const MENTOR_HR_VOICE_PATTERNS = [
  /\bHR\b/i,
  /招聘/,
  /我初筛/,
  /我第一眼/,
  /recruiter/i,
];

const BULK_SAFE_FAMILIES = new Set([
  "positioning",
  "multi_version_resume",
  "education",
  "skills_frontload",
  "skills_structure",
  "skills_grouping",
  "keyword",
  "keyword_evidence",
  "portfolio_link",
  "profile_links",
  "portfolio_quality",
  "ux_research_portfolio",
  "ai_portfolio_priority",
  "impact",
  "core_contribution_first",
  "experience",
  "format",
  "page_overflow",
  "word_ruler_format",
  "pdf_submission",
  "document_rebuild",
  "contact_info_format",
  "date_format",
  "work_authorization",
  "project_depth_chain",
  "project_capability_map",
  "project_differentiation",
  "project_name_specificity",
  "business_value_framing",
  "metric_terminology",
  "quantified_formula",
  "role_title_reframing",
  "title_role_truthfulness",
  "cross_industry_language",
  "customer_segment_framing",
  "research_to_analytics",
  "research_publication",
  "research_industry_positioning",
  "research_role_fit",
  "industry_resume_order",
  "truthfulness",
  "truthful_impact",
  "skill_truthfulness",
  "skill_truthfulness_linux",
  "hardware_truthfulness",
  "hardware_project_proof",
  "instrumentation_truthfulness",
  "intern_scope_truthfulness",
  "rag_evaluation",
  "multi_agent",
  "dual_track_project",
  "dual_marketing_version",
  "channel_marketing_scope",
  "data_project_relevance",
  "onboarding_analysis",
  "social_media_metrics",
  "industry_research_info",
  "ownership_voice",
  "leadership_relevance",
  "space_reallocation",
  "experience_structure",
  "interests_section",
  "redundant_content_cleanup",
  "acronym_explanation",
  "summary_confidence",
  "title_bullet_format",
  "process_efficiency_reframing",
  "cpa_eligibility",
  "bullet_count_density",
  "template_differentiation",
  "contract_path_strategy",
  "interview_prep_depth",
  "company_interview_strategy",
  "coursework_translation",
  "engineering_tool_depth",
  "controls_engineering_depth",
  "cloud_platform_positioning",
  "product_business_framing",
  "management_kpi_story",
  "metric_truthfulness",
  "finance_accounting_positioning",
  "analytics_visualization_evidence",
  "portfolio_research_artifact",
  "rag_chatbot_evaluation",
  "analytics_method_truthfulness",
]);

const BULK_ADVISORY_FLAGS = new Set([
  "lost_detail_risk",
  "mentor_generic_template_risk",
]);

const BLOCKING_FLAGS = new Set([
  "mentor_too_short",
  "mentor_too_long",
  "wrong_family_risk",
  "lost_specific_terms",
  "lost_required_signal",
  "mentor_overactive_voice_risk",
  "mentor_hr_voice_risk",
  "mentor_not_conversational",
  "manual_hold_id_29",
]);

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

function compact(value, max = 900) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function sourceTextForGeneration(row = {}) {
  return [
    row.P_mentor,
    row.A_action,
    row.action_summary,
    row.user_problem_summary,
    row.H_hook,
    row.E_example,
  ].filter(Boolean).map((value) => compact(value, 700)).join(" ");
}

function detailTextForReview(row = {}) {
  return [
    sourceTextForGeneration(row),
    row.I_insight,
  ].filter(Boolean).map((value) => compact(value, 900)).join(" ");
}

function splitCsv(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function normalizedSource(row = {}) {
  return [
    row.retrieval_scope,
    row.topic,
    row.L1,
    row.L2,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.P_mentor,
    row.A_action,
    row.H_hook,
    row.E_example,
    row.problem_tags,
    row.canonical_action_family,
  ].filter(Boolean).join(" ");
}

function classifyMentorRowOverride(row = {}) {
  const primary = normalizedSource(row).toLowerCase();
  if (hasAny(primary, [/\brag\b|chatbot|llm|faithfulness|context recall|answer relevance|evaluation|evaluate|ai api/]) && !hasAny(primary, [/bleu|rag.*bleu|bleu.*rag|rag system|llm|fine-tuning|post-training|mcp|ai agent/])) return "rag_chatbot_evaluation";
  if (hasAny(primary, [/linear regression|segmentation analysis|statistical analysis|business analytics|analytics method|regression model|线性回归|分组分析/]) && !hasAny(primary, [/社科|research_to_analytics/])) return "analytics_method_truthfulness";
  if (hasAny(primary, [/portfolio|作品集|personal website|case study|paper|论文|research role|实验室|研究院/]) && !hasAny(primary, [/notion|portfolio link|作品集.*链接|名字下方.*portfolio|published research|published paper|已发表|正式发表|3-5|质量参差|portfolio quality|user persona|journey map|ux|phd|博士|education.*last|教育.*最后|工业界.*教育/])) return "portfolio_research_artifact";
  if (hasAny(primary, [/finance|accounting|business analyst|advisory|\bvaluation\b|dcf|equity research|investment|pe\/vc|credit risk|金融|会计|信贷/]) && !hasAny(primary, [/cpa eligible|cpa eligibility|eligible date|150|public accounting|ba.*marketing analytics|marketing analytics.*ba|marketing intern|social media|competitor research|竞品|社媒/])) return "finance_accounting_positioning";
  if (hasAny(primary, [/visualization|dashboard|tableau|power bi|raw data|\bba\b|\bds\b|business analyst|data analyst|data science|data project|可视化|仪表盘/]) && !hasAny(primary, [/yelp api|clustering|ba.*marketing analytics|marketing analytics.*ba|marketing analyst|general marketing|marketing intern|title.*marketing|competitor research|竞品|社媒|resume-jd matching|matching score|cross-industry|internal terminology|industry-specific|行业专有|内部术语|跨行业|two resumes|multiple versions|\bpm\b/])) return "analytics_visualization_evidence";
  if (hasAny(primary, [/3\s*(?:~|-|to)\s*5.{0,18}bullet|bullet point.{0,30}3\s*(?:~|-|to)\s*5|每段.{0,18}3\s*(?:~|-|到)\s*5/])) return "bullet_count_density";
  if (hasAny(primary, [/same.{0,20}project template|项目模板|简历雷同|措辞.{0,12}改写|chatgpt.{0,30}改写|高度雷同|同一个.{0,12}模板/])) return "template_differentiation";
  if (hasAny(primary, [/leetcode|刷题|coding interview|spring boot.{0,40}(?:面试|八股)|dependency injection|\bioc\b|技术面试/])) return "interview_prep_depth";
  if (hasAny(primary, [/amazon.{0,60}(?:面试|应届|new grad|保底)|behavioral interview|简历相关问题|对照简历提问/])) return "company_interview_strategy";
  if (hasAny(primary, [/contract.{0,30}(?:job|岗位|project|路线)|\bicc\b|new grad.{0,40}contract|正式岗位难求|3至6个月|3-6个月/])) return "contract_path_strategy";
  if (hasAny(primary, [/course name|课程名称|form.{0,20}motion|课程内容|浓缩为.{0,12}phrase/])) return "coursework_translation";
  if (hasAny(primary, [/control theory|frequency domain|system identification|bode|nyquist|\bpid\b|state space|经典控制|频域|系统辨识/])) return "controls_engineering_depth";
  if (hasAny(primary, [/solidworks|catia|\bcad\b|\bfea\b|servo drive|actuator|motor类型|工程设计软件/])) return "engineering_tool_depth";
  if (hasAny(primary, [/azure|aws|google cloud|\bs3\b|\bec2\b|lambda|多云|cloud platform/])) return "cloud_platform_positioning";
  if (hasAny(primary, [/go-to-market|go to market|user survey|user study|market推广|市场推广|目标受众|campaign|产品商业化/])) return "product_business_framing";
  if (hasAny(primary, [/pipeline management|\bkpi\b|季度目标|绩效指标|管理目标|结构化管理/])) return "management_kpi_story";
  if (hasAny(primary, [/估值区间|模型精度|难以核实|自圆其说|口头阐述|background explanation/])) return "metric_truthfulness";
  if (hasAny(primary, [/negotiat|client meeting|meeting minutes|sales intern|intern.*responsib/])) return "intern_scope_truthfulness";
  if (hasAny(primary, [/yelp api|clustering|visualization|api.*restaurant|restaurant.*api/])) return "project_depth_chain";
  if (hasAny(primary, [/llm|rag system|ai api|chatbot evaluation|data cleaning.*data transformation/])) return "project_capability_map";
  if (hasAny(primary, [/instructional design|教育科技|企业培训|三个针对性版本|完整长版简历|edtech/])) return "multi_version_resume";
  if (hasAny(primary, [/完整硬件|硬件实物|physical prototype|prototype.*pcb|pcb.*project|实物项目/])) return "hardware_project_proof";
  if (hasAny(primary, [/项目名|项目名称|project name|命名具体|具体化名称/])) return "project_name_specificity";
  if (hasAny(primary, [/bottleneck|operational efficiency|process improvement|20-30%|流程改进|瓶颈/])) return "process_efficiency_reframing";
  if (hasAny(primary, [/小红书|xiaohongshu/]) && !hasAny(primary, [/followers?|粉丝|获赞|\blikes\b|运营|账号/])) return "industry_research_info";
  if (hasAny(primary, [/小红书|xiaohongshu|followers?|粉丝|获赞|\blikes\b|leadership板块|professional.*撑满/])) return "social_media_metrics";
  if (hasAny(primary, [/business analyst.*marketing intern|marketing intern.*business analyst|title.*marketing intern|竞品分析.*社媒|社媒运营.*title/])) return "title_role_truthfulness";
  if (hasAny(primary, [/b2b|b2c|business to business|business to customer|商业模式|客户群体|enterprise clients|consumer engagement/])) return "customer_segment_framing";
  if (hasAny(primary, [/stem opt|work authorization|普通opt|签证状态|雇佣可行性|\bopt\b|\bcpt\b|\bh-?1b\b|sponsorship/])) return "work_authorization";
  if (hasAny(primary, [/word.*ruler|ruler工具|tab键|left margin|空格.*对齐|formatting被破坏/])) return "word_ruler_format";
  if (hasAny(primary, [/联系信息|手机号|电话号码|美国号码|国内号码|姓名下方|mobile.*email|email.*linkedin|linkedin.*email/]) && !hasAny(primary, [/portfolio|作品集|notion/])) return "contact_info_format";
  if (hasAny(primary, [/portfolio.*notion|notion.*portfolio|名字下方.*portfolio|portfolio link|作品集.*链接/])) return "portfolio_link";
  if (hasAny(primary, [/ownership|contribute to|in charge of|被动表述|主动ownership|低估自己的贡献/])) return "ownership_voice";
  if (hasAny(primary, [/leadership经历|leadership板块|learning assistant|cyber consulting|usc life|含金量参差/])) return "leadership_relevance";
  if (hasAny(primary, [/课外活动|extracurricular|english.*mandarin|mandarin.*english|languages:|technical skills.*空间|腾出空间/])) return "space_reallocation";
  if (hasAny(primary, [/公司是做什么|核心业务|三个维度|每段工作经历|specific.*项目|compass/])) return "experience_structure";
  if (hasAny(primary, [/教育局|青年农民|虚构经历|从未实际参与|访谈\/调研|深度访谈/])) return "truthful_impact";
  if (hasAny(primary, [/社科|研究经历|segmentation analysis|分组分析|业界术语|business analytics/])) return "research_to_analytics";
  if (hasAny(primary, [/未学过|没学过|没有学过|not learned|never learned/])) return "skill_truthfulness";
  if (hasAny(primary, [/ubuntu|centos|red hat|红帽|虚拟机|linux发行版/])) return "skill_truthfulness_linux";
  if (hasAny(primary, [/bom|仪器|instrument|设备使用|自洽/])) return "instrumentation_truthfulness";
  if (hasAny(primary, [/pcb|电路设计|画图/])) return "hardware_truthfulness";
  if (hasAny(primary, [/分子|分母|接单率|等待时间|可计算的公式|量化为可计算/])) return "quantified_formula";
  if (hasAny(primary, [/月份缩写|日期格式|month abbreviation|date format|jan\.|feb\.|sep\./])) return "date_format";
  if (hasAny(primary, [/onboarding|training modules|新员工|入职数据|90-day productivity|hr实习/])) return "onboarding_analysis";
  if (hasAny(primary, [/tiktok|instagram|facebook|organic social|paid ads|全渠道|social media/])) return "channel_marketing_scope";
  if (hasAny(primary, [/marketing analyst|general marketing|sponsor概率|两版简历|两个方向都投/])) return "dual_marketing_version";
  if (hasAny(primary, [/公益活动|爱心活动|企业年报|蔚来|比亚迪|长安|新能源企业|数据沾边/])) return "data_project_relevance";
  if (hasAny(primary, [/ba.*marketing analytics|marketing analytics.*ba/])) return "";
  if (hasAny(primary, [/ba.*pm|pm.*ba|ds.*ba|marketing\/cryptocurrency|two versions|two resumes|两边同时|两份简历|两个版本/])) return "multi_version_resume";
  if (!hasAny(primary, [/cpa eligible|eligible date|150|public accounting|坐考/]) && hasAny(primary, [/\bcvr\b|\bcpa\b|cost per acquisition|conversion rate|指标定义|术语定义/])) return "metric_terminology";
  if (hasAny(primary, [/profit|cost|forecast|business value|商业价值|提升利润|降低成本|预测能力|为我所用/])) return "business_value_framing";
  if (hasAny(primary, [/cross.*industry|da\/ba|行业|internal terminology|内部术语/])) return "";
  if (hasAny(primary, [/yolo|coco|you only look once|abbreviation|acronym|缩写|全称/])) return "acronym_explanation";
  if (hasAny(primary, [/pdf.*google doc|pdf.*google docs|google doc.*pdf|google docs.*pdf|导出.*pdf|pdf格式|pdf.*递交/])) return "";
  if (hasAny(primary, [/google doc|google docs|microsoft word|start from scratch|badcase|bad case|纯文本|从零开始|重新排版/])) return "document_rebuild";
  if (hasAny(primary, [/familiar|2d animation|storyboarding|concept design|animation production|summary.*familiar/])) return "summary_confidence";
  if (hasAny(primary, [/mvpa planner|pre-production artist|concept designer|associate producer|associate designer|title.*company|大段落|独立.*一行/])) return "title_bullet_format";
  if (hasAny(primary, [/3-5|最能代表当前水平|质量参差|作品集.*质量|早期学生|凑数量|portfolio.*quality/])) return "portfolio_quality";
  if (!hasAny(primary, [/published|已发表|正式发表|发表地点/]) && hasAny(primary, [/paper|research院|实验室|非研究类|普通数据|运营岗位|论文经历/])) return "research_role_fit";
  return "";
}

function classifyMentorRow(row = {}) {
  const override = classifyMentorRowOverride(row);
  if (override) return override;

  const source = normalizedSource(row).toLowerCase();
  const primary = [
    row.retrieval_scope,
    row.topic,
    row.L1,
    row.L2,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.P_mentor,
    row.A_action,
    row.H_hook,
    row.problem_tags,
    row.canonical_action_family,
  ].filter(Boolean).join(" ").toLowerCase();
  const tags = String(row.problem_tags || "").toLowerCase();
  const title = String(row.advice_card_title || row.topic || "").toLowerCase();
  const scope = String(row.retrieval_scope || "").toLowerCase();

  if (scope === "interview" || hasAny(primary, [/resume deep dive|deep dive|bq|behavioral|coding|system design/])) return "truthfulness";
  if (hasAny(primary, [/rag.*bleu|bleu.*rag|忠实性|答案相关性|上下文召回率|faithfulness|context recall/])) return "rag_evaluation";
  if (hasAny(primary, [/rag.*泛滥|llm.*泛滥|fine-tuning pipeline|同质化|教程.*项目|项目类型本身/])) return "project_differentiation";
  if (hasAny(primary, [/multi-agent|多智能体|智能体边界|智能体之间|上下文传递|错误处理|重试|降级/])) return "multi_agent";
  if (hasAny(primary, [/academic framing|which industries|行业.*应用|应用相关.*行业|研究项目.*行业|产业应用/])) return "research_industry_positioning";
  if (hasAny(primary, [/published research|published paper|research paper|已发表|正式发表|期刊|会议|出版物|发表地点|研究论文/])) return "research_publication";
  if (hasAny(primary, [/ba.*marketing analytics|marketing analytics.*ba|营销数据分析|两个版本中共用|两个方向.*共用/])) return "dual_track_project";
  if (hasAny(primary, [/user engagement|conversion rate|指标术语|术语定义|metrics描述|metric.*definition|行业标准.*措辞/])) return "metric_terminology";
  if (hasAny(primary, [/pdf格式|pdf.*递交|导出为pdf|word.*google docs|格式.*错乱|平台强制要求word/])) return "pdf_submission";
  if (hasAny(primary, [/cpa eligible|cpa eligibility|eligible date|150学分|坐考cpa|公共会计|public accounting/])) return "cpa_eligibility";
  if (hasAny(primary, [/核心价值|最重要的贡献|第一条bullet|贡献.*前置|lead.*从0到1|描述.*散/])) return "core_contribution_first";
  if (hasAny(primary, [/跨行业|行业专有|内部术语|内部系统名称|通用.*数据.*分析语言|其他行业.*看不懂|行业局限/])) return "cross_industry_language";
  if (hasAny(primary, [/功能类别分组|按功能类别|分析仪器类|分子生物学类|生物过程类|技能列表杂乱|混列所有技能/])) return "skills_grouping";
  if (hasAny(primary, [/user persona|journey map|用户研究产出|只做了ui|不懂ux|ux作品集|ux工作流程/])) return "ux_research_portfolio";
  if (hasAny(primary, [/ai相关.*设计项目|ai.*作品集|作品集.*最前|ai经验.*设计师|ai工具|ai场景/])) return "ai_portfolio_priority";
  if (hasAny(primary, [/jd.*高频关键词|用jd的语言|描述语言.*jd|关键词匹配度低|对照jd逐条/])) return "jd_language_alignment";
  if (hasAny(primary, [/内容冗余|冗余|不相关实习|不相关.*活动|获奖记录|重复.*学术项目|重点不突出|删掉.*无关|remove.*irrelevant|irrelevant internship/])) return "redundant_content_cleanup";
  if (hasAny(primary, [/溢出到第二页|翻第二页|一小段溢出|严格控制.*一页|两页|超出一页|超过一页/])) return "page_overflow";
  if (hasAny(primary, [/博士|phd|研究生.*工业界|工业界.*研究生|工业界.*教育经历|education.*最后|发表论文.*教育/])) return "industry_resume_order";
  if (hasAny(primary, [/partially know|partial.*skills|部分掌握|只列出.*能够.*应对|持续学习|技能.*不够扎实|讲清楚细节|细节问题|深问|挂名参与/])) return "truthfulness";
  if (hasAny(primary, [/tools only in the skills section|only.*skills section|只集中在技能|只放.*skills|只放.*技能|工具.*经历.*bullet|embed.*tool/])) return "keyword_evidence";
  if (hasAny(primary, [/interests|兴趣爱好|兴趣版块|兴趣.*section|不是主流做法|不再是主流/])) return "interests_section";
  if (hasAny(primary, [/内容冗余|冗余|不相关实习|不相关.*活动|获奖记录|重复.*学术项目|重点不突出|删掉.*无关|remove.*irrelevant|irrelevant internship/])) return "redundant_content_cleanup";
  if (hasAny(primary, [/原始职位名称|职位名称|职位名|job title|role title|头衔|职称|目标岗位jd.*名称|经历.*名称.*目标岗位|refram.*title/i])) return "role_title_reframing";
  if (hasAny(primary, [/skills.*首位|skills.*置顶|technical skills.*first|技能.*前置|技能.*置顶/])) return "skills_frontload";
  if (hasAny(primary, [/skills.*分类|skills.*结构|programming languages|libraries|frameworks|tools|技能板块|技能版块|技能.*重组/])) return "skills_structure";
  if (hasAny(primary, [/sponsorship|work authorization|\bh-?1b\b|\bopt\b|\bcpt\b|\bvisa\b|身份|担保|工签/i])) return "work_authorization";
  if (hasAny(primary, [/linkedin|github|portfolio|作品集|个人网站|personal website|project link|链接|联系/])) return "profile_links";
  if (scope === "resume_edit" && hasAny(primary, [/ats|skill keywords?|关键词匹配|机筛|matching score|resume[- ]?jd matching|匹配分数|未匹配关键词|技能词汇匹配/])) return "keyword_evidence";
  if (scope === "resume_edit" && hasAny(primary, [/process engineer|catalysis|催化反应|控制台参数|关键参数监控|化工流程/])) return "research_industry_positioning";
  if (scope === "resume_edit" && hasAny(primary, [/药企|化工厂|cro|contractor|多版简历|多份简历|不同求职方向|不同方向准备|pharma|chemical plant/])) return "multi_version_resume";
  if (scope === "resume_edit" && /generic_resume_positioning|resume_not_tailored_to_jd|low_role_specificity|weak_target_role_alignment/.test(tags)) return "positioning";
  if (hasAny(primary, [/一份.*简历.*所有|通用简历|多版本|简历版本|tailor|not tailored|投递方向|目标岗位.{0,12}版本|版本.{0,12}目标岗位/])) return "positioning";
  if (hasAny(primary, [/format|layout|margins?|narrow|0\.5|single|before=0|after=0|\bword\b|word文档|pdf|排版|版面|一页|超页|行距|页边距|字号|跨页|bullet.*两行|3-5条/])) return "format";
  if (hasAny(primary, [/relevant coursework|coursework|课程区域|课程名称|扩展.*课程|补充.*课程|教育背景|在校|应届|junior|entry-level|gpa|证书/])) return "education";
  if (hasAny(primary, [/为什么用|why.*chose|tradeoff|权衡|浅用|讲不清|可信|夸大|debug|prototype|test/])) return "truthfulness";
  if (hasAny(primary, [/chunking|分块|块大小|retrieval quality/])) return "truthfulness";
  if (hasAny(primary, [/skills only|只.*skills|只.*技能|经历.*证据|experience.*evidence|技能.*经历/])) return "keyword_evidence";
  if (hasAny(primary, [/ats|jd|keyword|keywords|skills?|关键词|技能词|技术词|技术栈|框架|模型|工具|原词/])) return "keyword";
  if (hasAny(primary, [/education|course|学校|学历/])) return "education";
  if (hasAny(primary, [/量化|数字|结果|成果|impact|metric|measurable|提升|降低|规模|频率|accuracy|precision/])) return "impact";
  if (hasAny(primary, [/experience|project|bullet|经历|项目|实习|工作内容|职责|案例|做了什么/])) return "experience";
  if (hasAny(title, [/positioning|定位|summary|headline/])) return "positioning";
  return "general";
}

function extractConcreteTerms(row = {}) {
  const text = sourceTextForGeneration(row);
  const patterns = [
    /Spring Boot/i,
    /AWS/i,
    /Azure/i,
    /Google Cloud/i,
    /\bS3\b/i,
    /\bEC2\b/i,
    /Lambda/i,
    /LeetCode/i,
    /dependency injection/i,
    /\bIOC\b/i,
    /Solidworks/i,
    /CATIA/i,
    /\bFEA\b/i,
    /\bCAD\b/i,
    /\bPID\b/i,
    /Bode/i,
    /Nyquist/i,
    /system identification/i,
    /Go-to-market/i,
    /user survey/i,
    /user study/i,
    /\bKPI\b/i,
    /REST(?:ful)? API/i,
    /Redis/i,
    /PyTorch/i,
    /TensorFlow/i,
    /\bCNN\b/i,
    /\bRNN\b/i,
    /Transformer/i,
    /\bDense\b/i,
    /\bC\+\+\b/i,
    /\bPython\b/i,
    /\bJava\b/i,
    /\bSQL\b/i,
    /\bExcel\b/i,
    /\bTableau\b/i,
    /Power BI/i,
    /\bPL300\b/i,
    /Linear Algebra/i,
    /Computer Networks/i,
    /Image Processing/i,
    /Statistical Analysis/i,
    /Database Systems/i,
    /Cybersecurity/i,
    /\bGitHub\b/i,
    /\bLinkedIn\b/i,
    /\bOPT\b/i,
    /\bPresent\b/i,
    /\bNarrow\b/i,
    /0\.5\s*(?:英寸|inch|inches)?/i,
    /\bSingle\b/i,
    /before=0/i,
    /after=0/i,
    /\bRAG\b/i,
    /\bLLM\b/i,
    /chunking|分块/i,
    /chunk size|块大小/i,
  ];
  const terms = [];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && !terms.some((term) => term.toLowerCase() === match[0].toLowerCase())) {
      terms.push(match[0]);
    }
  }
  return terms.slice(0, 5);
}

function requiredSignalsForReview(row = {}) {
  const source = detailTextForReview(row).toLowerCase();
  const signalGroups = [
    ["negotiation", /negotiat/],
    ["client meeting", /client meeting/],
    ["Yelp API", /yelp api/],
    ["clustering", /clustering/],
    ["visualization", /visualization/],
    ["BA", /\bba\b/],
    ["PM", /\bpm\b/],
    ["DS", /\bds\b/],
    ["business value", /business value|商业价值|提升利润|降低成本|预测能力|为我所用/],
    ["YOLO", /yolo/],
    ["COCO", /coco/],
    ["Google Doc", /google doc/],
    ["Microsoft Word", /microsoft word/],
    ["familiar", /familiar/],
    ["2D animation", /2d animation/],
    ["storyboarding", /storyboarding/],
    ["concept design", /concept design/],
    ["Pre-production Artist", /pre-production artist/],
    ["Concept Designer", /concept designer/],
    ["Associate Producer", /associate producer/],
    ["Accounting", /accounting/],
    ["Finance", /finance|金融/],
    ["Advisory", /advisory/],
    ["250+", /250\+/],
    ["2 interviews", /2\s*(?:次|轮)?.{0,8}(?:interview|面试)/],
    ["LLM", /\bllm\b/],
    ["chatbot", /chatbot/],
    ["RAG", /\brag\b/],
    ["AI API", /ai api/],
    ["evaluation", /evaluation|evaluate/],
    ["Marketing Intern", /marketing intern/],
    ["Business Analyst", /business analyst/],
    ["B2B", /\bb2b\b/],
    ["B2C", /\bb2c\b/],
    ["Notion", /notion/],
    ["Portfolio", /portfolio|作品集/],
    ["ownership", /ownership|in charge of|contribute to/],
    ["English/Mandarin", /english.*mandarin|mandarin.*english/],
    ["linear regression", /linear regression|线性回归/],
    ["Ubuntu", /ubuntu/],
    ["CentOS", /centos/],
    ["Red Hat", /red hat|红帽/],
    ["PCB", /\bpcb\b/],
    ["接单率", /接单率/],
    ["等待时间", /等待时间/],
    ["TikTok", /tiktok/],
    ["Instagram", /instagram/],
    ["Facebook", /facebook/],
    ["paid ads", /paid ads/],
    ["小红书", /小红书|xiaohongshu/],
    ["粉丝", /粉丝|followers?/],
    ["获赞", /获赞|\blikes\b/],
    ["年报", /年报|annual report/],
    ["蔚来", /蔚来|\bnio\b/],
    ["比亚迪", /比亚迪|byd/],
    ["长安", /长安/],
    ["portfolio quality", /作品集.*质量|质量参差|最能代表当前水平|早期学生|凑数量/],
    ["paper", /\bpaper\b|论文/],
    ["research role", /研究院|实验室|非研究类|普通数据|运营岗位/],
  ];
  return signalGroups
    .filter(([, pattern]) => pattern.test(source))
    .map(([label]) => label);
}

function hasRequiredSignalInMentor(signal, mentorText = "") {
  const text = mentorText.toLowerCase();
  const accepted = {
    "business value": /business value|业务|提升利润|降低成本|预测/,
    "portfolio quality": /作品集|当前水平|最强|早期作品|数量/,
    "research role": /研究院|实验室|普通数据|运营岗位|目标岗位|方向/,
    "2 interviews": /2\s*(?:次|轮)?.{0,8}(?:interview|面试)/,
    "AI API": /ai api|api 调用|api调用/,
    "Marketing Intern": /marketing intern/,
    "Business Analyst": /business analyst/,
    "Portfolio": /portfolio|作品集/,
    "English/Mandarin": /english|mandarin|语言/,
    "Red Hat": /red hat|红帽/,
    "paid ads": /paid ads|广告投放/,
    "小红书": /小红书|xiaohongshu/,
    "粉丝": /粉丝|followers?/,
    "获赞": /获赞|\blikes\b/,
    "年报": /年报|annual report/,
  };
  const pattern = accepted[signal];
  return pattern ? pattern.test(text) : text.includes(signal.toLowerCase());
}

function isFastLaneApproved(row = {}, mentorText = "", review = {}) {
  if (review.recommendation !== "approved") return false;
  if (!Array.isArray(review.flags) || review.flags.some((flag) => flag !== "good_as_is")) return false;

  const family = classifyMentorRow(row);
  const source = sourceTextForGeneration(row).toLowerCase();
  const text = mentorText.toLowerCase();
  const gates = {
    research_to_analytics: () => /segmentation analysis|linear regression|business analytics|社科|分组分析/.test(source),
    ownership_voice: () => /ownership|in charge of|contribute to|负责/.test(source),
    project_capability_map: () => /llm|chatbot|rag|ai agent|mcp|fine-?tuning|ai api/.test(source),
    word_ruler_format: () => /word.*ruler|ruler工具|tab键|left margin|空格.*对齐/.test(source),
    metric_terminology: () => /\bcvr\b|\bcpa\b|cost per acquisition|conversion rate|指标定义|术语定义|finance|金融/.test(source),
    work_authorization: () => /stem opt|work authorization|sponsorship|\bopt\b|\bcpt\b|\bvisa\b|签证|工签/.test(source),
    contact_info_format: () => /手机号|电话号码|美国号码|国内号码|mobile.*email|email.*linkedin|联系信息/.test(source),
    title_role_truthfulness: () => /marketing intern|business analyst|title|职位名称/.test(source),
    customer_segment_framing: () => /\bb2b\b|\bb2c\b|business to business|business to customer|商业模式|客户群体/.test(source),
    portfolio_link: () => /portfolio|作品集|notion/.test(source) && /portfolio|作品集/.test(text),
    truthful_impact: () => /虚构|从未实际参与|教育局|青年农民|访谈|调研/.test(source),
    skill_truthfulness: () => /未学过|没学过|没有学过|not learned|never learned|没有实际做过/.test(source),
    skill_truthfulness_linux: () => /ubuntu|centos|red hat|红帽|虚拟机/.test(source),
    onboarding_analysis: () => /onboarding|training modules|新员工|入职数据|90-day productivity|hr实习/.test(source),
    date_format: () => /月份缩写|日期格式|month abbreviation|date format|jan\.|feb\.|sep\./.test(source),
    dual_marketing_version: () => /marketing analyst|general marketing|两版简历|两个方向都投/.test(source),
    quantified_formula: () => /分子|分母|接单率|等待时间|可计算的公式/.test(source),
    industry_research_info: () => /小红书|xiaohongshu/.test(source) && /行业|前景|经验|信息/.test(source),
    data_project_relevance: () => /公益活动|企业年报|蔚来|比亚迪|长安|新能源企业|数据沾边/.test(source),
    portfolio_quality: () => /作品集|portfolio/.test(source) && /3-5|质量|当前水平|早期/.test(source),
    cpa_eligibility: () => /cpa eligible|eligible date|150|public accounting|坐考/.test(source),
    multi_agent: () => /multi-agent|多智能体|single-agent|latency|trade-off/.test(source),
  };

  return Boolean(gates[family] && gates[family]());
}

function withTerms(sentence, row, fallback = "") {
  const terms = extractConcreteTerms(row);
  if (!terms.length) return sentence;
  const tail = fallback || `像 ${terms.join("、")} 这些词要留在对应经历里，不要只停在泛泛描述。`;
  return `${sentence}${tail.length + sentence.length > 145 ? "" : tail}`;
}

function generateMentorInsight(row = {}) {
  const family = classifyMentorRow(row);
  const source = sourceTextForGeneration(row);

  if (family === "finance_accounting_positioning") {
    if (/public accounting|cpa eligible|cpa eligibility|150/i.test(source)) {
      return "你投 public accounting 时，CPA eligible date 和 150 学分要写得很清楚。这不是装饰信息，而是 Accounting 岗位会直接看的资格信号。";
    }
    if (/business analyst|accounting|advisory/i.test(source)) {
      return "你这份 Finance 简历要把 Business Analyst、Accounting 和 Advisory 的定位分开。每个方向保留对应项目证据，不要让同一段经历同时承担太多角色。";
    }
    if (/credit risk|valuation|dcf|equity research|investment|pe\/vc/i.test(source)) {
      return "你这段 Finance 经历要把赛道说准。credit risk、valuation、DCF 或 Equity Research 这些词要接到具体分析动作，不要只写成泛泛的金融实习。";
    }
    return "你这份 Finance 或 Business Analyst 方向的简历要先收住定位。建议把 Accounting、Advisory 或分析项目各自放回对应语境，别让经历看起来什么都想投。";
  }
  if (family === "analytics_visualization_evidence") {
    if (/raw data/i.test(source)) {
      return "你这段 DA/DS/BA 项目要从 raw data 开始讲清楚。SQL、Python、分析、visualization 或 dashboard 产出要串起来，读者才看得出完整链条。";
    }
    if (/tableau|power bi|dashboard|visualization/i.test(source)) {
      return "你这里不要只列 Tableau、Power BI 或 visualization。建议补出 dashboard 服务了什么问题、谁会看、最后产生什么决策价值。";
    }
    return "BA/DS 相关经历不要只堆技术词。建议把分析问题、数据处理、visualization 和结论串起来，让这条 bullet 像真的解决过业务问题。";
  }
  if (family === "portfolio_research_artifact") {
    if (/paper|论文|published research|research paper/i.test(source)) {
      return "Portfolio 里如果放 paper 或 published research，要标清研究主题、发表状态和你的贡献。这样论文经历不会被误读成普通课堂项目。";
    }
    if (/portfolio|作品集|notion|case study|personal website/i.test(source)) {
      return "Portfolio 不是附加装饰，尤其设计、PM 或项目型经历要让入口清楚。建议把作品集或 case study 放到容易点开的位置，并说明它证明了什么能力。";
    }
    return "研究院、实验室或 research role 的经历要先看目标方向。能服务研究岗位就保留细节；如果投普通数据或运营岗，就要翻译成更通用的项目证据。";
  }
  if (family === "rag_chatbot_evaluation") {
    if (/rag/i.test(source)) {
      return "RAG chatbot 项目不要只写接了 AI API，evaluation 口径也要讲清楚。faithfulness、answer relevance 和 context recall 这些指标要放进项目描述里。";
    }
    return "LLM 或 chatbot 项目要把 evaluation 写出来。建议说明怎么评估回答质量、失败案例和改进方向，不然项目容易像只接了一个 AI API。";
  }
  if (family === "analytics_method_truthfulness") {
    if (/linear regression/i.test(source)) {
      return "linear regression 这类方法能写，但前提是你真的能解释。建议补清楚变量、目标、结果和限制，别让方法词停在看起来会用的层面。";
    }
    return "分析方法不要只写名词。segmentation analysis、statistical analysis 或 business analytics 都要接到问题、方法和结论，面试追问时才讲得圆。";
  }

  if (family === "bullet_count_density") {
    return "你这段经历不是 bullet 越多越好。一般 3-5 条就够，重点是每条都讲清任务、方法和结果，不要为了撑篇幅把信息写散。";
  }
  if (family === "template_differentiation") {
    return "同一个项目模板可以借结构，但措辞一定要改出自己的版本。项目 title 和核心事实保留，bullet 表达换成你的动作和结果，避免看起来和同学简历雷同。";
  }
  if (family === "contract_path_strategy") {
    return "现在正职确实不好上岸，contract 可以当成过渡路线看。先用 3-6 个月项目积累美国经验，后面再把这些项目整理成更有分量的正职筹码。";
  }
  if (family === "interview_prep_depth") {
    if (/leetcode|刷题/i.test(source)) {
      return "你现在的刷题量要按面试难度分层看。Intern 或 ICC 可能够用，但冲 full time 或大厂时，LeetCode 还要继续补高频题和语言熟练度。";
    }
    return withTerms("这块准备不要停在会背词。Spring Boot、dependency injection、IOC 这类概念要能用自己的项目解释出来，面试追问时才站得住。", row, "");
  }
  if (family === "company_interview_strategy") {
    return "Amazon 这类目标可以当保底，但也不能只靠运气。建议把简历项目和行为面试故事先讲顺，基础刷题保持住，这样遇到简历 deep dive 比较稳。";
  }
  if (family === "coursework_translation") {
    return "课程名如果太抽象，就不要原样丢在简历上。可以把 Form、Motion 这类名字压成一句读得懂的 phrase，让别人快速知道你训练过什么能力。";
  }
  if (family === "engineering_tool_depth") {
    return withTerms("工程软件不要只写会用，要写到能做什么。Solidworks、CATIA、FEA 这类工具如果和设计、热力或流体分析有关，最好把使用场景讲出来。", row, "");
  }
  if (family === "controls_engineering_depth") {
    return withTerms("控制方向这里要写出工程判断，不只是课本名词。PID、Bode、Nyquist、system identification 这些内容，要接到真实系统为什么这样设计。", row, "");
  }
  if (family === "cloud_platform_positioning") {
    return withTerms("云平台经验要按投递对象摆顺。Azure 可以保留，但如果目标是科技公司或创业公司，AWS 和 Google Cloud 的相关项目证据会更通用。", row, "");
  }
  if (family === "product_business_framing") {
    return withTerms("产品项目不要只写功能做出来了。可以补 user survey、user study 或 go-to-market plan，让别人看到你也想过目标用户和推出路径。", row, "");
  }
  if (family === "management_kpi_story") {
    return withTerms("Pipeline management 这种说法要写到可解释。建议补 KPI 怎么设、目标怎么拆、团队怎么复盘，不然容易像一句日常职责。", row, "");
  }
  if (family === "metric_truthfulness") {
    return "数字不是越多越好，关键是能不能解释来源。估值区间、模型精度这类背景很重的数字，可以简历上少写一点，把方法和逻辑留到面试展开。";
  }

  if (family === "intern_scope_truthfulness") {
    if (!/negotiat/i.test(source)) {
      return "你这段 sales intern 不是没内容，是要写得更像真实实习职责。可以先用总领句讲业务开发或销售支持，再补 lead research、cold calls 或量化结果。";
    }
    return "你这条要守住实习生身份的可信边界。像 negotiation 这种太像老板级动作，建议换成 client meeting、会议记录或客户维护这类你真的能讲细的内容。";
  }
  if (family === "project_depth_chain") {
    if (!/yelp/i.test(source) && /k-?means|click-through|open rate/i.test(source)) {
      return "你这个分群项目不要只停在用了 k-means。建议补出分群之后的 click-through rate、open rate 或营销结果，读者才看得出分析真的产生了影响。";
    }
    if (!/yelp/i.test(source)) {
      return "你这个项目不是缺关键词，是分析链条还没写完整。建议把数据来源、分析步骤、模型选择和可视化结果串起来，读者才看得见完整能力。";
    }
    return "你这个项目不是缺关键词，是分析链条还没写出来。建议把 Yelp API 抓数、基础分析、clustering 和 visualization 串起来，读者才看得见完整能力。";
  }
  if (family === "project_capability_map") {
    if (/ai agent|mcp|fine-?tuning|post-training/i.test(source)) {
      return "你这段 LLM 项目要写出不同能力层次。RAG、AI Agent/MCP、fine-tuning 或 post-training 分开呈现，比只说做了大模型项目更有辨识度。";
    }
    return "你这段 LLM/chatbot 项目不要再和其他项目一起只写 data cleaning。建议把 RAG system、AI API 调用和 chatbot evaluation 分出来，能力版图才不会重叠。";
  }
  if (family === "hardware_project_proof") {
    return "硬件方向如果有完整实物或 PCB 项目，确实要优先写出来。它比单纯课程或零散测试更能证明你真的走过设计、实现和验证流程。";
  }
  if (family === "project_name_specificity") {
    return "项目名称不要写得太泛。名字本身要让人一眼看出场景、对象或技术重点，不然再好的 bullet 也会先被当成普通项目。";
  }
  if (family === "process_efficiency_reframing") {
    return "你这里可以把画图或流程工作翻成业务语言。重点不是动作本身，而是你怎么发现 bottleneck、提升 operational efficiency，并用可信数字说明改善幅度。";
  }
  if (family === "social_media_metrics") {
    return "你这段小红书运营其实有结果，别只当普通经历写。粉丝从不到 100 到 450、获赞 1600 这类数字要进 bullet，leadership 板块反而可以降权。";
  }
  if (family === "industry_research_info") {
    return "你对艺术行业前景有顾虑时，可以先补信息差。小红书这类中文社区适合看在美华人的真实经验，但它是调研入口，不是简历成果本身。";
  }
  if (family === "title_role_truthfulness") {
    return "你这个 title 要跟真实工作内容对齐。既然主要是竞品分析和社媒运营，写 Marketing Intern 会比 Business Analyst 更可信，也更不容易被追问穿帮。";
  }
  if (family === "customer_segment_framing") {
    return "你这里要先分清 B2B 和 B2C，不然 bullet 会写得很虚。面向企业客户和面向消费者的动作不一样，客户群体说清楚后经历才专业。";
  }
  if (family === "portfolio_link") {
    if (/notion/i.test(source)) {
      return "作品集链接要放在别人一眼能点到的位置。建议把 Notion portfolio 放在名字下方，和 LinkedIn、邮箱一起排清楚，别让读者自己找。";
    }
    return "作品集链接要做成可以一键打开的入口。建议放在名字下方或联系信息行，确保 URL 能点击，不要让读者手动复制粘贴。";
  }
  if (family === "contact_info_format") {
    return "简历顶部联系方式要按美国求职习惯整理。手机号、location、email 和 LinkedIn 放在姓名下方；如果还用国内号码，建议换成本地号码。";
  }
  if (family === "word_ruler_format") {
    return "这条是很具体的排版问题：不要靠一串空格对齐。用 Word Ruler 设 left margin，再配合 Tab 键，换设备打开才不容易错位。";
  }
  if (family === "ownership_voice") {
    return "你这条不是要夸大，而是要把 ownership 写出来。比起 contributed to，用 in charge of 加上具体数量，才看得出这件事真的由你负责。";
  }
  if (family === "leadership_relevance") {
    return "Leadership 经历不是都要留下，关键看和目标岗位有没有关系。可以先全部列出来，再删掉含金量低或不服务求职方向的项。";
  }
  if (family === "space_reallocation") {
    return "你这里可以直接做减法。课外活动和 English/Mandarin 这类低信息量内容先删掉，把空间留给 technical skills 和目标岗位真正会看的工具。";
  }
  if (family === "experience_structure") {
    return "你这段经历要先按三层理清楚：公司做什么、你负责什么、具体项目是什么。结构稳了，后面再提炼 bullet 才不会散。";
  }
  if (family === "truthful_impact") {
    return "这条一定要守住真实边界。可以放大真实访谈、调研和影响力，但不要写没发生过的教育局合作或青年农民项目，面试追问会很危险。";
  }
  if (family === "research_to_analytics") {
    return "你这段社科研究其实可以翻译成业界能懂的数据分析经验。像分组分析、segmentation analysis、linear regression 这类方法，要和 BA 岗位语言接上。";
  }
  if (family === "skill_truthfulness") {
    if (!/linear regression|线性回归/i.test(source)) {
      return "没实际做过或没学过的模型就不要写进简历。可以保留 bar chart 这类真实分析内容，重点是面试时每句话都能解释清楚。";
    }
    return "没学过的技能就不要写上去，linear regression 这种词一被追问很容易露馅。Skills 宁可少一点，也要每个都能讲清使用场景。";
  }
  if (family === "skill_truthfulness_linux") {
    return "Linux 技能这里要写真实用过的版本。Ubuntu 和虚拟机可以留，CentOS、红帽如果没碰过就删掉，避免面试官顺着系统经验深挖。";
  }
  if (family === "hardware_truthfulness") {
    return "硬件实习没画 PCB 或电路图不代表没价值。可以如实写测试、熟悉产品、配合硬件工程师调试，不需要为了硬件开发岗位虚构画图经历。";
  }
  if (family === "instrumentation_truthfulness") {
    return "BOM、仪器或设备使用经历可以写，但要保证每个细节都能自洽。与其硬套硬件开发，不如把实际操作、测试目的和结果讲清楚。";
  }
  if (family === "quantified_formula") {
    return "你这里不要只写效率变高，要把怎么算写出来。像接单率用接单数除以派单数、等待时间用前后差值，数字才有可信度。";
  }
  if (family === "onboarding_analysis") {
    return "人力相关实习也可以写出数据分析感。把 onboarding 数据、SQL 提取、training 因素和 90-day productivity 结果串起来，比单纯写协助入职更有说服力。";
  }
  if (family === "date_format") {
    return "日期格式这种细节不用写得花，统一、清楚就好。月份缩写和时间范围保持一致，读者扫经历顺序时才不会被格式打断。";
  }
  if (family === "channel_marketing_scope") {
    return "你这段 marketing 经历不是零散平台清单，要整合成全渠道能力。TikTok、Instagram、Facebook 以及 organic 和 paid ads 都要放进同一个逻辑里。";
  }
  if (family === "dual_marketing_version") {
    return "Marketing Analyst 和 General Marketing 可以两条线都投，但最好拆成两版简历。一个突出 dashboard 和分析报告，一个突出 social、event 和 email marketing。";
  }
  if (family === "data_project_relevance") {
    return "你这里要把和数据无关的公益活动让位给更贴近 DA/BA 的项目。像从蔚来、比亚迪、长安年报提数据做分析，就比普通活动更能证明方向。";
  }
  if (family === "multi_version_resume") {
    if (/药企|化工厂|cro|contractor|pharma|chemical plant/i.test(source)) {
      return "你这里适合按投递方向拆版本，不要用一份简历同时打药企、化工厂和 CRO。药企版突出 NMR/HPLC，化工厂版突出 GC 和流程参数，CRO 或 contractor 再保留更通用的分析能力。";
    }
    return "你不是没有材料，是方向需要拆开。BA、PM 或 DS 版本可以各自保留不同重点，这样同一段经历才不会同时服务太多岗位。";
  }
  if (family === "business_value_framing") {
    if (/ppt|pitch deck|客户|订单|非洲|签约/i.test(source)) {
      return "普通 PPT 不一定值得写，但对外 pitch deck 如果真的推动客户沟通或签约，就有商业价值。建议把业务背景和结果一起写清楚。";
    }
    if (/第一条bullet|first bullet|summary|总领|整体价值/i.test(source)) {
      return "你这段经历第一条 bullet 要先让人看懂整体价值。先讲岗位、核心工具、核心事项和结果，后面的技术细节再慢慢展开。";
    }
    if (/optimize|engineer|develop|qwen|estimate/i.test(source)) {
      return "你这条第一句可以更主动一点。像 optimize 这种词偏弱，换成 engineer 或 develop 后，再确保量化数字能解释来源，可信度会稳很多。";
    }
    return "你这段项目不要只写技术怎么做，也要补一句它对业务有什么用。比如提升利润、降低成本或改善预测，才像公司会在意的价值。";
  }
  if (family === "acronym_explanation") {
    return "你这里的专业缩写要先帮读者跨过门槛。YOLO、COCO 这类词第一次出现时写全称或一句解释，技术细节才不会在第一眼就被误读。";
  }
  if (family === "document_rebuild") {
    return "这份文件的问题更像格式底座坏掉了，不适合在原档上小修小补。建议另开 Word、纯文本贴回去再重排，先把版面稳定性救回来。";
  }
  if (family === "summary_confidence") {
    return "你这段 Summary 要少一点学生式铺垫，多一点确定的专业身份。把 familiar 这类弱词换掉，并写清 2D animation、storyboarding 或 concept design 的经验重点。";
  }
  if (family === "title_bullet_format") {
    return "你这段经历先把 title 和 bullet 结构理顺。职位名要用更专业的说法，职责也拆成一行一条，别让真实工作看起来像打杂。";
  }
  if (family === "portfolio_quality") {
    return "作品集不是数量比赛，放太多早期作品反而会稀释判断。建议挑 3-5 个最能代表当前水平的项目，把最强的放在最前面。";
  }
  if (family === "research_role_fit") {
    return "论文经历要不要放，先看目标岗位。研究院或实验室方向可以保留，普通数据或运营岗位就要谨慎，空间可能更该留给项目 bullet。";
  }

  if (family === "positioning") {
    if (/1-2|1 至 2|多版本|后端|前端|AI/.test(source)) {
      return withTerms("你不是没有材料，是一份简历同时想服务太多方向。建议先拆成 1-2 个版本，让每一版都能一眼看出目标岗位。", row, "");
    }
    return "你这里先别急着补更多内容，重点是把投递方向收清楚。定位明确后，现有经历才会被放在正确的岗位语境里看。";
  }
  if (family === "format") {
    if (/0\.5|narrow|single|before=0|after=0|行距|页边距/i.test(source)) {
      return "你这里不是内容没价值，而是版面空间还没用好。建议先调页边距、段落间距和行距，让重点经历留在一页里、读起来也不挤。";
    }
    return "这条先从可读性下手就好。格式稳定后，读者不用费力找信息，你真正重要的经历才比较容易被看见。";
  }
  if (family === "education") {
    return withTerms("你这块教育背景可以更像岗位训练证据。课程、证书或在校项目不用堆满，但要挑和目标岗位最相关的放前面。", row);
  }
  if (family === "skills_frontload") {
    return "你这里不建议把 Technical Skills 直接放最前面。对在校生来说，Education 先交代身份和训练背景，Skills 放第二层会更自然。";
  }
  if (family === "skills_structure") {
    return withTerms("你这块 Skills 不是越多越好，关键是分类逻辑要一致。建议按语言、库、框架平台和工具重排，读者会更快抓到技术栈。", row);
  }
  if (family === "keyword_evidence") {
    if (/10份|十份|matching score|匹配分数|resume[- ]?jd matching|未匹配关键词/i.test(source)) {
      return "你这里可以把 JD 匹配当成一轮迭代来做。先拿 10 份目标 JD 跑 matching score，把缺的关键词揉回对应经历，再用新的 5-7 份 JD 验证，不要只凭感觉改。";
    }
    return withTerms("你这里不要只把技能放在 Skills 清单里。建议把真实用过的关键词写进项目或经历 bullet，可信度会比单纯列词高很多。", row);
  }
  if (family === "keyword") {
    return withTerms("这条建议重点不是硬塞关键词，而是把 JD 里你真实掌握的技能词放到对的位置。Skills 可以列，项目里也要有对应证据。", row);
  }
  if (family === "profile_links") {
    if (/github/i.test(source)) {
      return "GitHub 链接本身就是一个可验证入口，不需要等代码完美才放。只要链接整洁可打开，就能比单纯文字描述多一层可信度。";
    }
    return "你这里可以先把可验证入口补齐。LinkedIn、GitHub、作品集或项目链接不是装饰，是让别人更快确认你真的做过。";
  }
  if (family === "work_authorization") {
    return "这类信息不是能力问题，但会影响后续推进。建议把 sponsorship 或 OPT/CPT 状态说清楚，避免对方因为不确定而先放下。";
  }
  if (family === "rag_evaluation") {
    return "你这条 RAG 项目不要只写做了系统，评估口径也要讲对。忠实性、答案相关性和上下文召回率，比随手写 BLEU 更能说明你真的懂场景。";
  }
  if (family === "multi_agent") {
    return "你这段多智能体经历要写出设计判断。边界怎么分、上下文怎么传、失败时怎么重试或降级，这些才像真实工程经验。";
  }
  if (family === "project_differentiation") {
    return "你这类 RAG 或 LLM 项目不能只靠项目名称取胜。建议写出真实问题、差异化数据或评估方法，不然很容易和教程项目混在一起。";
  }
  if (family === "research_industry_positioning") {
    if (/process engineer|catalysis|催化反应|控制台参数|关键参数监控|化工流程/i.test(source)) {
      return "你这段化工背景不是只能当学术经历写。建议把催化反应、关键参数监控和调参逻辑接到 process engineer 的日常工作上，让读者看出你知道岗位现场在看什么。";
    }
    return "你这段研究不是不能放，而是要翻译成产业能看懂的应用场景。建议点出它对应哪些行业问题，别只停在方法和 novelty。";
  }
  if (family === "research_publication") {
    return "你这篇研究如果已经发表，就不要只当普通项目写。建议标清发表地点、研究主题和你的具体贡献，让它变成可信的分析能力证据。";
  }
  if (family === "dual_track_project") {
    return "你同时投 BA 和 Marketing Analytics 时，不要硬用同一份泛简历。可以补一个营销数据分析项目，让两个版本都有共同证据。";
  }
  if (family === "metric_terminology") {
    if (/\bcvr\b|\bcpa\b|cost per acquisition/i.test(source)) {
      return "你这里要先把营销指标定义讲准。CVR 和 CPA 不是装饰词，最好说明各自代表什么、怎么计算，否则会显得只是堆术语。";
    }
    if (/finance|金融/i.test(source)) {
      return "你这里不是不能写金融指标，而是要看投递对象。除非目标就是 finance 岗位，否则建议改成更通用的数据分析语言，避免非金融背景的读者第一眼看不懂。";
    }
    return "你这里要先把指标词用准。User engagement 和 conversion rate 不是一回事，术语混用会让人怀疑基础分析判断。";
  }
  if (family === "pdf_submission") {
    return "你这里别用 Word 或 Google Docs 直接投。建议每次导出 PDF 再提交，除非平台强制要 Word；格式稳定本身就是专业度。";
  }
  if (family === "cpa_eligibility") {
    return "你投 public accounting 时，CPA eligible date 要主动写清楚。150 学分和可坐考时间点是行业信号，不要等雇主来猜。";
  }
  if (family === "core_contribution_first") {
    return "你这段经历不是要写更多，而是要先把最重要的贡献放出来。第一条 bullet 先讲核心价值，后面再展开具体工作。";
  }
  if (family === "cross_industry_language") {
    return "你投跨行业 DA/BA 时，内部术语要翻译成外部也看得懂的数据语言。别让行业缩写把真实能力挡住。";
  }
  if (family === "skills_grouping") {
    return "你这块 Skills 要按功能分组，不要把所有技能混在一起。像分析仪器、分子生物学、生物过程这类类别能让能力边界更清楚。";
  }
  if (family === "ux_research_portfolio") {
    return "你这份 UX 作品集不能只放视觉稿。User persona、journey map 这类研究产出要出现，才看得出你不是只做 UI。";
  }
  if (family === "ai_portfolio_priority") {
    return "如果你有 AI 相关设计项目，建议放到作品集前面。现在市场会优先注意这类经验，顺序本身也会影响第一印象。";
  }
  if (family === "jd_language_alignment") {
    return "你这里不是经历不够，而是语言还没贴近 JD。建议把 JD 高频词自然嵌进职责描述，让同一段经历更容易被系统和人读懂。";
  }
  if (family === "page_overflow") {
    return "你这里不是内容越多越好，而是第二页会直接拉低第一印象。建议先把简历压回一页，必要时删低相关内容。";
  }
  if (family === "industry_resume_order") {
    return "你投工业界时，简历顺序要从对方最在意的能力开始。研究和技能先撑住岗位匹配，教育背景可以往后放，不必沿用学生版格式。";
  }
  if (family === "interests_section") {
    return "Interests 这块现在多数时候不是加分项。建议把版面留给项目、技能或结果证据，除非兴趣和目标岗位有很直接的关系。";
  }
  if (family === "redundant_content_cleanup") {
    return "你这里不是经历太少，而是无关信息占了位置。建议先删掉不服务目标岗位的实习、活动或重复项目，把一页空间让给最相关的证据。";
  }
  if (family === "role_title_reframing") {
    return "你这里可以把原始 title 翻译成目标岗位更能读懂的职能语言。不是乱改经历，而是让真实工作内容更贴近 JD 的判断方式。";
  }
  if (family === "impact") {
    return "你这条 bullet 已经有材料，下一步是把结果边界写出来。数量、频率、规模或准确率不一定夸张，但要让人看出贡献大小。";
  }
  if (family === "truthfulness") {
    return withTerms("这条不是不能写，而是要写到你能解释的深度。面试被追问时，至少要说清为什么用、遇到什么问题、怎么解决。", row);
  }
  if (family === "experience") {
    return withTerms("你这段经历不是没价值，是现在还没把任务、方法和结果讲完整。建议先补出你具体做了什么，以及这件事产生了什么影响。", row);
  }
  return "你这里可以先把重点说得更具体一点。不是推倒重来，而是让读者更快看出这段经历和目标岗位之间的关系。";
}

function cardFromRow(row) {
  const generationSource = sourceTextForGeneration(row);
  return {
    ...row,
    adviceId: row.id ? `seg_${row.id}` : row.chunk_id,
    title: row.advice_card_title || row.topic || "",
    mentorInsight: generationSource,
    mentorLens: row.P_mentor || "",
    reason: row.action_summary || row.A_action || row.user_problem_summary || "",
    I_insight: "",
    hrPerspective: row.HR_os || "",
    relatedProblemTags: splitCsv(row.problem_tags),
    canonicalActionFamily: row.canonical_action_family || "",
    mentorRuleFamily: classifyMentorRow(row),
  };
}

function reviewMentor(row, mentorText) {
  const original = sourceTextForGeneration(row);
  const reviewText = detailTextForReview(row);
  const family = classifyMentorRow(row);
  const originalCategories = categoriesOf(original);
  const fullOriginalCategories = categoriesOf(reviewText);
  const proposedCategories = categoriesOf(mentorText);
  const lostCategories = originalCategories
    .filter((category) => STRONG_REVIEW_CATEGORIES.has(category))
    .filter((category) => !proposedCategories.includes(category));
  const gainedCategories = proposedCategories
    .filter((category) => STRONG_REVIEW_CATEGORIES.has(category))
    .filter((category) => !fullOriginalCategories.includes(category));
  const originalDetails = detailTermsOf(reviewText);
  const proposedDetails = detailTermsOf(mentorText);
  const lostDetails = originalDetails.filter((detail) =>
    !proposedDetails.some((item) => item.toLowerCase() === detail.toLowerCase())
  );
  const requiredSignals = requiredSignalsForReview(row);
  const lostRequiredSignals = requiredSignals.filter((signal) =>
    !hasRequiredSignalInMentor(signal, mentorText)
  );
  const flags = [];
  const reasons = [];

  if (!mentorText || mentorText.length < 18) {
    flags.push("mentor_too_short");
    reasons.push("Mentor copy is empty or too short.");
  }
  if (mentorText.length > 150) {
    flags.push("mentor_too_long");
    reasons.push("Mentor copy is longer than expected for display.");
  }
  if (lostCategories.length) {
    flags.push("lost_detail_risk");
    reasons.push(`Mentor copy no longer shows P_mentor/A_action source category signal(s): ${lostCategories.join(", ")}`);
  }
  if (gainedCategories.length >= 2 || (gainedCategories.length && !originalCategories.length)) {
    flags.push("wrong_family_risk");
    reasons.push(`Mentor copy adds category signal(s) not clearly present in source fields: ${gainedCategories.join(", ")}`);
  }
  if (lostDetails.length) {
    flags.push("lost_specific_terms");
    reasons.push(`Specific term(s) from source fields or I_insight may be missing: ${lostDetails.join(", ")}`);
  }
  if (lostRequiredSignals.length) {
    flags.push("lost_required_signal");
    reasons.push(`High-signal source term(s) missing from mentor copy: ${lostRequiredSignals.join(", ")}`);
  }
  if (MENTOR_OVERACTIVE_PATTERNS.some((pattern) => pattern.test(mentorText))) {
    flags.push("mentor_overactive_voice_risk");
    reasons.push("Mentor copy sounds like direct operation instead of advice.");
  }
  if (MENTOR_HR_VOICE_PATTERNS.some((pattern) => pattern.test(mentorText))) {
    flags.push("mentor_hr_voice_risk");
    reasons.push("Mentor copy contains HR/recruiting-screen voice instead of mentor advice.");
  }
  if (
    original.length > 120 &&
    extractConcreteTerms(row).length === 0 &&
    ["experience", "impact", "keyword_evidence", "truthfulness", "general"].includes(family)
  ) {
    flags.push("mentor_generic_template_risk");
    reasons.push("Long source fields produced a broad template without concrete retained terms.");
  }
  if (!/你|这条|这里|这块|建议|可以|先|要/.test(mentorText)) {
    flags.push("mentor_not_conversational");
    reasons.push("Mentor copy may not read like senior-schoolmate advice.");
  }
  const blockingFlags = flags.filter((flag) => BLOCKING_FLAGS.has(flag));
  const advisoryFlags = flags.filter((flag) => !BLOCKING_FLAGS.has(flag));
  const bulkSafeApproved = BULK_SAFE_MODE &&
    BULK_SAFE_FAMILIES.has(family) &&
    blockingFlags.length === 0 &&
    advisoryFlags.every((flag) => BULK_ADVISORY_FLAGS.has(flag));
  const recommendation = flags.length === 0 || bulkSafeApproved ? "approved" : "needs_review";
  const finalFlags = flags.length ? flags : ["good_as_is"];
  const finalReasons = reasons.length ? reasons : ["No mentor-only heuristic risks detected."];

  const review = {
    flags: finalFlags,
    reasons: finalReasons,
    recommendation,
    blockingFlags,
    advisoryFlags,
    bulkSafeApproved,
    bulkSafeMode: BULK_SAFE_MODE,
    sourceFieldsUsed: ["P_mentor", "A_action", "action_summary", "user_problem_summary", "H_hook", "E_example"],
    detailReviewFields: ["P_mentor", "A_action", "action_summary", "user_problem_summary", "H_hook", "E_example", "I_insight"],
    originalCategories,
    fullOriginalCategories,
    proposedCategories,
    lostCategories,
    gainedCategories,
    originalDetails,
    proposedDetails,
    lostDetails,
    requiredSignals,
    lostRequiredSignals,
  };
  review.fastLaneApproved = isFastLaneApproved(row, mentorText, review);
  return review;
}

function buildOutput(row) {
  const mentor = generateMentorInsight(row);
  const review = reviewMentor(row, mentor);
  return {
    id: row.id,
    retrieval_scope: row.retrieval_scope || "",
    topic: row.topic || "",
    mentor_rule_family: classifyMentorRow(row),
    problem_tags: row.problem_tags || "",
    title: row.advice_card_title || row.user_problem_summary || row.topic || "",
    original: {
      P_mentor: row.P_mentor || "",
      A_action: row.A_action || "",
      action_summary: row.action_summary || "",
      user_problem_summary: row.user_problem_summary || "",
      H_hook: row.H_hook || "",
      E_example: row.E_example || "",
      I_insight: row.I_insight || "",
      HR_os: row.HR_os || "",
      source_text_for_generation: sourceTextForGeneration(row),
      detail_text_for_review: detailTextForReview(row),
    },
    dbDisplay: {
      humanized_mentor_insight: row.humanized_mentor_insight || "",
      humanized_hr_perspective: row.humanized_hr_perspective || "",
      perspective_review_status: row.perspective_review_status || "",
      perspective_source: row.perspective_source || "",
      perspective_confidence: row.perspective_confidence || "",
    },
    proposed: {
      humanized_mentor_insight: mentor,
      perspective_review_status: "approved",
      perspective_source: PERSPECTIVE_SOURCE,
      perspective_confidence: 0.68,
    },
    review,
  };
}

function summarize(rows) {
  return rows.reduce((acc, row) => {
    for (const flag of row.review.flags) acc[flag] = (acc[flag] || 0) + 1;
    if (row.review.fastLaneApproved) acc.fast_lane_approved = (acc.fast_lane_approved || 0) + 1;
    if (row.review.bulkSafeApproved) acc.bulk_safe_approved = (acc.bulk_safe_approved || 0) + 1;
    return acc;
  }, {});
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function writeCsv(filePath, rows) {
  const headers = [
    "id",
    "retrieval_scope",
    "topic",
    "title",
    "mentor_rule_family",
    "recommendation",
    "fast_lane_approved",
    "bulk_safe_approved",
    "blocking_flags",
    "advisory_flags",
    "review_flags",
    "review_reasons",
    "P_mentor",
    "A_action",
    "H_hook",
    "I_insight_detail_review_only",
    "humanized_mentor_insight",
    "perspective_source",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) => [
      row.id,
      row.retrieval_scope,
      row.topic,
      row.title,
      row.mentor_rule_family,
      row.review.recommendation,
      row.review.fastLaneApproved ? "true" : "false",
      row.review.bulkSafeApproved ? "true" : "false",
      (row.review.blockingFlags || []).join("|"),
      (row.review.advisoryFlags || []).join("|"),
      row.review.flags.join("|"),
      row.review.reasons.join("|"),
      row.original.P_mentor,
      row.original.A_action,
      row.original.H_hook,
      row.original.I_insight,
      row.proposed.humanized_mentor_insight,
      row.proposed.perspective_source,
    ].map(csvCell).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

async function fetchRows(pool) {
  const params = [];
  const where = [
    `concat_ws(' ', "P_mentor", "A_action", action_summary, user_problem_summary, "H_hook", "E_example") <> ''`,
  ];
  if (!OVERWRITE) {
    where.push(`COALESCE(humanized_mentor_insight, '') = ''`);
  }
  if (SCOPE !== "all") {
    params.push(SCOPE);
    where.push(`retrieval_scope = $${params.length}`);
  }
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
       WHERE ${where.join(" AND ")}
       ORDER BY id
       ${limitSql}
       ${offsetSql}
    `,
    params
  );
  return rows;
}

function loadApprovedRowsFromFile(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  const payload = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  return rows.filter((row) => row.review && row.review.recommendation === "approved");
}

async function fetchRowsByIds(pool, ids) {
  if (!ids.length) return [];
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS}
       FROM segments
      WHERE id = ANY($1::int[])
      ORDER BY id`,
    [ids]
  );
  return rows;
}

async function backupRows(rows, backupPath) {
  const stream = fs.createWriteStream(backupPath, { flags: "a", encoding: "utf8" });
  for (const row of rows) {
    stream.write(JSON.stringify({
      id: row.id,
      old_humanized_mentor_insight: row.humanized_mentor_insight || "",
      old_perspective_review_status: row.perspective_review_status || "",
      old_perspective_source: row.perspective_source || "",
      old_perspective_confidence: row.perspective_confidence || "",
    }) + "\n");
  }
  await new Promise((resolve, reject) => {
    stream.end(resolve);
    stream.on("error", reject);
  });
}

async function applyApproved(pool, approvedRows) {
  for (let start = 0; start < approvedRows.length; start += APPLY_CHUNK_SIZE) {
    const chunk = approvedRows.slice(start, start + APPLY_CHUNK_SIZE);
    await pool.query("BEGIN");
    try {
      await pool.query(`
        CREATE TEMP TABLE IF NOT EXISTS segment_mentor_insight_rule_updates (
          id integer PRIMARY KEY,
          humanized_mentor_insight text NOT NULL,
          perspective_review_status text NOT NULL,
          perspective_source text NOT NULL,
          perspective_confidence numeric
        ) ON COMMIT DROP
      `);
      await pool.query("TRUNCATE segment_mentor_insight_rule_updates");
      const params = [];
      const values = chunk.map((item, index) => {
        params.push(
          item.id,
          item.proposed.humanized_mentor_insight,
          item.proposed.perspective_review_status,
          item.proposed.perspective_source,
          item.proposed.perspective_confidence
        );
        const offset = index * 5;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      });
      await pool.query(
        `INSERT INTO segment_mentor_insight_rule_updates
          (id, humanized_mentor_insight, perspective_review_status, perspective_source, perspective_confidence)
         VALUES ${values.join(",")}`,
        params
      );
      await pool.query(`
        UPDATE segments AS target
           SET humanized_mentor_insight = updates.humanized_mentor_insight,
               perspective_review_status = updates.perspective_review_status,
               perspective_source = updates.perspective_source,
               perspective_confidence = updates.perspective_confidence
          FROM segment_mentor_insight_rule_updates AS updates
         WHERE target.id = updates.id
           AND (${OVERWRITE ? "TRUE" : "COALESCE(target.humanized_mentor_insight, '') = ''"})
      `);
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }
}

async function main() {
  if (APPLY && LIMIT === 0 && !ALL && !APPLY_FILE) {
    throw new Error("Full apply requires --all. Use --apply --all after reviewing dry-run output.");
  }
  if (APPLY_FILE && !APPLY) {
    throw new Error("--apply-file requires --apply so reviewed artifacts cannot be written accidentally.");
  }

  const ts = timestamp();
  const resolvedOutDir = ensureDir(path.resolve(process.cwd(), OUT_DIR));
  const fullPath = path.join(resolvedOutDir, `mentor_insight_rules_${ts}.json`);
  const approvedPath = path.join(resolvedOutDir, `mentor_insight_rules_${ts}_approved.json`);
  const holdPath = path.join(resolvedOutDir, `mentor_insight_rules_${ts}_hold.json`);
  const csvPath = path.join(resolvedOutDir, `mentor_insight_rules_${ts}.csv`);
  const approvedCsvPath = path.join(resolvedOutDir, `mentor_insight_rules_${ts}_approved.csv`);
  const holdCsvPath = path.join(resolvedOutDir, `mentor_insight_rules_${ts}_hold.csv`);
  const backupPath = path.join(ensureDir(path.join(process.cwd(), "data", "backups")), `segments_mentor_insight_rules_${ts}.jsonl`);

  console.log(JSON.stringify({
    mode: APPLY ? "apply-approved" : "dry-run",
    limit: LIMIT || "all",
    scope: SCOPE,
    overwrite: OVERWRITE,
    fastLaneOnly: FAST_LANE_ONLY,
    bulkSafeMode: BULK_SAFE_MODE,
    resumeAfterId: RESUME_AFTER_ID,
    offset: START_OFFSET,
    applyChunkSize: APPLY_CHUNK_SIZE,
    applyFile: APPLY_FILE || "",
  }, null, 2));

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '30min'");
  const rows = APPLY_FILE ? [] : await fetchRows(pool);
  const outputs = APPLY_FILE ? loadApprovedRowsFromFile(APPLY_FILE) : rows.map(buildOutput);
  const approved = outputs.filter((row) =>
    row.review.recommendation === "approved" && (!FAST_LANE_ONLY || row.review.fastLaneApproved)
  );
  const hold = outputs.filter((row) =>
    row.review.recommendation !== "approved" || (FAST_LANE_ONLY && !row.review.fastLaneApproved)
  );

  fs.writeFileSync(fullPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table: "vibe_offer.segments",
    dryRun: !APPLY,
    rows: outputs,
    reviewSummary: summarize(outputs),
  }, null, 2) + "\n", "utf8");
  fs.writeFileSync(approvedPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table: "vibe_offer.segments",
    rows: approved,
    reviewSummary: summarize(approved),
  }, null, 2) + "\n", "utf8");
  fs.writeFileSync(holdPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table: "vibe_offer.segments",
    rows: hold,
    reviewSummary: summarize(hold),
  }, null, 2) + "\n", "utf8");
  writeCsv(csvPath, outputs);
  writeCsv(approvedCsvPath, approved);
  writeCsv(holdCsvPath, hold);

  console.log(JSON.stringify({
    rows: outputs.length,
    approvedRows: approved.length,
    holdRows: hold.length,
    reviewSummary: summarize(outputs),
    fullPath,
    approvedPath,
    holdPath,
    csvPath,
    approvedCsvPath,
    holdCsvPath,
    applied: APPLY,
  }, null, 2));

  if (!APPLY) {
    console.log("Dry run only. Re-run with --apply to write approved rows only.");
    return;
  }

  const backupSourceRows = APPLY_FILE
    ? await fetchRowsByIds(pool, approved.map((item) => Number(item.id)).filter(Number.isFinite))
    : approved.map((item) => rows.find((row) => Number(row.id) === Number(item.id))).filter(Boolean);
  await backupRows(backupSourceRows, backupPath);
  console.log(`backup=${backupPath}`);
  await applyApproved(pool, approved);
  console.log(`applied=${approved.length}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  PERSPECTIVE_SOURCE,
  sourceTextForGeneration,
  detailTextForReview,
  cardFromRow,
  classifyMentorRow,
  extractConcreteTerms,
  generateMentorInsight,
  reviewMentor,
  isFastLaneApproved,
  buildOutput,
};
