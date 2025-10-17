const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.db');

const db = new sqlite3.Database(DB_PATH);

async function createAdmin() {
  try {
    // Проверяем, есть ли уже админ
    db.get('SELECT * FROM users WHERE email = ?', ['admin.obuv@secure-shop.com'], async (err, row) => {
      if (err) {
        console.error('Ошибка проверки админа:', err);
        process.exit(1);
      }
      
      if (row) {
        console.log('Администратор уже существует!');
        console.log('Email: admin.obuv@secure-shop.com');
        console.log('Пароль: ObuvSecure2024!Admin');
        process.exit(0);
      }

      // Создаем админа
      const hashedPassword = await bcrypt.hash('ObuvSecure2024!Admin', 10);
      
      db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
        ['Администратор ОБУВЬ', 'admin.obuv@secure-shop.com', hashedPassword], function(err) {
          if (err) {
            console.error('Ошибка создания админа:', err);
            process.exit(1);
          }
          
          console.log('Администратор создан успешно!');
          console.log('Email: admin.obuv@secure-shop.com');
          console.log('Пароль: ObuvSecure2024!Admin');
          console.log('ID:', this.lastID);
          
          process.exit(0);
        });
    });
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

createAdmin();
