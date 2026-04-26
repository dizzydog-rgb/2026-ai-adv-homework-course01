const { createApp, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const el = document.getElementById('app');
    const orderId = el.dataset.orderId;

    async function verifyPayment() {
      try {
        const res = await apiFetch('/api/orders/' + orderId + '/ecpay/verify', {
          method: 'POST'
        });
        
        if (res.data.status === 'paid') {
          window.location.href = `/orders/${orderId}?payment=success`;
        } else {
          window.location.href = `/orders/${orderId}?payment=failed`;
        }
      } catch (e) {
        Notification.show('驗證付款結果失敗', 'error');
        setTimeout(() => {
          window.location.href = '/orders/' + orderId;
        }, 2000);
      }
    }

    onMounted(verifyPayment);

    return {};
  }
}).mount('#app');
