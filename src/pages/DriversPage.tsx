import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { driverService } from '../services';

export default function DriversPage() {
  const { data, loading } = useServiceData(() => driverService.getAll());

  return (
    <PageContainer title="Drivers" description="View and manage driver records.">
      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">Drivers Overview</CardTitle>
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
                     <TableHead className="capitalize">driver Id</TableHead><TableHead className="capitalize">full Name</TableHead><TableHead className="capitalize">status</TableHead><TableHead className="capitalize">assigned Cab Id</TableHead><TableHead className="capitalize">total Trips</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.map((row, i) => (
                     <TableRow key={i}>
                       <TableCell>{String(row.driverId)}</TableCell><TableCell>{String(row.fullName)}</TableCell><TableCell>{String(row.status)}</TableCell><TableCell>{String(row.assignedCabId)}</TableCell><TableCell>{String(row.totalTrips)}</TableCell>
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
