import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Search, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              SolStream
            </h1>
            
            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#" onClick={(e) => { e.preventDefault(); toast("Browse is coming soon."); }} className="text-sm font-medium hover:text-primary transition-colors">
                Browse
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); toast("Following is coming soon."); }} className="text-sm font-medium hover:text-primary transition-colors">
                Following
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); toast("Categories is coming soon."); }} className="text-sm font-medium hover:text-primary transition-colors">
                Categories
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search streams..." 
                className="pl-10 bg-secondary border-border/50"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-5 w-5" />
            </Button>
            
            <WalletMultiButton className="!bg-transparent" />
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
