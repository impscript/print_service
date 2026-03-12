import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  machinesApi,
  inventoryItemsApi,
  productsApi,
  type Machine,
  type MachineInsert,
  type InventoryItem,
  type InventoryItemInsert,
  type Product
} from '@/services/api/products';
import { getStatusColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Printer, Package, Search, AlertTriangle, Plus, PenSquare, MoreVertical, QrCode } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { QRCodeSVG } from 'qrcode.react';

// Enums manually for now or import from Types
const MACHINE_STATUSES = ['In Stock', 'Installed', 'Maintenance', 'Reserved', 'Repairing', 'Retired'];
const CONDITIONS = ['New', 'Used'];
const CATEGORIES = ['Toner', 'Drum', 'Developer', 'Spare Part', 'Consumable'];

export function Inventory() {
  const { hasRole } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [parts, setParts] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog States
  const [isMachineDialogOpen, setIsMachineDialogOpen] = useState(false);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [isPrintQRDialogOpen, setIsPrintQRDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [printingMachine, setPrintingMachine] = useState<Machine | null>(null);

  // Forms
  const [machineForm, setMachineForm] = useState<Partial<MachineInsert>>({
    condition: 'New',
    status: 'In Stock',
    current_counter_mono: 0,
    current_counter_color: 0
  });

  const [partForm, setPartForm] = useState<Partial<InventoryItemInsert>>({
    category: 'Toner',
    min_stock: 5,
    quantity: 0
  });

  const canManage = hasRole(['planner', 'admin']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [machinesData, partsData, productsData] = await Promise.all([
        machinesApi.getAll(),
        inventoryItemsApi.getAll(),
        productsApi.getAll()
      ]);
      setMachines(machinesData);
      setParts(partsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleCreateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!machineForm.product_id || !machineForm.serial_number) return;

      await machinesApi.create(machineForm as MachineInsert);
      setIsMachineDialogOpen(false);
      fetchData();
      setMachineForm({ condition: 'New', status: 'In Stock', current_counter_mono: 0, current_counter_color: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingMachine) return;
      // Only update editable fields
      await machinesApi.update(editingMachine.id, {
        status: machineForm.status,
        condition: machineForm.condition,
        notes: machineForm.notes
      } as any);
      setIsMachineDialogOpen(false);
      setEditingMachine(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryItemsApi.create(partForm as InventoryItemInsert);
      setIsPartDialogOpen(false);
      fetchData();
      setPartForm({ category: 'Toner', min_stock: 5, quantity: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  /*   const filteredMachines = machines.filter(machine => {
      const product = (machine as any).products; // joined data
      const matchesSearch = 
        machine.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.model?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
      return matchesSearch && matchesStatus;
    }); */
  const filteredMachines = machines.filter(machine => {
    const product = (machine as any).products; // joined data
    const matchesSearch =
      machine.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product?.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product?.model && product.model.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredParts = parts.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const machineStats = {
    total: machines.length,
    inStockNew: machines.filter(m => m.status === 'In Stock' && m.condition === 'New').length,
    inStockUsed: machines.filter(m => m.status === 'In Stock' && m.condition === 'Used').length,
    installed: machines.filter(m => m.status === 'Installed').length,
    maintenance: machines.filter(m => m.status === 'Maintenance' || m.status === 'Repairing').length,
    reserved: machines.filter(m => m.status === 'Reserved').length,
  };

  const lowStockItems = parts.filter(item => item.quantity <= item.min_stock);

  const openEditMachine = (m: Machine) => {
    setEditingMachine(m);
    setMachineForm({
      status: m.status,
      condition: m.condition,
      notes: m.notes || ''
      // serial, product etc uneditable easily
    });
    setIsMachineDialogOpen(true);
  };

  const openNewMachine = () => {
    setEditingMachine(null);
    setMachineForm({ condition: 'New', status: 'In Stock', current_counter_mono: 0, current_counter_color: 0 });
    setIsMachineDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">Track machines and spare parts.</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPartDialogOpen(true)}>
              <Package className="w-4 h-4 mr-2" /> Add Part
            </Button>
            <Button onClick={openNewMachine}>
              <Plus className="w-4 h-4 mr-2" /> Add Machine
            </Button>
          </div>
        )}
      </div>

      {/* Machine Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* ... Reuse similar layout but with real numbers ... */}
        <Card className="bg-blue-50 border-blue-200"><CardContent className="p-4"><p className="text-xs text-blue-600">Total</p><p className="text-2xl font-bold text-blue-800">{machineStats.total}</p></CardContent></Card>
        <Card className="bg-green-50 border-green-200"><CardContent className="p-4"><p className="text-xs text-green-600">Stock (New)</p><p className="text-2xl font-bold text-green-800">{machineStats.inStockNew}</p></CardContent></Card>
        <Card className="bg-yellow-50 border-yellow-200"><CardContent className="p-4"><p className="text-xs text-yellow-600">Stock (Used)</p><p className="text-2xl font-bold text-yellow-800">{machineStats.inStockUsed}</p></CardContent></Card>
        <Card className="bg-purple-50 border-purple-200"><CardContent className="p-4"><p className="text-xs text-purple-600">Installed</p><p className="text-2xl font-bold text-purple-800">{machineStats.installed}</p></CardContent></Card>
        <Card className="bg-orange-50 border-orange-200"><CardContent className="p-4"><p className="text-xs text-orange-600">Maintenance</p><p className="text-2xl font-bold text-orange-800">{machineStats.maintenance}</p></CardContent></Card>
        <Card className="bg-indigo-50 border-indigo-200"><CardContent className="p-4"><p className="text-xs text-indigo-600">Reserved</p><p className="text-2xl font-bold text-indigo-800">{machineStats.reserved}</p></CardContent></Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert ({lowStockItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-gray-500">({item.sku})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={(item.quantity / item.min_stock) * 100} className="h-2" />
                    </div>
                    <Badge variant="destructive">{item.quantity} / {item.min_stock}</Badge>
                  </div>
                </div>
              ))}
              {lowStockItems.length > 5 && <p className="text-center text-xs text-red-600">and {lowStockItems.length - 5} more...</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="machines">
        <TabsList>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="parts">Parts & Consumables</TabsTrigger>
        </TabsList>

        <TabsContent value="machines">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <CardTitle className="text-lg">Machine List ({filteredMachines.length})</CardTitle>
                <div className="flex gap-2 ml-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search S/N, Model..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {MACHINE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S/N</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Meter Readings (Current)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMachines.map(machine => {
                    const product = (machine as any).products;
                    return (
                      <TableRow key={machine.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openEditMachine(machine)}>
                        <TableCell className="font-medium">{machine.serial_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Printer className="w-4 h-4 text-gray-400" />
                            <span>{product?.brand} {product?.model}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{machine.condition}</Badge></TableCell>
                        <TableCell><Badge className={getStatusColor(machine.status)}>{machine.status}</Badge></TableCell>
                        <TableCell className="text-sm">
                          <div>B: {machine.current_counter_mono?.toLocaleString() || 0}</div>
                          <div className="text-gray-500">C: {machine.current_counter_color?.toLocaleString() || 0}</div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {canManage && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditMachine(machine)}>
                                  <PenSquare className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setPrintingMachine(machine); setIsPrintQRDialogOpen(true); }}>
                                  <QrCode className="w-4 h-4 mr-2" /> Print QR
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts">
          <Card>
            <CardHeader>
              <CardTitle>Parts Inventory ({filteredParts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Min. Stock</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku || '-'}</TableCell>
                      <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={item.quantity <= item.min_stock ? 'text-red-600 font-bold' : ''}>{item.quantity}</span>
                          {item.quantity <= item.min_stock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{item.min_stock}</TableCell>
                      <TableCell>{item.location || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isMachineDialogOpen} onOpenChange={setIsMachineDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingMachine ? 'แก้ไขสถานะเครื่อง' : 'เพิ่มเครื่องใหม่'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingMachine ? handleUpdateMachine : handleCreateMachine} className="space-y-5">
            {/* Section 1: Machine Info */}
            {!editingMachine && (
              <div className="rounded-lg border bg-white p-4 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                  <Printer className="w-4 h-4 text-blue-500" /> ข้อมูลเครื่อง
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">รุ่นเครื่อง <span className="text-red-500">*</span></Label>
                    <Select required value={machineForm.product_id} onValueChange={v => setMachineForm({ ...machineForm, product_id: v })}>
                      <SelectTrigger><SelectValue placeholder="เลือกรุ่นเครื่อง" /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.brand} {p.model}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">หมายเลขเครื่อง (S/N) <span className="text-red-500">*</span></Label>
                    <Input required value={machineForm.serial_number || ''} onChange={e => setMachineForm({ ...machineForm, serial_number: e.target.value.toUpperCase() })} placeholder="ABCD12345" />
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Status & Condition */}
            <div className="rounded-lg border bg-white p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                <Package className="w-4 h-4 text-green-500" /> สถานะเครื่อง
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">สถานะ</Label>
                  <Select value={machineForm.status} onValueChange={(v: any) => setMachineForm({ ...machineForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MACHINE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">สภาพเครื่อง</Label>
                  <Select value={machineForm.condition} onValueChange={(v: any) => setMachineForm({ ...machineForm, condition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">หมายเหตุ</Label>
                <Input value={machineForm.notes || ''} onChange={e => setMachineForm({ ...machineForm, notes: e.target.value })} placeholder="หมายเหตุเพิ่มเติม" />
              </div>
            </div>

            {/* Section 3: Counters */}
            {!editingMachine && (
              <div className="rounded-lg border bg-white p-4 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-800 border-b pb-2">
                  <QrCode className="w-4 h-4 text-purple-500" /> มิเตอร์เริ่มต้น
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">มิเตอร์ขาวดำ</Label>
                    <Input type="number" value={machineForm.current_counter_mono ?? 0} onChange={e => setMachineForm({ ...machineForm, current_counter_mono: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">มิเตอร์สี</Label>
                    <Input type="number" value={machineForm.current_counter_color ?? 0} onChange={e => setMachineForm({ ...machineForm, current_counter_color: parseInt(e.target.value) })} />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMachineDialogOpen(false)}>ยกเลิก</Button>
              <Button type="submit">บันทึก</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Print QR Dialog */}
      <Dialog open={isPrintQRDialogOpen} onOpenChange={setIsPrintQRDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">Print Machine QR Label</DialogTitle>
          </DialogHeader>
          {printingMachine && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div
                id="qr-svg-wrapper"
                className="bg-white p-6 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center"
              >
                <QRCodeSVG
                  value={printingMachine.serial_number}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold font-mono">{printingMachine.serial_number}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {((printingMachine as any).products?.brand || '') + ' ' + ((printingMachine as any).products?.model || '')}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex w-full sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setIsPrintQRDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const printWindow = window.open('', '_blank');
              if (printWindow && printingMachine) {
                const product = (printingMachine as any).products;
                const modelName = product ? `${product.brand} ${product.model}` : '';
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Print QR Label</title>
                      <style>
                        body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
                        .label { text-align: center; padding: 20px; border: 2px solid #ccc; border-radius: 12px; }
                        svg { width: 200px; height: 200px; display: block; margin: 0 auto; }
                        .sn { font-size: 24px; font-weight: bold; margin-top: 16px; font-family: monospace; }
                        .model { font-size: 14px; color: #666; margin-top: 4px; }
                        @media print {
                          body { height: auto; display: block; padding: 20px; }
                          .label { border: none; padding: 0; text-align: center; }
                        }
                      </style>
                    </head>
                    <body>
                      <div class="label">
                        ${document.getElementById('qr-svg-wrapper')?.innerHTML || ''}
                        <div class="sn">${printingMachine.serial_number}</div>
                        <div class="model">${modelName}</div>
                      </div>
                      <script>
                        window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 200); }
                      </script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }
            }}>
              <Printer className="w-4 h-4 mr-2" /> Print Label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Part Dialog */}
      <Dialog open={isPartDialogOpen} onOpenChange={setIsPartDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Part</DialogTitle></DialogHeader>
          <form onSubmit={handleCreatePart} className="space-y-4">
            <div className="space-y-2">
              <Label>Part Name</Label>
              <Input required value={partForm.name || ''} onChange={e => setPartForm({ ...partForm, name: e.target.value })} placeholder="e.g. Black Toner TK-123" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={partForm.sku || ''} onChange={e => setPartForm({ ...partForm, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={partForm.category} onValueChange={v => setPartForm({ ...partForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={partForm.quantity || 0} onChange={e => setPartForm({ ...partForm, quantity: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Min. Stock</Label>
                <Input type="number" value={partForm.min_stock || 0} onChange={e => setPartForm({ ...partForm, min_stock: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={partForm.location || ''} onChange={e => setPartForm({ ...partForm, location: e.target.value })} placeholder="Shelf A1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPartDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Add Part</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
