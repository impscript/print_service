import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export const usersApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .neq('is_active', false)
            .order('name');

        if (error) throw error;
        return data;
    },

    async getByRole(role: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', role as Database['public']['Enums']['user_role'])
            .neq('is_active', false)
            .order('name');

        if (error) throw error;
        return data;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(user: Database['public']['Tables']['users']['Insert']) {
        const { data, error } = await supabase
            .from('users')
            .insert(user)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, user: Database['public']['Tables']['users']['Update']) {
        const { data, error } = await supabase
            .from('users')
            .update(user)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('users')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;
    }
    ,

    async linkIdentity() {
        const { error } = await supabase.rpc('link_user_identity');
        if (error) throw error;
    }
};
