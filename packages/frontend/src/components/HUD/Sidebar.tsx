import { useState } from 'react'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Input,
  Field,
  Button,
  Transition,
} from '@headlessui/react'
import {
  useLayerVisibilityStore,
  SATELLITE_SUBTYPES,
  type SublayerMap,
} from '../../stores/layerVisibilityStore'

interface LayerConfig {
  key: string
  label: string
  subtypes?: Record<string, string>
}

const LAYERS: LayerConfig[] = [
  { key: 'flights', label: 'Flights' },
  { key: 'satellites', label: 'Satellites', subtypes: SATELLITE_SUBTYPES },
  { key: 'vessels', label: 'Vessels' },
  { key: 'trains', label: 'Trains' },
  { key: 'events', label: 'Events' },
]

function LayerRow({ layer }: { layer: LayerConfig }) {
  const active = useLayerVisibilityStore((s) => s.layers[layer.key] ?? true)
  const sublayerMap = useLayerVisibilityStore((s) => s.sublayers[layer.key]) as SublayerMap | undefined
  const toggle = useLayerVisibilityStore((s) => s.toggle)
  const toggleSublayer = useLayerVisibilityStore((s) => s.toggleSublayer)
  const setAllSublayers = useLayerVisibilityStore((s) => s.setAllSublayers)

  const hasSubtypes = !!layer.subtypes
  const allSubsOn = sublayerMap ? Object.values(sublayerMap).every(Boolean) : true

  if (!hasSubtypes || !layer.subtypes) {
    return (
      <button
        onClick={() => toggle(layer.key)}
        className={`block w-full text-left py-2 px-3 text-[15px] cursor-pointer select-none transition-colors rounded-md ${
          active
            ? 'text-white font-medium bg-white/10'
            : 'text-white/40 hover:text-white/60 hover:bg-white/5'
        }`}
      >
        {layer.label}
      </button>
    )
  }

  return (
    <Disclosure defaultOpen={active}>
      {({ open }) => (
        <>
          {/* Top-level row — same style as other layers, full width */}
          <DisclosureButton
            className={`flex items-center w-full text-left py-2 px-3 text-[15px] cursor-pointer select-none transition-colors rounded-md ${
              active
                ? 'text-white font-medium bg-white/10'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <svg
              className={`w-3 h-3 mr-2 text-white/40 transition-transform duration-200 shrink-0 ${
                open ? 'rotate-90' : ''
              }`}
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M6 3l5 5-5 5V3z" />
            </svg>
            <span className="flex-1">{layer.label}</span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                toggle(layer.key)
              }}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                active
                  ? 'text-sky-400 hover:text-sky-300'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              {active ? 'ON' : 'OFF'}
            </span>
          </DisclosureButton>

          <DisclosurePanel
            transition
            className="pl-5 pb-1 flex flex-col gap-0.5 origin-top transition duration-200 ease-out data-[closed]:-translate-y-1 data-[closed]:opacity-0"
          >
            {/* All toggle */}
            <button
              onClick={() => setAllSublayers(layer.key, !allSubsOn)}
              className={`block w-full text-left py-1.5 px-3 text-sm cursor-pointer select-none transition-colors rounded-md ${
                allSubsOn
                  ? 'text-white bg-white/10'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              All
            </button>

            {/* Individual subtypes */}
            {Object.entries(layer.subtypes!).map(([subKey, subLabel]) => {
              const subActive = sublayerMap?.[subKey] ?? true
              return (
                <button
                  key={subKey}
                  onClick={() => toggleSublayer(layer.key, subKey)}
                  className={`block w-full text-left py-1.5 px-3 text-sm cursor-pointer select-none transition-colors rounded-md ${
                    subActive
                      ? 'text-white bg-white/10'
                      : 'text-white/35 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {subLabel}
                </button>
              )
            })}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')

  const filteredLayers = search
    ? LAYERS.filter((l) => l.label.toLowerCase().includes(search.toLowerCase()))
    : LAYERS

  return (
    <div className="fixed left-0 top-0 h-full z-50 flex">
      <Transition
        show={!collapsed}
        enter="transition-all duration-300 ease-out"
        enterFrom="w-0 opacity-0"
        enterTo="w-56 opacity-100"
        leave="transition-all duration-200 ease-in"
        leaveFrom="w-56 opacity-100"
        leaveTo="w-0 opacity-0"
      >
        <div className="h-full bg-black/60 backdrop-blur-md text-white flex flex-col overflow-hidden border-r border-white/[0.06]">
          <div className="px-3 pt-5 pb-3 flex flex-col min-w-56 h-full overflow-y-auto">
            <Field>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1.5 mb-4 rounded-md bg-white/5 border border-white/[0.08] text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              />
            </Field>

            <div className="border-t border-white/[0.08] pt-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3 px-3">
                Layers
              </h3>
              <nav className="flex flex-col gap-0.5">
                {filteredLayers.map((layer) => (
                  <LayerRow key={layer.key} layer={layer} />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </Transition>

      <Button
        onClick={() => setCollapsed((c) => !c)}
        className="self-center -ml-px h-10 w-6 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/[0.06] border-l-0 text-white/40 hover:text-white rounded-r cursor-pointer"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '\u203A' : '\u2039'}
      </Button>
    </div>
  )
}
