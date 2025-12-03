import { supabase } from "@/integrations/supabase/client";

// VTpass Network Service IDs
export const AIRTIME_SERVICES = {
  mtn: 'mtn',
  airtel: 'airtel',
  glo: 'glo',
  '9mobile': 'etisalat',
} as const;

export const DATA_SERVICES = {
  mtn: 'mtn-data',
  airtel: 'airtel-data',
  glo: 'glo-data',
  '9mobile': 'etisalat-data',
} as const;

export interface MobileTopUpRequest {
  phoneNumber: string;
  amount: number;
  networkProvider: string;
}

export interface DataTopUpRequest {
  phoneNumber: string;
  networkProvider: string;
  variationCode: string;
  amount: number;
}

export interface MobileTopUpResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  data?: any;
}

export interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

// Get available data plans for a network
export const getDataPlans = async (network: string): Promise<{ success: boolean; data?: DataPlan[]; message?: string }> => {
  try {
    const serviceID = DATA_SERVICES[network as keyof typeof DATA_SERVICES];
    if (!serviceID) {
      return { success: false, message: 'Invalid network provider' };
    }

    const { data, error } = await supabase.functions.invoke('vtpass-mobile-topup', {
      body: {
        action: 'get-variations',
        serviceID,
      },
    });

    if (error) throw error;

    if (data?.success && data?.data?.content?.varations) {
      return { success: true, data: data.data.content.varations };
    }

    return { success: false, message: data?.data?.response_description || 'Failed to fetch data plans' };
  } catch (error) {
    console.error('Get data plans error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch data plans',
    };
  }
};

// Buy airtime
export const buyAirtime = async (request: MobileTopUpRequest): Promise<MobileTopUpResponse> => {
  try {
    const serviceID = AIRTIME_SERVICES[request.networkProvider as keyof typeof AIRTIME_SERVICES];
    if (!serviceID) {
      return { success: false, message: 'Invalid network provider' };
    }

    const { data, error } = await supabase.functions.invoke('vtpass-mobile-topup', {
      body: {
        action: 'buy-airtime',
        serviceID,
        phone: request.phoneNumber,
        amount: request.amount,
      },
    });

    if (error) throw error;

    if (data?.success && data?.data?.code === '000') {
      return {
        success: true,
        transactionId: data.data.requestId,
        message: 'Airtime purchase successful',
        data: data.data,
      };
    }

    return {
      success: false,
      message: data?.data?.response_description || 'Airtime purchase failed',
    };
  } catch (error) {
    console.error('Buy airtime error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to purchase airtime',
    };
  }
};

// Buy data
export const buyData = async (request: DataTopUpRequest): Promise<MobileTopUpResponse> => {
  try {
    const serviceID = DATA_SERVICES[request.networkProvider as keyof typeof DATA_SERVICES];
    if (!serviceID) {
      return { success: false, message: 'Invalid network provider' };
    }

    const { data, error } = await supabase.functions.invoke('vtpass-mobile-topup', {
      body: {
        action: 'buy-data',
        serviceID,
        phone: request.phoneNumber,
        variation_code: request.variationCode,
        amount: request.amount,
      },
    });

    if (error) throw error;

    if (data?.success && data?.data?.code === '000') {
      return {
        success: true,
        transactionId: data.data.requestId,
        message: 'Data purchase successful',
        data: data.data,
      };
    }

    return {
      success: false,
      message: data?.data?.response_description || 'Data purchase failed',
    };
  } catch (error) {
    console.error('Buy data error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to purchase data',
    };
  }
};

// Legacy function for backward compatibility
export const processMobileTopUp = async (
  request: MobileTopUpRequest
): Promise<MobileTopUpResponse> => {
  return buyAirtime(request);
};

// Query transaction status
export const queryTransaction = async (requestId: string): Promise<MobileTopUpResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('vtpass-mobile-topup', {
      body: {
        action: 'query-transaction',
        request_id: requestId,
      },
    });

    if (error) throw error;

    return {
      success: data?.success || false,
      transactionId: requestId,
      message: data?.data?.response_description || 'Query completed',
      data: data?.data,
    };
  } catch (error) {
    console.error('Query transaction error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to query transaction',
    };
  }
};
