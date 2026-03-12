import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Contract = Tables['contracts']['Row'];
type ContractInsert = Tables['contracts']['Insert'];
type ContractUpdate = Tables['contracts']['Update'];

// =====================================================
// CONTRACTS API
// =====================================================

export const contractsApi = {
    // Get all contracts
    async getAll() {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
        *,
        customers (company_name),
        sites (name),
        users!contracts_sales_id_fkey (name)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get active contracts
    async getActive() {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
        *,
        customers (company_name),
        sites (name)
      `)
            .eq('status', 'active')
            .order('end_date');

        if (error) throw error;
        return data;
    },

    // Get contracts expiring soon
    async getExpiringSoon(days: number = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const { data, error } = await supabase
            .from('contracts_expiring_soon')
            .select('*')
            .lte('days_until_expiry', days);

        if (error) throw error;
        return data;
    },

    // Get single contract with details
    async getById(id: string) {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
        *,
        customers (*),
        sites (*),
        quotations (*),
        pricing_packages (*),
        contract_machines (
          *,
          machines (
            *,
            products (brand, model, type)
          )
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create contract
    async create(contract: Omit<ContractInsert, 'contract_number'>) {
        const { data, error } = await supabase
            .from('contracts')
            .insert({ ...contract, contract_number: '' }) // Auto-generated
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update contract
    async update(id: string, contract: ContractUpdate) {
        const { data, error } = await supabase
            .from('contracts')
            .update(contract)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Activate contract
    async activate(id: string, approverId: string) {
        const { data, error } = await supabase
            .from('contracts')
            .update({
                status: 'active',
                approved_by: approverId,
                approved_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Add machine to contract
    async addMachine(contractId: string, machineId: string, initialMeterMono?: number, initialMeterColor?: number) {
        const { data, error } = await supabase
            .from('contract_machines')
            .insert({
                contract_id: contractId,
                machine_id: machineId,
                initial_meter_mono: initialMeterMono || 0,
                initial_meter_color: initialMeterColor || 0,
                installed_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        // Update machine status to Installed
        await supabase
            .from('machines')
            .update({ status: 'Installed', contract_id: contractId })
            .eq('id', machineId);

        return data;
    },

    // Delete contract
    async delete(id: string) {
        const { error } = await supabase
            .from('contracts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

export type { Contract, ContractInsert, ContractUpdate };
