"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  firebaseUid: string;
  role: "CUSTOMER";
  authProviders: string[];
  createdAt?: string;
}

interface CustomerAuthContextType {
  firebaseUser: FirebaseUser | null;
  customer: CustomerProfile | null;
  loading: boolean;
  idToken: string | null;
  logout: () => Promise<void>;
  syncProfile: (name?: string, phone?: string) => Promise<CustomerProfile | null>;
  updateProfile: (name: string, phone: string) => Promise<CustomerProfile | null>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  firebaseUser: null,
  customer: null,
  loading: true,
  idToken: null,
  logout: async () => {},
  syncProfile: async () => null,
  updateProfile: async () => null,
  refreshProfile: async () => {},
});

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const syncProfile = useCallback(
    async (extraName?: string, extraPhone?: string): Promise<CustomerProfile | null> => {
      if (!auth.currentUser) {
        setCustomer(null);
        setIdToken(null);
        return null;
      }

      try {
        const token = await auth.currentUser.getIdToken(true);
        setIdToken(token);

        const res = await fetch("/api/auth/customer/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            idToken: token,
            name: extraName,
            phone: extraPhone,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setCustomer(data.user);
          return data.user;
        } else {
          console.warn("Failed to sync customer profile:", data.error);
        }
      } catch (err) {
        console.error("Error during customer profile sync:", err);
      }
      return null;
    },
    []
  );

  const updateProfile = useCallback(
    async (name: string, phone: string): Promise<CustomerProfile | null> => {
      if (!auth.currentUser) return null;

      try {
        const token = await auth.currentUser.getIdToken();
        setIdToken(token);

        const res = await fetch("/api/customer/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, phone }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setCustomer(data.user);
          return data.user;
        } else {
          throw new Error(data.error || "Failed to update profile.");
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        throw err;
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      await syncProfile();
    }
  }, [syncProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          await syncProfile();
        } catch (err) {
          console.error("Error fetching token on auth state change:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setFirebaseUser(null);
        setCustomer(null);
        setIdToken(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncProfile]);

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setCustomer(null);
      setIdToken(null);
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        firebaseUser,
        customer,
        loading,
        idToken,
        logout,
        syncProfile,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
