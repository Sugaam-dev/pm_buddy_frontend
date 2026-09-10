"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { UserPersona } from "@/types/api";
import { api } from "@/lib/api";
import { hasPermission as checkPermission, hasRole as checkRole } from "@/lib/permissions";

interface AuthContextType {
  currentUser: UserPersona | null;
  personas: UserPersona[];
  loading: boolean;
  sessionExpired: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  switchPersona: (email: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserPersona | null>(null);
  const [personas, setPersonas] = useState<UserPersona[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  // Load available personas and restore active session if present
  useEffect(() => {
    async function initAuth() {
      try {
        const availablePersonas = await api.getPersonas().catch(() => []);
        setPersonas(availablePersonas);

        // Check if there is an active session in local storage
        const savedToken = localStorage.getItem("pm_buddy_access_token");
        const savedEmail = localStorage.getItem("pm_buddy_active_persona");

        if (savedToken && savedEmail) {
          api.setToken(savedToken);
          try {
            // Attempt to restore user profile from /me
            const me = await api.getMe();
            const matchingPersona = availablePersonas.find((p: UserPersona) => p.email === me.email);
            setCurrentUser({
              user_id: me.user_id,
              email: me.email,
              name: matchingPersona?.name || me.email.split("@")[0].toUpperCase(),
              organization_id: me.organization_id,
              role: me.role,
              permissions: me.permissions,
            });
            api.setOrganization(me.organization_id);
          } catch (meErr) {
            // If token expired, clear stale session
            console.warn("Session token invalid or expired, resetting credentials", meErr);
            localStorage.removeItem("pm_buddy_access_token");
            localStorage.removeItem("pm_buddy_active_persona");
            setCurrentUser(null);
          }
        } else if (savedEmail) {
          // If a persona was selected without token, log them in
          const target = availablePersonas.find((p: UserPersona) => p.email === savedEmail);
          if (target) {
            const authRes = await api.login(target.email);
            localStorage.setItem("pm_buddy_access_token", authRes.access_token);
            setCurrentUser({
              user_id: authRes.user.user_id,
              email: authRes.user.email,
              name: target.name || authRes.user.email.split("@")[0].toUpperCase(),
              organization_id: authRes.user.organization_id,
              role: authRes.user.role,
              permissions: authRes.user.permissions,
            });
          }
        }
      } catch (err) {
        console.error("Failed to initialize authentication:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string = "demo123") => {
    setLoading(true);
    try {
      const authRes = await api.login(email, password);
      localStorage.setItem("pm_buddy_access_token", authRes.access_token);
      localStorage.setItem("pm_buddy_active_persona", authRes.user.email);

      const targetPersona = personas.find((p) => p.email.toLowerCase() === authRes.user.email.toLowerCase());
      const updatedUser: UserPersona = {
        user_id: authRes.user.user_id,
        email: authRes.user.email,
        name: targetPersona?.name || authRes.user.name || authRes.user.email.split("@")[0].toUpperCase(),
        organization_id: authRes.user.organization_id,
        role: authRes.user.role,
        permissions: authRes.user.permissions,
      };

      setCurrentUser(updatedUser);
      setSessionExpired(false);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const authRes = await api.signup(name, email, password);
      localStorage.setItem("pm_buddy_access_token", authRes.access_token);
      localStorage.setItem("pm_buddy_active_persona", authRes.user.email);

      const updatedUser: UserPersona = {
        user_id: authRes.user.user_id,
        email: authRes.user.email,
        name: authRes.user.name || name,
        organization_id: authRes.user.organization_id,
        role: authRes.user.role,
        permissions: authRes.user.permissions,
      };

      setCurrentUser(updatedUser);
      setSessionExpired(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("pm_buddy_access_token");
    localStorage.removeItem("pm_buddy_active_persona");
    localStorage.removeItem("pm_buddy_chat_messages");
    localStorage.removeItem("pm_buddy_conversation_id");
    api.setToken("");
    setCurrentUser(null);
  }, []);

  const switchPersona = async (email: string) => {
    setLoading(true);
    try {
      const authRes = await api.login(email);
      localStorage.setItem("pm_buddy_access_token", authRes.access_token);
      localStorage.setItem("pm_buddy_active_persona", email);

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
    } catch (err) {
      console.error(`Failed to switch persona to ${email}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = useCallback((permission: string) => checkPermission(currentUser, permission), [currentUser]);
  const hasRole = useCallback((role: string) => checkRole(currentUser, role), [currentUser]);
  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  const value = useMemo(
    () => ({
      currentUser,
      personas,
      loading,
      sessionExpired,
      login,
      signup,
      logout,
      switchPersona,
      hasPermission,
      hasRole,
      clearSessionExpired,
    }),
    [currentUser, personas, loading, sessionExpired, logout, hasPermission, hasRole, clearSessionExpired]
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

