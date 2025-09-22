import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, Building2, Smartphone, Plus, Copy, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'add' | 'withdraw';
}

const depositMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2 },
  { id: 'bank_deposit', name: 'Bank Deposit (Paystack)', icon: Building2 },
  { id: 'mobile', name: 'Mobile Money', icon: Smartphone },
];

interface BankDetail {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  account_type: string;
}

interface WithdrawalAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  account_type: string;
}

export function FundModal({ open, onOpenChange, type }: FundModalProps) {
  const { user, wallet, refreshWallet } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Bank details for deposits
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [selectedBankDetail, setSelectedBankDetail] = useState('');
  
  // Withdrawal account management
  const [withdrawalAccounts, setWithdrawalAccounts] = useState<WithdrawalAccount[]>([]);
  const [selectedWithdrawalAccount, setSelectedWithdrawalAccount] = useState('');
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    account_type: 'savings'
  });

  useEffect(() => {
    if (open) {
      if (type === 'add') {
        loadBankDetails();
        generateRandomNarration();
      } else {
        loadWithdrawalAccounts();
      }
    }
  }, [open, type]);

  const generateRandomNarration = () => {
    const digits = Math.random().toString().slice(2, 14).padEnd(12, '0');
    setNarration(digits);
  };

  const loadBankDetails = async () => {
    const { data, error } = await supabase
      .from('sheltradeadmin_bankdetail')
      .select('*')
      .eq('is_active', true)
      .order('bank_name');
    
    if (error) {
      console.error('Error loading bank details:', error);
    } else {
      setBankDetails(data || []);
    }
  };

  const loadWithdrawalAccounts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('wallet_withdrawal')
      .select('bank_name, account_name, account_number, account_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading withdrawal accounts:', error);
    } else {
      // Remove duplicates based on account number
      const uniqueAccounts = data?.reduce((acc: WithdrawalAccount[], curr) => {
        if (!acc.find(account => account.account_number === curr.account_number)) {
          acc.push({
            id: curr.account_number, // Using account number as ID for uniqueness
            ...curr
          });
        }
        return acc;
      }, []) || [];
      setWithdrawalAccounts(uniqueAccounts);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Narration key copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the narration manually",
        variant: "destructive",
      });
    }
  };

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

      if (type === 'withdraw') {
        if (numAmount > wallet.balance) {
          toast({
            title: "Insufficient Funds",
            description: "You don't have enough balance for this withdrawal",
            variant: "destructive",
          });
          return;
        }
        
        // Handle withdrawal
        let accountDetails = newAccount;
        if (selectedWithdrawalAccount && !showNewAccountForm) {
          const selectedAccount = withdrawalAccounts.find(acc => acc.id === selectedWithdrawalAccount);
          if (selectedAccount) {
            accountDetails = selectedAccount;
          }
        }

        if (!accountDetails.account_number || !accountDetails.bank_name || !accountDetails.account_name) {
          toast({
            title: "Missing Account Details",
            description: "Please provide complete bank account information",
            variant: "destructive",
          });
          return;
        }

        const referenceNumber = `WD${Date.now()}`;

        // Create transaction record for withdrawal
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            wallet_id: wallet.id,
            type: 'withdrawal',
            amount: numAmount,
            currency: wallet.currency,
            description: `Withdrawal to ${accountDetails.bank_name}`,
            status: 'pending',
            metadata: {
              bank_name: accountDetails.bank_name,
              account_name: accountDetails.account_name,
              account_number: accountDetails.account_number,
              account_type: accountDetails.account_type,
              reference_number: referenceNumber
            }
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Save withdrawal record with transaction link
        const { data: withdrawalData, error: withdrawalError } = await supabase
          .from('wallet_withdrawal')
          .insert({
            user_id: user.id,
            wallet_id: wallet.id,
            amount: numAmount,
            currency: wallet.currency,
            bank_name: accountDetails.bank_name,
            account_name: accountDetails.account_name,
            account_number: accountDetails.account_number,
            account_type: accountDetails.account_type,
            status: 'pending',
            reference_number: referenceNumber,
            transaction_id: transactionData.id
          })
          .select()
          .single();

        if (withdrawalError) throw withdrawalError;

        // Update transaction with withdrawal reference
        const { error: updateTransactionError } = await supabase
          .from('transactions')
          .update({ wallet_withdrawal_id: withdrawalData.id })
          .eq('id', transactionData.id);

        if (updateTransactionError) throw updateTransactionError;

        toast({
          title: "Withdrawal Request Submitted",
          description: `Your withdrawal request for $${numAmount} has been submitted and is being processed.`,
        });
      } else {
        // Handle deposit
        if ((paymentMethod === 'bank_transfer' && !selectedBankDetail) || 
            (paymentMethod === 'bank_deposit' && !selectedBankDetail)) {
          toast({
            title: "Bank Account Required",
            description: "Please select a bank account for the deposit",
            variant: "destructive",
          });
          return;
        }

        if (!narration && (paymentMethod === 'bank_transfer' || paymentMethod === 'bank_deposit')) {
          toast({
            title: "Narration Required",
            description: "Please use the generated narration key for your deposit.",
            variant: "destructive",
          });
          return;
        }

        const referenceNumber = `DP${Date.now()}`;

        // Create transaction record for deposit
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            wallet_id: wallet.id,
            type: 'deposit',
            amount: numAmount,
            currency: wallet.currency,
            description: `Deposit via ${paymentMethod}`,
            status: 'pending',
            metadata: {
              deposit_method: paymentMethod,
              bank_detail_id: selectedBankDetail || null,
              narration: narration,
              reference_number: referenceNumber
            }
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Save deposit record with transaction link
        const { data: depositData, error: depositError } = await supabase
          .from('wallet_deposit')
          .insert({
            user_id: user.id,
            wallet_id: wallet.id,
            amount: numAmount,
            currency: wallet.currency,
            deposit_method: paymentMethod,
            bank_detail_id: selectedBankDetail || null,
            narration: narration,
            reference_number: referenceNumber,
            status: 'pending',
            transaction_id: transactionData.id
          })
          .select()
          .single();

        if (depositError) throw depositError;

        // Update transaction with deposit reference
        const { error: updateTransactionError } = await supabase
          .from('transactions')
          .update({ wallet_deposit_id: depositData.id })
          .eq('id', transactionData.id);

        if (updateTransactionError) throw updateTransactionError;

        if (paymentMethod === 'bank_deposit') {
          // For Paystack integration (placeholder for now)
          toast({
            title: "Redirecting to Payment",
            description: "You will be redirected to complete your payment via Paystack.",
          });
        } else {
          toast({
            title: "Deposit Instructions",
            description: `Please use this narration when making your deposit: ${narration}`,
          });
        }
      }

      // Refresh wallet to show updated balance if needed
      await refreshWallet();

      // Reset form
      setAmount('');
      setPaymentMethod('');
      setNarration('');
      setSelectedBankDetail('');
      setSelectedWithdrawalAccount('');
      setShowNewAccountForm(false);
      setNewAccount({
        bank_name: '',
        account_name: '',
        account_number: '',
        account_type: 'savings'
      });
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

          {type === 'add' ? (
            // Deposit form
            <>
              <div className="space-y-2">
                <Label>Deposit Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deposit method" />
                  </SelectTrigger>
                  <SelectContent>
                    {depositMethods.map((method) => (
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

              {(paymentMethod === 'bank_transfer' || paymentMethod === 'bank_deposit') && (
                <>
                  <div className="space-y-2">
                    <Label>Select Bank Account</Label>
                    <Select value={selectedBankDetail} onValueChange={setSelectedBankDetail} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankDetails.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{bank.bank_name}</span>
                              <span className="text-sm text-muted-foreground">
                                {bank.account_name} - {bank.account_number}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="narration">Narration Key (Required)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="narration"
                        value={narration}
                        readOnly
                        className="font-mono cursor-pointer select-all"
                        onClick={() => copyToClipboard(narration)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(narration)}
                        className="flex-shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click the key or copy button to copy this 12-digit narration key
                    </p>
                    <p className="text-xs text-destructive">
                      ⚠️ Warning: Use this exact narration key when making your deposit!
                    </p>
                  </div>
                </>
              )}

              {paymentMethod && (
                <Card className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Deposit Instructions</h4>
                      {paymentMethod === 'card' && (
                        <p className="text-sm text-muted-foreground">
                          Your card will be charged instantly. Funds will be available immediately.
                        </p>
                      )}
                      {paymentMethod === 'bank_transfer' && selectedBankDetail && (
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p>Transfer to the selected bank account and use the narration key above.</p>
                          {narration && (
                            <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-between">
                              <p className="font-mono text-xs">
                                Narration Key: {narration}
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(narration)}
                              >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      {paymentMethod === 'bank_deposit' && (
                        <p className="text-sm text-muted-foreground">
                          You will be redirected to Paystack to complete your payment securely.
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
            </>
          ) : (
            // Withdrawal form
            <>
              <div className="space-y-2">
                <Label>Bank Account</Label>
                <div className="space-y-2">
                  {withdrawalAccounts.length > 0 && !showNewAccountForm && (
                    <Select value={selectedWithdrawalAccount} onValueChange={setSelectedWithdrawalAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select saved account" />
                      </SelectTrigger>
                      <SelectContent>
                        {withdrawalAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{account.bank_name}</span>
                              <span className="text-sm text-muted-foreground">
                                {account.account_name} - {account.account_number}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewAccountForm(!showNewAccountForm)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showNewAccountForm ? 'Use Saved Account' : 'Add New Account'}
                  </Button>
                </div>
              </div>

              {(showNewAccountForm || withdrawalAccounts.length === 0) && (
                <Card className="animate-fade-in">
                  <CardContent className="p-4 space-y-4">
                    <h4 className="font-medium">New Bank Account</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          value={newAccount.bank_name}
                          onChange={(e) => setNewAccount(prev => ({ ...prev, bank_name: e.target.value }))}
                          placeholder="Enter bank name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <Select value={newAccount.account_type} onValueChange={(value) => setNewAccount(prev => ({ ...prev, account_type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="current">Current</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        value={newAccount.account_name}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, account_name: e.target.value }))}
                        placeholder="Enter account holder name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={newAccount.account_number}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, account_number: e.target.value }))}
                        placeholder="Enter account number"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount || (type === 'add' && !paymentMethod)} className="flex-1">
              {loading ? 'Processing...' : `${type === 'add' ? 'Submit Deposit' : 'Submit Withdrawal'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}