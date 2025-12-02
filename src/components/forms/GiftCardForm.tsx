import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { purchaseGiftCard, getAvailableGiftCards } from '@/apis/giftcard';
import { Gift, Loader2, ShoppingCart } from 'lucide-react';

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
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Gift Cards
        </CardTitle>
        <CardDescription>Purchase gift cards at discounted rates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
      </CardContent>
    </Card>
  );
};
