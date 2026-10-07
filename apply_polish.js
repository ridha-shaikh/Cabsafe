const fs = require('fs');
const path = require('path');

function w(file, content) {
    fs.writeFileSync(path.join('src', ...file.split('/')), content);
    console.log('Wrote ' + file);
}

// 1. App.tsx (Auto-start simulation)
const appContent = \import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { simulationEngine } from './simulation/SimulationEngine';
import { useSimulationStore } from './store/simulationStore';
import { SimulationState } from './types/enums';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FleetPage from './pages/FleetPage';
import DriversPage from './pages/DriversPage';
import DriverDetailPage from './pages/DriverDetailPage';
import PassengersPage from './pages/PassengersPage';
import BookingsPage from './pages/BookingsPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import SafetyEventsPage from './pages/SafetyEventsPage';
import SOSPage from './pages/SOSPage';
import AlertsPage from './pages/AlertsPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';
import DatabaseOverviewPage from './pages/DatabaseOverviewPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Auto-start simulation when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      useSimulationStore.getState().updateConfig({ state: SimulationState.RUNNING });
      simulationEngine.start();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/fleet" element={<FleetPage />} />
                  <Route path="/drivers" element={<DriversPage />} />
                  <Route path="/drivers/:id" element={<DriverDetailPage />} />
                  <Route path="/passengers" element={<PassengersPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/trips" element={<TripsPage />} />
                  <Route path="/trips/:id" element={<TripDetailPage />} />
                  <Route path="/monitoring" element={<LiveMonitoringPage />} />
                  <Route path="/events" element={<SafetyEventsPage />} />
                  <Route path="/sos" element={<SOSPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/database" element={<DatabaseOverviewPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
\;
w('App.tsx', appContent);

// 2. LoginPage.tsx
const loginContent = \import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ShieldCheck, ArrowRight } from 'lucide-react';

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
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-background animate-fade-in">
      {/* LEFT SIDE: Deep Immersive Petrol/Navy */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-start p-20 relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(135deg, #091221 0%, #113645 50%, #0d4a46 100%)' }}>
        
        {/* Abstract Mobility Network SVG overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M-100,500 C200,400 400,600 800,200 C1000,0 1200,300 1500,100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <path d="M-100,600 C150,550 300,700 700,400 C900,200 1100,400 1500,200" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle cx="350" cy="485" r="4" fill="rgba(255,255,255,0.4)" />
          <circle cx="800" cy="200" r="4" fill="rgba(255,255,255,0.4)" />
          <circle cx="700" cy="400" r="4" fill="rgba(255,255,255,0.4)" />
        </svg>

        <div className="z-10 text-left max-w-lg w-full">
          <div className="bg-white/10 backdrop-blur-md w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center mb-12 border border-white/20">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Protecting<br/>every<br/>passenger.
          </h1>
          <p className="text-xl text-white/70 leading-relaxed font-medium">
            Safer journeys, every day.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
             <div className="bg-[#113645] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <ShieldCheck className="h-8 w-8 text-white" />
             </div>
             <h1 className="text-4xl font-extrabold text-text-main tracking-tight">CabSafe</h1>
          </div>
          
          <h2 className="text-3xl font-extrabold text-text-main mb-2 tracking-tight">Welcome back</h2>
          <p className="text-text-secondary mb-10 font-medium text-lg">Sign in to your command center.</p>

          <Card className="border border-border/50 shadow-2xl shadow-text-main/5 bg-white">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main uppercase tracking-wide">Email Address</label>
                  <Input type="email" defaultValue="admin@cabsafe.com" required className="w-full bg-background border-border focus:ring-primary focus:border-primary py-3 px-4 font-medium transition-shadow hover:shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main uppercase tracking-wide">Password</label>
                  <Input type="password" defaultValue="password" required className="w-full bg-background border-border focus:ring-primary focus:border-primary py-3 px-4 font-medium transition-shadow hover:shadow-sm" />
                </div>
                
                <Button type="submit" className="w-full py-4 mt-8 text-lg font-bold bg-[#4A7C59] hover:bg-[#386044] text-white shadow-lg shadow-[#4A7C59]/20 transition-all flex justify-center items-center rounded-xl" disabled={loading}>
                  {loading ? 'Authenticating...' : <span className="flex items-center">Sign In <ArrowRight className="ml-2 h-5 w-5" /></span>}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center mt-12">
            <p className="text-xs text-text-secondary/70 uppercase tracking-widest font-extrabold">Demo Environment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
\;
w('pages/LoginPage.tsx', loginContent);

// 3. StatCard.tsx (Softer colours)
const statCardContent = \import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  variant?: 'default' | 'sage' | 'teal' | 'amber' | 'coral' | 'peach';
}

export function StatCard({ title, value, icon, trend, description, variant = 'default' }: StatCardProps) {
  const isColored = variant !== 'default';
  
  // Rich but softened pastel-leaning colors
  const bgClasses = {
    default: 'bg-surface border-border',
    sage: 'bg-[#6F9F83] text-white border-[#5A876B]', // Soft warm sage
    teal: 'bg-[#528F9E] text-white border-[#417987]', // Soft muted teal
    amber: 'bg-[#E3B062] text-white border-[#D19E50]', // Soft warm amber
    coral: 'bg-[#D67171] text-white border-[#C26262]', // Soft muted coral
    peach: 'bg-[#F0A997] text-white border-[#D99584]'  // Soft peach
  };

  const textClasses = {
    default: 'text-text-main',
    sage: 'text-white',
    teal: 'text-white',
    amber: 'text-white',
    coral: 'text-white',
    peach: 'text-white'
  };

  const iconBgClasses = {
    default: 'bg-background border-border text-text-main',
    sage: 'bg-[#5A876B] border-[#4B735A] text-white',
    teal: 'bg-[#417987] border-[#34626E] text-white',
    amber: 'bg-[#D19E50] border-[#BC8C44] text-white',
    coral: 'bg-[#C26262] border-[#AE5555] text-white',
    peach: 'bg-[#D99584] border-[#C28271] text-white'
  };

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200 border", bgClasses[variant])}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold uppercase tracking-wider text-white/90">{title}</p>
          <div className={cn("p-2 rounded-lg border", iconBgClasses[variant])}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline space-x-3">
          <div className={cn("text-4xl font-extrabold tracking-tight", textClasses[variant])}>{value}</div>
          {trend && (
            <div
              className={cn(
                'text-xs font-bold px-2 py-0.5 rounded-full',
                isColored 
                  ? 'bg-white/20 text-white' 
                  : trend.isPositive ? 'bg-primary-light text-primary' : 'bg-danger-light text-danger'
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {description && (
          <p className="mt-2 text-xs font-medium text-white/80">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
\;
w('components/charts/StatCard.tsx', statCardContent);

console.log("Done phase 1 scripts.");
