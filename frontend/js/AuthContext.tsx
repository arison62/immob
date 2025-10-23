/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useMemo, type ReactNode } from "react";

// --- 1. Interfaces de Typage ---

/**
 * Définit la structure de l'objet utilisateur.
 * Vous devrez probablement étendre cela avec les propriétés réelles de votre utilisateur (id, email, etc.).
 */
interface User {
  // Ajoutez ici les propriétés réelles de votre objet utilisateur, par exemple :
  // id: number;
  // email: string;
  [key: string]: any; // Gardé générique si la structure n'est pas connue pour l'instant
}

/**
 * Définit la forme de la valeur du contexte (ce que useAuth retourne).
 */
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  // Ajoutez ici toute fonction de gestion d'authentification (login, logout, etc.)
  // login: (userData: User) => void;
  // logout: () => void;
}

/**
 * Définit la forme des props reçues par AuthProvider.
 */
interface AuthProviderProps {
  initialAuth: {
    user: User | Record<string, never> | null; // L'objet initial peut contenir un User, un objet vide, ou null
  } | null;
  children: ReactNode;
}

// --- 2. Création du Contexte ---

// On utilise un casting pour le contexte initial car React l'attend.
// Le contexte aura la forme AuthContextValue.
const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  // Initialisez ici les fonctions de contexte si elles existent :
  // login: () => {},
  // logout: () => {},
});

// --- 3. Composant AuthProvider ---

export default function AuthProvider({
  initialAuth,
  children,
}: AuthProviderProps) {
  // On commence avec la valeur initiale de l'utilisateur ou null
  let user: User | null = (initialAuth?.user as User | null) || null;

  // Votre logique de nettoyage de l'utilisateur (si l'objet est vide)
  if (
    typeof user === "object" &&
    user !== null &&
    Object.keys(user).length === 0
  ) {
    user = null;
  }

  // Memoisation de la valeur du contexte pour éviter des re-renderings inutiles
  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
    }),
    [user] // Dépendance à l'objet 'user'
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- 4. Hook Personnalisé ---

/**
 * Hook personnalisé pour accéder facilement aux données d'authentification.
 */
export const useAuth = (): AuthContextValue => useContext(AuthContext);
