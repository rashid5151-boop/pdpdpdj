// Общие скрипты для сайта ОБУВЬ
(function() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // Инициализация корзины
  if (typeof cart !== 'undefined') {
    cart.updateCartUI();
  }

  // Render hits on home
  const hitsGrid = document.getElementById('hitsGrid');
  if (hitsGrid) {
    const products = getProducts().slice(0, 4);
    hitsGrid.innerHTML = products.map(p => (
      `<div class="card product-card">
        <a href="product.html?id=${encodeURIComponent(p.id)}">
          <img src="${p.image}" alt="${p.title}">
          <div class="card-body">
            <div class="title">${p.title}</div>
            <div class="price">${p.price.toLocaleString('ru-RU')} ₽</div>
          </div>
        </a>
        <div class="product-actions">
          <button class="btn" onclick="addToCartFromPromo('${p.id}')">В корзину</button>
        </div>
      </div>`
    )).join('');
  }

  // Render new sneakers on home
  const newSneakersGrid = document.getElementById('newSneakersGrid');
  if (newSneakersGrid) {
    // Фильтруем только кроссовки (по ключевым словам в названии)
    const sneakersKeywords = ['кроссовки', 'sneakers', 'runner', 'air', 'flex', 'run', 'sport'];
    const allProducts = getProducts();
    const sneakers = allProducts.filter(p => 
      sneakersKeywords.some(keyword => 
        p.title.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    // Берем последние 4 кроссовки как "новые"
    const newSneakers = sneakers.slice(-4);
    
    newSneakersGrid.innerHTML = newSneakers.map(p => (
      `<div class="card product-card">
        <a href="product.html?id=${encodeURIComponent(p.id)}">
          <img src="${p.image}" alt="${p.title}">
          <div class="card-body">
            <div class="title">${p.title}</div>
            <div class="price">${p.price.toLocaleString('ru-RU')} ₽</div>
          </div>
        </a>
        <div class="product-actions">
          <button class="btn" onclick="addToCartFromPromo('${p.id}')">В корзину</button>
        </div>
      </div>`
    )).join('');
  }
})();

// Функция для добавления товара в корзину из раздела акций
function addToCartFromPromo(productId) {
  console.log('Adding to cart:', productId); // Отладочная информация
  const product = getProductById(productId);
  if (product) {
    if (typeof cart !== 'undefined') {
      cart.addItem(product, 1);
      // Показываем уведомление
      showNotification('Товар добавлен в корзину!');
    } else {
      console.error('Cart not initialized');
      showNotification('Ошибка: корзина не инициализирована');
    }
  } else {
    console.error('Product not found:', productId);
    showNotification('Ошибка: товар не найден');
  }
}

// Функция показа уведомлений
function showNotification(message) {
  // Создаем элемент уведомления
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  // Добавляем стили
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--pink-600);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  // Добавляем анимацию
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Удаляем уведомление через 3 секунды
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
}

