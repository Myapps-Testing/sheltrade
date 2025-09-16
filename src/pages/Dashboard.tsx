import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { WalletBalance } from "@/components/dashboard/WalletBalance";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { GiftCardGrid } from "@/components/giftcards/GiftCardGrid";
import { Wallet, TrendingUp, CreditCard, Users, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import giftCardsImage from "@/assets/gift-cards.jpg";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("dashboard");

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder-avatar.jpg"
  };

  // Mock transaction data
  const transactions = [
    {
      id: "1",
      type: "credit" as const,
      amount: 250.00,
      currency: "USD",
      description: "Gift card sale - Amazon",
      timestamp: new Date().toISOString(),
      status: "completed" as const
    },
    {
      id: "2",
      type: "debit" as const,
      amount: 50.00,
      currency: "USD",
      description: "Mobile top-up",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "completed" as const
    },
    {
      id: "3",
      type: "giftcard" as const,
      amount: 100.00,
      currency: "USD",
      description: "iTunes Gift Card Purchase",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: "pending" as const
    }
  ];

  // Mock gift card data
  const featuredGiftCards = [
    {
      id: "1",
      brand: "Amazon",
      denomination: 25,
      currency: "USD",
      discount: 5,
      rating: 4.8,
      image: giftCardsImage,
      popular: true,
      category: "E-commerce"
    },
    {
      id: "2",
      brand: "iTunes",
      denomination: 50,
      currency: "USD",
      rating: 4.9,
      image: giftCardsImage,
      category: "Entertainment"
    },
    {
      id: "3",
      brand: "Google Play",
      denomination: 100,
      currency: "USD",
      discount: 3,
      rating: 4.7,
      image: giftCardsImage,
      category: "Entertainment"
    },
    {
      id: "4",
      brand: "Steam",
      denomination: 20,
      currency: "USD",
      rating: 4.6,
      image: giftCardsImage,
      popular: true,
      category: "Gaming"
    }
  ];

  const handleQuickAction = (action: string) => {
    console.log("Quick action:", action);
    // Here you would handle the routing or modal opening for each action
  };

  const handleGiftCardSelect = (card: any) => {
    console.log("Selected gift card:", card);
    // Here you would handle gift card purchase flow
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
          value="$2,350.00"
          change="+12.5% from last month"
          changeType="positive"
          icon={Wallet}
          gradient
        />
        <StatsCard
          title="Total Transactions"
          value="156"
          change="+8.2% from last month"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Gift Cards Sold"
          value="23"
          change="+15.3% from last month"
          changeType="positive"
          icon={Gift}
        />
        <StatsCard
          title="Active Sessions"
          value="1,023"
          change="-2.1% from last month"
          changeType="negative"
          icon={Users}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <WalletBalance balance={2350.00} currency="USD" pendingBalance={125.50} />
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
          giftCards={featuredGiftCards} 
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
        giftCards={[...featuredGiftCards, ...featuredGiftCards.map(card => ({
          ...card,
          id: card.id + "_2",
          denomination: card.denomination * 2,
          popular: false
        }))]} 
        onSelectCard={handleGiftCardSelect}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && renderDashboard()}
        {currentView === "giftcards" && renderGiftCards()}
      </main>
    </div>
  );
}