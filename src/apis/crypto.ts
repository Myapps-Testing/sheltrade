import { supabase } from "@/integrations/supabase/client";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Map internal crypto names to CoinGecko IDs
const CRYPTO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'USDC': 'usd-coin',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'TRX': 'tron',
};

export interface CryptoTradeRequest {
  cryptoType: string;
  amount: number;
  tradeType: 'buy' | 'sell';
  walletAddress?: string;
}

export interface CryptoTradeResponse {
  success: boolean;
  transactionId?: string;
  rate?: number;
  message: string;
}

export interface CryptoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
    ngn?: number;
  };
}

// Fetch crypto prices from CoinGecko API
export const getCryptoRates = async (
  coins: string[] = ['BTC', 'ETH', 'USDT', 'BNB'],
  currency: string = 'usd'
): Promise<{ success: boolean; data: Record<string, number>; message?: string }> => {
  try {
    const coinIds = coins
      .map(c => CRYPTO_IDS[c.toUpperCase()] || c.toLowerCase())
      .join(',');

    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds}&vs_currencies=${currency}&include_24hr_change=true`,
      {
        headers: { accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto rates');
    }

    const data = await response.json();
    
    // Transform response to use original coin symbols
    const rates: Record<string, number> = {};
    coins.forEach(coin => {
      const coinId = CRYPTO_IDS[coin.toUpperCase()] || coin.toLowerCase();
      if (data[coinId] && data[coinId][currency]) {
        rates[coin.toUpperCase()] = data[coinId][currency];
      }
    });

    return { success: true, data: rates };
  } catch (error) {
    console.error('Fetch crypto rates error:', error);
    return { 
      success: false, 
      data: {}, 
      message: error instanceof Error ? error.message : 'Failed to fetch crypto rates' 
    };
  }
};

// Fetch detailed crypto prices with 24h change
export const getCryptoDetails = async (
  coins: string[] = ['BTC', 'ETH', 'USDT', 'BNB']
): Promise<{ success: boolean; data: CryptoPrice; message?: string }> => {
  try {
    const coinIds = coins
      .map(c => CRYPTO_IDS[c.toUpperCase()] || c.toLowerCase())
      .join(',');

    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds}&vs_currencies=usd,ngn&include_24hr_change=true`,
      {
        headers: { accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto details');
    }

    const data = await response.json();
    
    // Transform to use original coin symbols
    const result: CryptoPrice = {};
    coins.forEach(coin => {
      const coinId = CRYPTO_IDS[coin.toUpperCase()] || coin.toLowerCase();
      if (data[coinId]) {
        result[coin.toUpperCase()] = {
          usd: data[coinId].usd || 0,
          usd_24h_change: data[coinId].usd_24h_change || 0,
          ngn: data[coinId].ngn || 0,
        };
      }
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Fetch crypto details error:', error);
    return { 
      success: false, 
      data: {}, 
      message: error instanceof Error ? error.message : 'Failed to fetch crypto details' 
    };
  }
};

// Get single crypto price
export const getCryptoPrice = async (
  coin: string,
  currency: string = 'usd'
): Promise<{ success: boolean; price?: number; message?: string }> => {
  try {
    const coinId = CRYPTO_IDS[coin.toUpperCase()] || coin.toLowerCase();
    
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=${currency}`,
      {
        headers: { accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    if (data[coinId] && data[coinId][currency]) {
      return { success: true, price: data[coinId][currency] };
    }

    return { success: false, message: 'Price not found' };
  } catch (error) {
    console.error('Fetch crypto price error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch crypto price' 
    };
  }
};

// Process crypto trade
export const processCryptoTrade = async (
  request: CryptoTradeRequest
): Promise<CryptoTradeResponse> => {
  try {
    // Get current rate
    const rateResult = await getCryptoPrice(request.cryptoType, 'usd');
    const currentRate = rateResult.price || 0;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: request.tradeType === 'buy' ? 'crypto_buy' : 'crypto_sell',
        amount: request.amount,
        status: 'pending',
        metadata: {
          cryptoType: request.cryptoType,
          walletAddress: request.walletAddress,
          rate: currentRate,
          cryptoAmount: currentRate > 0 ? request.amount / currentRate : 0,
        }
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      transactionId: data.id,
      rate: currentRate,
      message: `Crypto ${request.tradeType} initiated successfully`
    };
  } catch (error) {
    console.error('Crypto trade error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process crypto trade'
    };
  }
};