# Zhehan / Management Trainee Scenario QA

- Status: PASS
- Total advice: 7
- Free advice: 3
- Paid advice: 4
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

## 2. 补齐 JD 关键词证据
- id: seg_20294
- source: db_adapted
- family/depth: jd_keyword_alignment / rewrite
- mode: generalized
- pass: true
- current: 目标岗位的核心技能词（如 problem-solving、strategic planning、process improvement）在简历中出现不足，ATS 难以确认你的技能匹配度。
- action: 对照 JD 提取真实掌握的核心关键词，把它们分配到 Summary、Skills 和最相关的 Experience bullet 中。
- mentor: 关键词只有放进真实经历里才有说服力。把 JD 里的能力要求转成项目或工作证据，比单纯堆词更容易通过人工筛选。
- HR: 关键词不是写给系统看的摆设；如果经历里没有对应证据，我会怀疑你只是照着 JD 填词。

## 3. 强化 bullet 的量化结果
- id: fb_obligation_weakdimensionc
- source: fallback
- family/depth: experience_evidence / rewrite
- mode: raw
- pass: true
- current: 内容质量与成果表达维度偏低，需要把经历改成动作、方法/工具和量化结果结构。
- action: 将核心 bullet 改成「动作 + 方法/工具 + 量化结果」：例如处理多少请求/工单、维护多少设备或系统、降低多少故障率、提升多少响应效率。
- mentor: HR 看经历 bullet 时会快速找影响、规模和结果；只有职责描述会让贡献显得模糊。
- HR: 

## 4. 用课程或项目补足 junior 信号
- id: fb_education_signal
- source: fallback
- family/depth: education_signal / evidence
- mode: raw
- pass: true
- current: 教育背景和项目训练还没有充分服务目标岗位，相关内容可以更靠近 JD 职责来表达。
- action: 保留和 Management Trainee 相关的课程、项目或证书，把它们写成「学了什么方法 + 做了什么交付物 + 支撑哪项岗位能力」。
- mentor: 经验还不长时，课程、训练和项目可以补岗位信号，但必须写成能力证据，而不是课程名单。
- HR: 经验不长时，我会看训练是否补得上；相关课程别只列名字，要让我看到它和岗位的关系。

## 5. 把原经历翻译成岗位可读语言
- id: fb_transferable_framing
- source: fallback
- family/depth: transferable_framing / rewrite
- mode: raw
- pass: true
- current: 你的经历里有可迁移能力，但还没有充分翻译成 Management Trainee 会关心的业务、协作和交付语言。
- action: 把最相关的 2 条经历按 Management Trainee 视角重写：先写你支持了什么业务目标，再写你用了什么分析、沟通或协调方法，最后写交付物或改进结果。
- mentor: 转方向或投 trainee 类岗位时，重点不是隐藏原背景，而是把原经历改写成目标岗位能理解的能力信号。
- HR: 我不介意你背景不是一模一样；但你要帮我看懂，这段经历为什么能迁移到现在这个岗位。

## 6. 突出跨部门协作交付
- id: fb_cross_functional_delivery
- source: fallback
- family/depth: cross_functional_delivery / evidence
- mode: raw
- pass: true
- current: 简历里有协作和团队经历，但还可以更明确写出你和哪些对象配合、推进了什么任务、最后交付了什么。
- action: 选一段最相关经历，改成「协作对象 + 你负责的推进动作 + 交付物」结构，例如和老师、同学、经理或跨职能成员一起完成报告、流程、分析或运营任务。
- mentor: Management Trainee 会轮到不同部门，招聘方会特别看你能不能和不同角色一起把事情推进到结果。
- HR: 管培生不是只看聪明，我会看你能不能和不同部门的人一起把任务落地。

## 7. 写出轮岗适应能力
- id: fb_rotation_readiness
- source: fallback
- family/depth: rotation_readiness / delivery
- mode: raw
- pass: true
- current: 简历还没有充分体现你适应不同任务、不同团队和不同业务场景的能力。
- action: 在 Summary 或经历 bullet 中加入一条轮岗可读的表达：强调你能快速学习新流程、和不同团队协作，并把分析或报告任务转化为可执行交付。
- mentor: 管培生岗位的特殊点是轮岗。简历需要证明你能快速学习新场景，而不是只适合单一专业任务。
- HR: 我会看你是不是只会一个窄任务；能快速切换场景，对管培生很重要。
