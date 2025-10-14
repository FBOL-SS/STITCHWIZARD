export default function TabMenu({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl space-x-4 px-6" aria-label="Tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative -mb-px border-b-2 px-3 py-3 text-sm font-medium transition ${
              tab.id === activeTab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
