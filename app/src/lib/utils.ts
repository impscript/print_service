import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return d.toLocaleDateString('th-TH', defaultOptions);
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('th-TH').format(num);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // General
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',

    // Lead status
    new: 'bg-blue-100 text-blue-800',
    quotation: 'bg-yellow-100 text-yellow-800',
    contract: 'bg-purple-100 text-purple-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',

    // Quote status
    draft: 'bg-gray-100 text-gray-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',

    // Contract status
    expired_contract: 'bg-red-100 text-red-800',
    terminated: 'bg-gray-100 text-gray-800',
    renewal_pending: 'bg-orange-100 text-orange-800',

    // Job status
    assigned: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-blue-100 text-blue-800',

    // Machine status
    'In Stock': 'bg-green-100 text-green-800',
    Installed: 'bg-blue-100 text-blue-800',
    Maintenance: 'bg-yellow-100 text-yellow-800',
    Reserved: 'bg-purple-100 text-purple-800',
    Repairing: 'bg-orange-100 text-orange-800',

    // Invoice status
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',

    // Priority
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    // Lead status
    new: 'New',
    quotation: 'Quotation',
    contract: 'Contract',
    won: 'Won',
    lost: 'Lost',

    // Lead type
    fast_print: 'Double A Fastprint',
    print_service: 'Double A Copy Point',

    // Pricing type
    actual_usage: 'คิดตามจริง',
    rental: 'คิดค่าเช่า',
    rental_click: 'ค่าเช่า + Click',
    package_paper: 'เหมาจ่าย (รวมกระดาษ)',
    package_no_paper: 'เหมาจ่าย (ไม่รวมกระดาษ)',
    min_guarantee: 'ขั้นต่ำ',

    // Job type
    installation: 'ติดตั้ง',
    maintenance: 'ซ่อมบำรุง',
    repair: 'ซ่อม',
    pickup: 'รับคืน',
    meter_reading: 'อ่านมิเตอร์',

    // Billing cycle
    monthly: 'รายเดือน',
    quarterly: 'รายไตรมาส',

    // Job status
    pending: 'รอดำเนินการ',
    assigned: 'มอบหมายแล้ว',
    in_progress: 'กำลังทำ',

    // Contract status
    draft: 'ร่าง',
    pending_approval: 'รออนุมัติ',
    terminated: 'ยกเลิก',
    renewal_pending: 'รอต่ออายุ',
  };

  return statusLabels[status] || status;
}

export function getCustomerTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    education_university: 'สถานศึกษา - อุดมศึกษา (มหาวิทยาลัย)',
    financial_institution: 'สถาบันการเงิน',
    education_school: 'สถานศึกษา - โรงเรียน',
    government: 'ราชการ',
    private: 'เอกชน',
    state_enterprise: 'รัฐวิสาหกิจ',
    other_shop: 'ร้านอื่นๆ',
    industrial_estate: 'นิคมอุตสาหกรรม',
    copy_shop: 'ร้านถ่ายเอกสาร',
    computer_shop: 'ร้านคอมพิวเตอร์',
    hospital: 'โรงพยาบาล',
    post_office: 'ร้านไปรษณีย์',
    sme: 'SME', // Keep for backward compatibility
  };

  return typeLabels[type] || type;
}

export function calculateDaysUntil(date: Date | string): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateRunningNumber(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${sequence.toString().padStart(3, '0')}`;
}
