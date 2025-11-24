import { create } from "zustand";

// Basé sur le modèle Tenant de Django et TenantDetailsDTO
export interface Tenant {
  id: string; // UUID
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  id_number: string;
}

interface TenantState {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  isFormOpen: boolean;

  initializeTenants: (initialTenants: Tenant[]) => void;
  addTenant: (newTenant: Tenant) => void;
  updateTenant: (updatedTenant: Tenant) => void;
  deleteTenant: (tenantId: string) => void;
  setSelectedTenant: (tenant: Tenant | null) => void;
  setFormOpen: (isOpen: boolean) => void;
  clearSelection: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenants: [],
  selectedTenant: null,
  isFormOpen: false,

  initializeTenants: (initialTenants) => set({ tenants: initialTenants }),

  addTenant: (newTenant) =>
    set((state) => ({
      tenants: [...state.tenants, newTenant],
    })),

  updateTenant: (updatedTenant) =>
    set((state) => ({
      tenants: state.tenants.map((tenant) =>
        tenant.id === updatedTenant.id ? updatedTenant : tenant
      ),
      selectedTenant: null,
    })),

  deleteTenant: (tenantId) =>
    set((state) => ({
      tenants: state.tenants.filter((tenant) => tenant.id !== tenantId),
    })),

  setSelectedTenant: (tenant) => set({ selectedTenant: tenant, isFormOpen: true }),

  setFormOpen: (isOpen) => set({ isFormOpen: isOpen }),

  clearSelection: () => set({ selectedTenant: null, isFormOpen: false }),
}));
