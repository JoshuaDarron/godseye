import { create } from 'zustand'

interface LayerVisibilityState {
  layers: Record<string, boolean>
  toggle: (layer: string) => void
}

export const useLayerVisibilityStore = create<LayerVisibilityState>((set) => ({
  layers: {
    flights: true,
    satellites: true,
    vessels: true,
    trains: true,
    events: true,
  },
  toggle: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
}))
