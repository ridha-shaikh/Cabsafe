import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { StatCard } from '../components/charts/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useSimulationStore } from '../store/simulationStore';
import { Car, AlertTriangle, ShieldAlert, Navigation } from 'lucide-react';
import { SimulationState, CabSimState } from '../types/enums';

export default function DashboardPage() {
  const { cabs, config } = useSimulationStore();
  const cabList = Object.values(cabs);
  
  const activeCabs = cabList.filter(c => c.state === CabSimState.EN_ROUTE).length;
  const eventsCount = cabList.filter(c => c.activeEventId).length;

  return (
    <PageContainer title="Dashboard" description="Real-time overview of fleet operations">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Active Cabs" 
          value={activeCabs.toString()} 
          icon={<Car className="h-5 w-5 text-primary-500" />} 
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Total Mock Cabs" 
          value={config.activeCabs.toString()} 
          icon={<Navigation className="h-5 w-5 text-blue-500" />} 
        />
        <StatCard 
          title="Active Events" 
          value={eventsCount.toString()} 
          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />} 
        />
        <StatCard 
          title="Critical Alerts" 
          value="0" 
          icon={<ShieldAlert className="h-5 w-5 text-red-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Fleet Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-gray-400">Charts will render here when data is populated</p>
          </CardContent>
        </Card>
        
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Recent Anomalies</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-gray-400">Event feed will render here</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
