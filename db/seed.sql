INSERT INTO operations (name, time_min, batch_threshold, batch_reduction_pct) VALUES
('Cutting', 15, 50, 0.1),
('Stitching', 30, 30, 0.15),
('Finishing', 10, 40, 0.05);

INSERT INTO workers (role, rate_per_hour, efficiency) VALUES
('Cutter', 12.5, 0.9),
('Sewer', 15.0, 0.85);

INSERT INTO styles (name, overhead_pct, margin_pct) VALUES
('Classic Shirt', 0.18, 0.25);

INSERT INTO style_operations (style_id, operation_id, worker_id, sequence, quantity_per_unit) VALUES
(1, 1, 1, 1, 1),
(1, 2, 2, 2, 1.5),
(1, 3, 2, 3, 1);
