/**
 * Корзина для магазина ОБУВЬ
 * 
 * Функциональность:
 * - Добавление/удаление товаров
 * - Изменение количества
 * - Сохранение в localStorage
 * - Автоматическое обновление UI
 * - Модальное окно корзины
 * - Оформление заказа
 */
class Cart {
  constructor() {
    this.storageKey = 'obuv_cart_v1';
    this.items = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    this.saveToStorage();
    this.updateCartUI();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveToStorage();
    this.updateCartUI();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveToStorage();
        this.updateCartUI();
      }
    }
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  clear() {
    this.items = [];
    this.saveToStorage();
    this.updateCartUI();
  }

  getItems() {
    return [...this.items];
  }

  updateCartUI() {
    // Обновляем счетчик в хедере
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      const totalItems = this.getTotalItems();
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }

    // Обновляем содержимое корзины если она открыта
    const cartContent = document.getElementById('cartContent');
    if (cartContent) {
      this.renderCartContent(cartContent);
    }

    // Обновляем общую стоимость
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
      cartTotal.textContent = this.getTotalPrice().toLocaleString('ru-RU') + ' ₽';
    }
  }

  renderCartContent(container) {
    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <p>Корзина пуста</p>
          <a href="catalog.html" class="btn">Перейти в каталог</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="cart-items">
        ${this.items.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-info">
              <h4>${item.title}</h4>
              <p class="cart-item-price">${item.price.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div class="cart-item-controls">
              <button class="cart-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
              <span class="cart-quantity">${item.quantity}</span>
              <button class="cart-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
              <button class="cart-remove" onclick="cart.removeItem('${item.id}')" title="Удалить">×</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <strong>Итого: <span id="cartTotal">${this.getTotalPrice().toLocaleString('ru-RU')} ₽</span></strong>
        </div>
        <div class="cart-actions">
          <button class="btn outline" onclick="cart.clear()">Очистить</button>
          <button class="btn" onclick="checkout()">Оформить заказ</button>
        </div>
      </div>
    `;
  }

  toggleCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.classList.toggle('open');
      if (cartModal.classList.contains('open')) {
        this.updateCartUI();
        // Добавляем обработчик клика вне модального окна
        this.addOutsideClickListener(cartModal);
      }
    }
  }

  addOutsideClickListener(modal) {
    const outsideClickHandler = (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        modal.removeEventListener('click', outsideClickHandler);
      }
    };
    modal.addEventListener('click', outsideClickHandler);
  }
}

// Создаем глобальный экземпляр корзины
const cart = new Cart();

// Функция оформления заказа
function checkout() {
  if (cart.getItems().length === 0) {
    alert('Корзина пуста');
    return;
  }
  
  const total = cart.getTotalPrice();
  const items = cart.getItems();
  
  // Сохраняем заказ в историю пользователя (если залогинен)
  try {
    if (window.auth && window.auth.isAuthenticated()) {
      const user = window.auth.currentUser();
      const ordersKey = 'orders_by_user_v1';
      const ordersByUser = JSON.parse(localStorage.getItem(ordersKey) || '{}');
      const userOrders = ordersByUser[user.email] || [];
      userOrders.unshift({
        id: 'ord_' + Date.now(),
        items,
        total,
        createdAt: new Date().toISOString()
      });
      ordersByUser[user.email] = userOrders;
      localStorage.setItem(ordersKey, JSON.stringify(ordersByUser));
    }
  } catch (_) {}
  
  // Простое оформление заказа через alert
  const orderDetails = items.map(item => 
    `${item.title} x${item.quantity} = ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`
  ).join('\n');
  
  alert(`Заказ оформлен!\n\n${orderDetails}\n\nИтого: ${total.toLocaleString('ru-RU')} ₽\n\nСпасибо за покупку!`);
  
  cart.clear();
  cart.toggleCart();
}

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  cart.updateCartUI();
  
  // Добавляем обработчик клавиши Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const cartModal = document.getElementById('cartModal');
      if (cartModal && cartModal.classList.contains('open')) {
        cartModal.classList.remove('open');
      }
    }
  });
});

