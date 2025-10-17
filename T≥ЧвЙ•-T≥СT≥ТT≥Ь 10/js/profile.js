(function() {
  document.addEventListener('DOMContentLoaded', () => {
    // Require auth
    if (!window.auth || !window.auth.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    const user = window.auth.currentUser();
    document.getElementById('pName').textContent = user.name;
    document.getElementById('pEmail').textContent = user.email;

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', window.auth.logout);

    // Orders
    const ordersKey = 'orders_by_user_v1';
    const ordersByUser = JSON.parse(localStorage.getItem(ordersKey) || '{}');
    const orders = ordersByUser[user.email] || [];

    const empty = document.getElementById('ordersEmpty');
    const table = document.getElementById('ordersTable');
    const tbody = table.querySelector('tbody');

    if (!orders.length) {
      empty.style.display = 'block';
      table.style.display = 'none';
    } else {
      empty.style.display = 'none';
      table.style.display = '';
      tbody.innerHTML = orders.map(order => {
        const items = order.items.map(it => `${it.title} ×${it.quantity}`).join(', ');
        const total = order.total.toLocaleString('ru-RU') + ' ₽';
        const date = new Date(order.createdAt).toLocaleString('ru-RU');
        return `<tr><td>${date}</td><td>${items}</td><td>${total}</td></tr>`;
      }).join('');
    }

    // Coupons placeholder - could be fetched later from server
    const couponsContainer = document.getElementById('coupons');
    const couponsKey = 'coupons_by_user_v1';
    const couponsByUser = JSON.parse(localStorage.getItem(couponsKey) || '{}');
    const coupons = couponsByUser[user.email] || [];

    if (coupons.length) {
      couponsContainer.innerHTML = coupons.map(c => (
        `<div class="info" style="margin-bottom:8px;">
          <strong>Купон:</strong> ${c.code} — скидка ${c.discount}% (действует до ${new Date(c.expiresAt).toLocaleDateString('ru-RU')})
        </div>`
      )).join('');
    }
  });
})();
