import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Gift, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  Star,
  CheckCircle,
  ArrowRight,
  Smartphone,
  CreditCard
} from "lucide-react";
import heroImage from "@/assets/hero-finance.jpg";
import walletImage from "@/assets/wallet-dashboard.jpg";
import giftCardsImage from "@/assets/gift-cards.jpg";

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const features = [
    {
      icon: Wallet,
      title: "Secure Wallet Management",
      description: "Manage your digital wallet with bank-level security and real-time transaction monitoring."
    },
    {
      icon: Gift,
      title: "Gift Card Marketplace",
      description: "Buy and sell gift cards from top brands with competitive rates and instant delivery."
    },
    {
      icon: Smartphone,
      title: "Mobile Top-up Services",
      description: "Instantly recharge mobile phones across multiple networks and countries."
    },
    {
      icon: CreditCard,
      title: "Bill Payment Solutions",
      description: "Pay utility bills, subscriptions, and services seamlessly from one platform."
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Multi-layer security protocols ensure your transactions and data are always protected."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Experience instant transactions and real-time updates across all your activities."
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Transactions", value: "$10M+", icon: TrendingUp },
    { label: "Gift Cards", value: "1,200+", icon: Gift },
    { label: "Countries", value: "25+", icon: Zap }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Owner",
      content: "Sheltrade has revolutionized how I manage my business payments. The gift card marketplace is incredible!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Freelancer",
      content: "Fast, secure, and reliable. I've been using Sheltrade for over a year and couldn't be happier.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      content: "The mobile app makes it so easy to top up my phone and manage my wallet on the go.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div onClick={() => window.location.href = '/'} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-text-light" />
              </div>
              <span className="text-xl font-bold text-foreground">Sheltrade</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="/services" className="text-muted-foreground hover:text-primary transition-colors">Services</a>
              <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
              <Button variant="financial" onClick={() => window.location.href = '/auth'}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  🚀 New: Enhanced Security Features
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Your Complete
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Financial</span>
                  <br />Platform
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Secure wallet management, gift card trading, mobile top-ups, and bill payments - all in one powerful platform trusted by thousands.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button size="lg" variant="financial" onClick={() => window.location.href = '/auth'} className="shadow-glow">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = '/auth'}>
                  Sign In
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>No hidden fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="relative z-10">
                <img 
                  src={heroImage} 
                  alt="Sheltrade Platform" 
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <stat.icon className="w-8 h-8 mx-auto text-primary" />
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Everything You Need for Digital Finance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial tools designed to simplify your digital transactions and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all group cursor-pointer">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Intuitive Dashboard for Complete Control
              </h2>
              <p className="text-lg text-muted-foreground">
                Monitor your transactions, manage your wallet, and access all services through our user-friendly dashboard designed for both beginners and professionals.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Real-time transaction monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Advanced analytics and reporting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Multi-currency support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Mobile-first responsive design</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={walletImage} 
                alt="Dashboard Preview" 
                className="rounded-xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Trusted by Thousands Worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our users have to say about their Sheltrade experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-light">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Financial Experience?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of users who trust Sheltrade for their digital financial needs. Get started today and experience the future of financial services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary" onClick={() => window.location.href = '/auth'}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-text-light text-text-light hover:bg-text-light hover:text-primary-color-1">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-text-light" />
                </div>
                <span className="text-xl font-bold">Sheltrade</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted partner for secure digital financial services and transactions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Wallet Management</div>
                <div>Gift Card Trading</div>
                <div>Mobile Top-up</div>
                <div>Bill Payments</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>About Us</div>
                <div>Careers</div>
                <div>Press</div>
                <div>Contact</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Help Center</div>
                <div>API Documentation</div>
                <div>Status</div>
                <div>Security</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Sheltrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}