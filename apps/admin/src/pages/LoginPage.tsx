import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Input, Button, useToast } from '@qrdine/ui';
import { authService } from '@qrdine/lib';
import { KeyRound, Mail, UtensilsCrossed } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, restaurantId, loading: authLoading, refreshAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-redirect logged in users to dashboard or onboarding
  useEffect(() => {
    if (!authLoading && user) {
      if (restaurantId) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, restaurantId, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter email and password', 'warning');
      return;
    }

    try {
      setLoading(true);
      const { error } = await authService.signIn(email, password);
      
      if (error) {
        toast(error.message, 'error');
      } else {
        toast('Logged in successfully', 'success');
        await refreshAuth();
        navigate('/');
      }
    } catch (err: any) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await authService.signInWithGoogle();
      if (error) {
        toast(error.message, 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Google Sign-in failed', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Prevent flash of form for already authenticated users
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
        <span className="text-xs uppercase tracking-wider text-slate-500">Restoring workspace session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Decorators */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md p-8 border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <span className="p-3 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="w-8 h-8" />
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">Welcome Back</h2>
          <p className="text-sm text-slate-400">Sign in to manage your QR Dine OS</p>
        </div>

        {/* Google Sign In Button */}
        <Button
          variant="secondary"
          isLoading={googleLoading}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-800 text-slate-200"
          leftIcon={
            <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          }
        >
          Sign in with Google
        </Button>

        {/* Separator */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute w-full border-t border-slate-800" />
          <span className="relative px-3 text-xs uppercase bg-slate-900/60 backdrop-blur-md text-slate-500 font-semibold tracking-wider">
            Or email sign in
          </span>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
          />

          <Button type="submit" isLoading={loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};
export default LoginPage;
