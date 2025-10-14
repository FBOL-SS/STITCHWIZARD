/**
 * Calculates labor costs for a style.
 * Formula documented per requirements:
 * labor_per_op = (time_min / 60) * (rate_per_hour / efficiency)
 * subtotal = Σ labor_per_op
 * overhead = subtotal * overhead_pct
 * total_before_margin = subtotal + overhead
 * margin = total_before_margin * margin_pct
 * total = total_before_margin + margin
 *
 * Batch handling:
 * if batchSize >= batch_threshold, time_min is reduced by batch_reduction_pct.
 */
function calculateStyleCost({
  style,
  operations,
  workerOverrides = {},
  batchSize,
  overheadPctOverride,
  marginPctOverride
}) {
  if (!style) {
    throw new Error('Style is required for calculation');
  }

  const overheadPct = typeof overheadPctOverride === 'number' ? overheadPctOverride : style.overhead_pct;
  const marginPct = typeof marginPctOverride === 'number' ? marginPctOverride : style.margin_pct;

  const breakdown = operations
    .sort((a, b) => a.sequence - b.sequence)
    .map((op) => {
      const effectiveWorkerId = workerOverrides[op.operation_id] || op.worker_id;
      if (!effectiveWorkerId) {
        throw new Error(`Missing worker assignment for operation ${op.operation_name}`);
      }

      const worker = op.available_workers.find((w) => w.id === effectiveWorkerId);
      if (!worker) {
        throw new Error(`Worker ${effectiveWorkerId} not found for operation ${op.operation_name}`);
      }

      const quantity = op.quantity_per_unit || 1;
      const batchThreshold = op.batch_threshold || 0;
      const batchReduction = op.batch_reduction_pct || 0;
      let adjustedTime = op.time_min;
      if (batchSize && batchSize >= batchThreshold && batchReduction > 0) {
        adjustedTime = adjustedTime * (1 - batchReduction);
      }

      const totalTime = adjustedTime * quantity;
      const laborCost = (totalTime / 60) * (worker.rate_per_hour / worker.efficiency);

      return {
        operationId: op.operation_id,
        operationName: op.operation_name,
        sequence: op.sequence,
        quantity,
        worker: worker.role,
        workerId: worker.id,
        timeMinutes: totalTime,
        ratePerHour: worker.rate_per_hour,
        efficiency: worker.efficiency,
        laborCost
      };
    });

  const subtotal = breakdown.reduce((sum, item) => sum + item.laborCost, 0);
  const overhead = subtotal * overheadPct;
  const totalBeforeMargin = subtotal + overhead;
  const margin = totalBeforeMargin * marginPct;
  const total = totalBeforeMargin + margin;

  return {
    breakdown,
    summary: {
      subtotal,
      overheadPct,
      overhead,
      totalBeforeMargin,
      marginPct,
      margin,
      total
    }
  };
}

module.exports = {
  calculateStyleCost
};
