import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { maintenanceService } from '../services';

export default function MaintenancePage() {
  const { data, loading } = useServiceData(() => maintenanceService.getAll());

  return (
    <PageContainer title="Maintenance" description="View and manage maintenancerecord records.">
      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">Maintenance Overview</CardTitle>
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
                     <TableHead className="capitalize">maintenance Id</TableHead><TableHead className="capitalize">cab Id</TableHead><TableHead className="capitalize">service Type</TableHead><TableHead className="capitalize">status</TableHead><TableHead className="capitalize">service Date</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.map((row, i) => (
                     <TableRow key={i}>
                       <TableCell>{String(row.maintenanceId)}</TableCell><TableCell>{String(row.cabId)}</TableCell><TableCell>{String(row.serviceType)}</TableCell><TableCell>{String(row.status)}</TableCell><TableCell>{String(row.serviceDate)}</TableCell>
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
