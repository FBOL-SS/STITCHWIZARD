import React, { useEffect, useState } from 'react';
import {
  getOperations,
  createOperation,
  updateOperation,
  deleteOperation,
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  getStyles,
  getStyle,
  createStyle,
  calculateCost,
  exportCost
} from './api';

function OperationForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState({ name: '', time_min: 0, batch_threshold: 0, batch_reduction_pct: 0 });

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
    } else {
      setForm({ name: '', time_min: 0, batch_threshold: 0, batch_reduction_pct: 0 });
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{editing ? 'Editar operación' : 'Crear operación'}</h3>
      <label>
        Nombre
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label>
        Minutos por pieza
        <input
          type="number"
          value={form.time_min}
          onChange={(e) => setForm({ ...form, time_min: Number(e.target.value) })}
          min="0"
          step="0.1"
          required
        />
      </label>
      <label>
        Umbral batch
        <input
          type="number"
          value={form.batch_threshold}
          onChange={(e) => setForm({ ...form, batch_threshold: Number(e.target.value) })}
          min="0"
        />
      </label>
      <label>
        Reducción batch (%)
        <input
          type="number"
          value={form.batch_reduction_pct}
          onChange={(e) => setForm({ ...form, batch_reduction_pct: Number(e.target.value) })}
          min="0"
          max="1"
          step="0.01"
        />
      </label>
      <div className="actions">
        {editing && (
          <button type="button" onClick={onCancel} className="secondary">
            Cancelar
          </button>
        )}
        <button type="submit">Guardar</button>
      </div>
    </form>
  );
}

function WorkerForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState({ role: '', rate_per_hour: 0, efficiency: 1 });

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
    } else {
      setForm({ role: '', rate_per_hour: 0, efficiency: 1 });
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{editing ? 'Editar trabajador' : 'Crear trabajador'}</h3>
      <label>
        Rol
        <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
      </label>
      <label>
        Tarifa por hora
        <input
          type="number"
          value={form.rate_per_hour}
          onChange={(e) => setForm({ ...form, rate_per_hour: Number(e.target.value) })}
          min="0"
          step="0.1"
          required
        />
      </label>
      <label>
        Eficiencia (0-1)
        <input
          type="number"
          value={form.efficiency}
          onChange={(e) => setForm({ ...form, efficiency: Number(e.target.value) })}
          min="0.01"
          max="1"
          step="0.01"
          required
        />
      </label>
      <div className="actions">
        {editing && (
          <button type="button" onClick={onCancel} className="secondary">
            Cancelar
          </button>
        )}
        <button type="submit">Guardar</button>
      </div>
    </form>
  );
}

function StyleBuilder({ operations, workers, onCreate }) {
  const [name, setName] = useState('');
  const [overhead, setOverhead] = useState(0.2);
  const [margin, setMargin] = useState(0.2);
  const [lines, setLines] = useState([]);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: Date.now(),
        operationId: operations[0]?.id || '',
        workerId: workers[0]?.id || '',
        quantity_per_unit: 1,
        sequence: prev.length + 1
      }
    ]);
  };

  const updateLine = (id, changes) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...changes } : line)));
  };

  const removeLine = (id) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    const payload = {
      name,
      overhead_pct: Number(overhead),
      margin_pct: Number(margin),
      operations: lines.map((line, index) => ({
        operationId: Number(line.operationId),
        workerId: line.workerId ? Number(line.workerId) : null,
        quantity_per_unit: Number(line.quantity_per_unit) || 1,
        sequence: index + 1
      }))
    };
    onCreate(payload).then(() => {
      setName('');
      setOverhead(0.2);
      setMargin(0.2);
      setLines([]);
    });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Crear estilo/prenda</h3>
      <label>
        Nombre
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <div className="grid two">
        <label>
          Overhead %
          <input type="number" value={overhead} step="0.01" onChange={(e) => setOverhead(e.target.value)} />
        </label>
        <label>
          Margin %
          <input type="number" value={margin} step="0.01" onChange={(e) => setMargin(e.target.value)} />
        </label>
      </div>
      <div>
        <div className="list-header">
          <span>Operaciones</span>
          <button type="button" onClick={addLine} disabled={!operations.length || !workers.length}>
            Añadir línea
          </button>
        </div>
        {lines.map((line) => (
          <div key={line.id} className="list-row">
            <select
              value={line.operationId}
              onChange={(e) => updateLine(line.id, { operationId: e.target.value })}
            >
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
            <select value={line.workerId} onChange={(e) => updateLine(line.id, { workerId: e.target.value })}>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.role}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={line.quantity_per_unit}
              min="0.1"
              step="0.1"
              onChange={(e) => updateLine(line.id, { quantity_per_unit: e.target.value })}
            />
            <button type="button" className="secondary" onClick={() => removeLine(line.id)}>
              Quitar
            </button>
          </div>
        ))}
      </div>
      <button type="submit" disabled={!lines.length}>
        Guardar estilo
      </button>
    </form>
  );
}

function Calculator({ styles, styleDetails, onSelectStyle, calculation, onCalculate, onExport, workerSelections, setWorkerSelections }) {
  const [batchSize, setBatchSize] = useState('');
  const [overhead, setOverhead] = useState('');
  const [margin, setMargin] = useState('');

  useEffect(() => {
    if (styleDetails) {
      const map = {};
      styleDetails.operations.forEach((op) => {
        map[op.operation_id] = op.worker_id ?? undefined;
      });
      setWorkerSelections(map);
    }
  }, [styleDetails, setWorkerSelections]);

  const handleCalculate = () => {
    if (!styleDetails) return;
    onCalculate({
      styleId: styleDetails.style.id,
      workerMap: workerSelections,
      batchSize: batchSize ? Number(batchSize) : undefined,
      overheadPct: overhead === '' ? undefined : Number(overhead),
      marginPct: margin === '' ? undefined : Number(margin)
    });
  };

  const handleExport = (format) => {
    if (!styleDetails) return;
    onExport({
      styleId: styleDetails.style.id,
      format,
      batchSize,
      overheadPct: overhead,
      marginPct: margin
    });
  };

  return (
    <div className="card">
      <h3>Cálculo de costos</h3>
      <label>
        Seleccionar estilo
        <select value={styleDetails?.style.id || ""} onChange={(e) => onSelectStyle(e.target.value)}>
          <option value="">-- Seleccionar --</option>
          {styles.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
      </label>
      {styleDetails && (
        <div className="calculation-panel">
          <div className="grid three">
            <label>
              Batch size
              <input value={batchSize} onChange={(e) => setBatchSize(e.target.value)} type="number" min="0" />
            </label>
            <label>
              Overhead % override
              <input value={overhead} onChange={(e) => setOverhead(e.target.value)} type="number" step="0.01" />
            </label>
            <label>
              Margin % override
              <input value={margin} onChange={(e) => setMargin(e.target.value)} type="number" step="0.01" />
            </label>
          </div>
          <div>
            <h4>Asignación de trabajadores</h4>
            {styleDetails.operations.map((op) => (
              <div key={op.id} className="list-row">
                <span>
                  {op.sequence}. {op.operation_name} (qty {op.quantity_per_unit})
                </span>
                <select
                  value={workerSelections[op.operation_id] ?? ''}
                  onChange={(e) =>
                    setWorkerSelections({
                      ...workerSelections,
                      [op.operation_id]: e.target.value ? Number(e.target.value) : undefined
                    })
                  }
                >
                  <option value="">--</option>
                  {op.available_workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.role}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="actions">
            <button type="button" onClick={handleCalculate}>
              Calcular
            </button>
            <button type="button" className="secondary" onClick={() => handleExport('csv')}>
              Exportar CSV
            </button>
            <button type="button" className="secondary" onClick={() => handleExport('xlsx')}>
              Exportar XLSX
            </button>
          </div>
        </div>
      )}
      {calculation && (
        <div className="results">
          <h4>Detalle de operaciones</h4>
          <table>
            <thead>
              <tr>
                <th>Secuencia</th>
                <th>Operación</th>
                <th>Trabajador</th>
                <th>Qty</th>
                <th>Tiempo (min)</th>
                <th>Costo mano de obra</th>
              </tr>
            </thead>
            <tbody>
              {calculation.breakdown.map((row) => (
                <tr key={row.operationId}>
                  <td>{row.sequence}</td>
                  <td>{row.operationName}</td>
                  <td>{row.worker}</td>
                  <td>{row.quantity}</td>
                  <td>{row.timeMinutes.toFixed(2)}</td>
                  <td>${row.laborCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="summary">
            <p>Subtotal: ${calculation.summary.subtotal.toFixed(2)}</p>
            <p>Overhead ({(calculation.summary.overheadPct * 100).toFixed(1)}%): ${calculation.summary.overhead.toFixed(2)}</p>
            <p>Total antes de margen: ${calculation.summary.totalBeforeMargin.toFixed(2)}</p>
            <p>Margen ({(calculation.summary.marginPct * 100).toFixed(1)}%): ${calculation.summary.margin.toFixed(2)}</p>
            <p className="total">Total: ${calculation.summary.total.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [operations, setOperations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [styles, setStyles] = useState([]);
  const [styleDetails, setStyleDetails] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [workerSelections, setWorkerSelections] = useState({});
  const [editingOperation, setEditingOperation] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [error, setError] = useState('');

  const refreshData = () => {
    Promise.all([getOperations(), getWorkers(), getStyles()])
      .then(([ops, workersData, stylesData]) => {
        setOperations(ops);
        setWorkers(workersData);
        setStyles(stylesData);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveOperation = (form) => {
    const payload = { ...form, time_min: Number(form.time_min) };
    const action = editingOperation
      ? updateOperation(editingOperation.id, payload)
      : createOperation(payload);
    action
      .then(() => {
        setEditingOperation(null);
        refreshData();
      })
      .catch((err) => setError(err.message));
  };

  const handleSaveWorker = (form) => {
    const payload = {
      role: form.role,
      rate_per_hour: Number(form.rate_per_hour),
      efficiency: Number(form.efficiency)
    };
    const action = editingWorker ? updateWorker(editingWorker.id, payload) : createWorker(payload);
    action
      .then(() => {
        setEditingWorker(null);
        refreshData();
      })
      .catch((err) => setError(err.message));
  };

  const handleDeleteOperation = (id) => {
    deleteOperation(id).then(refreshData).catch((err) => setError(err.message));
  };

  const handleDeleteWorker = (id) => {
    deleteWorker(id).then(refreshData).catch((err) => setError(err.message));
  };

  const handleCreateStyle = (payload) => {
    return createStyle(payload)
      .then(() => {
        refreshData();
      })
      .catch((err) => {
        setError(err.message);
        throw err;
      });
  };

  const handleSelectStyle = (id) => {
    if (!id) {
      setStyleDetails(null);
      setCalculation(null);
      return;
    }
    getStyle(id)
      .then((details) => {
        setStyleDetails(details);
        setCalculation(null);
      })
      .catch((err) => setError(err.message));
  };

  const handleCalculate = (payload) => {
    calculateCost(payload)
      .then((result) => setCalculation(result))
      .catch((err) => setError(err.message));
  };

  const handleExport = ({ styleId, format, batchSize, overheadPct, marginPct }) => {
    exportCost({ styleId, format, batchSize, overheadPct, marginPct })
      .then(async (res) => {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `style-${styleId}-cost.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="container">
      <header>
        <h1>StitchWizard</h1>
        <p>Calculadora de costos laborales para confección</p>
      </header>
      {error && (
        <div className="error" onClick={() => setError('')}>
          {error}
        </div>
      )}
      <main className="grid three">
        <section>
          <OperationForm
            onSave={handleSaveOperation}
            editing={editingOperation}
            onCancel={() => setEditingOperation(null)}
          />
          <div className="card">
            <h3>Operaciones</h3>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Min/Pieza</th>
                  <th>Batch</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id}>
                    <td>{op.name}</td>
                    <td>{op.time_min}</td>
                    <td>
                      {op.batch_threshold}/{(op.batch_reduction_pct * 100).toFixed(0)}%
                    </td>
                    <td>
                      <button type="button" onClick={() => setEditingOperation(op)}>
                        Editar
                      </button>
                      <button type="button" className="secondary" onClick={() => handleDeleteOperation(op.id)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <WorkerForm onSave={handleSaveWorker} editing={editingWorker} onCancel={() => setEditingWorker(null)} />
          <div className="card">
            <h3>Tipos de trabajador</h3>
            <table>
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Tarifa</th>
                  <th>Eficiencia</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>{worker.role}</td>
                    <td>${worker.rate_per_hour}</td>
                    <td>{worker.efficiency}</td>
                    <td>
                      <button type="button" onClick={() => setEditingWorker(worker)}>
                        Editar
                      </button>
                      <button type="button" className="secondary" onClick={() => handleDeleteWorker(worker.id)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <StyleBuilder operations={operations} workers={workers} onCreate={handleCreateStyle} />
          <div className="card">
            <h3>Estilos</h3>
            <ul className="style-list">
              {styles.map((style) => (
                <li key={style.id}>
                  <strong>{style.name}</strong>
                  <span>{style.operation_count} operaciones</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Calculator
        styles={styles}
        styleDetails={styleDetails}
        onSelectStyle={handleSelectStyle}
        calculation={calculation}
        onCalculate={handleCalculate}
        onExport={handleExport}
        workerSelections={workerSelections}
        setWorkerSelections={setWorkerSelections}
      />
    </div>
  );
}
