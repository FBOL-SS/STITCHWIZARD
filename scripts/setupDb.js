const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'db', 'stitchwizard.sqlite');
const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');

const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath);

const runScript = (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf-8');
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

(async () => {
  try {
    await runScript(schemaPath);
    if (!dbExists) {
      await runScript(seedPath);
      console.log('Database created and seeded.');
    } else {
      console.log('Database schema ensured.');
    }
  } catch (error) {
    console.error('Error setting up database', error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
