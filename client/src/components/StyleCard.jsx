export default function StyleCard({ style, onView, onDelete }) {
  return (
    <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{style.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{Number(style.operation_count || 0)} operations · Overhead {Math.round((style.overhead_pct || 0) * 100)}% · Margin {Math.round((style.margin_pct || 0) * 100)}%</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">ID {style.id}</span>
      </div>
      <div className="mt-4 flex flex-1 flex-wrap items-end gap-3">
        <button
          onClick={() => onView(style.id)}
          className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
        >
          View details
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(style.id)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
