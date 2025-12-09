import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/useCurrency";

interface CurrencySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const currencySymbols: Record<string, string> = {
  'USD': '$',
  'NGN': '₦',
  'EUR': '€',
  'GBP': '£',
  'CAD': 'C$',
  'AUD': 'A$',
};

const currencyNames: Record<string, string> = {
  'USD': 'US Dollar',
  'NGN': 'Nigerian Naira',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
};

export function CurrencySelector({ 
  value, 
  onValueChange, 
  className = "",
  disabled = false 
}: CurrencySelectorProps) {
  const { currencies, selectedCurrency, setSelectedCurrency, loading } = useCurrency();

  const currentValue = value || selectedCurrency;
  const handleChange = onValueChange || setSelectedCurrency;

  return (
    <Select 
      value={currentValue} 
      onValueChange={handleChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className={`w-[120px] bg-background border-border ${className}`}>
        <SelectValue placeholder="Currency">
          {currencySymbols[currentValue] || currentValue} {currentValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border z-50">
        {currencies.map((currency) => (
          <SelectItem key={currency} value={currency}>
            <span className="flex items-center gap-2">
              <span className="font-medium">{currencySymbols[currency] || ''}</span>
              <span>{currency}</span>
              <span className="text-muted-foreground text-xs">
                {currencyNames[currency] || ''}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
