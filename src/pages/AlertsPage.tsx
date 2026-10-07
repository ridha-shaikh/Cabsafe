import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { alertService } from '../services';

export default function AlertsPage() {
  const { data, loading } = useServiceData(() => alertService.getAll());

  return (
    <PageContainer title="Alerts" description="View and manage alert records.">
      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">Alerts Overview</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            {loading && data.length === 0 ? (
               <div className="p-8 text-center text-text-secondary">Loading data...</div>
            ) : data.length === 0 ? (
               <div className="p-8 text-center text-text-secondary">No records found.</div>
            ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="capitalize">alert Id</TableHead><TableHead className="capitalize">title</TableHead><TableHead className="capitalize">severity</TableHead><TableHead className="capitalize">status</TableHead><TableHead className="capitalize">created At</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.map((row, i) => (
                     <TableRow key={i}>
                       <TableCell>{String(row.alertId)}</TableCell><TableCell>{String(row.title)}</TableCell><TableCell>{String(row.severity)}</TableCell><TableCell>{String(row.status)}</TableCell><TableCell>{String(row.createdAt)}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            )}
         </CardContent>
      </Card>
    </PageContainer>
  );
}
