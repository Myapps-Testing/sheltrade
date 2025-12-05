import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { processCryptoTrade, getCryptoRates } from '@/apis/crypto';
import { Bitcoin, ArrowUpDown, Loader2, TrendingUp, TrendingDown, ShieldCheck, Clock, Wallet } from 'lucide-react';

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

    if (tradeType === 'buy' && !walletAddress) {
      toast({ title: 'Error', description: 'Please enter your wallet address to receive crypto', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const result = await processCryptoTrade({
        cryptoType,
        amount: parseFloat(amount),
        tradeType,
        walletAddress: walletAddress || undefined,
      });

      if (result.success) {
        toast({ 
          title: 'Submitted to Escrow', 
          description: tradeType === 'buy' 
            ? 'Your purchase order has been placed. Crypto will be sent once payment is confirmed.'
            : 'Your sell order has been placed. You will be credited once the crypto is received.'
        });
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
        <CardDescription>Buy or sell cryptocurrency securely with escrow protection</CardDescription>
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

          {/* Escrow Notice */}
          <div className="p-3 border rounded-lg bg-primary/5 border-primary/20 mb-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-medium text-sm">Escrow Protected Trade</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tradeType === 'buy' 
                ? 'Your funds are held securely until you receive your crypto.'
                : 'Your crypto is held securely until payment is confirmed.'}
            </p>
          </div>

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

              {/* Wallet Address for Buy */}
              <div className="space-y-2">
                <Label htmlFor="buyWalletAddress">Your {selectedCrypto?.symbol} Wallet Address</Label>
                <Input
                  id="buyWalletAddress"
                  type="text"
                  placeholder="Enter wallet address to receive crypto"
                  value={walletAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalletAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Crypto will be sent here after payment confirmation
                </p>
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

              {/* Platform Wallet Address */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <Label className="text-sm">Send {selectedCrypto?.symbol} to:</Label>
                <div className="p-2 bg-background rounded border font-mono text-xs break-all">
                  {cryptoType === 'BTC' && '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'}
                  {cryptoType === 'ETH' && '0x742d35Cc6634C0532925a3b844Bc9e7595f...'}
                  {cryptoType === 'USDT' && 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'}
                  {cryptoType === 'BNB' && 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Send the exact amount to this address. Your wallet will be credited after confirmation.
                </p>
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

            {/* Processing Time */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {tradeType === 'buy' 
                  ? 'Crypto sent within 30 minutes of payment confirmation'
                  : 'Credited within 30 minutes of blockchain confirmation'}
              </span>
            </div>

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
