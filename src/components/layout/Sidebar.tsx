import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard,
  Car,
  Users,
  UserSquare2,
  CalendarDays,
  Map,
  Activity,
  ShieldAlert,
  PhoneCall,
  BellRing,
  Wrench,
  FileBarChart,
  Database,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Fleet', to: '/fleet', icon: Car },
  { name: 'Drivers', to: '/drivers', icon: Users },
  { name: 'Passengers', to: '/passengers', icon: UserSquare2 },
  { name: 'Bookings', to: '/bookings', icon: CalendarDays },
  { name: 'Trips', to: '/trips', icon: Map },
  { name: 'Monitoring', to: '/monitoring', icon: Activity },
  { name: 'Safety Events', to: '/safety-events', icon: ShieldAlert },
  { name: 'SOS', to: '/sos', icon: PhoneCall },
  { name: 'Alerts', to: '/alerts', icon: BellRing },
  { name: 'Maintenance', to: '/maintenance', icon: Wrench },
  { name: 'Reports', to: '/reports', icon: FileBarChart },
  { name: 'Database', to: '/database', icon: Database },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Car className="h-6 w-6 text-blue-500 mr-2" />
        <span className="text-xl font-bold text-white tracking-tight">CabSafe</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 text-sm text-slate-400">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
}
