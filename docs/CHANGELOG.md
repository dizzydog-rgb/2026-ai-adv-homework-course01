# 更新日誌 (CHANGELOG.md)

## 待辦事項 (Todo)
- [ ] **串接綠界金流 (ECPay Integration)**:
    - 實作 `src/services/ecpayService.js`。
    - 新增 `src/routes/paymentRoutes.js`。
    - 建立 `views/pages/payment-redirect.ejs` 用於自動導向付款頁面。
    - 串接結帳流程至金流支付。

## 重大決策紀錄

### [1.0.0] - 2026-04-25
#### 新增 (Added)
- 建立專案基礎架構 (Express + EJS + SQLite)。
- 完成使用者認證系統 (JWT + bcrypt)。
- 實作商品瀏覽、購物車與訂單管理核心邏輯。
- 新增管理員後台 CRUD 功能。
- 建立 `GEMINI.md` 與 `docs/` 文件體系（開發規範、架構、功能、測試）。
- 整合 Vitest 自動化測試與 OpenAPI 文件產生工具。

#### 技術決策 (Technical Decisions)
- **資料庫選擇**: 使用 `better-sqlite3` 作為本地開發資料庫，因其效能優於非同步驅動且設定簡單。
- **身分驗證**: 採用 JWT 無狀態驗證，方便未來可能的擴充，並搭配 `localStorage` 儲存 Token。
- **樣式框架**: 選擇 `Tailwind CSS` 進行原子化樣式開發，提升前端開發效率。
- **忽略清單**: 建立 `.geminiignore` 以優化 AI Agent 的 Context 消耗。
