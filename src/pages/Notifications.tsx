import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Check, CheckCheck, ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  transaction_id?: string;
  metadata?: Record<string, any>;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user: authUser, profile, signOut } = useAuth();
  const { toast } = useToast();
  const { formatAmount } = useCurrency();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      loadNotifications();
    }
  }, [authUser]);

  const loadNotifications = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      // Get transactions and convert them to notifications
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;

      // Convert transactions to notification format
      const notifs: Notification[] = (transactions || []).map(tx => ({
        id: tx.id,
        title: getTransactionTitle(tx.type, tx.status),
        message: getTransactionMessage(tx),
        type: getNotificationType(tx.status),
        is_read: false, // We'd track this in a separate table in production
        created_at: tx.created_at,
        transaction_id: tx.id,
        metadata: { amount: tx.amount, currency: tx.currency, status: tx.status }
      }));

      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTitle = (type: string, status: string) => {
    const typeLabels: Record<string, string> = {
      'deposit': 'Deposit',
      'withdrawal': 'Withdrawal',
      'giftcard_purchase': 'Gift Card Purchase',
      'crypto_buy': 'Crypto Buy',
      'crypto_sell': 'Crypto Sell',
      'bill_payment': 'Bill Payment',
      'mobile_topup': 'Mobile Top-Up',
    };
    return `${typeLabels[type] || type} - ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  };

  const getTransactionMessage = (tx: any) => {
    const amount = formatAmount(tx.amount, tx.currency);
    return tx.description || `Transaction of ${amount}`;
  };

  const getNotificationType = (status: string): 'success' | 'info' | 'warning' | 'error' => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending':
        return 'info';
      case 'failed':
      case 'rejected':
        return 'error';
      default:
        return 'info';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const markAsRead = () => {
    setNotifications(prev => 
      prev.map(n => selectedIds.has(n.id) ? { ...n, is_read: true } : n)
    );
    toast({ title: "Marked as read", description: `${selectedIds.size} notifications marked as read` });
    setSelectedIds(new Set());
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast({ title: "All marked as read" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const user = profile ? {
    name: `${profile.first_name} ${profile.last_name}`,
    email: authUser?.email || '',
    avatar: profile.avatar_url
  } : undefined;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end overflow-y-auto">
      <Navbar user={user} onLogout={signOut} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <Button variant="outline" size="sm" onClick={markAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark as Read ({selectedIds.size})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">All Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedIds.size === notifications.length && notifications.length > 0}
                  onCheckedChange={selectAll}
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <Checkbox 
                      checked={selectedIds.has(notification.id)}
                      onCheckedChange={() => toggleSelect(notification.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <Badge variant={getTypeBadgeVariant(notification.type)} className="shrink-0">
                          {notification.metadata?.status || notification.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
