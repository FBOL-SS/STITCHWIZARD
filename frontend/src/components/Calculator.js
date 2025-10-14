import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Calculator() {
  const [styles, setStyles] = useState([]);
  const [styleId, setStyleId] = useState('');
  const [workerMap, setWorkerMap] = useState({});
  const [batchSize, setBatchSize] = useState(1);
  const [overheadPct, setOverheadPct] = useState(0.1);
  const [marginPct, setMarginPct] = useState(0.2);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [sData, wData] = await Promise.all([api.get('/styles'), api.get('/workers')]);
    setStyles(sData);
  };

  const calculate = async () => {
    const calcData = { styleId, workerMap, batchSize, overhead_pct: overheadPct, margin_pct: marginPct };
    const data = await api.post('/calculate', calcData);
    setResult(data);
  };

  return (
    <div>
      <h2>Cost Calculator</h2>
      <select value={styleId} onChange={e => setStyleId(e.target.value)}>
        <option value="">Select Style</option>
        {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <input type="number" placeholder="Batch Size" value={batchSize} onChange={e => setBatchSize(e.target.value)} />
      <input type="number" step="0.01" placeholder="Overhead %" value={overheadPct} onChange={e => setOverheadPct(e.target.value)} />
      <input type="number" step="0.01" placeholder="Margin %" value={marginPct} onChange={e => setMarginPct(e.target.value)} />
      {/* Worker Map: Simplified as input for demo */}
      <input placeholder="Worker Map JSON (e.g. {'Corte':'Cortero'})" value={JSON.stringify(workerMap)} onChange={e => setWorkerMap(JSON.parse(e.target.value || '{}'))} />
      <button onClick={calculate}>Calculate</button>
      {result && (
        <div>
          <h3>Breakdown</h3>
          <table>
            <thead><tr><th>Operation</th><th>Labor</th></tr></thead>
            <tbody>{result.breakdown.map(b => <tr key={b.op_name}><td>{b.op_name}</td><td>${b.labor.toFixed(2)}</td></tr>)}</tbody>
          </table>
          <h3>Summary</h3>
          <p>Subtotal: ${result.summary.subtotal.toFixed(2)}</p>
          <p>Overhead: ${result.summary.overhead.toFixed(2)}</p>
          <p>Total Before Margin: ${result.summary.total_before_margin.toFixed(2)}</p>
          <p>Margin: ${result.summary.margin.toFixed(2)}</p>
          <p>Total: ${result.summary.total.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

export default Calculator;
