import React from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageContainer({ title, description, action, children }: PageContainerProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
          {description && <p className="text-slate-500">{description}</p>}
        </div>
        {action && <div className="flex items-center space-x-2">{action}</div>}
      </div>
      {children}
    </div>
  );
}
