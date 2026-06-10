"use strict";

/**
 * mentor_insight_templates.js
 *
 * 人工撰写的导师视角模板库（简体中文）。
 *
 * 导师视角定义：
 *   - 表达这条建议背后的原则，适用于任何遇到类似问题的学生
 *   - 不引用原始学生的具体情境（P_mentor 是针对当时那个学生的）
 *   - 语气：已工作 5 年的学长姐提醒学弟妹，口语、具体、有人味
 *   - 字数：40-70 中文字
 *   - 禁：HR / 招聘 / 面试官 / 你这个项目 / 我会帮你
 *
 * Variant function 签名：
 *   (row, terms, ctx) => string | null
 *   - row   : 完整 DB row
 *   - terms : extractConcreteTerms(row) 的结果（工具名数组，最多 5 个）
 *   - ctx   : { source: string, family: string, roles: string }
 *   - 返回 null 代表「此 variant 不适用本 row」，让下一个接
 *
 * pickVariant 使用 row.id % candidates.length 做确定性选择：
 *   同一 row 永远选到同一 variant，但不同 row 之间会分散。
 */

// ── Variant helper ─────────────────────────────────────────────────────────────
function pickVariant(variants, row, terms, ctx) {
  const candidates = [];
  for (const fn of variants) {
    const result = fn(row, terms, ctx);
    if (result !== null && result !== undefined && String(result).trim()) {
      candidates.push(String(result).trim());
    }
  }
  if (!candidates.length) return null;
  const idx = (Number(row.id) || 0) % candidates.length;
  return candidates[idx];
}

// ── Template groups ────────────────────────────────────────────────────────────

/**
 * keyword
 * Families: keyword, jd_language_alignment
 * 关键词要跟 JD 原文一致，不要换同义词
 */
const keyword = [
  function kw1(row, terms, ctx) {
    if (!terms.length) return null;
    const t = terms.slice(0, 2).join("、");
    return `JD 里的关键词要原文照用，像 ${t} 这类词，换个说法就可能对应不上。建议对着 JD 逐条检查，把一致的词直接放进简历。`;
  },
  function kw2(row, terms, ctx) {
    return `把 JD 里出现的技能词直接对应着放进简历，不要换同义词替代。原词照用，匹配度才不会因为用词不同而打折。`;
  },
];

/**
 * keyword_evidence
 * Families: keyword_evidence, skills_only
 * 技能列了但没有在 bullet 里印证
 */
const keyword_evidence = [
  function kwEv1(row, terms, ctx) {
    if (!terms.length) return null;
    const t = terms.slice(0, 2).join("、");
    return `技能栏列了 ${t} 但 bullet 里没有印证，读起来像是背单词。建议挑一两条 bullet 说清楚用它做了什么，才算真的展示了能力。`;
  },
  function kwEv2(row, terms, ctx) {
    return `技能清单让关键词被看到，但没有 bullet 印证就很难判断真实程度。可以把最熟的工具写进一两条实际经历，说清楚解决了什么问题。`;
  },
];

/**
 * skills_grouping
 * Families: skills_grouping, skills_frontload, skills_structure
 * 技能栏分类不清或排序不对
 */
const skills_grouping = [
  function sg1(row, terms, ctx) {
    return `技能栏把所有工具混在一起，很难一眼看出重点。建议按类分组——Languages、Frameworks、Tools、Databases——读起来清楚很多，也显得更有条理。`;
  },
  function sg2(row, terms, ctx) {
    return `技能栏的排序会影响第一印象。建议把最核心、最强的工具放最前面，弱一点的放后面或删掉，别让重要的词被埋在中间。`;
  },
];

/**
 * impact
 * Families: impact, business_value_framing, quantified_formula
 * 缺量化或业务影响
 */
const impact = [
  function imp1(row, terms, ctx) {
    if (/business|revenue|cost|profit|efficiency|业务|业绩|节省|成本|利润/i.test(ctx.source)) {
      return `技术做了什么不够，还要说清楚对业务有什么影响——省了多少成本、提升了多少效率、影响了多少人。建议在 bullet 结尾加上业务结果，这才是让经历有说服力的地方。`;
    }
    return null;
  },
  function imp2(row, terms, ctx) {
    return `bullet 里没有数字，很难让人判断贡献的大小。建议加上规模感——多少用户、多少数据量、提升了多少，就算是估算的数字也比没有强。`;
  },
  function imp3(row, terms, ctx) {
    return `每条 bullet 最好能回答「这件事为什么重要」。可以用数字或具体的影响来收尾，比只描述做了什么更有力，读的人才能判断贡献有多大。`;
  },
];

/**
 * experience
 * Families: experience, core_contribution_first, ownership_voice
 * bullet 结构不清、ownership 不足
 */
const experience = [
  function exp1(row, terms, ctx) {
    if (/assisted|helped|participated|支持|协助|配合/i.test(ctx.source)) {
      return `bullet 开头的动词很重要，用 Led、Designed、Built 这类主动词，比 Assisted、Participated 更能展示你有多少 ownership。建议逐条检查，把被动的词换掉。`;
    }
    return null;
  },
  function exp2(row, terms, ctx) {
    return `一条好的 bullet 要说清楚三件事：做了什么、怎么做的、结果是什么。建议先补出任务和方法，再加结果，只写职责描述读起来像 job description 不像成就。`;
  },
  function exp3(row, terms, ctx) {
    return `每条 bullet 要让人看完就知道「这个人在这件事上的贡献是什么」。建议越具体越好，空泛的描述读多了会被跳过，读的人记不住你做了什么。`;
  },
];

/**
 * truthfulness
 * Families: truthfulness, skill_truthfulness*, hardware_truthfulness, metric_truthfulness
 * 写了但说不清楚
 */
const truthfulness = [
  function tr1(row, terms, ctx) {
    if (terms.length) {
      const t = terms[0];
      return `简历里的技能要能在面试里说清楚。像 ${t} 这样的工具，如果被追问怎么用、遇过什么问题，要答得上来。说不上来的，建议改成「了解」更诚实，也更安全。`;
    }
    return null;
  },
  function tr2(row, terms, ctx) {
    if (/数字|metric|number|量化|指标|\d+%|\d+ user/i.test(ctx.source)) {
      return `简历上的数字要能说清楚怎么来的。是估算的还是实际追踪的，面试被追问时要能展开说。建议每个数字都先想一遍——答不出来的就先不放。`;
    }
    return null;
  },
  function tr3(row, terms, ctx) {
    return `把简历当成面试的起点，写下去的每件事都要能说清楚。建议用这个标准检查一遍：如果被问到怎么做的，能不能流畅展开？不能的地方要么补充细节，要么调整写法。`;
  },
];

/**
 * positioning
 * Families: positioning, multi_version_resume, role_title_reframing
 * 方向不清或一份简历投太多方向
 */
const positioning = [
  function pos1(row, terms, ctx) {
    if (/多.*方向|multiple.*direction|不同.*版本|两个方向|多版|SDE.*DS|DS.*SDE|BA.*DS|DS.*BA/i.test(ctx.source)) {
      return `一份简历同时投差异很大的方向，很容易让人看不清楚目标。建议按方向分版本，每个版本只服务一种岗位，这样重点才能突出，读的人也更容易判断。`;
    }
    return null;
  },
  function pos2(row, terms, ctx) {
    if (/转型|career change|switch|转换/i.test(ctx.source)) {
      return `换方向不代表要重写所有经历，而是要重新选哪些经历值得放、哪些细节值得强调。建议同一段实习换个角度说，展示的能力就可以完全不同。`;
    }
    return null;
  },
  function pos3(row, terms, ctx) {
    return `简历的角色是让看的人快速判断「这个人适不适合这个岗位」。建议每一份都要有清楚的定位，不能让人看完还猜你在找什么。`;
  },
];

/**
 * format
 * Families: format, page_overflow, date_format, pdf_submission, document_rebuild
 * 排版、页数、格式问题
 */
const format = [
  function fmt1(row, terms, ctx) {
    if (/page|页|超过|overflow|一页以上|two page/i.test(ctx.source)) {
      return `内容多不代表要超过一页。建议把没有加分的内容删掉，比压缩字型或缩小边距更有效，版面也更好读，重点才容易被看到。`;
    }
    return null;
  },
  function fmt2(row, terms, ctx) {
    if (/pdf|word|format|排版|跑版|格式/i.test(ctx.source)) {
      return `简历存成 PDF 前要先确认排版有没有跑掉。建议用 PDF 阅读器检查一遍，投出去的格式要跟你看到的一样，不要到了对方那边乱掉。`;
    }
    return null;
  },
  function fmt3(row, terms, ctx) {
    return `排版清不清楚影响第一印象。建议字型一致、对齐整齐、留白够用，读起来舒服的简历更容易被读完，重点也更容易被找到。`;
  },
];

/**
 * education
 * Families: education, coursework_translation, industry_resume_order
 * 课程、GPA、教育背景排序
 */
const education = [
  function edu1(row, terms, ctx) {
    if (/coursework|课程|relevant course/i.test(ctx.source)) {
      return `课程栏位不要什么都列，建议只放和目标岗位直接相关的 3-5 门。列太多反而显得没有重点，让人觉得是在凑字数，重要的课反而被淹没了。`;
    }
    return null;
  },
  function edu2(row, terms, ctx) {
    return `教育背景的排版要从最高学历开始。GPA 够高就放，不够高可以省略——建议没有 GPA 比放一个不理想的分数更好，免得第一眼就留下负面印象。`;
  },
];

/**
 * project_depth
 * Families: project_depth_chain, project_name_specificity, hardware_project_proof
 * 项目描述太浅或太模糊
 */
const project_depth = [
  function pd1(row, terms, ctx) {
    if (/personal project|课程作业|course project|class project|学校项目/i.test(ctx.source)) {
      return `项目的名称要具体，说清楚是什么类型的系统或工具，不只是「个人项目」或「课程作业」。建议有名字、有用途，读起来才有真实感，也才值得放进简历。`;
    }
    return null;
  },
  function pd2(row, terms, ctx) {
    return `好的项目 bullet 要说三件事：做了什么产品、用了什么技术、最后达到什么效果。建议不只写技术栈，还要说清楚背后要解决什么问题，才能展示理解深度。`;
  },
  function pd3(row, terms, ctx) {
    return `项目经历最容易流于表面描述。建议让人看完能理解这个项目的规模、你的具体贡献，以及最终交付了什么，这三点说清楚了才算一条好的项目 bullet。`;
  },
];

/**
 * analytics
 * Families: analytics_visualization_evidence, analytics_method_truthfulness, research_to_analytics
 * 分析类：只说工具，不说洞察和影响
 */
const analytics = [
  function ana1(row, terms, ctx) {
    if (terms.length) {
      const t = terms.slice(0, 2).join("、");
      return `分析类经历要说清楚用了什么方法、处理了什么数据、产出了什么洞察。建议不只写「用 ${t} 分析数据」，要说分析了什么、发现了什么、影响了什么决策。`;
    }
    return null;
  },
  function ana2(row, terms, ctx) {
    return `数据分析的 bullet 最常见的问题是只说工具，不说结论。建议把分析流程、用到的方法和最后的洞察都写进去，才能展示真正的分析能力，而不只是会用工具。`;
  },
];

/**
 * rag_llm
 * Families: rag_chatbot_evaluation, rag_evaluation, multi_agent
 * LLM/RAG 项目：没有 evaluation
 */
const rag_llm = [
  function rl1(row, terms, ctx) {
    if (/rag|retrieval|chatbot|llm|评估|evaluation|faithfulness/i.test(ctx.source)) {
      return `LLM 或 RAG 项目很多人都在做，差异化在于 evaluation。建议写清楚有没有评估回答品质、怎么衡量系统表现、处理了哪些失败案例——这些才是真正展示能力的地方。`;
    }
    return null;
  },
  function rl2(row, terms, ctx) {
    return `AI 相关项目要说清楚做的不只是「接了一个 API」。建议写出架构设计、评估指标、迭代过程，这样才能和只是 demo 的项目区分开，让人看出你真的做了工程。`;
  },
];

/**
 * finance
 * Families: finance_accounting_positioning, cpa_eligibility, metric_terminology
 * 财务/会计：资格信号、专业术语
 */
const finance = [
  function fin1(row, terms, ctx) {
    if (/cpa|150|eligible|会计|accounting|audit|审计/i.test(ctx.source)) {
      return `会计和财务类岗位很看重技术资格。建议把 CPA eligible 状态、150 学分、考试进度主动写清楚，不要让对方自己去猜，这些信息直接影响岗位匹配。`;
    }
    return null;
  },
  function fin2(row, terms, ctx) {
    return `财务类的 bullet 要用行业里的标准用词。建议用 DCF、variance analysis、reconciliation 这类词，对行业人来说是专业信号，用对了让人觉得你真的懂这个领域。`;
  },
];

/**
 * portfolio
 * Families: portfolio_quality, portfolio_link, ux_research_portfolio, ai_portfolio_priority
 * 作品集：链接失效、展示不清楚
 */
const portfolio = [
  function port1(row, terms, ctx) {
    if (/link|链接|url|website|点开|加载/i.test(ctx.source)) {
      return `作品集的链接要能点开、要快速加载，不然等于没放。建议进去第一眼就能看到最好的作品，不要让人去找，访问体验很影响第一印象。`;
    }
    return null;
  },
  function port2(row, terms, ctx) {
    return `作品集不是展示所有东西，而是展示最能代表当前水平的 3-5 个作品。建议质量比数量重要，放一个不够好的进去反而有反效果，不如删掉。`;
  },
];

/**
 * portfolio_research_artifact
 * Families: portfolio_research_artifact, paper, research_publication
 * 有论文/研究成果：要标清楚贡献和状态
 */
const portfolio_research_artifact = [
  function pra1(row, terms, ctx) {
    if (/paper|论文|publication|published|journal|conference/i.test(ctx.source)) {
      return `有发表过的论文或研究成果要标清楚：主题是什么、你的贡献是什么、发表在哪里或什么状态。建议别让看的人自己去猜这个研究的分量。`;
    }
    return null;
  },
  function pra2(row, terms, ctx) {
    return `研究成果进简历，最重要的是让人看完能理解这个研究解决了什么问题、你在里面扮演什么角色。建议不需要学术式的摘要，一句话说清楚就够，读起来更直接。`;
  },
];

/**
 * links_contact
 * Families: profile_links, contact_info_format, work_authorization
 * 联系信息和工作授权
 */
const links_contact = [
  function lc1(row, terms, ctx) {
    if (/opt|cpt|visa|h-?1b|sponsor|工签|身份/i.test(ctx.source)) {
      return `工作授权状态是很多公司提前筛选的条件。建议把 OPT/CPT 的时效、是否需要 sponsor 写清楚，越早说清楚越好，避免流程中间才发现有问题。`;
    }
    return null;
  },
  function lc2(row, terms, ctx) {
    return `联系信息要放对、放够，但不用放太多。建议邮件和 LinkedIn 是必要的，确认链接是对的、资料是最新的，格式一致就好，不用花太多版面在这里。`;
  },
];

/**
 * redundancy
 * Families: redundant_content_cleanup, space_reallocation, interests_section
 * 冗余内容：高中、兴趣、不相关的东西
 */
const redundancy = [
  function red1(row, terms, ctx) {
    if (/高中|high school|兴趣|interest|hobby|hobbies/i.test(ctx.source)) {
      return `版面是有限的，每一行都要值得放。建议把高中活动、和岗位无关的兴趣爱好清掉，空出来的版面用来补强核心经历的细节，这样更划算。`;
    }
    return null;
  },
  function red2(row, terms, ctx) {
    return `建议把和目标岗位关联不大的内容清掉，空出来的版面用来补强核心经历的细节。每一行都要问自己：这行让我的目标更清楚了吗？没有的就可以删。`;
  },
];

/**
 * research
 * Families: research_publication, research_industry_positioning
 * 研究背景转业界
 */
const research = [
  function res1(row, terms, ctx) {
    if (/研究院|lab|academia|论文|publication|conference/i.test(ctx.source)) {
      return `科研经历进业界简历，重点是说清楚研究解决了什么问题、用了什么方法、有没有可量化的产出。建议不需要学术摘要式的描述，直接说做了什么和影响是什么。`;
    }
    return null;
  },
  function res2(row, terms, ctx) {
    return `研究背景转业界，要把研究过程翻译成业界语言。建议用问题分析、数据处理、方法选择、结论呈现这几个维度来重写，这些都是业界也需要的能力，直接展示出来就好。`;
  },
];

/**
 * marketing
 * Families: channel_marketing_scope, social_media_metrics, customer_segment_framing
 * 营销：缺指标、缺受众定义
 */
const marketing = [
  function mkt1(row, terms, ctx) {
    if (/impression|reach|engagement|conversion|触及|转化|互动|粉丝/i.test(ctx.source)) {
      return `营销类 bullet 要有指标。建议至少一两条要有数字来说明规模和效果——触及人数、参与率、转化率，有了这些才能让人判断这个活动的实际分量。`;
    }
    return null;
  },
  function mkt2(row, terms, ctx) {
    return `营销经历要说清楚：服务了哪类用户、做了什么活动、用了什么渠道、最后达到什么效果。建议越具体越好，这样才能展示你的营销判断力，而不只是执行力。`;
  },
];

/**
 * career_strategy
 * Families: contract_path_strategy, work_authorization
 * 求职策略：签证、多方向
 */
const career_strategy = [
  function cs1(row, terms, ctx) {
    if (/opt|cpt|visa|h-?1b|sponsor|工签|留美/i.test(ctx.source)) {
      return `工作授权的限制会影响可以投的岗位范围。建议把能投的公司类型和岗位方向想清楚，再针对那些点补强简历，比撒网投更有效，也更能打出差异化。`;
    }
    return null;
  },
  function cs2(row, terms, ctx) {
    return `转换赛道或找第一份全职工作，策略比努力更重要。建议搞清楚目标岗位真正需要什么，然后针对那些点去补强，比什么都做一点效果好很多。`;
  },
];

/**
 * interview
 * Families: interview_prep_depth, company_interview_strategy
 * 面试准备
 */
const interview = [
  function int1(row, terms, ctx) {
    if (/面试|interview|behavioral|star|准备/i.test(ctx.source)) {
      return `面试准备不能只是背答案。建议把自己每段经历都整理成能展开说的故事，被追问的时候才不会答不上来，临时想反而容易乱。`;
    }
    return null;
  },
  function int2(row, terms, ctx) {
    return `好的面试准备包括：研究公司、理解岗位需求、准备 2-3 个能说清楚的经历故事。建议先准备到能说清楚「为什么是这家公司这个岗位」，基本盘就稳了。`;
  },
];

/**
 * engineering
 * Families: engineering_tool_depth, controls_engineering_depth, cloud_platform_positioning
 * 工程类：工具深度、系统设计
 */
const engineering = [
  function eng1(row, terms, ctx) {
    if (terms.length) {
      const t = terms[0];
      return `工程类岗位很看重工具的使用深度。建议不只写「用过 ${t}」，要说清楚用了哪些功能、解决了什么问题、有没有在真实系统跑过，这样才有说服力。`;
    }
    return null;
  },
  function eng2(row, terms, ctx) {
    return `工程师的 bullet 要能说明技术选型的理由。建议写清楚为什么选这个方案、它解决了什么问题，这些细节才是展示工程判断力的地方，比只列技术栈更有价值。`;
  },
];

/**
 * product
 * Families: product_business_framing, process_efficiency_reframing
 * 产品/流程：从问题出发，说业务逻辑
 */
const product = [
  function prod1(row, terms, ctx) {
    if (/流程|process|efficiency|效率|改善|optimization/i.test(ctx.source)) {
      return `流程改善类的经历要从问题出发：之前是什么情况、为什么需要改、改了之后有什么不同。建议不只说「优化了流程」，要让人判断贡献到底有多大。`;
    }
    return null;
  },
  function prod2(row, terms, ctx) {
    return `做过的工作要从「对谁有价值、有多大价值」的角度来包装。建议技术细节写完之后，补一句背后的业务逻辑，这样读的人才能判断你的判断力，而不只是执行力。`;
  },
];

/**
 * niche
 * Families: onboarding_analysis, data_project_relevance
 * 数据项目和业界的相关性
 */
const niche = [
  function nic1(row, terms, ctx) {
    if (/onboarding|入职|新员工|业务分析|business analysis/i.test(ctx.source)) {
      return `业务分析类的项目要说清楚你分析的问题是什么、对业务有什么意义，以及你的发现影响了什么决策。建议这三点写清楚了，才能展示分析背后的业务判断。`;
    }
    return null;
  },
  function nic2(row, terms, ctx) {
    return `每段经历放进简历前要先想一下：对这个岗位来说，这段经历说明了什么能力？建议说不清楚的就重新包裝一下，或者考虑是否值得放。`;
  },
];

/**
 * general
 * 通用 fallback，适用所有 family
 */
const general = [
  function gen1(row, terms, ctx) {
    if (terms.length) {
      const t = terms[0];
      return `这条建议的核心是让每一行都能说服读的人「这个人有这个能力」。建议像 ${t} 这样的工具要在 bullet 里有印证，说清楚用它做了什么，才算展示了能力。`;
    }
    return null;
  },
  function gen2(row, terms, ctx) {
    return `简历修改不是推倒重来，而是找到现有经历和目标岗位之间的连结，用对方能理解的语言说清楚。建议每一行都要让目标更清楚一点，多余的就删掉。`;
  },
  function gen3(row, terms, ctx) {
    return `好的简历不是展示你做过什么，而是让看的人快速判断你能做什么。建议具体、量化、有针对性，这是让每条 bullet 更有力的三个方向，可以逐条对照检查。`;
  },
];

// ── TEMPLATE_GROUPS ────────────────────────────────────────────────────────────
const TEMPLATE_GROUPS = {
  keyword,
  keyword_evidence,
  skills_grouping,
  impact,
  experience,
  truthfulness,
  positioning,
  format,
  education,
  project_depth,
  analytics,
  rag_llm,
  finance,
  portfolio,
  portfolio_research_artifact,
  links_contact,
  redundancy,
  research,
  marketing,
  career_strategy,
  interview,
  engineering,
  product,
  niche,
  general,
};

// ── FAMILY_GROUP_MAP ───────────────────────────────────────────────────────────
const FAMILY_GROUP_MAP = {
  keyword:                        "keyword",
  jd_language_alignment:          "keyword",

  keyword_evidence:               "keyword_evidence",
  skills_only:                    "keyword_evidence",

  skills_grouping:                "skills_grouping",
  skills_frontload:               "skills_grouping",
  skills_structure:               "skills_grouping",

  impact:                         "impact",
  business_value_framing:         "impact",
  quantified_formula:             "impact",
  metric_terminology:             "impact",

  experience:                     "experience",
  core_contribution_first:        "experience",
  ownership_voice:                "experience",

  truthfulness:                   "truthfulness",
  skill_truthfulness:             "truthfulness",
  skill_truthfulness_linux:       "truthfulness",
  hardware_truthfulness:          "truthfulness",
  instrumentation_truthfulness:   "truthfulness",
  analytics_method_truthfulness:  "truthfulness",
  metric_truthfulness:            "truthfulness",
  intern_scope_truthfulness:      "truthfulness",
  title_role_truthfulness:        "truthfulness",

  positioning:                    "positioning",
  multi_version_resume:           "positioning",
  role_title_reframing:           "positioning",
  cross_industry_language:        "positioning",

  format:                         "format",
  page_overflow:                  "format",
  date_format:                    "format",
  word_ruler_format:              "format",
  pdf_submission:                 "format",
  document_rebuild:               "format",
  title_bullet_format:            "format",

  education:                      "education",
  coursework_translation:         "education",
  industry_resume_order:          "education",

  project_depth_chain:            "project_depth",
  project_name_specificity:       "project_depth",
  hardware_project_proof:         "project_depth",
  project_capability_map:         "project_depth",
  project_differentiation:        "project_depth",
  dual_track_project:             "project_depth",

  analytics_visualization_evidence: "analytics",
  research_to_analytics:            "analytics",

  rag_chatbot_evaluation:         "rag_llm",
  rag_evaluation:                 "rag_llm",
  multi_agent:                    "rag_llm",

  finance_accounting_positioning: "finance",
  cpa_eligibility:                "finance",

  portfolio_quality:              "portfolio",
  portfolio_link:                 "portfolio",
  ux_research_portfolio:          "portfolio",
  ai_portfolio_priority:          "portfolio",

  portfolio_research_artifact:    "portfolio_research_artifact",
  research_publication:           "portfolio_research_artifact",

  profile_links:                  "links_contact",
  contact_info_format:            "links_contact",
  work_authorization:             "links_contact",

  redundant_content_cleanup:      "redundancy",
  space_reallocation:             "redundancy",
  interests_section:              "redundancy",
  leadership_relevance:           "redundancy",
  acronym_explanation:            "redundancy",

  research_industry_positioning:  "research",
  research_role_fit:              "research",

  channel_marketing_scope:        "marketing",
  dual_marketing_version:         "marketing",
  social_media_metrics:           "marketing",
  customer_segment_framing:       "marketing",

  contract_path_strategy:         "career_strategy",

  interview_prep_depth:           "interview",
  company_interview_strategy:     "interview",

  engineering_tool_depth:         "engineering",
  controls_engineering_depth:     "engineering",
  cloud_platform_positioning:     "engineering",

  product_business_framing:       "product",
  process_efficiency_reframing:   "product",
  management_kpi_story:           "product",

  onboarding_analysis:            "niche",
  data_project_relevance:         "niche",
  template_differentiation:       "niche",

  general:                        "general",
};

// ── resolveGroup ───────────────────────────────────────────────────────────────
function resolveGroup(family) {
  if (!family) return "general";
  if (FAMILY_GROUP_MAP[family]) return FAMILY_GROUP_MAP[family];
  // substring fallbacks
  if (/truth/i.test(family))              return "truthfulness";
  if (/portfolio/i.test(family))          return "portfolio";
  if (/keyword/i.test(family))            return "keyword_evidence";
  if (/format|page|layout/i.test(family)) return "format";
  if (/impact|business.*value/i.test(family)) return "impact";
  if (/skill/i.test(family))              return "skills_grouping";
  if (/project/i.test(family))            return "project_depth";
  if (/research/i.test(family))           return "research";
  if (/finance|accounting/i.test(family)) return "finance";
  if (/rag|llm|chatbot/i.test(family))    return "rag_llm";
  if (/analytics|visualization/i.test(family)) return "analytics";
  if (/engineer/i.test(family))           return "engineering";
  return "general";
}

// ── exports ────────────────────────────────────────────────────────────────────
module.exports = {
  TEMPLATE_GROUPS,
  FAMILY_GROUP_MAP,
  resolveGroup,
  pickVariant,
};
