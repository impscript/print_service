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

  // Fetch user profile from users table
  const fetchUserProfile = async (authUser: SupabaseUser | null): Promise<UserProfile | null> => {
    if (!authUser) return null;

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
  };

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user).then(setUser);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const profile = await fetchUserProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
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
            return { success: true };
          }
        }

        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user);
        if (!profile) {
          return { success: false, error: 'User profile not found' };
        }
        setUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
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
