import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { sosRequestService } from '../services';

export default function SOSPage() {
  const { data, loading } = useServiceData(() => sosRequestService.getAll());

  return (
    <PageContainer title="SOS" description="View and manage sosrequest records.">
      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">SOS Overview</CardTitle>
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
                     <TableHead className="capitalize">sos Id</TableHead><TableHead className="capitalize">passenger Id</TableHead><TableHead className="capitalize">cab Id</TableHead><TableHead className="capitalize">status</TableHead><TableHead className="capitalize">severity</TableHead><TableHead className="capitalize">created At</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.map((row, i) => (
                     <TableRow key={i}>
                       <TableCell>{String(row.sosId)}</TableCell><TableCell>{String(row.passengerId)}</TableCell><TableCell>{String(row.cabId)}</TableCell><TableCell>{String(row.status)}</TableCell><TableCell>{String(row.severity)}</TableCell><TableCell>{String(row.createdAt)}</TableCell>
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
