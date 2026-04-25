# 測試規範 (TESTING.md)

## 測試環境
- **框架**: Vitest
- **HTTP 測試**: Supertest
- **測試資料庫**: 當 `NODE_ENV=test` 時，`better-sqlite3` 可透過特定邏輯採用不同的檔案名稱或切換 `bcrypt` 的複雜度來加速測試執行。

## 測試檔案表
| 檔案 | 測試範圍 | 說明 |
| --- | --- | --- |
| `setup.js` | 輔助與共用模組 | 不包含實質測試案例。提供被測的 `app` 實例、`request`、`getAdminToken()` 與 `registerUser()` 輔助函式 |
| `auth.test.js` | `/api/auth/*` | 註冊、登入的邏輯驗證，個人資料的取得與 JWT 有效性/格式錯誤等驗證 |
| `products.test.js` | `/api/products/*` | 首頁公開商品列表與詳情取得的正確性 |
| `cart.test.js` | `/api/cart/*` | 包含已登入、未登入(SessionId) 狀態下，購物車加入、更新數量、刪除及庫存上限驗證 |
| `orders.test.js` | `/api/orders/*` | 驗證結帳時是否成功建立訂單及訂單明細，並檢查未授權訪問的阻擋機制 |
| `adminProducts.test.js` | `/api/admin/products/*` | 確認僅具備 `admin` 角色的 JWT 能進行商品的 CRUD 操作 |
| `adminOrders.test.js` | `/api/admin/orders/*` | 確認僅具備 `admin` 角色的 JWT 能調整訂單狀態或瀏覽全站訂單 |

## 執行順序與依賴關係
- Vitest 預設為平行 (Parallel) 執行測試檔案。
- **注意**：由於 SQLite 檔案鎖定的特性 (database is locked)，若多個測試檔案同時對資料庫進行大量寫入操作可能引發衝突。撰寫測試時請盡量讓每個測試案例獨立，不要依賴全域的測試狀態，或在必要時將 Vitest 設置為序列執行 (Sequence)。

## 撰寫新測試的步驟與範例
1. 在 `tests/` 目錄下建立新的 `*.test.js`。
2. 引入 `setup.js` 的輔助函式。
3. 針對目標 API 撰寫「正確路徑」與「邊界情況/錯誤防護」。

**範例**：
```javascript
const { request, app, registerUser } = require('./setup');

describe('Feature API', () => {
  it('should return 401 if not logged in', async () => {
    const res = await request(app).get('/api/feature');
    expect(res.status).toBe(401);
  });

  it('should return 200 for valid user', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get('/api/feature')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
```

## 常見陷阱
- **密碼加密效能瓶頸**: 測試環境中，`bcrypt` 的 saltRounds 應降為 1 (見 `database.js`)，否則在包含大量登入/註冊的測試中會嚴重拖慢執行時間。
- **認證 Token 遺漏**: 呼叫需驗證的端點時，忘記在 Supertest 加上 `.set('Authorization', 'Bearer ' + token)` 導致未預期的 401 錯誤。
