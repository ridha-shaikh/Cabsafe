import React, { useState, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { driverService } from '../services';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSimulationStore } from '../store/simulationStore';
import { CabSimState, DriverStatus } from '../types/enums';

export default function DriversPage() {
  const { data, loading } = useServiceData(() => driverService.getAll());

  // Extract ONLY statuses to avoid 60fps position re-renders
  const cabStatusesJson = useSimulationStore(state => {
    const statuses: Record<string, string> = {};
    for (const key in state.cabs) {
      statuses[key] = state.cabs[key].state;
    }
    return JSON.stringify(statuses);
  });

  const cabStatuses = useMemo(() => JSON.parse(cabStatusesJson), [cabStatusesJson]);

  const liveDriverData = useMemo(() => {
    return data.map(driver => {
      let liveStatus = driver.status;
      if (driver.assignedCabId && cabStatuses[driver.assignedCabId]) {
        const cabState = cabStatuses[driver.assignedCabId];

        if ([CabSimState.GOING_TO_PICKUP, CabSimState.ARRIVED_PICKUP, CabSimState.ON_TRIP, CabSimState.SPEEDING, CabSimState.SUDDEN_ACCEL, CabSimState.HARSH_BRAKE].includes(cabState as CabSimState)) {
          liveStatus = DriverStatus.ON_TRIP;
        } else if ([CabSimState.MAINTENANCE, CabSimState.OFFLINE].includes(cabState as CabSimState)) {
          // If cab is offline, driver is off duty unless suspended
          if (liveStatus !== DriverStatus.SUSPENDED) {
            liveStatus = DriverStatus.OFF_DUTY;
          }
        } else if ([CabSimState.AVAILABLE, CabSimState.ARRIVED, CabSimState.COMPLETED].includes(cabState as CabSimState)) {
          if (![DriverStatus.OFF_DUTY, DriverStatus.SUSPENDED].includes(driver.status)) {
            liveStatus = DriverStatus.AVAILABLE;
          }
        }
      }
      return { ...driver, liveStatus };
    });
  }, [data, cabStatuses]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredData = useMemo(() => {
    return liveDriverData.filter(driver => {
      // Status Filter
      if (statusFilter && driver.liveStatus !== statusFilter) return false;

      // Search Query Filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        String(driver.driverId).toLowerCase().includes(q) ||
        String(driver.fullName).toLowerCase().includes(q) ||
        String(driver.phone || '').toLowerCase().includes(q) ||
        String(driver.email || '').toLowerCase().includes(q) ||
        String(driver.licenseNumber || '').toLowerCase().includes(q) ||
        String(driver.assignedCabId || '').toLowerCase().includes(q) ||
        String(driver.liveStatus).toLowerCase().includes(q)
      );
    });
  }, [liveDriverData, searchQuery, statusFilter]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(liveDriverData.map(d => d.liveStatus))), [liveDriverData]);

  return (
    <PageContainer title="Drivers" description="View and manage driver records.">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3 w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by ID, name, phone, email, or cab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary font-medium bg-surface"
            />
            {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-main">
                 <X className="h-4 w-4" />
               </button>
            )}
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 border border-border rounded-lg text-sm font-bold text-text-main hover:bg-background bg-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          </div>
          {(searchQuery || statusFilter) && (
            <Button variant="ghost" onClick={() => { setSearchQuery(''); setStatusFilter(''); }}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">Drivers Overview</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            {loading && data.length === 0 ? (
               <div className="p-8 text-center text-text-secondary">Loading data...</div>
            ) : filteredData.length === 0 ? (
               <div className="p-8 text-center text-text-secondary flex flex-col items-center">
                 <p className="mb-4">No drivers found matching your search or filters.</p>
                 {(searchQuery || statusFilter) && (
                    <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter(''); }}>
                      Clear Filters
                    </Button>
                 )}
               </div>
            ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="capitalize">Driver ID</TableHead>
                     <TableHead className="capitalize">Full Name</TableHead>
                     <TableHead className="capitalize">Status</TableHead>
                     <TableHead className="capitalize">Assigned Cab</TableHead>
                     <TableHead className="capitalize">Total Trips</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredData.map((row, i) => (
                     <TableRow key={row.driverId}>
                       <TableCell className="font-mono">{String(row.driverId)}</TableCell>
                       <TableCell className="font-medium">{String(row.fullName)}</TableCell>
                       <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                           row.liveStatus === 'AVAILABLE' ? 'bg-primary-light text-primary-dark' :
                           row.liveStatus === 'ON_TRIP' ? 'bg-info-light text-info-dark' :
                           row.liveStatus === 'OFF_DUTY' ? 'bg-gray-100 text-gray-600' :
                           'bg-warning-light text-warning-dark'
                         }`}>
                           {String(row.liveStatus).replace('_', ' ')}
                         </span>
                       </TableCell>
                       <TableCell className="font-mono">{row.assignedCabId ? String(row.assignedCabId) : '-'}</TableCell>
                       <TableCell>{String(row.totalTrips)}</TableCell>
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
