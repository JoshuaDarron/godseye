import { useState } from 'react'
import { useLayerVisibilityStore } from '../../stores/layerVisibilityStore'

const LAYER_LABELS: Record<string, string> = {
  flights: 'Flights',
  satellites: 'Satellites',
  vessels: 'Vessels',
  trains: 'Trains',
  events: 'Events',
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const layers = useLayerVisibilityStore((s) => s.layers)
  const toggle = useLayerVisibilityStore((s) => s.toggle)

  return (
    <div className="fixed left-0 top-0 h-full z-50 flex">
      {/* Sidebar panel */}
      <div
        className={`h-full bg-black/80 backdrop-blur-md text-white flex flex-col transition-all duration-300 overflow-hidden ${
          collapsed ? 'w-0' : 'w-70'
        }`}
      >
        <div className="p-4 flex flex-col gap-4 min-w-70">
          {/* Header */}
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Layers
          </h2>

          {/* Search bar */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entities..."
            className="w-full px-3 py-2 rounded bg-white/10 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Layer toggles */}
          <div className="flex flex-col gap-1">
            {Object.entries(LAYER_LABELS).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/10 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={layers[key] ?? true}
                  onChange={() => toggle(key)}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Collapse/expand toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="self-center -ml-px h-10 w-6 flex items-center justify-center bg-black/80 backdrop-blur-md text-gray-400 hover:text-white rounded-r cursor-pointer"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </div>
  )
}
