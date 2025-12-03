import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = "https://sandbox.vtpass.com/api/";

// Generate unique request ID
function generateRequestId(suffixLength: number = 10): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${year}${month}${day}${hours}${minutes}`;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < suffixLength; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${timestamp}${suffix}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const email = Deno.env.get('VTPASS_EMAIL');
    const password = Deno.env.get('VTPASS_PASSWORD');

    if (!email || !password) {
      console.error('VTpass credentials not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'VTpass credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = 'Basic ' + btoa(`${email}:${password}`);
    const { action, ...params } = await req.json();

    console.log(`VTpass action: ${action}`, params);

    let response;

    switch (action) {
      case 'get-services': {
        const { serviceID } = params;
        response = await fetch(`${BASE_URL}service-variations?serviceID=${serviceID}`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        });
        break;
      }

      case 'verify-meter': {
        const { billersCode, serviceID, type } = params;
        response = await fetch(`${BASE_URL}merchant-verify`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ billersCode, serviceID, type }),
        });
        break;
      }

      case 'verify-smartcard': {
        const { billersCode, serviceID } = params;
        response = await fetch(`${BASE_URL}merchant-verify`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ billersCode, serviceID }),
        });
        break;
      }

      case 'pay': {
        const { serviceID, billersCode, variation_code, amount, phone, subscription_type } = params;
        const request_id = generateRequestId();
        
        console.log(`Processing payment with request_id: ${request_id}`);
        
        response = await fetch(`${BASE_URL}pay`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            request_id,
            serviceID,
            billersCode,
            variation_code,
            amount,
            phone,
            subscription_type: subscription_type || null,
            quantity: 1,
          }),
        });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const data = await response.json();
    console.log(`VTpass response for ${action}:`, data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('VTpass error:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
