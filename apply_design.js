const fs = require('fs');
const path = require('path');

function replace(file, search, replace) {
    let p = path.join('src', file);
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(search, replace);
        fs.writeFileSync(p, content);
        console.log('Updated ' + file);
    } else {
        console.log('Not found ' + file);
    }
}

// 1. LoginPage
const loginContent = import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ShieldCheck, Navigation } from 'lucide-react';

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
      {/* LEFT SIDE: Brand */}
      <div className="hidden lg:flex w-1/2 bg-primary-light flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6F8F7A 0%, transparent 50%), radial-gradient(circle at 80% 80%, #7FA7B8 0%, transparent 50%)' }}></div>
        <div className="z-10 text-center max-w-md">
          <div className="mx-auto bg-surface w-20 h-20 rounded-2xl shadow-sm flex items-center justify-center mb-8">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-text-main mb-4 tracking-tight">CabSafe</h1>
          <p className="text-xl text-text-secondary leading-relaxed">Keep every journey safer. Monitor your fleet, trips, and passenger safety in real time.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
             <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
             <h1 className="text-3xl font-bold text-text-main">CabSafe</h1>
          </div>
          
          <h2 className="text-2xl font-semibold text-text-main mb-2">Welcome back</h2>
          <p className="text-text-secondary mb-8">Sign in to your operations center.</p>

          <Card className="border-0 shadow-xl shadow-gray-200/50">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-main">Email Address</label>
                  <Input type="email" defaultValue="admin@cabsafe.com" required className="w-full bg-background border-border focus:ring-primary focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-main">Password</label>
                  <Input type="password" defaultValue="password" required className="w-full bg-background border-border focus:ring-primary focus:border-primary" />
                </div>
                
                <Button type="submit" className="w-full py-3 mt-4 text-base bg-primary hover:bg-opacity-90 text-white shadow-sm" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Demo Environment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
;
fs.writeFileSync(path.join('src', 'pages', 'LoginPage.tsx'), loginContent);

// 2. Sidebar component
const sidebarContent = import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Car, Users, Navigation, AlertTriangle, Settings, Database, FileText, UserCog, Tool>

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/monitoring', icon: Navigation, label: 'Live Map' },
  { to: '/fleet', icon: Car, label: 'Fleet' },
  { to: '/drivers', icon: UserCog, label: 'Drivers' },
  { to: '/passengers', icon: Users, label: 'Passengers' },
  { to: '/events', icon: AlertTriangle, label: 'Safety Events' },
  { to: '/sos', icon: ShieldCheck, label: 'SOS Alerts' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/database', icon: Database, label: 'DB Overview' },
];

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-sidebar border-r border-border flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <ShieldCheck className="h-6 w-6 text-primary mr-3" />
        <span className="text-xl font-bold text-text-main tracking-tight">CabSafe</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 px-2">Operations</div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                \lex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 \\
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={\h-5 w-5 mr-3 \\} />
                  {link.label}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center px-3 py-2 rounded-lg bg-white border border-border shadow-sm">
          <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-text-main leading-tight">Admin User</p>
            <p className="text-xs text-text-secondary">Fleet Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
;
fs.writeFileSync(path.join('src', 'components', 'layout', 'Sidebar.tsx'), sidebarContent.replace('Tool>', 'Tool} from "lucide-react";'));

console.log("Done");
