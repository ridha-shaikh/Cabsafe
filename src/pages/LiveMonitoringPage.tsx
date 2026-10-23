import React, { useMemo, useState } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSimulation } from '../hooks/useSimulation';
import { MAP_CONFIG } from '../config/mapConfig';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SimulationState, CabSimState } from '../types/enums';
import { CabDetailsPanel } from '../components/fleet/CabDetailsPanel';
import { Navigation, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import { CHENNAI_ROUTES } from '../data/chennaiRoutes';
import { isActiveTripCab } from '../utils/fleetUtils';

export default function LiveMonitoringPage() {
  const { cabs, config, startSimulation, stopSimulation, setActiveCabs, setSpeedMultiplier } = useSimulation();
  const cabList = Object.values(cabs);
  const [selectedCabId, setSelectedCabId] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);

  const activeCabsList = useMemo(() => cabList.filter(isActiveTripCab), [cabList]);
  const displayedCabs = showActiveOnly ? activeCabsList : cabList;

  const selectedCab = selectedCabId ? cabs[selectedCabId] : null;

  const activeRouteGeoJSON = useMemo(() => {
    if (!selectedCab) return null;
    const routeDef = CHENNAI_ROUTES.find(r => r.routeId === selectedCab.routeId);
    if (!routeDef) return null;
    let coords = routeDef.waypointsJson.map(wp => [wp.lng, wp.lat]);
    if (selectedCab.isReverse) coords = coords.reverse();
    return {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords }
    };
  }, [selectedCab]);

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
      title="Live Monitoring"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-muted p-1 rounded-lg border border-border text-xs font-semibold">
            <button
              onClick={() => setShowActiveOnly(true)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                showActiveOnly
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Active Trips Only ({activeCabsList.length})
            </button>
            <button
              onClick={() => setShowActiveOnly(false)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                !showActiveOnly
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              All Cabs ({cabList.length})
            </button>
          </div>
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

            {activeRouteGeoJSON && (
              <Source id="active-route" type="geojson" data={activeRouteGeoJSON as any}>
                <Layer
                  id="active-route-line"
                  type="line"
                  paint={{
                    'line-color': '#3B8EA5',
                    'line-width': 4,
                    'line-opacity': 0.6
                  }}
                />
              </Source>
            )}

            {displayedCabs.map((cab) => {
              const statusColors: Record<string, string> = {
                [CabSimState.AVAILABLE]: '#3B8EA5',       // blue
                [CabSimState.ON_TRIP]: '#4A7C59',   // sage
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
                       className={`absolute rounded-full ${
                         cab.state === CabSimState.SOS
                           ? 'animate-ping'
                           : cab.state === CabSimState.SPEEDING || cab.state === CabSimState.HARSH_BRAKE || cab.state === CabSimState.SUDDEN_ACCEL
                           ? 'animate-pulse'
                           : ''
                       }`}
                       style={{
                         width: cab.state === CabSimState.SOS ? '46px' : '36px',
                         height: cab.state === CabSimState.SOS ? '46px' : '36px',
                         backgroundColor: `${cabColor}33`, // 20% opacity
                         border: `2px solid ${cabColor}`,
                         boxShadow: `0 0 12px ${cabColor}`
                       }}
                    />

                    {/* Prominent SOS Badge */}
                    {cab.state === CabSimState.SOS && (
                      <div className="absolute -top-6 z-20 px-1.5 py-0.5 bg-danger text-white text-[10px] font-extrabold rounded shadow-lg animate-bounce uppercase tracking-wider">
                        SOS
                      </div>
                    )}

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

        {selectedCabId && (
          <CabDetailsPanel cabId={selectedCabId} onClose={() => setSelectedCabId(null)} />
        )}
            </div>
    </PageContainer>
    );
  }
