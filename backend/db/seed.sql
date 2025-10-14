-- Seed data: 3 operations, 2 workers, 1 style with 3 operations

INSERT OR IGNORE INTO operations (name, time_min) VALUES
('Corte', 10.0),
('Cosido', 25.0),
('Planchado', 5.0);

INSERT OR IGNORE INTO workers (rol, tarifa_hora, eficiencia) VALUES
('Cortero', 15.0, 0.9),
('Costurero', 20.0, 0.85);

INSERT OR IGNORE INTO styles (name) VALUES ('Camisa Básica');

-- Style with 3 operations (assuming style_id=1)
INSERT OR IGNORE INTO style_operations (style_id, operation_id, sequence, qty_por_unidad) VALUES
(1, 1, 1, 1),  -- Corte
(1, 2, 2, 1),  -- Cosido
(1, 3, 3, 1);  -- Planchado
