import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { processCryptoTrade, getCryptoRates } from '@/apis/crypto';
import { Bitcoin, ArrowUpDown, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const cryptoCurrencies = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { id: 'USDT', name: 'Tether', symbol: 'USDT', icon: '₮' },
  { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', icon: 'BNB' },
];

interface CryptoFormProps {
  onSuccess?: () => void;
}

export const CryptoForm = ({ onSuccess }: CryptoFormProps) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [cryptoType, setCryptoType] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [loadingRates, setLoadingRates] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRates = async () => {
      setLoadingRates(true);
      const result = await getCryptoRates();
      if (result.success) {
        setRates(result.data);
      }
      setLoadingRates(false);
    };
    fetchRates();
    // Refresh rates every 30 seconds
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectedCrypto = cryptoCurrencies.find(c => c.id === cryptoType);
  const currentRate = rates[cryptoType] || 0;
  const amountValue = parseFloat(amount) || 0;
  const estimatedValue = tradeType === 'buy' 
    ? amountValue / currentRate 
    : amountValue * currentRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Error', description: 'Please log in to continue', variant: 'destructive' });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    if (tradeType === 'sell' && !walletAddress) {
      toast({ title: 'Error', description: 'Please enter your wallet address', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const result = await processCryptoTrade({
        cryptoType,
        amount: parseFloat(amount),
        tradeType,
        walletAddress: tradeType === 'sell' ? walletAddress : undefined,
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        onSuccess?.();
        setAmount('');
        setWalletAddress('');
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process trade', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5" />
          Crypto Trading
        </CardTitle>
        <CardDescription>Buy or sell cryptocurrency instantly</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tradeType} onValueChange={(v: string) => setTradeType(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Sell
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Crypto Selection */}
            <div className="space-y-2">
              <Label>Select Cryptocurrency</Label>
              <div className="grid grid-cols-2 gap-2">
                {cryptoCurrencies.map((crypto) => (
                  <Button
                    key={crypto.id}
                    type="button"
                    variant={cryptoType === crypto.id ? 'default' : 'outline'}
                    className="flex items-center justify-center gap-2 h-auto py-3"
                    onClick={() => setCryptoType(crypto.id)}
                  >
                    <span className="text-lg font-bold">{crypto.icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{crypto.symbol}</div>
                      <div className="text-xs text-muted-foreground">{crypto.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Rate */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Rate</span>
                {loadingRates ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="font-semibold">
                    1 {selectedCrypto?.symbol} = ${currentRate.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <TabsContent value="buy" className="mt-0 space-y-4">
              {/* Amount in USD */}
              <div className="space-y-2">
                <Label htmlFor="buyAmount">Amount (USD)</Label>
                <Input
                  id="buyAmount"
                  type="number"
                  placeholder="Enter amount in USD"
                  value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  min={10}
                />
              </div>

              {/* Estimated Crypto */}
              {amountValue > 0 && currentRate > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">You will receive</span>
                    <span className="font-semibold">
                      ~{estimatedValue.toFixed(8)} {selectedCrypto?.symbol}
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sell" className="mt-0 space-y-4">
              {/* Amount in Crypto */}
              <div className="space-y-2">
                <Label htmlFor="sellAmount">Amount ({selectedCrypto?.symbol})</Label>
                <Input
                  id="sellAmount"
                  type="number"
                  placeholder={`Enter amount in ${selectedCrypto?.symbol}`}
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  step="0.00000001"
                />
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Your {selectedCrypto?.symbol} Wallet Address</Label>
                <Input
                  id="walletAddress"
                  type="text"
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalletAddress(e.target.value)}
                />
              </div>

              {/* Estimated USD */}
              {amountValue > 0 && currentRate > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">You will receive</span>
                    <span className="font-semibold">
                      ~${estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            <Button type="submit" className="w-full" disabled={loading || loadingRates}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto?.symbol}
                </>
              )}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};
