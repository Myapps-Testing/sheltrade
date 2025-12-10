import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyContextType {
  currencies: string[];
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  loading: boolean;
  formatAmount: (amount: number, currency?: string) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
  exchangeRates: Record<string, number>;
  refreshRates: () => Promise<void>;
}

// Fallback rates in case API fails
const FALLBACK_RATES: Record<string, number> = {
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
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(FALLBACK_RATES);

  useEffect(() => {
    loadCurrencies();
    fetchLiveRates();
  }, []);

  const loadCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('sheltradeadmin_bankdetail')
        .select('currency')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error loading currencies:', error);
        setCurrencies(['USD', 'NGN', 'EUR', 'GBP']);
      } else if (data && data.length > 0) {
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

  const fetchLiveRates = useCallback(async () => {
    try {
      // Using ExchangeRate-API free tier (no key required for basic usage)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      
      if (data && data.rates) {
        setExchangeRates({
          'USD': 1,
          'NGN': data.rates.NGN || FALLBACK_RATES.NGN,
          'EUR': data.rates.EUR || FALLBACK_RATES.EUR,
          'GBP': data.rates.GBP || FALLBACK_RATES.GBP,
          'CAD': data.rates.CAD || FALLBACK_RATES.CAD,
          'AUD': data.rates.AUD || FALLBACK_RATES.AUD,
        });
      }
    } catch (error) {
      console.error('Error fetching live exchange rates, using fallback:', error);
      setExchangeRates(FALLBACK_RATES);
    }
  }, []);

  const refreshRates = useCallback(async () => {
    await fetchLiveRates();
  }, [fetchLiveRates]);

  const formatAmount = useCallback((amount: number, currency?: string) => {
    const curr = currency || selectedCurrency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [selectedCurrency]);

  const convertAmount = useCallback((amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  }, [exchangeRates]);

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    loading,
    formatAmount,
    convertAmount,
    exchangeRates,
    refreshRates,
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
