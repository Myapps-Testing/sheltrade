import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { processBillPayment } from '@/apis/billPayment';
import { Zap, Tv, Loader2 } from 'lucide-react';

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
  const { toast } = useToast();
  const { user } = useAuth();

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
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        onSuccess?.();
        // Reset form
        setAccountNumber('');
        setAmount('');
        setSelectedPlan('');
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
        <Tabs value={billType} onValueChange={(v: string) => { setBillType(v as 'electricity' | 'cable'); setProvider(''); setSelectedPlan(''); }}>
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
              {/* Electricity Provider */}
              <div className="space-y-2">
                <Label>Select Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
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

              {/* Meter Type */}
              <div className="space-y-2">
                <Label>Meter Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={meterType === 'prepaid' ? 'default' : 'outline'}
                    onClick={() => setMeterType('prepaid')}
                  >
                    Prepaid
                  </Button>
                  <Button
                    type="button"
                    variant={meterType === 'postpaid' ? 'default' : 'outline'}
                    onClick={() => setMeterType('postpaid')}
                  >
                    Postpaid
                  </Button>
                </div>
              </div>

              {/* Meter Number */}
              <div className="space-y-2">
                <Label htmlFor="meterNumber">Meter Number</Label>
                <Input
                  id="meterNumber"
                  type="text"
                  placeholder="Enter meter number"
                  value={accountNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value)}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Minimum ₦500"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  min={500}
                />
              </div>
            </TabsContent>

            <TabsContent value="cable" className="mt-0 space-y-4">
              {/* Cable Provider */}
              <div className="space-y-2">
                <Label>Select Provider</Label>
                <div className="grid grid-cols-2 gap-2">
                  {cableProviders.map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      variant={provider === p.id ? 'default' : 'outline'}
                      onClick={() => { setProvider(p.id); setSelectedPlan(''); }}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Smart Card / IUC Number */}
              <div className="space-y-2">
                <Label htmlFor="smartCard">Smart Card / IUC Number</Label>
                <Input
                  id="smartCard"
                  type="text"
                  placeholder="Enter smart card number"
                  value={accountNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value)}
                />
              </div>

              {/* Cable Plan */}
              {provider && cablePlans[provider] && (
                <div className="space-y-2">
                  <Label>Select Plan</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
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

            <Button type="submit" className="w-full" disabled={loading}>
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
