import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Smartphone, 
  CreditCard, 
  Gift, 
  Bitcoin,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Clock
} from "lucide-react";

const services = [
  {
    id: 'mobile-topup',
    title: 'Mobile Top-Up',
    description: 'Instantly recharge mobile phones across all major networks. Buy airtime or data bundles with competitive rates.',
    icon: Smartphone,
    features: ['All Nigerian Networks', 'Instant Delivery', 'Data & Airtime', 'Discounted Rates'],
    badge: 'Popular',
    badgeVariant: 'default' as const,
    color: 'from-emerald-500 to-teal-600',
    route: '/dashboard?service=mobile-topup'
  },
  {
    id: 'bill-payment',
    title: 'Bill Payment',
    description: 'Pay your utility bills seamlessly. Electricity, cable TV, and more - all from one convenient platform.',
    icon: CreditCard,
    features: ['Electricity (Prepaid/Postpaid)', 'Cable TV (DSTV, GOtv, StarTimes)', 'Meter Verification', 'Instant Payment'],
    badge: 'Verified',
    badgeVariant: 'secondary' as const,
    color: 'from-blue-500 to-indigo-600',
    route: '/dashboard?service=bill-payment'
  },
  {
    id: 'crypto',
    title: 'Crypto Trading',
    description: 'Buy and sell cryptocurrencies with real-time prices. Track your portfolio and trade major coins.',
    icon: Bitcoin,
    features: ['Live CoinGecko Prices', 'Major Cryptocurrencies', 'Secure Transactions', 'Portfolio Tracking'],
    badge: 'Live Prices',
    badgeVariant: 'outline' as const,
    color: 'from-orange-500 to-amber-600',
    route: '/dashboard?service=crypto'
  },
  {
    id: 'gift-cards',
    title: 'Gift Cards',
    description: 'Buy, sell, and validate gift cards from top brands worldwide. Instant delivery with competitive rates.',
    icon: Gift,
    features: ['1,200+ Brands', 'Buy & Sell', 'Card Validation', 'Instant Redemption'],
    badge: 'Best Rates',
    badgeVariant: 'default' as const,
    color: 'from-purple-500 to-pink-600',
    route: '/dashboard?service=gift-cards'
  }
];

const benefits = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'All transactions processed in seconds'
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your data and funds are always protected'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Access our services anytime, anywhere'
  }
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div onClick={() => navigate('/')} className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-text-light" />
              </div>
              <span className="text-xl font-bold text-foreground">Sheltrade</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary transition-colors">Home</button>
              <button className="text-primary font-medium">Services</button>
              <button onClick={() => navigate('/about')} className="text-muted-foreground hover:text-primary transition-colors">About</button>
              <button onClick={() => navigate('/contact')} className="text-muted-foreground hover:text-primary transition-colors">Contact</button>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button variant="financial" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            All-in-One Platform
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive financial services designed to simplify your digital transactions. 
            From mobile top-ups to crypto trading, we've got you covered.
          </p>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{benefit.title}</p>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-border/50"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg`}>
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant={service.badgeVariant} className="text-xs">
                      {service.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mt-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                    onClick={() => navigate(service.route)}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-light">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Create your free account today and access all our services instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-text-light text-text-light hover:bg-text-light hover:text-primary-color-1"
              onClick={() => navigate('/contact')}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-text-light" />
              </div>
              <span className="font-bold">Sheltrade</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 Sheltrade. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/about')} className="hover:text-primary">About</button>
              <button onClick={() => navigate('/contact')} className="hover:text-primary">Contact</button>
              <button onClick={() => navigate('/license')} className="hover:text-primary">License</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
