# 專案功能 (FEATURES.md)

## 使用者功能 (Front-end)

### 首頁與商品展示
- **行為描述**: 存取 `/api/products` 獲取公開的商品列表。使用者點擊單一商品進入 `/product/:id` 查看詳情。
- **查詢參數**: 目前實作為全拿不分頁 (待擴充)。

### 購物車系統
- **行為描述**: 支援雙模式儲存。未登入者透過 `X-Session-Id` header 暫存購物車，登入者則關聯其 `user_id`。
- **加入購物車**: `POST /api/cart`，body 包含 `productId` 與 `quantity`。若商品已在購物車則會累加數量。加入時會即時檢查該商品的剩餘庫存。
- **更新數量/移除**: 分別為 `PUT /api/cart/:id` 與 `DELETE /api/cart/:id`。更新數量時同樣需檢查可用庫存。
- **錯誤情境**: 若加入的數量大於剩餘庫存回傳 400 (`VALIDATION_ERROR`)，找不到對應商品則回傳 404 (`NOT_FOUND`)。

### 結帳與訂單
- **行為描述**: 購物車確認完畢後提交至 `POST /api/orders`。
- **請求參數**: body 需提供收件資訊：`recipient_name`, `recipient_email`, `recipient_address`。
- **業務邏輯**: 
  1. 檢查使用者登入狀態 (JWT 必須存在)。
  2. 讀取該使用者目前的購物車內容與總額。
  3. 建立訂單 (Order) 與訂單明細 (Order Items)，生成唯一 `order_no`。
  4. (預期行為) 扣除商品庫存，並清空目前的購物車。
- **錯誤情境**: 若送出結帳時購物車為空，回傳 400 (`VALIDATION_ERROR`)。

### 結帳與金流 (ECPay)
- **行為描述**: 支援綠界科技 (ECPay) AIO 信用卡支付。
- **付款流程**:
  1. 訂單建立後，呼叫 `POST /api/orders/:id/ecpay/checkout-data` 取得綠界支付表單。
  2. 前端導轉至綠界支付頁面。
  3. 付款後返回商店，系統主動呼叫 `POST /api/orders/:id/ecpay/verify` 透過 `QueryTradeInfo` API 驗證付款狀態。
- **本地端驗證**: 由於本地開發環境無法接收 ReturnURL 通知，系統採用「主動查詢」機制確保訂單狀態同步。
- **安全機制**: 實作 SHA256 `CheckMacValue` 簽章與驗章，並使用 Timing-safe 比較防止計時攻擊。

### 個人中心
- **行為描述**: `GET /api/orders` 取得個人的歷史訂單列表，`GET /api/orders/:id` 取得單筆訂單的詳細購買明細。皆需 JWT 驗證。

## 權限與安全

### 註冊與登入
- **行為描述**:
  - `POST /api/auth/register`: body 需 `email`, `password`, `name`。密碼至少 6 字元，使用 `bcrypt` 進行 10 rounds 加密後存入資料庫。
  - `POST /api/auth/login`: body 需 `email`, `password`。驗證成功後核發 JWT (有效期限 7 天)。
- **錯誤情境**: 密碼錯誤或找不到帳號回傳 401 (`UNAUTHORIZED`)，註冊時 Email 若已存在回傳 409 (`CONFLICT`)。

## 管理員功能 (Admin Panel)

### 商品管理
- **行為描述**: 管理員可透過 `/api/admin/products` 進行 CRUD 完整操作。所有端點皆受到 `adminMiddleware` 保護。
- **欄位**: 包含 `name`, `price`, `stock`, `description`, `image_url` 等必要屬性。

### 訂單管理
- **行為描述**: 管理員可透過 `/api/admin/orders` 查看全站的所有訂單。可根據付款狀況調整訂單狀態 (Pending, Paid, Failed)。
