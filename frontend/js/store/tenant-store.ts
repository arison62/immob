import { create } from "zustand";

// Basé sur le modèle Tenant de Django et TenantDetailsDTO
export interface Tenant {
  id: string; // UUID
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string;
  // On n'inclut pas les données sensibles comme id_number dans le store
}

interface TenantState {
  tenants: Tenant[];
  initializeTenants: (initialTenants: Tenant[]) => void;
  // D'autres actions (add, update, delete) pourront être ajoutées plus tard
}

export const useTenantStore = create<TenantState>((set) => ({
  tenants: [],
  initializeTenants: (initialTenants) => set({ tenants: initialTenants }),
}));
