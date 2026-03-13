import { useSelectedEntityStore } from '../../stores/selectedEntityStore'
import { useSatelliteStore } from '../../stores/satelliteStore'

export default function SatelliteTooltip() {
  const hovered = useSelectedEntityStore((s) => s.hovered)
  const hoverPosition = useSelectedEntityStore((s) => s.hoverPosition)
  const selected = useSelectedEntityStore((s) => s.selected)
  const satellites = useSatelliteStore((s) => s.satellites)

  // Hide tooltip when an entity is selected (the detail modal is open).
  if (selected) return null
  if (!hovered || hovered.layer !== 'satellites' || !hoverPosition) return null

  const sat = satellites.get(hovered.entityId)
  if (!sat) return null

  return (
    <div
      className="fixed z-[100] pointer-events-none px-3 py-2 rounded bg-black/85 backdrop-blur-sm text-white text-xs shadow-lg border border-white/10"
      style={{ left: hoverPosition.x + 14, top: hoverPosition.y - 14 }}
    >
      <p className="font-semibold text-sm mb-1">{sat.name}</p>
      <p className="text-gray-300">Altitude: {sat.altitude.toFixed(1)} km</p>
      <p className="text-gray-300">Velocity: {sat.velocity.toFixed(2)} km/s</p>
      <p className="text-gray-300">NORAD ID: {sat.noradId}</p>
    </div>
  )
}
