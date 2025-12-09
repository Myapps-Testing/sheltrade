import { useTransactionNotifications } from '@/hooks/useTransactionNotifications';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Initialize transaction notifications
  useTransactionNotifications();
  
  return <>{children}</>;
}
