import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, DollarSign, Building2, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'add' | 'withdraw';
}

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: Building2 },
  { id: 'mobile', name: 'Mobile Money', icon: Smartphone },
];

export function FundModal({ open, onOpenChange, type }: FundModalProps) {
  const { user, wallet, refreshWallet } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !wallet || !amount || !paymentMethod) return;

    setLoading(true);

    try {
      const numAmount = parseFloat(amount);
      if (numAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0",
          variant: "destructive",
        });
        return;
      }

      if (type === 'withdraw' && numAmount > wallet.balance) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough balance for this withdrawal",
          variant: "destructive",
        });
        return;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          type: type === 'add' ? 'deposit' : 'withdrawal',
          amount: numAmount,
          currency: wallet.currency,
          description: `${type === 'add' ? 'Deposit' : 'Withdrawal'} via ${paymentMethod}`,
          status: 'completed',
          metadata: { payment_method: paymentMethod }
        });

      if (transactionError) throw transactionError;

      // Update wallet balance
      const newBalance = type === 'add' ? 
        wallet.balance + numAmount : 
        wallet.balance - numAmount;

      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      await refreshWallet();

      toast({
        title: `${type === 'add' ? 'Deposit' : 'Withdrawal'} Successful`,
        description: `Successfully ${type === 'add' ? 'added' : 'withdrew'} $${numAmount} ${type === 'add' ? 'to' : 'from'} your account`,
      });

      setAmount('');
      setPaymentMethod('');
      onOpenChange(false);
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {type === 'add' ? 'Add Funds' : 'Withdraw Funds'}
          </DialogTitle>
          <DialogDescription>
            {type === 'add' ? 
              'Choose your payment method and enter the amount to add to your wallet' :
              'Enter the amount you want to withdraw from your wallet'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({wallet?.currency || 'USD'})</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {type === 'withdraw' && wallet && (
              <p className="text-sm text-muted-foreground">
                Available balance: ${wallet.balance.toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-2">
                      <method.icon className="w-4 h-4" />
                      {method.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {paymentMethod && (
            <Card className="animate-fade-in">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Payment Details</h4>
                  {paymentMethod === 'card' && (
                    <p className="text-sm text-muted-foreground">
                      Your card will be charged instantly. Funds will be available immediately.
                    </p>
                  )}
                  {paymentMethod === 'bank' && (
                    <p className="text-sm text-muted-foreground">
                      Bank transfers may take 1-3 business days to process.
                    </p>
                  )}
                  {paymentMethod === 'mobile' && (
                    <p className="text-sm text-muted-foreground">
                      Mobile money transfers are processed instantly.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount || !paymentMethod} className="flex-1">
              {loading ? 'Processing...' : `${type === 'add' ? 'Add' : 'Withdraw'} Funds`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}