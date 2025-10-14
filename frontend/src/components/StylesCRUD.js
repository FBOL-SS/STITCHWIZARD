import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function StylesCRUD() {
  const [styles, setStyles] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editId, setEditId] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [opForm, setOpForm] = useState({ operation_id: '', sequence: '', qty_por_unidad: 1 });

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    const data = await api.get('/styles');
    setStyles(data);
  };

  const handleSubmitStyle = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/styles/${editId}`, form);
      setEditId(null);
    } else {
      const newStyle = await api.post('/styles', form);
      // Add default op? No
    }
    setForm({ name: '' });
    loadStyles();
  };

  const handleEditStyle = (style) => {
    setForm({ name: style.name });
    setEditId(style.id);
  };

  const handleDeleteStyle = async (id) => {
    await api.delete(`/styles/${id}`);
    loadStyles();
  };

  const loadStyleOps = async (id) => {
    const style = await api.get(`/styles/${id}`);
    setSelectedStyle(style);
  };

  const addOpToStyle = async (e) => {
    e.preventDefault();
    if (!selectedStyle) return;
    await api.post(`/styles/${selectedStyle.id}/operations`, opForm);
    setOpForm({ operation_id: '', sequence: '', qty_por_unidad: 1 });
    loadStyleOps(selectedStyle.id);
  };

  return (
    <div>
      <h2>Styles CRUD</h2>
      <form onSubmit={handleSubmitStyle}>
        <input placeholder="Style Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <button type="submit">{editId ? 'Update' : 'Add'}</button>
      </form>
      <table>
        <thead><tr><th>Name</th><th>Actions</th></tr></thead>
        <tbody>
          {styles.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>
                <button onClick={() => { handleEditStyle(s); loadStyleOps(s.id); setSelectedStyle(s); }}>Edit</button>
                <button onClick={() => handleDeleteStyle(s.id)}>Delete</button>
                <button onClick={() => loadStyleOps(s.id)}>View BOM</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedStyle && (
        <div>
          <h3>BOM for {selectedStyle.name}</h3>
          <ul>{selectedStyle.operations.map(op => <li key={op.sequence}>{op.sequence}: {op.op_name} x{op.qty_por_unidad}</li>)}</ul>
          <form onSubmit={addOpToStyle}>
            <input type="number" placeholder="Operation ID" value={opForm.operation_id} onChange={e => setOpForm({...opForm, operation_id: e.target.value})} />
            <input type="number" placeholder="Sequence" value={opForm.sequence} onChange={e => setOpForm({...opForm, sequence: e.target.value})} />
            <input type="number" placeholder="Qty/Unit" value={opForm.qty_por_unidad} onChange={e => setOpForm({...opForm, qty_por_unidad: e.target.value})} />
            <button type="submit">Add Op</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default StylesCRUD;
