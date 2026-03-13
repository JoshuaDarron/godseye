import { useSelectedEntityStore } from '../../stores/selectedEntityStore'
import { useSatelliteStore } from '../../stores/satelliteStore'

export default function SatelliteDetailPanel() {
  const selected = useSelectedEntityStore((s) => s.selected)
  const clearSelected = useSelectedEntityStore((s) => s.clearSelected)
  const satellites = useSatelliteStore((s) => s.satellites)

  if (!selected || selected.layer !== 'satellites') return null

  const sat = satellites.get(selected.entityId)
  if (!sat) return null

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md animate-slide-up">
      <div className="mx-4 mb-4 rounded-xl bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="font-semibold text-sm">{sat.name}</h3>
          <button
            onClick={clearSelected}
            className="text-gray-400 hover:text-white text-lg leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-xs">
          <Field label="NORAD ID" value={String(sat.noradId)} />
          <Field label="Latitude" value={`${sat.lat.toFixed(4)}°`} />
          <Field label="Longitude" value={`${sat.lng.toFixed(4)}°`} />
          <Field label="Altitude" value={`${sat.altitude.toFixed(1)} km`} />
          <Field label="Velocity" value={`${sat.velocity.toFixed(2)} km/s`} />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-400">{label}</span>
      <p className="text-white font-mono">{value}</p>
    </div>
  )
}
