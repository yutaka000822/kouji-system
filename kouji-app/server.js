const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;
const db = new Database(path.join(__dirname, 'kouji.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS kouji (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kouji_name TEXT NOT NULL,
    tanto_name TEXT,
    status TEXT
  )
`);

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'kouji.html'));
});

app.use(express.static(__dirname));

app.get('/api/kouji', (req, res) => {
  const rows = db
    .prepare('SELECT id, kouji_name, tanto_name, status FROM kouji ORDER BY id')
    .all();
  res.json(rows);
});

app.post('/api/kouji', (req, res) => {
  const { kouji_name, tanto_name, status } = req.body;
  if (!kouji_name || !String(kouji_name).trim()) {
    return res.status(400).json({ error: '工事名は必須です' });
  }
  const result = db
    .prepare('INSERT INTO kouji (kouji_name, tanto_name, status) VALUES (?, ?, ?)')
    .run(String(kouji_name).trim(), String(tanto_name || '').trim(), status || '進行中');
  const row = db
    .prepare('SELECT id, kouji_name, tanto_name, status FROM kouji WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json(row);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});