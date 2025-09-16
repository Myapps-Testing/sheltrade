import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Zap } from "lucide-react";

interface GiftCard {
  id: string;
  brand: string;
  denomination: number;
  currency: string;
  discount?: number;
  rating: number;
  image: string;
  popular?: boolean;
  category: string;
}

interface GiftCardGridProps {
  giftCards: GiftCard[];
  onSelectCard: (card: GiftCard) => void;
}

export function GiftCardGrid({ giftCards, onSelectCard }: GiftCardGridProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {giftCards.map((card) => (
        <Card key={card.id} className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => onSelectCard(card)}>
          <CardContent className="p-4">
            <div className="relative mb-4">
              <div className="aspect-[3/2] bg-gradient-secondary rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={card.image} 
                  alt={card.brand}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Crect width='100' height='60' fill='%23e6e6fa'/%3E%3Ctext x='50' y='35' font-family='Arial' font-size='12' text-anchor='middle' fill='%23666'%3E${card.brand}%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              
              {card.popular && (
                <Badge className="absolute -top-2 -right-2 bg-warning text-warning-foreground">
                  <Zap className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
              
              {card.discount && (
                <Badge className="absolute -top-2 -left-2 bg-success text-success-foreground">
                  {card.discount}% OFF
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{card.brand}</h3>
                <p className="text-sm text-muted-foreground">{card.category}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(card.denomination, card.currency)}
                  </p>
                  {card.discount && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(card.denomination * (1 + card.discount / 100), card.currency)}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="text-sm font-medium">{card.rating}</span>
                </div>
              </div>

              <Button 
                variant="financial" 
                className="w-full group-hover:shadow-glow transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCard(card);
                }}
              >
                Buy Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}