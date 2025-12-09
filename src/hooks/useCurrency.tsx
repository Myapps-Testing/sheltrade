import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyContextType {
  currencies: string[];
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  loading: boolean;
  formatAmount: (amount: number, currency?: string) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

// Simple exchange rates (in production, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1,
  'NGN': 1550,
  'EUR': 0.92,
  'GBP': 0.79,
  'CAD': 1.36,
  'AUD': 1.53,
};

export function useCurrencyData() {
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'NGN']);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      // First try to get currencies from bank details
      const { data, error } = await supabase
        .from('sheltradeadmin_bankdetail')
        .select('currency')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error loading currencies:', error);
        // Fallback to default currencies
        setCurrencies(['USD', 'NGN', 'EUR', 'GBP']);
      } else if (data && data.length > 0) {
        // Get unique currencies - cast to handle any type
        const uniqueCurrencies = [...new Set(data.map(d => (d as { currency: string }).currency))].filter(Boolean);
        if (uniqueCurrencies.length > 0) {
          setCurrencies(uniqueCurrencies);
        }
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency?: string) => {
    const curr = currency || selectedCurrency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  };

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    loading,
    formatAmount,
    convertAmount,
  };
}

// Create context for global currency state
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const currencyData = useCurrencyData();

  return (
    <CurrencyContext.Provider value={currencyData}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    // Return default values if used outside provider
    return useCurrencyData();
  }
  return context;
}
