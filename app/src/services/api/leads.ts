import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { customersApi, type CustomerInsert } from './customers';

type Tables = Database['public']['Tables'];
type Lead = Tables['leads']['Row'];
type LeadInsert = Tables['leads']['Insert'];
type LeadUpdate = Tables['leads']['Update'];

// =====================================================
// LEADS API
// =====================================================

// Helper to generate unique lead number
const generateLeadNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LD${year}${month}-${random}`;
};

export const leadsApi = {
    // Get all leads with related data
    async getAll() {
        const { data, error } = await supabase
            .from('leads')
            .select(`
        *,
        customers (company_name),
        sites (name),
        users!leads_sales_id_fkey (name),
        quotations (id, quote_number, status)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },


    // Get leads by sales user
    async getBySalesId(salesId: string) {
        const { data, error } = await supabase
            .from('leads')
            .select(`
        *,
        customers (company_name),
        sites (name)
      `)
            .eq('sales_id', salesId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get leads by status
    async getByStatus(status: Database['public']['Enums']['lead_status']) {
        const { data, error } = await supabase
            .from('leads')
            .select(`
        *,
        customers (company_name),
        sites (name),
        users!leads_sales_id_fkey (name)
      `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get single lead
    async getById(id: string) {
        const { data, error } = await supabase
            .from('leads')
            .select(`
        *,
        customers (*),
        sites (*),
        users!leads_sales_id_fkey (name, email)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create lead (lead_number is auto-generated)
    async create(lead: Omit<LeadInsert, 'lead_number'>) {
        const { data, error } = await supabase
            .from('leads')
            .insert({ ...lead, lead_number: generateLeadNumber() })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update lead
    async update(id: string, lead: LeadUpdate) {
        const { data, error } = await supabase
            .from('leads')
            .update(lead)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update lead status
    async updateStatus(id: string, status: Database['public']['Enums']['lead_status']) {
        const { data, error } = await supabase
            .from('leads')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete lead
    async delete(id: string) {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Get lead stats
    async getStats() {
        const { data, error } = await supabase
            .from('leads')
            .select('status');

        if (error) throw error;

        const stats = {
            total: data.length,
            new: data.filter(l => l.status === 'new').length,
            contacted: data.filter(l => l.status === 'contacted').length,
            qualified: data.filter(l => l.status === 'qualified').length,
            proposal: data.filter(l => l.status === 'proposal').length,
            negotiation: data.filter(l => l.status === 'negotiation').length,
            won: data.filter(l => l.status === 'won').length,
            lost: data.filter(l => l.status === 'lost').length,
        };

        return stats;
    },

    // Create lead with optional new customer
    // If newCustomer is provided, create customer first, then create lead
    async createWithCustomer(
        lead: Omit<LeadInsert, 'lead_number' | 'customer_id'>,
        newCustomer?: CustomerInsert
    ): Promise<Lead> {
        let customerId: string;

        if (newCustomer) {
            // Create the new customer first
            const customer = await customersApi.create(newCustomer);
            customerId = customer.id;
        } else {
            throw new Error('customer_id is required when not creating a new customer');
        }

        // Create the lead with the customer_id
        const { data, error } = await supabase
            .from('leads')
            .insert({ ...lead, customer_id: customerId, lead_number: generateLeadNumber() })
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};

// =====================================================
// LEAD REQUIREMENTS API
// =====================================================

export interface LeadRequirement {
    id: string;
    lead_id: string;
    machine_type: 'MFP' | 'Printer';
    color_type: 'Color' | 'Mono';
    paper_size: 'A3' | 'A4';
    quantity: number;
    estimated_volume_black: number | null;
    estimated_volume_color: number | null;
    special_requirements: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface LeadRequirementInsert {
    lead_id: string;
    machine_type: 'MFP' | 'Printer';
    color_type: 'Color' | 'Mono';
    paper_size: 'A3' | 'A4';
    quantity?: number;
    estimated_volume_black?: number | null;
    estimated_volume_color?: number | null;
    special_requirements?: string | null;
}

export const leadRequirementsApi = {
    // Get all requirements for a lead
    async getByLeadId(leadId: string): Promise<LeadRequirement[]> {
        const { data, error } = await supabase
            .from('lead_requirements')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as LeadRequirement[];
    },

    // Create a requirement
    async create(requirement: LeadRequirementInsert): Promise<LeadRequirement> {
        const { data, error } = await supabase
            .from('lead_requirements')
            .insert(requirement)
            .select()
            .single();

        if (error) throw error;
        return data as LeadRequirement;
    },

    // Create multiple requirements
    async createMany(requirements: LeadRequirementInsert[]): Promise<LeadRequirement[]> {
        if (requirements.length === 0) return [];

        const { data, error } = await supabase
            .from('lead_requirements')
            .insert(requirements)
            .select();

        if (error) throw error;
        return data as LeadRequirement[];
    },

    // Update a requirement
    async update(id: string, requirement: Partial<LeadRequirementInsert>): Promise<LeadRequirement> {
        const { data, error } = await supabase
            .from('lead_requirements')
            .update(requirement)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as LeadRequirement;
    },

    // Delete a requirement
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('lead_requirements')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Delete all requirements for a lead
    async deleteByLeadId(leadId: string): Promise<void> {
        const { error } = await supabase
            .from('lead_requirements')
            .delete()
            .eq('lead_id', leadId);

        if (error) throw error;
    },

    // Replace all requirements for a lead (delete existing, insert new)
    async replaceForLead(leadId: string, requirements: Omit<LeadRequirementInsert, 'lead_id'>[]): Promise<LeadRequirement[]> {
        // Delete existing requirements
        await this.deleteByLeadId(leadId);

        // Insert new requirements
        if (requirements.length === 0) return [];

        const requirementsWithLeadId = requirements.map(r => ({ ...r, lead_id: leadId }));
        return this.createMany(requirementsWithLeadId);
    }
};

export type { Lead, LeadInsert, LeadUpdate };
