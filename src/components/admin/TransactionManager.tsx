import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  wallet_deposit_id?: string;
  wallet_withdrawal_id?: string;
  user_giftcard_id?: string;
}

export function TransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
    setUpdating(transactionId);
    try {
      const { data, error } = await supabase.functions.invoke('handle-transaction-status', {
        body: {
          transaction_id: transactionId,
          new_status: newStatus
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Status Updated",
          description: `Transaction status updated to ${newStatus}`,
        });
        await loadTransactions(); // Reload to show updated data
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading transactions...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction Manager</CardTitle>
          <Button variant="outline" size="sm" onClick={loadTransactions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">
                    {transaction.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {transaction.status === 'pending' && (
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(status) => updateTransactionStatus(transaction.id, status)}
                          disabled={updating === transaction.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Complete</SelectItem>
                            <SelectItem value="approved">Approve</SelectItem>
                            <SelectItem value="failed">Fail</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                        {updating === transaction.id && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {transactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        )}
      </CardContent>
    </Card>
  );
}