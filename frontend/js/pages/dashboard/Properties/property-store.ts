import { create } from "zustand";

/**
 * Type de permission (basé sur le service)
 */
export type PermissionLevel = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "none";

/**
 * Interface pour un Immeuble (Building)
 * Basée sur la sortie de `building_service.list_buildings_for_user`
 */
export interface Building {
  id: string;
  name: string;
  user_best_permission: PermissionLevel;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  floor_count: number | null;
  description: string | null;
  // Les propriétés peuvent être chargées séparément ou imbriquées
  properties?: Property[];
}

/**
 * Interface pour une Propriété (Property)
 * Basée sur la sortie de `property_service.list_all_properties_for_user`
 */
export interface Property {
  id?: string;
  name: string;
  building_id: string;
  building_permission: PermissionLevel; // Droit sur le bâtiment parent
  type: string;
  status: string;
  floor: number | null;
  surface_area: number;
  room_count: number;
  bedroom_count: number | null;
  bathroom_count: number | null;
  door_number?: string;
  monthly_rent: number;
  description: string | null;
  has_parking: boolean | null;
  has_balcony: boolean | null;
}

// -------------------------------------------------------------------
// DÉFINITION DU STORE
// -------------------------------------------------------------------

interface PropertyState {
  // --- Données ---
  buildings: Building[];
  properties: Property[];

  // --- État de Sélection (pour les formulaires) ---
  selectedBuilding: Building | null;
  selectedProperty: Property | null;

  // --- Actions (Initialisation) ---
  initializeBuildings: (initialBuildings: Building[]) => void;
  initializeProperties: (initialProperties: Property[]) => void;

  // --- Actions (CRUD Immeubles) ---
  addBuilding: (newBuilding: Building) => void;
  updateBuilding: (updatedBuilding: Building) => void;
  selectBuilding: (building: Building) => void;
  clearBuildingSelection: () => void;

  // --- Actions (CRUD Propriétés) ---
  addProperty: (newProperty: Property) => void;
  updateProperty: (updatedProperty: Property) => void;
  selectProperty: (property: Property) => void;
  clearPropertySelection: () => void;

  // --- État UI (Gestion des Modales/Formulaires) ---
  isBuildingFormOpen: boolean;
  setPropertyFormOpen: (isOpen: boolean) => void;
  isPropertyFormOpen: boolean;
  setBuildingFormOpen: (isOpen: boolean) => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  // --- État Initial ---
  buildings: [],
  properties: [],
  selectedBuilding: null,
  selectedProperty: null,
  isBuildingFormOpen: false,
  isPropertyFormOpen: false,

  // --- Actions (Initialisation) ---
  initializeBuildings: (initialBuildings) =>
    set({ buildings: initialBuildings }),
  initializeProperties: (initialProperties) =>
    set({ properties: initialProperties }),

  // --- Actions (Immeubles) ---
  addBuilding: (newBuilding) =>
    set((state) => ({
      buildings: [...state.buildings, newBuilding],
      isBuildingFormOpen: false, // Ferme le formulaire après succès
    })),

  updateBuilding: (updatedBuilding) =>
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === updatedBuilding.id ? updatedBuilding : b
      ),
      selectedBuilding: null, // Efface la sélection après la mise à jour
      isBuildingFormOpen: false,
    })),

  selectBuilding: (building) =>
    set({ selectedBuilding: building, isBuildingFormOpen: true }),
  clearBuildingSelection: () =>
    set({ selectedBuilding: null, isBuildingFormOpen: false }),
  setBuildingFormOpen: (isOpen) =>
    set((state) => ({
      isBuildingFormOpen: isOpen,
      selectedBuilding: isOpen ? null : state.selectedBuilding,
    })), // Optionnel: reset la sélection si on ouvre pour "Créer"

  // --- Actions (Propriétés) ---
  addProperty: (newProperty) =>
    set((state) => ({
      properties: [...state.properties, newProperty],
      isPropertyFormOpen: false,
    })),

  updateProperty: (updatedProperty) =>
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === updatedProperty.id ? updatedProperty : p
      ),
      selectedProperty: null,
      isPropertyFormOpen: false,
    })),

  selectProperty: (property) =>
    set({ selectedProperty: property, isPropertyFormOpen: true }),
  clearPropertySelection: () =>
    set({ selectedProperty: null, isPropertyFormOpen: false }),
  setPropertyFormOpen: (isOpen) =>
    set((state) => ({
      isPropertyFormOpen: isOpen,
      selectedProperty: isOpen ? null : state.selectedProperty,
    })),
}));
