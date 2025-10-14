PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    time_min REAL NOT NULL,
    batch_threshold INTEGER DEFAULT 0,
    batch_reduction_pct REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    rate_per_hour REAL NOT NULL,
    efficiency REAL NOT NULL CHECK (efficiency > 0 AND efficiency <= 1)
);

CREATE TABLE IF NOT EXISTS styles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    overhead_pct REAL NOT NULL DEFAULT 0,
    margin_pct REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS style_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    style_id INTEGER NOT NULL,
    operation_id INTEGER NOT NULL,
    worker_id INTEGER,
    sequence INTEGER NOT NULL,
    quantity_per_unit REAL NOT NULL DEFAULT 1,
    FOREIGN KEY(style_id) REFERENCES styles(id) ON DELETE CASCADE,
    FOREIGN KEY(operation_id) REFERENCES operations(id),
    FOREIGN KEY(worker_id) REFERENCES workers(id)
);

