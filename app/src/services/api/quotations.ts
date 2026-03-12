import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Quotation = Tables['quotations']['Row'];
type QuotationInsert = Tables['quotations']['Insert'];
type QuotationUpdate = Tables['quotations']['Update'];
type QuotationItem = Tables['quotation_items']['Row'];
type QuotationItemInsert = Tables['quotation_items']['Insert'];

// =====================================================
// QUOTATIONS API
// =====================================================

// Helper to generate unique quote number
const generateQuoteNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `QT${year}${month}-${random}`;
};


export const quotationsApi = {
    // Get all quotations with related data
    async getAll() {
        const { data, error } = await supabase
            .from('quotations')
            .select(`
        *,
        customers (*),
        sites (name),
        leads (lead_number),
        users!quotations_sales_id_fkey (name)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get quotations by status
    async getByStatus(status: Database['public']['Enums']['quote_status']) {
        const { data, error } = await supabase
            .from('quotations')
            .select(`
        *,
        customers (*),
        sites (name),
        users!quotations_sales_id_fkey (name)
      `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get quotations pending approval
    async getPendingApproval() {
        return this.getByStatus('pending_approval');
    },

    // Get single quotation with items
    async getById(id: string) {
        const { data, error } = await supabase
            .from('quotations')
            .select(`
        *,
        customers (*),
        sites (*),
        leads (*),
        users!quotations_sales_id_fkey (name, email, phone),
        quotation_items (
          *,
          products (brand, model, type, paper_size, color_type, speed_ppm)
        ),
        pricing_packages (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create quotation (quote_number is auto-generated)
    async create(quotation: Omit<QuotationInsert, 'quote_number'>, items?: Omit<QuotationItemInsert, 'quotation_id'>[]) {
        // Start a transaction by inserting quotation first
        const { data: quoteData, error: quoteError } = await supabase
            .from('quotations')
            .insert({ ...quotation, quote_number: generateQuoteNumber() })
            .select()
            .single();

        if (quoteError) throw quoteError;

        // Insert items if provided
        if (items && items.length > 0) {
            const itemsWithQuoteId = items.map(item => ({
                ...item,
                quotation_id: quoteData.id,
            }));

            const { error: itemsError } = await supabase
                .from('quotation_items')
                .insert(itemsWithQuoteId);

            if (itemsError) throw itemsError;
        }

        return quoteData;
    },

    // Update quotation
    async update(id: string, quotation: QuotationUpdate) {
        const { data, error } = await supabase
            .from('quotations')
            .update(quotation)
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            throw new Error('Update failed: No matching quotation found or permission denied');
        }
        return data[0];
    },

    // Update quotation with items
    async updateWithItems(id: string, quotation: QuotationUpdate, items: Omit<QuotationItemInsert, 'quotation_id'>[]) {
        // 1. Update Header
        const { data, error } = await supabase
            .from('quotations')
            .update(quotation)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // 2. Delete existing items
        const { error: deleteError } = await supabase
            .from('quotation_items')
            .delete()
            .eq('quotation_id', id);

        if (deleteError) throw deleteError;

        // 3. Insert new items
        if (items && items.length > 0) {
            const itemsWithQuoteId = items.map(item => ({
                ...item,
                quotation_id: id,
            }));

            const { error: insertError } = await supabase
                .from('quotation_items')
                .insert(itemsWithQuoteId);

            if (insertError) throw insertError;
        }

        return data;
    },

    // Approve quotation
    async approve(id: string, approverId: string) {
        const { data, error } = await supabase
            .from('quotations')
            .update({
                status: 'approved',
                approved_by: approverId,
                approved_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Reject quotation
    async reject(id: string, approverId: string, reason: string) {
        const { data, error } = await supabase
            .from('quotations')
            .update({
                status: 'rejected',
                approved_by: approverId,
                approved_at: new Date().toISOString(),
                rejection_reason: reason,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Submit for approval
    async submitForApproval(id: string) {
        const { data, error } = await supabase
            .from('quotations')
            .update({ status: 'pending_approval' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete quotation
    async delete(id: string) {
        const { error } = await supabase
            .from('quotations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

export type { Quotation, QuotationInsert, QuotationUpdate, QuotationItem, QuotationItemInsert };
