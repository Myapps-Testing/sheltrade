import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { processMobileTopUp } from '@/apis/mobileTopUp';
import { Smartphone, Wifi, Loader2 } from 'lucide-react';

const networks = [
  { id: 'mtn', name: 'MTN', color: 'bg-yellow-500' },
  { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
  { id: 'glo', name: 'Glo', color: 'bg-green-500' },
  { id: '9mobile', name: '9mobile', color: 'bg-emerald-600' },
];

const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];
const dataPlans = [
  { id: 'data-500mb', name: '500MB', price: 200, validity: '30 days' },
  { id: 'data-1gb', name: '1GB', price: 350, validity: '30 days' },
  { id: 'data-2gb', name: '2GB', price: 600, validity: '30 days' },
  { id: 'data-5gb', name: '5GB', price: 1500, validity: '30 days' },
  { id: 'data-10gb', name: '10GB', price: 2500, validity: '30 days' },
];

interface MobileTopUpFormProps {
  onSuccess?: () => void;
}

export const MobileTopUpForm = ({ onSuccess }: MobileTopUpFormProps) => {
  const [topUpType, setTopUpType] = useState<'airtime' | 'data'>('airtime');
  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedDataPlan, setSelectedDataPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Error', description: 'Please log in to continue', variant: 'destructive' });
      return;
    }

    if (!network || !phoneNumber) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const finalAmount = topUpType === 'airtime' 
      ? (customAmount ? parseInt(customAmount) : amount)
      : dataPlans.find(p => p.id === selectedDataPlan)?.price || 0;

    if (!finalAmount) {
      toast({ title: 'Error', description: 'Please select an amount', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const result = await processMobileTopUp({
        phoneNumber,
        amount: finalAmount,
        networkProvider: network,
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        onSuccess?.();
        // Reset form
        setPhoneNumber('');
        setAmount(0);
        setCustomAmount('');
        setSelectedDataPlan('');
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process top-up', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Top-Up
        </CardTitle>
        <CardDescription>Recharge airtime or buy data bundles</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={topUpType} onValueChange={(v: string) => setTopUpType(v as 'airtime' | 'data')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="airtime" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> Airtime
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" /> Data
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Network Selection */}
            <div className="space-y-2">
              <Label>Select Network</Label>
              <div className="grid grid-cols-4 gap-2">
                {networks.map((net) => (
                  <Button
                    key={net.id}
                    type="button"
                    variant={network === net.id ? 'default' : 'outline'}
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => setNetwork(net.id)}
                  >
                    <div className={`w-6 h-6 rounded-full ${net.color} mb-1`} />
                    <span className="text-xs">{net.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={11}
              />
            </div>

            <TabsContent value="airtime" className="mt-0 space-y-4">
              {/* Quick Amount Selection */}
              <div className="space-y-2">
                <Label>Select Amount</Label>
                <div className="grid grid-cols-3 gap-2">
                  {airtimeAmounts.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant={amount === amt && !customAmount ? 'default' : 'outline'}
                      onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    >
                      ₦{amt.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="customAmount">Or Enter Amount</Label>
                <Input
                  id="customAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                />
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-0 space-y-4">
              {/* Data Plans */}
              <div className="space-y-2">
                <Label>Select Data Plan</Label>
                <Select value={selectedDataPlan} onValueChange={setSelectedDataPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a data plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ₦{plan.price.toLocaleString()} ({plan.validity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Buy ${topUpType === 'airtime' ? 'Airtime' : 'Data'}`
              )}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};
