import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { WalletBalance } from "@/components/dashboard/WalletBalance";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { GiftCardGrid } from "@/components/giftcards/GiftCardGrid";
import { FundModal } from "@/components/transactions/FundModal";
import { BuyGiftCardModal } from "@/components/giftcards/BuyGiftCardModal";
import { Wallet, TrendingUp, Gift, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("dashboard");
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundModalType, setFundModalType] = useState<'add' | 'withdraw'>('add');
  const [giftCardModalOpen, setGiftCardModalOpen] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    giftCardsSold: 0,
    activeSessions: 1023
  });

  const { user: authUser, profile, wallet, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (authUser) {
      loadTransactions();
      loadGiftCards();
      loadStats();
    }
  }, [authUser]);

  useEffect(() => {
    // Handle route-based modal opening
    if (location.pathname === '/dashboard/deposit') {
      setFundModalType('add');
      setFundModalOpen(true);
    } else if (location.pathname === '/dashboard/withdraw') {
      setFundModalType('withdraw');
      setFundModalOpen(true);
    }
  }, [location.pathname]);

  const loadTransactions = async () => {
    if (!authUser) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error loading transactions:', error);
    } else {
      setTransactions(data || []);
    }
  };

  const loadGiftCards = async () => {
    const { data, error } = await supabase
      .from('giftcards')
      .select('*')
      .eq('is_active', true)
      .order('brand');
    
    if (error) {
      console.error('Error loading gift cards:', error);
    } else {
      setGiftCards(data || []);
    }
  };

  const loadStats = async () => {
    if (!authUser) return;
    
    const { data: transactionCount } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.id);
    
    const { data: giftCardCount } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('type', 'giftcard_purchase');
    
    setStats({
      totalTransactions: transactionCount?.length || 0,
      giftCardsSold: giftCardCount?.length || 0,
      activeSessions: 1023
    });
  };

  const user = profile ? {
    name: `${profile.first_name} ${profile.last_name}`,
    email: authUser?.email || '',
    avatar: profile.avatar_url
  } : null;

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add_funds':
        navigate('/dashboard/deposit');
        break;
      case 'withdraw':
        navigate('/dashboard/withdraw');
        break;
      case 'buy_giftcard':
        setCurrentView('giftcards');
        break;
      case 'crypto':
        toast({
          title: "Coming Soon",
          description: "Cryptocurrency trading will be available soon!",
        });
        break;
      case 'bills':
        toast({
          title: "Coming Soon", 
          description: "Bill payments will be available soon!",
        });
        break;
      case 'mobile_topup':
        toast({
          title: "Coming Soon",
          description: "Mobile top-up will be available soon!",
        });
        break;
      default:
        console.log("Quick action:", action);
    }
  };

  const handleGiftCardSelect = (card: any) => {
    setSelectedGiftCard(card);
    setGiftCardModalOpen(true);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const notifications = [
    {
      id: "1",
      title: "Transaction Completed",
      message: "Your Amazon gift card purchase has been processed successfully.",
      type: "success",
      timestamp: "2 minutes ago"
    },
    {
      id: "2",
      title: "Wallet Credited",
      message: "Your account has been credited with $250.00",
      type: "info",
      timestamp: "1 hour ago"
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Balance"
          value={wallet ? `$${wallet.balance.toFixed(2)}` : "$0.00"}
          change="+12.5% from last month"
          changeType="positive"
          icon={Wallet}
          gradient
        />
        <StatsCard
          title="Total Transactions"
          value={stats.totalTransactions.toString()}
          change="+8.2% from last month"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Gift Cards Sold"
          value={stats.giftCardsSold.toString()}
          change="+15.3% from last month"
          changeType="positive"
          icon={Gift}
        />
        <StatsCard
          title="Active Sessions"
          value={stats.activeSessions.toLocaleString()}
          change="-2.1% from last month"
          changeType="negative"
          icon={Users}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <WalletBalance 
            balance={wallet?.balance || 0} 
            currency={wallet?.currency || "USD"} 
            pendingBalance={0} 
          />
          <RecentTransactions transactions={transactions} />
        </div>
        
        <div className="space-y-6">
          <QuickActions onAction={handleQuickAction} />
          
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {notification.timestamp}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full">
                  View All Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Gift Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Gift Cards</h2>
          <Button variant="outline" onClick={() => setCurrentView("giftcards")}>
            View All
          </Button>
        </div>
        <GiftCardGrid 
          giftCards={giftCards.slice(0, 4)} 
          onSelectCard={handleGiftCardSelect}
        />
      </div>
    </div>
  );

  const renderGiftCards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gift Card Marketplace</h1>
        <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="md:col-span-4 lg:col-span-1 gradient-card">
          <CardContent className="p-6 text-center">
            <Gift className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Marketplace Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Available Cards:</span>
                <span className="font-medium">1,200+</span>
              </div>
              <div className="flex justify-between">
                <span>Categories:</span>
                <span className="font-medium">25</span>
              </div>
              <div className="flex justify-between">
                <span>Avg. Discount:</span>
                <span className="font-medium text-success">7.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <GiftCardGrid 
        giftCards={giftCards} 
        onSelectCard={handleGiftCardSelect}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
      <Navbar 
        user={user && profile ? {
          name: `${profile.first_name} ${profile.last_name}`,
          email: user.email || '',
          avatar: profile.avatar_url
        } : undefined}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && renderDashboard()}
        {currentView === "giftcards" && renderGiftCards()}
      </main>

      <FundModal 
        open={fundModalOpen} 
        onOpenChange={(open) => {
          setFundModalOpen(open);
          if (!open) {
            navigate('/dashboard');
          }
        }} 
        type={fundModalType} 
      />
      
      <BuyGiftCardModal 
        open={giftCardModalOpen} 
        onOpenChange={setGiftCardModalOpen} 
        giftCard={selectedGiftCard} 
      />

      <FloatingChat />
    </div>
  );
}