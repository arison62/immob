import { create } from "zustand";

// Basé sur le modèle Property de Django
export interface Property {
  id: string; // UUID
  name: string;
  reference_code: string;
}

// Basé sur le modèle Building de Django
export interface Building {
    id: string;
    name: string;
    user_best_permission?: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE';
}


interface PropertyState {
  properties: Property[];
  buildings: Building[];
  isPropertyFormOpen: boolean;
  initializeProperties: (initialProperties: Property[]) => void;
  initializeBuildings: (initialBuildings: Building[]) => void;
  setPropertyFormOpen: (isOpen: boolean) => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  buildings: [],
  isPropertyFormOpen: false,
  initializeProperties: (initialProperties) => set({ properties: initialProperties }),
  initializeBuildings: (initialBuildings) => set({ buildings: initialBuildings }),
  setPropertyFormOpen: (isOpen: boolean) => set({ isPropertyFormOpen: isOpen }),
}));
