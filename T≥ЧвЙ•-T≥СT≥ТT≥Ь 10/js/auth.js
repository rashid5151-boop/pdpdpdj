// Authentication functionality for ОБУВЬ
const API_URL = 'http://localhost:3000';

// Auth state management
let currentUser = null;
let authToken = null;

// Initialize auth state from localStorage
function initAuth() {
  const storedToken = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('current_user');
  
  if (storedToken && storedUser) {
    authToken = storedToken;
    currentUser = JSON.parse(storedUser);
    updateNavigation();
  }
}

// Save auth state to localStorage
function saveAuthState(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('current_user', JSON.stringify(user));
  updateNavigation();
}

// Clear auth state
function clearAuthState() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
  updateNavigation();
}

// Update navigation based on auth state
function updateNavigation() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  // Remove existing auth buttons
  const existingAuth = navLinks.querySelector('.auth-buttons');
  if (existingAuth) {
    existingAuth.remove();
  }

  // Create auth buttons container
  const authButtons = document.createElement('div');
  authButtons.className = 'auth-buttons';
  authButtons.style.display = 'flex';
  authButtons.style.gap = '8px';
  authButtons.style.alignItems = 'center';

  if (currentUser) {
    // User is logged in
    const profileLink = document.createElement('a');
    profileLink.href = 'profile.html';
    profileLink.textContent = 'Профиль';
    profileLink.className = '';
    profileLink.style.textDecoration = 'none';

    const welcomeText = document.createElement('span');
    welcomeText.textContent = `Привет, ${currentUser.name}`;
    welcomeText.style.color = 'var(--gray-700)';
    welcomeText.style.fontSize = '14px';
    welcomeText.style.marginRight = '8px';

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Выйти';
    logoutBtn.className = 'btn outline';
    logoutBtn.style.fontSize = '14px';
    logoutBtn.style.padding = '6px 12px';
    logoutBtn.addEventListener('click', logout);

    authButtons.appendChild(profileLink);
    authButtons.appendChild(welcomeText);
    authButtons.appendChild(logoutBtn);
  } else {
    // User is not logged in
    const loginBtn = document.createElement('a');
    loginBtn.href = 'login.html';
    loginBtn.textContent = 'Войти';
    loginBtn.className = 'btn outline';
    loginBtn.style.fontSize = '14px';
    loginBtn.style.padding = '6px 12px';
    loginBtn.style.textDecoration = 'none';

    const registerBtn = document.createElement('a');
    registerBtn.href = 'register.html';
    registerBtn.textContent = 'Регистрация';
    registerBtn.className = 'btn';
    registerBtn.style.fontSize = '14px';
    registerBtn.style.padding = '6px 12px';
    registerBtn.style.textDecoration = 'none';

    authButtons.appendChild(loginBtn);
    authButtons.appendChild(registerBtn);
  }

  navLinks.appendChild(authButtons);
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

// Show success message
function showSuccess(message) {
  const successEl = document.getElementById('successMessage');
  if (successEl) {
    successEl.textContent = message;
    successEl.style.display = 'block';
  }
}

// Hide messages
function hideMessages() {
  const errorEl = document.getElementById('errorMessage');
  const successEl = document.getElementById('successMessage');
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
}

// Login function
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа');
    }

    saveAuthState(data.token, data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Register function
async function register(name, email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }

    saveAuthState(data.token, data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: error.message };
  }
}

// Logout function
function logout() {
  clearAuthState();
  if (window.location.pathname.includes('admin.html')) {
    window.location.href = 'index.html';
  }
}

// Check if user is authenticated
function isAuthenticated() {
  return currentUser !== null && authToken !== null;
}

// Get auth headers for API requests
function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };
}

// Verify token with server
async function verifyToken() {
  if (!authToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      localStorage.setItem('current_user', JSON.stringify(currentUser));
      return true;
    } else {
      clearAuthState();
      return false;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    clearAuthState();
    return false;
  }
}

// Error message translations
const errorMessages = {
  'missing_fields': 'Заполните все поля',
  'password_too_short': 'Пароль должен содержать минимум 6 символов',
  'user_exists': 'Пользователь с таким email уже существует',
  'invalid_credentials': 'Неверный email или пароль',
  'access_denied': 'Доступ запрещен',
  'invalid_token': 'Недействительный токен',
  'database_error': 'Ошибка базы данных',
  'server_error': 'Ошибка сервера',
};

function translateError(errorCode) {
  return errorMessages[errorCode] || 'Произошла ошибка';
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  
  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessages();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showError('Заполните все поля');
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        showSuccess('Успешный вход! Перенаправление...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showError(translateError(result.error));
      }
    });
  }

  // Handle registration form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessages();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!name || !email || !password || !confirmPassword) {
        showError('Заполните все поля');
        return;
      }

      if (password !== confirmPassword) {
        showError('Пароли не совпадают');
        return;
      }

      if (password.length < 6) {
        showError('Пароль должен содержать минимум 6 символов');
        return;
      }

      const result = await register(name, email, password);
      if (result.success) {
        showSuccess('Регистрация успешна! Перенаправление...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showError(translateError(result.error));
      }
    });
  }
});

// Export functions for use in other scripts
window.auth = {
  login,
  register,
  logout,
  isAuthenticated,
  getAuthHeaders,
  verifyToken,
  currentUser: () => currentUser,
  authToken: () => authToken,
};
