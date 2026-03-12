import { useState, useEffect } from 'react';
import {
  customersApi,
  sitesApi,
  type Customer,
  type CustomerInsert,
  type CustomerUpdate,
  type Site,
  type SiteInsert,
  type SiteUpdate
} from '@/services/api/customers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from '@/components/ui/label';
import { Plus, Search, MapPin, Building, Edit, User } from 'lucide-react';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog State (Customer Details/Edit)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Site Dialog State
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [currentSites, setCurrentSites] = useState<Site[]>([]);

  // Forms
  const [customerForm, setCustomerForm] = useState<Partial<CustomerInsert>>({});
  const [siteForm, setSiteForm] = useState<Partial<SiteInsert>>({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getWithSites();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleOpenCustomerDialog = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setCustomerForm({
        company_name: customer.company_name,
        tax_id: customer.tax_id,
        contact_person: customer.contact_person,
        phone: customer.phone,
        email: customer.email,
        payment_terms: customer.payment_terms,
        address: customer.address,
        customer_type: customer.customer_type
      });
      // Load sites for this customer (although we fetched with sites, it's safer to use local list if we edit)
      // The API getWithSites returns sites property.
      setCurrentSites((customer as any).sites || []);
    } else {
      setSelectedCustomer(null);
      setCustomerForm({
        company_name: '',
        tax_id: '',
        contact_person: '',
        phone: '',
        email: '',
        payment_terms: 'Credit 30 Days',
        address: '',
        customer_type: 'private'
      });
      setCurrentSites([]);
    }
    setIsCustomerDialogOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCustomer) {
        await customersApi.update(selectedCustomer.id, customerForm as CustomerUpdate);
      } else {
        await customersApi.create(customerForm as CustomerInsert);
      }
      setIsCustomerDialogOpen(false);
      fetchCustomers();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save customer: ${err.message || 'Unknown error'}`);
    }
  };

  const handleOpenSiteDialog = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setSiteForm({
        name: site.name,
        address: site.address,
        contact_person: site.contact_person,
        phone: site.phone
      });
    } else {
      setEditingSite(null);
      setSiteForm({
        name: '',
        address: '',
        contact_person: selectedCustomer?.contact_person || '',
        phone: selectedCustomer?.phone || ''
      });
    }
    setIsSiteDialogOpen(true);
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      if (editingSite) {
        await sitesApi.update(editingSite.id, siteForm as SiteUpdate);
      } else {
        await sitesApi.create({
          ...siteForm,
          customer_id: selectedCustomer.id
        } as SiteInsert);
      }
      setIsSiteDialogOpen(false);
      // Refresh sites list only? or full fetch?
      // Let's refresh full for simplicity
      fetchCustomers(); // Does not update 'currentSites' immediately if we don't re-select

      // Manual update of currentSites
      const updatedSites = await sitesApi.getByCustomer(selectedCustomer.id);
      setCurrentSites(updatedSites);

    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.tax_id || '').includes(searchTerm) ||
    (c.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage customers and sites.</p>
        </div>
        <Button onClick={() => handleOpenCustomerDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search Company, Tax ID, Contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Tax ID</TableHead>
                <TableHead>Sites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map(customer => (
                <TableRow key={customer.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenCustomerDialog(customer)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{customer.company_name}</p>
                        <p className="text-xs text-gray-500 max-w-[200px] truncate">{customer.address}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.contact_person}</p>
                      <p className="text-xs text-gray-500">{customer.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{customer.tax_id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {(customer as any).sites?.length || 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Dialog (Replaces Sheet) */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'New Customer'}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General Info</TabsTrigger>
                <TabsTrigger value="sites" disabled={!selectedCustomer}>Sites</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <form id="customer-form" onSubmit={handleSaveCustomer} className="space-y-5">
                  {/* Section 1: Company Info */}
                  <div className="rounded-lg border bg-white p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                      <Building className="w-4 h-4 text-blue-500" /> ข้อมูลบริษัท
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">ชื่อบริษัท <span className="text-red-500">*</span></Label>
                        <Input required value={customerForm.company_name || ''} onChange={e => setCustomerForm({ ...customerForm, company_name: e.target.value })} placeholder="ชื่อบริษัท" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">เลขประจำตัวผู้เสียภาษี</Label>
                        <Input value={customerForm.tax_id || ''} onChange={e => setCustomerForm({ ...customerForm, tax_id: e.target.value })} placeholder="เลข 13 หลัก" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">กลุ่มธุรกิจ/อุตสาหกรรม</Label>
                      <Select value={customerForm.customer_type || 'private'} onValueChange={(v: any) => setCustomerForm({ ...customerForm, customer_type: v })}>
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
                      <Label className="text-xs font-medium text-gray-600">เงื่อนไขการชำระเงิน</Label>
                      <Input value={customerForm.payment_terms || ''} onChange={e => setCustomerForm({ ...customerForm, payment_terms: e.target.value })} placeholder="เช่น Credit 30 Days" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">ที่อยู่</Label>
                      <Input value={customerForm.address || ''} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} placeholder="ที่อยู่บริษัท" />
                    </div>
                  </div>

                  {/* Section 2: Contact Info */}
                  <div className="rounded-lg border bg-white p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                      <User className="w-4 h-4 text-green-500" /> ข้อมูลผู้ติดต่อ
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">ชื่อผู้ติดต่อ <span className="text-red-500">*</span></Label>
                        <Input required value={customerForm.contact_person || ''} onChange={e => setCustomerForm({ ...customerForm, contact_person: e.target.value })} placeholder="ชื่อผู้ติดต่อ" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-600">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                        <Input required value={customerForm.phone || ''} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="เบอร์โทรศัพท์" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">อีเมล</Label>
                      <Input type="email" value={customerForm.email || ''} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} placeholder="example@company.com" />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>ยกเลิก</Button>
                    <Button type="submit">บันทึก</Button>
                  </DialogFooter>
                </form>
              </TabsContent>

              <TabsContent value="sites" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Sites List</h3>
                  <Button size="sm" type="button" onClick={() => handleOpenSiteDialog()}><Plus className="w-4 h-4 mr-2" /> Add Site</Button>
                </div>
                <div className="space-y-2">
                  {currentSites.map(site => (
                    <div key={site.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          {site.name}
                        </p>
                        <p className="text-xs text-gray-500">{site.address}</p>
                      </div>
                      <Button variant="ghost" size="icon" type="button" onClick={() => handleOpenSiteDialog(site)}>
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  ))}
                  {currentSites.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No sites found.</p>}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Site Dialog */}
      <Dialog open={isSiteDialogOpen} onOpenChange={setIsSiteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSite ? 'Edit Site' : 'Add New Site'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSite} className="space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input required placeholder="e.g. Head Office, Factory 1" value={siteForm.name || ''} onChange={e => setSiteForm({ ...siteForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input required value={siteForm.address || ''} onChange={e => setSiteForm({ ...siteForm, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input value={siteForm.contact_person || ''} onChange={e => setSiteForm({ ...siteForm, contact_person: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={siteForm.phone || ''} onChange={e => setSiteForm({ ...siteForm, phone: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSiteDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Site</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
