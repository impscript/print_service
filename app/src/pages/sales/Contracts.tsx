import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    contractsApi,
    type Contract
} from '@/services/api/contracts';
import { customersApi, sitesApi } from '@/services/api/customers';
import { usersApi } from '@/services/api/users';
import { useAuth } from '@/context/AuthContext';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, MoreVertical, FileText, Calendar, Building, Edit, Trash2, DollarSign, StickyNote, Users } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContractPreview } from '@/components/sales/ContractPreview';

const CONTRACT_STATUSES = ['draft', 'pending_approval', 'active', 'expired', 'terminated', 'renewal_pending'];
const PRICING_TYPES = [
    { value: 'actual_usage', label: 'คิดตามจริง' },
    { value: 'rental', label: 'คิดค่าเช่า' },
    { value: 'rental_click', label: 'ค่าเช่า + Click' },
    { value: 'package_paper', label: 'เหมาจ่าย (รวมกระดาษ)' },
    { value: 'package_no_paper', label: 'เหมาจ่าย (ไม่รวมกระดาษ)' },
    { value: 'min_guarantee', label: 'ขั้นต่ำ' },
];
const BILLING_CYCLES = [
    { value: 'monthly', label: 'รายเดือน' },
    { value: 'quarterly', label: 'รายไตรมาส' },
];

const STATUS_LABELS: Record<string, string> = {
    draft: 'ร่าง',
    pending_approval: 'รออนุมัติ',
    active: 'ใช้งาน',
    expired: 'หมดอายุ',
    terminated: 'ยกเลิก',
    renewal_pending: 'รอต่อสัญญา',
};

export function Contracts() {
    const { user } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [sites, setSites] = useState<any[]>([]);
    const [salesUsers, setSalesUsers] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [previewContractId, setPreviewContractId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<any>>({
        customer_id: '',
        site_id: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        contract_number: '',
        old_contract_number: '',
        sales_id: '',
        pricing_type: 'rental_click',
        billing_cycle: 'monthly',
        monthly_fee: 0,
        free_volume_black: 0,
        free_volume_color: 0,
        click_rate_black: 0,
        click_rate_color: 0,
        excess_rate_black: 0,
        excess_rate_color: 0,
        paper_included: false,
        paper_gram: 80,
        vat_included: false,
        waste_paper_discount: 0,
        payment_terms: '',
        auto_renewal: false,
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [contractsData, customersData, sitesData, usersData] = await Promise.all([
                contractsApi.getAll(),
                customersApi.getAll(),
                sitesApi.getAll(),
                usersApi.getAll()
            ]);
            setContracts(contractsData);
            setCustomers(customersData);
            setSites(sitesData);
            setSalesUsers(usersData.filter((u: any) => u.role === 'sales' || u.role === 'admin'));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const location = useLocation();

    // Generate contract number: CPP(DDS)_YYYY_NNNN
    const generateContractNumber = () => {
        const year = new Date().getFullYear();
        const existingForYear = contracts.filter(c =>
            c.contract_number?.includes(`CPP(DDS)_${year}_`)
        );
        const nextNum = existingForYear.length + 1;
        return `CPP(DDS)_${year}_${String(nextNum).padStart(4, '0')}`;
    };

    // Check for createFromLead state
    useEffect(() => {
        if (location.state?.createFromLead && contracts.length >= 0) {
            const lead = location.state.createFromLead;
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            setEditingContract(null);
            setFormData({
                customer_id: lead.customer_id,
                site_id: lead.site_id || '',
                start_date: startDate,
                end_date: endDate,
                status: 'draft',
                contract_number: generateContractNumber(),
                old_contract_number: '',
                sales_id: lead.sales_id || user?.id || '',
                pricing_type: 'rental_click',
                billing_cycle: 'monthly',
                monthly_fee: 0,
                free_volume_black: lead.estimated_volume_black || 0,
                free_volume_color: lead.estimated_volume_color || 0,
                click_rate_black: 0.43,
                click_rate_color: 3.2,
                excess_rate_black: 0.43,
                excess_rate_color: 3.2,
                paper_included: false,
                paper_gram: 80,
                vat_included: false,
                waste_paper_discount: 2,
                payment_terms: 'Credit 30 Days',
                auto_renewal: false,
                notes: `สร้างจาก Lead: ${lead.lead_number}`,
            });
            setIsDialogOpen(true);

            // Clear state so it doesn't re-trigger on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, contracts.length, user]);

    const handleOpenDialog = (contract?: Contract) => {
        if (contract) {
            setEditingContract(contract);
            setFormData({
                customer_id: contract.customer_id,
                site_id: contract.site_id || '',
                start_date: contract.start_date,
                end_date: contract.end_date,
                status: contract.status,
                contract_number: contract.contract_number,
                old_contract_number: (contract as any).old_contract_number || '',
                sales_id: contract.sales_id,
                pricing_type: contract.pricing_type || 'rental_click',
                billing_cycle: contract.billing_cycle || 'monthly',
                monthly_fee: contract.monthly_fee || 0,
                free_volume_black: contract.free_volume_black || 0,
                free_volume_color: contract.free_volume_color || 0,
                click_rate_black: contract.click_rate_black || 0,
                click_rate_color: contract.click_rate_color || 0,
                excess_rate_black: contract.excess_rate_black || 0,
                excess_rate_color: contract.excess_rate_color || 0,
                paper_included: (contract as any).paper_included || false,
                paper_gram: (contract as any).paper_gram || 80,
                vat_included: (contract as any).vat_included || false,
                waste_paper_discount: contract.waste_paper_discount || 0,
                payment_terms: contract.payment_terms || '',
                auto_renewal: contract.auto_renewal || false,
                notes: contract.notes || '',
            });
        } else {
            setEditingContract(null);
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 years default
            setFormData({
                customer_id: '',
                site_id: '',
                start_date: startDate,
                end_date: endDate,
                status: 'draft',
                contract_number: generateContractNumber(),
                old_contract_number: '',
                sales_id: user?.id || '',
                pricing_type: 'rental_click',
                billing_cycle: 'monthly',
                monthly_fee: 0,
                free_volume_black: 0,
                free_volume_color: 0,
                click_rate_black: 0.43,
                click_rate_color: 3.2,
                excess_rate_black: 0.43,
                excess_rate_color: 3.2,
                paper_included: false,
                paper_gram: 80,
                vat_included: false,
                waste_paper_discount: 2,
                payment_terms: 'Credit 30 Days',
                auto_renewal: false,
                notes: '',
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingContract) {
                await contractsApi.update(editingContract.id, formData);
            } else {
                await contractsApi.create({
                    ...formData,
                    sales_id: formData.sales_id || user?.id || '',
                } as any);
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ต้องการลบสัญญานี้?')) return;
        try {
            await contractsApi.delete(id);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const filteredContracts = contracts.filter(c => {
        const customerName = (c as any).customers?.company_name || '';
        const number = c.contract_number || '';
        const matchesSearch =
            number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Filtered sites based on selected customer
    const filteredSites = sites.filter(s => !formData.customer_id || s.customer_id === formData.customer_id);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">สัญญา</h1>
                    <p className="text-gray-500">จัดการสัญญาเช่าและบริการ</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างสัญญาใหม่
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="ค้นหาเลขที่สัญญา หรือชื่อลูกค้า..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกสถานะ</SelectItem>
                                {CONTRACT_STATUSES.map(option => (
                                    <SelectItem key={option} value={option}>
                                        {STATUS_LABELS[option] || option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>เลขที่สัญญา</TableHead>
                                <TableHead>ลูกค้า</TableHead>
                                <TableHead>ระยะเวลา</TableHead>
                                <TableHead>ค่าเช่า/เดือน</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContracts.map((contract) => (
                                <TableRow key={contract.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenDialog(contract)}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            {contract.contract_number && contract.contract_number !== 'AUTO' ? contract.contract_number : <span className="text-gray-400 italic">ไม่มีเลขที่</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4 text-gray-400" />
                                            {(contract as any).customers?.company_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{formatDate(contract.start_date)}</div>
                                            <div className="text-gray-400 text-xs">ถึง {formatDate(contract.end_date)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {contract.monthly_fee ? `${contract.monthly_fee.toLocaleString()} ฿` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(contract.status)}>
                                            {STATUS_LABELS[contract.status] || getStatusLabel(contract.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setPreviewContractId(contract.id)}>
                                                    <FileText className="w-4 h-4 mr-2" /> พรีวิว PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(contract)}>
                                                    <Edit className="w-4 h-4 mr-2" /> แก้ไข
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(contract.id)} className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" /> ลบ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredContracts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">ไม่พบสัญญา</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ===== Contract Dialog ===== */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[90vw] w-[90vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingContract ? 'แก้ไขสัญญา' : 'สร้างสัญญาใหม่'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-5">

                        {/* Section 1: ข้อมูลสัญญา */}
                        <div className="rounded-lg border bg-white p-4 space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                                <FileText className="w-4 h-4 text-blue-500" /> ข้อมูลสัญญา
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">เลขที่สัญญา <span className="text-red-500">*</span></Label>
                                    <Input
                                        required
                                        value={formData.contract_number || ''}
                                        onChange={e => setFormData({ ...formData, contract_number: e.target.value })}
                                        placeholder="CPP(DDS)_2026_0001"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">เลขที่สัญญาเก่า</Label>
                                    <Input
                                        value={formData.old_contract_number || ''}
                                        onChange={e => setFormData({ ...formData, old_contract_number: e.target.value })}
                                        placeholder="กรณีต่อสัญญา"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">สถานะ</Label>
                                    <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CONTRACT_STATUSES.map(s => (
                                                <SelectItem key={s} value={s}>{STATUS_LABELS[s] || s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">พนักงานขาย</Label>
                                    <Select value={formData.sales_id} onValueChange={v => setFormData({ ...formData, sales_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="เลือกพนักงาน" /></SelectTrigger>
                                        <SelectContent>
                                            {salesUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: ลูกค้า & สถานที่ */}
                        <div className="rounded-lg border bg-white p-4 space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                                <Users className="w-4 h-4 text-green-500" /> ลูกค้า & สถานที่ติดตั้ง
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">ลูกค้า <span className="text-red-500">*</span></Label>
                                    <Select value={formData.customer_id} onValueChange={v => {
                                        setFormData({ ...formData, customer_id: v, site_id: '' });
                                    }}>
                                        <SelectTrigger><SelectValue placeholder="เลือกลูกค้า" /></SelectTrigger>
                                        <SelectContent>
                                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">สถานที่ติดตั้ง</Label>
                                    <Select value={formData.site_id || 'none'} onValueChange={v => setFormData({ ...formData, site_id: v === 'none' ? '' : v })}>
                                        <SelectTrigger><SelectValue placeholder="เลือกสถานที่" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">ไม่ระบุ</SelectItem>
                                            {filteredSites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: ระยะเวลาสัญญา */}
                        <div className="rounded-lg border bg-white p-4 space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                                <Calendar className="w-4 h-4 text-purple-500" /> ระยะเวลาสัญญา
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">วันเริ่มสัญญา <span className="text-red-500">*</span></Label>
                                    <Input type="date" required value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">วันสิ้นสุดสัญญา <span className="text-red-500">*</span></Label>
                                    <Input type="date" required value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Billing Cycle</Label>
                                    <Select value={formData.billing_cycle} onValueChange={v => setFormData({ ...formData, billing_cycle: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {BILLING_CYCLES.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">เงื่อนไขชำระเงิน</Label>
                                    <Input value={formData.payment_terms || ''} onChange={e => setFormData({ ...formData, payment_terms: e.target.value })} placeholder="เช่น Credit 30 Days" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <Checkbox
                                    id="auto_renewal"
                                    checked={formData.auto_renewal || false}
                                    onCheckedChange={(checked) => setFormData({ ...formData, auto_renewal: !!checked })}
                                />
                                <Label htmlFor="auto_renewal" className="text-xs text-gray-600 cursor-pointer">ต่อสัญญาอัตโนมัติ</Label>
                            </div>
                        </div>

                        {/* Section 4: ราคา & มิเตอร์ */}
                        <div className="rounded-lg border bg-white p-4 space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                                <DollarSign className="w-4 h-4 text-orange-500" /> ราคา & อัตรามิเตอร์
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">ประเภทราคา</Label>
                                    <Select value={formData.pricing_type} onValueChange={v => setFormData({ ...formData, pricing_type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {PRICING_TYPES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">ค่าเช่ารายเดือน (บาท)</Label>
                                    <Input type="number" value={formData.monthly_fee ?? 0} onChange={e => setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">ขั้นต่ำ Mono (แผ่น)</Label>
                                    <Input type="number" value={formData.free_volume_black ?? 0} onChange={e => setFormData({ ...formData, free_volume_black: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">ขั้นต่ำ Color (แผ่น)</Label>
                                    <Input type="number" value={formData.free_volume_color ?? 0} onChange={e => setFormData({ ...formData, free_volume_color: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Rate ขั้นต่ำ Mono (บาท/แผ่น)</Label>
                                    <Input type="number" step="0.01" value={formData.click_rate_black ?? 0} onChange={e => setFormData({ ...formData, click_rate_black: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Rate ขั้นต่ำ Color (บาท/แผ่น)</Label>
                                    <Input type="number" step="0.01" value={formData.click_rate_color ?? 0} onChange={e => setFormData({ ...formData, click_rate_color: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Rate ส่วนเกิน Mono (บาท/แผ่น)</Label>
                                    <Input type="number" step="0.01" value={formData.excess_rate_black ?? 0} onChange={e => setFormData({ ...formData, excess_rate_black: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">Rate ส่วนเกิน Color (บาท/แผ่น)</Label>
                                    <Input type="number" step="0.01" value={formData.excess_rate_color ?? 0} onChange={e => setFormData({ ...formData, excess_rate_color: parseFloat(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">ส่วนลดกระดาษเสีย (%)</Label>
                                    <Input type="number" step="0.1" value={formData.waste_paper_discount ?? 0} onChange={e => setFormData({ ...formData, waste_paper_discount: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">แกรมกระดาษ</Label>
                                    <Select value={String(formData.paper_gram || 80)} onValueChange={v => setFormData({ ...formData, paper_gram: parseInt(v) })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="70">70 แกรม</SelectItem>
                                            <SelectItem value="80">80 แกรม</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-4 pt-5">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="paper_included"
                                            checked={formData.paper_included || false}
                                            onCheckedChange={(checked) => setFormData({ ...formData, paper_included: !!checked })}
                                        />
                                        <Label htmlFor="paper_included" className="text-xs text-gray-600 cursor-pointer">กระดาษรวม</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="vat_included"
                                            checked={formData.vat_included || false}
                                            onCheckedChange={(checked) => setFormData({ ...formData, vat_included: !!checked })}
                                        />
                                        <Label htmlFor="vat_included" className="text-xs text-gray-600 cursor-pointer">รวม VAT</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: หมายเหตุ */}
                        <div className="rounded-lg border bg-white p-4 space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                                <StickyNote className="w-4 h-4 text-gray-500" /> หมายเหตุ
                            </h4>
                            <div className="space-y-1.5">
                                <Input value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="หมายเหตุเพิ่มเติม" />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
                            <Button type="submit">บันทึก</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ContractPreview
                contractId={previewContractId}
                isOpen={!!previewContractId}
                onClose={() => setPreviewContractId(null)}
            />
        </div>
    );
}
