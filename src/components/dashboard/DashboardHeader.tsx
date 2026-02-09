import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { Sparkles, LogOut, Coins, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardHeader() {
  const { user, signOut } = useAuth();
  const { data: credits, isLoading: creditsLoading } = useCredits();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-serif font-semibold text-foreground">FashionAI</span>
        </a>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Credits */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <Coins className="w-4 h-4 text-primary" />
            {creditsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-sm font-medium">{credits ?? 0} credits</span>
            )}
          </div>

          {/* User email */}
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.email}
          </span>

          {/* Sign out */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
