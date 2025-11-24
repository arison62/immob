import { create } from "zustand";


// Définition des types basés sur les TextChoices de Django
export type ContratStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";
export type PaymentFrequency = "MONTHLY" | "QUARTERLY" | "ANNUALLY";

// Interface pour un Contrat, basée sur ContratDetailsDTO
export interface Contrat {
  id: string; // UUID
  contrat_number: string;
  property_id: string;
  tenant_id: string;
  start_date: string; // date as string
  end_date: string; // date as string
  monthly_rent: number; // Decimal sera un number en JS
  security_deposit: number | null;
  charges: number | null;
  payment_frequency: PaymentFrequency;
  status: ContratStatus;
  terms: string | null;
  is_deleted: boolean;
  created_at: string; // datetime as string
  updated_at: string; // datetime as string
  workspace_id: string;
}

interface ContratState {
  contrats: Contrat[];
  selectedContrat: Contrat | null;

  // Actions
  initializeContrats: (initialContrats: Contrat[]) => void;
  addContrat: (newContrat: Contrat) => void;
  updateContrat: (updatedContrat: Contrat) => void;
  deleteContrat: (contratId: string) => void;
  selectContrat: (contrat: Contrat) => void;
  clearSelection: () => void;

  // UI
  isFormOpen: boolean;
  setFormOpen: (isOpen: boolean) => void;
}

export const useContratStore = create<ContratState>((set) => ({
  contrats: [],
  selectedContrat: null,

  // Initialisation : Hydratation du store avec les props Inertia
  initializeContrats: (initialContrats) => set({ contrats: initialContrats }),

  // Ajout après POST réussi
  addContrat: (newContrat) =>
    set((state) => ({
      contrats: [...state.contrats, newContrat],
    })),

  // Mise à jour après PUT réussi
  updateContrat: (updatedContrat) =>
    set((state) => ({
      contrats: state.contrats.map((contrat) =>
        contrat.id === updatedContrat.id ? updatedContrat : contrat
      ),
      selectedContrat: null, // Effacer la sélection après la mise à jour
    })),

  // Suppression après DELETE réussi
  deleteContrat: (contratId) =>
    set((state) => ({
      contrats: state.contrats.filter((contrat) => contrat.id !== contratId),
    })),

  // Sélection pour le mode édition
  selectContrat: (contrat) => set({ selectedContrat: contrat, isFormOpen: true }),

  // Désélection (Annuler ou après soumission)
  clearSelection: () => set({ selectedContrat: null, isFormOpen: false }),

  // Gestion de l'état du formulaire
  isFormOpen: false,
  setFormOpen: (isOpen) => set({ isFormOpen: isOpen }),
}));
