import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
}

const statusMessages: Record<string, { title: string; variant: 'default' | 'destructive' }> = {
  completed: { title: '✅ Transaction Completed', variant: 'default' },
  approved: { title: '✅ Transaction Approved', variant: 'default' },
  rejected: { title: '❌ Transaction Rejected', variant: 'destructive' },
  failed: { title: '❌ Transaction Failed', variant: 'destructive' },
  pending: { title: '⏳ Transaction Pending', variant: 'default' },
  processing: { title: '🔄 Transaction Processing', variant: 'default' },
};

const typeLabels: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  giftcard_purchase: 'Gift Card Purchase',
  giftcard_sell: 'Gift Card Sale',
  crypto_buy: 'Crypto Purchase',
  crypto_sell: 'Crypto Sale',
  bill_payment: 'Bill Payment',
  mobile_topup: 'Mobile Top-Up',
};

const saveNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  transactionId?: string
) => {
  try {
    await supabase.from('user_notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      transaction_id: transactionId,
      is_read: false,
    });
  } catch (error) {
    console.error('Failed to save notification:', error);
  }
};

// Request push notification permission and show notification
const showPushNotification = async (title: string, body: string) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/logo.png' });
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, { body, icon: '/logo.png' });
    }
  }
};

export function useTransactionNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const previousStatusRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Load initial transaction statuses
    const loadInitialStatuses = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('id, status')
        .eq('user_id', user.id);
      
      if (data) {
        data.forEach(tx => {
          previousStatusRef.current.set(tx.id, tx.status);
        });
      }
    };

    loadInitialStatuses();

    // Subscribe to transaction updates
    const channel = supabase
      .channel('transaction-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const newTx = payload.new as Transaction;
          const oldStatus = previousStatusRef.current.get(newTx.id);
          
          // Only notify if status actually changed
          if (oldStatus && oldStatus !== newTx.status) {
            const statusInfo = statusMessages[newTx.status] || { 
              title: `Transaction Status: ${newTx.status}`, 
              variant: 'default' as const 
            };
            const typeLabel = typeLabels[newTx.type] || newTx.type;
            
            const formattedAmount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: newTx.currency,
            }).format(newTx.amount);

            const description = `Your ${typeLabel} of ${formattedAmount} has been ${newTx.status}.${newTx.description ? ` ${newTx.description}` : ''}`;

            // Show toast notification
            toast({
              title: statusInfo.title,
              description,
              variant: statusInfo.variant,
              duration: 6000,
            });

            // Save to database
            await saveNotification(
              user.id,
              statusInfo.title,
              description,
              'transaction',
              newTx.id
            );

            // Show push notification
            await showPushNotification(statusInfo.title, description);
          }
          
          // Update the cached status
          previousStatusRef.current.set(newTx.id, newTx.status);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const newTx = payload.new as Transaction;
          const typeLabel = typeLabels[newTx.type] || newTx.type;
          
          const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: newTx.currency,
          }).format(newTx.amount);

          // Only notify for new transactions (not initial load)
          if (previousStatusRef.current.size > 0) {
            const title = '🆕 New Transaction';
            const description = `${typeLabel} of ${formattedAmount} has been initiated.`;

            toast({
              title,
              description,
              duration: 4000,
            });

            // Save to database
            await saveNotification(user.id, title, description, 'transaction', newTx.id);

            // Show push notification
            await showPushNotification(title, description);
          }
          
          previousStatusRef.current.set(newTx.id, newTx.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
}

// Hook to request push notification permission on app load
export function usePushNotificationPermission() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Request permission when user interacts with the page
      const requestPermission = () => {
        Notification.requestPermission();
        document.removeEventListener('click', requestPermission);
      };
      document.addEventListener('click', requestPermission);
      return () => document.removeEventListener('click', requestPermission);
    }
  }, []);
}
