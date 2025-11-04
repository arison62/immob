import { create } from "zustand";

// Définition de l'interface User basée sur le modèle ImmobUser exposé par Inertia
export interface User {
  id: string; // UUID de Django
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "OWNER" | "MANAGER" | "VIEWER";
  is_active: boolean;
  created_at: string;
  // Ajoutez tout autre champ exposé par votre serializer Django
}

interface TeamState {
  users: User[];
  selectedUser: User | null;

  // Actions
  initializeUsers: (initialUsers: User[]) => void;
  addUser: (newUser: User) => void;
  updateUser: (updatedUser: User) => void;
  selectUser: (user: User) => void;
  clearSelection: () => void;

  // UI
  isFormOpen: boolean;
  setFormOpen: (isOpen: boolean) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  users: [],
  selectedUser: null,

  // Initialisation : Hydratation du store avec les props Inertia
  initializeUsers: (initialUsers) => set({ users: initialUsers }),

  // Ajout après POST réussi
  addUser: (newUser) =>
    set((state) => ({
      users: [...state.users, newUser],
    })),

  // Mise à jour après PUT réussi
  updateUser: (updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      ),
      // Important: mettre à jour la sélection si l'utilisateur en cours d'édition est celui qui a été mis à jour
      selectedUser:
        state.selectedUser && state.selectedUser.id === updatedUser.id
          ? updatedUser
          : null, // On efface la sélection après la save, pour revenir au mode création
    })),

  // Sélection pour le mode édition
  selectUser: (user) => set({ selectedUser: user }),

  // Désélection (Annuler ou après soumission)
  clearSelection: () => set({ selectedUser: null }),

    // Gestion de l'état du formulaire
    isFormOpen: false,
    setFormOpen: (isOpen) => set({ isFormOpen: isOpen }),
}));
