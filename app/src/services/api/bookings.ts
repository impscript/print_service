import { supabase } from '../../lib/supabase';

export type CustomerBooking = {
    id: string;
    customer_id: string;
    quotation_id: string;
    booking_token: string;
    installation_contact_person: string | null;
    installation_phone: string | null;
    installation_address: string | null;
    number_of_computers: number | null;
    preferred_date: string | null;
    additional_notes: string | null;
    is_submitted: boolean | null;
    submitted_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export type CustomerBookingInsert = Omit<CustomerBooking, 'id' | 'created_at' | 'updated_at' | 'booking_token'> & {
    booking_token?: string;
};

export const bookingsApi = {
    async getByQuotationId(quotationId: string): Promise<CustomerBooking | null> {
        const { data, error } = await supabase
            .from('customer_bookings')
            .select('*')
            .eq('quotation_id', quotationId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async upsert(booking: CustomerBookingInsert): Promise<CustomerBooking> {
        const { quotation_id } = booking;

        // Check if exists
        const { data: existing, error: checkError } = await supabase
            .from('customer_bookings')
            .select('id, booking_token')
            .eq('quotation_id', quotation_id)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
            // Update
            const { data, error } = await supabase
                .from('customer_bookings')
                .update({
                    ...booking,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert
            // generate a simple token if not provided
            const token = booking.booking_token || crypto.randomUUID();
            const { data, error } = await supabase
                .from('customer_bookings')
                .insert({
                    ...booking,
                    booking_token: token
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }
};
