import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login();
      navigate('/');
    }, 800); // Simulate network
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary-600">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">CabSafe</CardTitle>
          <p className="text-sm text-gray-500">Fleet & Safety Monitoring System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <Input type="email" defaultValue="admin@cabsafe.com" required className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input type="password" defaultValue="password" required className="w-full" />
            </div>
            
            <Button type="submit" variant="primary" className="w-full mt-6 py-2.5 text-lg" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">DBMS Academic Project — Mock Authentication</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
