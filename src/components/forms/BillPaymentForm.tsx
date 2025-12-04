import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { processBillPayment, verifyMeter, verifySmartCard } from '@/apis/billPayment';
import { Zap, Tv, Loader2, CheckCircle, AlertCircle, User } from 'lucide-react';

const electricityProviders = [
  { id: 'ikeja', name: 'Ikeja Electric (IE)' },
  { id: 'eko', name: 'Eko Electric (EKEDC)' },
  { id: 'abuja', name: 'Abuja Electric (AEDC)' },
  { id: 'ibadan', name: 'Ibadan Electric (IBEDC)' },
  { id: 'portharcourt', name: 'Port Harcourt Electric (PHED)' },
  { id: 'jos', name: 'Jos Electric (JED)' },
  { id: 'kaduna', name: 'Kaduna Electric (KAEDCO)' },
  { id: 'kano', name: 'Kano Electric (KEDCO)' },
  { id: 'enugu', name: 'Enugu Electric (EEDC)' },
  { id: 'benin', name: 'Benin Electric (BEDC)' },
];

const cableProviders = [
  { id: 'dstv', name: 'DSTV' },
  { id: 'gotv', name: 'GOtv' },
  { id: 'startimes', name: 'StarTimes' },
  { id: 'showmax', name: 'Showmax' },
];

const cablePlans: Record<string, { id: string; name: string; price: number }[]> = {
  dstv: [
    { id: 'padi', name: 'DStv Padi', price: 2500 },
    { id: 'yanga', name: 'DStv Yanga', price: 3500 },
    { id: 'confam', name: 'DStv Confam', price: 6200 },
    { id: 'compact', name: 'DStv Compact', price: 10500 },
    { id: 'compact-plus', name: 'DStv Compact Plus', price: 16600 },
    { id: 'premium', name: 'DStv Premium', price: 24500 },
  ],
  gotv: [
    { id: 'smallie', name: 'GOtv Smallie', price: 1100 },
    { id: 'jinja', name: 'GOtv Jinja', price: 2250 },
    { id: 'jolli', name: 'GOtv Jolli', price: 3300 },
    { id: 'max', name: 'GOtv Max', price: 4850 },
    { id: 'supa', name: 'GOtv Supa', price: 6400 },
  ],
  startimes: [
    { id: 'nova', name: 'StarTimes Nova', price: 1200 },
    { id: 'basic', name: 'StarTimes Basic', price: 1850 },
    { id: 'smart', name: 'StarTimes Smart', price: 2600 },
    { id: 'classic', name: 'StarTimes Classic', price: 2750 },
    { id: 'super', name: 'StarTimes Super', price: 4900 },
  ],
  showmax: [
    { id: 'mobile', name: 'Showmax Mobile', price: 1200 },
    { id: 'standard', name: 'Showmax Standard', price: 2900 },
    { id: 'pro', name: 'Showmax Pro', price: 6300 },
    { id: 'pro-mobile', name: 'Showmax Pro Mobile', price: 3200 },
  ],
};

interface CustomerDetails {
  Customer_Name?: string;
  Address?: string;
  MeterNumber?: string;
  [key: string]: any;
}

interface BillPaymentFormProps {
  onSuccess?: () => void;
}

export const BillPaymentForm = ({ onSuccess }: BillPaymentFormProps) => {
  const [billType, setBillType] = useState<'electricity' | 'cable'>('electricity');
  const [provider, setProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleVerify = async () => {
    if (!provider || !accountNumber) {
      toast({ title: 'Error', description: 'Please select provider and enter account number', variant: 'destructive' });
      return;
    }

    setVerifying(true);
    setVerified(false);
    setCustomerDetails(null);

    try {
      const result = billType === 'electricity' 
        ? await verifyMeter(accountNumber, provider, meterType)
        : await verifySmartCard(accountNumber, provider);

      if (result.success && result.data) {
        setVerified(true);
        setCustomerDetails(result.data);
        toast({ title: 'Verified', description: `Customer: ${result.data.Customer_Name}` });
      } else {
        toast({ title: 'Verification Failed', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Verification failed', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const resetVerification = () => {
    setVerified(false);
    setCustomerDetails(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Error', description: 'Please log in to continue', variant: 'destructive' });
      return;
    }

    if (!provider || !accountNumber) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (!verified) {
      toast({ title: 'Error', description: 'Please verify account before payment', variant: 'destructive' });
      return;
    }

    let finalAmount = 0;
    if (billType === 'electricity') {
      finalAmount = parseFloat(amount);
      if (!finalAmount || finalAmount < 500) {
        toast({ title: 'Error', description: 'Minimum amount is ₦500', variant: 'destructive' });
        return;
      }
    } else {
      const plan = cablePlans[provider]?.find(p => p.id === selectedPlan);
      if (!plan) {
        toast({ title: 'Error', description: 'Please select a plan', variant: 'destructive' });
        return;
      }
      finalAmount = plan.price;
    }

    setLoading(true);
    try {
      const result = await processBillPayment({
        billType,
        accountNumber,
        amount: finalAmount,
        provider,
        meterType: billType === 'electricity' ? meterType : undefined,
        variationCode: billType === 'cable' ? selectedPlan : undefined,
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        onSuccess?.();
        setAccountNumber('');
        setAmount('');
        setSelectedPlan('');
        resetVerification();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process payment', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {billType === 'electricity' ? <Zap className="h-5 w-5" /> : <Tv className="h-5 w-5" />}
          Bill Payment
        </CardTitle>
        <CardDescription>Pay for electricity or TV subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={billType} onValueChange={(v: string) => { setBillType(v as 'electricity' | 'cable'); setProvider(''); setSelectedPlan(''); resetVerification(); }}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="electricity" className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Electricity
            </TabsTrigger>
            <TabsTrigger value="cable" className="flex items-center gap-2">
              <Tv className="h-4 w-4" /> Cable TV
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TabsContent value="electricity" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label>Select Provider</Label>
                <Select value={provider} onValueChange={(v: string) => { setProvider(v); resetVerification(); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {electricityProviders.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Meter Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={meterType === 'prepaid' ? 'default' : 'outline'}
                    onClick={() => { setMeterType('prepaid'); resetVerification(); }}
                  >
                    Prepaid
                  </Button>
                  <Button
                    type="button"
                    variant={meterType === 'postpaid' ? 'default' : 'outline'}
                    onClick={() => { setMeterType('postpaid'); resetVerification(); }}
                  >
                    Postpaid
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterNumber">Meter Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="meterNumber"
                    type="text"
                    placeholder="Enter meter number"
                    value={accountNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAccountNumber(e.target.value); resetVerification(); }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerify}
                    disabled={verifying || !provider || !accountNumber}
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              </div>

              {/* Customer Details Display */}
              {verified && customerDetails && (
                <div className="p-3 border rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium text-sm">Account Verified</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{customerDetails.Customer_Name}</p>
                      {customerDetails.Address && (
                        <p className="text-muted-foreground text-xs">{customerDetails.Address}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Minimum ₦500"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  min={500}
                  disabled={!verified}
                />
              </div>
            </TabsContent>

            <TabsContent value="cable" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label>Select Provider</Label>
                <div className="grid grid-cols-2 gap-2">
                  {cableProviders.map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      variant={provider === p.id ? 'default' : 'outline'}
                      onClick={() => { setProvider(p.id); setSelectedPlan(''); resetVerification(); }}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smartCard">Smart Card / IUC Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="smartCard"
                    type="text"
                    placeholder="Enter smart card number"
                    value={accountNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAccountNumber(e.target.value); resetVerification(); }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerify}
                    disabled={verifying || !provider || !accountNumber}
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              </div>

              {/* Customer Details Display */}
              {verified && customerDetails && (
                <div className="p-3 border rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium text-sm">Smart Card Verified</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{customerDetails.Customer_Name}</p>
                      {customerDetails.Current_Bouquet && (
                        <p className="text-muted-foreground text-xs">Current Plan: {customerDetails.Current_Bouquet}</p>
                      )}
                      {customerDetails.Due_Date && (
                        <p className="text-muted-foreground text-xs">Due Date: {customerDetails.Due_Date}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {provider && cablePlans[provider] && (
                <div className="space-y-2">
                  <Label>Select Plan</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan} disabled={!verified}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {cablePlans[provider].map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₦{plan.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            {!verified && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Please verify your account before proceeding to payment</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !verified}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Bill'
              )}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};