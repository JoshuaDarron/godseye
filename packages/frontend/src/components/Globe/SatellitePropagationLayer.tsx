import { useMemo } from 'react'
import { useLayerVisibilityStore } from '../../stores/layerVisibilityStore'
import { useSatelliteStore } from '../../stores/satelliteStore'
import { useSatellitePropagation } from '../../hooks/useSatellitePropagation'
import ModelLayer, { type ModelEntity } from './ModelLayer'
import type { LayerRegistration } from '../../registries/layerRegistry'
import type { Satellite } from '../../types/satellite'

/**
 * Custom satellite rendering layer that uses client-side SGP4 propagation
 * for smooth 60fps movement instead of relying on 1-second server pushes.
 */
export default function SatellitePropagationLayer({
  registration: reg,
}: {
  registration: LayerRegistration
}) {
  const sublayerMap = useLayerVisibilityStore((s) => s.sublayers[reg.key])
  const entities = useSatelliteStore((s) => s.entities)

  // Propagate all satellite positions at ~60fps from TLE data.
  const propagated = useSatellitePropagation(entities)

  const hasSubtypes = !!(reg.subtypes && reg.classifySubtype)

  // Group propagated positions by subtype, filtering by visibility.
  const grouped = useMemo(() => {
    if (!hasSubtypes) {
      return new Map([['__default', propagated]])
    }

    const groups = new Map<string, Map<string, ModelEntity>>()
    propagated.forEach((modelEntity, id) => {
      const rawEntity = entities.get(id)
      if (!rawEntity) return

      const subtype = reg.classifySubtype!(rawEntity as Satellite)
      if (sublayerMap && !sublayerMap[subtype]) return

      if (!groups.has(subtype)) groups.set(subtype, new Map())
      groups.get(subtype)!.set(id, modelEntity)
    })
    return groups
  }, [propagated, entities, sublayerMap, hasSubtypes, reg])

  if (!hasSubtypes) {
    const map = grouped.get('__default')!
    return (
      <ModelLayer
        iconUrl={reg.iconUrl}
        entities={map}
        fallbackColor={reg.fallbackColor}
        fallbackPixelSize={reg.fallbackPixelSize}
        iconScale={reg.iconScale}
        layerName={reg.key}
        disableRotation={reg.disableRotation}
      />
    )
  }

  return (
    <>
      {Array.from(grouped.entries()).map(([subtype, map]) => (
        <ModelLayer
          key={subtype}
          iconUrl={reg.subtypeIcons?.[subtype] ?? reg.iconUrl}
          entities={map}
          fallbackColor={reg.subtypeColors?.[subtype] ?? reg.fallbackColor}
          fallbackPixelSize={reg.fallbackPixelSize}
          iconScale={reg.iconScale}
          layerName={reg.key}
          disableRotation={reg.disableRotation}
        />
      ))}
    </>
  )
}
