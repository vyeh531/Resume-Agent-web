# EdAIX Resume Diagnosis MVP PRD

版本：v1.0  
日期：2026-06-29  
產品：EdAIX / MentorX Resume Diagnosis MVP  
專案：Resume-Agent-MVP - web

## 1. 產品摘要

EdAIX Resume Diagnosis MVP 是一個面向國際求職者的履歷診斷與付費報告產品。使用者可以上傳或貼上履歷，選擇目標職位或貼上 Job Description，系統會在短時間內產出免費 ATS 診斷預覽；付費後，使用者可解鎖完整 mentor-style 報告、完整 JD keyword checklist、4 位導師建議、公司洞察與可下載的 AI 改履歷指令包。

產品核心差異化是把 ATS 規則評分、JD 關鍵字匹配、職位/薪資/AI 趨勢資料，以及 EdAIX 既有的 1,300+ 導師與 30,000+ coaching case 知識庫結合，讓履歷建議比通用 AI 模板更接近真實招聘場景。

## 2. 背景與問題

國際學生與早期職涯求職者常遇到以下問題：

- 不知道履歷是否能通過 ATS 或招聘系統初篩。
- 不知道自己的履歷與目標 JD 差距在哪裡。
- 收到的 AI 履歷建議過於泛化，缺少職位、行業與導師視角。
- 很難把診斷結果轉化成可執行的履歷重寫方案。
- 對付費求職服務缺乏低門檻的信任入口。

目前專案已具備從履歷提交、ATS 分析、免費報告、付費解鎖到完整報告展示的 MVP 閉環，PRD 目標是明確現有產品範圍與下一階段產品化要求。

## 3. 產品目標

### 3.1 業務目標

- 用 30 秒左右的免費診斷降低使用者首次體驗門檻。
- 透過免費報告展示明確痛點，促進 ¥49 付費解鎖。
- 將完整報告作為高客單價求職顧問服務的 lead generation 入口。
- 建立可重複使用的履歷分析、mentor advice retrieval 與報告生成基礎架構。

### 3.2 使用者目標

- 快速知道履歷目前分數、ATS 風險與 JD 匹配差距。
- 看懂最優先要修的 3 類問題。
- 獲得可信、具體、可操作的導師建議。
- 付費後取得完整問題清單、關鍵字放置建議與可下載報告。
- 能把報告交給 ChatGPT / Claude 等 LLM，用於後續履歷改寫。

### 3.3 技術目標

- 保持免費報告與完整內部分析的資料邊界。
- 支援 hosted ATS 與 local ATS fallback。
- 將完整 report、internal ATS result、retrieval query、paid advice 保存在 server-side。
- 支援中英文 locale-aware report hydration。
- 確保公開 API 不洩漏 premium 或 debug-only 欄位。

## 4. 非目標

本 MVP 暫不承諾：

- 真實支付網關完整閉環。目前付款頁以 mock payment / mark-paid flow 為主。
- 自動生成完整可投遞履歷文件，只提供診斷、建議與 AI rewrite prompt package。
- 使用者帳號系統與長期 report library 的完整產品化。
- 多輪聊天式履歷修改。
- 招聘成功或 offer 結果保證。
- 面向企業招聘端的 ATS SaaS。

## 5. 目標使用者

### Persona A：國際學生 / New Grad

- 目標：校招、實習、OPT/CPT/H-1B 相關求職。
- 痛點：履歷和美國/國際 JD 語言不匹配，不確定是否能過 ATS。
- 需求：快速定位缺失技能、量化表達、學歷/項目/實習寫法。

### Persona B：轉職或早期職涯求職者

- 目標：從學校/第一份工作轉向產品、數據、軟體、金融、諮詢等職位。
- 痛點：不知道如何把過去經歷翻譯成目標職位語言。
- 需求：職位定位、關鍵字補強、經歷重寫方向、薪資與 AI 趨勢參考。

### Persona C：EdAIX 顧問 / 運營團隊

- 目標：用自動化報告預篩使用者需求，促成後續顧問服務。
- 痛點：人工初診耗時，使用者問題分散。
- 需求：穩定生成可信診斷，保留 report/debug 資料供後續服務使用。

## 6. 核心使用流程

1. 使用者進入首頁 `/`。
2. 使用者上傳 PDF/DOCX/TXT 履歷，或貼上 resume text。
3. 使用者選擇 target role，或貼上完整 JD。
4. 前端呼叫 `/api/v1/score`，後端解析履歷並執行 ATS scoring。
5. 後端建立 internal ATS result、retrieval query、free advice、premium report，並保存 report。
6. 前端跳轉到 `/result` 顯示免費診斷。
7. 使用者查看分數、4 個數據維度、Top issues、3 條 mentor advice preview 與付費價值提示。
8. 使用者進入 `/payment`，完成 mock payment / mark paid。
9. 前端呼叫 `/api/v1/reports/:reportId/unlock`。
10. 使用者進入 `/report` 查看完整報告、完整導師建議、公司 insider tips、PDF / AI 指令包下載入口與升級服務 CTA。

## 7. 功能需求

### 7.1 首頁與履歷提交

需求：

- 支援檔案上傳：PDF、DOCX、TXT。
- 支援純文字貼上作為 fallback。
- 支援 target role 下拉列表，資料優先來自 Postgres `position_skills`。
- 當資料庫不可用時，role list fallback 到本地 `public/ats_role_dictionary.json`。
- 支援貼上 JD；若未選 role，後端需可從 JD 中推斷或要求提供 jobTitle/JD。
- 前端只保存 browser-safe state 到 `localStorage.resumeFixMVP`。

驗收條件：

- 沒有履歷內容時，提交失敗並提示使用者。
- 沒有 target role 且沒有 JD 時，API 回傳 400。
- DB unavailable 時，職位列表仍可載入本地 fallback。
- PDF 無法解析時，使用者可改用貼上文字。

### 7.2 檔案解析

需求：

- `/api/parse-file` 支援 PDF、DOCX、TXT。
- `/api/v1/score` 可直接處理 multipart form file。
- 解析後空內容要回傳錯誤。
- 不支援格式要明確拒絕。

驗收條件：

- PDF/DOCX/TXT 解析成功時回傳 text、fileName、length。
- Unsupported type 回傳 400。
- Empty parse result 回傳 400。

### 7.3 ATS Scoring

需求：

- 主 scoring route 為 `/api/v1/score`。
- 後端執行 scoring，前端不得直接呼叫 hosted ATS。
- 支援 local ATS scorer fallback。
- scoring input 包含 resumeText/file、jobTitle、jdText、fileName、locale。
- scoring output 只回傳 capped public report，不回傳 internal ATS result。

免費報告可見內容：

- reportId、reportAccessToken。
- jobTitle、hasJD、total score、risk、scores、dimensions score。
- 最多 3 個 visible problems。
- 最多 3 個 suggestions。
- 最多 3 個 visible keyword preview terms。
- 最多 3 條 free mentor advice。
- locked advice preview 只能包含數量、主題 teaser，不包含 hidden body。

禁止出現在免費 response：

- full internal ATS result。
- problemTags、retrievalQuery、scoreCaps、diagnostics、keywordMatch full list。
- paid advice、premium mentors、完整 keyword checklist。
- hosted ATS raw response 或 debug-only 欄位。

驗收條件：

- `npm test` 的 public response boundary test 通過。
- `/api/v1/score` response 不包含 server-only 欄位。
- reportId 與 reportAccessToken 可用於重新載入 public report。

### 7.4 免費結果頁 `/result`

需求：

- 顯示 Resume Score `/100`、risk badge、診斷完成狀態。
- 顯示使用者/目標職位摘要。
- 顯示 4 個數據維度：
  - JD match。
  - ATS readability。
  - Salary growth。
  - AI impact trend。
- 顯示 ATS radar / dimension summary。
- 顯示 JD keyword checklist preview。
- 顯示 3 條 mentor advice preview。
- 顯示付費解鎖區塊與 ¥49 CTA。
- 桌面與 mobile 佈局都要可讀。

驗收條件：

- 未付款前，完整 keyword/advice 不可直接顯示。
- Locked area 只顯示 teaser 與價值描述。
- 使用者可以從結果頁進入 payment。

### 7.5 付款頁 `/payment`

需求：

- 顯示訂單內容、價格 ¥49、原價 ¥199、QR placeholder、倒數計時。
- 支援 mock payment 按鈕。
- 完成 mock payment 後標記 report 為 paid，並導向完整報告。
- 若沒有有效 report state，導回首頁或結果頁。

驗收條件：

- 未提交履歷直接訪問 payment 時不能進入完整報告。
- mock payment disabled 時，production-like environment 不應允許任意解鎖。
- payment CTA 成功後 `/unlock` 可取得 premium report。

### 7.6 完整報告 `/report`

需求：

- 解鎖後顯示完整診斷報告。
- 包含整體分數、core issue、完整 JD keyword checklist、4 個數據維度、ATS 詳細問題、完整導師建議、公司 insider tips、升級服務 CTA。
- 支援下載完整 PDF 報告。
- 支援下載 AI 改履歷指令包，方便使用者交給 ChatGPT / Claude / 豆包等 LLM。
- 支援中英文 locale hydration。

驗收條件：

- 未付款或 token 無效時，`/unlock` 回傳 `PAYMENT_REQUIRED` 或 access error。
- 已付款且 token 有效時，返回 premiumReport。
- premium report 包含 free advice + additional paid advice。
- premium report 不包含 debug-only raw internals，除非走 debug endpoint。

### 7.7 Mentor Advice Retrieval

需求：

- 根據 internal ATS result 與 retrieval query 從 mentor knowledge base 取回 advice。
- free advice 與 paid advice 使用同一品質標準，付費只增加數量與完整度。
- 建議需要與 target role、problem tags、candidate context 對齊。
- 當 DB 或 retrieval 不足時，需要有 fallback advice。
- premium report 需包含 mentor grouping、coverage summary 與 company insider tips。

驗收條件：

- 免費報告至少有可展示的 advice 或 fallback。
- paid report 盡可能提供完整 4 位 mentor / 12 條 advice 的結構。
- 不應將面試建議、公司泛談或不匹配職位的 advice 當成核心履歷修改建議。

### 7.8 Report Access 與儲存

需求：

- report 需保存到 server-side storage。
- `ats_reports` 保存 public report、internal ATS result、retrieval query、free advice、paid advice、premium report、payment status、access token hash、resume text。
- access token 用於使用者重新載入自己的 report。
- 前端 localStorage 僅保存 reportId、reportAccessToken、locale、public visible data。
- report 預設有效期 14 天。

驗收條件：

- reportId + valid token 可讀 public report。
- 無 token 或 token 錯誤不可讀 report。
- unpaid report 不可 unlock。
- DEV_UNLOCK_REPORTS 僅允許非 production 使用。

### 7.9 Locale 與文案

需求：

- 支援 `zh-CN` 與 `en-US` report loading。
- API 層 normalize locale。
- 若 stored report locale 與 request locale 不同，透過 locale hydration 轉換可展示內容。
- 已知部分中文 UI 字串存在 mojibake，需列為產品化修復項。

驗收條件：

- 中英文 locale 切換時 public/premium report 能載入。
- `translationFallback` 欄位可表明 fallback 狀態。
- 付款頁與少數 UI mojibake 在正式上線前修復。

## 8. 資料與安全邊界

### 8.1 Server-only 資料

以下資料只能留在後端或 debug endpoint：

- Full ATS raw/internal response。
- Retrieval query。
- Problem tags。
- Full keywordMatch。
- Score caps。
- Diagnostics。
- Mentor candidate debug info。
- Paid advice body。
- Premium report before unlock。
- Resume text full content，除非必要展示或下載。

### 8.2 Browser-safe 資料

前端可保存：

- reportId。
- reportAccessToken。
- locale。
- publicReport。
- visible free advice。
- visible score/dimension/keyword preview。

### 8.3 隱私要求

- 首頁需清楚說明履歷僅用於本次診斷。
- 不應將履歷全文暴露在 public response 中。
- debug endpoint 應受 environment 與 access control 限制。
- log 中應 redacted access token。

## 9. API 需求摘要

| Route | Method | 需求 |
| --- | --- | --- |
| `/api/health` | GET | 回傳服務健康狀態 |
| `/api/positions` | GET | 回傳 target role list，DB unavailable 時 fallback local dictionary |
| `/api/parse-file` | POST | 解析 PDF/DOCX/TXT |
| `/api/v1/score` | POST | 建立 ATS 診斷與 report，回傳 capped public report |
| `/api/v1/analysis-jobs` | POST | 啟動 async analysis job |
| `/api/v1/analysis-jobs/:jobId` | GET | 輪詢 async analysis status |
| `/api/v1/reports/:reportId/public` | GET | 使用 token 載入 public report |
| `/api/v1/reports/:reportId/mark-paid` | POST | mock paid status update |
| `/api/v1/reports/:reportId/unlock` | POST | 已付款後回傳 premium report |
| `/api/v1/reports/:reportId/debug` | GET | 受控 debug report inspection |
| `/api/v1/ats/rule` | POST | hosted ATS rule route |
| `/api/v1/ats/rule-local` | POST | local ATS route |

## 10. 成功指標

### Activation

- 首頁到成功產出 public report conversion rate。
- 履歷解析成功率。
- `/api/v1/score` 成功率與平均耗時。

### Monetization

- `/result` 到 `/payment` click-through rate。
- payment mock/real completion rate。
- public report 到 premium unlock conversion rate。

### Product Quality

- public response boundary test pass rate。
- free report 有效 advice 覆蓋率。
- premium report advice 數量與 problem tag coverage ratio。
- fallback advice 使用比例。
- 使用者下載 PDF / AI 指令包比例。

### Reliability

- DB unavailable fallback 成功率。
- ATS scoring fallback 使用率。
- report persistence success rate。
- public/premium report reload success rate。

## 11. MVP 上線驗收清單

- `npm run build` 成功。
- `npm test` 成功。
- `/` 可提交 file 與 text resume。
- `/api/positions` DB 與 local fallback 都可用。
- `/api/v1/score` 不洩漏 internal/premium/debug 欄位。
- `/result` desktop/mobile 可讀且 CTA 正常。
- `/payment` mock payment flow 可完成。
- unpaid report 無法 unlock。
- paid report 可在 `/report` 正常顯示。
- PDF report 與 AI rewrite package 下載入口可用。
- production 前修復付款頁與任何核心中文文案 mojibake。
- production 前確認 `DEV_UNLOCK_REPORTS=false`。
- production 前確認 `PAYMENT_MOCK_ENABLED` 策略與商務需求一致。

## 12. 已知風險與待決策

### 12.1 風險

- 真實支付尚未接入，mock payment 不能直接代表正式商業閉環。
- Mentor advice retrieval 依賴 Postgres knowledge base；DB 不可用時品質會下降。
- 部分中文 UI 存在 mojibake，會影響信任感。
- 完整 report 與 mentor retrieval 生成耗時可能影響 30 秒體驗承諾。
- localStorage 保存 report token，需配合有效期與 token hash 降低風險。

### 12.2 待決策

- 正式支付供應商與 webhook 驗證方案。
- ¥49 / ¥199 pricing 是否因地區、活動、渠道做差異化。
- Report 有效期是否維持 14 天。
- 是否加入 login，讓 report library 可跨設備訪問。
- 是否將 AI rewrite 從 downloadable prompt package 升級成站內生成。
- 是否將 hosted ATS 設為 default，或維持 local first。

## 13. Roadmap

### Phase 0：當前 MVP 穩定化

- 修復中文 mojibake。
- 完成 public response boundary test。
- 確認 report persistence 與 pending report fallback。
- 完成 desktop/mobile 主要流程驗收。

### Phase 1：付費閉環產品化

- 接入真實支付。
- 加入 payment webhook 與 server-side paid verification。
- 增加 order id、refund state、receipt/invoice support。
- 強化 unlock audit log。

### Phase 2：報告品質提升

- 提升 mentor advice coverage。
- 補強不同 role family 的 fallback advice。
- 強化 company insider tips 的職位/公司匹配度。
- 建立 report quality dashboard。

### Phase 3：留存與顧問服務轉化

- 加入 user account / report history。
- 支援多份履歷與多個 JD 對比。
- 將完整報告轉化為顧問服務 lead pipeline。
- 支援站內 AI rewrite 或人工顧問 follow-up。

## 14. 依賴與參考文件

- `README.md`
- `docs/ats_system_mvp_mapping.md`
- `docs/problem_tag_contract.md`
- `docs/mentor_advice_db_schema.md`
- `docs/salary-benchmark-pipeline.md`
- `app/api/v1/score/route.js`
- `app/lib/atsHelpers.js`
- `src/ats/report-formatter.js`
- `services/mentorAdviceRetrieval.js`
- `services/adviceCurator.js`
