const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const authMiddleware = require('./middleware/auth');
const db = require('./services/database');
const { calculateStyleCost } = require('./services/costCalculator');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Attach auth middleware to all API routes.
app.use('/api', authMiddleware);

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) {
      reject(err);
    } else {
      resolve({ id: this.lastID, changes: this.changes });
    }
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) {
      reject(err);
    } else {
      resolve(rows);
    }
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) {
      reject(err);
    } else {
      resolve(row);
    }
  });
});

// --- Operations CRUD ---
app.get('/api/operations', async (req, res) => {
  try {
    const operations = await all('SELECT * FROM operations ORDER BY id');
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch operations', error: error.message });
  }
});

app.post('/api/operations', async (req, res) => {
  const { name, time_min, batch_threshold = 0, batch_reduction_pct = 0 } = req.body;
  if (!name || typeof time_min !== 'number') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    const result = await run(
      'INSERT INTO operations (name, time_min, batch_threshold, batch_reduction_pct) VALUES (?, ?, ?, ?)',
      [name, time_min, batch_threshold, batch_reduction_pct]
    );
    const operation = await get('SELECT * FROM operations WHERE id = ?', [result.id]);
    res.status(201).json(operation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create operation', error: error.message });
  }
});

app.put('/api/operations/:id', async (req, res) => {
  const { id } = req.params;
  const { name, time_min, batch_threshold = 0, batch_reduction_pct = 0 } = req.body;
  if (!name || typeof time_min !== 'number') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    await run(
      'UPDATE operations SET name = ?, time_min = ?, batch_threshold = ?, batch_reduction_pct = ? WHERE id = ?',
      [name, time_min, batch_threshold, batch_reduction_pct, id]
    );
    const operation = await get('SELECT * FROM operations WHERE id = ?', [id]);
    res.json(operation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update operation', error: error.message });
  }
});

app.delete('/api/operations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM operations WHERE id = ?', [id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete operation', error: error.message });
  }
});

// --- Workers CRUD ---
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await all('SELECT * FROM workers ORDER BY id');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workers', error: error.message });
  }
});

app.post('/api/workers', async (req, res) => {
  const { role, rate_per_hour, efficiency } = req.body;
  if (!role || typeof rate_per_hour !== 'number' || typeof efficiency !== 'number') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    const result = await run(
      'INSERT INTO workers (role, rate_per_hour, efficiency) VALUES (?, ?, ?)',
      [role, rate_per_hour, efficiency]
    );
    const worker = await get('SELECT * FROM workers WHERE id = ?', [result.id]);
    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create worker', error: error.message });
  }
});

app.put('/api/workers/:id', async (req, res) => {
  const { id } = req.params;
  const { role, rate_per_hour, efficiency } = req.body;
  if (!role || typeof rate_per_hour !== 'number' || typeof efficiency !== 'number') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    await run(
      'UPDATE workers SET role = ?, rate_per_hour = ?, efficiency = ? WHERE id = ?',
      [role, rate_per_hour, efficiency, id]
    );
    const worker = await get('SELECT * FROM workers WHERE id = ?', [id]);
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update worker', error: error.message });
  }
});

app.delete('/api/workers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM workers WHERE id = ?', [id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete worker', error: error.message });
  }
});

const getStyleDetails = async (styleId) => {
  const style = await get('SELECT * FROM styles WHERE id = ?', [styleId]);
  if (!style) {
    return null;
  }
  const operations = await all(
    `SELECT so.*, o.name AS operation_name, o.time_min, o.batch_threshold, o.batch_reduction_pct
     FROM style_operations so
     JOIN operations o ON o.id = so.operation_id
     WHERE so.style_id = ?
     ORDER BY so.sequence`,
    [styleId]
  );
  const workers = await all('SELECT * FROM workers ORDER BY id');

  const operationsWithWorkers = operations.map((op) => ({
    ...op,
    available_workers: workers
  }));

  return { style, operations: operationsWithWorkers };
};

// --- Styles ---
app.get('/api/styles', async (req, res) => {
  try {
    const styles = await all(
      `SELECT s.*, COUNT(so.id) as operation_count
       FROM styles s
       LEFT JOIN style_operations so ON so.style_id = s.id
       GROUP BY s.id
       ORDER BY s.id`
    );
    res.json(styles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch styles', error: error.message });
  }
});

app.post('/api/styles', async (req, res) => {
  const { name, overhead_pct = 0, margin_pct = 0, operations = [] } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    await run('BEGIN');
    const result = await run(
      'INSERT INTO styles (name, overhead_pct, margin_pct) VALUES (?, ?, ?)',
      [name, overhead_pct, margin_pct]
    );
    const styleId = result.id;
    for (const op of operations) {
      await run(
        'INSERT INTO style_operations (style_id, operation_id, worker_id, sequence, quantity_per_unit) VALUES (?, ?, ?, ?, ?)',
        [styleId, op.operationId, op.workerId || null, op.sequence, op.quantity_per_unit || 1]
      );
    }
    await run('COMMIT');

    const details = await getStyleDetails(styleId);
    res.status(201).json(details);
  } catch (error) {
    await run('ROLLBACK');
    res.status(500).json({ message: 'Failed to create style', error: error.message });
  }
});

app.get('/api/styles/:id', async (req, res) => {
  try {
    const details = await getStyleDetails(req.params.id);
    if (!details) {
      return res.status(404).json({ message: 'Style not found' });
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch style', error: error.message });
  }
});

// --- Calculation ---
app.post('/api/calculate', async (req, res) => {
  const { styleId, workerMap = {}, batchSize, overheadPct, marginPct } = req.body;
  if (!styleId) {
    return res.status(400).json({ message: 'styleId is required' });
  }

  try {
    const details = await getStyleDetails(styleId);
    if (!details) {
      return res.status(404).json({ message: 'Style not found' });
    }

    const result = calculateStyleCost({
      style: details.style,
      operations: details.operations,
      workerOverrides: workerMap,
      batchSize,
      overheadPctOverride: overheadPct,
      marginPctOverride: marginPct
    });
    res.json({
      style: details.style,
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate cost', error: error.message });
  }
});

// --- Export ---
app.get('/api/export', async (req, res) => {
  const { styleId, format = 'csv', batchSize, overheadPct, marginPct } = req.query;
  if (!styleId) {
    return res.status(400).json({ message: 'styleId is required' });
  }

  try {
    const details = await getStyleDetails(styleId);
    if (!details) {
      return res.status(404).json({ message: 'Style not found' });
    }

    const result = calculateStyleCost({
      style: details.style,
      operations: details.operations,
      batchSize: batchSize ? Number(batchSize) : undefined,
      overheadPctOverride: overheadPct ? Number(overheadPct) : undefined,
      marginPctOverride: marginPct ? Number(marginPct) : undefined
    });

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Cost Breakdown');
      sheet.addRow(['Operation', 'Worker', 'Sequence', 'Quantity', 'Time (min)', 'Rate/hr', 'Efficiency', 'Labor Cost']);
      result.breakdown.forEach((item) => {
        sheet.addRow([
          item.operationName,
          item.worker,
          item.sequence,
          item.quantity,
          item.timeMinutes,
          item.ratePerHour,
          item.efficiency,
          item.laborCost
        ]);
      });
      sheet.addRow([]);
      sheet.addRow(['Subtotal', result.summary.subtotal]);
      sheet.addRow(['Overhead', result.summary.overhead]);
      sheet.addRow(['Total Before Margin', result.summary.totalBeforeMargin]);
      sheet.addRow(['Margin', result.summary.margin]);
      sheet.addRow(['Total', result.summary.total]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="style-${styleId}-cost.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // Default CSV export
      const header = 'Operation,Worker,Sequence,Quantity,Time (min),Rate/hr,Efficiency,Labor Cost\n';
      const rows = result.breakdown
        .map((item) => [
          item.operationName,
          item.worker,
          item.sequence,
          item.quantity,
          item.timeMinutes,
          item.ratePerHour,
          item.efficiency,
          item.laborCost
        ].join(','))
        .join('\n');
      const summary = `\nSubtotal,,${result.summary.subtotal}\nOverhead,,${result.summary.overhead}\nTotal Before Margin,,${result.summary.totalBeforeMargin}\nMargin,,${result.summary.margin}\nTotal,,${result.summary.total}`;
      const csv = header + rows + summary;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="style-${styleId}-cost.csv"`);
      res.send(csv);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to export', error: error.message });
  }
});

// Serve frontend in production after build
const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`StitchWizard API running on port ${PORT}`);
});
