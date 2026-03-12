// User Roles
export type UserRole = 'sales' | 'marketing' | 'approver' | 'planner' | 'technician' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
}

// Customer & Site
export interface Customer {
  id: string;
  companyName: string;
  taxId: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTerms: string; // e.g., "Credit 30 Days"
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  customerId: string;
  name: string; // e.g., "ตึก 1", "ตึก 2"
  address: string;
  contactPerson: string;
  phone: string;
  createdAt: Date;
}

// Product & Machine
export type Brand = 'Kyocera' | 'Lexmark' | 'Canon' | 'HP' | 'Epson';
export type MachineType = 'Printer' | 'MFP';
export type PaperSize = 'A4' | 'A3';
export type ColorType = 'Color' | 'Mono';
export type MachineStatus = 'In Stock' | 'Installed' | 'Maintenance' | 'Reserved' | 'Repairing';
export type Condition = 'New' | 'Used';

export interface Product {
  id: string;
  brand: Brand;
  model: string;
  type: MachineType;
  paperSize: PaperSize;
  colorType: ColorType;
  speedPpm: number;
  description?: string;
  imageUrl?: string;
}

export interface Machine {
  id: string;
  productId: string;
  serialNumber: string;
  status: MachineStatus;
  condition: Condition;
  currentCounterMono: number;
  currentCounterColor: number;
  siteId?: string;
  contractId?: string;
  purchaseDate?: Date;
  warrantyEndDate?: Date;
  notes?: string;
}

// Pricing Models
export type PricingType = 'min_guarantee' | 'rental_click' | 'package_paper' | 'package_no_paper';

export interface PricingTier {
  id: string;
  name: string;
  minVolume: number;
  maxVolume: number | null;
  pricePerPage: number;
  monthlyFee: number;
}

export interface PricingPackage {
  id: string;
  name: string;
  productId: string;
  pricingType: PricingType;
  baseMonthlyFee: number;
  minGuaranteeVolume: number;
  minGuaranteePrice: number;
  clickRateBlack: number;
  clickRateColor: number;
  freeVolumeBlack: number;
  freeVolumeColor: number;
  excessRateBlack: number;
  excessRateColor: number;
  includesPaper: boolean;
  wastePaperDiscount: number; // percentage (2% or 3%)
  tiers?: PricingTier[];
  description?: string;
}

// Lead & Quotation
export type LeadType = 'fast_print' | 'print_service';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type QuoteStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'sent' | 'accepted' | 'expired';

export interface Lead {
  id: string;
  leadNumber: string;
  customerId: string;
  siteId?: string;
  salesId: string;
  type: LeadType;
  status: LeadStatus;
  requirements: LeadRequirements;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  expectedCloseDate?: Date;
}

export interface LeadRequirements {
  paperSize: PaperSize;
  machineType: MachineType;
  colorType: ColorType;
  estimatedVolumeBlack: number;
  estimatedVolumeColor: number;
  pastBrand?: string;
  pastPaperType?: string;
  specialRequirements?: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  leadId: string;
  customerId: string;
  siteId?: string;
  salesId: string;
  marketingId?: string;
  status: QuoteStatus;
  items: QuoteItem[];
  pricingType: PricingType;
  packageId?: string;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  validUntil: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  pdfUrl?: string;
}

export interface QuoteItem {
  id: string;
  productId: string;
  machineId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

// Contract
export type ContractStatus = 'draft' | 'pending_approval' | 'active' | 'expired' | 'terminated' | 'renewal_pending';
export type BillingCycle = 'monthly' | 'quarterly';

export interface Contract {
  id: string;
  contractNumber: string;
  quoteId: string;
  customerId: string;
  siteId: string;
  salesId: string;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  billingCycle: BillingCycle;
  pricingType: PricingType;
  packageId: string;
  machines: string[]; // Machine IDs
  monthlyFee: number;
  minGuaranteeVolume: number;
  clickRateBlack: number;
  clickRateColor: number;
  freeVolumeBlack: number;
  freeVolumeColor: number;
  excessRateBlack: number;
  excessRateColor: number;
  wastePaperDiscount: number;
  paymentTerms: string;
  terminationNoticeDays: number;
  autoRenewal: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  signedAt?: Date;
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Job & Work Order
export type JobType = 'installation' | 'maintenance' | 'repair' | 'pickup' | 'meter_reading';
export type JobStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Job {
  id: string;
  jobNumber: string;
  contractId?: string;
  machineId?: string;
  customerId?: string;
  siteId?: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  assignedTo?: string; // Technician ID
  scheduledDate?: Date;
  completedDate?: Date;
  description: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSheet {
  id: string;
  jobId: string;
  technicianId: string;
  arrivalTime?: Date;
  completionTime?: Date;
  initialMeterMono?: number;
  initialMeterColor?: number;
  finalMeterMono?: number;
  finalMeterColor?: number;
  workDescription: string;
  partsUsed: PartUsed[];
  customerSignature?: string;
  customerName?: string;
  photos: string[];
  notes?: string;
  submittedAt?: Date;
}

export interface PartUsed {
  id: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitPrice: number;
}

// Billing & Invoice
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  customerId: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  dueDate: Date;
  status: InvoiceStatus;
  meterReadingBlack: number;
  meterReadingColor: number;
  previousReadingBlack: number;
  previousReadingColor: number;
  volumeBlack: number;
  volumeColor: number;
  adjustedVolumeBlack: number; // After waste paper discount
  adjustedVolumeColor: number;
  baseAmount: number;
  excessAmountBlack: number;
  excessAmountColor: number;
  subtotal: number;
  vat: number;
  total: number;
  paidAmount: number;
  paidAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  pdfUrl?: string;
}

// Inventory
export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  location?: string;
  notes?: string;
}

// Notification
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalLeads: number;
  activeQuotations: number;
  activeContracts: number;
  pendingJobs: number;
  monthlyRevenue: number;
  contractsExpiring30Days: number;
  lowStockItems: number;
  pendingApprovals: number;
}

// Report Data
export interface RevenueReport {
  period: string;
  totalRevenue: number;
  rentalRevenue: number;
  clickRevenue: number;
  byDepartment: { department: string; amount: number }[];
  bySales: { salesId: string; name: string; amount: number }[];
}

export interface StockReport {
  totalMachines: number;
  inStockNew: number;
  inStockUsed: number;
  installed: number;
  inMaintenance: number;
  byBrand: { brand: Brand; count: number }[];
}

// Filter & Pagination
export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
