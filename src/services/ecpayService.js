const crypto = require('crypto');
const axios = require('axios');
const querystring = require('querystring');

class EcpayService {
  constructor() {
    this.merchantId = process.env.ECPAY_MERCHANT_ID || '3002607';
    this.hashKey = process.env.ECPAY_HASH_KEY || 'pwFHCqoQZGmho4w6';
    this.hashIv = process.env.ECPAY_HASH_IV || 'EkRm7iFT261dpevs';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    this.ecpayUrl = process.env.ECPAY_URL || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
    this.ecpayQueryUrl = process.env.ECPAY_QUERY_URL || 'https://payment-stage.ecpay.com.tw/Cashier/QueryTradeInfo/V5';
  }

  /**
   * Produce output identical to PHP urlencode()
   */
  phpUrlencode(s) {
    return encodeURIComponent(String(s))
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/%20/g, '+');
  }

  /**
   * ecpayUrlEncode — used for CheckMacValue (CMV)
   */
  ecpayUrlEncode(s) {
    let encoded = this.phpUrlencode(s);
    encoded = encoded.replace(/~/g, '%7E');
    encoded = encoded.toLowerCase();
    const netReplacements = [
      ['%2d', '-'],
      ['%5f', '_'],
      ['%2e', '.'],
      ['%21', '!'],
      ['%2a', '*'],
      ['%28', '('],
      ['%29', ')'],
    ];
    for (const [from, to] of netReplacements) {
      encoded = encoded.split(from).join(to);
    }
    return encoded;
  }

  /**
   * Calculate CheckMacValue
   */
  generateCheckMacValue(params) {
    const { CheckMacValue, ...rest } = params;
    const sortedKeys = Object.keys(rest).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const parts = sortedKeys.map(k => `${k}=${rest[k]}`);
    const raw = `HashKey=${this.hashKey}&${parts.join('&')}&HashIV=${this.hashIv}`;
    const encoded = this.ecpayUrlEncode(raw);
    return crypto.createHash('sha256').update(encoded, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * Verify CheckMacValue safely
   */
  verifyCheckMacValue(params) {
    const received = params.CheckMacValue;
    if (!received) return false;
    const computed = this.generateCheckMacValue(params);
    const bufA = Buffer.from(computed);
    const bufB = Buffer.from(received);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Get Taiwan Time (UTC+8)
   */
  getTaiwanTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 8));
  }

  /**
   * Build AIO Checkout Data
   */
  buildAioCheckoutData(order) {
    const twNow = this.getTaiwanTime();
    const formattedDate = twNow.getFullYear() + '/' + 
      String(twNow.getMonth() + 1).padStart(2, '0') + '/' + 
      String(twNow.getDate()).padStart(2, '0') + ' ' + 
      String(twNow.getHours()).padStart(2, '0') + ':' + 
      String(twNow.getMinutes()).padStart(2, '0') + ':' + 
      String(twNow.getSeconds()).padStart(2, '0');

    // MerchantTradeNo must be unique, using order_no + timestamp (max 20 chars)
    const timestamp = Date.now().toString().slice(-4);
    let merchantTradeNo = `${order.order_no.replace(/[^a-zA-Z0-9]/g, '')}${timestamp}`;
    if (merchantTradeNo.length > 20) {
      merchantTradeNo = merchantTradeNo.slice(0, 20);
    }

    // Ensure TotalAmount is a positive integer
    const totalAmount = Math.floor(order.total_amount || order.totalAmount || 0);
    
    const params = {
      MerchantID: this.merchantId,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: formattedDate,
      PaymentType: 'aio',
      TotalAmount: String(totalAmount),
      TradeDesc: 'Flower Shop Order',
      ItemName: order.items.map(item => `${item.product_name || 'Item'} x ${item.quantity}`).join('#').slice(0, 200),
      ReturnURL: `${this.baseUrl}/api/orders/ecpay/notify`,
      ClientBackURL: `${this.baseUrl}/ecpay/result?orderId=${order.id}`,
      ChoosePayment: 'Credit',
      EncryptType: 1
    };

    console.log('Building ECPay params with amount:', params.TotalAmount);

    params.CheckMacValue = this.generateCheckMacValue(params);
    return {
      action: this.ecpayUrl,
      fields: params
    };
  }

  /**
   * Query Trade Info
   */
  async queryTradeInfo(merchantTradeNo) {
    const params = {
      MerchantID: this.merchantId,
      MerchantTradeNo: merchantTradeNo,
      TimeStamp: Math.floor(Date.now() / 1000)
    };
    params.CheckMacValue = this.generateCheckMacValue(params);

    try {
      const response = await axios.post(this.ecpayQueryUrl, querystring.stringify(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      // Response is URL-encoded string
      return querystring.parse(response.data);
    } catch (error) {
      console.error('ECPay Query Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

module.exports = new EcpayService();
