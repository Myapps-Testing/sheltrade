import { supabase } from "@/integrations/supabase/client";

// VTpass Service IDs
export const ELECTRICITY_SERVICES = {
  'ikeja': 'ikeja-electric',
  'eko': 'eko-electric',
  'abuja': 'abuja-electric',
  'ibadan': 'ibadan-electric',
  'portharcourt': 'phed',
  'jos': 'jos-electric',
  'kaduna': 'kaduna-electric',
  'kano': 'kano-electric',
  'enugu': 'enugu-electric',
  'benin': 'benin-electric',
} as const;

export const CABLE_SERVICES = {
  'dstv': 'dstv',
  'gotv': 'gotv',
  'startimes': 'startimes',
  'showmax': 'showmax',
} as const;

export interface BillPaymentRequest {
  billType: 'electricity' | 'cable';
  accountNumber: string;
  amount: number;
  provider: string;
  meterType?: 'prepaid' | 'postpaid';
  variationCode?: string;
  phone?: string;
}

export interface BillPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  data?: any;
}

export interface VerifyMeterResponse {
  success: boolean;
  data?: {
    Customer_Name?: string;
    Address?: string;
    MeterNumber?: string;
    [key: string]: any;
  };
  message: string;
}

export interface ServiceVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

// Get service variations (plans) for a service
export const getServiceVariations = async (serviceID: string): Promise<{ success: boolean; data?: ServiceVariation[]; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('vtpass-bill-payment', {
      body: { action: 'get-services', serviceID }
    });

    if (error) throw error;

    return {
      success: true,
      data: data?.data?.content?.varations || [],
      message: 'Services fetched successfully'
    };
  } catch (error) {
    console.error('Get services error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch services'
    };
  }
};

// Verify electricity meter
export const verifyMeter = async (
  meterNumber: string, 
  provider: string, 
  meterType: 'prepaid' | 'postpaid'
): Promise<VerifyMeterResponse> => {
  try {
    const serviceID = ELECTRICITY_SERVICES[provider as keyof typeof ELECTRICITY_SERVICES];
    if (!serviceID) {
      return { success: false, message: 'Invalid provider' };
    }

    const { data, error } = await supabase.functions.invoke('vtpass-bill-payment', {
      body: { 
        action: 'verify-meter', 
        billersCode: meterNumber, 
        serviceID,
        type: meterType
      }
    });

    if (error) throw error;

    const content = data?.data?.content;
    if (content?.Customer_Name) {
      return {
        success: true,
        data: content,
        message: 'Meter verified successfully'
      };
    }

    return {
      success: false,
      message: data?.data?.response_description || 'Failed to verify meter'
    };
  } catch (error) {
    console.error('Verify meter error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify meter'
    };
  }
};

// Verify smart card number for cable TV
export const verifySmartCard = async (
  smartCardNumber: string, 
  provider: string
): Promise<VerifyMeterResponse> => {
  try {
    const serviceID = CABLE_SERVICES[provider as keyof typeof CABLE_SERVICES];
    if (!serviceID) {
      return { success: false, message: 'Invalid provider' };
    }

    const { data, error } = await supabase.functions.invoke('vtpass-bill-payment', {
      body: { 
        action: 'verify-smartcard', 
        billersCode: smartCardNumber, 
        serviceID
      }
    });

    if (error) throw error;

    const content = data?.data?.content;
    if (content?.Customer_Name) {
      return {
        success: true,
        data: content,
        message: 'Smart card verified successfully'
      };
    }

    return {
      success: false,
      message: data?.data?.response_description || 'Failed to verify smart card'
    };
  } catch (error) {
    console.error('Verify smart card error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify smart card'
    };
  }
};

// Process bill payment
export const processBillPayment = async (
  request: BillPaymentRequest
): Promise<BillPaymentResponse> => {
  try {
    const serviceID = request.billType === 'electricity' 
      ? ELECTRICITY_SERVICES[request.provider as keyof typeof ELECTRICITY_SERVICES]
      : CABLE_SERVICES[request.provider as keyof typeof CABLE_SERVICES];

    if (!serviceID) {
      return { success: false, message: 'Invalid provider' };
    }

    // Call VTpass API
    const { data: vtpassResponse, error: vtpassError } = await supabase.functions.invoke('vtpass-bill-payment', {
      body: { 
        action: 'pay',
        serviceID,
        billersCode: request.accountNumber,
        variation_code: request.variationCode || (request.meterType || 'prepaid'),
        amount: request.amount,
        phone: request.phone || '',
        subscription_type: request.billType === 'cable' ? 'renew' : null
      }
    });

    if (vtpassError) throw vtpassError;

    const responseCode = vtpassResponse?.data?.code;
    const isSuccess = responseCode === '000' || responseCode === '099';

    // Save transaction to database
    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .insert({
        type: 'bill_payment',
        amount: request.amount,
        status: isSuccess ? 'pending' : 'failed',
        metadata: {
          billType: request.billType,
          accountNumber: request.accountNumber,
          provider: request.provider,
          meterType: request.meterType,
          variationCode: request.variationCode,
          vtpassResponse: vtpassResponse?.data
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return {
      success: isSuccess,
      transactionId: transaction?.id,
      message: vtpassResponse?.data?.response_description || (isSuccess ? 'Payment successful' : 'Payment failed'),
      data: vtpassResponse?.data
    };
  } catch (error) {
    console.error('Bill payment error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process bill payment'
    };
  }
};
