import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Tag, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GiftCard {
  id: string;
  brand: string;
  denomination: number;
  currency: string;
  discount_percentage?: number;
  image_url?: string;
  category: string;
}

interface BuyGiftCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftCard: GiftCard | null;
}

export function BuyGiftCardModal({ open, onOpenChange, giftCard }: BuyGiftCardModalProps) {
  const { user, wallet, refreshWallet } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);

  if (!giftCard) return null;

  const discount = giftCard.discount_percentage || 0;
  const discountedPrice = giftCard.denomination * (1 - discount / 100);
  const totalPrice = discountedPrice * parseInt(quantity || '1');
  const totalSavings = (giftCard.denomination - discountedPrice) * parseInt(quantity || '1');

  const handlePurchase = async () => {
    if (!user || !wallet || !giftCard) return;

    const qty = parseInt(quantity);
    if (qty <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (totalPrice > wallet.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance to purchase this gift card",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          type: 'giftcard_purchase',
          amount: totalPrice,
          currency: giftCard.currency,
          description: `Purchase of ${qty}x ${giftCard.brand} Gift Card`,
          status: 'completed',
          metadata: { 
            giftcard_id: giftCard.id,
            quantity: qty,
            discount_applied: discount
          }
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create user gift cards
      const userGiftCards = Array.from({ length: qty }, (_, i) => ({
        user_id: user.id,
        giftcard_id: giftCard.id,
        transaction_id: transaction.id,
        code: `${giftCard.brand.toUpperCase()}-${Date.now()}-${i + 1}`,
        status: 'active' as const,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      }));

      const { error: userGiftCardError } = await supabase
        .from('user_giftcards')
        .insert(userGiftCards);

      if (userGiftCardError) throw userGiftCardError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - totalPrice })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      await refreshWallet();

      toast({
        title: "Purchase Successful!",
        description: `You've successfully purchased ${qty}x ${giftCard.brand} gift card${qty > 1 ? 's' : ''}`,
      });

      onOpenChange(false);
      setQuantity('1');
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
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
            <Gift className="w-5 h-5" />
            Purchase Gift Card
          </DialogTitle>
          <DialogDescription>
            Complete your gift card purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Gift Card Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-text-light" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{giftCard.brand}</h3>
                  <p className="text-sm text-muted-foreground">{giftCard.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">${giftCard.denomination}</span>
                    {discount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {discount}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Price Breakdown */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unit Price:</span>
                <span>${giftCard.denomination}</span>
              </div>
              {discount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount ({discount}%):</span>
                    <span>-${(giftCard.denomination * discount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discounted Price:</span>
                    <span>${discountedPrice.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span>{quantity}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-sm text-success font-medium">
                  <span>Total Savings:</span>
                  <span>${totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          {wallet && (
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <span className="text-sm text-muted-foreground">Available Balance:</span>
              <span className="font-medium">${wallet.balance.toFixed(2)}</span>
            </div>
          )}

          {/* Purchase Button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={loading || !wallet || totalPrice > wallet.balance} 
              className="flex-1"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {loading ? 'Processing...' : 'Purchase'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}