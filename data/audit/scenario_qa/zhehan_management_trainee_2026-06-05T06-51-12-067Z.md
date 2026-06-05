# Zhehan / Management Trainee Scenario QA

- Status: FAIL
- Total advice: 6
- Free advice: 3
- Paid advice: 3
- Forbidden hits: 0
- Duplicate family violations: 0
- Same family/depth violations: 0

## 1. 把术语改成 JD 语言
- id: seg_10212
- source: db_adapted
- family/depth: summary_positioning / delivery
- mode: raw
- pass: true
- current: 简历与目标 JD 的关键词匹配偏低（当前 4/23），ATS 扫描时匹配信号不够强，容易在第一轮被过滤。
- action: 将简历中不熟悉的行业词汇（如石油相关术语）删除，并根据目标岗位所属行业替换对应关键词，例如投递 realty 岗位则改为 realty，投递 energy 岗位则改为 energy。
- mentor: 简历应随投递方向灵活调整行业关键词，使用不熟悉领域的术语反而会在面试中造成风险，删除后以目标行业词替换既安全又能提升匹配度。
- HR: HR 初筛其实很看 JD 原词；核心技能没出现，我很难放心把你推进下一轮。

## 2. 把项目证据写进 bullet
- id: seg_11766
- source: db_adapted
- family/depth: experience_evidence / diagnose
- mode: raw
- pass: true
- current: 经历描述里可量化结果不足，HR 很难判断你具体带来了什么影响或产出。
- action: 在每条bullet中补充两个要素：①量化成果（impact），说明工作产生了什么效果、是否被认可；②行业背景（context），注明项目所属治疗领域或业务场景，帮助recruiter快速判断岗位匹配度。
- mentor: Recruiter阅读简历时，仅凭动作描述无法评估你价值；缺少impact等于让HR自行脑补结果，风险极高。行业背景信息尤其关键——若公司专注oncology，你未注明自己的cardiovascular经验，可能被直接错过。
- HR: 经历如果只写做了什么，我很难判断你做得多深、成果多大、是否值得面试。

## 3. 整理 Skills 关键词
- id: seg_12248
- source: db_adapted
- family/depth: jd_keyword_alignment / rewrite
- mode: raw
- pass: true
- current: 目标岗位的核心技能词（如 problem-solving、strategic planning、process improvement）在简历中出现不足，ATS 难以确认你的技能匹配度。
- action: 将所有掌握的语言加入简历，按熟练程度注明 fluent 或 native，例如：Native in Mandarin, Native in Chaoshan, Fluent in English，确保所有语言能力均有体现。
- mentor: 多语言能力在求职中是加分项，尤其对于需要跨文化沟通的岗位，HR 看到你会多种语言会留下更深印象，应在简历中完整呈现。
- HR: 关键词不是堆给机器看的，它也帮我快速确认你是不是这类岗位的直接人选。

## 4. 补上目标岗位原词
- id: seg_872
- source: db_adapted
- family/depth: summary_positioning / rewrite
- mode: raw
- pass: true
- current: 简历整体对"Management Trainee"的方向匹配度偏弱，需要更系统地对照 JD 调整定位和关键词。
- action: 先把 Summary / Objective 改成目标岗位导向：写出目标岗位原词，并用一句话连接你已有经历与 JD 的核心职责。
- mentor: 简历开头要先帮招聘方判断方向。定位清楚后，后面的项目、技能和经历才会被放在正确语境里理解。
- HR: 如果一条经历缺少上下文和结果，我会先把它当成弱信号，除非你能给出更具体的证据。

## 5. 补齐可验证资料入口
- id: fb_obligation_weakdimensionb
- source: fallback
- family/depth: experience_evidence / evidence
- mode: raw
- pass: false
- current: 基本资料完整性维度偏低，需要补齐联系方式、链接、教育或日期等基础可信信息。
- action: 在简历头部补齐邮箱、电话、LinkedIn；技术或项目相关岗位补 GitHub / portfolio / project link，并确保链接可点击。
- mentor: ATS 和 HR 都会优先读取简历头部的联系方式与可验证链接，缺失会降低可信度和后续联系效率。
- HR: 

## 6. 把关键词嵌入经历 bullet
- id: seg_4425
- source: db_adapted
- family/depth: jd_keyword_alignment / evidence
- mode: raw
- pass: true
- current: 简历与目标 JD 的关键词匹配偏低（当前 4/23），ATS 扫描时匹配信号不够强，容易在第一轮被过滤。
- action: 将当前实习岗位职责描述输入GPT，同时粘贴目标JD信息，让GPT辅助润色简历；但最终内容必须以你实际经历为准，不可脱离真实情况
- mentor: 用GPT润色简历时，必须以你真实经历为基础，过度美化或捏造经历虽然短期看起来更好，但不符合现实，在面试中会被识破
- HR: HR 初筛其实很看 JD 原词；核心技能没出现，我很难放心把你推进下一轮。
