import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockDatabase } from '../repositories/mock/mockDatabase';
import { Database, Table, Layers } from 'lucide-react';

export default function DatabaseOverviewPage() {
  const tables = Object.keys(mockDatabase).map(key => ({
    name: key,
    count: (mockDatabase as any)[key]?.length || 0,
  }));

  const totalRecords = tables.reduce((acc, t) => acc + t.count, 0);

  return (
    <PageContainer
      title="Database Overview"
      description="Local schema catalog, table inventory, and row counts for offline mock database."
    >
      <div className="mb-6 flex items-center justify-between p-4 bg-surface rounded-2xl border border-border">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal/10 rounded-xl text-teal">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main">Mock In-Memory Store</h3>
            <p className="text-xs text-text-secondary">
              Active when running offline without AWS credentials. Total records: {totalRecords}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 bg-background rounded-lg border border-border">
          <Layers className="h-4 w-4 text-primary" />
          <span>{tables.length} Tables Registered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(t => (
          <Card key={t.name} className="bg-surface border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-border bg-background pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-extrabold capitalize text-text-main flex items-center">
                  <Table className="h-4 w-4 mr-2 text-primary" />
                  {t.name}
                </CardTitle>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                  Table
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-extrabold text-primary">{t.count}</div>
              <div className="text-sm font-medium text-text-secondary mt-1">Rows in table</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
