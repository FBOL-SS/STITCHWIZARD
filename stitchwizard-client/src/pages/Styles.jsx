import { useEffect, useState } from 'react'
import { createStyle, getOperations, getStyle, getStyles } from '../api'
import StyleCard from '../components/StyleCard'
import ModalForm from '../components/ModalForm'

const styleFormDefaults = {
  name: '',
  overhead_pct: '10',
  margin_pct: '15'
}

export default function Styles({ onNotify }) {
  const [styles, setStyles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(() => ({ ...styleFormDefaults }))
  const [rows, setRows] = useState([{ operationId: '', sequence: 1, quantity_per_unit: 1 }])
  const [availableOps, setAvailableOps] = useState([])
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function loadStyles() {
    setLoading(true)
    try {
      const data = await getStyles()
      setStyles(data)
    } catch (error) {
      onNotify('Failed to load styles', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadOperations() {
    try {
      const data = await getOperations()
      setAvailableOps(data)
    } catch (error) {
      onNotify('Failed to load operations list', 'error')
    }
  }

  useEffect(() => {
    loadStyles()
    loadOperations()
  }, [])

  function openCreate() {
    setForm({ ...styleFormDefaults })
    setRows([{ operationId: '', sequence: 1, quantity_per_unit: 1 }])
    setModalOpen(true)
  }

  function updateRow(index, patch) {
    setRows(prev => prev.map((row, idx) => (idx === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    setRows(prev => [...prev, { operationId: '', sequence: prev.length + 1, quantity_per_unit: 1 }])
  }

  function removeRow(index) {
    setRows(prev => prev.filter((_, idx) => idx !== index))
  }

  async function handleSubmit() {
    const operations = rows
      .filter(row => row.operationId)
      .map(row => ({
        operationId: parseInt(row.operationId, 10),
        sequence: parseInt(row.sequence, 10) || 0,
        quantity_per_unit: parseFloat(row.quantity_per_unit) || 1
      }))

    const payload = {
      name: form.name,
      overhead_pct: (parseFloat(form.overhead_pct) || 0) / 100,
      margin_pct: (parseFloat(form.margin_pct) || 0) / 100,
      operations
    }

    try {
      await createStyle(payload)
      onNotify('Style created', 'success')
      setModalOpen(false)
      loadStyles()
    } catch (error) {
      onNotify(error.message || 'Unable to create style', 'error')
    }
  }

  async function viewDetails(id) {
    setDetailOpen(true)
    setDetail(null)
    setDetailLoading(true)
    try {
      const data = await getStyle(id)
      setDetail(data)
    } catch (error) {
      onNotify('Failed to load style details', 'error')
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Styles</h2>
          <p className="text-sm text-slate-500">Build style BOMs and inspect the linked operations</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Add style
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading styles...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {styles.map(style => (
            <StyleCard key={style.id} style={style} onView={viewDetails} />
          ))}
          {styles.length === 0 && <p className="text-sm text-slate-500">No styles yet.</p>}
        </div>
      )}

      <ModalForm
        isOpen={modalOpen}
        title="Create style"
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel="Create style"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={event => setForm({ ...form, name: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Overhead %</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.overhead_pct}
              onChange={event => setForm({ ...form, overhead_pct: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Margin %</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.margin_pct}
              onChange={event => setForm({ ...form, margin_pct: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700">Operations</h3>
            <button
              type="button"
              onClick={addRow}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Add row
            </button>
          </div>
          {rows.map((row, index) => (
            <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">Operation</label>
                <select
                  value={row.operationId}
                  onChange={event => updateRow(index, { operationId: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select operation</option>
                  {availableOps.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Sequence</label>
                <input
                  type="number"
                  min="0"
                  value={row.sequence}
                  onChange={event => updateRow(index, { sequence: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Qty per unit</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.quantity_per_unit}
                  onChange={event => updateRow(index, { quantity_per_unit: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              {rows.length > 1 && (
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ModalForm>

      {detailOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{detail?.style?.name || 'Style details'}</h2>
                {detail?.style && (
                  <p className="text-sm text-slate-500">Overhead {Math.round((detail.style.overhead_pct || 0) * 100)}% · Margin {Math.round((detail.style.margin_pct || 0) * 100)}%</p>
                )}
              </div>
              <button onClick={() => setDetailOpen(false)} className="text-slate-400 transition hover:text-slate-600">✕</button>
            </div>
            <div className="mt-6 space-y-3">
              {detailLoading && <p className="text-sm text-slate-500">Loading...</p>}
              {!detailLoading && detail?.operations?.length === 0 && (
                <p className="text-sm text-slate-500">No operations linked.</p>
              )}
              {!detailLoading && detail?.operations?.map(op => (
                <div key={op.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{op.operation_name}</p>
                    <p className="text-xs text-slate-500">Sequence {op.sequence} · Qty {op.quantity_per_unit}</p>
                  </div>
                  <span className="text-xs text-slate-400">{Number(op.time_min).toFixed(2)} min</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
