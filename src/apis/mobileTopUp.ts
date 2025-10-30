import { supabase } from "@/integrations/supabase/client";

export interface MobileTopUpRequest {
  phoneNumber: string;
  amount: number;
  networkProvider: string;
}

export interface MobileTopUpResponse {
  success: boolean;
  transactionId?: string;
  message: string;
}

export const processMobileTopUp = async (
  request: MobileTopUpRequest
): Promise<MobileTopUpResponse> => {
  try {
    // TODO: Implement mobile top-up API integration
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: 'mobile_topup',
        amount: request.amount,
        status: 'pending',
        metadata: {
          phoneNumber: request.phoneNumber,
          networkProvider: request.networkProvider
        }
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      transactionId: data.id,
      message: 'Mobile top-up initiated successfully'
    };
  } catch (error) {
    console.error('Mobile top-up error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process mobile top-up'
    };
  }
};
