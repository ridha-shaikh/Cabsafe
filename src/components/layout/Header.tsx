import React from 'react';
import { Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6 sticky top-0 z-10">
      <div className="flex flex-1 items-center">
        {/* Page-local search is preferred; global search removed */}
      </div>

      <div className="flex items-center space-x-5">
        <button className="relative p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-full transition-colors">

          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
