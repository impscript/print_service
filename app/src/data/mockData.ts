import type {
  User, Customer, Site, Product, Machine, PricingPackage,
  Lead, Quotation, Contract, Job, JobSheet, Invoice,
  Notification, DashboardStats, InventoryItem
} from '@/types';

// Users
export const mockUsers: User[] = [
  { id: '8', email: 'admin@dacp.com', name: 'แอดมิน ระบบ', role: 'admin', phone: '088-888-8888', department: 'IT' },
  { id: '1', email: 'sales@dacp.com', name: 'Sales Team', role: 'sales', phone: '089-222-2222', department: 'Sales' },
  { id: '5', email: 'planner@dacp.com', name: 'Planner Team', role: 'planner', phone: '089-555-5555', department: 'Operations' },
  { id: '6', email: 'technician@dacp.com', name: 'Tech Team', role: 'technician', phone: '089-666-6666', department: 'Service' },
  { id: '3', email: 'marketing@dacp.com', name: 'Marketing Team', role: 'marketing', phone: '089-333-3333', department: 'Marketing' },
  { id: '4', email: 'approver@dacp.com', name: 'Manager Approver', role: 'approver', phone: '089-444-4444', department: 'Management' },
  { id: '2', email: 'sales2@dacp.com', name: 'สมหญิง รักขาย', role: 'sales', phone: '082-222-2222', department: 'Sales' },
  { id: '7', email: 'tech2@dacp.com', name: 'ช่างบี ติดตั้งโปร', role: 'technician', phone: '087-777-7777', department: 'Service' },
];

// Customers
export const mockCustomers: Customer[] = [
  { id: '1', companyName: 'บริษัท ศิริราช จำกัด', taxId: '0105551001234', contactPerson: 'คุณวิชัย ศิริราช', phone: '02-111-1111', email: 'wichai@siriraj.com', paymentTerms: 'Credit 30 Days', address: '2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ 10700', createdAt: new Date('2023-01-15'), updatedAt: new Date('2024-01-15') },
  { id: '2', companyName: 'บริษัท เอเชีย กรุ๊ป จำกัด', taxId: '0105552005678', contactPerson: 'คุณสุดา เอเชีย', phone: '02-222-2222', email: 'suda@asiagroup.com', paymentTerms: 'Credit 30 Days', address: '123 อาคารเอเชียทาวเวอร์ ถนนสาทร แขวงสีลม เขตบางรัก กรุงเทพฯ 10500', createdAt: new Date('2023-03-20'), updatedAt: new Date('2024-02-10') },
  { id: '3', companyName: 'บริษัท ไทยเทค โซลูชั่น จำกัด', taxId: '0105553009012', contactPerson: 'คุณประเสริฐ ไทยเทค', phone: '02-333-3333', email: 'prasert@thaitech.com', paymentTerms: 'Credit 30 Days', address: '456 อาคารไทยเทค ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900', createdAt: new Date('2023-06-10'), updatedAt: new Date('2024-03-05') },
  { id: '4', companyName: 'บริษัท กรุงเทพ อินดัสทรี จำกัด', taxId: '0105554003456', contactPerson: 'คุณมานี กรุงเทพ', phone: '02-444-4444', email: 'mani@bangkokind.com', paymentTerms: 'Credit 30 Days', address: '789 นิคมอุตสาหกรรมบางปู ต.บางปูใหม่ อ.เมืองสมุทรปราการ จ.สมุทรปราการ 10280', createdAt: new Date('2023-08-05'), updatedAt: new Date('2024-04-20') },
  { id: '5', companyName: 'บริษัท สยาม พริ้นติ้ง จำกัด', taxId: '0105555007890', contactPerson: 'คุณวันชัย สยาม', phone: '02-555-5555', email: 'vanchai@siamprinting.com', paymentTerms: 'Credit 30 Days', address: '101 ถนนบางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ 10260', createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-05-15') },
];

// Sites
export const mockSites: Site[] = [
  { id: '1', customerId: '1', name: 'สำนักงานใหญ่ ตึก 1', address: '2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ 10700', contactPerson: 'คุณวิชัย ศิริราช', phone: '02-111-1111', createdAt: new Date('2023-01-15') },
  { id: '2', customerId: '1', name: 'ตึก 2 อาคารผู้ป่วยนอก', address: '2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ 10700', contactPerson: 'คุณนภา ศิริราช', phone: '02-111-1112', createdAt: new Date('2023-01-15') },
  { id: '3', customerId: '2', name: 'สำนักงานสาทร', address: '123 อาคารเอเชียทาวเวอร์ ถนนสาทร แขวงสีลม เขตบางรัก กรุงเทพฯ 10500', contactPerson: 'คุณสุดา เอเชีย', phone: '02-222-2222', createdAt: new Date('2023-03-20') },
  { id: '4', customerId: '3', name: 'สำนักงานจตุจักร', address: '456 อาคารไทยเทค ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900', contactPerson: 'คุณประเสริฐ ไทยเทค', phone: '02-333-3333', createdAt: new Date('2023-06-10') },
  { id: '5', customerId: '4', name: 'โรงงานบางปู', address: '789 นิคมอุตสาหกรรมบางปู ต.บางปูใหม่ อ.เมืองสมุทรปราการ จ.สมุทรปราการ 10280', contactPerson: 'คุณมานี กรุงเทพ', phone: '02-444-4444', createdAt: new Date('2023-08-05') },
];

// Products
export const mockProducts: Product[] = [
  { id: '1', brand: 'Kyocera', model: 'ECOSYS M4125idn', type: 'MFP', paperSize: 'A3', colorType: 'Mono', speedPpm: 25, description: 'A3 Mono MFP 25ppm' },
  { id: '2', brand: 'Kyocera', model: 'TASKalfa 2554ci', type: 'MFP', paperSize: 'A3', colorType: 'Color', speedPpm: 25, description: 'A3 Color MFP 25ppm' },
  { id: '3', brand: 'Lexmark', model: 'MX721ade', type: 'MFP', paperSize: 'A4', colorType: 'Mono', speedPpm: 66, description: 'A4 Mono MFP 66ppm' },
  { id: '4', brand: 'Canon', model: 'imageRUNNER C3226i', type: 'MFP', paperSize: 'A3', colorType: 'Color', speedPpm: 26, description: 'A3 Color MFP 26ppm' },
  { id: '5', brand: 'HP', model: 'LaserJet Enterprise M607n', type: 'Printer', paperSize: 'A4', colorType: 'Mono', speedPpm: 55, description: 'A4 Mono Printer 55ppm' },
  { id: '6', brand: 'Epson', model: 'WorkForce Pro WF-C579R', type: 'MFP', paperSize: 'A4', colorType: 'Color', speedPpm: 34, description: 'A4 Color MFP 34ppm' },
  { id: '7', brand: 'Kyocera', model: 'ECOSYS P6235cdn', type: 'Printer', paperSize: 'A4', colorType: 'Color', speedPpm: 35, description: 'A4 Color Printer 35ppm' },
  { id: '8', brand: 'Lexmark', model: 'C3224dw', type: 'Printer', paperSize: 'A4', colorType: 'Color', speedPpm: 24, description: 'A4 Color Printer 24ppm' },
];

// Machines
export const mockMachines: Machine[] = [
  { id: '1', productId: '1', serialNumber: 'KYO-M4125-001', status: 'Installed', condition: 'New', currentCounterMono: 15234, currentCounterColor: 0, siteId: '1', contractId: '1', purchaseDate: new Date('2023-02-01'), warrantyEndDate: new Date('2026-02-01') },
  { id: '2', productId: '2', serialNumber: 'KYO-2554ci-002', status: 'Installed', condition: 'New', currentCounterMono: 28567, currentCounterColor: 8934, siteId: '2', contractId: '2', purchaseDate: new Date('2023-04-15'), warrantyEndDate: new Date('2026-04-15') },
  { id: '3', productId: '3', serialNumber: 'LEX-MX721-003', status: 'In Stock', condition: 'New', currentCounterMono: 0, currentCounterColor: 0, purchaseDate: new Date('2024-01-10'), warrantyEndDate: new Date('2027-01-10') },
  { id: '4', productId: '4', serialNumber: 'CAN-C3226-004', status: 'Installed', condition: 'New', currentCounterMono: 45678, currentCounterColor: 12345, siteId: '3', contractId: '3', purchaseDate: new Date('2023-07-01'), warrantyEndDate: new Date('2026-07-01') },
  { id: '5', productId: '1', serialNumber: 'KYO-M4125-005', status: 'In Stock', condition: 'New', currentCounterMono: 0, currentCounterColor: 0, purchaseDate: new Date('2024-02-15'), warrantyEndDate: new Date('2027-02-15') },
  { id: '6', productId: '5', serialNumber: 'HP-M607-006', status: 'Installed', condition: 'Used', currentCounterMono: 123456, currentCounterColor: 0, siteId: '4', contractId: '4', purchaseDate: new Date('2022-09-01'), warrantyEndDate: new Date('2025-09-01') },
  { id: '7', productId: '2', serialNumber: 'KYO-2554ci-007', status: 'Maintenance', condition: 'Used', currentCounterMono: 67890, currentCounterColor: 23456, purchaseDate: new Date('2022-06-01'), warrantyEndDate: new Date('2025-06-01') },
  { id: '8', productId: '6', serialNumber: 'EPS-WF579-008', status: 'Reserved', condition: 'New', currentCounterMono: 0, currentCounterColor: 0, purchaseDate: new Date('2024-03-01'), warrantyEndDate: new Date('2027-03-01') },
  { id: '9', productId: '7', serialNumber: 'KYO-P6235-009', status: 'In Stock', condition: 'New', currentCounterMono: 0, currentCounterColor: 0, purchaseDate: new Date('2024-01-20'), warrantyEndDate: new Date('2027-01-20') },
  { id: '10', productId: '3', serialNumber: 'LEX-MX721-010', status: 'Repairing', condition: 'Used', currentCounterMono: 234567, currentCounterColor: 0, purchaseDate: new Date('2021-11-01'), warrantyEndDate: new Date('2024-11-01') },
];

// Pricing Packages
export const mockPricingPackages: PricingPackage[] = [
  {
    id: '1', name: 'Min Guarantee A3 Mono 5K', productId: '1', pricingType: 'min_guarantee',
    baseMonthlyFee: 0, minGuaranteeVolume: 5000, minGuaranteePrice: 2500,
    clickRateBlack: 0.50, clickRateColor: 0, freeVolumeBlack: 0, freeVolumeColor: 0,
    excessRateBlack: 0.50, excessRateColor: 0, includesPaper: false, wastePaperDiscount: 2,
    description: 'การันตีขั้นต่ำ 5,000 แผ่น/เดือน ถ้าใช้ไม่ถึงจ่ายเหมา 2,500 บาท'
  },
  {
    id: '2', name: 'Rental + Click A3 Color', productId: '2', pricingType: 'rental_click',
    baseMonthlyFee: 3500, minGuaranteeVolume: 0, minGuaranteePrice: 0,
    clickRateBlack: 0.40, clickRateColor: 1.50, freeVolumeBlack: 0, freeVolumeColor: 0,
    excessRateBlack: 0.40, excessRateColor: 1.50, includesPaper: false, wastePaperDiscount: 2,
    description: 'ค่าเช่า 3,500 บาท/เดือน + ค่าแผ่นตามจริง'
  },
  {
    id: '3', name: 'Package A4 Mono 10K (No Paper)', productId: '3', pricingType: 'package_no_paper',
    baseMonthlyFee: 4500, minGuaranteeVolume: 0, minGuaranteePrice: 0,
    clickRateBlack: 0, clickRateColor: 0, freeVolumeBlack: 10000, freeVolumeColor: 0,
    excessRateBlack: 0.35, excessRateColor: 0, includesPaper: false, wastePaperDiscount: 3,
    description: 'เหมาจ่าย 4,500 บาท/เดือน รวม 10,000 แผ่น ส่วนเกินคิด 0.35 บาท/แผ่น'
  },
  {
    id: '4', name: 'Package A3 Color 8K (With Paper)', productId: '4', pricingType: 'package_paper',
    baseMonthlyFee: 8500, minGuaranteeVolume: 0, minGuaranteePrice: 0,
    clickRateBlack: 0, clickRateColor: 0, freeVolumeBlack: 6000, freeVolumeColor: 2000,
    excessRateBlack: 0.45, excessRateColor: 1.80, includesPaper: true, wastePaperDiscount: 2,
    description: 'เหมาจ่าย 8,500 บาท/เดือน รวมกระดาษ 6,000 แผ่นขาวดำ + 2,000 แผ่นสี'
  },
  {
    id: '5', name: 'Min Guarantee A4 Color 3K', productId: '6', pricingType: 'min_guarantee',
    baseMonthlyFee: 0, minGuaranteeVolume: 3000, minGuaranteePrice: 4200,
    clickRateBlack: 0.80, clickRateColor: 2.00, freeVolumeBlack: 0, freeVolumeColor: 0,
    excessRateBlack: 0.80, excessRateColor: 2.00, includesPaper: false, wastePaperDiscount: 2,
    description: 'การันตีขั้นต่ำ 3,000 แผ่น/เดือน ถ้าใช้ไม่ถึงจ่ายเหมา 4,200 บาท'
  },
];

// Leads
export const mockLeads: Lead[] = [
  { id: '1', leadNumber: 'LEAD-2024-001', customerId: '1', siteId: '1', salesId: '1', type: 'print_service', status: 'qualified', requirements: { paperSize: 'A3', machineType: 'MFP', colorType: 'Mono', estimatedVolumeBlack: 8000, estimatedVolumeColor: 0, pastBrand: 'Canon', pastPaperType: 'A4 70gsm', specialRequirements: 'ต้องการสแกนเอกสารด้วย' }, notes: 'ลูกค้าต้องการทดแทนเครื่องเก่า', createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-01-15'), expectedCloseDate: new Date('2024-02-15') },
  { id: '2', leadNumber: 'LEAD-2024-002', customerId: '2', siteId: '3', salesId: '1', type: 'print_service', status: 'proposal', requirements: { paperSize: 'A3', machineType: 'MFP', colorType: 'Color', estimatedVolumeBlack: 15000, estimatedVolumeColor: 5000, pastBrand: 'Kyocera', pastPaperType: 'A4 80gsm', specialRequirements: 'ต้องการเครื่องสำรอง' }, notes: 'กำลังรอใบเสนอราคา', createdAt: new Date('2024-01-20'), updatedAt: new Date('2024-01-25'), expectedCloseDate: new Date('2024-03-01') },
  { id: '3', leadNumber: 'LEAD-2024-003', customerId: '3', siteId: '4', salesId: '2', type: 'fast_print', status: 'new', requirements: { paperSize: 'A4', machineType: 'Printer', colorType: 'Mono', estimatedVolumeBlack: 5000, estimatedVolumeColor: 0 }, notes: 'ลูกค้าใหม่จากการแนะนำ', createdAt: new Date('2024-02-01'), updatedAt: new Date('2024-02-01'), expectedCloseDate: new Date('2024-02-28') },
  { id: '4', leadNumber: 'LEAD-2024-004', customerId: '4', siteId: '5', salesId: '2', type: 'print_service', status: 'negotiation', requirements: { paperSize: 'A4', machineType: 'MFP', colorType: 'Color', estimatedVolumeBlack: 10000, estimatedVolumeColor: 2000, pastBrand: 'HP', pastPaperType: 'A4 75gsm', specialRequirements: 'ต้องการระบบ Follow-me Printing' }, notes: 'กำลังต่อรองราคา', createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-30'), expectedCloseDate: new Date('2024-02-20') },
  { id: '5', leadNumber: 'LEAD-2024-005', customerId: '5', salesId: '1', type: 'print_service', status: 'won', requirements: { paperSize: 'A3', machineType: 'MFP', colorType: 'Color', estimatedVolumeBlack: 20000, estimatedVolumeColor: 8000, pastBrand: 'Ricoh', pastPaperType: 'A3 80gsm', specialRequirements: 'ต้องการ Finisher' }, notes: 'ปิดการขายแล้ว รอทำสัญญา', createdAt: new Date('2023-12-15'), updatedAt: new Date('2024-01-20'), expectedCloseDate: new Date('2024-01-25') },
];

// Quotations
export const mockQuotations: Quotation[] = [
  { id: '1', quoteNumber: 'QT-2024-001', leadId: '1', customerId: '1', siteId: '1', salesId: '1', marketingId: '3', status: 'approved', items: [{ id: '1', productId: '1', quantity: 1, unitPrice: 2500, totalPrice: 2500, description: 'Kyocera ECOSYS M4125idn - Min Guarantee 5K' }], pricingType: 'min_guarantee', packageId: '1', subtotal: 2500, discount: 0, vat: 175, total: 2675, validUntil: new Date('2024-03-15'), approvedBy: '4', approvedAt: new Date('2024-01-18'), notes: 'ราคาพิเศษสำหรับลูกค้าเก่า', createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-18') },
  { id: '2', quoteNumber: 'QT-2024-002', leadId: '2', customerId: '2', siteId: '3', salesId: '1', marketingId: '3', status: 'pending_approval', items: [{ id: '1', productId: '2', quantity: 2, unitPrice: 3500, totalPrice: 7000, description: 'Kyocera TASKalfa 2554ci - Rental + Click' }], pricingType: 'rental_click', packageId: '2', subtotal: 7000, discount: 500, vat: 455, total: 6955, validUntil: new Date('2024-04-01'), notes: 'ลูกค้าขอส่วนลดเพิ่ม', createdAt: new Date('2024-01-25'), updatedAt: new Date('2024-01-25') },
  { id: '3', quoteNumber: 'QT-2024-003', leadId: '4', customerId: '4', siteId: '5', salesId: '2', marketingId: '3', status: 'sent', items: [{ id: '1', productId: '6', quantity: 3, unitPrice: 4200, totalPrice: 12600, description: 'Epson WorkForce Pro WF-C579R - Min Guarantee 3K' }], pricingType: 'min_guarantee', packageId: '5', subtotal: 12600, discount: 1000, vat: 812, total: 12412, validUntil: new Date('2024-03-20'), notes: 'ส่งใบเสนอราคาแล้ว รอลูกค้าตอบกลับ', createdAt: new Date('2024-01-30'), updatedAt: new Date('2024-02-01') },
  { id: '4', quoteNumber: 'QT-2024-004', leadId: '5', customerId: '5', salesId: '1', marketingId: '3', status: 'accepted', items: [{ id: '1', productId: '4', quantity: 2, unitPrice: 8500, totalPrice: 17000, description: 'Canon imageRUNNER C3226i - Package 8K With Paper' }], pricingType: 'package_paper', packageId: '4', subtotal: 17000, discount: 0, vat: 1190, total: 18190, validUntil: new Date('2024-02-25'), notes: 'ลูกค้ายอมรับราคาแล้ว', createdAt: new Date('2024-01-20'), updatedAt: new Date('2024-01-22') },
];

// Contracts
export const mockContracts: Contract[] = [
  { id: '1', contractNumber: 'CNT-2023-001', quoteId: '1', customerId: '1', siteId: '1', salesId: '1', status: 'active', startDate: new Date('2023-02-01'), endDate: new Date('2026-02-01'), billingCycle: 'monthly', pricingType: 'min_guarantee', packageId: '1', machines: ['1'], monthlyFee: 2500, minGuaranteeVolume: 5000, clickRateBlack: 0.50, clickRateColor: 0, freeVolumeBlack: 0, freeVolumeColor: 0, excessRateBlack: 0.50, excessRateColor: 0, wastePaperDiscount: 2, paymentTerms: 'Credit 30 Days', terminationNoticeDays: 30, autoRenewal: true, approvedBy: '4', approvedAt: new Date('2023-01-25'), signedAt: new Date('2023-02-01'), createdAt: new Date('2023-01-20'), updatedAt: new Date('2023-02-01') },
  { id: '2', contractNumber: 'CNT-2023-002', quoteId: '2', customerId: '1', siteId: '2', salesId: '1', status: 'active', startDate: new Date('2023-04-15'), endDate: new Date('2026-04-15'), billingCycle: 'monthly', pricingType: 'rental_click', packageId: '2', machines: ['2'], monthlyFee: 3500, minGuaranteeVolume: 0, clickRateBlack: 0.40, clickRateColor: 1.50, freeVolumeBlack: 0, freeVolumeColor: 0, excessRateBlack: 0.40, excessRateColor: 1.50, wastePaperDiscount: 2, paymentTerms: 'Credit 30 Days', terminationNoticeDays: 30, autoRenewal: true, approvedBy: '4', approvedAt: new Date('2023-04-10'), signedAt: new Date('2023-04-15'), createdAt: new Date('2023-04-05'), updatedAt: new Date('2023-04-15') },
  { id: '3', contractNumber: 'CNT-2023-003', quoteId: '3', customerId: '3', siteId: '4', salesId: '2', status: 'active', startDate: new Date('2023-07-01'), endDate: new Date('2026-07-01'), billingCycle: 'monthly', pricingType: 'package_paper', packageId: '4', machines: ['4'], monthlyFee: 8500, minGuaranteeVolume: 0, clickRateBlack: 0, clickRateColor: 0, freeVolumeBlack: 6000, freeVolumeColor: 2000, excessRateBlack: 0.45, excessRateColor: 1.80, wastePaperDiscount: 2, paymentTerms: 'Credit 30 Days', terminationNoticeDays: 30, autoRenewal: false, approvedBy: '4', approvedAt: new Date('2023-06-25'), signedAt: new Date('2023-07-01'), createdAt: new Date('2023-06-20'), updatedAt: new Date('2023-07-01') },
  { id: '4', contractNumber: 'CNT-2022-001', quoteId: '4', customerId: '4', siteId: '5', salesId: '2', status: 'renewal_pending', startDate: new Date('2022-09-01'), endDate: new Date('2025-03-01'), billingCycle: 'monthly', pricingType: 'package_no_paper', packageId: '3', machines: ['6'], monthlyFee: 4500, minGuaranteeVolume: 0, clickRateBlack: 0, clickRateColor: 0, freeVolumeBlack: 10000, freeVolumeColor: 0, excessRateBlack: 0.35, excessRateColor: 0, wastePaperDiscount: 3, paymentTerms: 'Credit 30 Days', terminationNoticeDays: 30, autoRenewal: false, approvedBy: '4', approvedAt: new Date('2022-08-25'), signedAt: new Date('2022-09-01'), createdAt: new Date('2022-08-20'), updatedAt: new Date('2022-09-01') },
  { id: '5', contractNumber: 'CNT-2024-001', quoteId: '5', customerId: '5', siteId: '5', salesId: '1', status: 'pending_approval', startDate: new Date('2024-02-01'), endDate: new Date('2027-02-01'), billingCycle: 'monthly', pricingType: 'package_paper', packageId: '4', machines: [], monthlyFee: 17000, minGuaranteeVolume: 0, clickRateBlack: 0, clickRateColor: 0, freeVolumeBlack: 12000, freeVolumeColor: 4000, excessRateBlack: 0.45, excessRateColor: 1.80, wastePaperDiscount: 2, paymentTerms: 'Credit 30 Days', terminationNoticeDays: 30, autoRenewal: true, createdAt: new Date('2024-01-25'), updatedAt: new Date('2024-01-25') },
];

// Jobs
export const mockJobs: Job[] = [
  { id: '1', jobNumber: 'JOB-2024-001', contractId: '1', machineId: '1', customerId: '1', siteId: '1', type: 'installation', status: 'completed', priority: 'normal', assignedTo: '6', scheduledDate: new Date('2023-02-01'), completedDate: new Date('2023-02-01'), description: 'ติดตั้งเครื่อง Kyocera M4125idn', notes: 'ติดตั้งเรียบร้อย ลูกค้าพอใจ', createdBy: '5', createdAt: new Date('2023-01-25'), updatedAt: new Date('2023-02-01') },
  { id: '2', jobNumber: 'JOB-2024-002', contractId: '2', machineId: '2', customerId: '1', siteId: '2', type: 'installation', status: 'completed', priority: 'normal', assignedTo: '7', scheduledDate: new Date('2023-04-15'), completedDate: new Date('2023-04-15'), description: 'ติดตั้งเครื่อง Kyocera 2554ci', notes: 'ติดตั้งและเทรนนิ่งการใช้งาน', createdBy: '5', createdAt: new Date('2023-04-10'), updatedAt: new Date('2023-04-15') },
  { id: '3', jobNumber: 'JOB-2024-003', contractId: '5', machineId: '8', customerId: '5', siteId: '5', type: 'installation', status: 'assigned', priority: 'high', assignedTo: '6', scheduledDate: new Date('2024-02-05'), description: 'ติดตั้งเครื่อง Canon C3226i 2 เครื่อง', notes: 'รอเครื่องมาถึง', createdBy: '5', createdAt: new Date('2024-01-26'), updatedAt: new Date('2024-01-26') },
  { id: '4', jobNumber: 'JOB-2024-004', machineId: '7', customerId: '1', siteId: '2', type: 'repair', status: 'in_progress', priority: 'urgent', assignedTo: '7', scheduledDate: new Date('2024-01-30'), description: 'เครื่องค้างกระดาษ ต้องเปลี่ยน Fuser', notes: 'รออะไหล่', createdBy: '5', createdAt: new Date('2024-01-29'), updatedAt: new Date('2024-01-30') },
  { id: '5', jobNumber: 'JOB-2024-005', contractId: '1', machineId: '1', customerId: '1', siteId: '1', type: 'meter_reading', status: 'pending', priority: 'normal', scheduledDate: new Date('2024-02-05'), description: 'อ่านมิเตอร์ประจำเดือน กุมภาพันธ์', createdBy: '5', createdAt: new Date('2024-02-01'), updatedAt: new Date('2024-02-01') },
  { id: '6', jobNumber: 'JOB-2024-006', contractId: '3', machineId: '4', customerId: '3', siteId: '4', type: 'maintenance', status: 'assigned', priority: 'normal', assignedTo: '6', scheduledDate: new Date('2024-02-10'), description: 'Maintenance ประจำไตรมาส', notes: 'ตรวจเช็คทั่วไป เปลี่ยนชุดดูดกระดาษ', createdBy: '5', createdAt: new Date('2024-02-01'), updatedAt: new Date('2024-02-01') },
];

// Job Sheets
export const mockJobSheets: JobSheet[] = [
  { id: '1', jobId: '1', technicianId: '6', arrivalTime: new Date('2023-02-01T09:00:00'), completionTime: new Date('2023-02-01T11:30:00'), initialMeterMono: 0, initialMeterColor: 0, finalMeterMono: 5, finalMeterColor: 0, workDescription: 'ติดตั้งเครื่อง ตั้งค่า Network ทดสอบการพิมพ์', partsUsed: [], customerName: 'คุณวิชัย ศิริราช', photos: [], submittedAt: new Date('2023-02-01T11:30:00') },
  { id: '2', jobId: '2', technicianId: '7', arrivalTime: new Date('2023-04-15T10:00:00'), completionTime: new Date('2023-04-15T13:00:00'), initialMeterMono: 0, initialMeterColor: 0, finalMeterMono: 3, finalMeterColor: 2, workDescription: 'ติดตั้งเครื่อง เทรนนิ่งการใช้งานให้พนักงาน', partsUsed: [], customerName: 'คุณนภา ศิริราช', photos: [], submittedAt: new Date('2023-04-15T13:00:00') },
  { id: '3', jobId: '4', technicianId: '7', arrivalTime: new Date('2024-01-30T14:00:00'), workDescription: 'ตรวจสอบอาการค้างกระดาษ พบ Fuser เสีย', partsUsed: [{ id: '1', partNumber: 'FK-1150', partName: 'Fuser Kit', quantity: 1, unitPrice: 8500 }], customerName: 'คุณนภา ศิริราช', photos: [], notes: 'รออนุมัติซื้ออะไหล่' },
];

// Invoices
export const mockInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2024-001-001', contractId: '1', customerId: '1', billingPeriodStart: new Date('2024-01-01'), billingPeriodEnd: new Date('2024-01-31'), dueDate: new Date('2024-03-02'), status: 'paid', meterReadingBlack: 15234, meterReadingColor: 0, previousReadingBlack: 14500, previousReadingColor: 0, volumeBlack: 734, volumeColor: 0, adjustedVolumeBlack: 719, adjustedVolumeColor: 0, baseAmount: 2500, excessAmountBlack: 0, excessAmountColor: 0, subtotal: 2500, vat: 175, total: 2675, paidAmount: 2675, paidAt: new Date('2024-02-28'), sentAt: new Date('2024-02-01'), createdAt: new Date('2024-02-01') },
  { id: '2', invoiceNumber: 'INV-2024-002-001', contractId: '2', customerId: '1', billingPeriodStart: new Date('2024-01-01'), billingPeriodEnd: new Date('2024-01-31'), dueDate: new Date('2024-03-02'), status: 'sent', meterReadingBlack: 28567, meterReadingColor: 8934, previousReadingBlack: 27500, previousReadingColor: 8500, volumeBlack: 1067, volumeColor: 434, adjustedVolumeBlack: 1046, adjustedVolumeColor: 425, baseAmount: 3500, excessAmountBlack: 418, excessAmountColor: 638, subtotal: 4556, vat: 319, total: 4875, paidAmount: 0, sentAt: new Date('2024-02-01'), createdAt: new Date('2024-02-01') },
  { id: '3', invoiceNumber: 'INV-2024-003-001', contractId: '3', customerId: '3', billingPeriodStart: new Date('2024-01-01'), billingPeriodEnd: new Date('2024-01-31'), dueDate: new Date('2024-03-02'), status: 'overdue', meterReadingBlack: 45678, meterReadingColor: 12345, previousReadingBlack: 44000, previousReadingColor: 11500, volumeBlack: 1678, volumeColor: 845, adjustedVolumeBlack: 1644, adjustedVolumeColor: 828, baseAmount: 8500, excessAmountBlack: 0, excessAmountColor: 0, subtotal: 8500, vat: 595, total: 9095, paidAmount: 0, sentAt: new Date('2024-02-01'), createdAt: new Date('2024-02-01') },
];

// Inventory Items
export const mockInventoryItems: InventoryItem[] = [
  { id: '1', productId: '1', sku: 'TONER-KYO-TK1150', name: 'Toner Kyocera TK-1150', category: 'Toner', quantity: 25, minStock: 10, location: 'คลัง A-01', notes: 'สีดำ' },
  { id: '2', productId: '2', sku: 'TONER-KYO-TK8345K', name: 'Toner Kyocera TK-8345K', category: 'Toner', quantity: 8, minStock: 5, location: 'คลัง A-02', notes: 'สีดำ' },
  { id: '3', productId: '2', sku: 'TONER-KYO-TK8345C', name: 'Toner Kyocera TK-8345C', category: 'Toner', quantity: 6, minStock: 5, location: 'คลัง A-02', notes: 'สีฟ้า' },
  { id: '4', productId: '4', sku: 'DRUM-CAN-C3226', name: 'Drum Unit Canon C3226i', category: 'Drum', quantity: 3, minStock: 5, location: 'คลัง B-01', notes: 'ใกล้หมดสต็อก' },
  { id: '5', productId: '1', sku: 'FK-KYO-1150', name: 'Fuser Kit Kyocera FK-1150', category: 'Fuser', quantity: 2, minStock: 3, location: 'คลัง B-02', notes: 'ใกล้หมดสต็อก' },
  { id: '6', productId: '3', sku: 'TONER-LEX-58D3H00', name: 'Toner Lexmark 58D3H00', category: 'Toner', quantity: 15, minStock: 8, location: 'คลัง A-03', notes: 'สีดำ High Yield' },
  { id: '7', productId: '6', sku: 'INK-EPS-C579R', name: 'Ink Pack Epson C579R', category: 'Ink', quantity: 12, minStock: 6, location: 'คลัง A-04', notes: 'สีดำ' },
  { id: '8', productId: '5', sku: 'TONER-HP-37X', name: 'Toner HP 37X', category: 'Toner', quantity: 20, minStock: 10, location: 'คลัง A-05', notes: 'สีดำ' },
];

// Notifications
export const mockNotifications: Notification[] = [
  { id: '1', userId: '1', type: 'info', title: 'ใบเสนอราคาอนุมัติแล้ว', message: 'ใบเสนอราคา QT-2024-001 ได้รับการอนุมัติแล้ว', link: '/sales/quotations/1', isRead: false, createdAt: new Date('2024-01-18') },
  { id: '2', userId: '3', type: 'warning', title: 'รออนุมัติใบเสนอราคา', message: 'มีใบเสนอราคา QT-2024-002 รอการอนุมัติ', link: '/approver/quotations', isRead: false, createdAt: new Date('2024-01-25') },
  { id: '3', userId: '4', type: 'warning', title: 'สัญญาใกล้หมดอายุ', message: 'สัญญา CNT-2022-001 จะหมดอายุในอีก 30 วัน', link: '/contracts/4', isRead: false, createdAt: new Date('2024-01-30') },
  { id: '4', userId: '5', type: 'info', title: 'งานติดตั้งใหม่', message: 'มีงานติดตั้ง JOB-2024-003 รอจ่ายงาน', link: '/planner/jobs', isRead: false, createdAt: new Date('2024-01-26') },
  { id: '5', userId: '6', type: 'info', title: 'ได้รับงานใหม่', message: 'คุณได้รับมอบหมายงาน JOB-2024-003', link: '/technician/jobs/3', isRead: false, createdAt: new Date('2024-01-26') },
  { id: '6', userId: '5', type: 'warning', title: 'สต็อกอะไหล่ต่ำ', message: 'Drum Unit Canon C3226i เหลือ 3 ชิ้น (ต่ำกว่าขั้นต่ำ)', link: '/planner/inventory', isRead: false, createdAt: new Date('2024-01-28') },
  { id: '7', userId: '4', type: 'warning', title: 'รออนุมัติสัญญา', message: 'มีสัญญา CNT-2024-001 รอการอนุมัติ', link: '/approver/contracts', isRead: false, createdAt: new Date('2024-01-25') },
  { id: '8', userId: '3', type: 'error', title: 'ใบแจ้งหนี้ค้างชำระ', message: 'ใบแจ้งหนี้ INV-2024-003-001 ค้างชำระเกินกำหนด', link: '/invoices/3', isRead: false, createdAt: new Date('2024-03-03') },
];

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalLeads: 24,
  activeQuotations: 8,
  activeContracts: 15,
  pendingJobs: 6,
  monthlyRevenue: 145000,
  contractsExpiring30Days: 2,
  lowStockItems: 2,
  pendingApprovals: 3,
};

// Helper functions to get related data
export const getCustomerById = (id: string) => mockCustomers.find(c => c.id === id);
export const getSiteById = (id: string) => mockSites.find(s => s.id === id);
export const getProductById = (id: string) => mockProducts.find(p => p.id === id);
export const getMachineById = (id: string) => mockMachines.find(m => m.id === id);
export const getUserById = (id: string) => mockUsers.find(u => u.id === id);
export const getLeadById = (id: string) => mockLeads.find(l => l.id === id);
export const getQuotationById = (id: string) => mockQuotations.find(q => q.id === id);
export const getContractById = (id: string) => mockContracts.find(c => c.id === id);
export const getJobById = (id: string) => mockJobs.find(j => j.id === id);
export const getPackageById = (id: string) => mockPricingPackages.find(p => p.id === id);
