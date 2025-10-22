import { createContext, useContext, useEffect, useMemo } from "react";

const AuthContext = createContext();

export default function AuthProvider({ initialAuth, children }) {
  let user = initialAuth?.user || null;
  if (typeof user === "object" && user !== null && Object.keys(user).length === 0) {
    user = null;
  }
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
