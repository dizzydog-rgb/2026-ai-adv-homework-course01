# Gemini Project Memory: Flower Shop Backend

## 專案定位

本專案為一個基於 Node.js / Express 的「線上花店」電子商務平台，具備完整的前後端整合、SQLite 資料庫與後台管理功能。

## 核心目標

1. **穩定性**：確保結帳與庫存邏輯 100% 正確。
2. **開發效率**：遵循 RESTful API 規範與 EJS 模板架構。
3. **安全性**：落實 JWT 驗證與敏感資料加密。

## 文件指南

詳細規範請參考 `./docs` 目錄：

- **開發規範**: `docs/DEVELOPMENT.md` (命名、風格、錯誤處理)
- **架構設計**: `docs/ARCHITECTURE.md` (目錄結構、資料流)
- **功能狀態**: `docs/FEATURES.md` (現有功能清單)
- **測試指南**: `docs/TESTING.md` (Vitest 測試規則)

## 常用指令

- `npm start`: 建置 CSS 並啟動伺服器
- `npm run dev:server`: 啟動開發伺服器
- `npm test`: 執行所有測試
- `npm run openapi`: 產生 Swagger 文件

## 執行準則 (Execution Guidelines)

### 核心規範 (DO)
1. **明確輸出格式**: 在所有指令中要求明確的格式（如：Return response in JSON format only），以便 CLI 解析器 (Parser) 處理。
2. **上下文限縮 (Context Scoping)**: 每次請求時，僅傳遞與當前任務相關的檔案內容，避免超過 Context Window 導致資訊雜訊增加。
3. **錯誤處理宣告**: 規範當模型無法完成任務時，必須回傳特定的 Error Code 或 JSON 結構，而非模糊的自然語言。

### 禁止行為 (DON'T)
1. **禁止無狀態操作**: 在執行連貫任務時，禁止不參考 `.gemini/sessions` 中的前置狀態，避免邏輯斷層。
2. **嚴禁洩漏敏感資訊**: 禁止將 `.env` 檔案或包含 API Key/Secrets 的內容寫入 `skills/` 或傳遞給模型。
3. **避免開放式指令**: 禁止使用「幫我優化專案」這類寬泛 Prompt，必須量化為「優化 src/components 下的渲染效能」。

## 當前進度

- [x] 基礎架構與資料庫設計
- [x] 產品、購物車、訂單核心邏輯
- [x] 管理員後台功能
- [x] 第三方支付整合(綠界金流)
