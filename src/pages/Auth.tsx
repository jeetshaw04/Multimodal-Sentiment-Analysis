import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';
import AuthBackground3D from '@/components/AuthBackground3D';
import Starfield from '@/components/Starfield';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <Starfield />
      <AuthBackground3D />
      
      <div className="w-full max-w-md px-6 py-12 relative z-10">
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold italic">
              <span className="text-indisense-purple">Indi</span>
              <span className="text-indisense-cyan">Sense</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          <AuthForm 
            mode={mode} 
            onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
