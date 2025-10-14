import React, { useState } from 'react';
import api from '../utils/api';

function Export() {
  const [styleId, setStyleId] = useState('');
  const [format, setFormat] = useState('csv');

  const handleExport = async () => {
    const url = `/export?styleId=${styleId}&format=${format}`;
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer dummy_token' }
    });
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stitchwizard-${styleId}.${format}`;
    link.click();
  };

  return (
    <div>
      <h2>Export Results</h2>
      <input type="number" placeholder="Style ID" value={styleId} onChange={e => setStyleId(e.target.value)} />
      <select value={format} onChange={e => setFormat(e.target.value)}>
        <option value="csv">CSV</option>
        <option value="xlsx">XLSX</option>
      </select>
      <button onClick={handleExport}>Export</button>
    </div>
  );
}

export default Export;
