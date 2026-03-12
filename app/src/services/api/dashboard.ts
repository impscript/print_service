import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export interface DashboardCounts {
  totalLeads: number;
  activeQuotations: number;
  activeContracts: number;
  pendingJobs: number;
  monthlyRevenue: number;
  contractsExpiring30Days: number;
  pendingApprovals: number;
  lowStockItems: number;
}

type Views = Database['public']['Views'];
type DashboardStats = Views['dashboard_stats']['Row'];

// =====================================================
// DASHBOARD API
// =====================================================

export const dashboardApi = {
    // Get dashboard stats
    async getStats(): Promise<DashboardStats> {
        const { data, error } = await supabase
            .from('dashboard_stats')
            .select('*')
            .single();

        if (error) throw error;
        return data;
    },

    // Get recent activity (leads, quotations, jobs)
    async getRecentActivity(limit: number = 10) {
        const [leadsResult, quotesResult, jobsResult] = await Promise.all([
            supabase
                .from('leads')
                .select('id, lead_number, status, created_at, customers(company_name)')
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('quotations')
                .select('id, quote_number, status, created_at, customers(company_name)')
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('jobs')
                .select('id, job_number, type, status, scheduled_date, customers(company_name)')
                .order('created_at', { ascending: false })
                .limit(limit),
        ]);

        return {
            leads: leadsResult.data || [],
            quotations: quotesResult.data || [],
            jobs: jobsResult.data || [],
        };
    },

    // Get contracts expiring soon
    async getExpiringContracts(limit: number = 5) {
        const { data, error } = await supabase
            .from('contracts_expiring_soon')
            .select('*')
            .limit(limit);

        if (error) throw error;
        return data;
    },

    // Get pending approvals for approver
    async getPendingApprovals() {
        const [quotesResult, contractsResult] = await Promise.all([
            supabase
                .from('quotations')
                .select('id, quote_number, total, created_at, customers(company_name)')
                .eq('status', 'pending_approval')
                .order('created_at'),
            supabase
                .from('contracts')
                .select('id, contract_number, monthly_fee, created_at, customers(company_name)')
                .eq('status', 'pending_approval')
                .order('created_at'),
        ]);

        return {
            quotations: quotesResult.data || [],
            contracts: contractsResult.data || [],
            total: (quotesResult.data?.length || 0) + (contractsResult.data?.length || 0),
        };
    },

    // Get technician's jobs for today
    async getTechnicianTodayJobs(technicianId: string) {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('jobs')
            .select(`
        *,
        customers (company_name, phone),
        sites (name, address),
        machines (serial_number, products (brand, model))
      `)
            .eq('assigned_to', technicianId)
            .eq('scheduled_date', today)
            .in('status', ['assigned', 'in_progress'])
            .order('priority', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get aggregated counts for dashboard metric cards
    async getDashboardCounts(role?: string, userId?: string): Promise<DashboardCounts> {
        // 1. Total Leads
        const { count: totalLeads } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true });

        // 2. Active Quotations
        let qbQuotations = supabase
            .from('quotations')
            .select('*', { count: 'exact', head: true })
            .not('status', 'in', '("draft", "rejected")');
            
        if (role === 'sales' && userId) {
            qbQuotations = qbQuotations.eq('sales_id', userId);
        }
        const { count: activeQuotations } = await qbQuotations;

        // 3. Active Contracts
        const { count: activeContracts } = await supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // 4. Pending Jobs
        let qbJobs = supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'completed');
            
        if (role === 'technician' && userId) {
            qbJobs = qbJobs.eq('assigned_to', userId);
        }
        const { count: pendingJobs } = await qbJobs;

        // 5. Contracts Expiring in 60 days
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
        
        const { count: contractsExpiring30Days } = await supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .lte('end_date', sixtyDaysFromNow.toISOString().split('T')[0]);

        // 6. Pending Approvals (both Contracts and Quotations)
        const { count: pendingQuotationsCount } = await supabase
            .from('quotations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending_approval');
            
        const { count: pendingContractsCount } = await supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending_approval');

        // 7. Calculate Monthly Revenue (sum of basic active contract fees)
        const { data: revenueData } = await supabase
            .from('contracts')
            .select('monthly_fee')
            .eq('status', 'active');
            
        const monthlyRevenue = revenueData?.reduce((sum, c) => sum + (c.monthly_fee || 0), 0) || 0;

        // 8. Low Stock Items (Mocked for now)
        const lowStockItems = 5;

        return {
            totalLeads: totalLeads || 0,
            activeQuotations: activeQuotations || 0,
            activeContracts: activeContracts || 0,
            pendingJobs: pendingJobs || 0,
            monthlyRevenue,
            contractsExpiring30Days: contractsExpiring30Days || 0,
            pendingApprovals: (pendingQuotationsCount || 0) + (pendingContractsCount || 0),
            lowStockItems,
        };
    }
};

export type { DashboardStats };
