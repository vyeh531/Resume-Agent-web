# 成功案例簡歷 Data 使用指南

## 一、目標

將真實學生的簡歷投遞結果轉化為可複用的產品資料資產，讓系統不只診斷簡歷問題，而是能學習：

- 什麼樣的簡歷更容易拿到面試
- 導師如何把原始簡歷改成可投遞版本
- 哪些修改對不同崗位、學生背景、JD 類型最有效
- 如何用成功案例反哺 ATS 評分、mentor advice 排序與 AI 改寫建議

最終目標是建立一套 **Success Case Learning Pipeline**，讓每一個新的成功案例都能自動沉澱成系統可用的改寫策略。

## 二、資料類型

### 1. 有簡歷迭代的案例

資料鏈路：

```text
學生原始簡歷
→ 導師/課程優化後簡歷
→ 最終投遞簡歷
→ JD / Job link
→ 是否拿到面試
```

這是最高價值資料，適合用來學習「導師怎麼改簡歷」。

可回答：

- 導師具體改了什麼
- 哪些改動最常出現在拿面試的案例中
- 不同崗位的 before / after 差異
- 背景較弱學生如何被重新包裝
- JD keyword 如何被放進 resume
- bullet 如何從任務描述變成證據與結果描述

### 2. 沒有簡歷迭代的投遞案例

資料鏈路：

```text
投遞簡歷
→ JD / Job link
→ 是否拿到面試
```

這類資料適合做 outcome calibration，而不是直接學習改法。

可用於：

- 校準 ATS score 與真實面試結果的關係
- 找出高轉化 resume / JD pattern
- 分析不同崗位、公司、job type 對 keyword / 經歷證據的敏感度
- 調整 advice ranking 權重

## 三、核心 Data Schema

每筆成功案例建議至少包含以下欄位：

```json
{
  "case_id": "...",
  "student_id_hash": "...",
  "student_level": "B",
  "student_direction": "data / accounting / marketing / software",
  "job_title": "Data Analyst",
  "company": "Sprout",
  "job_type": "full_time",
  "job_link": "...",
  "jd_text": "...",
  "submitted_at": "2026-06-05",

  "resume_iteration_type": "before_after_with_coaching",
  "original_resume_text": "...",
  "optimized_resume_text": "...",
  "submitted_resume_text": "...",

  "interview_outcome": true,
  "interview_stage": "first_round",
  "interview_date": "...",

  "referral_status": "unknown / referral / no_referral",
  "location": "...",
  "visa_status": "...",
  "graduation_year": "...",

  "coaching_type": "resume_course",
  "mentor_or_teacher_id": "..."
}
```

`resume_iteration_type` 建議使用固定枚舉：

```text
before_after_with_coaching
before_after_no_outcome
final_only_with_interview
final_only_no_interview
unknown
```

## 四、Pipeline 設計

整體流程：

```text
成功案例資料進入
→ 資料清洗 / 匿名化
→ before resume 跑 ATS
→ after / submitted resume 跑 ATS
→ 產生 before vs after structured diff
→ 文字 / bullet diff
→ AI 生成 Change Tags / Rewrite Rules
→ 存入 Success Strategy DB
→ 回流到產品
```

## 五、Step 1：資料清洗與匿名化

在任何分析前，先移除或 hash 掉個資：

- 姓名
- Email
- 電話
- LinkedIn
- 地址
- 學號
- 其他可識別身份資訊

學生 ID 使用 hash：

```text
student_id_hash = hash(original_student_id)
```

保留可用於分析但不直接識別身份的欄位：

- student_level
- target direction
- graduation year
- visa status
- job type
- company
- role
- interview outcome

## 六、Step 2：跑現有 ATS 系統

同一個 JD 下，對不同版本簡歷分別跑 ATS：

```text
ATS(original_resume + JD)
ATS(optimized_resume + JD)
ATS(submitted_resume + JD)
```

每個版本需記錄：

- total score
- JD match score
- resume quality score
- searchability score
- dimensions A-F
- problemTags
- topProblems
- missing keywords
- matched keywords
- keywordBreakdown
- structuredSuggestions
- role profile
- retrievalQuery

這一步不需要 AI。它提供穩定、可比較、可統計的客觀變化。

## 七、Step 3：產生 Structured Diff

系統自動比較 before / after 的 ATS 結果。

範例：

```json
{
  "score_delta": 18,
  "jd_match_delta": 31,
  "resume_quality_delta": 12,
  "searchability_delta": 6,

  "removed_problem_tags": [
    "low_jd_keyword_match",
    "weak_experience_keyword_evidence"
  ],
  "persistent_problem_tags": [
    "low_measurable_results"
  ],
  "added_problem_tags": [],

  "resolved_keywords": ["SQL", "Tableau", "dashboard"],
  "newly_added_keywords": ["stakeholder reporting", "data visualization"],

  "dimension_improvements": {
    "D_keyword_match": 28,
    "F_role_fit": 16,
    "C_content_quality": 10
  }
}
```

這是整個 pipeline 的客觀證據層。

## 八、Step 4：文字與 Bullet Diff

在 ATS diff 之外，需要比較簡歷文本本身：

- 哪些 bullet 被重寫
- 哪些 bullet 被新增
- 哪些 bullet 被刪除
- 哪些 bullet 新增了數字
- 哪些 JD keyword 被放進 resume
- 哪些 keyword 從 Skills 移到 Experience
- 哪些弱動詞被替換
- Summary 是否重寫
- Skills 是否重排
- Project 是否被重新包裝

這一步可以先用程式做 rough diff，再交給 AI 做策略歸納。

## 九、Step 5：AI 生成結構化 Change Tags

AI 不應直接憑空判斷「導師改了什麼」。AI 應基於以下 evidence 做歸納：

- before ATS result
- after ATS result
- structured diff
- bullet diff
- JD key requirements
- before / after resume snippets

AI 輸出固定 JSON schema：

```json
{
  "change_tags": [
    "jd_keyword_inserted",
    "bullet_rewrite",
    "quantification_added",
    "experience_evidence_strengthened"
  ],
  "change_summary": "導師將泛泛的分析描述改成 JD 對應的工具、資料規模、dashboard 產出與 business impact。",

  "before_patterns": [
    "任務描述泛泛，缺少工具和結果",
    "keyword 只出現在 Skills，沒有出現在 Experience"
  ],
  "after_patterns": [
    "Action + Tool + Dataset + Business Outcome + Metric",
    "將 SQL / Tableau 放入具體 project bullet"
  ],

  "affected_sections": ["experience", "skills", "summary"],

  "problem_tags_resolved": [
    "low_jd_keyword_match",
    "weak_experience_keyword_evidence"
  ],

  "rewrite_rules": [
    {
      "applies_when": ["data_analyst", "weak_experience_keyword_evidence"],
      "rule": "把工具詞放進 Experience bullet，並補充資料規模、分析方法和業務結果。"
    }
  ],

  "applicable_when": [
    "target role is Data Analyst",
    "resume has weak experience evidence",
    "JD requires SQL / Tableau / dashboard"
  ],

  "avoid_when": [
    "student does not have real experience with the tool"
  ],

  "confidence": 0.84
}
```

## 十、Change Tags 建議枚舉

常用 change tags：

```text
jd_keyword_inserted
bullet_rewrite
quantification_added
experience_evidence_strengthened
role_positioning_changed
summary_rewritten
skills_reordered
project_reframed
weak_language_removed
weak_experience_removed
education_signal_added
market_fit_signal_added
tool_keyword_moved_to_experience
business_impact_added
scope_or_dataset_added
section_structure_improved
```

這些 tag 應作為 controlled vocabulary，避免 AI 每次產生不同命名。

## 十一、Success Strategy DB 設計

建議拆成兩層。

### 1. success_cases

存案例本身。

```text
success_cases
- case_id
- student_id_hash
- student_level
- student_direction
- role_family
- job_title
- company
- job_type
- jd_text
- job_link
- submitted_at
- interview_outcome
- interview_stage
- resume_iteration_type
- original_resume_text
- optimized_resume_text
- submitted_resume_text
- before_ats_json
- after_ats_json
- submitted_ats_json
- ats_diff_json
- source
- created_at
```

### 2. resume_change_strategies

存可複用的改寫策略。

```text
resume_change_strategies
- strategy_id
- case_id
- role_family
- job_title
- student_level
- job_type
- interview_outcome
- change_tags
- problem_tags_resolved
- resolved_keywords
- before_patterns
- after_patterns
- rewrite_rules
- applicable_when
- avoid_when
- confidence
- created_at
```

產品查詢時，優先檢索 `resume_change_strategies`，不一定每次讀完整案例。

## 十二、如何回流到現有產品

新用戶上傳 resume + JD 後：

```text
新用戶 resume + JD
→ 跑 ATS
→ 得到 roleFamily / problemTags / missing keywords
→ 查 success strategy DB
→ 找相似成功案例策略
→ 回流到報告與改寫建議
```

可影響的產品模組：

- mentor advice ranking
- paid report advice priority
- rewrite prompt
- similar successful case module
- Interview Readiness score
- high-impact fix badge
- JD keyword placement guidance

## 十三、產品呈現方式

不要一開始宣稱「預測面試概率」。因為面試結果會受 referral、公司、時間、地點、visa、投遞渠道影響。

更穩妥的表達：

```text
Seen in successful interview cases
Common in interview-winning resumes
High-impact fix based on past applications
Matched to similar successful applicants
Similar successful resumes changed like this
```

範例文案：

```text
根據類似背景學生拿到面試的簡歷迭代案例，你最值得優先做的 3 個改動是：

1. 把 JD keyword 放入 Experience bullet
2. 為核心 project 補充資料規模與業務結果
3. 重寫 Summary，明確對齊 Data Analyst 定位
```

## 十四、MVP 建議

第一階段先做 4 件事：

1. 支援批量匯入成功案例  
   先用 CSV / Excel / 資料夾，不急著自動同步 Lark。

2. before / after 各跑一次 ATS  
   複用現有 scoring system。

3. 生成 structured diff  
   先比較 scores、dimensions、problemTags、keywords。

4. 用 AI 生成 change_tags + rewrite_rules  
   固定 JSON schema，存入 DB。

第二階段再做：

- Lark / 面試跟進表自動同步
- Similar successful cases 檢索
- outcome boost for advice ranking
- paid report 成功案例模組
- Interview Readiness calibration

## 十五、核心原則

這套系統不要做成「AI 猜導師怎麼改」。正確方式是：

```text
ATS before/after diff 做客觀證據
文字 / bullet diff 做改動定位
AI 做結構化策略歸納
成功案例 DB 做長期複用
產品報告做個人化輸出
```

最終價值是讓每一個成功案例都變成下一位學生報告裡更準的建議。

這會讓產品從「AI 簡歷診斷工具」升級成：

**基於真實投遞結果與導師改寫案例的簡歷策略系統。**
