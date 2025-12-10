import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  email_deposit: boolean;
  email_withdrawal: boolean;
  email_giftcard: boolean;
  email_bill_payment: boolean;
  email_mobile_topup: boolean;
  push_deposit: boolean;
  push_withdrawal: boolean;
  push_giftcard: boolean;
  push_bill_payment: boolean;
  push_mobile_topup: boolean;
}

const defaultPreferences: Omit<NotificationPreferences, 'id' | 'user_id'> = {
  email_enabled: true,
  push_enabled: true,
  email_deposit: true,
  email_withdrawal: true,
  email_giftcard: true,
  email_bill_payment: false,
  email_mobile_topup: false,
  push_deposit: true,
  push_withdrawal: true,
  push_giftcard: true,
  push_bill_payment: true,
  push_mobile_topup: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No preferences exist, create default
        const { data: newData, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id, ...defaultPreferences })
          .select()
          .single();
        
        if (insertError) throw insertError;
        setPreferences(newData as NotificationPreferences);
      } else if (error) {
        throw error;
      } else {
        setPreferences(data as NotificationPreferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return false;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  };

  const shouldNotifyEmail = (transactionType: string): boolean => {
    if (!preferences?.email_enabled) return false;
    
    const typeMap: Record<string, keyof NotificationPreferences> = {
      'deposit': 'email_deposit',
      'withdrawal': 'email_withdrawal',
      'giftcard_purchase': 'email_giftcard',
      'giftcard_sell': 'email_giftcard',
      'bill_payment': 'email_bill_payment',
      'mobile_topup': 'email_mobile_topup',
    };
    
    const key = typeMap[transactionType];
    return key ? Boolean(preferences[key]) : preferences.email_enabled;
  };

  const shouldNotifyPush = (transactionType: string): boolean => {
    if (!preferences?.push_enabled) return false;
    
    const typeMap: Record<string, keyof NotificationPreferences> = {
      'deposit': 'push_deposit',
      'withdrawal': 'push_withdrawal',
      'giftcard_purchase': 'push_giftcard',
      'giftcard_sell': 'push_giftcard',
      'bill_payment': 'push_bill_payment',
      'mobile_topup': 'push_mobile_topup',
    };
    
    const key = typeMap[transactionType];
    return key ? Boolean(preferences[key]) : preferences.push_enabled;
  };

  return {
    preferences,
    loading,
    updatePreferences,
    shouldNotifyEmail,
    shouldNotifyPush,
    refreshPreferences: loadPreferences,
  };
}
