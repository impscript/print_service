import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

// Type aliases for cleaner code
type Tables = Database['public']['Tables'];
type Customer = Tables['customers']['Row'];
type CustomerInsert = Tables['customers']['Insert'];
type CustomerUpdate = Tables['customers']['Update'];

// =====================================================
// CUSTOMERS API
// =====================================================

export const customersApi = {
    // Get all customers
    async getAll() {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('company_name');

        if (error) throw error;
        return data;
    },

    // Get single customer by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get customers with sites
    async getWithSites() {
        const { data, error } = await supabase
            .from('customers')
            .select(`
        *,
        sites (*)
      `)
            .order('company_name');

        if (error) throw error;
        return data;
    },

    // Create new customer
    async create(customer: CustomerInsert) {
        const { data, error } = await supabase
            .from('customers')
            .insert(customer)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update customer
    async update(id: string, customer: CustomerUpdate) {
        const { data, error } = await supabase
            .from('customers')
            .update(customer)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete customer
    async delete(id: string) {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Search customers
    async search(query: string) {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .or(`company_name.ilike.%${query}%,contact_person.ilike.%${query}%,tax_id.ilike.%${query}%`)
            .order('company_name');

        if (error) throw error;
        return data;
    },

    // Find matching customer by tax_id, phone, or company_name
    // Priority: tax_id > phone > company_name (exact match)
    async findMatch(criteria: {
        tax_id?: string;
        phone?: string;
        company_name?: string;
    }): Promise<Customer | null> {
        // Try matching by tax_id first (highest priority)
        if (criteria.tax_id) {
            const { data: byTaxId } = await supabase
                .from('customers')
                .select('*')
                .eq('tax_id', criteria.tax_id)
                .limit(1)
                .single();
            if (byTaxId) return byTaxId;
        }

        // Try matching by phone
        if (criteria.phone) {
            const { data: byPhone } = await supabase
                .from('customers')
                .select('*')
                .eq('phone', criteria.phone)
                .limit(1)
                .single();
            if (byPhone) return byPhone;
        }

        // Try matching by company_name (exact match)
        if (criteria.company_name) {
            const { data: byName } = await supabase
                .from('customers')
                .select('*')
                .eq('company_name', criteria.company_name)
                .limit(1)
                .single();
            if (byName) return byName;
        }

        return null;
    },
};

// =====================================================
// SITES API
// =====================================================

type Site = Tables['sites']['Row'];
type SiteInsert = Tables['sites']['Insert'];
type SiteUpdate = Tables['sites']['Update'];

export const sitesApi = {
    // Get all sites
    async getAll() {
        const { data, error } = await supabase
            .from('sites')
            .select(`
        *,
        customers (company_name)
      `)
            .order('name');

        if (error) throw error;
        return data;
    },

    // Get sites by customer
    async getByCustomer(customerId: string) {
        const { data, error } = await supabase
            .from('sites')
            .select('*')
            .eq('customer_id', customerId)
            .order('name');

        if (error) throw error;
        return data;
    },

    // Get single site
    async getById(id: string) {
        const { data, error } = await supabase
            .from('sites')
            .select(`
        *,
        customers (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create site
    async create(site: SiteInsert) {
        const { data, error } = await supabase
            .from('sites')
            .insert(site)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update site
    async update(id: string, site: SiteUpdate) {
        const { data, error } = await supabase
            .from('sites')
            .update(site)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete site
    async delete(id: string) {
        const { error } = await supabase
            .from('sites')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

export type { Customer, CustomerInsert, CustomerUpdate, Site, SiteInsert, SiteUpdate };
