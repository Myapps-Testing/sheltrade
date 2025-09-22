import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  amount: number
  type: string
  status: string
  currency: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { transaction_id, new_status } = await req.json()

    console.log('Processing transaction status update:', { transaction_id, new_status })

    if (!transaction_id || !new_status) {
      throw new Error('Missing required fields: transaction_id and new_status')
    }

    // Get the transaction details
    const { data: transaction, error: fetchError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single()

    if (fetchError) {
      console.error('Error fetching transaction:', fetchError)
      throw new Error('Transaction not found')
    }

    console.log('Current transaction:', transaction)

    // Only update balance if status is changing to completed or approved
    const shouldUpdateBalance = (new_status === 'completed' || new_status === 'approved') && 
                               transaction.status !== 'completed' && 
                               transaction.status !== 'approved'

    if (shouldUpdateBalance) {
      console.log('Updating wallet balance for transaction:', transaction.id)

      // Get current wallet balance
      const { data: wallet, error: walletFetchError } = await supabaseClient
        .from('wallets')
        .select('balance')
        .eq('id', transaction.wallet_id)
        .single()

      if (walletFetchError) {
        console.error('Error fetching wallet:', walletFetchError)
        throw new Error('Wallet not found')
      }

      let newBalance = wallet.balance

      // Update balance based on transaction type
      switch (transaction.type) {
        case 'deposit':
        case 'wallet_deposit':
          newBalance += transaction.amount
          break
        case 'withdrawal':
        case 'wallet_withdrawal':
          newBalance -= transaction.amount
          break
        case 'giftcard_purchase':
          // Balance already deducted during purchase, no change needed
          break
        default:
          console.log('Unknown transaction type, no balance update:', transaction.type)
      }

      // Update wallet balance
      const { error: walletUpdateError } = await supabaseClient
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', transaction.wallet_id)

      if (walletUpdateError) {
        console.error('Error updating wallet balance:', walletUpdateError)
        throw new Error('Failed to update wallet balance')
      }

      console.log('Wallet balance updated from', wallet.balance, 'to', newBalance)
    }

    // Update transaction status
    const { data: updatedTransaction, error: updateError } = await supabaseClient
      .from('transactions')
      .update({ 
        status: new_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating transaction status:', updateError)
      throw new Error('Failed to update transaction status')
    }

    console.log('Transaction status updated successfully:', updatedTransaction)

    // Update corresponding activity record status
    if (transaction.wallet_deposit_id) {
      const { error: depositUpdateError } = await supabaseClient
        .from('wallet_deposit')
        .update({ 
          status: new_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.wallet_deposit_id)

      if (depositUpdateError) {
        console.error('Error updating deposit status:', depositUpdateError)
      } else {
        console.log('Deposit status updated to:', new_status)
      }
    }

    if (transaction.wallet_withdrawal_id) {
      const { error: withdrawalUpdateError } = await supabaseClient
        .from('wallet_withdrawal')
        .update({ 
          status: new_status,
          updated_at: new Date().toISOString(),
          processed_at: new_status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', transaction.wallet_withdrawal_id)

      if (withdrawalUpdateError) {
        console.error('Error updating withdrawal status:', withdrawalUpdateError)
      } else {
        console.log('Withdrawal status updated to:', new_status)
      }
    }

    if (transaction.user_giftcard_id) {
      const { error: giftcardUpdateError } = await supabaseClient
        .from('user_giftcards')
        .update({ 
          status: new_status === 'completed' ? 'active' : 'pending',
          used_at: new_status === 'completed' ? null : undefined
        })
        .eq('id', transaction.user_giftcard_id)

      if (giftcardUpdateError) {
        console.error('Error updating gift card status:', giftcardUpdateError)
      } else {
        console.log('Gift card status updated to:', new_status === 'completed' ? 'active' : 'pending')
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction: updatedTransaction,
        balance_updated: shouldUpdateBalance
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})