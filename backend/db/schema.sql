-- Schema for StitchWizard DB

CREATE TABLE IF NOT EXISTS operations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  time_min REAL NOT NULL  -- minutes per piece
);

CREATE TABLE IF NOT EXISTS workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rol TEXT NOT NULL UNIQUE,
  tarifa_hora REAL NOT NULL,  -- rate per hour
  eficiencia REAL NOT NULL CHECK (eficiencia BETWEEN 0 AND 1)  -- 0 to 1
);

CREATE TABLE IF NOT EXISTS style_operations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  style_id INTEGER NOT NULL,
  operation_id INTEGER NOT NULL,
  sequence INTEGER NOT NULL,  -- order in BOM
  qty_por_unidad INTEGER NOT NULL DEFAULT 1,  -- quantity per unit
  FOREIGN KEY (style_id) REFERENCES styles (id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations (id),
  UNIQUE(style_id, sequence)
);

CREATE TABLE IF NOT EXISTS styles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_style_ops_style ON style_operations(style_id);
CREATE INDEX IF NOT EXISTS idx_style_ops_op ON style_operations(operation_id);
