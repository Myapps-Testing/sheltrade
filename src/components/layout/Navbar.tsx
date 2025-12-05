import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, Bell, User, LogOut, History, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const navigate = useNavigate();

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
            <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => navigate('/about')} className="text-muted-foreground hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => navigate('/contact')} className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </button>
            {user && (
              <>
                <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </button>
                <button onClick={() => navigate('/transactions')} className="text-muted-foreground hover:text-primary transition-colors">
                  Transactions
                </button>
              </>
            )}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/transactions')}>
                      <History className="mr-2 h-4 w-4" />
                      Transaction History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button variant="financial" onClick={() => navigate('/auth')}>
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
              <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary transition-colors px-2 py-1 text-left">
                Home
              </button>
              <button onClick={() => navigate('/about')} className="text-muted-foreground hover:text-primary transition-colors px-2 py-1 text-left">
                About
              </button>
              <button onClick={() => navigate('/contact')} className="text-muted-foreground hover:text-primary transition-colors px-2 py-1 text-left">
                Contact
              </button>
              {user && (
                <>
                  <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-primary transition-colors px-2 py-1 text-left">
                    Dashboard
                  </button>
                  <button onClick={() => navigate('/transactions')} className="text-muted-foreground hover:text-primary transition-colors px-2 py-1 text-left">
                    Transactions
                  </button>
                  <button onClick={() => navigate('/profile')} className="text-muted-foreground hover:text-primary transition-colors px-2 py-1 text-left">
                    Profile Settings
                  </button>
                </>
              )}
              
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
                  <Button variant="ghost" onClick={() => navigate('/auth')} className="justify-start">
                    Sign In
                  </Button>
                  <Button variant="financial" onClick={() => navigate('/auth')}>
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
