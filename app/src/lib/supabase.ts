import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xumidxvqxmixzcizgqap.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bWlkeHZxeG1peHpjaXpncWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzIwNDQsImV4cCI6MjA4NTgwODA0NH0.oeD6CWjCSX7we5lJ3NYT-3eYOEuN0M6qGWHiBOFDtmk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get current user
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper function to get user profile from users table
export async function getUserProfile(authId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

    if (error) throw error;
    return data;
}

// Auth helpers
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signUp = async (email: string, password: string, name: string, role: 'sales' | 'marketing' | 'approver' | 'planner' | 'technician' | 'admin') => {
    // First, create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });
    if (authError) throw authError;

    // Then, create user profile
    if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
            auth_id: authData.user.id,
            email,
            name,
            role,
        });
        if (profileError) throw profileError;
    }

    return authData;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
};
