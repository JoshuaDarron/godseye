import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelectedEntityStore } from '../../stores/selectedEntityStore'
import { useSatelliteStore } from '../../stores/satelliteStore'

const DEFAULT_WIDTH = 360
const DEFAULT_HEIGHT = 200
const MIN_WIDTH = 260
const MIN_HEIGHT = 140
const OFFSET = 16

type DragMode = 'move' | 'resize' | null

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Position the modal to the side of the click point, keeping it on screen. */
function computeInitialPosition(
  clickX: number,
  clickY: number,
  width: number,
  height: number,
) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Prefer placing to the right of the click; flip left if it would overflow.
  let x = clickX + OFFSET
  if (x + width > vw - OFFSET) {
    x = clickX - width - OFFSET
  }
  x = clamp(x, OFFSET, vw - width - OFFSET)

  // Vertically center on the click point, clamped to viewport.
  let y = clickY - height / 2
  y = clamp(y, OFFSET, vh - height - OFFSET)

  return { x: Math.round(x), y: Math.round(y) }
}

export default function SatelliteDetailPanel() {
  const selected = useSelectedEntityStore((s) => s.selected)
  const screenPos = useSelectedEntityStore((s) => s.selectedScreenPosition)
  const clearSelected = useSelectedEntityStore((s) => s.clearSelected)
  const satellites = useSatelliteStore((s) => s.satellites)

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT })
  const [initialized, setInitialized] = useState(false)

  const mode = useRef<DragMode>(null)
  const startMouse = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ w: 0, h: 0 })

  // Position the modal beside the selected entity.
  useEffect(() => {
    if (selected && selected.layer === 'satellites') {
      const clickX = screenPos?.x ?? window.innerWidth / 2
      const clickY = screenPos?.y ?? window.innerHeight / 2
      setPos(computeInitialPosition(clickX, clickY, DEFAULT_WIDTH, DEFAULT_HEIGHT))
      setSize({ w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT })
      setInitialized(true)
    } else {
      setInitialized(false)
    }
  }, [selected, screenPos])

  const onMoveDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    mode.current = 'move'
    startMouse.current = { x: e.clientX, y: e.clientY }
    startPos.current = { ...pos }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [pos])

  const onResizeDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    mode.current = 'resize'
    startMouse.current = { x: e.clientX, y: e.clientY }
    startSize.current = { ...size }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [size])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!mode.current) return
    const dx = e.clientX - startMouse.current.x
    const dy = e.clientY - startMouse.current.y

    if (mode.current === 'move') {
      setPos({
        x: startPos.current.x + dx,
        y: startPos.current.y + dy,
      })
    } else if (mode.current === 'resize') {
      setSize({
        w: Math.max(MIN_WIDTH, startSize.current.w + dx),
        h: Math.max(MIN_HEIGHT, startSize.current.h + dy),
      })
    }
  }, [])

  const onPointerUp = useCallback(() => {
    mode.current = null
  }, [])

  if (!selected || selected.layer !== 'satellites' || !initialized) return null

  const sat = satellites.get(selected.entityId)
  if (!sat) return null

  return (
    <div
      className="fixed z-[100] flex flex-col rounded-lg overflow-hidden border border-white/10 shadow-2xl"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Title bar — drag to move */}
      <div
        onPointerDown={onMoveDown}
        className="flex items-center justify-between px-3 py-2 bg-black/90 backdrop-blur-md cursor-grab active:cursor-grabbing select-none border-b border-white/10 shrink-0"
      >
        <h3 className="font-semibold text-sm text-white truncate pr-2">{sat.name}</h3>
        <button
          onClick={clearSelected}
          className="text-gray-400 hover:text-white text-lg leading-none cursor-pointer shrink-0"
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 bg-black/80 backdrop-blur-md text-white overflow-auto p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <Field label="NORAD ID" value={String(sat.noradId)} />
          <Field label="Latitude" value={`${sat.lat.toFixed(4)}\u00B0`} />
          <Field label="Longitude" value={`${sat.lng.toFixed(4)}\u00B0`} />
          <Field label="Altitude" value={`${sat.altitude.toFixed(1)} km`} />
          <Field label="Velocity" value={`${sat.velocity.toFixed(2)} km/s`} />
        </div>
      </div>

      {/* Resize handle — bottom-right corner */}
      <div
        onPointerDown={onResizeDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
      >
        <svg
          className="w-full h-full text-white/30 hover:text-white/60 transition-colors"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M14 14H10L14 10V14ZM14 8L8 14H6L14 6V8Z" />
        </svg>
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
