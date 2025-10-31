import { supabase } from "@/integrations/supabase/client";

export interface GiftCardPurchaseRequest {
  giftcardId: string;
  quantity: number;
  userId: string;
}

export interface GiftCardPurchaseResponse {
  success: boolean;
  codes?: string[];
  transactionId?: string;
  message: string;
}

export const purchaseGiftCard = async (
  request: GiftCardPurchaseRequest
): Promise<GiftCardPurchaseResponse> => {
  try {
    // Fetch gift card details
    const { data: giftcard, error: giftcardError } = await supabase
      .from('giftcards')
      .select('*')
      .eq('id', request.giftcardId)
      .single();

    if (giftcardError) throw giftcardError;
    if (!giftcard) throw new Error('Gift card not found');

    // Calculate total amount
    const totalAmount = giftcard.denomination * request.quantity;

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: request.userId,
        type: 'giftcard_purchase',
        amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    return {
      success: true,
      transactionId: transaction.id,
      message: 'Gift card purchase initiated successfully'
    };
  } catch (error) {
    console.error('Gift card purchase error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to purchase gift card'
    };
  }
};

export const getAvailableGiftCards = async () => {
  try {
    const { data, error } = await supabase
      .from('giftcards')
      .select('*')
      .eq('is_active', true)
      .order('brand', { ascending: true });

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
