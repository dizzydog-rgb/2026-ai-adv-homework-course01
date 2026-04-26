const { app, request, registerUser } = require('./setup');
const ecpayService = require('../src/services/ecpayService');
const axios = require('axios');

vi.mock('axios');

describe('ECPay Integration', () => {
  let userToken;
  let orderId;

  beforeAll(async () => {
    const { token } = await registerUser();
    userToken = token;

    // Create a product
    const adminToken = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hexschool.com', password: '12345678' });
    
    const prodRes = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken.body.data.token}`)
      .send({
        name: 'Test Flower',
        price: 100,
        stock: 10,
        description: 'Test description'
      });
    const productId = prodRes.body.data.id;

    // Add to cart
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });

    // Create order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        recipientName: 'Test Recipient',
        recipientEmail: 'test@example.com',
        recipientAddress: 'Test Address'
      });
    orderId = orderRes.body.data.id;
  });

  it('should generate correct CheckMacValue (vector test)', () => {
    const params = {
      MerchantID: '3002607',
      MerchantTradeNo: 'Test1234567890',
      MerchantTradeDate: '2025/01/01 12:00:00',
      PaymentType: 'aio',
      TotalAmount: '100',
      TradeDesc: '測試',
      ItemName: '測試商品',
      ReturnURL: 'https://example.com/notify',
      ChoosePayment: 'ALL',
      EncryptType: '1'
    };
    // Temporarily override service keys for this test
    const oldKey = ecpayService.hashKey;
    const oldIv = ecpayService.hashIv;
    ecpayService.hashKey = 'pwFHCqoQZGmho4w6';
    ecpayService.hashIv = 'EkRm7iFT261dpevs';
    
    const cmv = ecpayService.generateCheckMacValue(params);
    expect(cmv).toBe('291CBA324D31FB5A4BBBFDF2CFE5D32598524753AFD4959C3BF590C5B2F57FB2');
    
    ecpayService.hashKey = oldKey;
    ecpayService.hashIv = oldIv;
  });

  it('should return checkout-data', async () => {
    const res = await request(app)
      .post(`/api/orders/${orderId}/ecpay/checkout-data`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('action');
    expect(res.body.data).toHaveProperty('fields');
    expect(res.body.data.fields).toHaveProperty('CheckMacValue');
    expect(res.body.data.fields).toHaveProperty('MerchantTradeNo');
  });

  it('should verify payment successfully (mocked)', async () => {
    // Mock axios response for QueryTradeInfo
    const spy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: 'TradeStatus=1&RtnCode=1&MerchantTradeNo=TEST12345'
    });

    const res = await request(app)
      .post(`/api/orders/${orderId}/ecpay/verify`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('paid');
    expect(res.body.message).toBe('付款成功');
    spy.mockRestore();
  });

  it('should return 1|OK for notify endpoint', async () => {
    const params = {
      MerchantID: ecpayService.merchantId,
      MerchantTradeNo: 'TEST12345',
      RtnCode: '1'
    };
    params.CheckMacValue = ecpayService.generateCheckMacValue(params);

    const res = await request(app)
      .post('/api/orders/ecpay/notify')
      .send(params);

    expect(res.status).toBe(200);
    expect(res.text).toBe('1|OK');
  });
});
