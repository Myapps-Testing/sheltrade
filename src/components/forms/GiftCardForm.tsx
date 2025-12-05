import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { purchaseGiftCard, getAvailableGiftCards } from '@/apis/giftcard';
import { Gift, Loader2, ShoppingCart, Upload, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

interface GiftCard {
  id: string;
  brand: string;
  denomination: number;
  currency: string;
  discount_percentage: number;
  image_url: string | null;
  category: string;
}

interface GiftCardFormProps {
  onSuccess?: () => void;
}

export const GiftCardForm = ({ onSuccess }: GiftCardFormProps) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  
  // Sell form state
  const [sellBrand, setSellBrand] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [sellCode, setSellCode] = useState('');
  const [sellPin, setSellPin] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchGiftCards = async () => {
      setLoadingCards(true);
      const result = await getAvailableGiftCards();
      if (result.success) {
        setGiftCards(result.data || []);
      }
      setLoadingCards(false);
    };
    fetchGiftCards();
  }, []);

  const categories = ['all', ...new Set(giftCards.map(g => g.category))];
  const filteredCards = category === 'all' 
    ? giftCards 
    : giftCards.filter(g => g.category === category);

  const calculatePrice = (card: GiftCard) => {
    const discount = card.discount_percentage || 0;
    return card.denomination * (1 - discount / 100);
  };

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Error', description: 'Please log in to continue', variant: 'destructive' });
      return;
    }

    if (!selectedCard) {
      toast({ title: 'Error', description: 'Please select a gift card', variant: 'destructive' });
      return;
    }

    if (quantity < 1) {
      toast({ title: 'Error', description: 'Quantity must be at least 1', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const result = await purchaseGiftCard({
        giftcardId: selectedCard.id,
        quantity,
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        onSuccess?.();
        setSelectedCard(null);
        setQuantity(1);
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to purchase gift card', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Error', description: 'Please log in to continue', variant: 'destructive' });
      return;
    }

    if (!sellBrand || !sellAmount || !sellCode) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Simulate escrow submission - in production, this would create an escrow transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({ 
        title: 'Submitted to Escrow', 
        description: 'Your gift card has been submitted for verification. You will be credited once verified.' 
      });
      onSuccess?.();
      setSellBrand('');
      setSellAmount('');
      setSellCode('');
      setSellPin('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit gift card', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const popularBrands = ['Amazon', 'iTunes', 'Google Play', 'Steam', 'Xbox', 'PlayStation', 'Netflix', 'Spotify'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Gift Cards
        </CardTitle>
        <CardDescription>Buy or sell gift cards securely with escrow protection</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tradeType} onValueChange={(v: string) => setTradeType(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="mt-0">
            <form onSubmit={handleBuySubmit} className="space-y-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gift Cards Grid */}
              <div className="space-y-2">
                <Label>Select Gift Card</Label>
                {loadingCards ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredCards.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No gift cards available
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                    {filteredCards.map((card) => (
                      <Button
                        key={card.id}
                        type="button"
                        variant={selectedCard?.id === card.id ? 'default' : 'outline'}
                        className="h-auto p-3 flex flex-col items-start gap-1 relative"
                        onClick={() => setSelectedCard(card)}
                      >
                        {card.discount_percentage > 0 && (
                          <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs">
                            -{card.discount_percentage}%
                          </Badge>
                        )}
                        <span className="font-semibold text-sm">{card.brand}</span>
                        <span className="text-xs text-muted-foreground">{card.category}</span>
                        <span className="text-sm">
                          {card.currency} {card.denomination.toLocaleString()}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Card Details */}
              {selectedCard && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{selectedCard.brand}</h4>
                      <p className="text-sm text-muted-foreground">{selectedCard.category}</p>
                    </div>
                    {selectedCard.discount_percentage > 0 && (
                      <Badge variant="secondary">{selectedCard.discount_percentage}% OFF</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Face Value:</span>
                      <p className="font-medium">{selectedCard.currency} {selectedCard.denomination.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Your Price:</span>
                      <p className="font-medium text-primary">
                        {selectedCard.currency} {calculatePrice(selectedCard).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      max={10}
                    />
                  </div>

                  {/* Total */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-lg font-bold text-primary">
                        {selectedCard.currency} {(calculatePrice(selectedCard) * quantity).toLocaleString()}
                      </span>
                    </div>
                    {selectedCard.discount_percentage > 0 && (
                      <p className="text-xs text-muted-foreground text-right">
                        You save {selectedCard.currency} {((selectedCard.denomination - calculatePrice(selectedCard)) * quantity).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !selectedCard}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase Gift Card
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sell" className="mt-0">
            <form onSubmit={handleSellSubmit} className="space-y-6">
              {/* Escrow Notice */}
              <div className="p-4 border rounded-lg bg-primary/5 border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-semibold">Escrow Protected</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your gift card will be held securely while we verify it. Once verified, you'll be credited within 24 hours.
                </p>
              </div>

              {/* Brand Selection */}
              <div className="space-y-2">
                <Label>Gift Card Brand</Label>
                <Select value={sellBrand} onValueChange={setSellBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularBrands.map((brand) => (
                      <SelectItem key={brand} value={brand.toLowerCase()}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="sellAmount">Card Value (USD)</Label>
                <Input
                  id="sellAmount"
                  type="number"
                  placeholder="Enter the card value"
                  value={sellAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSellAmount(e.target.value)}
                  min={5}
                />
              </div>

              {/* Gift Card Code */}
              <div className="space-y-2">
                <Label htmlFor="sellCode">Gift Card Code</Label>
                <Input
                  id="sellCode"
                  type="text"
                  placeholder="Enter gift card code"
                  value={sellCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSellCode(e.target.value)}
                />
              </div>

              {/* PIN (if applicable) */}
              <div className="space-y-2">
                <Label htmlFor="sellPin">PIN (if applicable)</Label>
                <Input
                  id="sellPin"
                  type="text"
                  placeholder="Enter PIN if required"
                  value={sellPin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSellPin(e.target.value)}
                />
              </div>

              {/* Estimated Payout */}
              {sellAmount && parseFloat(sellAmount) > 0 && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Card Value:</span>
                    <span>${parseFloat(sellAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Rate (85%):</span>
                    <span>-${(parseFloat(sellAmount) * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">You'll Receive:</span>
                    <span className="text-lg font-bold text-primary">
                      ${(parseFloat(sellAmount) * 0.85).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Processing Time */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Verification typically takes 1-24 hours</span>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !sellBrand || !sellAmount || !sellCode}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit to Escrow
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
