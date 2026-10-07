const fs = require('fs');
const path = require('path');

const pagesDir = 'src/pages';

const pagesToUpdate = [
  { name: 'TripsPage', entity: 'Trip', service: 'tripService', columns: ['tripId', 'cabId', 'driverId', 'status', 'fare', 'distanceKm'] },
  { name: 'BookingsPage', entity: 'Booking', service: 'bookingService', columns: ['bookingId', 'passengerId', 'status', 'fareEstimate'] },
  { name: 'PassengersPage', entity: 'Passenger', service: 'passengerService', columns: ['passengerId', 'fullName', 'email', 'phone', 'totalTrips'] },
  { name: 'DriversPage', entity: 'Driver', service: 'driverService', columns: ['driverId', 'fullName', 'status', 'assignedCabId', 'totalTrips'] },
  { name: 'AlertsPage', entity: 'Alert', service: 'alertService', columns: ['alertId', 'title', 'severity', 'status', 'createdAt'] },
  { name: 'SOSPage', entity: 'SOSRequest', service: 'sosRequestService', columns: ['sosId', 'passengerId', 'cabId', 'status', 'severity', 'createdAt'] },
  { name: 'MaintenancePage', entity: 'MaintenanceRecord', service: 'maintenanceService', columns: ['maintenanceId', 'cabId', 'serviceType', 'status', 'serviceDate'] },
  { name: 'ReportsPage', entity: 'Trip', service: 'tripService', columns: ['tripId', 'fare', 'status'] },
];

pagesToUpdate.forEach(p => {
  const filePath = path.join(pagesDir, `${p.name}.tsx`);
  
  const colHeaders = p.columns.map(c => `<TableHead className="capitalize">${c.replace(/([A-Z])/g, ' $1').trim()}</TableHead>`).join('');
  const colCells = p.columns.map(c => `<TableCell>{String(row.${c})}</TableCell>`).join('');

  const code = `import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { ${p.service} } from '../services';

export default function ${p.name}() {
  const { data, loading } = useServiceData(() => ${p.service}.getAll());

  return (
    <PageContainer title="${p.name.replace('Page', '')}" description="View and manage ${p.entity.toLowerCase()} records.">
      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">${p.name.replace('Page', '')} Overview</CardTitle>
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
                     ${colHeaders}
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.map((row, i) => (
                     <TableRow key={i}>
                       ${colCells}
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
`;
  fs.writeFileSync(filePath, code);
  console.log(`Updated ${filePath}`);
});

// Also create a DB Overview Page
const dbOverviewCode = `import React from 'react';
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
`;
fs.writeFileSync(path.join(pagesDir, 'DatabaseOverviewPage.tsx'), dbOverviewCode);
console.log('Updated DatabaseOverviewPage.tsx');
