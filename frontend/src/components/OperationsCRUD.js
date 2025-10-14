import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function OperationsCRUD() {
  const [operations, setOperations] = useState([]);
  const [form, setForm] = useState({ name: '', time_min: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    const data = await api.get('/operations');
    setOperations(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/operations/${editId}`, form);
      setEditId(null);
    } else {
      await api.post('/operations', form);
    }
    setForm({ name: '', time_min: '' });
    loadOperations();
  };

  const handleEdit = (op) => {
    setForm(op);
    setEditId(op.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/operations/${id}`);
    loadOperations();
  };

  return (
    <div>
      <h2>Operations CRUD</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="number" placeholder="Time (min)" value={form.time_min} onChange={e => setForm({...form, time_min: e.target.value})} />
        <button type="submit">{editId ? 'Update' : 'Add'}</button>
      </form>
      <table>
        <thead><tr><th>Name</th><th>Time Min</th><th>Actions</th></tr></thead>
        <tbody>
          {operations.map(op => (
            <tr key={op.id}>
              <td>{op.name}</td>
              <td>{op.time_min}</td>
              <td>
                <button onClick={() => handleEdit(op)}>Edit</button>
                <button onClick={() => handleDelete(op.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OperationsCRUD;
