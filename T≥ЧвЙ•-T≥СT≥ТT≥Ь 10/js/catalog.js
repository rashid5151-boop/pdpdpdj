(function() {
  const grid = document.getElementById('catalogGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');

  if (!grid) return;

  let products = getProducts();
  let query = '';
  let sort = '';

  function render(list) {
    grid.innerHTML = list.map(p => (
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

  function apply() {
    let list = products;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'price_asc':
        list = [...list].sort((a,b) => a.price - b.price);
        break;
      case 'price_desc':
        list = [...list].sort((a,b) => b.price - a.price);
        break;
      case 'title_asc':
        list = [...list].sort((a,b) => a.title.localeCompare(b.title, 'ru'));
        break;
      default:
        break;
    }
    render(list);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      query = e.target.value || '';
      apply();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sort = e.target.value || '';
      apply();
    });
  }

  apply();
})();

