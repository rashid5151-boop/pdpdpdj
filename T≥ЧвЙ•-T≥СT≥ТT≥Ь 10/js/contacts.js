(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const text = `Здравствуйте! Меня зовут ${name}. Email: ${email}. Вопрос: ${message}`;
    const url = `https://t.me/your_shoes_shop_bot?startapp=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });
})();

