import { create } from 'zustand'

export interface PickedEntity {
  layer: string
  entityId: string
}

interface SelectedEntityState {
  hovered: PickedEntity | null
  hoverPosition: { x: number; y: number } | null
  selected: PickedEntity | null
  setHovered: (entity: PickedEntity | null, position: { x: number; y: number } | null) => void
  setSelected: (entity: PickedEntity | null) => void
  clearSelected: () => void
}

export const useSelectedEntityStore = create<SelectedEntityState>((set) => ({
  hovered: null,
  hoverPosition: null,
  selected: null,

  setHovered: (entity, position) => set({ hovered: entity, hoverPosition: position }),
  setSelected: (entity) => set({ selected: entity }),
  clearSelected: () => set({ selected: null }),
}))
