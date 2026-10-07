import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockDatabase } from '../repositories/mock/mockDatabase';

export default function DatabaseOverviewPage() {
  const tables = Object.keys(mockDatabase).map(key => ({
    name: key,
    count: (mockDatabase as any)[key].length
  }));

  return (
    <PageContainer title="Database Overview" description="Schema and row counts for the local Mock DB.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(t => (
          <Card key={t.name} className="bg-surface border-border shadow-sm">
             <CardHeader className="border-b border-border bg-background">
                <CardTitle className="text-base font-extrabold capitalize text-text-main">{t.name}</CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="text-3xl font-extrabold text-brand-primary">{t.count}</div>
                <div className="text-sm font-medium text-text-secondary mt-1">Rows in table</div>
             </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
