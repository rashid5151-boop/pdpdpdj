(function() {
  const container = document.getElementById('productContainer');
  const relatedGrid = document.getElementById('relatedGrid');
  if (!container) return;

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const product = id ? getProductById(id) : null;

  if (!product) {
    container.innerHTML = `<div class="card"><div class="card-body">Товар не найден. <a href="catalog.html">Вернуться в каталог</a></div></div>`;
    return;
  }

  container.innerHTML = `
    <div class="grid" style="grid-template-columns: 1.1fr 1fr; align-items: start;">
      <div class="card"><img src="${product.image}" alt="${product.title}" style="width:100%; height:520px; object-fit:cover; border-top-left-radius:14px; border-top-right-radius:14px;"></div>
      <div class="card"><div class="card-body">
        <span class="badge">В наличии</span>
        <h1 style="margin:8px 0 6px;">${product.title}</h1>
        <div class="price" style="font-size:28px;">${product.price.toLocaleString('ru-RU')} ₽</div>
        <p style="margin:14px 0; color:#374151;">${product.desc}</p>
        <div style="display:flex; gap:10px;">
          <a class="btn" href="https://t.me/your_shoes_shop_bot" target="_blank" rel="noopener">Купить в Telegram</a>
          <a class="btn outline" href="catalog.html">Назад к каталогу</a>
        </div>
      </div></div>
    </div>
  `;

  if (relatedGrid) {
    const related = getProducts().filter(p => p.id !== product.id).slice(0, 4);
    relatedGrid.innerHTML = related.map(p => (
      `<a class="card product-card" href="product.html?id=${encodeURIComponent(p.id)}">
        <img src="${p.image}" alt="${p.title}">
        <div class="card-body">
          <div class="title">${p.title}</div>
          <div class="price">${p.price.toLocaleString('ru-RU')} ₽</div>
        </div>
      </a>`
    )).join('');
  }
})();

