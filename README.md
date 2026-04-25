# Flower Shop Backend - 線上花店電商平台

這是一個基於 Node.js 與 Express 開發的完整線上花店電子商務平台。本專案提供從前台商品瀏覽、購物車、結帳到後台商品與訂單管理的完整功能，並整合了 Swagger API 文件與自動化測試環境。

## 🛠 技術棧 (Tech Stack)

- **後端框架**: Node.js / Express
- **資料庫**: SQLite (透過 `better-sqlite3`)
- **樣式處理**: Tailwind CSS
- **模板引擎**: EJS (Server-Side Rendering)
- **身分驗證**: JSON Web Token (JWT) & bcrypt 加密
- **測試工具**: Vitest & Supertest
- **文件規範**: OpenAPI (Swagger)

## 🚀 快速開始 (Quick Start)

1. **複製環境設定**:
   ```bash
   cp .env.example .env
   ```
2. **安裝依賴**:
   ```bash
   npm install
   ```
3. **啟動專案**:
   ```bash
   npm start
   ```
   _系統將自動建立 `database.sqlite` 並初始化預設資料。_

## 📜 常用指令表

| 指令                 | 說明                                            |
| :------------------- | :---------------------------------------------- |
| `npm start`          | 建立 CSS 並啟動正式伺服器                       |
| `npm run dev:server` | 啟動開發環境伺服器 (具備熱重載建議搭配 nodemon) |
| `npm run dev:css`    | 監控 Tailwind CSS 變化並即時編譯                |
| `npm test`           | 執行 Vitest 所有測試案例                        |
| `npm run openapi`    | 重新產生 `openapi.json` 文件                    |

## 🔑 預設帳號 (Default Accounts)

| 角色               | 電子郵件                     | 密碼       |
| :----------------- | :--------------------------- | :--------- |
| **管理員 (Admin)** | `admin@hexschool.com`        | `12345678` |
| **一般使用者**     | _請透過前台註冊功能自行建立_ | -          |

## 🗺 頁面路由 (Page Routes)

### 前台 (Front-end)

- `/`: 首頁 (商品列表)
- `/product/:id`: 商品詳細頁
- `/cart`: 購物車頁面
- `/checkout`: 結帳頁面
- `/orders`: 會員訂單列表
- `/orders/:id`: 訂單詳細資訊
- `/login`: 登入/註冊頁面

### 後台 (Admin)

- `/admin/products`: 商品管理
- `/admin/orders`: 訂單管理

### 開發輔助

- `/api-docs`: Swagger 互動式 API 文件

## 📂 專案文件索引

### 核心設定

- `server.js`: 伺服器進入點，負責環境檢查與埠號監聽。
- `app.js`: 應用程式核心，整合中間件、路由與錯誤處理。
- `src/database.js`: 資料庫 Schema 定義與種子資料 (Seed Data) 初始化。
- `swagger-config.js`: Swagger 文件產生設定。

### 開發規範與文件 (`/docs`)

- `GEMINI.md`: 專案主要記憶文件 (Agent 優先讀取)。
- `docs/DEVELOPMENT.md`: 程式碼風格、命名規範與錯誤處理指南。
- `docs/ARCHITECTURE.md`: 系統架構圖與資料流說明。
- `docs/FEATURES.md`: 功能開發狀態清單。
- `docs/TESTING.md`: 測試規範與執行說明。

### 原始碼結構 (`/src`)

- `src/routes/`: 存放各模組的路由 (Auth, Cart, Orders, Products, Pages)。
- `src/middleware/`: 存放 JWT 驗證、管理員權限檢查等中間件。

### 視圖與前端 (`/views` & `/public`)

- `views/`: 存放 EJS 模板，包含佈局 (Layouts) 與元件 (Partials)。
- `public/js/`: 前端交互邏輯 (API 呼叫、購物車操作)。
- `public/css/`: Tailwind CSS 樣式檔案。
