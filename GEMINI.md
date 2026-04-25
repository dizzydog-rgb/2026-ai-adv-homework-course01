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

## 當前進度

- [x] 基礎架構與資料庫設計
- [x] 產品、購物車、訂單核心邏輯
- [x] 管理員後台功能
- [ ] 第三方支付整合(綠界金流)
