import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { passengerService } from '../services';

export default function PassengersPage() {
  const { data, loading } = useServiceData(() => passengerService.getAll());

  return (
    <PageContainer title="Passengers" description="View and manage passenger records.">
      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">Passengers Overview</CardTitle>
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
                     <TableHead className="capitalize">passenger Id</TableHead><TableHead className="capitalize">full Name</TableHead><TableHead className="capitalize">email</TableHead><TableHead className="capitalize">phone</TableHead><TableHead className="capitalize">total Trips</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.map((row, i) => (
                     <TableRow key={i}>
                       <TableCell>{String(row.passengerId)}</TableCell><TableCell>{String(row.fullName)}</TableCell><TableCell>{String(row.email)}</TableCell><TableCell>{String(row.phone)}</TableCell><TableCell>{String(row.totalTrips)}</TableCell>
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
