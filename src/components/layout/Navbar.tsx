import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, CreditCard, Bell, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Navbar({ user, onLogin, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-text-light" />
              </div>
              <span className="text-xl font-bold text-foreground">Sheltrade</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="#wallet" className="text-muted-foreground hover:text-primary transition-colors">
              Wallet
            </a>
            <a href="#giftcards" className="text-muted-foreground hover:text-primary transition-colors">
              Gift Cards
            </a>
            <a href="#transactions" className="text-muted-foreground hover:text-primary transition-colors">
              Transactions
            </a>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={onLogin}>
                  Sign In
                </Button>
                <Button variant="financial" onClick={onLogin}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-3">
              <a href="#dashboard" className="text-muted-foreground hover:text-primary transition-colors px-2 py-1">
                Dashboard
              </a>
              <a href="#wallet" className="text-muted-foreground hover:text-primary transition-colors px-2 py-1">
                Wallet
              </a>
              <a href="#giftcards" className="text-muted-foreground hover:text-primary transition-colors px-2 py-1">
                Gift Cards
              </a>
              <a href="#transactions" className="text-muted-foreground hover:text-primary transition-colors px-2 py-1">
                Transactions
              </a>
              
              {user ? (
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-3 border-t border-border/50">
                  <Button variant="ghost" onClick={onLogin} className="justify-start">
                    Sign In
                  </Button>
                  <Button variant="financial" onClick={onLogin}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}