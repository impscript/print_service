import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  leadsApi,
  leadRequirementsApi,
  type Lead,
  type LeadInsert,
  type LeadUpdate,
  type LeadRequirementInsert
} from '@/services/api/leads';
import { customersApi, sitesApi, type Customer, type CustomerInsert } from '@/services/api/customers';
import { usersApi } from '@/services/api/users';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, LayoutGrid, List as ListIcon, MapPin, UserPlus, Users, AlertCircle, FileText, Trash2, Briefcase, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEAD_STATUSES = ['new', 'quotation', 'contract', 'won', 'lost'];

// Requirement type for the form
type Requirement = {
  id?: string;
  machine_type: 'MFP' | 'Printer';
  color_type: 'Color' | 'Mono';
  paper_size: 'A4' | 'A3';
  quantity: number;
  estimated_volume_black: number;
  estimated_volume_color: number;
  special_requirements: string;
};

const defaultRequirement = (): Requirement => ({
  machine_type: 'MFP',
  color_type: 'Color',
  paper_size: 'A4',
  quantity: 1,
  estimated_volume_black: 3000,
  estimated_volume_color: 500,
  special_requirements: ''
});

export function Leads() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilterStart, setDateFilterStart] = useState<string>('');
  const [dateFilterEnd, setDateFilterEnd] = useState<string>('');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Data for Selects
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);

  // Customer Mode: 'existing' or 'new'
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('new');

  // Matched customer suggestion
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);

  // New Customer Form
  const [newCustomerForm, setNewCustomerForm] = useState<Partial<CustomerInsert>>({
    company_name: '',
    tax_id: '',
    phone: '',
    contact_person: '',
    email: '',
    address: ''
  });

  // Lead Form
  const [formData, setFormData] = useState<Partial<LeadInsert> & { price_validity_days?: number }>({
    paper_size: 'A4',
    machine_type: 'MFP',
    color_type: 'Color',
    estimated_volume_black: 3000,
    estimated_volume_color: 500,
    status: 'new',
    type: 'print_service',
    price_validity_days: 30,
    customer_acquisition_type: undefined
  });

  // Multi-requirements state
  const [requirements, setRequirements] = useState<Requirement[]>([defaultRequirement()]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsData, customersData, sitesData, usersData] = await Promise.all([
        leadsApi.getAll(),
        customersApi.getAll(),
        sitesApi.getAll(),
        usersApi.getByRole('sales')
      ]);
      setLeads(leadsData);
      setCustomers(customersData);
      setSites(sitesData);
      setSalesUsers(usersData);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  // Requirement management functions
  const loadLeadRequirements = async (leadId: string) => {
    try {
      const data = await leadRequirementsApi.getByLeadId(leadId);
      if (data && data.length > 0) {
        setRequirements(data.map(r => ({
          id: r.id,
          machine_type: r.machine_type as 'MFP' | 'Printer',
          color_type: r.color_type as 'Color' | 'Mono',
          paper_size: r.paper_size as 'A4' | 'A3',
          quantity: r.quantity,
          estimated_volume_black: r.estimated_volume_black || 0,
          estimated_volume_color: r.estimated_volume_color || 0,
          special_requirements: r.special_requirements || ''
        })));
      } else {
        // Fallback: use legacy single requirement from lead
        setRequirements([defaultRequirement()]);
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
      setRequirements([defaultRequirement()]);
    }
  };

  const addRequirement = () => {
    setRequirements([...requirements, defaultRequirement()]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const updateRequirement = (index: number, field: keyof Requirement, value: any) => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], [field]: value };
    setRequirements(updated);
  };

  const filteredLeads = leads.filter(lead => {
    const companyName = (lead as any).customers?.company_name || '';
    const matchesSearch =
      lead.lead_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    let matchesDate = true;
    if (dateFilterStart || dateFilterEnd) {
      if (!lead.created_at) {
        matchesDate = false;
      } else {
        // Date compare (ignoring time)
        const leadDate = new Date(lead.created_at).toISOString().split('T')[0];
        if (dateFilterStart && leadDate < dateFilterStart) matchesDate = false;
        if (dateFilterEnd && leadDate > dateFilterEnd) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Check for matching customer when key fields change
  const checkCustomerMatch = useCallback(async () => {
    if (customerMode !== 'new') return;

    const { tax_id, phone, company_name } = newCustomerForm;
    if (!tax_id && !phone && !company_name) {
      setMatchedCustomer(null);
      return;
    }

    try {
      const match = await customersApi.findMatch({
        tax_id: tax_id || undefined,
        phone: phone || undefined,
        company_name: company_name || undefined
      });
      setMatchedCustomer(match);
    } catch (error) {
      console.error('Error checking match:', error);
    }
  }, [customerMode, newCustomerForm]);

  // Debounced match check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkCustomerMatch();
    }, 500);
    return () => clearTimeout(timer);
  }, [newCustomerForm.tax_id, newCustomerForm.phone, newCustomerForm.company_name, checkCustomerMatch]);

  const handleOpenDialog = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setCustomerMode('existing');
      setFormData({
        customer_id: lead.customer_id,
        site_id: lead.site_id,
        type: lead.type,
        status: lead.status,
        sales_id: lead.sales_id,
        paper_size: lead.paper_size,
        machine_type: lead.machine_type,
        color_type: lead.color_type,
        estimated_volume_black: lead.estimated_volume_black,
        estimated_volume_color: lead.estimated_volume_color,
        special_requirements: lead.special_requirements,
        past_brand: lead.past_brand || '',
        past_paper_type: lead.past_paper_type || '',
        notes: lead.notes || ''
      } as any);

      // Populate newCustomerForm with existing customer data so we can edit it
      const existingCustomer = customers.find(c => c.id === lead.customer_id);
      if (existingCustomer) {
        setNewCustomerForm({
          company_name: existingCustomer.company_name,
          tax_id: existingCustomer.tax_id || '',
          phone: existingCustomer.phone || '',
          contact_person: existingCustomer.contact_person || '',
          email: existingCustomer.email || '',
          address: existingCustomer.address || '',
          customer_type: existingCustomer.customer_type || 'sme'
        });
      } else {
        setNewCustomerForm({});
      }

      setMatchedCustomer(null);
      // Load existing requirements when editing
      loadLeadRequirements(lead.id);
    } else {
      setEditingLead(null);
      setCustomerMode('new');
      setFormData({
        customer_id: '',
        site_id: undefined,
        type: 'print_service',
        status: 'new',
        sales_id: user?.id,
        paper_size: 'A4',
        machine_type: 'MFP',
        color_type: 'Color',
        estimated_volume_black: 3000,
        estimated_volume_color: 500,
        special_requirements: '',
        past_brand: '',
        past_paper_type: '',
        notes: ''
      } as any);
      setNewCustomerForm({
        company_name: '',
        tax_id: '',
        phone: '',
        contact_person: '',
        email: '',
        address: ''
      });
      setMatchedCustomer(null);
      // Reset to single default requirement for new leads
      setRequirements([defaultRequirement()]);
    }
    setIsDialogOpen(true);
  };

  const handleUseExistingCustomer = () => {
    if (matchedCustomer) {
      setCustomerMode('existing');

      // Ensure the matched customer is in the list to display correctly in dropdown
      if (!customers.find(c => c.id === matchedCustomer.id)) {
        setCustomers(prev => [...prev, matchedCustomer].sort((a, b) => a.company_name.localeCompare(b.company_name)));
      }

      setFormData({ ...formData, customer_id: matchedCustomer.id });
      setMatchedCustomer(null);
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let leadId: string;

      if (editingLead) {
        // Update existing lead
        await leadsApi.update(editingLead.id, formData as LeadUpdate);

        // Update the customer record if there are changes from the Edit Lead tab
        if (formData.customer_id) {
          await customersApi.update(formData.customer_id, newCustomerForm as any);
        }

        leadId = editingLead.id;
      } else if (customerMode === 'existing') {
        // Create lead with existing customer
        const newLead = await leadsApi.create(formData as any);
        leadId = newLead.id;
      } else {
        // Create new customer + lead
        const newLead = await leadsApi.createWithCustomer(
          formData as any,
          newCustomerForm as CustomerInsert
        );
        leadId = newLead.id;
      }

      // Save requirements to lead_requirements table
      const reqsToSave: LeadRequirementInsert[] = requirements.map(r => ({
        lead_id: leadId,
        machine_type: r.machine_type,
        color_type: r.color_type,
        paper_size: r.paper_size,
        quantity: r.quantity,
        estimated_volume_black: r.estimated_volume_black,
        estimated_volume_color: r.estimated_volume_color,
        special_requirements: r.special_requirements || null
      }));
      await leadRequirementsApi.replaceForLead(leadId, reqsToSave);

      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('customers_tax_id_key') || err.details?.includes('customers_tax_id_key')) {
        alert('Error: A customer with this Tax ID already exists. Please switch to "Existing Customer" validation and search for them.');
      } else {
        alert(`Failed to save: ${err.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-500">Track and manage sales opportunities.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          New Lead
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-1 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search Leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFilterStart}
              onChange={e => setDateFilterStart(e.target.value)}
              className="w-[140px] text-sm"
              title="Start Date"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              value={dateFilterEnd}
              onChange={e => setDateFilterEnd(e.target.value)}
              className="w-[140px] text-sm"
              title="End Date"
            />
            {(dateFilterStart || dateFilterEnd) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setDateFilterStart(''); setDateFilterEnd(''); }}
                className="text-gray-500 hover:text-gray-700 h-9 px-2"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
          <TabsList>
            <TabsTrigger value="list"><ListIcon className="w-4 h-4 mr-2" /> List</TabsTrigger>
            <TabsTrigger value="kanban"><LayoutGrid className="w-4 h-4 mr-2" /> Kanban</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Sales Rep</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quotations</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenDialog(lead)}>
                    <TableCell className="font-medium">{lead.lead_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium truncate max-w-[150px]" title={(lead as any).customers?.company_name}>{(lead as any).customers?.company_name}</div>
                        {(lead as any).sites?.name && (
                          <div className="text-xs text-gray-500 flex items-center truncate max-w-[150px]"><MapPin className="w-3 h-3 mr-1 flex-shrink-0" /> {(lead as any).sites?.name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{getStatusLabel(lead.type)}</Badge></TableCell>
                    <TableCell className="text-sm">
                      {lead.machine_type} ({lead.color_type})
                    </TableCell>
                    <TableCell>{(lead as any).users?.name || '-'}</TableCell>
                    <TableCell><Badge className={getStatusColor(lead.status)}>{getStatusLabel(lead.status)}</Badge></TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const quotations = (lead as any).quotations || [];
                        const count = quotations.length;
                        if (count === 0) {
                          return <span className="text-gray-400 text-sm">—</span>;
                        }
                        const hasApproved = quotations.some((q: any) => ['approved', 'accepted'].includes(q.status));
                        const hasPending = quotations.some((q: any) => ['pending_approval', 'sent', 'draft'].includes(q.status));
                        let badgeColor = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                        if (hasApproved) badgeColor = 'bg-green-100 text-green-700 hover:bg-green-200';
                        else if (hasPending) badgeColor = 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';

                        if (count === 1) {
                          // Single quotation - direct link
                          return (
                            <Badge
                              className={`${badgeColor} cursor-pointer`}
                              onClick={() => navigate(`/quotations/${quotations[0].id}`)}
                              title={`${quotations[0].quote_number} (${quotations[0].status})`}
                            >
                              1 Quote
                            </Badge>
                          );
                        }

                        // Multiple quotations - show list as dropdown-like
                        return (
                          <div className="space-y-1">
                            {quotations.slice(0, 3).map((q: any) => (
                              <Badge
                                key={q.id}
                                className={`${badgeColor} cursor-pointer block text-xs`}
                                onClick={() => navigate(`/quotations/${q.id}`)}
                                title={`${q.quote_number} (${q.status})`}
                              >
                                {q.quote_number}
                              </Badge>
                            ))}
                            {count > 3 && (
                              <span className="text-xs text-gray-500">+{count - 3} more</span>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(lead.created_at || undefined)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {['new', 'quotation'].includes(lead.status) && (
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/quotations/new?lead=${lead.id}`); }} title="Create Quotation"><FileText className="w-4 h-4 text-blue-500" /></Button>
                        )}
                        {['won', 'po', 'contract'].includes(lead.status) && (
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/contracts`, { state: { createFromLead: lead } }); }} title="Create Contract">
                            <FileText className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STATUSES.map(status => {
            const statusLeads = filteredLeads.filter(l => l.status === status);
            return (
              <div key={status} className="min-w-[300px] w-[300px] bg-gray-50/50 rounded-lg p-3 border border-gray-100 flex flex-col h-full">
                <div className="flex justify-between items-center mb-3 px-1">
                  <h3 className="font-semibold text-gray-700 capitalize">{getStatusLabel(status)}</h3>
                  <Badge variant="secondary">{statusLeads.length}</Badge>
                </div>
                <div className="space-y-3">
                  {statusLeads.map(lead => (
                    <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenDialog(lead)}>
                      <CardHeader className="p-3 pb-0">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-mono text-gray-400">{lead.lead_number}</span>
                          <Badge variant="outline" className="text-[10px] px-1 h-5">{lead.type}</Badge>
                        </div>
                        <div className="font-medium text-sm pt-1 truncate" title={(lead as any).customers?.company_name}>{(lead as any).customers?.company_name}</div>
                      </CardHeader>
                      <CardContent className="p-3 pt-2 text-xs text-gray-600">
                        <p>{lead.machine_type} - {lead.estimated_volume_black?.toLocaleString()} pgs</p>
                        {/* Quotation Indicator */}
                        {(() => {
                          const quotations = (lead as any).quotations || [];
                          const count = quotations.length;
                          if (count === 0) return null;
                          const hasApproved = quotations.some((q: any) => ['approved', 'accepted'].includes(q.status));
                          const hasPending = quotations.some((q: any) => ['pending_approval', 'sent', 'draft'].includes(q.status));
                          let badgeColor = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                          if (hasApproved) badgeColor = 'bg-green-100 text-green-700 hover:bg-green-200';
                          else if (hasPending) badgeColor = 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
                          return (
                            <div
                              className="mt-2 flex items-center gap-1 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); navigate(`/quotations/${quotations[0].id}`); }}
                              title={quotations.map((q: any) => q.quote_number).join(', ')}
                            >
                              <FileText className="w-3 h-3" />
                              <Badge className={`${badgeColor} text-[10px] px-1 h-4`}>
                                {count} {count === 1 ? 'Quote' : 'Quotes'}
                              </Badge>
                            </div>
                          );
                        })()}
                        <div className="mt-2 flex justify-between items-center text-gray-400">
                          <span title="Created">{formatDate(lead.created_at || undefined)}</span>
                          <span title="Updated">{formatDate(lead.updated_at || undefined)}</span>
                        </div>
                        {['won', 'po', 'contract'].includes(lead.status) && (
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs h-7 border-green-200 text-green-700 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/contracts', { state: { createFromLead: lead } });
                              }}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              สร้างสัญญา
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLead ? 'Edit Lead' : 'Create New Lead'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveLead} className="space-y-5">

            {/* Section 1: Status */}
            <div className="rounded-lg border bg-white p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                <FileText className="w-4 h-4 text-blue-500" /> สถานะ Lead
              </h4>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 w-full md:max-w-[250px]">
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">สถานะ</Label>
                  <Select value={formData.status || 'new'} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="w-full font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map(s => (
                        <SelectItem key={s} value={s}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${s === 'won' ? 'bg-green-500' : s === 'lost' ? 'bg-red-500' : 'bg-blue-500'}`} />
                            {getStatusLabel(s)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingLead && (
                  <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-md border">
                    <div>
                      <span className="font-semibold block text-gray-700">สร้างเมื่อ:</span>
                      {formatDate((editingLead as any).created_at || undefined)}
                    </div>
                    <div className="hidden sm:block w-px bg-gray-200" />
                    <div>
                      <span className="font-semibold block text-gray-700">อัปเดตเมื่อ:</span>
                      {formatDate((editingLead as any).updated_at || undefined)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Mode Selection - Only for new leads */}
            {!editingLead && (
              <div className="rounded-lg border bg-white p-4 space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                  <Users className="w-4 h-4 text-green-500" /> ข้อมูลลูกค้า
                </h4>
                <RadioGroup
                  value={customerMode}
                  onValueChange={(v: 'existing' | 'new') => {
                    setCustomerMode(v);
                    setMatchedCustomer(null);
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new-customer" />
                    <Label htmlFor="new-customer" className="flex items-center gap-1 cursor-pointer">
                      <UserPlus className="w-4 h-4" /> New Customer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing-customer" />
                    <Label htmlFor="existing-customer" className="flex items-center gap-1 cursor-pointer">
                      <Users className="w-4 h-4" /> Existing Customer
                    </Label>
                  </div>
                </RadioGroup>

                {customerMode === 'new' ? (
                  <div className="space-y-4">
                    {/* Match Alert */}
                    {matchedCustomer && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="flex items-center justify-between">
                          <span className="text-yellow-800">
                            พบลูกค้า "<strong>{matchedCustomer.company_name}</strong>" ที่ตรงกัน
                          </span>
                          <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={handleUseExistingCustomer}>
                              Use Existing
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">ชื่อบริษัท <span className="text-red-500">*</span></Label>
                        <Input
                          required
                          value={newCustomerForm.company_name || ''}
                          onChange={e => setNewCustomerForm({ ...newCustomerForm, company_name: e.target.value })}
                          placeholder="ชื่อบริษัท"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">เลขประจำตัวผู้เสียภาษี</Label>
                        <Input
                          maxLength={13}
                          value={newCustomerForm.tax_id || ''}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                            setNewCustomerForm({ ...newCustomerForm, tax_id: val });
                          }}
                          placeholder="13 หลัก"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                        <Input
                          required
                          value={newCustomerForm.phone || ''}
                          onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                          placeholder="เบอร์โทรศัพท์"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">ชื่อผู้ติดต่อ</Label>
                        <Input
                          value={newCustomerForm.contact_person || ''}
                          onChange={e => setNewCustomerForm({ ...newCustomerForm, contact_person: e.target.value })}
                          placeholder="ชื่อผู้ติดต่อ"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">อีเมล</Label>
                        <Input
                          type="email"
                          value={newCustomerForm.email || ''}
                          onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                          placeholder="อีเมล"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">ที่อยู่</Label>
                        <Input
                          value={newCustomerForm.address || ''}
                          onChange={e => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                          placeholder="ที่อยู่"
                        />
                      </div>
                    </div>

                    {/* Project/Details Section inside new customer */}
                    <div className="rounded-lg border bg-gray-50/50 p-4 space-y-3 mt-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                        <Briefcase className="w-4 h-4 text-purple-500" /> รายละเอียดโครงการ
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">โครงการ (Project) <span className="text-red-500">*</span></Label>
                          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกโครงการ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="print_service">Double A Copy Point</SelectItem>
                              <SelectItem value="fast_print">Double A Fastprint</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">กลุ่มธุรกิจ/อุตสาหกรรม</Label>
                          <Select value={newCustomerForm.customer_type || 'education_university'} onValueChange={(v: any) => setNewCustomerForm({ ...newCustomerForm, customer_type: v })}>
                            <SelectTrigger><SelectValue placeholder="เลือกกลุ่มอุตสาหกรรม" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="education_university">สถานศึกษา - อุดมศึกษา (มหาวิทยาลัย)</SelectItem>
                              <SelectItem value="financial_institution">สถาบันการเงิน</SelectItem>
                              <SelectItem value="education_school">สถานศึกษา - โรงเรียน</SelectItem>
                              <SelectItem value="government">ราชการ</SelectItem>
                              <SelectItem value="private">เอกชน</SelectItem>
                              <SelectItem value="state_enterprise">รัฐวิสาหกิจ</SelectItem>
                              <SelectItem value="other_shop">ร้านอื่นๆ</SelectItem>
                              <SelectItem value="industrial_estate">นิคมอุตสาหกรรม</SelectItem>
                              <SelectItem value="copy_shop">ร้านถ่ายเอกสาร</SelectItem>
                              <SelectItem value="computer_shop">ร้านคอมพิวเตอร์</SelectItem>
                              <SelectItem value="hospital">โรงพยาบาล</SelectItem>
                              <SelectItem value="post_office">ร้านไปรษณีย์</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">ประเภทการขาย</Label>
                          <Select value={formData.customer_acquisition_type || 'existing_add'} onValueChange={(v: any) => setFormData({ ...formData, customer_acquisition_type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="existing_contract_renewal">ลูกค้าปัจจุบัน - ต่อสัญญา</SelectItem>
                              <SelectItem value="existing_add">ลูกค้าปัจจุบัน - เพิ่มเครื่อง</SelectItem>
                              <SelectItem value="existing_replace">ลูกค้าปัจจุบัน - เปลี่ยนเครื่อง</SelectItem>
                              <SelectItem value="existing_repeat_purchase">ลูกค้าปัจจุบัน - ซื้อซ้ำ</SelectItem>
                              <SelectItem value="new_customer">ลูกค้าใหม่</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">กำหนดยืนราคา</Label>
                          <Select value={String(formData.price_validity_days || 30)} onValueChange={(v) => setFormData({ ...formData, price_validity_days: Number(v) })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 วัน</SelectItem>
                              <SelectItem value="60">60 วัน</SelectItem>
                              <SelectItem value="90">90 วัน</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">พนักงานขาย</Label>
                          <Select value={formData.sales_id} onValueChange={v => setFormData({ ...formData, sales_id: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {salesUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lead_type">โครงการ (Project) <span className="text-red-500">*</span></Label>
                        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกโครงการ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="print_service">Double A Copy Point</SelectItem>
                            <SelectItem value="fast_print">Double A Fastprint</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
                      <Label>Site (Optional)</Label>
                      <Select value={formData.site_id || 'none'} onValueChange={v => setFormData({ ...formData, site_id: v === 'none' ? null : v })}>
                        <SelectTrigger><SelectValue placeholder="Select Site" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {sites.filter(s => !formData.customer_id || s.customer_id === formData.customer_id).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
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
                  </div>
                )}
              </div>
            )}

            {/* For editing - show existing customer */}
            {editingLead && (
              <div className="rounded-lg border bg-white p-4 space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                  <Users className="w-4 h-4 text-green-500" /> ข้อมูลลูกค้า
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">ลูกค้า</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={v => {
                        setFormData({ ...formData, customer_id: v });
                        // Also update the edit form with the new customer's info
                        const selected = customers.find(c => c.id === v);
                        if (selected) {
                          setNewCustomerForm({
                            company_name: selected.company_name,
                            tax_id: selected.tax_id || '',
                            phone: selected.phone || '',
                            contact_person: selected.contact_person || '',
                            email: selected.email || '',
                            address: selected.address || '',
                            customer_type: selected.customer_type || 'sme'
                          });
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                      <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">สถานที่ (ถ้ามี)</Label>
                    <Select value={formData.site_id || 'none'} onValueChange={v => setFormData({ ...formData, site_id: v === 'none' ? null : v })}>
                      <SelectTrigger><SelectValue placeholder="เลือกสถานที่" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">ไม่ระบุ</SelectItem>
                        {sites.filter(s => !formData.customer_id || s.customer_id === formData.customer_id).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Added: Allow editing Customer Data and Project form on existing leads */}
            {editingLead && formData.customer_id && (
              <div className="rounded-lg border bg-gray-50/50 p-4 space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                  <Briefcase className="w-4 h-4 text-purple-500" /> แก้ไขข้อมูลลูกค้า & โครงการ
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tax ID</Label>
                    <Input
                      maxLength={13}
                      value={newCustomerForm.tax_id || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                        setNewCustomerForm({ ...newCustomerForm, tax_id: val });
                      }}
                      placeholder="เลขประจำตัวผู้เสียภาษี (13 หลัก)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newCustomerForm.phone || ''}
                      onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input
                      value={newCustomerForm.contact_person || ''}
                      onChange={e => setNewCustomerForm({ ...newCustomerForm, contact_person: e.target.value })}
                      placeholder="ชื่อผู้ติดต่อ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newCustomerForm.email || ''}
                      onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                      placeholder="อีเมล"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={newCustomerForm.address || ''}
                      onChange={e => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                      placeholder="ที่อยู่"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>กลุ่มลูกค้า (Customer Group)</Label>
                    <Select value={newCustomerForm.customer_type || 'education_university'} onValueChange={(v: any) => setNewCustomerForm({ ...newCustomerForm, customer_type: v })}>
                      <SelectTrigger><SelectValue placeholder="เลือกกลุ่มลูกค้า" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="education_university">สถานศึกษา - อุดมศึกษา (มหาวิทยาลัย)</SelectItem>
                        <SelectItem value="financial_institution">สถาบันการเงิน</SelectItem>
                        <SelectItem value="education_school">สถานศึกษา - โรงเรียน</SelectItem>
                        <SelectItem value="government">ราชการ</SelectItem>
                        <SelectItem value="private">เอกชน</SelectItem>
                        <SelectItem value="state_enterprise">รัฐวิสาหกิจ</SelectItem>
                        <SelectItem value="other_shop">ร้านอื่นๆ</SelectItem>
                        <SelectItem value="industrial_estate">นิคมอุตสาหกรรม</SelectItem>
                        <SelectItem value="copy_shop">ร้านถ่ายเอกสาร</SelectItem>
                        <SelectItem value="computer_shop">ร้านคอมพิวเตอร์</SelectItem>
                        <SelectItem value="hospital">โรงพยาบาล</SelectItem>
                        <SelectItem value="post_office">ร้านไปรษณีย์</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">โครงการ (Project) <span className="text-red-500">*</span></Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกโครงการ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="print_service">Double A Copy Point</SelectItem>
                        <SelectItem value="fast_print">Double A Fastprint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">ประเภทลูกค้า</Label>
                    <Select value={formData.customer_acquisition_type || 'existing_add'} onValueChange={(v: any) => setFormData({ ...formData, customer_acquisition_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="existing_contract_renewal">ลูกค้าปัจจุบัน - ต่อสัญญา</SelectItem>
                        <SelectItem value="existing_add">ลูกค้าปัจจุบัน - เพิ่มเครื่อง</SelectItem>
                        <SelectItem value="existing_replace">ลูกค้าปัจจุบัน - เปลี่ยนเครื่อง</SelectItem>
                        <SelectItem value="existing_repeat_purchase">ลูกค้าปัจจุบัน - ซื้อซ้ำ</SelectItem>
                        <SelectItem value="new_customer">ลูกค้าใหม่</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">กำหนดยืนราคา</Label>
                    <Select value={String(formData.price_validity_days || 30)} onValueChange={(v) => setFormData({ ...formData, price_validity_days: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 วัน</SelectItem>
                        <SelectItem value="60">60 วัน</SelectItem>
                        <SelectItem value="90">90 วัน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">พนักงานขาย</Label>
                    <Select value={formData.sales_id} onValueChange={v => setFormData({ ...formData, sales_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {salesUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}



            <div className="rounded-lg border bg-white p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800">
                  <Printer className="w-4 h-4 text-orange-500" /> ความต้องการเครื่อง ({requirements.length})
                </h4>
                <Button type="button" variant="outline" size="sm" onClick={addRequirement} className="gap-1">
                  <Plus className="w-3 h-3" /> เพิ่มความต้องการ
                </Button>
              </div>

              {requirements.map((req, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white space-y-4 relative">
                  {/* Requirement Header with Delete */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Requirement #{index + 1}</span>
                    {requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Quantity + Machine Type + Color Type + Paper Size */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        min={1}
                        className="bg-gray-50"
                        value={req.quantity}
                        onChange={e => updateRequirement(index, 'quantity', Number(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Machine Type <span className="text-red-500">*</span></Label>
                      <Select value={req.machine_type} onValueChange={v => updateRequirement(index, 'machine_type', v)}>
                        <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MFP">Multifunction (MFP)</SelectItem>
                          <SelectItem value="Printer">Single Function</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color Type <span className="text-red-500">*</span></Label>
                      <Select value={req.color_type} onValueChange={v => updateRequirement(index, 'color_type', v)}>
                        <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Color">Color</SelectItem>
                          <SelectItem value="Mono">Mono</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Paper Size <span className="text-red-500">*</span></Label>
                      <Select value={req.paper_size} onValueChange={v => updateRequirement(index, 'paper_size', v)}>
                        <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A3">A3</SelectItem>
                          <SelectItem value="A4">A4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Volume + Special Requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Est. Volume Black</Label>
                      <Input
                        type="number"
                        className="bg-gray-50"
                        value={req.estimated_volume_black ?? ''}
                        onChange={e => updateRequirement(index, 'estimated_volume_black', e.target.value === '' ? null : Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Est. Volume Color</Label>
                      <Input
                        type="number"
                        className="bg-gray-50"
                        value={req.estimated_volume_color ?? ''}
                        onChange={e => updateRequirement(index, 'estimated_volume_color', e.target.value === '' ? null : Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Special Requirements</Label>
                      <Input
                        className="bg-gray-50"
                        value={req.special_requirements || ''}
                        onChange={e => updateRequirement(index, 'special_requirements', e.target.value)}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Existing Printer & Paper (kept at lead level) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-1">
                  <Label className="text-xs">Existing Printer</Label>
                  <Input
                    className="bg-white"
                    value={formData.past_brand || ''}
                    onChange={e => setFormData({ ...formData, past_brand: e.target.value })}
                    placeholder="e.g. Ricoh MP4054"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Existing Paper</Label>
                  <Input
                    className="bg-white"
                    value={formData.past_paper_type || ''}
                    onChange={e => setFormData({ ...formData, past_paper_type: e.target.value })}
                    placeholder="e.g. Double A 80gsm"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
              <Button type="submit">บันทึก</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog >
    </div >
  );
}
