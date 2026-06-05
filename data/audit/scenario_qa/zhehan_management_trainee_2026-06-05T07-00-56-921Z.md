# Zhehan / Management Trainee Scenario QA

- Status: FAIL
- Total advice: 9
- Free advice: 3
- Paid advice: 6
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

## 2. 强化 bullet 的结果表达
- id: seg_21651
- source: db_adapted
- family/depth: summary_positioning / proof
- mode: raw
- pass: true
- current: 经历描述里可量化结果不足，HR 很难判断你具体带来了什么影响或产出。
- action: 根据目标岗位对实习进行取舍：与buy side强相关的实习多写（4条以上并补充最终成果）；保险公司实习申请buy side时可不写或极简处理；banking实习少写；确保简历整体呈现一致的目标方向。
- mentor: HR浏览简历时会判断每段经历与目标岗位的关联性，不相关经历不仅浪费版面，还会分散注意力，让人觉得你方向不清晰。简历应有的放矢，突出与JD最相关的经历。
- HR: 经历如果只写做了什么，我很难判断你做得多深、成果多大、是否值得面试。

## 3. 把关键词嵌入经历 bullet
- id: seg_24800
- source: db_adapted
- family/depth: jd_keyword_alignment / diagnose
- mode: raw
- pass: true
- current: 目标岗位的核心技能词（如 problem-solving、strategic planning、process improvement）在简历中出现不足，ATS 难以确认你的技能匹配度。
- action: 对照 JD 提取真实掌握的核心关键词，把它们分配到 Summary、Skills 和最相关的 Experience bullet 中。
- mentor: 关键词只有放进真实经历里才有说服力。把 JD 里的能力要求转成项目或工作证据，比单纯堆词更容易通过人工筛选。
- HR: 关键词不是写给系统看的摆设；如果经历里没有对应证据，我会怀疑你只是照着 JD 填词。

## 4. 补齐可验证资料入口
- id: fb_obligation_weakdimensionb
- source: fallback
- family/depth: experience_evidence / evidence
- mode: raw
- pass: false
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

## 6. 整理 Skills 关键词
- id: seg_22186
- source: db_adapted
- family/depth: jd_keyword_alignment / rewrite
- mode: raw
- pass: true
- current: 目标岗位的核心技能词（如 problem-solving、strategic planning、process improvement）在简历中出现不足，ATS 难以确认你的技能匹配度。
- action: 将Blender等3D软件经验加入简历技能列表，即使已生疏也应列出，可注明熟悉程度（如Familiar with Blender）。
- mentor: 游戏/设计相关岗位中，3D软件经验（如Blender）是稀缺且加分的技能，哪怕只有基础使用经验，也能体现你的跨领域能力和学习意愿，不应因"太久没用"而自我筛选掉。
- HR: 如果关键技能词扫不到，我会先担心你和岗位要求差一截，而不是主动替你补充想象。

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
- current: Skills 还没有围绕 Finance 的 JD 优先级重排，岗位信号不够集中。
- action: 把最贴近 Finance 的技能放在 Skills 前半段，弱相关或解释不清的技能后移或删除；每个核心技能最好能在经历里找到对应证据。
- mentor: Skills 不是技能清单仓库，而是 ATS 和 recruiter 判断方向的入口。顺序混乱时，真实相关技能也会被埋掉。
- HR: 我通常先扫技能栏确认方向；如果最相关的词藏在后面，会降低继续细读的动力。

## 9. 先把版面压到可快速扫描
- id: fb_format_cleanup
- source: fallback
- family/depth: format_cleanup / delivery
- mode: raw
- pass: false
- current: 简历需要进一步检查版面、日期、section 顺序和一页可读性，避免内容被格式问题拖累。
- action: 统一日期格式和 section 标题，删掉低相关内容，把最相关经历留在第一页上半部；导出 PDF 后检查是否仍可复制、可搜索、无错位。
- mentor: 格式问题不只是好不好看，它会影响 ATS 解析，也会影响 HR 是否愿意继续读细节。
- HR: 排版稳定会让我更快进入内容；如果版面乱，很多亮点还没被读到就已经扣分。
