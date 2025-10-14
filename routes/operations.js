const express = require('express');
const { db } = require('../server');
const router = express.Router();

// GET /api/operations
router.get('/', (req, res) => {
  db.all('SELECT * FROM operations', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/operations
router.post('/', (req, res) => {
  const { name, time_min } = req.body;
  if (!name || time_min === undefined) return res.status(400).json({ error: 'Missing fields' });
  db.run('INSERT INTO operations (name, time_min) VALUES (?, ?)', [name, time_min], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// PUT /api/operations/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, time_min } = req.body;
  db.run('UPDATE operations SET name = ?, time_min = ? WHERE id = ?', [name, time_min, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ updated: true });
  });
});

// DELETE /api/operations/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM operations WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  });
});

module.exports = router;
