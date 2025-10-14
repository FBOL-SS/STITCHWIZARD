import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function WorkersCRUD() {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({ rol: '', tarifa_hora: '', eficiencia: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    const data = await api.get('/workers');
    setWorkers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/workers/${editId}`, form);
      setEditId(null);
    } else {
      await api.post('/workers', form);
    }
    setForm({ rol: '', tarifa_hora: '', eficiencia: '' });
    loadWorkers();
  };

  const handleEdit = (worker) => {
    setForm(worker);
    setEditId(worker.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/workers/${id}`);
    loadWorkers();
  };

  return (
    <div>
      <h2>Workers CRUD</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Rol" value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} />
        <input type="number" placeholder="Tarifa/Hora" value={form.tarifa_hora} onChange={e => setForm({...form, tarifa_hora: e.target.value})} />
        <input type="number" step="0.01" placeholder="Eficiencia (0-1)" value={form.eficiencia} onChange={e => setForm({...form, eficiencia: e.target.value})} />
        <button type="submit">{editId ? 'Update' : 'Add'}</button>
      </form>
      <table>
        <thead><tr><th>Rol</th><th>Tarifa/Hora</th><th>Eficiencia</th><th>Actions</th></tr></thead>
        <tbody>
          {workers.map(w => (
            <tr key={w.id}>
              <td>{w.rol}</td>
              <td>{w.tarifa_hora}</td>
              <td>{w.eficiencia}</td>
              <td>
                <button onClick={() => handleEdit(w)}>Edit</button>
                <button onClick={() => handleDelete(w.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WorkersCRUD;
