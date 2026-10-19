import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  sessionExpired: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isNotAdmin?: boolean }>;
  signOut: () => Promise<void>;
  resetSessionExpired: () => void;
}

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());

  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) return false;
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }, []);

  // Inactivity timeout handler
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!user) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, handleActivity));

    const interval = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
        setSessionExpired(true);
        handleSignOut();
      }
    }, 15000); // Check every 15 seconds

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      window.clearInterval(interval);
    };
  }, [user, handleActivity, handleSignOut]);

  // Initial session check
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (initialSession?.user) {
          const authorized = await checkAdminStatus(initialSession.user.id);
          if (!mounted) return;

          if (authorized) {
            setSession(initialSession);
            setUser(initialSession.user);
            setIsAdmin(true);
          } else {
            // Not in admins table -> sign out
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch {
        // Fallback gracefully on network error
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase
      ? supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!mounted) return;
        if (newSession?.user) {
          const authorized = await checkAdminStatus(newSession.user.id);
          if (authorized) {
            setSession(newSession);
            setUser(newSession.user);
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      })
      : { data: { subscription: { unsubscribe: () => { } } } };

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error: new Error(
          "Supabase is not configured yet. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
        ),
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return { error };

      if (!data.user) {
        return { error: new Error("Authentication failed: No user returned.") };
      }

      // Check if user is in allow-listed admins table
      const authorized = await checkAdminStatus(data.user.id);
      if (!authorized) {
        await supabase.auth.signOut();
        return {
          error: new Error("Access denied: Your account is not on the admin allow-list."),
          isNotAdmin: true,
        };
      }

      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      setSessionExpired(false);
      lastActivityRef.current = Date.now();

      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error("An unexpected error occurred.") };
    }
  };

  const resetSessionExpired = () => setSessionExpired(false);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        sessionExpired,
        signIn,
        signOut: handleSignOut,
        resetSessionExpired,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
