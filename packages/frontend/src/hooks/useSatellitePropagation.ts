import { useEffect, useRef, useState } from 'react'
import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  degreesLat,
  degreesLong,
  type SatRec,
} from 'satellite.js'
import type { Satellite } from '../types/satellite'
import type { ModelEntity } from '../components/Globe/ModelLayer'

/** Propagation interval in ms. 100ms (10Hz) is smooth for orbital speeds. */
const PROPAGATION_INTERVAL_MS = 100

/**
 * Client-side SGP4 propagation loop for smooth satellite movement.
 *
 * Instead of relying solely on the server's 1-second position pushes,
 * this hook re-propagates every satellite's position from its TLE data
 * at 10Hz (~100ms intervals), producing smooth continuous motion.
 *
 * The server-pushed positions are used only to keep the TLE catalog
 * in sync — the rendered positions always come from local propagation.
 */
export function useSatellitePropagation(
  entities: Map<string, Satellite>,
): Map<string, ModelEntity> {
  const [positions, setPositions] = useState<Map<string, ModelEntity>>(() => new Map())
  const satrecCacheRef = useRef<Map<string, SatRec>>(new Map())
  const entitiesRef = useRef(entities)
  entitiesRef.current = entities

  useEffect(() => {
    const cache = satrecCacheRef.current

    const tick = () => {
      const ents = entitiesRef.current
      if (ents.size === 0) return

      const now = new Date()
      const gmst = gstime(now)
      const next = new Map<string, ModelEntity>()

      ents.forEach((sat, id) => {
        // Lazily parse/cache the satrec from TLE strings.
        let satrec = cache.get(id)
        if (!satrec) {
          if (!sat.tle1 || !sat.tle2) return
          satrec = twoline2satrec(sat.tle1, sat.tle2)
          cache.set(id, satrec)
        }

        const posVel = propagate(satrec, now)
        if (!posVel || typeof posVel.position === 'boolean') return

        const geo = eciToGeodetic(posVel.position, gmst)
        const lat = degreesLat(geo.latitude)
        const lng = degreesLong(geo.longitude)
        const altKm = geo.height

        if (isNaN(lat) || isNaN(lng) || isNaN(altKm)) return
        if (lat > 90 || lat < -90 || lng > 180 || lng < -180) return

        next.set(id, {
          id,
          lon: lng,
          lat,
          alt: altKm * 1000, // convert to meters for Cesium
          heading: 0,
        })
      })

      setPositions(next)
    }

    // Run immediately, then at a fixed interval.
    tick()
    const intervalId = setInterval(tick, PROPAGATION_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  // Evict cached satrecs for entities that disappeared or whose TLEs changed.
  useEffect(() => {
    const cache = satrecCacheRef.current
    for (const [id] of cache) {
      if (!entities.has(id)) {
        cache.delete(id)
      }
    }
  }, [entities])

  return positions
}
