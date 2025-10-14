const { calculateStyleCost } = require('../services/costCalculator');

describe('calculateStyleCost', () => {
  const style = { id: 1, name: 'Test Style', overhead_pct: 0.1, margin_pct: 0.2 };
  const workers = [
    { id: 1, role: 'Cutter', rate_per_hour: 12, efficiency: 0.9 },
    { id: 2, role: 'Sewer', rate_per_hour: 15, efficiency: 0.85 }
  ];
  const operations = [
    {
      operation_id: 1,
      operation_name: 'Cutting',
      sequence: 1,
      quantity_per_unit: 1,
      time_min: 10,
      batch_threshold: 20,
      batch_reduction_pct: 0.1,
      worker_id: 1,
      available_workers: workers
    },
    {
      operation_id: 2,
      operation_name: 'Stitching',
      sequence: 2,
      quantity_per_unit: 2,
      time_min: 15,
      batch_threshold: 30,
      batch_reduction_pct: 0.2,
      worker_id: 2,
      available_workers: workers
    }
  ];

  it('calculates subtotal, overhead, margin and total', () => {
    const result = calculateStyleCost({ style, operations });
    expect(result.summary.subtotal).toBeCloseTo( (10/60)*(12/0.9) + (15*2/60)*(15/0.85) );
    expect(result.summary.overhead).toBeCloseTo(result.summary.subtotal * style.overhead_pct);
    expect(result.summary.margin).toBeCloseTo((result.summary.subtotal + result.summary.overhead) * style.margin_pct);
    expect(result.summary.total).toBeCloseTo(result.summary.subtotal + result.summary.overhead + result.summary.margin);
  });

  it('applies batch reduction when threshold met', () => {
    const result = calculateStyleCost({ style, operations, batchSize: 40 });
    const cuttingMinutes = 10 * (1 - 0.1);
    const stitchingMinutes = 15 * 2 * (1 - 0.2);
    const expectedSubtotal =
      (cuttingMinutes / 60) * (12 / 0.9) +
      (stitchingMinutes / 60) * (15 / 0.85);
    expect(result.summary.subtotal).toBeCloseTo(expectedSubtotal);
  });

  it('overrides workers when workerMap provided', () => {
    const result = calculateStyleCost({ style, operations, workerOverrides: { 1: 2, 2: 1 } });
    expect(result.breakdown[0].workerId).toBe(2);
    expect(result.breakdown[1].workerId).toBe(1);
  });
});
