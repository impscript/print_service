import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  quotationsApi,
  type Quotation
} from '@/services/api/quotations';
import { QuotationPreview } from '@/components/marketing/QuotationPreview';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, FileText, Building, Calendar, Eye, Send, Download, AlertCircle } from 'lucide-react';

export function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quotationPreview, setQuotationPreview] = useState<Quotation | null>(null);

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'expired', label: 'Expired' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await quotationsApi.getAll();
      setQuotations(data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    }
  };

  const filteredQuotations = quotations.filter(quote => {
    const customerName = (quote as any).customers?.company_name || '';
    const quoteNumber = quote.quote_number || '';
    const matchesSearch =
      quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-500">Manage pricing proposals and contracts.</p>
        </div>
        <Button onClick={() => navigate('/quotations/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Quotation
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search Quote # or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pricing Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>เหตุผล</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.map((quote) => (
                <TableRow key={quote.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/quotations/${quote.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{quote.quote_number || 'Draft'}</p>
                        <p className="text-xs text-gray-500">{formatDate(quote.created_at || undefined)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{(quote as any).customers?.company_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{formatCurrency(quote.total || 0)}</p>
                    <p className="text-xs text-gray-500">
                      Discounts: {formatCurrency(quote.discount || 0)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getStatusLabel(quote.pricing_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {getStatusLabel(quote.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {quote.status === 'rejected' && (quote as any).rejection_reason ? (
                      <div className="flex items-start gap-1 text-xs text-red-600 max-w-[250px]">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="whitespace-pre-wrap break-words">{(quote as any).rejection_reason}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(quote.valid_until || undefined)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={async () => {
                          const fullQuote = await quotationsApi.getById(quote.id);
                          setQuotationPreview(fullQuote);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        {quote.status === 'approved' && (
                          <DropdownMenuItem>
                            <Send className="w-4 h-4 mr-2" />
                            Send to Customer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
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

      <QuotationPreview
        quotation={quotationPreview}
        isOpen={!!quotationPreview}
        onClose={() => setQuotationPreview(null)}
        customTerms={quotationPreview?.terms_conditions || undefined}
      />
    </div>
  );
}
