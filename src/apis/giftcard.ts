import { supabase } from "@/integrations/supabase/client";

export interface GiftCardPurchaseRequest {
  giftcardId: string;
  quantity: number;
}

export interface GiftCardPurchaseResponse {
  success: boolean;
  transactionId?: string;
  codes?: string[];
  message: string;
}

export interface GiftCardValidationRequest {
  code: string;
  brand?: string;
}

export interface GiftCardValidationResponse {
  success: boolean;
  data?: {
    brand: string;
    denomination: number;
    currency: string;
    status: string;
    expiresAt?: string;
    isValid: boolean;
  };
  message: string;
}

// Generate a unique gift card code
const generateGiftCardCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
};

// Purchase gift card
export const purchaseGiftCard = async (
  request: GiftCardPurchaseRequest
): Promise<GiftCardPurchaseResponse> => {
  try {
    // Get gift card details
    const { data: giftcard, error: giftcardError } = await supabase
      .from('giftcards')
      .select('*')
      .eq('id', request.giftcardId)
      .single();

    if (giftcardError || !giftcard) {
      return { success: false, message: 'Gift card not found' };
    }

    // Check stock
    if (giftcard.stock_quantity < request.quantity) {
      return { success: false, message: 'Insufficient stock' };
    }

    // Calculate total amount with discount
    const discount = giftcard.discount_percentage || 0;
    const pricePerCard = giftcard.denomination * (1 - discount / 100);
    const totalAmount = pricePerCard * request.quantity;

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'giftcard_purchase',
        amount: totalAmount,
        status: 'pending',
        metadata: {
          giftcardId: giftcard.id,
          brand: giftcard.brand,
          denomination: giftcard.denomination,
          quantity: request.quantity,
          discount: discount,
        }
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Generate codes for each gift card
    const codes: string[] = [];
    for (let i = 0; i < request.quantity; i++) {
      const code = generateGiftCardCode();
      codes.push(code);

      await supabase
        .from('user_giftcards')
        .insert({
          giftcard_id: giftcard.id,
          code: code,
          status: 'active',
          transaction_id: transaction.id,
          user_id: transaction.user_id,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }

    // Update stock
    await supabase
      .from('giftcards')
      .update({ stock_quantity: giftcard.stock_quantity - request.quantity })
      .eq('id', giftcard.id);

    return {
      success: true,
      transactionId: transaction.id,
      codes,
      message: `Successfully purchased ${request.quantity} gift card(s)`
    };
  } catch (error) {
    console.error('Gift card purchase error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to purchase gift card'
    };
  }
};

// Validate gift card code
export const validateGiftCard = async (
  request: GiftCardValidationRequest
): Promise<GiftCardValidationResponse> => {
  try {
    const { code } = request;

    // Query user_giftcards with the code
    const { data: userGiftCard, error } = await supabase
      .from('user_giftcards')
      .select(`
        *,
        giftcard:giftcards(brand, denomination, currency, category)
      `)
      .eq('code', code)
      .single();

    if (error || !userGiftCard) {
      return {
        success: false,
        message: 'Gift card not found. Please check the code and try again.'
      };
    }

    const giftcard = userGiftCard.giftcard as any;
    const isExpired = userGiftCard.expires_at && new Date(userGiftCard.expires_at) < new Date();
    const isUsed = userGiftCard.status === 'used';
    const isActive = userGiftCard.status === 'active' && !isExpired;

    let statusMessage = 'active';
    if (isUsed) statusMessage = 'used';
    else if (isExpired) statusMessage = 'expired';

    return {
      success: true,
      data: {
        brand: giftcard?.brand || 'Unknown',
        denomination: giftcard?.denomination || 0,
        currency: giftcard?.currency || 'NGN',
        status: statusMessage,
        expiresAt: userGiftCard.expires_at || undefined,
        isValid: isActive,
      },
      message: isActive 
        ? 'Gift card is valid and can be redeemed' 
        : `Gift card is ${statusMessage}`
    };
  } catch (error) {
    console.error('Gift card validation error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to validate gift card'
    };
  }
};

// Redeem gift card
export const redeemGiftCard = async (
  code: string
): Promise<{ success: boolean; amount?: number; message: string }> => {
  try {
    const validation = await validateGiftCard({ code });
    
    if (!validation.success || !validation.data?.isValid) {
      return {
        success: false,
        message: validation.message
      };
    }

    const { error: updateError } = await supabase
      .from('user_giftcards')
      .update({ 
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('code', code);

    if (updateError) throw updateError;

    return {
      success: true,
      amount: validation.data.denomination,
      message: `Successfully redeemed ${validation.data.currency} ${validation.data.denomination} gift card`
    };
  } catch (error) {
    console.error('Gift card redemption error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to redeem gift card'
    };
  }
};

// Get available gift cards
export const getAvailableGiftCards = async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('giftcards')
      .select('*')
      .eq('is_active', true)
      .gt('stock_quantity', 0)
      .order('brand');

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Fetch gift cards error:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to fetch gift cards'
    };
  }
};

// Get user's purchased gift cards
export const getUserGiftCards = async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_giftcards')
      .select(`
        *,
        giftcard:giftcards(brand, denomination, currency, category, image_url)
      `)
      .order('purchased_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Fetch user gift cards error:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to fetch your gift cards'
    };
  }
};