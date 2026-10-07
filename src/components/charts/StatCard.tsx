import React from 'react';
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
