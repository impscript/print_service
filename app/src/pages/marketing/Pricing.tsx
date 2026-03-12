import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pricingPackagesApi, productsApi, type PricingPackage, type Product } from '@/services/api/products';
import { calculatePricing, formatCurrency, type PricingCalculationResult } from '@/services/pricingService';
import { getStatusLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Calculator, DollarSign, Package, TrendingDown, Trash2, Plus } from 'lucide-react';

export function Pricing() {
  const { hasRole } = useAuth();
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculator State
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [volumeBlack, setVolumeBlack] = useState<number>(5000);
  const [volumeColor, setVolumeColor] = useState<number>(0);
  const [calculationResult, setCalculationResult] = useState<PricingCalculationResult | null>(null);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PricingPackage>>({
    pricing_type: 'actual_usage',
    waste_paper_discount: 2,
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const canManage = hasRole(['marketing', 'admin']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [packagesData, productsData] = await Promise.all([
        pricingPackagesApi.getAll(),
        productsApi.getAll()
      ]);
      setPackages(packagesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = () => {
    if (!selectedPackageId) return;
    const pkg = packages.find(p => p.id === selectedPackageId);
    if (!pkg) return;

    const result = calculatePricing({
      pricingPackage: pkg,
      volumeBlack,
      volumeColor,
    });
    setCalculationResult(result);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pkgName = formData.name || 'New Package';
      const payload = {
        ...formData,
        name: pkgName,
        pricing_type: formData.pricing_type || 'actual_usage',
        includes_paper: formData.pricing_type === 'package_paper',
      };

      // Remove joined `products` object from payload if present (from edit mode)
      delete (payload as any).products;
      delete (payload as any).id;

      if (editingId) {
        await pricingPackagesApi.update(editingId, payload as any);
      } else {
        await pricingPackagesApi.create(payload as any);
      }

      setIsDialogOpen(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Error saving package: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to potentially delete this package? (Soft delete)')) {
      try {
        // Soft delete logic usually
        // For now let's assume update is_active = false
        // But api/products.ts doesn't expose update for packages explicitly yet in my quick view?
        // Wait, productsApi has update for products. pricingPackagesApi doesn't have update/delete exposed in the snippet I saw?
        // I checked `api/products.ts` earlier. `pricingPackagesApi` only had getAll, getByType, getByProduct, getById.
        // I need to ADD create/update to `pricingPackagesApi`.
        // For now I will comment out the actual API call and add a TODO warning.
        alert("Delete feature not yet implemented in API service");
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  // Need to fix API service missing methods first? 
  // Yes, I should add create to pricingPackagesApi in api/products.ts.
  // I will assume for this file that I WILL update api/products.ts next.

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Packages</h1>
          <p className="text-gray-500">Manage pricing models and calculate costs.</p>
        </div>
        {canManage && (
          <Button onClick={() => {
            setFormData({ pricing_type: 'actual_usage', waste_paper_discount: 2, is_active: true });
            setEditingId(null);
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Package
          </Button>
        )}
      </div>

      {/* Calculator */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Pricing Calculator
          </CardTitle>
          <CardDescription>Estimate monthly costs based on volume.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Package</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Black Volume</Label>
              <Input
                type="number"
                className="bg-white"
                value={volumeBlack}
                onChange={(e) => setVolumeBlack(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Color Volume</Label>
              <Input
                type="number"
                className="bg-white"
                value={volumeColor}
                onChange={(e) => setVolumeColor(Number(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCalculate} className="w-full">
                Calculate
              </Button>
            </div>
          </div>

          {calculationResult && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-3">Calculation Result</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Base Fee</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculationResult.baseAmount)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Excess (Black)</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculationResult.excessAmountBlack)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Excess (Color)</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculationResult.excessAmountColor)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-600">Total</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(calculationResult.total)}</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  Waste Paper Discount {calculationResult.wastePaperDiscount}%
                  (Adjusted: {calculationResult.adjustedVolumeBlack.toLocaleString()} B / {calculationResult.adjustedVolumeColor.toLocaleString()} C)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package List */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages ({packages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
              ) : packages.map((pkg) => {
                // The API join returns products as 'products' property which is an object or array?
                // In api/products.ts: .select('*, products(brand, model, type)') -> returns logic is products: {brand...} object (single) because product_id is singular relation
                const product = (pkg as any).products;
                return (
                  <TableRow key={pkg.id} className="cursor-pointer hover:bg-gray-50" onClick={() => {
                    setFormData({
                      ...pkg,
                      product_id: pkg.product_id || '',
                    });
                    setEditingId(pkg.id);
                    setIsDialogOpen(true);
                  }}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>
                      {product ? (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          {product.brand} {product.model}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell><Badge variant="outline">{getStatusLabel(pkg.pricing_type)}</Badge></TableCell>
                    <TableCell className="text-sm">
                      {pkg.pricing_type === 'min_guarantee' && (
                        <>
                          <div>Min: {pkg.min_guarantee_volume?.toLocaleString()} pgs</div>
                          <div className="text-xs text-gray-500">Exc: {pkg.click_rate_black}B / {pkg.click_rate_color}C</div>
                        </>
                      )}
                      {pkg.pricing_type === 'rental_click' && (
                        <>
                          <div>Rental: {formatCurrency(pkg.base_monthly_fee || 0)}</div>
                          <div className="text-xs text-gray-500">Clk: {pkg.click_rate_black}B / {pkg.click_rate_color}C</div>
                        </>
                      )}
                      {(pkg.pricing_type === 'package_paper' || pkg.pricing_type === 'package_no_paper') && (
                        <>
                          <div>Fee: {formatCurrency(pkg.base_monthly_fee || 0)}</div>
                          <div className="text-xs text-gray-500">Free: {pkg.free_volume_black?.toLocaleString()}B</div>
                        </>
                      )}
                    </TableCell>
                    <TableCell>{pkg.waste_paper_discount}%</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {canManage && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Create'} Pricing Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePackage} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Starter Pack" />
              </div>
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={formData.product_id || ''} onValueChange={v => setFormData({ ...formData, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.brand} {p.model}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pricing Type</Label>
              <Select value={formData.pricing_type} onValueChange={(v: any) => setFormData({ ...formData, pricing_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actual_usage">คิดตามจริง</SelectItem>
                  <SelectItem value="rental">คิดค่าเช่า</SelectItem>
                  <SelectItem value="rental_click">ค่าเช่า + Click</SelectItem>
                  <SelectItem value="package_paper">เหมาจ่าย (รวมกระดาษ)</SelectItem>
                  <SelectItem value="package_no_paper">เหมาจ่าย (ไม่รวมกระดาษ)</SelectItem>
                  <SelectItem value="min_guarantee">ขั้นต่ำ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-gray-50 rounded border">
              <h4 className="font-medium mb-3 text-sm text-gray-700">Pricing Configuration</h4>

              {formData.pricing_type === 'actual_usage' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Click Rate Black</Label>
                    <Input type="number" required step="0.01" value={formData.click_rate_black ?? ''} onChange={e => setFormData({ ...formData, click_rate_black: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Click Rate Color</Label>
                    <Input type="number" step="0.01" value={formData.click_rate_color ?? ''} onChange={e => setFormData({ ...formData, click_rate_color: Number(e.target.value) })} />
                  </div>
                </div>
              )}

              {formData.pricing_type === 'rental' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Rental Fee</Label>
                    <Input type="number" required value={formData.base_monthly_fee ?? ''} onChange={e => setFormData({ ...formData, base_monthly_fee: Number(e.target.value) })} />
                  </div>
                </div>
              )}

              {formData.pricing_type === 'min_guarantee' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min. Volume (Pages)</Label>
                    <Input type="number" required value={formData.min_guarantee_volume ?? ''} onChange={e => setFormData({ ...formData, min_guarantee_volume: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Min. Price (THB)</Label>
                    <Input type="number" required value={formData.min_guarantee_price ?? ''} onChange={e => setFormData({ ...formData, min_guarantee_price: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Click Rate Black</Label>
                    <Input type="number" required step="0.01" value={formData.click_rate_black ?? ''} onChange={e => setFormData({ ...formData, click_rate_black: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Click Rate Color</Label>
                    <Input type="number" step="0.01" value={formData.click_rate_color ?? ''} onChange={e => setFormData({ ...formData, click_rate_color: Number(e.target.value) })} />
                  </div>
                </div>
              )}

              {formData.pricing_type === 'rental_click' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Rental Fee</Label>
                    <Input type="number" required value={formData.base_monthly_fee ?? ''} onChange={e => setFormData({ ...formData, base_monthly_fee: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2 col-span-1"></div>
                  <div className="space-y-2">
                    <Label>Click Rate Black</Label>
                    <Input type="number" required step="0.01" value={formData.click_rate_black ?? ''} onChange={e => setFormData({ ...formData, click_rate_black: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Click Rate Color</Label>
                    <Input type="number" step="0.01" value={formData.click_rate_color ?? ''} onChange={e => setFormData({ ...formData, click_rate_color: Number(e.target.value) })} />
                  </div>
                </div>
              )}

              {(formData.pricing_type === 'package_paper' || formData.pricing_type === 'package_no_paper') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Package Fee</Label>
                    <Input type="number" required value={formData.base_monthly_fee ?? ''} onChange={e => setFormData({ ...formData, base_monthly_fee: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Free Volume Black</Label>
                    <Input type="number" value={formData.free_volume_black ?? ''} onChange={e => setFormData({ ...formData, free_volume_black: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Free Volume Color</Label>
                    <Input type="number" value={formData.free_volume_color ?? ''} onChange={e => setFormData({ ...formData, free_volume_color: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Excess Rate Black</Label>
                    <Input type="number" step="0.01" value={formData.excess_rate_black ?? ''} onChange={e => setFormData({ ...formData, excess_rate_black: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Excess Rate Color</Label>
                    <Input type="number" step="0.01" value={formData.excess_rate_color ?? ''} onChange={e => setFormData({ ...formData, excess_rate_color: Number(e.target.value) })} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Waste Paper Discount (%)</Label>
              <Input type="number" value={formData.waste_paper_discount ?? ''} onChange={e => setFormData({ ...formData, waste_paper_discount: Number(e.target.value) })} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingId(null); }}>ยกเลิก</Button>
              <Button type="submit">{editingId ? 'บันทึก' : 'สร้าง Package'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
