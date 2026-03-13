import { create } from 'zustand'

export interface PickedEntity {
  layer: string
  entityId: string
}

interface SelectedEntityState {
  hovered: PickedEntity | null
  hoverPosition: { x: number; y: number } | null
  selected: PickedEntity | null
  selectedScreenPosition: { x: number; y: number } | null
  setHovered: (entity: PickedEntity | null, position: { x: number; y: number } | null) => void
  setSelected: (entity: PickedEntity | null, screenPosition?: { x: number; y: number } | null) => void
  clearSelected: () => void
}

export const useSelectedEntityStore = create<SelectedEntityState>((set) => ({
  hovered: null,
  hoverPosition: null,
  selected: null,
  selectedScreenPosition: null,

  setHovered: (entity, position) => set({ hovered: entity, hoverPosition: position }),
  setSelected: (entity, screenPosition) => set({
    selected: entity,
    selectedScreenPosition: screenPosition ?? null,
    hovered: null,
    hoverPosition: null,
  }),
  clearSelected: () => set({ selected: null, selectedScreenPosition: null }),
}))
