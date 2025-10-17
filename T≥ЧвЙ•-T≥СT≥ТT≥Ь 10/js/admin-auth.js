// Административная аутентификация для ОБУВЬ
const ADMIN_EMAIL = 'admin.obuv@secure-shop.com';
const ADMIN_PASSWORD = 'ObuvSecure2024!Admin';
const ADMIN_TOKEN_KEY = 'admin_auth_token';
const ADMIN_USER_KEY = 'admin_user_data';

// Инициализация админ-аутентификации
function initAdminAuth() {
  const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const storedUser = localStorage.getItem(ADMIN_USER_KEY);
  
  if (storedToken && storedUser) {
    // Проверяем валидность токена (простая проверка)
    if (isValidAdminToken(storedToken)) {
      window.adminUser = JSON.parse(storedUser);
      return true;
    } else {
      clearAdminAuth();
    }
  }
  return false;
}

// Проверка валидности админ-токена
function isValidAdminToken(token) {
  try {
    const decoded = JSON.parse(atob(token));
    const now = Date.now();
    return decoded.expires > now && decoded.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

// Создание админ-токена
function createAdminToken() {
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 часа
  const tokenData = {
    email: ADMIN_EMAIL,
    expires: expires,
    role: 'admin',
    timestamp: Date.now()
  };
  return btoa(JSON.stringify(tokenData));
}

// Сохранение админ-аутентификации
function saveAdminAuth() {
  const token = createAdminToken();
  const user = {
    email: ADMIN_EMAIL,
    name: 'Администратор ОБУВЬ',
    role: 'admin',
    loginTime: new Date().toISOString()
  };
  
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  window.adminUser = user;
}

// Очистка админ-аутентификации
function clearAdminAuth() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  window.adminUser = null;
}

// Проверка админ-аутентификации
function isAdminAuthenticated() {
  return window.adminUser !== null;
}

// Аутентификация администратора
function authenticateAdmin(email, password) {
  // Проверяем учетные данные
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    saveAdminAuth();
    return { success: true, user: window.adminUser };
  } else {
    // Логируем неудачную попытку
    logFailedAttempt(email);
    return { 
      success: false, 
      error: 'Неверные учетные данные администратора' 
    };
  }
}

// Логирование неудачных попыток входа
function logFailedAttempt(email) {
  const attempts = JSON.parse(localStorage.getItem('admin_failed_attempts') || '[]');
  attempts.push({
    email: email,
    timestamp: new Date().toISOString(),
    ip: 'unknown' // В реальном приложении получали бы IP
  });
  
  // Оставляем только последние 10 попыток
  if (attempts.length > 10) {
    attempts.splice(0, attempts.length - 10);
  }
  
  localStorage.setItem('admin_failed_attempts', JSON.stringify(attempts));
  
  // Если слишком много попыток - временная блокировка
  const recentAttempts = attempts.filter(attempt => 
    Date.now() - new Date(attempt.timestamp).getTime() < 15 * 60 * 1000 // 15 минут
  );
  
  if (recentAttempts.length >= 5) {
    const blockUntil = Date.now() + (30 * 60 * 1000); // 30 минут блокировки
    localStorage.setItem('admin_blocked_until', blockUntil.toString());
    return { 
      success: false, 
      error: 'Слишком много неудачных попыток. Доступ заблокирован на 30 минут.',
      blocked: true
    };
  }
  
  return null;
}

// Проверка блокировки
function isAdminBlocked() {
  const blockedUntil = localStorage.getItem('admin_blocked_until');
  if (blockedUntil) {
    const blockTime = parseInt(blockedUntil);
    if (Date.now() < blockTime) {
      const remainingMinutes = Math.ceil((blockTime - Date.now()) / (60 * 1000));
      return {
        blocked: true,
        remainingMinutes: remainingMinutes
      };
    } else {
      localStorage.removeItem('admin_blocked_until');
    }
  }
  return { blocked: false };
}

// Показать сообщение об ошибке
function showAdminError(message) {
  const errorEl = document.getElementById('adminErrorMessage');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

// Скрыть сообщения
function hideAdminMessages() {
  const errorEl = document.getElementById('adminErrorMessage');
  if (errorEl) {
    errorEl.style.display = 'none';
  }
}

// Выход администратора
function adminLogout() {
  clearAdminAuth();
  window.location.href = 'admin-login.html';
}

// Экспорт функций для использования в других скриптах
window.adminAuth = {
  init: initAdminAuth,
  authenticate: authenticateAdmin,
  isAuthenticated: isAdminAuthenticated,
  logout: adminLogout,
  getCurrentUser: () => window.adminUser,
  isBlocked: isAdminBlocked
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем блокировку
  const blockStatus = isAdminBlocked();
  if (blockStatus.blocked) {
    showAdminError(`Доступ заблокирован. Попробуйте через ${blockStatus.remainingMinutes} минут.`);
    return;
  }
  
  // Обработка формы входа
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAdminMessages();

      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;

      if (!email || !password) {
        showAdminError('Заполните все поля');
        return;
      }

      const result = authenticateAdmin(email, password);
      if (result.success) {
        // Успешный вход
        showAdminError(''); // Очищаем ошибки
        document.getElementById('adminErrorMessage').style.display = 'none';
        
        // Показываем сообщение об успехе
        const successDiv = document.createElement('div');
        successDiv.style.cssText = 'margin-top: 12px; padding: 8px 12px; background: #dcfce7; color: #16a34a; border-radius: 8px; font-size: 14px;';
        successDiv.textContent = 'Успешный вход! Перенаправление...';
        loginForm.parentNode.insertBefore(successDiv, loginForm.nextSibling);
        
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 1000);
      } else {
        showAdminError(result.error);
      }
    });
  }
});
