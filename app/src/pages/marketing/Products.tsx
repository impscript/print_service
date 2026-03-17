import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productsApi, productFilesApi, productAttachmentsApi, type Product, type ProductInsert, type ProductAttachment } from '@/services/api/products';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Trash2, Printer, Upload, X, FileText, Paperclip, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Enums from database
const BRANDS = ['Kyocera', 'Lexmark', 'Canon', 'HP', 'Epson', 'Ricoh', 'Other'];
const MACHINE_TYPES = ['Printer', 'MFP'];
const PAPER_SIZES = ['A4', 'A3'];
const COLOR_TYPES = ['Color', 'Mono'];

function formatFileSize(bytes: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Products() {
    const { hasRole } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
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

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Attachments state
    const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

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

    const filteredProducts = products.filter(product => {
        // First filter by active status
        if (!showInactive && !product.is_active) return false;
        
        // Then filter by search term
        return product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
               product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleOpenDialog = async (product?: Product) => {
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
            setImagePreview(product.image_url || null);
            setImageFile(null);
            // Load attachments
            try {
                const atts = await productAttachmentsApi.getByProduct(product.id);
                setAttachments(atts);
            } catch (error) {
                console.error('Error loading attachments:', error);
                setAttachments([]);
            }
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
            setImagePreview(null);
            setImageFile(null);
            setAttachments([]);
        }
        setIsDialogOpen(true);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData({ ...formData, image_url: '' });
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingProduct) return;

        try {
            setUploadingAttachment(true);
            const attachment = await productAttachmentsApi.upload(editingProduct.id, file);
            setAttachments(prev => [attachment, ...prev]);
        } catch (error) {
            console.error('Error uploading attachment:', error);
            alert('Error uploading file. Please try again.');
        } finally {
            setUploadingAttachment(false);
            if (attachmentInputRef.current) attachmentInputRef.current.value = '';
        }
    };

    const handleDeleteAttachment = async (attachment: ProductAttachment) => {
        if (!window.confirm(`Delete "${attachment.file_name}"?`)) return;
        try {
            await productAttachmentsApi.delete(attachment.id, attachment.file_url);
            setAttachments(prev => prev.filter(a => a.id !== attachment.id));
        } catch (error) {
            console.error('Error deleting attachment:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let productId: string;

            if (editingProduct) {
                await productsApi.update(editingProduct.id, formData);
                productId = editingProduct.id;
            } else {
                const newProduct = await productsApi.create(formData as ProductInsert);
                productId = newProduct.id;
            }

            // Upload image if a new file was selected
            if (imageFile) {
                setUploadingImage(true);
                try {
                    await productFilesApi.uploadImage(productId, imageFile);
                } catch (error) {
                    console.error('Error uploading image:', error);
                } finally {
                    setUploadingImage(false);
                }
            } else if (!imagePreview && editingProduct?.image_url) {
                // Image was removed
                await productFilesApi.deleteImage(editingProduct.id, editingProduct.image_url);
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
                {canManage && (
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-inactive"
                            checked={showInactive}
                            onCheckedChange={setShowInactive}
                        />
                        <Label htmlFor="show-inactive" className="text-sm font-medium cursor-pointer">
                            Show Inactive Products
                        </Label>
                    </div>
                )}
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
                                <TableRow 
                                    key={product.id} 
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleOpenDialog(product)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {product.image_url ? (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                                                    <img
                                                        src={product.image_url}
                                                        alt={`${product.brand} ${product.model}`}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            // Fallback to icon on error
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            target.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <Printer className="w-5 h-5 text-gray-500" />
                                                </div>
                                            )}
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
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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

                        <div className="space-y-2">
                            <Label htmlFor="speed">Speed (ppm)</Label>
                            <Input
                                id="speed"
                                type="number"
                                required
                                className="max-w-[200px]"
                                value={formData.speed_ppm || ''}
                                onChange={(e) => setFormData({ ...formData, speed_ppm: parseInt(e.target.value) })}
                            />
                        </div>

                        {/* Product Image Upload */}
                        <div className="space-y-2">
                            <Label>Product Image</Label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                                {imagePreview ? (
                                    <div className="flex items-start gap-4">
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                className="w-full h-full object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-sm"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">
                                                {imageFile ? imageFile.name : 'Current image'}
                                            </p>
                                            {imageFile && (
                                                <p className="text-xs text-gray-400">{formatFileSize(imageFile.size)}</p>
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => imageInputRef.current?.click()}
                                            >
                                                <Upload className="w-3 h-3 mr-1" />
                                                Change Image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                                        onClick={() => imageInputRef.current?.click()}
                                    >
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600 font-medium">Click to upload product image</p>
                                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max 50MB)</p>
                                    </div>
                                )}
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={handleImageSelect}
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

                        {/* Active Status Toggle */}
                        {canManage && (
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active" className="text-base">Active Status</Label>
                                    <p className="text-sm text-gray-500">
                                        {formData.is_active ? 'Product is currently active and can be used.' : 'Product is inactive and hidden.'}
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={!!formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                            </div>
                        )}

                        {/* Attach Files Section (only when editing) */}
                        {editingProduct && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Attached Spec Files</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                        disabled={uploadingAttachment}
                                        onClick={() => attachmentInputRef.current?.click()}
                                    >
                                        {uploadingAttachment ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Paperclip className="w-3 h-3" />
                                        )}
                                        Attach File
                                    </Button>
                                    <input
                                        ref={attachmentInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                                        className="hidden"
                                        onChange={handleAttachFile}
                                    />
                                </div>
                                {attachments.length > 0 ? (
                                    <div className="border rounded-lg divide-y">
                                        {attachments.map((att) => (
                                            <div key={att.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <a
                                                            href={att.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline truncate block"
                                                        >
                                                            {att.file_name}
                                                        </a>
                                                        <span className="text-xs text-gray-400">{formatFileSize(att.file_size)}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="flex-shrink-0 h-7 w-7"
                                                    onClick={() => handleDeleteAttachment(att)}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-3 border rounded-lg">
                                        No files attached. Click "Attach File" to add spec documents.
                                    </p>
                                )}
                            </div>
                        )}

                        <DialogFooter className="flex flex-row justify-between w-full sm:justify-between items-center mt-4">
                            <div>
                                {editingProduct && canManage && (
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            handleDelete(editingProduct.id);
                                        }}
                                    >
                                        Delete Product
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                {canManage && (
                                    <Button type="submit" disabled={uploadingImage}>
                                        {uploadingImage ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            editingProduct ? 'Save Changes' : 'Create Product'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
