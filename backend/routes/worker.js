const express = require('express');
const { db } = require('../server');
const router = express.Router();

// GET /api/workers
router.get('/', (req, res) => {
  db.all('SELECT * FROM workers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/workers
router.post('/', (req, res) => {
  const { rol, tarifa_hora, eficiencia } = req.body;
  if (!rol || tarifa_hora === undefined || eficiencia === undefined) return res.status(400).json({ error: 'Missing fields' });
  db.run('INSERT INTO workers (rol, tarifa_hora, eficiencia) VALUES (?, ?, ?)', [rol, tarifa_hora, eficiencia], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// PUT /api/workers/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { rol, tarifa_hora, eficiencia } = req.body;
  db.run('UPDATE workers SET rol = ?, tarifa_hora = ?, eficiencia = ? WHERE id = ?', [rol, tarifa_hora, eficiencia, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ updated: true });
  });
});

// DELETE /api/workers/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM workers WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  });
});

module.exports = router;
