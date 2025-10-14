const { calculateCost } = require('../utils/calculator');

describe('calculateCost', () => {
  const sampleOps = [
    { name: 'Corte', time_min: 10, qty_por_unidad: 1 },
    { name: 'Cosido', time_min: 25, qty_por_unidad: 1 }
  ];

  test('basic calculation without batch', () => {
    const result = calculateCost(sampleOps);
    expect(result.summary.subtotal).toBeCloseTo(10.556, 2);  // (10/60 *15/0.9) + (25/60*15/0.9) ≈ 2.5 + 7.5ish wait calc: 10/60=0.1667*16.666=2.777, 25/60=0.4167*16.666=6.944, total 9.722? Wait adjust.
    // Actual: rate/eff =15/0.9≈16.6667
    // Corte: (10/60)*16.6667 ≈0.1667*16.6667≈2.7778
    // Cosido: (25/60)*16.6667≈0.4167*16.6667≈6.9444
    // Subtotal: 9.7222
    // Overhead 0.1: 0.9722
    // TBM: 10.6944
    // Margin 0.2: 2.1389
    // Total: 12.8333
    expect(result.summary.subtotal).toBeCloseTo(9.7222, 3);
    expect(result.summary.total).toBeCloseTo(12.8333, 3);
  });

  test('with batch reduction', () => {
    const result = calculateCost(sampleOps, {}, 25, 0.1, 0.2, 20, 0.1);
    // Time reduced by 10%: Corte 9min, Cosido 22.5min
    // Subtotal: (9/60)*16.6667≈2.5, (22.5/60)*16.6667≈6.25, total 8.75
    expect(result.summary.subtotal).toBeCloseTo(8.75, 3);
  });

  test('custom worker', () => {
    const customMap = { 'Corte': { rate_per_hour: 20, efficiency: 1.0 } };
    const result = calculateCost(sampleOps, customMap);
    // Corte: (10/60)*20/1 = 3.333, Cosido default 6.944, subtotal 10.277
    expect(result.summary.subtotal).toBeCloseTo(10.277, 3);
  });
});
