(function() {
  // Проверка аутентификации для админ-панели
  document.addEventListener('DOMContentLoaded', async () => {
    // Ждем инициализации admin-auth.js
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Проверяем админ-аутентификацию
    let hasAdminAuth = false;
    if (window.adminAuth) {
      window.adminAuth.init();
      hasAdminAuth = window.adminAuth.isAuthenticated();
    }
    
    // Если нет админ-аутентификации - перенаправляем на админ-логин
    if (!hasAdminAuth) {
      alert('Доступ к админ-панели ограничен. Необходима аутентификация администратора.');
      window.location.href = 'admin-login.html';
      return;
    }

    // Показываем админ-панель для аутентифицированного администратора
    const loadingIndicator = document.getElementById('loadingIndicator');
    const adminContent = document.getElementById('adminContent');
    const adminMode = document.getElementById('adminMode');
    
    if (adminMode) {
      adminMode.textContent = 'Админ-панель - доступ авторизован';
    }
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    if (adminContent) {
      adminContent.style.display = 'block';
    }
    
    // Добавляем кнопку выхода для администратора
    addAdminLogoutButton();
  });

  // Функция добавления кнопки выхода администратора
  function addAdminLogoutButton() {
    const adminMode = document.getElementById('adminMode');
    if (adminMode && window.adminAuth) {
      const logoutBtn = document.createElement('button');
      logoutBtn.textContent = 'Выйти';
      logoutBtn.className = 'btn outline';
      logoutBtn.style.marginLeft = '12px';
      logoutBtn.style.fontSize = '14px';
      logoutBtn.style.padding = '6px 12px';
      logoutBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите выйти из админ-панели?')) {
          window.adminAuth.logout();
        }
      });
      adminMode.parentNode.appendChild(logoutBtn);
    }
  }

  const form = document.getElementById('productForm');
  const tableBody = document.querySelector('#productsTable tbody');
  const resetBtn = document.getElementById('resetBtn');

  if (!form || !tableBody) return;

  function clearForm() {
    form.reset();
  }

  function loadToForm(product) {
    document.getElementById('fId').value = product.id;
    document.getElementById('fTitle').value = product.title;
    document.getElementById('fPrice').value = product.price;
    document.getElementById('fImage').value = product.image;
    document.getElementById('fDesc').value = product.desc;
  }

  function render() {
    const products = getProducts();
    tableBody.innerHTML = products.map(p => (
      `<tr>
        <td>${p.id}</td>
        <td>${p.title}</td>
        <td>${p.price.toLocaleString('ru-RU')} ₽</td>
        <td>
          <button class="btn outline" data-edit="${p.id}">Редактировать</button>
          <button class="btn" data-delete="${p.id}">Удалить</button>
        </td>
      </tr>`
    )).join('');
  }

  tableBody.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    const id = target.getAttribute('data-edit') || target.getAttribute('data-delete');
    if (!id) return;
    const products = getProducts();
    if (target.hasAttribute('data-edit')) {
      const found = products.find(p => p.id === id);
      if (found) loadToForm(found);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target.hasAttribute('data-delete')) {
      if (confirm('Удалить товар?')) {
        (async () => {
          try {
            await apiDeleteProduct(id);
            await syncFromApi();
          } catch (_) {
            const next = products.filter(p => p.id !== id);
            saveProducts(next);
          }
          render();
        })();
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('fId').value.trim();
    const title = document.getElementById('fTitle').value.trim();
    const price = Number(document.getElementById('fPrice').value);
    const image = document.getElementById('fImage').value.trim();
    const desc = document.getElementById('fDesc').value.trim();
    if (!id || !title || !image || !desc || isNaN(price)) return;

    const products = getProducts();
    const existingIndex = products.findIndex(p => p.id === id);
    const payload = { id, title, price, image, desc };
    (async () => {
      try {
        if (existingIndex >= 0) {
          await apiUpdateProduct(id, payload);
        } else {
          await apiCreateProduct(payload);
        }
        await syncFromApi();
      } catch (_) {
        // fallback to local if API not available
        if (existingIndex >= 0) {
          products[existingIndex] = payload;
          saveProducts(products);
        } else {
          saveProducts([payload, ...products]);
        }
      }
      render();
      clearForm();
    })();
  });

  if (resetBtn) resetBtn.addEventListener('click', clearForm);

  render();
})();

