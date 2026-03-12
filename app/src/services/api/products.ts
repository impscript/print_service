import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Product = Tables['products']['Row'];
type ProductInsert = Tables['products']['Insert'];
type Machine = Tables['machines']['Row'];
type MachineInsert = Tables['machines']['Insert'];
type MachineUpdate = Tables['machines']['Update'];
type PricingPackage = Tables['pricing_packages']['Row'];
type PricingPackageInsert = Tables['pricing_packages']['Insert'];
type PricingPackageUpdate = Tables['pricing_packages']['Update'];
type InventoryItem = Tables['inventory_items']['Row'];
type InventoryItemInsert = Tables['inventory_items']['Insert'];
type InventoryItemUpdate = Tables['inventory_items']['Update'];

// =====================================================
// PRODUCTS API
// =====================================================

export const productsApi = {
    // Get all products
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('brand')
            .order('model');

        if (error) throw error;
        return data;
    },

    // Get products by type/filter
    async getFiltered(filters: {
        brand?: Database['public']['Enums']['brand'];
        type?: Database['public']['Enums']['machine_type'];
        paperSize?: Database['public']['Enums']['paper_size'];
        colorType?: Database['public']['Enums']['color_type'];
    }) {
        let query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true);

        if (filters.brand) query = query.eq('brand', filters.brand);
        if (filters.type) query = query.eq('type', filters.type);
        if (filters.paperSize) query = query.eq('paper_size', filters.paperSize);
        if (filters.colorType) query = query.eq('color_type', filters.colorType);

        const { data, error } = await query.order('brand').order('model');

        if (error) throw error;
        return data;
    },

    // Get single product
    async getById(id: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create product
    async create(product: ProductInsert) {
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update product
    async update(id: string, product: Partial<Product>) {
        const { data, error } = await supabase
            .from('products')
            .update(product)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};

// =====================================================
// MACHINES API
// =====================================================

export const machinesApi = {
    // Get all machines with product info
    async getAll() {
        const { data, error } = await supabase
            .from('machines')
            .select(`
        *,
        products (brand, model, type, paper_size, color_type),
        sites (name, customers (company_name))
      `)
            .order('serial_number');

        if (error) throw error;
        return data;
    },

    // Get machines by status
    async getByStatus(status: Database['public']['Enums']['machine_status']) {
        const { data, error } = await supabase
            .from('machines')
            .select(`
        *,
        products (brand, model, type)
      `)
            .eq('status', status)
            .order('serial_number');

        if (error) throw error;
        return data;
    },

    // Get available machines (In Stock)
    async getAvailable() {
        return this.getByStatus('In Stock');
    },

    // Get machine by serial number
    async getBySerialNumber(serialNumber: string) {
        const { data, error } = await supabase
            .from('machines')
            .select(`
        *,
        products (*),
        sites (*),
        contracts (*)
      `)
            .eq('serial_number', serialNumber)
            .single();

        if (error) throw error;
        return data;
    },

    // Get machine by QR code
    async getByQRCode(qrCode: string) {
        const { data, error } = await supabase
            .from('machines')
            .select(`
        *,
        products (*),
        sites (*),
        contracts (*)
      `)
            .eq('qr_code', qrCode)
            .single();

        if (error) throw error;
        return data;
    },

    // Create machine
    async create(machine: MachineInsert) {
        const { data, error } = await supabase
            .from('machines')
            .insert(machine)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update machine
    async update(id: string, machine: MachineUpdate) {
        const { data, error } = await supabase
            .from('machines')
            .update(machine)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update meter reading
    async updateMeterReading(id: string, meterMono: number, meterColor: number) {
        const { data, error } = await supabase
            .from('machines')
            .update({
                current_counter_mono: meterMono,
                current_counter_color: meterColor,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get inventory overview
    async getInventoryOverview() {
        const { data, error } = await supabase
            .from('machine_inventory_overview')
            .select('*');

        if (error) throw error;
        return data;
    },
};

// =====================================================
// PRICING PACKAGES API
// =====================================================

export const pricingPackagesApi = {
    // Get all pricing packages
    async getAll() {
        const { data, error } = await supabase
            .from('pricing_packages')
            .select(`
        *,
        products (brand, model, type)
      `)
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data;
    },

    // Get by pricing type
    async getByType(pricingType: Database['public']['Enums']['pricing_type']) {
        const { data, error } = await supabase
            .from('pricing_packages')
            .select(`
        *,
        products (brand, model, type)
      `)
            .eq('pricing_type', pricingType)
            .eq('is_active', true);

        if (error) throw error;
        return data;
    },

    // Get by product
    async getByProduct(productId: string) {
        const { data, error } = await supabase
            .from('pricing_packages')
            .select('*')
            .eq('product_id', productId)
            .eq('is_active', true);

        if (error) throw error;
        return data;
    },

    // Get single package
    async getById(id: string) {
        const { data, error } = await supabase
            .from('pricing_packages')
            .select(`
        *,
        products (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create package
    async create(pkg: PricingPackageInsert) {
        const { data, error } = await supabase
            .from('pricing_packages')
            .insert(pkg)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update package
    async update(id: string, pkg: Partial<PricingPackageUpdate>) {
        const { data, error } = await supabase
            .from('pricing_packages')
            .update(pkg)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};

// =====================================================
// INVENTORY ITEMS API
// =====================================================

export const inventoryItemsApi = {
    // Get all items
    async getAll() {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    // Get low stock items
    async getLowStock() {
        // This logic might be complex in RLS filter, so we filter in code or use RPC?
        // Simple select for now
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .order('quantity'); // logic handled in frontend or we add a .lte('quantity', supabase.raw('min_stock')) if possible, but min_stock is a column.

        if (error) throw error;
        // Filter in JS for now as simple Compare Columns isn't direct in JS client easily without advanced helper or RPC
        return data?.filter(item => item.quantity <= item.min_stock) || [];
    },

    // Create item
    async create(item: InventoryItemInsert) {
        const { data, error } = await supabase
            .from('inventory_items')
            .insert(item)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update item
    async update(id: string, item: Partial<InventoryItemUpdate>) {
        const { data, error } = await supabase
            .from('inventory_items')
            .update(item)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};

export type { Product, ProductInsert, Machine, MachineInsert, MachineUpdate, PricingPackage, PricingPackageInsert, PricingPackageUpdate, InventoryItem, InventoryItemInsert, InventoryItemUpdate };
