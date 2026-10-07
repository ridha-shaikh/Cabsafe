import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '../ui/Input';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6 sticky top-0 z-10">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            type="search"
            placeholder="Search cabs, drivers, or trips..."
            className="w-full pl-9 bg-background border-border text-sm focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <button className="relative p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-full transition-colors">
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface"></span>
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
