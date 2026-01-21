import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/30">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold italic">
          <span className="text-indisense-purple">Indi</span>
          <span className="text-indisense-cyan">Sense</span>
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
};

export default Header;
