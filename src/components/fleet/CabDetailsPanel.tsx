import React from 'react';
import { X, MapPin, Gauge, Clock, User, AlertTriangle, Route } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { useServiceData } from '../../hooks/useServiceData';
import { cabService, driverService } from '../../services';

interface CabDetailsPanelProps {
  cabId: string;
  onClose: () => void;
}

export function CabDetailsPanel({ cabId, onClose }: CabDetailsPanelProps) {
  // Subscribe specifically to THIS cab's high-frequency state updates
  const cabState = useSimulationStore(state => state.cabs[cabId]);

  // Load static data
  const { data: staticCabs } = useServiceData(() => cabService.getAll());
  const { data: staticDrivers } = useServiceData(() => driverService.getAll());

  if (!cabState) return null;

  const staticCab = staticCabs.find(c => c.cabId === cabId);
  const staticDriver = staticDrivers.find(d => d.driverId === cabState.driverId);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-surface shadow-2xl border-l border-border z-50 transform transition-transform duration-300 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div>
          <h2 className="text-lg font-extrabold text-text-main flex items-center">
            {cabId}
            <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-light text-primary`}>
              {cabState.state.replace(/_/g, ' ')}
            </span>
          </h2>
          <p className="text-sm text-text-secondary font-medium mt-1">
            {staticCab?.model || 'Unknown Model'} â€¢ {staticCab?.registrationNumber || 'Unknown Reg'}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-border text-text-secondary hover:text-text-main transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* DRIVER INFO */}
        <section>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Assigned Driver</h3>
          <div className="flex items-center p-3 rounded-lg border border-border bg-background">
            <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-bold text-text-main">{staticDriver?.fullName || 'Unassigned'}</div>
              <div className="text-xs text-text-secondary font-mono">{cabState.driverId}</div>
            </div>
          </div>
        </section>

        {/* TRIP INFO */}
        {cabState.tripId && (
          <section>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Current Trip</h3>
            <div className="p-3 rounded-lg border border-border bg-background space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-text-secondary">Trip ID</span>
                <span className="text-sm font-mono font-bold text-text-main">{cabState.tripId}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-text-secondary">Passenger</span>
                <span className="text-sm font-mono font-bold text-text-main">{cabState.passengerId}</span>
              </div>
              <div>
                <span className="text-xs text-text-secondary block mb-1">Route</span>
                <div className="flex items-center text-sm font-medium text-text-main">
                  <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                  {cabState.startLocationName} <span className="mx-2 text-text-secondary">â†’</span> {cabState.destinationLocationName}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LIVE TELEMETRY */}
        <section>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Live Telemetry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-background">
              <div className="flex items-center text-xs text-text-secondary mb-1">
                <Gauge className="w-4 h-4 mr-1" /> Speed
              </div>
              <div className="text-lg font-bold text-text-main">
                {Math.round(cabState.currentSpeed)} <span className="text-xs font-normal text-text-secondary">km/h</span>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-background">
              <div className="flex items-center text-xs text-text-secondary mb-1">
                <Route className="w-4 h-4 mr-1" /> Progress
              </div>
              <div className="text-lg font-bold text-text-main">
                {Math.round(cabState.routeProgress * 100)}%
              </div>
            </div>
            <div className="col-span-2 p-3 rounded-lg border border-border bg-background">
              <div className="flex items-center text-xs text-text-secondary mb-1">
                <MapPin className="w-4 h-4 mr-1" /> GPS Coordinates
              </div>
              <div className="text-sm font-mono text-text-main">
                {cabState.latitude.toFixed(6)}, {cabState.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        </section>

        {/* SAFETY EVENTS */}
        <section>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Safety Status</h3>
          <div className="p-3 rounded-lg border border-success-light bg-success-light/20 flex items-start">
             <div className="h-5 w-5 mt-0.5 rounded-full bg-success flex items-center justify-center flex-shrink-0">
               <AlertTriangle className="w-3 h-3 text-white" />
             </div>
             <div className="ml-3">
               <div className="text-sm font-bold text-success-dark">No Recent Anomalies</div>
               <div className="text-xs text-success-dark/80 mt-1">Telemetry signals are within safe parameters.</div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
