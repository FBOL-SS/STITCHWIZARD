const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const authMiddleware = require('./middleware/auth');
const operationsRoutes = require('./routes/operations');
const workersRoutes = require('./routes/workers');
const stylesRoutes = require('./routes/styles');

const app = express();
const PORT = process.env.PORT || 3001;
const dbPath = path.join(__dirname, 'db', 'stitchwizard.db');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-vercel-app.vercel.app' : 'http://localhost:3000'
}));
app.use(bodyParser.json());

// Auth placeholder: All routes protected
app.use('/api', authMiddleware);

// Routes
app.use('/api/operations', operationsRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/styles', stylesRoutes);

// Connect to DB
const db = new sqlite3.Database(dbPath);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Ensure DB is initialized (schema/seed run separately)
});

module.exports = { app, db };
