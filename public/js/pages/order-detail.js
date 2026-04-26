const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const el = document.getElementById('app');
    const orderId = el.dataset.orderId;
    const paymentResult = ref(el.dataset.paymentResult || null);

    const order = ref(null);
    const loading = ref(true);
    const paying = ref(false);

    const statusMap = {
      pending: { label: '待付款', cls: 'bg-apricot/20 text-apricot' },
      paid: { label: '已付款', cls: 'bg-sage/20 text-sage' },
      failed: { label: '付款失敗', cls: 'bg-red-100 text-red-600' },
    };

    const paymentMessages = {
      success: { text: '付款成功！感謝您的購買。', cls: 'bg-sage/10 text-sage border border-sage/20' },
      failed: { text: '付款失敗，請重試。', cls: 'bg-red-50 text-red-600 border border-red-100' },
      cancel: { text: '付款已取消。', cls: 'bg-apricot/10 text-apricot border border-apricot/20' },
    };

    const statusChecking = ref(false);

    async function goToEcpay() {
      if (!order.value || paying.value) return;
      window.location.href = '/orders/' + order.value.id + '/pay';
    }

    async function verifyEcpayPayment() {
      if (statusChecking.value) return;
      statusChecking.value = true;
      try {
        const res = await apiFetch('/api/orders/' + orderId + '/ecpay/verify', {
          method: 'POST'
        });
        order.value = res.data;
        if (order.value.status === 'paid') {
          paymentResult.value = 'success';
          Notification.show('付款已確認', 'success');
        } else {
          Notification.show('尚未收到付款資訊', 'info');
        }
      } catch (e) {
        Notification.show('驗證付款失敗', 'error');
      } finally {
        statusChecking.value = false;
      }
    }

    onMounted(async function () {
      try {
        const res = await apiFetch('/api/orders/' + orderId);
        order.value = res.data;

        // URL payment result handling
        const urlParams = new URLSearchParams(window.location.search);
        const result = urlParams.get('payment');
        if (result) {
          paymentResult.value = result;
          if (result === 'success' && order.value.status !== 'paid') {
            await verifyEcpayPayment();
          }
        }
      } catch (e) {
        Notification.show('載入訂單失敗', 'error');
      } finally {
        loading.value = false;
      }
    });

    return { order, loading, paying, statusChecking, paymentResult, statusMap, paymentMessages, goToEcpay, verifyEcpayPayment };
  }
}).mount('#app');
