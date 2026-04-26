# 開發規範 (DEVELOPMENT.md)

## 命名規則對照表
| 項目 | 規則 | 範例 |
| --- | --- | --- |
| 變數與函式 | camelCase | `getCartTotal`, `userData` |
| 類別與建構式 | PascalCase | `Database`, `CartItem` |
| 檔案名稱 | kebab-case | `auth-middleware.js`, `error-handler.js` |
| 路由檔案 | camelCase | `authRoutes.js`, `adminProductRoutes.js` |
| 資料庫表名 | snake_case (複數) | `cart_items`, `users` |
| 資料庫欄位 | snake_case | `password_hash`, `created_at` |

## 模組系統說明
- 使用 Node.js CommonJS 模組系統 (`require` / `module.exports`)。
- 路由模組統一匯出 `express.Router()` 實例，並交由 `app.js` 中的 `app.use` 統一掛載路徑前綴。
- 資料庫實例由 `src/database.js` 建立連線後單例匯出。

## 新增 API/Middleware/DB 的步驟
1. **DB**: 若需新增資料表，至 `src/database.js` 內修改 `initializeDatabase` 函式，補上 `CREATE TABLE` 語法。
2. **Middleware**: 於 `src/middleware/` 建立新檔案，匯出標準的 Express 中介軟體結構 `(req, res, next) => {}`。
3. **API 路由**: 
   - 於 `src/routes/` 建立對應的路由檔案 (如 `featureRoutes.js`)。
   - 使用 `@openapi` 的 JSDoc 格式撰寫 Swagger API 文件註解。
   - 於 `app.js` 中引入並掛載路徑 (如 `app.use('/api/feature', require('./src/routes/featureRoutes'))`)。

## JSDoc 格式說明與範例
API 文件依賴 `swagger-jsdoc` 解析路由檔案中的註解來產生 `openapi.json`：
```javascript
/**
 * @openapi
 * /api/feature/example:
 *   get:
 *     summary: 範例 API
 *     tags: [Feature]
 *     responses:
 *       200:
 *         description: 請求成功
 */
```

## 環境變數表
| 變數 | 用途 | 必要性 | 預設值 |
| --- | --- | --- | --- |
| `JWT_SECRET` | 用於簽署 JWT 的金鑰 | 必須 | 無 (若無則 `server.js` 報錯終止) |
| `PORT` | 伺服器監聽的埠號 | 選填 | `3001` |
| `BASE_URL` | 後端伺服器 URL | 選填 | `http://localhost:3001` |
| `FRONTEND_URL` | CORS 允許的來源網址 | 選填 | `http://localhost:5173` |
| `ADMIN_EMAIL` | Seed 資料建立的預設管理員帳號 | 選填 | `admin@hexschool.com` |
| `ADMIN_PASSWORD` | Seed 資料建立的預設管理員密碼 | 選填 | `12345678` |
| `ECPAY_MERCHANT_ID`| 綠界特店編號 | 選填 | `3002607` (測試) |
| `ECPAY_HASH_KEY` | 綠界 Hash Key | 選填 | `pwFHCqoQZGmho4w6` (測試) |
| `ECPAY_HASH_IV` | 綠界 Hash IV | 選填 | `EkRm7iFT261dpevs` (測試) |
| `ECPAY_URL` | 綠界支付 AIO 端點 | 選填 | `https://payment-stage...` |
| `ECPAY_QUERY_URL` | 綠界查詢交易端點 | 選填 | `https://payment-stage...` |

## 計畫歸檔流程
為了保持開發紀錄的整潔並遵循 AI 輔助開發的規範：
1. **計畫檔案命名格式**：`YYYY-MM-DD-<feature-name>.md`
2. **計畫文件結構**：必須包含 User Story → Spec → Tasks
3. **歸檔**：功能完成並通過測試後，將該計畫檔案移至 `docs/plans/archive/` 目錄。
4. **狀態更新**：同步更新 `docs/FEATURES.md` 的功能狀態與 `docs/CHANGELOG.md` 的更新紀錄。
