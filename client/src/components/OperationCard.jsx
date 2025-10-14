export default function OperationCard({ operation, onEdit, onDelete }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{operation.name}</h3>
          <p className="text-sm text-slate-500">{Number(operation.time_min).toFixed(2)} min per piece</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">ID {operation.id}</span>
      </div>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={() => onEdit(operation)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(operation.id)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
