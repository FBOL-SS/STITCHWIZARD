// Calculation function - documented formula
// Inputs: operations (array of {time_min, qty_por_unidad}), workerMap {op_name: {rate, eff}}, batchSize, overhead_pct, margin_pct, batch_threshold=20, batch_pct_reduction=0.1
// labor_per_op = (time_min / 60) * (rate_per_hour / efficiency) * qty
// subtotal = Σ labor_per_op
// overhead = subtotal * overhead_pct
// total_before_margin = subtotal + overhead
// margin = total_before_margin * margin_pct
// total = total_before_margin + margin
// If batchSize >= batch_threshold, time_min *= (1 - batch_pct_reduction)

function calculateCost(operations, workerMap = {}, batchSize = 1, overhead_pct = 0.1, margin_pct = 0.2, batch_threshold = 20, batch_pct_reduction = 0.1) {
  const adjustedOps = operations.map(op => {
    let time_min = op.time_min;
    if (batchSize >= batch_threshold) {
      time_min *= (1 - batch_pct_reduction);
    }
    const worker = workerMap[op.name] || { rate_per_hour: 15, efficiency: 0.9 };
    const labor_per_op = (time_min / 60) * (worker.rate_per_hour / worker.efficiency) * (op.qty_por_unidad || 1);
    return { ...op, labor: labor_per_op };
  });

  const subtotal = adjustedOps.reduce((sum, op) => sum + op.labor, 0);
  const overhead = subtotal * overhead_pct;
  const total_before_margin = subtotal + overhead;
  const margin_amount = total_before_margin * margin_pct;
  const total = total_before_margin + margin_amount;

  return {
    breakdown: adjustedOps.map(op => ({ name: op.name, labor: op.labor })),
    summary: { subtotal, overhead, total_before_margin, margin: margin_amount, total }
  };
}

module.exports = { calculateCost };
