import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  jobsApi,
  type Job
} from '@/services/api/jobs';
import { customersApi, sitesApi } from '@/services/api/customers'; // leads.ts or customers.ts
import { usersApi } from '@/services/api/users';
// import { productsApi } from '@/services/api/products'; 
// import { inventoryItemsApi as machinesApi } from '@/services/api/products'; 

import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Plus, Search, MoreVertical, Wrench, User, Edit, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

export function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  // const [loading, setLoading] = useState(true);

  // Master Data
  const [customers, setCustomers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  // const [machines, setMachines] = useState<any[]>([]); 

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<Partial<any>>({
    customer_id: '',
    site_id: '',
    machine_id: '',
    assigned_to: '',
    type: 'maintenance',
    priority: 'normal',
    status: 'pending',
    description: '',
    scheduled_date: '',
    job_number: ''
  });

  const statusOptions = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
  const typeOptions = ['installation', 'maintenance', 'repair', 'pickup', 'meter_reading', 'delivery'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, customersData, sitesData, techData] = await Promise.all([
        jobsApi.getAll(),
        customersApi.getAll(),
        sitesApi.getAll(),
        usersApi.getByRole('technician') 
      ]);
      setJobs(jobsData);
      setCustomers(customersData);
      setSites(sitesData);
      setTechnicians(techData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Helper to fetch machines for site
  // const fetchMachinesForSite = async (siteId: string) => {
  // };

  const handleOpenDialog = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        customer_id: job.customer_id,
        site_id: job.site_id,
        machine_id: job.machine_id,
        assigned_to: job.assigned_to,
        type: job.type,
        priority: job.priority,
        status: job.status,
        description: job.description,
        scheduled_date: job.scheduled_date ? job.scheduled_date.split('T')[0] : '', // simplistic date handling
      });
    } else {
      setEditingJob(null);
      setFormData({
        customer_id: '',
        site_id: '',
        machine_id: '',
        assigned_to: '',
        type: 'maintenance',
        priority: 'normal',
        status: 'pending',
        description: '',
        scheduled_date: new Date().toISOString().split('T')[0], // Today
        created_by: user?.id
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.site_id === '') payload.site_id = null;
      if (payload.machine_id === '') payload.machine_id = null;
      if (payload.assigned_to === '') payload.assigned_to = null; // Unassigned

      if (editingJob) {
        await jobsApi.update(editingJob.id, payload);
      } else {
        await jobsApi.create({
          description: payload.description || '',
          type: payload.type || 'maintenance',
          status: payload.status || 'pending',
          priority: payload.priority || 'normal',
          customer_id: payload.customer_id,
          site_id: payload.site_id,
          machine_id: payload.machine_id,
          assigned_to: payload.assigned_to,
          scheduled_date: payload.scheduled_date,
          created_by: user?.id || 'system'
        });
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const customerName = (job as any).customers?.company_name || '';
    const jobNumber = job.job_number || '';
    const matchesSearch =
      jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-500">Service schedules and technician dispatch.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search Job #, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
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
                <TableHead>Job #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer / Site</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-bold">{job.job_number}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{job.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{job.type.replace('_', ' ')}</Badge></TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{(job as any).customers?.company_name}</div>
                      {(job as any).sites && (
                        <div className="text-xs text-gray-400 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {(job as any).sites.name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(job as any).users?.name ? (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        {(job as any).users.name}
                      </div>
                    ) : <Badge variant="secondary">Unassigned</Badge>}
                  </TableCell>
                  <TableCell>
                    {job.scheduled_date ? formatDate(job.scheduled_date) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>{getStatusLabel(job.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(job)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit / Assign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingJob ? 'Edit Job' : 'Create Job'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
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
              <Label>Site</Label>
              <Select value={formData.site_id || 'none'} onValueChange={v => setFormData({ ...formData, site_id: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select Site (Optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {sites.filter(s => s.customer_id === formData.customer_id).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['low', 'normal', 'high', 'urgent'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-2">Assignment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Technician</Label>
                  <Select value={formData.assigned_to || 'none'} onValueChange={v => setFormData({ ...formData, assigned_to: v === 'none' ? '' : v, status: v !== 'none' && formData.status === 'pending' ? 'assigned' : formData.status })}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Schedule Date</Label>
                  <Input type="date" value={formData.scheduled_date || ''} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Job</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
