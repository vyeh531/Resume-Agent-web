# Zhehan / Management Trainee Scenario QA

- Status: PASS
- Total advice: 12
- Free advice: 3
- Paid advice: 9
- Forbidden hits: 0
- Duplicate family violations: 0
- Same family/depth violations: 0

## 1. 优化 Summary 岗位定位
- id: seg_10212
- source: db_adapted
- family/depth: summary_positioning / delivery
- mode: generalized
- pass: true
- current: 简历与目标 JD 的关键词匹配偏低（当前 4/23），ATS 扫描时匹配信号不够强，容易在第一轮被过滤。
- action: 先把 Summary / Objective 改成目标岗位导向：写出目标岗位原词，并用一句话连接你已有经历与 JD 的核心职责。
- mentor: 简历开头要先帮招聘方判断方向。定位清楚后，后面的项目、技能和经历才会被放在正确语境里理解。
- HR: 如果一条经历缺少上下文和结果，我会先把它当成弱信号，除非你能给出更具体的证据。

## 2. 优化 Summary 岗位定位
- id: seg_21651
- source: db_adapted
- family/depth: summary_positioning / proof
- mode: generalized
- pass: true
- current: 经历描述里可量化结果不足，HR 很难判断你具体带来了什么影响或产出。
- action: 先把 Summary / Objective 改成目标岗位导向：写出目标岗位原词，并用一句话连接你已有经历与 JD 的核心职责。
- mentor: 简历开头要先帮招聘方判断方向。定位清楚后，后面的项目、技能和经历才会被放在正确语境里理解。
- HR: 如果一条经历缺少上下文和结果，我会先把它当成弱信号，除非你能给出更具体的证据。

## 3. 补齐 JD 关键词证据
- id: seg_20294
- source: db_adapted
- family/depth: jd_keyword_alignment / rewrite
- mode: generalized
- pass: true
- current: 目标岗位的核心技能词（如 problem-solving、strategic planning、process improvement）在简历中出现不足，ATS 难以确认你的技能匹配度。
- action: 对照 JD 提取真实掌握的核心关键词，把它们分配到 Summary、Skills 和最相关的 Experience bullet 中。
- mentor: 关键词只有放进真实经历里才有说服力。把 JD 里的能力要求转成项目或工作证据，比单纯堆词更容易通过人工筛选。
- HR: 关键词不是写给系统看的摆设；如果经历里没有对应证据，我会怀疑你只是照着 JD 填词。

## 4. 补齐可验证资料入口
- id: fb_obligation_weakdimensionb
- source: fallback
- family/depth: experience_evidence / evidence
- mode: generalized
- pass: true
- current: 基本资料完整性维度偏低，需要补齐联系方式、链接、教育或日期等基础可信信息。
- action: 在简历头部补齐邮箱、电话、LinkedIn；技术或项目相关岗位补 GitHub / portfolio / project link，并确保链接可点击。
- mentor: ATS 和 HR 都会优先读取简历头部的联系方式与可验证链接，缺失会降低可信度和后续联系效率。
- HR: 

## 5. 强化 bullet 的量化结果
- id: fb_obligation_weakdimensionc
- source: fallback
- family/depth: experience_evidence / rewrite
- mode: raw
- pass: true
- current: 内容质量与成果表达维度偏低，需要把经历改成动作、方法/工具和量化结果结构。
- action: 将核心 bullet 改成「动作 + 方法/工具 + 量化结果」：例如处理多少请求/工单、维护多少设备或系统、降低多少故障率、提升多少响应效率。
- mentor: HR 看经历 bullet 时会快速找影响、规模和结果；只有职责描述会让贡献显得模糊。
- HR: 

## 6. 补齐 JD 关键词证据
- id: seg_21576
- source: db_adapted
- family/depth: jd_keyword_alignment / diagnose
- mode: generalized
- pass: true
- current: Summary 段落与目标岗位"Management Trainee"的定位关联不够直接，HR 初筛时难以快速识别你的求职方向。
- action: 对照 JD 提取真实掌握的核心关键词，把它们分配到 Summary、Skills 和最相关的 Experience bullet 中。
- mentor: 关键词只有放进真实经历里才有说服力。把 JD 里的能力要求转成项目或工作证据，比单纯堆词更容易通过人工筛选。
- HR: 关键词不是写给系统看的摆设；如果经历里没有对应证据，我会怀疑你只是照着 JD 填词。

## 7. 把职责描述改成结果表达
- id: fb_quantified_impact
- source: fallback
- family/depth: quantified_impact / proof
- mode: raw
- pass: true
- current: 当前经历里有任务，但缺少能判断贡献的数字或结果，影响内容说服力。
- action: 挑 2–3 条最核心经历，补上处理数量、报告频率、协作人数、流程节省时间或业务结果；没有精确数字时，也可以写范围、周期或交付物规模。
- mentor: HR 扫 bullet 时会先找规模、频率、效率或结果。只有职责描述，会让你看起来像参与过，但看不出贡献大小。
- HR: 我会看你是不是能把事情做到有结果；数字不一定要夸张，但要让我知道工作量和影响边界。

## 8. 重排 Skills，让关键词更像这份 JD
- id: fb_skills_section_order
- source: fallback
- family/depth: skills_section / structure
- mode: raw
- pass: true
- current: Skills 还没有围绕 Management Trainee 的 JD 优先级重排，岗位信号不够集中。
- action: 把最贴近 Management Trainee 的技能放在 Skills 前半段，弱相关或解释不清的技能后移或删除；每个核心技能最好能在经历里找到对应证据。
- mentor: Skills 不是技能清单仓库，而是 ATS 和 recruiter 判断方向的入口。顺序混乱时，真实相关技能也会被埋掉。
- HR: 我通常先扫技能栏确认方向；如果最相关的词藏在后面，会降低继续细读的动力。

## 9. 先把版面压到可快速扫描
- id: fb_format_cleanup
- source: fallback
- family/depth: format_cleanup / delivery
- mode: raw
- pass: true
- current: 简历需要进一步检查版面、日期、section 顺序和一页可读性，避免内容被格式问题拖累。
- action: 统一日期格式和 section 标题，删掉低相关内容，把最相关经历留在第一页上半部；导出 PDF 后检查是否仍可复制、可搜索、无错位。
- mentor: 格式问题不只是好不好看，它会影响 ATS 解析，也会影响 HR 是否愿意继续读细节。
- HR: 排版稳定会让我更快进入内容；如果版面乱，很多亮点还没被读到就已经扣分。

## 10. 用课程或项目补足 junior 信号
- id: fb_education_signal
- source: fallback
- family/depth: education_signal / evidence
- mode: raw
- pass: true
- current: 教育背景和项目训练还没有充分服务目标岗位，相关内容可以更靠近 JD 职责来表达。
- action: 保留和 Management Trainee 相关的课程、项目或证书，把它们写成「学了什么方法 + 做了什么交付物 + 支撑哪项岗位能力」。
- mentor: 经验还不长时，课程、训练和项目可以补岗位信号，但必须写成能力证据，而不是课程名单。
- HR: 经验不长时，我会看训练是否补得上；相关课程别只列名字，要让我看到它和岗位的关系。

## 11. 补齐可验证入口
- id: fb_profile_links
- source: fallback
- family/depth: profile_links / delivery
- mode: generalized
- pass: true
- current: 简历头部和项目入口还可以更完整，尤其是 LinkedIn、作品、项目或可点击链接。
- action: 检查邮箱、电话、LinkedIn 是否完整；如果有项目、作品集或 GitHub，把最能证明目标岗位能力的链接放在 header 或项目名旁边。
- mentor: 可验证链接会降低招聘方确认成本。没有入口时，很多项目和经历只能停留在文字描述里。
- HR: 如果我能一键看到作品或项目，判断成本会低很多；没有链接时，只能按文字可信度打折。

## 12. 把原经历翻译成岗位可读语言
- id: fb_transferable_framing
- source: fallback
- family/depth: transferable_framing / rewrite
- mode: raw
- pass: true
- current: 你的经历里有可迁移能力，但还没有充分翻译成 Management Trainee 会关心的业务、协作和交付语言。
- action: 把最相关的 2 条经历按 Management Trainee 视角重写：先写你支持了什么业务目标，再写你用了什么分析、沟通或协调方法，最后写交付物或改进结果。
- mentor: 转方向或投 trainee 类岗位时，重点不是隐藏原背景，而是把原经历改写成目标岗位能理解的能力信号。
- HR: 我不介意你背景不是一模一样；但你要帮我看懂，这段经历为什么能迁移到现在这个岗位。
