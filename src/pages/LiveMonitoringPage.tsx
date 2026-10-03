import React, { useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSimulation } from '../hooks/useSimulation';
import { MAP_CONFIG } from '../config/mapConfig';
import PageContainer from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SimulationState } from '../types/enums';

export default function LiveMonitoringPage() {
  const { cabs, config, startSimulation, stopSimulation, setActiveCabs, setSpeedMultiplier } = useSimulation();
  const cabList = Object.values(cabs);

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

  return (
    <PageContainer 
      title="Live Fleet Monitoring" 
      description="Real-time cab tracking and telemetry visualization"
      action={
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => setActiveCabs(5)}>Demo: 5 Cabs</Button>
          <Button 
            variant={config.state === SimulationState.RUNNING ? 'danger' : 'primary'}
            onClick={handleToggleSimulation}
          >
            {config.state === SimulationState.RUNNING ? 'Stop Simulation' : 'Start Simulation'}
          </Button>
        </div>
      }
    >
      <Card className="h-[750px] w-full overflow-hidden relative border-2 border-gray-200">
        <Map
          initialViewState={mapCenter}
          mapStyle={MAP_CONFIG.styleUrl}
          mapLib={maplibregl as any}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />
          
          {cabList.map((cab) => (
            <Marker
              key={cab.cabId}
              longitude={cab.longitude}
              latitude={cab.latitude}
              anchor="center"
              pitchAlignment="map"
              rotationAlignment="map"
            >
              <div 
                className="transition-transform duration-300"
                style={{ 
                  transform: `rotate(${cab.heading}deg)`,
                  width: '24px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: cab.activeEventId ? 'drop-shadow(0 0 6px red)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              >
                <img 
                  src="/car.svg" 
                  alt="Cab" 
                  className="w-full h-full"
                />
              </div>
            </Marker>
          ))}
        </Map>

        {/* Dashboard overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border border-gray-200 w-64 z-10">
          <h3 className="font-bold text-gray-900 mb-2">Simulation Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">State:</span>
              <span className={`font-semibold ${config.state === SimulationState.RUNNING ? 'text-green-600' : 'text-gray-500'}`}>
                {config.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Cabs:</span>
              <span className="font-mono font-medium">{cabList.length} / {config.activeCabs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Multiplier:</span>
              <span className="font-mono font-medium">{config.speedMultiplier}x</span>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
