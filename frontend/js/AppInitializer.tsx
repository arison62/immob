/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, type ReactNode } from "react";
import { appStore, type PermissionLevel } from "@/store/app-store";
import axios from "axios";

interface AuthProviderProps {
  initialAuth: {
    user: Record<string, any>;
  } | null;
  children: ReactNode;
}

/**
 * Composant responsable de l'initialisation de l'etat Zustand global
 * avec les donnees Inertia et de la recuperation des permissions globales
 *
 */

export default function AppInitializer({
  initialAuth,
  children,
}: AuthProviderProps) {
  const setUser = appStore((state) => state.setUser);
  const setGlobalPermissions = appStore(
    (state) => state.setGlobalPermissions
  );
  const setPermissionLoaded = appStore((state) => state.setPermissionLoaded);

  useEffect(() => {
    let user = initialAuth?.user || null;
    
    const getGlobalPermissions = async () => {

      try {
        const response = await axios.get("/dashboard/permissions");
      
        const permissions = response.data as {
          bulding_scope_perm: PermissionLevel;
        };

        setGlobalPermissions(permissions as any);
        setPermissionLoaded(true);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des permissions globales: ",
          error
        );
      }
    };

    if (
      typeof user === "object" &&
      user !== null &&
      Object.keys(user).length === 0
    ) {
      user = null;
    }

    setUser(user as any);
    if (user) {
      getGlobalPermissions();
    }
  }, []);

  return <>{children}</>;
}
