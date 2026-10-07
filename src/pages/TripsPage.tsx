import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { tripService } from '../services';

export default function TripsPage() {
  const { data, loading } = useServiceData(() => tripService.getAll());

  return (
    <PageContainer title="Trips" description="View and manage trip records.">
      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">Trips Overview</CardTitle>
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
                     <TableHead className="capitalize">trip Id</TableHead><TableHead className="capitalize">cab Id</TableHead><TableHead className="capitalize">driver Id</TableHead><TableHead className="capitalize">status</TableHead><TableHead className="capitalize">fare</TableHead><TableHead className="capitalize">distance Km</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.map((row, i) => (
                     <TableRow key={i}>
                       <TableCell>{String(row.tripId)}</TableCell><TableCell>{String(row.cabId)}</TableCell><TableCell>{String(row.driverId)}</TableCell><TableCell>{String(row.status)}</TableCell><TableCell>{String(row.fare)}</TableCell><TableCell>{String(row.distanceKm)}</TableCell>
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
