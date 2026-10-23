import React, { useState, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useServiceData } from '../hooks/useServiceData';
import { passengerService } from '../services';
import { Search, X } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { CabSimState } from '../types/enums';

export default function PassengersPage() {
  const { data, loading } = useServiceData(() => passengerService.getAll());

  const [searchQuery, setSearchQuery] = useState('');

  const activeTripsMapStr = useSimulationStore(state => {
    const map: Record<string, { state: CabSimState, cabId: string, route: string }> = {};
    for (const cab of Object.values(state.cabs)) {
      if (cab.passengerId && cab.state !== CabSimState.AVAILABLE && cab.state !== CabSimState.COMPLETED) {
        map[cab.passengerId] = { state: cab.state, cabId: cab.cabId, route: `${cab.startLocationName} â†’ ${cab.destinationLocationName}` };
      }
    }
    return JSON.stringify(map);
  });

  const activeTripsMap = useMemo(() => JSON.parse(activeTripsMapStr), [activeTripsMapStr]);

  const filteredData = useMemo(() => {
    return data.filter(passenger => {
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const tripData = activeTripsMap[passenger.passengerId];
      const statusText = tripData ? tripData.state : 'IDLE';

      return (
        String(passenger.passengerId).toLowerCase().includes(q) ||
        String(passenger.fullName).toLowerCase().includes(q) ||
        String(passenger.email).toLowerCase().includes(q) ||
        String(passenger.phone).toLowerCase().includes(q) ||
        statusText.toLowerCase().includes(q)
      );
    });
  }, [data, searchQuery, activeTripsMap]);

  return (
    <PageContainer title="Passengers" description="View and manage passenger records and active trips.">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by ID, name, email, or status..."
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
        </div>
      </div>

      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">Passengers Overview</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            {loading && data.length === 0 ? (
               <div className="p-8 text-center text-text-secondary">Loading data...</div>
            ) : filteredData.length === 0 ? (
               <div className="p-8 text-center text-text-secondary flex flex-col items-center">
                 <p className="mb-4">No passengers found matching your search.</p>
                 {searchQuery && (
                    <button className="text-primary hover:underline font-medium" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </button>
                 )}
               </div>
            ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="capitalize">Passenger</TableHead>
                     <TableHead className="capitalize">Contact</TableHead>
                     <TableHead className="capitalize">Status</TableHead>
                     <TableHead className="capitalize">Assigned Cab</TableHead>
                     <TableHead className="capitalize">Current Route</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredData.map((row, i) => {
                     const tripInfo = activeTripsMap[row.passengerId];
                     return (
                       <TableRow key={row.passengerId}>
                         <TableCell>
                           <div className="font-medium">{String(row.fullName)}</div>
                           <div className="text-xs text-text-secondary font-mono">{String(row.passengerId)}</div>
                         </TableCell>
                         <TableCell>
                           <div className="text-sm">{String(row.email)}</div>
                           <div className="text-xs text-text-secondary">{String(row.phone)}</div>
                         </TableCell>
                         <TableCell>
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                             ${tripInfo ? 'bg-info-light text-info' : 'bg-gray-100 text-gray-600'}
                           `}>
                             {tripInfo ? tripInfo.state.replace(/_/g, ' ') : 'IDLE'}
                           </span>
                         </TableCell>
                         <TableCell>
                           {tripInfo ? <span className="font-mono text-sm">{tripInfo.cabId}</span> : <span className="text-text-secondary text-sm">-</span>}
                         </TableCell>
                         <TableCell className="max-w-[200px] truncate text-sm">
                           {tripInfo ? tripInfo.route : <span className="text-text-secondary">-</span>}
                         </TableCell>
                       </TableRow>
                     );
                   })}
                 </TableBody>
               </Table>
            )}
         </CardContent>
      </Card>
    </PageContainer>
  );
}
