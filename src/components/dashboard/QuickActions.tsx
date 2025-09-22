import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDownLeft, Gift, TrendingUp, CreditCard, Smartphone, Settings } from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    { id: 'add_funds', label: 'Add Funds', icon: Plus, color: 'bg-success/10 text-success hover:bg-success/20' },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowDownLeft, color: 'bg-warning/10 text-warning hover:bg-warning/20' },
    { id: 'buy_giftcard', label: 'Gift Cards', icon: Gift, color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20' },
    { id: 'crypto', label: 'Crypto', icon: TrendingUp, color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' },
    { id: 'bills', label: 'Pay Bills', icon: CreditCard, color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
    { id: 'mobile_topup', label: 'Mobile Top-up', icon: Smartphone, color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20' },
    { id: 'admin', label: 'Admin', icon: Settings, color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20' }
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
              className={`h-auto p-4 flex flex-col space-y-2 ${action.color} transition-all hover-scale`}
              onClick={() => onAction(action.id)}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}