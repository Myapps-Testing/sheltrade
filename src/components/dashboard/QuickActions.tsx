import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Gift, Smartphone, Zap, Send, Download } from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    {
      id: "buy-giftcard",
      label: "Buy Gift Card",
      icon: Gift,
      description: "Purchase gift cards",
      color: "bg-primary/10 text-primary hover:bg-primary/20"
    },
    {
      id: "mobile-topup",
      label: "Mobile Top-up",
      icon: Smartphone,
      description: "Recharge mobile phone",
      color: "bg-accent/10 text-accent hover:bg-accent/20"
    },
    {
      id: "bill-payment",
      label: "Bill Payment",
      icon: Zap,
      description: "Pay utility bills",
      color: "bg-success/10 text-success hover:bg-success/20"
    },
    {
      id: "send-money",
      label: "Send Money",
      icon: Send,
      description: "Transfer to others",
      color: "bg-warning/10 text-warning hover:bg-warning/20"
    },
    {
      id: "crypto-exchange",
      label: "Crypto Exchange",
      icon: CreditCard,
      description: "Buy/sell crypto",
      color: "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30"
    },
    {
      id: "statement",
      label: "Download Statement",
      icon: Download,
      description: "Get transaction history",
      color: "bg-muted/50 text-muted-foreground hover:bg-muted/70"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className={`h-auto p-4 flex flex-col space-y-2 ${action.color} transition-all`}
              onClick={() => onAction(action.id)}
            >
              <action.icon className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs opacity-70">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}