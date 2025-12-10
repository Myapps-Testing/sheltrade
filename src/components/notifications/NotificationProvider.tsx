import { useTransactionNotifications, usePushNotificationPermission } from '@/hooks/useTransactionNotifications';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Initialize transaction notifications
  useTransactionNotifications();
  
  // Request push notification permission
  usePushNotificationPermission();
  
  return <>{children}</>;
}
