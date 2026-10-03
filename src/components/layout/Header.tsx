import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '../ui/Input';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search drivers, vehicles, or trips..."
            className="w-full pl-9 bg-slate-50"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors">
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>
        
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
            <User className="h-4 w-4 text-slate-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500">Fleet Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
