import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { useSimulationStore } from '../store/simulationStore';
import { Car, Search, Filter } from 'lucide-react';
import { CabSimState } from '../types/enums';

export default function FleetPage() {
  const { cabs } = useSimulationStore();
  const cabList = Object.values(cabs);

  return (
    <PageContainer title="Fleet Management" description="View and manage all vehicles in your network.">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input type="text" placeholder="Search vehicles..." className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary font-medium bg-surface" />
          </div>
          <button className="flex items-center px-4 py-2 border border-border rounded-lg text-sm font-bold text-text-main hover:bg-background bg-surface">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </button>
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
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Speed</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cabList.map((cab) => (
                <tr key={cab.cabId} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-info-light rounded-lg flex items-center justify-center">
                        <Car className="h-5 w-5 text-info" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-extrabold text-text-main">{cab.cabId}</div>
                        <div className="text-xs font-medium text-text-secondary">Sedan • Standard</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${cab.state === CabSimState.EN_ROUTE ? 'bg-info-light text-info' :
                        cab.state === CabSimState.IDLE ? 'bg-primary-light text-primary' :
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
                    <div className="w-full bg-border rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${(cab.routeProgress * 100).toFixed(0)}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    <button className="text-primary hover:text-primary-dark">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
