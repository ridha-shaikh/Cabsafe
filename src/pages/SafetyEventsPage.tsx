import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useSimulationStore } from '../store/simulationStore';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

export default function SafetyEventsPage() {
  const { cabs } = useSimulationStore();
  const cabList = Object.values(cabs);
  const events = cabList.filter(c => c.activeEventId);

  return (
    <PageContainer title="Safety Events" description="Monitor and review anomalous driving behavior across the fleet.">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-warning-light border-warning/20 shadow-sm">
           <CardContent className="p-6">
              <div className="flex items-center text-warning mb-2"><AlertTriangle className="h-5 w-5 mr-2" /><span className="font-bold text-sm uppercase tracking-wide">Active Alerts</span></div>
              <div className="text-4xl font-extrabold text-warning">{events.length}</div>
           </CardContent>
        </Card>
        <Card className="bg-surface border-border shadow-sm">
           <CardContent className="p-6">
              <div className="flex items-center text-text-secondary mb-2"><Clock className="h-5 w-5 mr-2" /><span className="font-bold text-sm uppercase tracking-wide">24h History</span></div>
              <div className="text-4xl font-extrabold text-text-main">142</div>
           </CardContent>
        </Card>
        <Card className="bg-surface border-border shadow-sm">
           <CardContent className="p-6">
              <div className="flex items-center text-text-secondary mb-2"><ShieldAlert className="h-5 w-5 mr-2" /><span className="font-bold text-sm uppercase tracking-wide">Critical Incidents</span></div>
              <div className="text-4xl font-extrabold text-text-main">0</div>
           </CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden bg-surface">
        <CardHeader className="border-b border-border bg-background">
           <CardTitle className="text-base font-extrabold text-text-main">Current Active Events</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Event ID</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary font-medium">
                       No active safety events. Fleet is operating normally.
                    </td>
                 </tr>
              ) : (
                events.map((cab, idx) => (
                  <tr key={idx} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-text-main">EVT-{Math.floor(Math.random() * 90000) + 10000}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-text-main">
                      {cab.state.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-text-secondary">
                      {cab.cabId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warning-light text-warning">
                        Warning
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      <button className="text-primary hover:text-primary-dark">Review</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
