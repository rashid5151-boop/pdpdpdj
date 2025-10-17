// База товаров (10 пар обуви)
const DEFAULT_PRODUCTS = [
  { id: 's1', title: 'Air Flex Pink', price: 6990, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop', desc: 'Лёгкие кроссовки для повседневных прогулок. Дышащая сетка, мягкая подошва.' },
  { id: 's2', title: 'Urban Runner', price: 7590, image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1000&auto=format&fit=crop', desc: 'Городские кроссовки с амортизацией и устойчивой подошвой.' },
  { id: 's3', title: 'Classic White', price: 6490, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop', desc: 'Классические белые кеды — чистый стиль, подходит ко всему.' },
  { id: 's4', title: 'Trail Pro', price: 8290, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop', desc: 'Треккинговые кроссовки для бездорожья, надёжное сцепление.' },
  { id: 's5', title: 'City Boot', price: 8890, image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1000&auto=format&fit=crop', desc: 'Кожаные ботинки для города — тепло и стильно.' },
  { id: 's6', title: 'Summer Breeze', price: 5590, image: 'https://images.unsplash.com/photo-1520975922284-021c8e2f9e1e?q=80&w=1000&auto=format&fit=crop', desc: 'Лёгкие кеды для лета, комфорт и свобода.' },
  { id: 's7', title: 'RunLite 2.0', price: 7990, image: 'https://images.unsplash.com/photo-1546470427-e261d63a9f39?q=80&w=1000&auto=format&fit=crop', desc: 'Беговые кроссовки с поддержкой свода стопы.' },
  { id: 's8', title: 'Pink Glow', price: 7290, image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop', desc: 'Ярко-розовые акценты для выразительного образа.' },
  { id: 's9', title: 'Office Chic', price: 9490, image: 'https://images.unsplash.com/photo-1544435253-bfc36ef8b9df?q=80&w=1000&auto=format&fit=crop', desc: 'Туфли-лодочки для офиса и мероприятий. Лаконичный дизайн.' },
  { id: 's10', title: 'Warm Trek', price: 9990, image: 'https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1000&auto=format&fit=crop', desc: 'Зимние ботинки с меховой подкладкой и защитой от влаги.' },
];

const STORAGE_KEY = 'obuv_products_v1';
const API_URL = 'http://localhost:3000';

function initStorage() {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(existing) || existing.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    }
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  }
}

async function syncFromApi() {
  try {
    const res = await fetch(`${API_URL}/products`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      saveProducts(data);
    }
  } catch (_) {
    // offline or API not available — silently ignore
  }
}

function getProducts() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : DEFAULT_PRODUCTS;
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getProductById(id) {
  return getProducts().find(p => p.id === id);
}

initStorage();
// Try to pull fresh data from API on load (non-blocking)
syncFromApi();

// API helpers used by admin
async function apiCreateProduct(product) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('api_create_failed');
}

async function apiUpdateProduct(id, product) {
  const res = await fetch(`${API_URL}/products/${encodeURIComponent(id)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('api_update_failed');
}

async function apiDeleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('api_delete_failed');
}

