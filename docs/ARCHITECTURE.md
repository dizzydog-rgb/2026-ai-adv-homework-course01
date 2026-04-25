# 架構說明 (ARCHITECTURE.md)

## 系統全貌
本專案採用典型的 MVC 架構變體，側重於後端渲染 (SSR) 與 RESTful API 的結合。前端使用 EJS 模板引擎，並透過 Vue 3 (CDN) 或原生 JavaScript 處理互動邏輯。

## 目錄結構與檔案說明
```text
project-root/
├── GEMINI.md                    # Gemini CLI 專案主要記憶文件
├── README.md                    # 專案快速入門與概覽
├── app.js                       # Express 應用程式設定（middleware、路由掛載）
├── server.js                    # 伺服器入口點（驗證 JWT_SECRET、監聽 port）
├── generate-openapi.js          # 從 JSDoc 產生 openapi.json
├── swagger-config.js            # OpenAPI 3.0 設定（安全機制、伺服器 URL）
├── vitest.config.js             # 測試設定
├── package.json                 # 依賴與 npm scripts
├── .env.example                 # 環境變數範本
├── .geminiignore                # Gemini CLI 忽略清單
│
├── src/
│   ├── database.js              # DB 初始化、schema 建立、種子資料 (better-sqlite3)
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT Bearer Token 驗證；解碼後注入 req.user
│   │   ├── adminMiddleware.js   # RBAC：確認 req.user.role === 'admin'
│   │   ├── sessionMiddleware.js # 從 X-Session-Id header 注入 req.sessionId
│   │   └── errorHandler.js      # 全域錯誤處理；統一錯誤回傳格式
│   └── routes/
│       ├── authRoutes.js        # 使用者註冊、登入、個人資料 API
│       ├── productRoutes.js     # 公開商品列表與詳情 API
│       ├── adminProductRoutes.js # 管理員商品 CRUD API
│       ├── cartRoutes.js        # 購物車 API (支援 JWT 或 sessionId)
│       ├── orderRoutes.js       # 使用者建立與查看訂單 API
│       ├── adminOrderRoutes.js  # 管理員查看與管理訂單 API
│       └── pageRoutes.js        # 伺服器渲染頁面路由 (EJS)
│
└── tests/
    ├── setup.js                 # 測試環境初始化與輔助工具
    └── ...                      # 其他測試檔案
```

## 啟動流程
1. `npm start` 執行 `npm run css:build` 與 `node server.js`。
2. `server.js` 驗證環境變數 `JWT_SECRET` 是否存在，若無則終止。
3. 載入 `app.js`，並於其內初始化 `database.js` (同步執行 SQLite 建立表與種子資料寫入)。
4. `app.js` 依序掛載全域 middlewares (cors, json, urlencoded, sessionMiddleware)。
5. `app.js` 掛載各 API 路由 (`/api/*`) 與頁面路由 (`/`)。
6. `server.js` 開始監聽指定的 PORT。

## API 路由總覽表
| 前綴 | 檔案 | 認證 | 說明 |
| --- | --- | --- | --- |
| `/api/auth` | `authRoutes.js` | 無/JWT | 註冊 (`/register`)、登入 (`/login`)、取得個人資料 (`/profile` 需 JWT) |
| `/api/products` | `productRoutes.js` | 無 | 取得公開商品列表與詳情 |
| `/api/cart` | `cartRoutes.js` | 雙模式 | 購物車操作，支援已登入(JWT)或未登入(SessionId) |
| `/api/orders` | `orderRoutes.js` | JWT | 使用者結帳建立訂單與查看個人歷史訂單 |
| `/api/admin/products` | `adminProductRoutes.js`| Admin | 管理員商品 CRUD |
| `/api/admin/orders` | `adminOrderRoutes.js` | Admin | 管理員查看與管理全站所有訂單 |
| `/` | `pageRoutes.js` | 依頁面 | EJS 伺服器渲染頁面路由 |

## 統一回應格式範例
為避免內部報錯資訊外流，並方便前端處理，所有 API 錯誤統一由 `errorHandler` 攔截，且回應格式皆使用：
```json
{
  "data": { ... },       // 成功時返回的物件，失敗時為 null
  "error": "ERROR_CODE", // 錯誤代碼字串 (例如 UNAUTHORIZED)，成功時為 null
  "message": "說明文字"    // 狀態描述或可讀的錯誤說明
}
```

## 認證與授權機制
- **機制**: JSON Web Token (JWT)
- **Token 參數**: Payload 包含 `userId`, `email`, `role`。加密演算法為 `HS256`。有效期設定為 `7d`。
- **Middleware 行為**: 
  - `authMiddleware`: 攔截請求，檢查 `Authorization: Bearer <token>`，解碼後至資料庫驗證使用者存在，並將解析資訊注入 `req.user`。
  - `adminMiddleware`: 依賴 `authMiddleware` 的結果，進一步檢查 `req.user.role === 'admin'`，否則回傳 403。
  - `sessionMiddleware`: 若無提供 JWT，檢查或核發 `X-Session-Id` header，用於未登入者的暫存購物車操作。

## 資料庫 Schema (SQLite)
使用 `better-sqlite3` 庫，並開啟 WAL 模式 (`journal_mode = WAL`) 以提升效能。
- **users**: `id` (UUID PRIMARY KEY), `email` (UNIQUE), `password_hash`, `name`, `role` (預設 'user', 可為 'admin'), `created_at`.
- **products**: `id` (UUID PRIMARY KEY), `name`, `description`, `price` (CHECK price > 0), `stock` (CHECK stock >= 0), `image_url`, `created_at`, `updated_at`.
- **cart_items**: `id` (UUID PRIMARY KEY), `session_id`, `user_id` (FK REFERENCES users), `product_id` (FK REFERENCES products), `quantity` (CHECK quantity > 0).
- **orders**: `id` (UUID PRIMARY KEY), `order_no` (UNIQUE), `user_id` (FK REFERENCES users), `recipient_name`, `recipient_email`, `recipient_address`, `total_amount`, `status` (CHECK status IN ('pending', 'paid', 'failed')), `created_at`.
- **order_items**: `id` (UUID PRIMARY KEY), `order_id` (FK REFERENCES orders), `product_id`, `product_name`, `product_price`, `quantity`.

## 金流整合流程 (未來擴充預留)
- 將實作 `ecpayService.js` 工具模組，用於封裝 CheckMacValue 的計算與 AIO 參數建立。
- 結帳成功時，訂單先設為 `pending`，並渲染一個自動提交的 HTML 表單跳轉至綠界。
- 在 `ReturnURL` 端點接收綠界付款結果，驗證無誤後將訂單轉為 `paid`。
