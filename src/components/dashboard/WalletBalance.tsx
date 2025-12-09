import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Plus, ArrowDownLeft } from "lucide-react";
import { useState } from "react";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { useCurrency } from "@/hooks/useCurrency";

interface WalletBalanceProps {
  balance: number;
  currency: string;
  pendingBalance?: number;
  onAddFunds?: () => void;
  onWithdraw?: () => void;
}

export function WalletBalance({ balance, currency = "USD", pendingBalance = 0, onAddFunds, onWithdraw }: WalletBalanceProps) {
  const [showBalance, setShowBalance] = useState(true);
  const { selectedCurrency, setSelectedCurrency, formatAmount, convertAmount } = useCurrency();

  // Convert balance to selected currency
  const displayBalance = convertAmount(balance, currency, selectedCurrency);
  const displayPending = convertAmount(pendingBalance, currency, selectedCurrency);

  return (
    <Card className="gradient-card border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Wallet Balance</CardTitle>
          <div className="flex items-center gap-2">
            <CurrencySelector 
              value={selectedCurrency}
              onValueChange={setSelectedCurrency}
              className="h-8"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="hover:bg-white/10"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-foreground">
              {showBalance ? formatAmount(displayBalance, selectedCurrency) : "••••••"}
            </p>
            {selectedCurrency !== currency && (
              <p className="text-xs text-muted-foreground mt-1">
                Original: {formatAmount(balance, currency)}
              </p>
            )}
          </div>

          {pendingBalance > 0 && (
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
              <div>
                <p className="text-sm font-medium text-warning">Pending Balance</p>
                <p className="text-lg font-semibold text-warning">
                  {showBalance ? formatAmount(displayPending, selectedCurrency) : "••••••"}
                </p>
              </div>
              <Badge variant="outline" className="border-warning text-warning">
                Processing
              </Badge>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <Button variant="financial" className="flex-1" onClick={onAddFunds}>
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
            <Button variant="outline" className="flex-1" onClick={onWithdraw}>
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
