import React, { useState, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { useSimulationStore } from '../store/simulationStore';
import { useServiceData } from '../hooks/useServiceData';
import { cabService } from '../services';
import { Car, Search, Filter, X, Navigation, CheckCircle2 } from 'lucide-react';
import { CabSimState } from '../types/enums';
import { CabDetailsPanel } from '../components/fleet/CabDetailsPanel';
import { isActiveTripCab } from '../utils/fleetUtils';

export default function FleetPage() {
  const { cabs } = useSimulationStore();
  const { data: staticCabs } = useServiceData(() => cabService.getAll());

  const [viewMode, setViewMode] = useState<'ACTIVE_ONLY' | 'ALL'>('ACTIVE_ONLY');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCabId, setSelectedCabId] = useState<string | null>(null);

  const mergedCabs = useMemo(() => {
    return Object.values(cabs).map(simCab => {
      const staticData = staticCabs.find(c => c.cabId === simCab.cabId);
      return {
        ...simCab,
        model: staticData?.model || 'Unknown Model',
        vehicleType: staticData?.vehicleType || 'SEDAN',
        registrationNumber: staticData?.registrationNumber || simCab.cabId,
      };
    });
  }, [cabs, staticCabs]);

  const activeTripCabs = useMemo(() => {
    return mergedCabs.filter(isActiveTripCab);
  }, [mergedCabs]);

  const displayedCabs = useMemo(() => {
    const baseList = viewMode === 'ACTIVE_ONLY' ? activeTripCabs : mergedCabs;
    return baseList.filter(cab => {
      if (statusFilter && cab.state !== statusFilter) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        cab.cabId.toLowerCase().includes(q) ||
        cab.model.toLowerCase().includes(q) ||
        String(cab.vehicleType).toLowerCase().includes(q) ||
        cab.state.toLowerCase().includes(q) ||
        (cab.driverId || '').toLowerCase().includes(q)
      );
    });
  }, [viewMode, activeTripCabs, mergedCabs, searchQuery, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    const list = viewMode === 'ACTIVE_ONLY' ? activeTripCabs : mergedCabs;
    return Array.from(new Set(list.map(c => c.state)));
  }, [viewMode, activeTripCabs, mergedCabs]);

  return (
    <PageContainer title="Fleet Management" description="View and manage active running vehicles and fleet inventory.">
      {selectedCabId && <CabDetailsPanel cabId={selectedCabId} onClose={() => setSelectedCabId(null)} />}

      {/* View Switcher Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('ACTIVE_ONLY')}
            className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'ACTIVE_ONLY'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface border border-border text-text-secondary hover:text-text-main'
            }`}
          >
            <Navigation className="h-3.5 w-3.5 mr-1.5" />
            Active Running Trips ({activeTripCabs.length})
          </button>
          <button
            onClick={() => setViewMode('ALL')}
            className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'ALL'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface border border-border text-text-secondary hover:text-text-main'
            }`}
          >
            <Car className="h-3.5 w-3.5 mr-1.5" />
            All Fleet Inventory ({mergedCabs.length})
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex space-x-3 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by ID, model, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-xs focus:outline-none focus:border-primary font-medium bg-surface text-text-main"
            />
            {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-main">
                 <X className="h-3.5 w-3.5" />
               </button>
            )}
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-8 pr-7 py-2 border border-border rounded-lg text-xs font-bold text-text-main hover:bg-background bg-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
          </div>
          {(searchQuery || statusFilter) && (
            <button
              className="text-xs font-bold text-text-secondary hover:text-text-main px-2"
              onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Vehicle ID</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Driver ID</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Live Speed</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Trip Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedCabs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary text-xs font-medium">
                    {viewMode === 'ACTIVE_ONLY'
                      ? 'No active running trips at this moment. Cabs will appear automatically as trips are dispatched.'
                      : 'No vehicles found matching your criteria.'}
                  </td>
                </tr>
              ) : displayedCabs.map((cab) => {
                const isActive = isActiveTripCab(cab);
                return (
                  <tr key={cab.cabId} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${isActive ? 'bg-primary-light' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                          <Car className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-extrabold text-text-main flex items-center space-x-1.5">
                            <span>{cab.cabId}</span>
                            {isActive && (
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Active Trip"></span>
                            )}
                          </div>
                          <div className="text-xs font-medium text-text-secondary">{cab.model} â€¢ {cab.vehicleType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${cab.state === CabSimState.ON_TRIP || cab.state === CabSimState.GOING_TO_PICKUP || cab.state === CabSimState.ARRIVED_PICKUP ? 'bg-info-light text-info' :
                          cab.state === CabSimState.AVAILABLE || cab.state === CabSimState.COMPLETED ? 'bg-primary-light text-primary' :
                          (cab.state === CabSimState.SPEEDING || cab.state === CabSimState.HARSH_BRAKE) ? 'bg-warning-light text-warning' :
                          cab.state === CabSimState.SOS ? 'bg-danger-light text-danger' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                        {cab.state.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-text-secondary">
                      {cab.driverId || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-text-main">
                      {Math.round(cab.currentSpeed)} km/h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-48">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              cab.routeProgress >= 1.0 ? 'bg-green-600' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.round(cab.routeProgress * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-text-secondary w-8 text-right">
                          {Math.round(cab.routeProgress * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      <button className="text-primary hover:text-primary-dark" onClick={() => setSelectedCabId(cab.cabId)}>View Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
