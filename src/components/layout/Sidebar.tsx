import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Car,
  Users,
  Navigation,
  AlertTriangle,
  FileText,
  UserCog,
  Database,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import UserProfileModal from '../profile/UserProfileModal';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/monitoring', icon: Navigation, label: 'Live Map' },
  { to: '/fleet', icon: Car, label: 'Fleet' },
  { to: '/telemetry-monitor', icon: Activity, label: 'Telemetry Monitor' },
  { to: '/drivers', icon: UserCog, label: 'Drivers' },
  { to: '/passengers', icon: Users, label: 'Passengers' },
  { to: '/events', icon: AlertTriangle, label: 'Safety Events' },
  { to: '/sos', icon: ShieldCheck, label: 'SOS Alerts' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/database', icon: Database, label: 'DB Overview' },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const displayName = user?.name || 'User';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <>
      <div className="w-64 h-screen bg-text-main border-r border-text-main flex flex-col fixed left-0 top-0 shadow-2xl z-30">
        <div className="h-20 flex items-center px-6 border-b border-white/10 bg-[#171d24]">
          <div className="h-10 w-28 bg-white rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="CabSafe Logo"
              className="w-full h-full object-cover scale-[1.45]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 bg-[#1e2630]">
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 px-2">
            Operations Center
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md border border-primary-light/20'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 mr-3 transition-colors ${
                        isActive ? 'text-white' : 'text-white/50'
                      }`}
                    />
                    {link.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 bg-[#171d24]">
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center px-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
            title="View Profile"
          >
            <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-inner border border-teal-400/30 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-white leading-tight truncate">
                {displayName}
              </p>
              {user?.email && (
                <p className="text-xs text-white/50 font-medium truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
