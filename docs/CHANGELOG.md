# 更新日誌 (CHANGELOG.md)

### [1.1.0] - 2026-04-26
#### 新增 (Added)
- **綠界金流 (ECPay) 整合**:
  - 實作 `src/services/ecpayService.js` 封裝 SHA256 CheckMacValue 加密與 QueryTradeInfo API。
  - 新增 `/api/orders/:id/ecpay/checkout-data` 以產生 AIO 導轉所需加密參數。
  - 實作 `/api/orders/:id/ecpay/verify` 採用主動查詢機制驗證本地開發環境付款結果。
  - 實作 `/api/orders/ecpay/notify` 接收 ReturnURL 伺服器通知（符合官方規範）。
  - 更新前端訂單詳情頁，新增「前往綠界付款」與「主動查詢」功能。
- **資料庫擴充**: `orders` 表新增 `ecpay_merchant_trade_no` 欄位以追蹤綠界交易。

#### 修復 (Fixed)
- 修正 `src/database.js` 語法錯誤並補上自動 migration 邏輯。

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
