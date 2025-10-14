const express = require('express');
const { db } = require('../server');
const router = express.Router();

// Helper to get style with operations
const getStyleWithOps = (styleId, callback) => {
  db.get('SELECT * FROM styles WHERE id = ?', [styleId], (err, style) => {
    if (err || !style) return callback(err || new Error('Style not found'), null);
    db.all(`
      SELECT so.sequence, so.qty_por_unidad, o.name as op_name, o.time_min
      FROM style_operations so
      JOIN operations o ON so.operation_id = o.id
      WHERE so.style_id = ?
      ORDER BY so.sequence
    `, [styleId], (err, ops) => {
      if (err) return callback(err, null);
      callback(null, { ...style, operations: ops });
    });
  });
};

// GET /api/styles
router.get('/', (req, res) => {
  db.all('SELECT * FROM styles', (err, styles) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(styles); // Simplified: return without ops for list
  });
});

// POST /api/styles
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  db.run('INSERT INTO styles (name) VALUES (?)', [name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// GET /api/styles/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  getStyleWithOps(id, (err, style) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(style);
  });
});

// POST /api/styles/:id/operations
router.post('/:id/operations', (req, res) => {
  const { id } = req.params;
  const { operation_id, sequence, qty_por_unidad = 1 } = req.body;
  if (!operation_id || sequence === undefined) return res.status(400).json({ error: 'Missing fields' });
  db.run(
    'INSERT INTO style_operations (style_id, operation_id, sequence, qty_por_unidad) VALUES (?, ?, ?, ?)',
    [id, operation_id, sequence, qty_por_unidad],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// PUT /api/styles/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.run('UPDATE styles SET name = ? WHERE id = ?', [name, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ updated: true });
  });
});

// DELETE /api/styles/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM styles WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  });
});

// POST /api/calculate
router.post('/calculate', (req, res) => {
  const { styleId, workerMap = {}, batchSize = 1, overhead_pct = 0.1, margin_pct = 0.2, batch_threshold = 20, batch_pct_reduction = 0.1 } = req.body;
  getStyleWithOps(styleId, (err, style) => {
    if (err) return res.status(404).json({ error: err.message });
    const { operations } = style;
    const adjustedOps = operations.map(op => {
      let time_min = op.time_min;
      if (batchSize >= batch_threshold) {
        time_min *= (1 - batch_pct_reduction);
      }
      return { ...op, time_min };
    });
    const breakdown = adjustedOps.map(op => {
      const workerRol = workerMap[op.op_name] || 'Default';
      const worker = { tarifa_hora: 15, eficiencia: 0.9 }; // Simplified default
      const labor_per_op = (op.time_min / 60) * (worker.tarifa_hora / worker.eficiencia) * op.qty_por_unidad;
      return { op_name: op.op_name, labor: labor_per_op };
    });
    const subtotal = breakdown.reduce((sum, b) => sum + b.labor, 0);
    const overhead = subtotal * overhead_pct;
    const total_before_margin = subtotal + overhead;
    const margin = total_before_margin * margin_pct;
    const total = total_before_margin + margin;
    res.json({
      breakdown,
      summary: { subtotal, overhead, total_before_margin, margin, total }
    });
  });
});

// GET /api/export?styleId=...&format=csv|xlsx
router.get('/export', (req, res) => {
  const { styleId, format = 'csv' } = req.query;
  if (!styleId) return res.status(400).json({ error: 'Missing styleId' });
  getStyleWithOps(styleId, (err, style) => {
    if (err) return res.status(500).json({ error: err.message });
    const breakdown = style.operations.map(op => ({
      op_name: op.op_name,
      labor: (op.time_min / 60) * 15 / 0.9 * op.qty_por_unidad
    }));
    const subtotal = breakdown.reduce((sum, b) => sum + b.labor, 0);
    const overhead = subtotal * 0.1;
    const total_before_margin = subtotal + overhead;
    const margin = total_before_margin * 0.2;
    const total = total_before_margin + margin;
    const data = [...breakdown, { op_name: 'Subtotal', labor: subtotal }, { op_name: 'Overhead', labor: overhead }, { op_name: 'Total Before Margin', labor: total_before_margin }, { op_name: 'Margin', labor: margin }, { op_name: 'Total', labor: total }];
    const exporter = require('../exports/exporter');
    if (format === 'csv') {
      const csv = exporter.toCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=stitchwizard-${styleId}.csv`);
      res.send(csv);
    } else if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=stitchwizard-${styleId}.xlsx`);
      exporter.toXLSX(data, res);
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  });
});

module.exports = router;
