import { supabase } from "@/integrations/supabase/client";

export interface BillPaymentRequest {
  billType: string;
  accountNumber: string;
  amount: number;
  provider: string;
}

export interface BillPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
}

export const processBillPayment = async (
  request: BillPaymentRequest
): Promise<BillPaymentResponse> => {
  try {
    // TODO: Implement bill payment API integration
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: 'bill_payment',
        amount: request.amount,
        status: 'pending',
        metadata: {
          billType: request.billType,
          accountNumber: request.accountNumber,
          provider: request.provider
        }
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      transactionId: data.id,
      message: 'Bill payment initiated successfully'
    };
  } catch (error) {
    console.error('Bill payment error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process bill payment'
    };
  }
};
