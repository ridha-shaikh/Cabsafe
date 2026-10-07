import React, { useMemo, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSimulation } from '../hooks/useSimulation';
import { MAP_CONFIG } from '../config/mapConfig';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SimulationState, CabSimState } from '../types/enums';
import { Navigation, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';

export default function LiveMonitoringPage() {
  const { cabs, config, startSimulation, stopSimulation, setActiveCabs, setSpeedMultiplier } = useSimulation();
  const cabList = Object.values(cabs);
  const [selectedCabId, setSelectedCabId] = useState<string | null>(null);

  const handleToggleSimulation = () => {
    if (config.state === SimulationState.RUNNING) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  const mapCenter = useMemo(() => {
    return {
      longitude: MAP_CONFIG.defaultCenter.longitude,
      latitude: MAP_CONFIG.defaultCenter.latitude,
      zoom: MAP_CONFIG.defaultZoom
    };
  }, []);

  const selectedCab = selectedCabId ? cabs[selectedCabId] : null;

  return (
    <PageContainer 
      title="Live Monitoring" 
      description={
        <div className="flex items-center space-x-3 mt-1">
          <span className="flex items-center text-sm font-semibold text-text-main"><Navigation className="h-4 w-4 mr-1 text-info"/> {cabList.length} Cabs Online</span>
          <span className="text-border">•</span>
          <span className="flex items-center text-sm font-semibold text-text-main">
            <span className={`h-2 w-2 rounded-full mr-1.5 ${config.state === SimulationState.RUNNING ? 'bg-primary animate-pulse' : 'bg-gray-400'}`}></span>
            {config.state === SimulationState.RUNNING ? 'Simulation Running' : 'Simulation Paused'}
          </span>
        </div>
      }
      action={
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => setActiveCabs(25)}>Reset Fleet</Button>
          <Button 
            variant={config.state === SimulationState.RUNNING ? 'danger' : 'primary'}
            onClick={handleToggleSimulation}
          >
            {config.state === SimulationState.RUNNING ? 'Pause Simulation' : 'Start Simulation'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[750px]">
        {/* MAP CONTAINER */}
        <Card className="flex-1 overflow-hidden relative border-border shadow-sm">
          <Map
            initialViewState={mapCenter}
            mapStyle={MAP_CONFIG.styleUrl}
            mapLib={maplibregl as any}
            attributionControl={false}
          >
            <NavigationControl position="bottom-right" />
            
            {cabList.map((cab) => {
              const statusColors: Record<string, string> = {
                [CabSimState.IDLE]: '#3B8EA5',       // blue
                [CabSimState.EN_ROUTE]: '#4A7C59',   // sage
                [CabSimState.SPEEDING]: '#D99A38',   // amber
                [CabSimState.HARSH_BRAKE]: '#D99A38',
                [CabSimState.SUDDEN_ACCEL]: '#D99A38',
                [CabSimState.SOS]: '#C75252',        // coral
                [CabSimState.OFFLINE]: '#888888',    // gray
              };
              const cabColor = statusColors[cab.state] || '#888888';

              return (
                <Marker
                  key={cab.cabId}
                  longitude={cab.longitude}
                  latitude={cab.latitude}
                  anchor="center"
                  pitchAlignment="map"
                  rotationAlignment="map"
                  onClick={e => { e.originalEvent.stopPropagation(); setSelectedCabId(cab.cabId); }}
                >
                  <div className="relative flex items-center justify-center cursor-pointer transition-transform duration-300">
                    {/* Status Indicator Halo */}
                    <div 
                       className="absolute rounded-full"
                       style={{ 
                         width: '36px', height: '36px',
                         backgroundColor: `${cabColor}33`, // 20% opacity
                         border: `2px solid ${cabColor}`,
                         boxShadow: `0 0 8px ${cabColor}80` 
                       }}
                    />
                    {/* White Cab Silhouette */}
                    <div 
                      className="relative z-10"
                      style={{ 
                        transform: `rotate(${cab.heading}deg)`,
                        width: '24px',
                        height: '48px',
                      }}
                    >
                      <img 
                        src="/car.svg" 
                        alt="Cab" 
                        className="w-full h-full"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                      />
                    </div>
                  </div>
                </Marker>
              );
            })}
          </Map>
        </Card>

        {/* SIDE PANEL */}
        {selectedCab ? (
          <Card className="w-full lg:w-80 h-full flex flex-col bg-surface border-border shadow-sm animate-fade-in overflow-hidden">
             <div className="p-5 border-b border-border bg-background">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-text-main">{selectedCab.cabId}</h3>
                    <p className="text-sm text-text-secondary">{selectedCab.driverId}</p>
                  </div>
                  <button onClick={() => setSelectedCabId(null)} className="text-text-secondary hover:text-text-main font-bold p-1">&times;</button>
               </div>
               <div className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                  ${selectedCab.state === CabSimState.EN_ROUTE ? 'bg-info-light text-info' : 
                    selectedCab.state === CabSimState.IDLE ? 'bg-primary-light text-primary' : 
                    'bg-warning-light text-warning'}`}>
                 {selectedCab.state.replace('_', ' ')}
               </div>
             </div>
             
             <div className="flex-1 p-5 overflow-y-auto space-y-6">
                <div>
                   <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Live Telemetry</h4>
                   
                   <div className="space-y-4">
                     <div className="flex justify-between items-end border-b border-border pb-2">
                        <span className="text-sm font-medium text-text-main">Speed</span>
                        <span className="text-xl font-bold font-mono text-text-main">{Math.round(selectedCab.currentSpeed)} <span className="text-sm text-text-secondary">km/h</span></span>
                     </div>
                     <div className="flex justify-between items-end border-b border-border pb-2">
                        <span className="text-sm font-medium text-text-main">Acceleration</span>
                        <span className="text-xl font-bold font-mono text-text-main">{selectedCab.acceleration.toFixed(2)} <span className="text-sm text-text-secondary">m/s²</span></span>
                     </div>
                     <div className="flex justify-between items-end border-b border-border pb-2">
                        <span className="text-sm font-medium text-text-main">Brake</span>
                        <span className="text-sm font-bold text-text-main">{selectedCab.brakeApplied ? <span className="text-warning">ACTIVE</span> : 'Normal'}</span>
                     </div>
                   </div>
                </div>

                <div>
                   <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Trip Progress</h4>
                   <div className="w-full bg-border rounded-full h-2 mb-2">
                     <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${(selectedCab.routeProgress * 100).toFixed(1)}%` }}></div>
                   </div>
                   <div className="flex justify-between text-xs text-text-secondary font-medium">
                     <span>Start</span>
                     <span>{(selectedCab.routeProgress * 100).toFixed(0)}%</span>
                     <span>End</span>
                   </div>
                </div>
             </div>
          </Card>
        ) : (
          <Card className="w-full lg:w-80 h-full flex flex-col items-center justify-center bg-background border-border shadow-sm p-6 text-center">
             <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Navigation className="h-6 w-6 text-text-secondary" />
             </div>
             <h3 className="text-lg font-semibold text-text-main mb-2">No Cab Selected</h3>
             <p className="text-sm text-text-secondary">Click on a vehicle marker on the map to view real-time telemetry and trip details.</p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
