import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productsApi, type Product, type ProductInsert } from '@/services/api/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Printer } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Enums from database
const BRANDS = ['Kyocera', 'Lexmark', 'Canon', 'HP', 'Epson', 'Ricoh', 'Other'];
const MACHINE_TYPES = ['Printer', 'MFP'];
const PAPER_SIZES = ['A4', 'A3'];
const COLOR_TYPES = ['Color', 'Mono'];

export function Products() {
    const { hasRole } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<ProductInsert>>({
        brand: 'Kyocera',
        model: '',
        type: 'MFP',
        paper_size: 'A4',
        color_type: 'Color',
        speed_ppm: 20,
        description: '',
        image_url: '',
        is_active: true,
    });

    const canManage = hasRole(['marketing', 'admin']);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productsApi.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                brand: product.brand,
                model: product.model,
                type: product.type,
                paper_size: product.paper_size,
                color_type: product.color_type,
                speed_ppm: product.speed_ppm || 0,
                description: product.description || '',
                image_url: product.image_url || '',
                is_active: product.is_active,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                brand: 'Kyocera',
                model: '',
                type: 'MFP',
                paper_size: 'A4',
                color_type: 'Color',
                speed_ppm: 20,
                description: '',
                image_url: '',
                is_active: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await productsApi.update(editingProduct.id, formData);
            } else {
                await productsApi.create(formData as ProductInsert);
            }
            setIsDialogOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                // Soft delete by setting is_active to false
                await productsApi.update(id, { is_active: false });
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products (Printer Models)</h1>
                    <p className="text-gray-500">Manage printer models and specifications.</p>
                </div>
                {canManage && (
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search brand or model..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Brand / Model</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Specs</TableHead>
                            <TableHead>Speed</TableHead>
                            <TableHead>Status</TableHead>
                            {canManage && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading products...</TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No products found. Add a new product to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Printer className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{product.brand} {product.model}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{product.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="text-xs">{product.paper_size}</Badge>
                                            <Badge variant={product.color_type === 'Color' ? 'default' : 'secondary'} className="text-xs">
                                                {product.color_type}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.speed_ppm} ppm</TableCell>
                                    <TableCell>
                                        <Badge variant={product.is_active ? 'default' : 'destructive'} className={product.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    {canManage && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Select
                                    value={formData.brand}
                                    onValueChange={(value) => setFormData({ ...formData, brand: value as any })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                                    <SelectContent>
                                        {BRANDS.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    required
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="e.g. C3530"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {MACHINE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paper_size">Paper Size</Label>
                                <Select
                                    value={formData.paper_size}
                                    onValueChange={(value) => setFormData({ ...formData, paper_size: value as any })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PAPER_SIZES.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color_type">Color</Label>
                                <Select
                                    value={formData.color_type}
                                    onValueChange={(value) => setFormData({ ...formData, color_type: value as any })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {COLOR_TYPES.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="speed">Speed (ppm)</Label>
                                <Input
                                    id="speed"
                                    type="number"
                                    required
                                    value={formData.speed_ppm || ''}
                                    onChange={(e) => setFormData({ ...formData, speed_ppm: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image_url">Image URL</Label>
                                <Input
                                    id="image_url"
                                    value={formData.image_url || ''}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Product description and key features..."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
