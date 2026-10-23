import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useSimulationStore } from '../store/simulationStore';
import { ShieldAlert, AlertOctagon, CheckCircle, Clock, Radio, CheckCircle2 } from 'lucide-react';
import { SOSStatus, SOSSeverity, CabSimState } from '../types/enums';
import { anomalyDetector } from '../anomalyDetection/AnomalyDetector';

export default function SOSPage() {
  const { sosRequests, updateSOSStatus, updateCab } = useSimulationStore();
  const [triggering, setTriggering] = useState(false);
  const [lastTriggerNotice, setLastTriggerNotice] = useState<string | null>(null);

  const activeSOS = sosRequests.filter(s => s.status === SOSStatus.ACTIVE || s.status === SOSStatus.RESPONDING);
  const criticalCount = sosRequests.filter(s => s.severity === SOSSeverity.CRITICAL).length;

  const handleTestSimulatedSos = () => {
    setTriggering(true);
    setLastTriggerNotice(null);
    try {
      const storeCabs = useSimulationStore.getState().cabs;
      const cabList = Object.values(storeCabs);
      const targetCab = cabList.find(c => c.state === CabSimState.ON_TRIP) || cabList[0] || { cabId: 'CAB-001' };

      anomalyDetector.triggerSOS(
        targetCab.cabId,
        '[SIMULATED DEMO] Passenger panic button triggered â€” Demonstration drill',
        SOSSeverity.CRITICAL
      );

      setLastTriggerNotice(`[SIMULATED DEMO] SOS triggered for ${targetCab.cabId}. Published to AWS IoT topic cabsafe/telemetry/${targetCab.cabId} with status="SOS". AWS IoT Rule CabSafeSOSToSNS triggers Amazon SNS email!`);
    } catch (err: any) {
      setLastTriggerNotice(`Error triggering simulated SOS: ${err?.message}`);
    } finally {
      setTimeout(() => setTriggering(false), 2000);
    }
  };

  const handleAcknowledge = (sosId: string) => {
    updateSOSStatus(sosId, {
      status: SOSStatus.RESPONDING,
      acknowledgedAt: new Date().toISOString(),
      handledBy: 'Fleet Dispatcher (HQ)',
    });
  };

  const handleResolve = (sosId: string, cabId: string) => {
    updateSOSStatus(sosId, {
      status: SOSStatus.RESOLVED,
      resolvedAt: new Date().toISOString(),
      resolutionNotes: 'Operator verified driver and passenger safety. Incident resolved.',
    });
    // Return cab to normal state
    updateCab(cabId, {
      state: CabSimState.ON_TRIP,
      activeAnomalyType: null,
      activeEventId: undefined,
    });
    anomalyDetector.clearActiveSos(cabId);
  };

  const sortedList = [...sosRequests].reverse();

  return (
    <PageContainer
      title="SOS Emergencies"
      description="High-priority emergency monitoring, passenger panic triggers, and safety response console."
      action={
        <Button
          variant="danger"
          onClick={handleTestSimulatedSos}
          disabled={triggering}
          className="flex items-center text-xs font-bold"
        >
          <Radio className={`w-3.5 h-3.5 mr-1.5 ${triggering ? 'animate-ping' : ''}`} />
          {triggering ? 'Publishing to AWS IoT Core...' : 'Test Simulated SOS (Trigger AWS IoT & SNS)'}
        </Button>
      }
    >
      {lastTriggerNotice && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{lastTriggerNotice}</span>
          </div>
          <button
            onClick={() => setLastTriggerNotice(null)}
            className="ml-4 font-bold text-emerald-800 hover:text-emerald-950 px-2 py-0.5 rounded"
          >
            âœ•
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className={`${activeSOS.length > 0 ? 'bg-danger/10 border-danger/40 ring-2 ring-danger/20' : 'bg-surface border-border'} shadow-sm transition-all`}>
           <CardContent className="p-6">
              <div className="flex items-center text-danger mb-2">
                <AlertOctagon className={`h-5 w-5 mr-2 ${activeSOS.length > 0 ? 'animate-bounce' : ''}`} />
                <span className="font-bold text-sm uppercase tracking-wide">Active Emergencies</span>
              </div>
              <div className="text-4xl font-extrabold text-danger">{activeSOS.length}</div>
              {activeSOS.length > 0 && (
                <p className="text-xs font-semibold text-danger mt-1 animate-pulse">Immediate dispatch response required</p>
              )}
           </CardContent>
        </Card>

        <Card className="bg-surface border-border shadow-sm">
           <CardContent className="p-6">
              <div className="flex items-center text-text-secondary mb-2">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-bold text-sm uppercase tracking-wide">Total SOS Incidents</span>
              </div>
              <div className="text-4xl font-extrabold text-text-main">{sosRequests.length}</div>
           </CardContent>
        </Card>

        <Card className="bg-surface border-border shadow-sm">
           <CardContent className="p-6">
              <div className="flex items-center text-text-secondary mb-2">
                <ShieldAlert className="h-5 w-5 mr-2" />
                <span className="font-bold text-sm uppercase tracking-wide">Critical Severities</span>
              </div>
              <div className="text-4xl font-extrabold text-text-main">{criticalCount}</div>
           </CardContent>
        </Card>
      </div>

      {/* SOS List */}
      <Card className="bg-surface border-border shadow-sm overflow-hidden">
         <CardHeader className="border-b border-border bg-background py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-extrabold text-text-main">
              SOS Incident Log ({sortedList.length})
            </CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            {sortedList.length === 0 ? (
               <div className="p-12 text-center text-text-secondary font-medium">No SOS records found.</div>
            ) : (
               <Table>
                 <TableHeader>
                   <TableRow className="bg-background">
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">SOS ID</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Vehicle / Driver</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Passenger</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Trigger Reason</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Severity</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Status</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Time</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {sortedList.map((row) => {
                     const isEmergency = row.status === SOSStatus.ACTIVE || row.status === SOSStatus.RESPONDING;
                     const isCritical = row.severity === SOSSeverity.CRITICAL;

                     return (
                       <TableRow key={row.sosId} className={`${isEmergency ? 'bg-danger/5 hover:bg-danger/10' : 'hover:bg-background/60'} transition-colors`}>
                         <TableCell className="font-mono font-bold text-sm text-text-main">
                           {row.sosId}
                         </TableCell>
                         <TableCell>
                           <div className="font-bold text-sm text-text-main">{row.cabId}</div>
                           <div className="text-xs text-text-secondary">{row.driverId}</div>
                         </TableCell>
                         <TableCell className="text-sm font-semibold text-text-main">
                           {row.passengerId || 'N/A'}
                         </TableCell>
                         <TableCell className="max-w-xs text-sm text-text-main font-medium truncate" title={row.reason}>
                           {row.reason || 'Emergency button activated'}
                         </TableCell>
                         <TableCell>
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                             isCritical ? 'bg-danger/15 text-danger border border-danger/30' : 'bg-warning-light text-warning border border-warning/30'
                           }`}>
                             {row.severity}
                           </span>
                         </TableCell>
                         <TableCell>
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                             row.status === SOSStatus.ACTIVE
                               ? 'bg-danger text-white animate-pulse'
                               : row.status === SOSStatus.RESPONDING
                               ? 'bg-amber-100 text-amber-800'
                               : 'bg-green-100 text-green-800'
                           }`}>
                             {row.status}
                           </span>
                         </TableCell>
                         <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                           {new Date(row.createdAt).toLocaleTimeString()}
                         </TableCell>
                         <TableCell className="text-right whitespace-nowrap">
                           {row.status === SOSStatus.ACTIVE ? (
                             <button
                               onClick={() => handleAcknowledge(row.sosId)}
                               className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold mr-2 transition-colors"
                             >
                               Respond
                             </button>
                           ) : null}
                           {row.status !== SOSStatus.RESOLVED ? (
                             <button
                               onClick={() => handleResolve(row.sosId, row.cabId)}
                               className="inline-flex items-center px-3 py-1 bg-primary hover:bg-primary-dark text-white rounded text-xs font-bold transition-colors"
                             >
                               <CheckCircle className="h-3 w-3 mr-1" /> Clear SOS
                             </button>
                           ) : (
                             <span className="text-xs text-text-secondary">Resolved</span>
                           )}
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
