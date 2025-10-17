const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data.db');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'access_denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'invalid_token' });
    }
    req.user = user;
    next();
  });
};

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    desc TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.get('SELECT COUNT(*) as cnt FROM products', (err, row) => {
    if (err) return console.error('Count error:', err);
    if (row && row.cnt === 0) {
      const defaults = [
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
      const stmt = db.prepare('INSERT INTO products (id, title, price, image, desc) VALUES (?, ?, ?, ?, ?)');
      defaults.forEach(p => stmt.run(p.id, p.title, p.price, p.image, p.desc));
      stmt.finalize();
      console.log('Seeded 10 products');
    }
  });
});

// Authentication Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'password_too_short' });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'database_error' });
      }
      
      if (row) {
        return res.status(409).json({ error: 'user_exists' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
        [name, email, hashedPassword], function(err) {
          if (err) {
            return res.status(500).json({ error: 'database_error' });
          }
          
          const token = jwt.sign(
            { id: this.lastID, email, name },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          res.status(201).json({
            token,
            user: { id: this.lastID, name, email }
          });
        });
    });
  } catch (error) {
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'database_error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'invalid_credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: 'server_error' });
    }
  });
});

app.get('/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Routes
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY rowid DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows);
  });
});

app.get('/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    res.json(row);
  });
});

app.post('/products', (req, res) => {
  const { id, title, price, image, desc } = req.body || {};
  if (!id || !title || !Number.isInteger(price) || !image || !desc) {
    return res.status(400).json({ error: 'bad_request' });
  }
  db.run('INSERT INTO products (id, title, price, image, desc) VALUES (?, ?, ?, ?, ?)',
    [id, title, price, image, desc], function(err) {
      if (err) return res.status(409).json({ error: 'exists_or_db' });
      res.status(201).json({ id });
    });
});

app.put('/products/:id', (req, res) => {
  const { title, price, image, desc } = req.body || {};
  if (!title || !Number.isInteger(price) || !image || !desc) {
    return res.status(400).json({ error: 'bad_request' });
  }
  db.run('UPDATE products SET title=?, price=?, image=?, desc=? WHERE id=?',
    [title, price, image, desc, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: 'db_error' });
      if (this.changes === 0) return res.status(404).json({ error: 'not_found' });
      res.json({ ok: true });
    });
});

app.delete('/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (this.changes === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


