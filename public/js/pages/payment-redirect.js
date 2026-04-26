const { createApp, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const el = document.getElementById('app');
    const orderId = el.dataset.orderId;

    async function startPayment() {
      try {
        const res = await apiFetch('/api/orders/' + orderId + '/ecpay/checkout-data', {
          method: 'POST'
        });
        const { action, fields } = res.data;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = action;

        for (const key in fields) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = fields[key];
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      } catch (e) {
        Notification.show('啟動付款失敗', 'error');
        setTimeout(() => {
          window.location.href = '/orders/' + orderId;
        }, 2000);
      }
    }

    onMounted(startPayment);

    return {};
  }
}).mount('#app');
