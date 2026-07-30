import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Input, Button, useToast } from '@qrdine/ui';
import { authService } from '@qrdine/lib';
import { KeyRound, Mail, ChefHat } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
        toast('Kitchen terminal logged in', 'success');
        await refreshAuth();
        navigate('/');
      }
    } catch (err: any) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      {/* Background Decorator */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md p-8 border border-slate-800/90 bg-slate-900/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <span className="p-3 rounded-2xl bg-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <ChefHat className="w-8 h-8" />
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">Kitchen Display System</h2>
          <p className="text-sm text-slate-500">Sign in to access the KDS terminal</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input
            id="email"
            type="email"
            label="KDS Email"
            placeholder="kitchen@restaurant.com"
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
            Enter Kitchen
          </Button>
        </form>
      </Card>
    </div>
  );
};
