import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// User role type from database
type UserRole = Database['public']['Enums']['user_role'];

// User profile from users table
interface UserProfile {
  id: string;
  auth_id: string | null;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  phone: string | null;
  department: string | null;
  is_active: boolean | null;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module access permissions by role
const modulePermissions: Record<UserRole, string[]> = {
  sales: ['dashboard', 'leads', 'quotations', 'contracts', 'customers', 'sites', 'users'],
  marketing: ['dashboard', 'leads', 'quotations', 'pricing', 'products', 'stock', 'users'],
  approver: ['dashboard', 'approvals', 'quotations', 'contracts', 'reports'],
  planner: ['dashboard', 'jobs', 'inventory', 'contracts', 'machines'],
  technician: ['dashboard', 'jobs', 'job-sheets', 'meter-reading'],
  admin: ['dashboard', 'users', 'leads', 'quotations', 'contracts', 'jobs', 'inventory', 'products', 'pricing', 'reports', 'customers', 'sites', 'machines', 'approvals', 'settings'],
};

// Test accounts (for development)
// Login with email and password: "password123"
// admin@dacp.com, sales@dacp.com, marketing@dacp.com, approver@dacp.com, planner@dacp.com, technician@dacp.com

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from users table with a strict timeout
  const fetchUserProfile = async (authUser: SupabaseUser | null): Promise<UserProfile | null> => {
    if (!authUser) return null;

    // Create a timeout promise that rejects after 8 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 8000);
    });

    const fetchPromise = async () => {
      try {
        // Try to find by auth_id first
        let { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single();

        // If not found by auth_id, try by email (for initial linking)
        if (error || !data) {
          const { data: dataByEmail, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email!)
            .single();

          if (emailError || !dataByEmail) {
            console.error('User profile not found:', error || emailError);
            return null;
          }

          // Link auth_id to user profile
          await supabase
            .from('users')
            .update({ auth_id: authUser.id })
            .eq('id', dataByEmail.id);

          data = dataByEmail;
        }

        return data as UserProfile;
      } catch (err) {
        console.error('Error fetching user profile query:', err);
        return null;
      }
    };

    try {
      // Race the actual fetch against the 8-second timeout
      const result = await Promise.race([fetchPromise(), timeoutPromise]);
      return result;
    } catch (err) {
      console.error('fetchUserProfile error/timeout:', err);
      return null;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        const authUser = session.user;
        fetchUserProfile(authUser).then((profile) => {
          if (mounted) {
            setUser(profile);
            setIsLoading(false);
          }
        });
      } else {
        if (mounted) setIsLoading(false);
      }
    });

    // Listen for auth changes
    // IMPORTANT: Do NOT make async Supabase REST calls directly inside this callback.
    // The Supabase client can deadlock if queries are made before the auth callback completes.
    // Use setTimeout(0) to defer the work to the next macrotask.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        // Synchronously update session only
        setSession(session);

        // Defer async profile fetch to next tick to avoid Supabase client deadlock
        if (session?.user) {
          const authUser = session.user;
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const profile = await fetchUserProfile(authUser);
              if (mounted) {
                setUser(profile);
                setIsLoading(false);
              }
            } catch (err) {
              console.error('Error in deferred auth handler:', err);
              if (mounted) {
                setUser(null);
                setIsLoading(false);
              }
            }
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // For development: allow login with matching email in users table
        // This is a fallback when Supabase Auth users aren't set up yet
        if (password === 'password123') {
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (!profileError && userProfile) {
            setUser(userProfile as UserProfile);
            setIsLoading(false);
            return { success: true };
          }
        }
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // Auth succeeded — fetch profile directly instead of relying on onAuthStateChange
      // This prevents race conditions and avoids the deadlock in the auth callback
      if (authData?.user) {
        setSession(authData.session);
        const profile = await fetchUserProfile(authData.user);
        if (profile) {
          setUser(profile);
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          return { success: false, error: 'ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาติดต่อผู้ดูแลระบบ' };
        }
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const canAccess = useCallback((module: string): boolean => {
    if (!user) return false;
    return modulePermissions[user.role]?.includes(module) || false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { UserRole, UserProfile };
