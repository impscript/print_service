import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  sitesApi,
  customersApi,
  type Site,
  type SiteInsert,
  type SiteUpdate,
  type Customer
} from '@/services/api/customers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, MapPin, Building, Phone } from 'lucide-react';

export function Sites() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerFilterId = searchParams.get('customer');

  const [sites, setSites] = useState<Site[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>(customerFilterId || 'all');

  // Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [siteForm, setSiteForm] = useState<Partial<SiteInsert>>({});

  useEffect(() => {
    fetchData();
  }, []);

  // Sync URL param with state if needed, or just allow state to drive
  useEffect(() => {
    if (selectedCustomer !== 'all') {
      setSearchParams({ customer: selectedCustomer });
    } else {
      setSearchParams({});
    }
  }, [selectedCustomer, setSearchParams]);

  const fetchData = async () => {
    try {
      const [sitesData, customersData] = await Promise.all([
        sitesApi.getAll(),
        customersApi.getAll()
      ]);
      setSites(sitesData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOpenDialog = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setSiteForm({
        name: site.name,
        address: site.address,
        customer_id: site.customer_id,
        contact_person: site.contact_person,
        phone: site.phone
      });
    } else {
      setEditingSite(null);
      setSiteForm({
        name: '',
        address: '',
        customer_id: selectedCustomer !== 'all' ? selectedCustomer : '',
        contact_person: '',
        phone: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSite) {
        await sitesApi.update(editingSite.id, siteForm as SiteUpdate);
      } else {
        await sitesApi.create(siteForm as SiteInsert);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSites = sites.filter(site => {
    const customerName = (site as any).customers?.company_name || '';
    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = selectedCustomer === 'all' || site.customer_id === selectedCustomer;
    return matchesSearch && matchesCustomer;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-500">Manage all installation sites.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Site
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.company_name}
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
                <TableHead>Site Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map(site => (
                <TableRow key={site.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenDialog(site)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{site.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{(site as any).customers?.company_name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-gray-500 text-sm">{site.address}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{site.contact_person}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {site.phone}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Site Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSite ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSite} className="space-y-5">
            {/* Section 1: Location Info */}
            <div className="rounded-lg border bg-white p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                <MapPin className="w-4 h-4 text-blue-500" /> ข้อมูลสถานที่
              </h4>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">ลูกค้า <span className="text-red-500">*</span></Label>
                <Select value={siteForm.customer_id} onValueChange={v => setSiteForm({ ...siteForm, customer_id: v })} disabled={!!editingSite}>
                  <SelectTrigger><SelectValue placeholder="เลือกลูกค้า" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">ชื่อสถานที่ <span className="text-red-500">*</span></Label>
                <Input required placeholder="เช่น สำนักงานใหญ่, โรงงาน 1" value={siteForm.name || ''} onChange={e => setSiteForm({ ...siteForm, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">ที่อยู่ <span className="text-red-500">*</span></Label>
                <Input required value={siteForm.address || ''} onChange={e => setSiteForm({ ...siteForm, address: e.target.value })} placeholder="ที่อยู่สถานที่" />
              </div>
            </div>

            {/* Section 2: Contact Info */}
            <div className="rounded-lg border bg-white p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                <Phone className="w-4 h-4 text-green-500" /> ผู้ติดต่อประจำสถานที่
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">ชื่อผู้ติดต่อ</Label>
                  <Input value={siteForm.contact_person || ''} onChange={e => setSiteForm({ ...siteForm, contact_person: e.target.value })} placeholder="ชื่อผู้ติดต่อ" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">เบอร์โทรศัพท์</Label>
                  <Input value={siteForm.phone || ''} onChange={e => setSiteForm({ ...siteForm, phone: e.target.value })} placeholder="เบอร์โทรศัพท์" />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
              <Button type="submit">บันทึก</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
