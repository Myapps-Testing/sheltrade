import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Calendar,
  X
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
}

const transactionTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'giftcard_purchase', label: 'Gift Card Purchase' },
  { value: 'crypto_buy', label: 'Crypto Buy' },
  { value: 'crypto_sell', label: 'Crypto Sell' },
  { value: 'bill_payment', label: 'Bill Payment' },
  { value: 'mobile_topup', label: 'Mobile Top-Up' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'failed', label: 'Failed' },
];

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser, profile, signOut } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authUser) {
      loadTransactions();
    }
  }, [authUser]);

  useEffect(() => {
    applyFilters();
  }, [transactions, typeFilter, statusFilter, startDate, endDate, searchQuery]);

  const loadTransactions = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({ title: 'Error', description: 'Failed to load transactions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.created_at) <= end);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      completed: 'default',
      approved: 'default',
      rejected: 'destructive',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('deposit') || type.includes('buy')) {
      return <ArrowDownLeft className="h-4 w-4 text-success" />;
    }
    if (type.includes('withdrawal') || type.includes('sell') || type.includes('purchase') || type.includes('payment')) {
      return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    }
    return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Type', 'Amount', 'Currency', 'Status', 'Description', 'Date'],
      ...filteredTransactions.map(t => [
        t.id,
        t.type,
        t.amount.toString(),
        t.currency,
        t.status,
        t.description || '',
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: 'Success', description: 'Transactions exported successfully' });
  };

  const handleLogout = async () => {
    await signOut();
  };

  const user = profile ? {
    name: `${profile.first_name} ${profile.last_name}`,
    email: authUser?.email || '',
    avatar: profile.avatar_url || undefined
  } : undefined;

  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || startDate || endDate || searchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Transaction History</h1>
              <p className="text-muted-foreground">View and filter all your transactions</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={filteredTransactions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions found</p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters to see all transactions
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <span className="font-medium">{formatType(transaction.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={transaction.type.includes('deposit') || transaction.type.includes('buy') 
                            ? 'text-success font-semibold' 
                            : 'text-foreground font-semibold'
                          }>
                            {transaction.currency} {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.description || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
