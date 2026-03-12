// API Services - Export all Supabase API functions
export { customersApi } from './customers';
export { sitesApi } from './customers';
export { leadsApi } from './leads';
export { quotationsApi } from './quotations';
export { contractsApi } from './contracts';
export { jobsApi, jobSheetsApi } from './jobs';
export { productsApi, machinesApi, pricingPackagesApi } from './products';
export { dashboardApi } from './dashboard';

// Type exports
export type { Customer, CustomerInsert, CustomerUpdate, Site, SiteInsert, SiteUpdate } from './customers';
export type { Lead, LeadInsert, LeadUpdate } from './leads';
export type { Quotation, QuotationInsert, QuotationUpdate, QuotationItem, QuotationItemInsert } from './quotations';
export type { Contract, ContractInsert, ContractUpdate } from './contracts';
export type { Job, JobInsert, JobUpdate, JobSheet, JobSheetInsert } from './jobs';
export type { Product, ProductInsert, Machine, MachineInsert, MachineUpdate, PricingPackage } from './products';
export type { DashboardStats } from './dashboard';
