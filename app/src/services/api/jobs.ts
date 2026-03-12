import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Job = Tables['jobs']['Row'];
type JobInsert = Tables['jobs']['Insert'];
type JobUpdate = Tables['jobs']['Update'];
type JobSheet = Tables['job_sheets']['Row'];
type JobSheetInsert = Tables['job_sheets']['Insert'];

// =====================================================
// JOBS API
// =====================================================

export const jobsApi = {
    // Get all jobs
    async getAll() {
        const { data, error } = await supabase
            .from('jobs')
            .select(`
        *,
        customers (company_name),
        sites (name, address),
        machines (serial_number, products (brand, model)),
        users!jobs_assigned_to_fkey (name)
      `)
            .order('scheduled_date', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Get jobs by technician
    async getByTechnician(technicianId: string) {
        const { data, error } = await supabase
            .from('jobs')
            .select(`
        *,
        customers (company_name),
        sites (name, address),
        machines (serial_number, products (brand, model))
      `)
            .eq('assigned_to', technicianId)
            .order('scheduled_date');

        if (error) throw error;
        return data;
    },

    // Get jobs by status
    async getByStatus(status: Database['public']['Enums']['job_status']) {
        const { data, error } = await supabase
            .from('jobs')
            .select(`
        *,
        customers (company_name),
        sites (name, address),
        users!jobs_assigned_to_fkey (name)
      `)
            .eq('status', status)
            .order('scheduled_date');

        if (error) throw error;
        return data;
    },

    // Get pending jobs
    async getPending() {
        const { data, error } = await supabase
            .from('jobs')
            .select(`
        *,
        customers (company_name),
        sites (name)
      `)
            .in('status', ['pending', 'assigned'])
            .order('priority', { ascending: false })
            .order('scheduled_date');

        if (error) throw error;
        return data;
    },

    // Get single job with details
    async getById(id: string) {
        const { data, error } = await supabase
            .from('jobs')
            .select(`
        *,
        customers (*),
        sites (*),
        contracts (*),
        machines (
          *,
          products (*)
        ),
        users!jobs_assigned_to_fkey (name, phone, email),
        job_sheets (
          *,
          job_parts (*),
          job_photos (*)
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create job (job_number auto-generated)
    async create(job: Omit<JobInsert, 'job_number'>) {
        const { data, error } = await supabase
            .from('jobs')
            .insert({ ...job, job_number: '' }) // Auto-generated
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update job
    async update(id: string, job: JobUpdate) {
        const { data, error } = await supabase
            .from('jobs')
            .update(job)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Assign job to technician
    async assign(id: string, technicianId: string, scheduledDate?: string) {
        const { data, error } = await supabase
            .from('jobs')
            .update({
                assigned_to: technicianId,
                status: 'assigned',
                scheduled_date: scheduledDate,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Start job
    async start(id: string) {
        const { data, error } = await supabase
            .from('jobs')
            .update({ status: 'in_progress' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Complete job
    async complete(id: string) {
        const { data, error } = await supabase
            .from('jobs')
            .update({
                status: 'completed',
                completed_date: new Date().toISOString().split('T')[0],
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete job
    async delete(id: string) {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// =====================================================
// JOB SHEETS API
// =====================================================

export const jobSheetsApi = {
    // Get job sheet by job ID
    async getByJobId(jobId: string) {
        const { data, error } = await supabase
            .from('job_sheets')
            .select(`
        *,
        job_parts (*),
        job_photos (*),
        users!job_sheets_technician_id_fkey (name)
      `)
            .eq('job_id', jobId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return data;
    },

    // Create job sheet
    async create(jobSheet: JobSheetInsert) {
        const { data, error } = await supabase
            .from('job_sheets')
            .insert(jobSheet)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update job sheet
    async update(id: string, jobSheet: Partial<JobSheet>) {
        const { data, error } = await supabase
            .from('job_sheets')
            .update(jobSheet)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Submit job sheet (complete with signature)
    async submit(id: string, customerName: string, customerSignature: string) {
        const { data, error } = await supabase
            .from('job_sheets')
            .update({
                customer_name: customerName,
                customer_signature: customerSignature,
                completion_time: new Date().toISOString(),
                submitted_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Add part to job sheet
    async addPart(jobSheetId: string, partName: string, quantity: number, partNumber?: string, unitPrice?: number) {
        const { data, error } = await supabase
            .from('job_parts')
            .insert({
                job_sheet_id: jobSheetId,
                part_name: partName,
                part_number: partNumber,
                quantity,
                unit_price: unitPrice,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Add photo to job sheet
    async addPhoto(jobSheetId: string, photoUrl: string, description?: string) {
        const { data, error } = await supabase
            .from('job_photos')
            .insert({
                job_sheet_id: jobSheetId,
                photo_url: photoUrl,
                description,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};

export type { Job, JobInsert, JobUpdate, JobSheet, JobSheetInsert };
