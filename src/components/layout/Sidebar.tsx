import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Car, Users, Navigation, AlertTriangle, Database, FileText, UserCog, Menu } from "lucide-react";

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
    <div className="w-64 h-screen bg-text-main border-r border-text-main flex flex-col fixed left-0 top-0 shadow-2xl">
      <div className="h-20 flex items-center px-6 border-b border-white/10 bg-[#171d24]">
        <div className="bg-primary p-2 rounded-xl mr-3 shadow-lg">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold text-white tracking-tight">CabSafe</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 bg-[#1e2630]">
        <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 px-2">Operations Center</div>
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
                  <Icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-white/50'}`} />
                  {link.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/10 bg-[#171d24]">
        <div className="flex items-center px-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
          <div className="h-10 w-10 rounded-full bg-teal flex items-center justify-center text-white font-bold text-sm shadow-inner border border-teal-light/30">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-bold text-white leading-tight">Admin User</p>
            <p className="text-xs text-white/50 font-medium">Fleet Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
