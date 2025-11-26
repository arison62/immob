import { create } from "zustand";

// Basé sur le modèle Property de Django
export interface Property {
  id: string; // UUID
  name: string;
  reference_code: string;
  monthly_rent: string;
}

// Basé sur le modèle Building de Django
export interface Building {
  id: string;
  name: string;
  description?: string;
  floor_count: number;
  street: string;
  postal_code?: string;
  city: string;
  country: string;
  user_best_permission?: "VIEW" | "CREATE" | "UPDATE" | "DELETE";
}

interface PropertyState {
  properties: Property[];
  buildings: Building[];
  selectedProperty: Property | null;
  selectedBuilding: Building | null;
  isPropertyFormOpen: boolean;
  isBuildingFormOpen: boolean;
  clearPropertySelection: () => void;
  clearBuildingSelection: () => void;
  selectProperty: (property: Property) => void;
  selectBuilding: (building: Building) => void;
  initializeProperties: (initialProperties: Property[]) => void;
  initializeBuildings: (initialBuildings: Building[]) => void;
  setPropertyFormOpen: (isOpen: boolean) => void;
  setBuildingFormOpen: (isOpen: boolean) => void;
  addProperty: (newProperty: Property) => void;
  addBuilding: (newBuilding: Building) => void;
  updateProperty: (updatedProperty: Property) => void;
  updateBuilding: (updatedBuilding: Building) => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  buildings: [],
  isPropertyFormOpen: false,
  isBuildingFormOpen: false,
  selectedProperty: null,
  selectedBuilding: null,
  clearPropertySelection: () => set({ selectedProperty: null }),
  clearBuildingSelection: () => set({ selectedBuilding: null }),
  selectBuilding: (building) => set({ selectedBuilding: building }),
  selectProperty: (property) => set({ selectedProperty: property }),
  initializeProperties: (initialProperties) =>
    set({ properties: initialProperties }),
  initializeBuildings: (initialBuildings) =>
    set({ buildings: initialBuildings }),
  setPropertyFormOpen: (isOpen: boolean) => set({ isPropertyFormOpen: isOpen }),
  setBuildingFormOpen: (isOpen: boolean) => set({ isBuildingFormOpen: isOpen }),
  addProperty: (newProperty) => set((state) => ({ properties: [...state.properties, newProperty] })),
  addBuilding: (newBuilding) => set((state) => ({ buildings: [...state.buildings, newBuilding] })),
  updateProperty: (updatedProperty) => set((state) => ({ properties: state.properties.map((property) => (property.id === updatedProperty.id ? updatedProperty : property)) })),
  updateBuilding: (updatedBuilding) => set((state) => ({ buildings: state.buildings.map((building) => (building.id === updatedBuilding.id ? updatedBuilding : building)) })),
}));
