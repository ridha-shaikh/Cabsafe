import React, { useEffect, useState, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { StatCard } from '../components/charts/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useSimulationStore } from '../store/simulationStore';
import { Car, AlertTriangle, ShieldAlert, Navigation, Wrench, Activity, ShieldCheck, MapPin } from 'lucide-react';
import { SimulationState, CabSimState } from '../types/enums';
import { MAP_CONFIG } from '../config/mapConfig';

export default function DashboardPage() {
  const { cabs, config } = useSimulationStore();
  const cabList = Object.values(cabs);
  
  const activeCabs = cabList.filter(c => c.state === CabSimState.EN_ROUTE || c.state === CabSimState.SPEEDING).length;
  const eventsCount = cabList.filter(c => c.activeEventId).length;
  
  const [activities, setActivities] = useState<any[]>([]);
  useEffect(() => {
    if(cabList.length > 0 && Math.random() > 0.6) {
       const cab = cabList[Math.floor(Math.random() * cabList.length)];
       const isWarning = cab.state === CabSimState.SPEEDING || cab.state === CabSimState.HARSH_BRAKE;
       const newAct = {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cabId: cab.cabId,
          message: isWarning ? 'Safety event detected' : (cab.routeProgress < 0.1 ? 'Trip started' : 'Telemetry received'),
          type: isWarning ? 'warning' : 'info'
       };
       setActivities(prev => [newAct, ...prev].slice(0, 6));
    }
  }, [cabList.length, Math.floor(Date.now() / 2500)]);

  const mapCenter = useMemo(() => ({
    longitude: MAP_CONFIG.defaultCenter.longitude,
    latitude: MAP_CONFIG.defaultCenter.latitude,
    zoom: 10
  }), []);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      
      {/* 1. HERO - Atmospheric Ombré (Matching Login) */}
      <div className="rounded-3xl p-10 text-white shadow-xl relative overflow-hidden flex justify-between items-end" style={{ backgroundImage: 'linear-gradient(135deg, #091221 0%, #113645 50%, #0d4a46 100%)' }}>
        <div className="absolute top-0 right-0 opacity-10 w-96 h-96 -mr-20 -mt-20 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,89.1,-0.5C88.1,15.3,83.6,30.6,75.4,43.6C67.2,56.6,55.4,67.3,41.7,73.5C28.1,79.8,14,81.6,0.2,81.2C-13.6,80.9,-27.1,78.3,-39.8,71.7C-52.5,65.1,-64.3,54.4,-72.6,41.3C-80.9,28.2,-85.7,14.1,-86.1,-0.2C-86.4,-14.5,-82.3,-29,-74,-41.2C-65.7,-53.4,-53.2,-63.3,-39.7,-70.7C-26.2,-78.2,-13.1,-83.1,1.1,-84.9C15.3,-86.7,30.6,-83.5,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Good afternoon, Admin</h1>
          <p className="text-white/80 text-xl font-medium">Your fleet is operating safely.</p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 flex items-center shadow-inner">
          <span className={`h-3 w-3 rounded-full mr-3 ${config.state === SimulationState.RUNNING ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-gray-400'}`}></span>
          <span className="font-bold tracking-wide uppercase text-sm">
            {config.state === SimulationState.RUNNING ? 'LIVE / SIMULATION RUNNING' : 'SIMULATION PAUSED'}
          </span>
        </div>
      </div>

      {/* 2. KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Active Trips" value={activeCabs} icon={<Navigation className="h-6 w-6" />} variant="sage" />
        <StatCard title="Active Fleet" value={cabList.length} icon={<Car className="h-6 w-6" />} variant="teal" />
        <StatCard title="Safety Alerts" value={eventsCount} icon={<AlertTriangle className="h-6 w-6" />} variant="amber" />
        <StatCard title="Active SOS" value="0" icon={<ShieldAlert className="h-6 w-6" />} variant="coral" />
        <StatCard title="Maintenance" value="5" icon={<Wrench className="h-6 w-6" />} variant="peach" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. LARGE LIVE MAP */}
        <Card className="lg:col-span-2 h-[450px] flex flex-col border-border shadow-sm overflow-hidden bg-surface">
          <CardHeader className="border-b border-border pb-4 bg-background">
            <div className="flex items-center text-text-main">
              <MapPin className="h-5 w-5 mr-2 text-teal" />
              <CardTitle className="text-base font-extrabold">Live Operations Map</CardTitle>
            </div>
          </CardHeader>
          <div className="flex-1 relative">
            <Map initialViewState={mapCenter} mapStyle={MAP_CONFIG.styleUrl} mapLib={maplibregl as any} attributionControl={false} interactive={false}>
              {cabList.map((cab) => {
                const statusColors: Record<string, string> = {
                  [CabSimState.IDLE]: '#3B8EA5',
                  [CabSimState.EN_ROUTE]: '#4A7C59',
                  [CabSimState.SPEEDING]: '#D99A38',
                  [CabSimState.HARSH_BRAKE]: '#D99A38',
                  [CabSimState.SUDDEN_ACCEL]: '#D99A38',
                  [CabSimState.SOS]: '#C75252',
                  [CabSimState.OFFLINE]: '#888888',
                };
                const cabColor = statusColors[cab.state] || '#888888';
                
                return (
                  <Marker key={cab.cabId} longitude={cab.longitude} latitude={cab.latitude} anchor="center" pitchAlignment="map" rotationAlignment="map">
                    <div className="relative flex items-center justify-center transition-transform duration-300">
                      <div 
                         className="absolute rounded-full"
                         style={{ 
                           width: '24px', height: '24px',
                           backgroundColor: `${cabColor}33`,
                           border: `1.5px solid ${cabColor}`,
                           boxShadow: `0 0 6px ${cabColor}80` 
                         }}
                      />
                      <div className="relative z-10" style={{ transform: `rotate(${cab.heading}deg)`, width: '16px', height: '32px' }}>
                        <img src="/car.svg" alt="Cab" className="w-full h-full" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }} />
                      </div>
                    </div>
                  </Marker>
                );
              })}
            </Map>
          </div>
        </Card>

        {/* 4. LIVE ACTIVITY FEED */}
        <Card className="lg:col-span-1 h-[450px] flex flex-col bg-surface border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4 bg-background">
            <div className="flex items-center text-text-main">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              <CardTitle className="text-base font-extrabold">Live Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
             <ul className="divide-y divide-border">
               {activities.map(act => (
                 <li key={act.id} className="p-4 hover:bg-background transition-colors animate-fade-in flex items-start space-x-3">
                    <div className="mt-1">
                      {act.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-warning" /> : <Navigation className="h-4 w-4 text-info" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-text-secondary">{act.time}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${act.type === 'warning' ? 'bg-warning-light text-warning' : 'bg-info-light text-info'}`}>
                          {act.cabId}
                        </span>
                      </div>
                      <p className="text-sm text-text-main font-bold">{act.message}</p>
                    </div>
                 </li>
               ))}
             </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5. SAFETY OVERVIEW */}
        <Card className="bg-surface border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4 bg-background">
            <div className="flex items-center text-text-main">
              <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
              <CardTitle className="text-base font-extrabold">Fleet Safety Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-between">
             <div>
                <p className="text-6xl font-extrabold text-primary mb-2">94<span className="text-2xl text-text-secondary">/100</span></p>
                <p className="text-sm font-bold text-primary">EXCELLENT SAFETY RATING</p>
             </div>
             <div className="space-y-4 w-1/2">
                <div>
                   <div className="flex justify-between text-xs font-bold text-text-main mb-1"><span>Over-speeding</span><span className="text-warning">2 Active</span></div>
                   <div className="w-full bg-border rounded-full h-1.5"><div className="bg-warning h-1.5 rounded-full" style={{width:'15%'}}></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-xs font-bold text-text-main mb-1"><span>Harsh Braking</span><span className="text-text-secondary">0 Active</span></div>
                   <div className="w-full bg-border rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{width:'5%'}}></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-xs font-bold text-text-main mb-1"><span>Critical Incidents</span><span className="text-text-secondary">0 Active</span></div>
                   <div className="w-full bg-border rounded-full h-1.5"><div className="bg-coral h-1.5 rounded-full" style={{width:'0%'}}></div></div>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* 6. ANALYTICS */}
        <Card className="bg-surface border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4 bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">Fleet Utilization</CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex flex-col justify-center h-[200px]">
            {/* Simple Mock Chart using flex blocks */}
            <div className="flex h-full items-end space-x-2 w-full justify-between mt-4">
              {[40, 55, 45, 60, 80, 75, 90, 85, 70, 65].map((val, i) => (
                 <div key={i} className="w-full bg-info-light rounded-t-sm relative group transition-all duration-300 hover:bg-info" style={{ height: `${val}%` }}>
                 </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-bold text-text-secondary mt-3">
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
