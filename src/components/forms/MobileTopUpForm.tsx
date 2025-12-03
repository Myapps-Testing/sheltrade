import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { buyAirtime, buyData, getDataPlans, DataPlan } from '@/apis/mobileTopUp';
import { Smartphone, Wifi, Loader2 } from 'lucide-react';

const networks = [
  { id: 'mtn', name: 'MTN', color: 'bg-yellow-500' },
  { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
  { id: 'glo', name: 'Glo', color: 'bg-green-500' },
  { id: '9mobile', name: '9mobile', color: 'bg-emerald-600' },
];

const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];

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
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch data plans when network changes
  useEffect(() => {
    const fetchDataPlans = async () => {
      if (!network) {
        setDataPlans([]);
        return;
      }

      setLoadingPlans(true);
      try {
        const result = await getDataPlans(network);
        if (result.success && result.data) {
          setDataPlans(result.data);
        } else {
          console.error('Failed to fetch data plans:', result.message);
          setDataPlans([]);
        }
      } catch (error) {
        console.error('Error fetching data plans:', error);
        setDataPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };

    if (topUpType === 'data') {
      fetchDataPlans();
    }
  }, [network, topUpType]);

  const handleNetworkChange = (networkId: string) => {
    setNetwork(networkId);
    setSelectedDataPlan(''); // Reset selected plan when network changes
  };

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

    if (phoneNumber.length < 10 || phoneNumber.length > 11) {
      toast({ title: 'Error', description: 'Please enter a valid phone number', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      let result;

      if (topUpType === 'airtime') {
        const finalAmount = customAmount ? parseInt(customAmount) : amount;
        if (!finalAmount || finalAmount < 50) {
          toast({ title: 'Error', description: 'Minimum airtime amount is ₦50', variant: 'destructive' });
          setLoading(false);
          return;
        }

        result = await buyAirtime({
          phoneNumber,
          amount: finalAmount,
          networkProvider: network,
        });
      } else {
        // Data purchase
        const selectedPlan = dataPlans.find(p => p.variation_code === selectedDataPlan);
        if (!selectedPlan) {
          toast({ title: 'Error', description: 'Please select a data plan', variant: 'destructive' });
          setLoading(false);
          return;
        }

        result = await buyData({
          phoneNumber,
          networkProvider: network,
          variationCode: selectedDataPlan,
          amount: parseFloat(selectedPlan.variation_amount),
        });
      }

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
                    onClick={() => handleNetworkChange(net.id)}
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
                  placeholder="Enter amount (min ₦50)"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                  min={50}
                />
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-0 space-y-4">
              {/* Data Plans */}
              <div className="space-y-2">
                <Label>Select Data Plan</Label>
                {loadingPlans ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading plans...</span>
                  </div>
                ) : !network ? (
                  <p className="text-sm text-muted-foreground py-2">Select a network first</p>
                ) : dataPlans.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No data plans available</p>
                ) : (
                  <Select value={selectedDataPlan} onValueChange={setSelectedDataPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a data plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataPlans.map((plan) => (
                        <SelectItem key={plan.variation_code} value={plan.variation_code}>
                          {plan.name} - ₦{parseFloat(plan.variation_amount).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </TabsContent>

            <Button type="submit" className="w-full" disabled={loading || (topUpType === 'data' && loadingPlans)}>
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
