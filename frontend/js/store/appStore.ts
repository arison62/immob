import { useStore, create } from "zustand";
import { useShallow } from "zustand/shallow";

export type PermissionLevel =
  | "none"
  | "can_view"
  | "can_update"
  | "can_create"
  | "can_delete";

interface GlobalPermissions {
  property_scope_perm: PermissionLevel;
  building_scope_perm: PermissionLevel;
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  globalPermissions: GlobalPermissions;
  permissionLoaded: boolean;
  setUser: (user: User | null) => void;
  setGlobalPermissions: (permissions: GlobalPermissions) => void;
  setPermissionLoaded: (loaded: boolean) => void;
  logout: () => void;
}

const initialPermissions: GlobalPermissions = {
  property_scope_perm: "none",
  building_scope_perm: "none",
};

export const appStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  globalPermissions: initialPermissions,
  permissionLoaded: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setGlobalPermissions: (permissions) =>
    set({ globalPermissions: permissions }),
  setPermissionLoaded: (loaded) => set({ permissionLoaded: loaded }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export const useAuth = () =>
  useStore(
    appStore,
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      globalPermissions: state.globalPermissions,
      permissionLoaded: state.permissionLoaded,
    }))
  );

export const useGlobalPermissions = () =>
  useStore(
    appStore,
    useShallow((state) => ({
      globalPermissions: state.globalPermissions,
      permissionLoaded: state.permissionLoaded,
    }))
  );
