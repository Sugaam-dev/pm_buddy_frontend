"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { UserPersona } from "@/types/api";
import { api } from "@/lib/api";
import { hasPermission as checkPermission, hasRole as checkRole } from "@/lib/permissions";

interface AuthContextType {
  currentUser: UserPersona | null;
  personas: UserPersona[];
  loading: boolean;
  switchPersona: (email: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserPersona | null>(null);
  const [personas, setPersonas] = useState<UserPersona[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load available personas and restore active session
  useEffect(() => {
    async function initAuth() {
      try {
        const availablePersonas = await api.getPersonas();
        setPersonas(availablePersonas);

        // Check local storage for saved persona
        const savedEmail = localStorage.getItem("pm_buddy_active_persona") || "alice@acme.com";
        const targetPersona = availablePersonas.find((p: UserPersona) => p.email === savedEmail) || availablePersonas[0];

        if (targetPersona) {
          const authRes = await api.login(targetPersona.email);
          setCurrentUser({
            user_id: authRes.user.user_id,
            email: authRes.user.email,
            name: targetPersona.name || authRes.user.email.split("@")[0].toUpperCase(),
            organization_id: authRes.user.organization_id,
            role: authRes.user.role,
            permissions: authRes.user.permissions,
          });
        }
      } catch (err) {
        console.error("Failed to initialize authentication personas:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const switchPersona = async (email: string) => {
    setLoading(true);
    try {
      const authRes = await api.login(email);
      const targetPersona = personas.find((p) => p.email === email);

      const updatedUser: UserPersona = {
        user_id: authRes.user.user_id,
        email: authRes.user.email,
        name: targetPersona?.name || email.split("@")[0].toUpperCase(),
        organization_id: authRes.user.organization_id,
        role: authRes.user.role,
        permissions: authRes.user.permissions,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("pm_buddy_active_persona", email);
    } catch (err) {
      console.error(`Failed to switch persona to ${email}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string) => checkPermission(currentUser, permission);
  const hasRole = (role: string) => checkRole(currentUser, role);

  const value = useMemo(
    () => ({
      currentUser,
      personas,
      loading,
      switchPersona,
      hasPermission,
      hasRole,
    }),
    [currentUser, personas, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
