import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { templateSettingsService } from '@/services/templateSettings';
import {
    quotationsApi,
    type QuotationInsert,
    type QuotationItemInsert
} from '@/services/api/quotations';
import { leadsApi, leadRequirementsApi } from '@/services/api/leads';
import { customersApi, sitesApi } from '@/services/api/customers';
import {
    productsApi,
    pricingPackagesApi
} from '@/services/api/products';
import { usersApi } from '@/services/api/users';
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils';
import { bookingsApi, type CustomerBookingInsert } from '@/services/api/bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label'; // Label is used
import { Label } from '@/components/ui/label';
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
import { ArrowLeft, Save, Plus, Trash2, Calculator, ClipboardList, Eye, AlertCircle } from 'lucide-react';
import { QuotationPreview } from '@/components/marketing/QuotationPreview';
import { Textarea } from '@/components/ui/textarea';
// import { Badge } from '@/components/ui/badge'; // Unused

// Import from correct files if exports are scattered.
// products.ts: productsApi, pricingPackagesApi
// leads.ts: leadsApi
// customers.ts: customersApi, sitesApi
// users.ts: usersApi

const ATTENTION_TITLES = [
    "ผู้อำนวยการ", "ผู้รับบริการ", "ท่านผู้อำนวยการ", "ผู้จัดการ", "คณบดี",
    "ท่านอธิการบดี", "คุณ", "อธิการบดี", "หัวหน้า",
    "ประธานคณะกรรมการขับเคลื่อนยุทธศาสตร์", "ฝ่ายพัสดุ", "รองอธิการบดี",
    "ฝ่ายจัดซื้อ", "หัวหน้าฝ่ายพัสดุ"
];

export function QuotationBuilder() {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const [searchParams] = useSearchParams();
    const leadIdQuery = searchParams.get('lead');
    const { user } = useAuth();

    // Master Data
    const [customers, setCustomers] = useState<any[]>([]);
    const [sites, setSites] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [salesUsers, setSalesUsers] = useState<any[]>([]);

    const [formData, setFormData] = useState<Partial<QuotationInsert>>({
        quote_number: '', // Auto
        customer_id: '',
        attention_title: 'ผู้รับบริการ', // Default
        sales_id: user?.id || '',
        status: 'draft',
        pricing_type: 'rental_click', // default
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
        discount: 0,
        notes: '1. รายละเอียดเครื่องตามเอกสารแนบ',
    });

    const [bookingData, setBookingData] = useState<Partial<CustomerBookingInsert>>({
        installation_contact_person: '',
        number_of_computers: 0,
    });

    const [items, setItems] = useState<Partial<QuotationItemInsert>[]>([]);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [leadRequirements, setLeadRequirements] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [termsText, setTermsText] = useState('');

    useEffect(() => {
        loadMasterData();
        // Initialize terms from template settings
        const settings = templateSettingsService.get();
        setTermsText(settings.termsAndConditions.map((t, i) => `${i + 1}. ${t}`).join('\n'));
        if (id) {
            loadQuotation(id);
        } else if (leadIdQuery) {
            // Pre-fill from Lead
            loadLeadIntoForm(leadIdQuery);
        }
    }, [id, leadIdQuery]);

    // Enforce pricing_type consistency with selected package
    useEffect(() => {
        if (formData.package_id && packages.length > 0) {
            const pkg = packages.find(p => p.id === formData.package_id);
            if (pkg && pkg.pricing_type && pkg.pricing_type !== formData.pricing_type) {
                console.log('Auto-fixing pricing_type mismatch:', pkg.pricing_type);
                setFormData(prev => ({ ...prev, pricing_type: pkg.pricing_type }));
            }
        }
    }, [formData.package_id, packages, formData.pricing_type]);

    const loadMasterData = async () => {
        try {
            const [c, s, p, pkg, u] = await Promise.all([
                customersApi.getAll(),
                sitesApi.getAll(),
                productsApi.getAll(),
                pricingPackagesApi.getAll(),
                usersApi.getByRole('sales')
            ]);
            setCustomers(c);
            setSites(s);
            setProducts(p);
            setPackages(pkg);
            setSalesUsers(u);
        } catch (err) {
            console.error("Error loading master data", err);
        }
    };

    const loadQuotation = async (quoteId: string) => {
        try {
            const data = await quotationsApi.getById(quoteId);
            setFormData({
                customer_id: data.customer_id,
                attention_title: data.attention_title || 'ผู้รับบริการ',
                site_id: data.site_id,
                lead_id: data.lead_id,
                package_id: data.package_id,
                sales_id: data.sales_id,
                pricing_type: data.pricing_type,
                valid_until: data.valid_until,
                status: data.status,
                discount: data.discount,
                notes: data.notes || '1. รายละเอียดเครื่องตามเอกสารแนบ',
                rejection_reason: (data as any).rejection_reason,
            });
            // Load saved terms or fallback to template settings
            if (data.terms_conditions) {
                setTermsText(data.terms_conditions);
            }
            // Map items
            const itemsData = (data as any).quotation_items || [];
            setItems(itemsData.map((i: any) => ({
                product_id: i.product_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
                total_price: i.total_price,
                description: i.description
            })));

            // Allow loading lead details even for existing quotation if lead_id exists
            if (data.lead_id) {
                const lead = await leadsApi.getById(data.lead_id);
                if (lead) {
                    setSelectedLead(lead);
                    const reqs = await leadRequirementsApi.getByLeadId(data.lead_id);
                    setLeadRequirements(reqs);
                }
            }

            // Load booking data if exists
            try {
                const booking = await bookingsApi.getByQuotationId(quoteId);
                if (booking) {
                    setBookingData({
                        installation_contact_person: booking.installation_contact_person || '',
                        number_of_computers: booking.number_of_computers || 0,
                    });
                }
            } catch (err) {
                console.error("Error loading booking data:", err);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadLeadIntoForm = async (leadId: string) => {
        const lead = await leadsApi.getById(leadId);
        if (lead) {
            setSelectedLead(lead);
            setFormData(prev => ({
                ...prev,
                customer_id: lead.customer_id,
                site_id: lead.site_id,
                lead_id: lead.id,
                sales_id: lead.sales_id,
                pricing_type: lead.type === 'fast_print' ? 'package_no_paper' : 'rental_click'
            }));

            // Load requirements
            const reqs = await leadRequirementsApi.getByLeadId(leadId);
            setLeadRequirements(reqs);
        }
    };

    // Logic
    const addItem = () => {
        setItems([...items, { product_id: '', quantity: 1, unit_price: 0, total_price: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Auto-price logic
        if (field === 'product_id' || field === 'quantity' || field === 'unit_price') {
            // Should we look up default price from Package?
            if (field === 'product_id' && formData.package_id) {
                // Try to find if package has specific price for this product?
                // Since our DB schema for package is generic or product specific...
                // If package.product_id matches item.product_id, use package.base_monthly_fee
                const pkg = packages.find(p => p.id === formData.package_id);
                if (pkg && pkg.base_monthly_fee) {
                    // Heuristic: If package is generic, maybe base fee is per machine?
                    item.unit_price = pkg.base_monthly_fee;
                }
            }

            const qty = field === 'quantity' ? Number(value) : (item.quantity || 0);
            const price = field === 'unit_price' ? Number(value) : (item.unit_price || 0);
            item.total_price = qty * price;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    // Summary Calc
    const subtotal = items.reduce((acc, item) => acc + (item.total_price || 0), 0);
    const discount = Number(formData.discount || 0);
    const taxable = Math.max(0, subtotal - discount);
    const vat = taxable * 0.07;
    const total = taxable + vat;

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                subtotal,
                vat,
                total,
                terms_conditions: termsText || null,
            };

            let savedQuotationId = id;

            if (id) {
                await quotationsApi.updateWithItems(id, payload as any, items as any[]);
            } else {
                const created = await quotationsApi.create(payload as any, items as any[]);
                savedQuotationId = created.id;
            }

            // Save booking info if it has data
            if (savedQuotationId && payload.customer_id &&
                (bookingData.installation_contact_person || bookingData.number_of_computers)) {

                await bookingsApi.upsert({
                    quotation_id: savedQuotationId,
                    customer_id: payload.customer_id,
                    installation_contact_person: bookingData.installation_contact_person || null,
                    number_of_computers: bookingData.number_of_computers || 0,
                    booking_token: crypto.randomUUID(), // New UUID is generated if API doesn't find one for upsert
                } as CustomerBookingInsert);
            }

            navigate('/quotations');
        } catch (err) {
            console.error(err);
            alert("Error saving: " + (err instanceof Error ? err.message : JSON.stringify(err)));
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {id ? 'Edit Quotation' : 'New Quotation'}
                </h1>
                {id && formData.status && (
                    <Badge className={getStatusColor(formData.status)}>
                        {getStatusLabel(formData.status)}
                    </Badge>
                )}
            </div>

            {/* Rejection Reason Alert */}
            {formData.status === 'rejected' && (formData as any).rejection_reason && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                        <span className="font-medium">เหตุผลที่ถูกปฏิเสธ: </span>
                        {(formData as any).rejection_reason}
                    </div>
                </div>
            )}

            {/* Lead Requirements Card - Show when a lead is selected */}
            {selectedLead && (
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                            <ClipboardList className="w-4 h-4" />
                            Lead Requirements - {selectedLead.lead_number}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Common Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b border-amber-200/50 pb-2 mb-2">
                            <div>
                                <span className="text-gray-500 block">Customer</span>
                                <span className="font-medium">{selectedLead.customers?.company_name || '-'}</span>
                            </div>
                            {selectedLead.past_brand && (
                                <div>
                                    <span className="text-gray-500 block">Existing Printer</span>
                                    <span className="font-medium">{selectedLead.past_brand}</span>
                                </div>
                            )}
                        </div>

                        {leadRequirements.length > 0 ? (
                            <div className="border rounded-md overflow-hidden bg-white shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[50px] text-center">#</TableHead>
                                            <TableHead className="w-[80px] text-center">จำนวน</TableHead>
                                            <TableHead className="w-[150px]">Machine Type</TableHead>
                                            <TableHead className="w-[100px] text-center">สี/ขาวดำ</TableHead>
                                            <TableHead className="w-[100px] text-center">ขนาดกระดาษ</TableHead>
                                            <TableHead className="w-[120px] text-right">Est. ขาวดำ</TableHead>
                                            <TableHead className="w-[120px] text-right">Est. สี</TableHead>
                                            <TableHead>ความต้องการอื่นๆ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leadRequirements.map((req, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium text-center text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell className="text-center font-medium">{req.quantity}</TableCell>
                                                <TableCell>
                                                    {req.machine_type === 'Printer' ? 'Single Function' :
                                                        req.machine_type === 'MFP' ? 'Multifunction' :
                                                            req.machine_type}
                                                </TableCell>
                                                <TableCell className="text-center">{req.color_type}</TableCell>
                                                <TableCell className="text-center">{req.paper_size}</TableCell>
                                                <TableCell className="text-right">{req.estimated_volume_black?.toLocaleString() || '-'}</TableCell>
                                                <TableCell className="text-right">{req.estimated_volume_color?.toLocaleString() || '-'}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={req.special_requirements || ''}>
                                                    {req.special_requirements || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            /* Legacy Single View */
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Machine Type</span>
                                    <span className="font-semibold">{selectedLead.machine_type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Color Type</span>
                                    <span className="font-semibold">{selectedLead.color_type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Paper Size</span>
                                    <span className="font-semibold">{selectedLead.paper_size}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Est. Black</span>
                                    <span className="font-medium">{selectedLead.estimated_volume_black?.toLocaleString() || '-'} pgs</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Est. Color</span>
                                    <span className="font-medium">{selectedLead.estimated_volume_color?.toLocaleString() || '-'} pgs</span>
                                </div>
                                {selectedLead.special_requirements && (
                                    <div className="col-span-2 md:col-span-4">
                                        <span className="text-gray-500 block">Special Requirements</span>
                                        <span className="font-medium">{selectedLead.special_requirements}</span>
                                    </div>
                                )}
                            </div>
                        )
                        }
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Header Info */}
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Customer</Label>
                            <Select value={formData.customer_id} onValueChange={v => setFormData({ ...formData, customer_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                                <SelectContent>
                                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>คำนำหน้า (Attention Title)</Label>
                            <Select value={formData.attention_title || 'ผู้รับบริการ'} onValueChange={v => setFormData({ ...formData, attention_title: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Title" /></SelectTrigger>
                                <SelectContent>
                                    {ATTENTION_TITLES.map(title => <SelectItem key={title} value={title}>{title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Site</Label>
                            <Select value={formData.site_id || ''} onValueChange={v => setFormData({ ...formData, site_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Site" /></SelectTrigger>
                                <SelectContent>
                                    {sites.filter(s => s.customer_id === formData.customer_id).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Pricing Package</Label>
                            <Select value={formData.package_id || ''} onValueChange={v => {
                                const pkg = packages.find(p => p.id === v);
                                setFormData({
                                    ...formData,
                                    package_id: v,
                                    pricing_type: pkg?.pricing_type || 'rental_click'
                                });
                            }}>
                                <SelectTrigger><SelectValue placeholder="Select Package" /></SelectTrigger>
                                <SelectContent>
                                    {packages.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({formatCurrency(p.base_monthly_fee || 0)})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Pricing Type</Label>
                            <Input value={getStatusLabel(formData.pricing_type || '')} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Valid Until</Label>
                            <Input type="date" value={formData.valid_until || ''} onChange={e => setFormData({ ...formData, valid_until: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Sales Rep</Label>
                            <Select value={formData.sales_id} onValueChange={v => setFormData({ ...formData, sales_id: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {salesUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['draft', 'pending_approval', 'approved', 'rejected', 'sent', 'accepted', 'expired'].map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <Label>หมายเหตุ (Notes)</Label>
                            <Textarea
                                value={formData.notes || ''}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="1. รายละเอียดเครื่องตามเอกสารแนบ"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <Label>เงื่อนไขการขาย (Terms & Conditions)</Label>
                            <Textarea
                                value={termsText}
                                onChange={e => setTermsText(e.target.value)}
                                placeholder="1. ชำระเงิน เครดิต 30 วัน หลังจากวางบิล&#10;2. ส่งมอบสินค้า ภายใน 60 วัน"
                                rows={6}
                            />
                            <p className="text-xs text-gray-500">แต่ละข้อขึ้นบรรทัดใหม่ — จะแสดงในใบเสนอราคา</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="h-fit">
                    <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Discount</span>
                            <Input type="number" className="w-24 text-right h-8" value={formData.discount ?? 0} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
                        </div>
                        <div className="flex justify-between">
                            <span>VAT (7%)</span>
                            <span>{formatCurrency(vat)}</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" variant="outline" onClick={() => setShowPreview(true)}>
                            <Eye className="w-4 h-4 mr-2" /> Preview
                        </Button>
                        <Button className="w-full" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" /> Save Quotation
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Items */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Line Items</CardTitle>
                    <Button onClick={addItem} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="w-32">Qty</TableHead>
                                <TableHead className="w-40">Unit Price</TableHead>
                                <TableHead className="w-40 text-right">Total</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <Select value={item.product_id} onValueChange={v => updateItem(idx, 'product_id', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.brand} {p.model}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(item.total_price || 0)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                                        No items. Add items to calculate total.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Footer Info / Package Details Preview */}
            {formData.package_id && (
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardContent className="p-4 text-sm text-blue-800">
                        <div className="flex gap-2 items-center font-semibold mb-2">
                            <Calculator className="w-4 h-4" /> Selected Package Terms:
                        </div>
                        {(() => {
                            const pkg = packages.find(p => p.id === formData.package_id);
                            if (!pkg) return null;
                            return (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>Base Fee: {formatCurrency(pkg.base_monthly_fee)}</div>
                                    <div>Click (Bk): {pkg.click_rate_black}</div>
                                    <div>Click (Col): {pkg.click_rate_color}</div>
                                    <div>Excess (Bk): {pkg.excess_rate_black}</div>
                                    <div>Excess (Col): {pkg.excess_rate_color}</div>
                                </div>
                            )
                        })()}
                    </CardContent>
                </Card>
            )}

            {/* Booking Information (Only shown when quotation is accepted) */}
            {formData.status === 'accepted' && (
                <Card className="border-indigo-200 bg-indigo-50/30 shadow-sm mt-6">
                    <CardHeader className="pb-3 border-b border-indigo-100 bg-indigo-50">
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-800">
                            <ClipboardList className="w-5 h-5" />
                            ข้อมูลการติดตั้ง (Booking Information)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="booking_contact">ชื่อผู้ติดต่อหน้างาน (Contact Person)</Label>
                                <Input
                                    id="booking_contact"
                                    value={bookingData.installation_contact_person || ''}
                                    onChange={e => setBookingData(prev => ({ ...prev, installation_contact_person: e.target.value }))}
                                    placeholder="ชื่อ-นามสกุล ผู้ติดต่อหน้างาน"
                                    className="bg-white border-indigo-100 focus-visible:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="booking_computers">จำนวนคอมที่จะเชื่อมกับเครื่องปริ้นท์</Label>
                                <Input
                                    id="booking_computers"
                                    type="number"
                                    min="0"
                                    value={bookingData.number_of_computers || ''}
                                    onChange={e => setBookingData(prev => ({ ...prev, number_of_computers: parseInt(e.target.value) || 0 }))}
                                    placeholder="0"
                                    className="bg-white border-indigo-100 focus-visible:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-indigo-600/80 bg-indigo-100/50 p-3 rounded-md flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>ข้อมูลส่วนนี้จะถูกส่งไปยังทีมติดตั้งเมื่อบันทึกเอกสารใบเสนอราคานี้ โปรดตรวจสอบความถูกต้องก่อนบันทึก</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <QuotationPreview
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                quotation={{
                    ...formData,
                    quotation_items: items.map(item => ({
                        ...item,
                        products: products.find(p => p.id === item.product_id)
                    })),
                    customers: customers.find(c => c.id === formData.customer_id),
                    users: salesUsers.find(u => u.id === formData.sales_id),
                    created_at: formData.created_at || new Date().toISOString(),
                } as any}
                customTerms={termsText}
            />
        </div >
    );
}
