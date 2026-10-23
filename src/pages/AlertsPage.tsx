import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useSimulationStore } from '../store/simulationStore';
import { AlertCircle, Bell, CheckCircle2 } from 'lucide-react';
import { AlertStatus, AlertSeverity } from '../types/enums';

export default function AlertsPage() {
  const { alerts, resolveAlert } = useSimulationStore();

  const activeAlerts = alerts.filter(a => a.status === AlertStatus.ACTIVE);
  const emergencyAlerts = alerts.filter(a => a.severity === AlertSeverity.EMERGENCY);

  const sortedAlerts = [...alerts].reverse();

  return (
    <PageContainer title="System Alerts" description="Centralized feed of operational alerts, anomalous behavior notices, and emergency triggers.">

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className={`${activeAlerts.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-surface border-border'} shadow-sm`}>
           <CardContent className="p-6">
              <div className="flex items-center text-amber-700 mb-2">
                <Bell className="h-5 w-5 mr-2" />
                <span className="font-bold text-sm uppercase tracking-wide">Active Alerts</span>
              </div>
              <div className="text-4xl font-extrabold text-amber-800">{activeAlerts.length}</div>
           </CardContent>
        </Card>

        <Card className="bg-surface border-border shadow-sm">
           <CardContent className="p-6">
              <div className="flex items-center text-text-secondary mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-bold text-sm uppercase tracking-wide">Total Alerts Logged</span>
              </div>
              <div className="text-4xl font-extrabold text-text-main">{alerts.length}</div>
           </CardContent>
        </Card>

        <Card className={`${emergencyAlerts.length > 0 ? 'bg-danger/10 border-danger/30' : 'bg-surface border-border'} shadow-sm`}>
           <CardContent className="p-6">
              <div className="flex items-center text-danger mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-bold text-sm uppercase tracking-wide">Emergency Alerts</span>
              </div>
              <div className="text-4xl font-extrabold text-danger">{emergencyAlerts.length}</div>
           </CardContent>
        </Card>
      </div>

      <Card className="bg-surface border-border shadow-sm overflow-hidden">
         <CardHeader className="border-b border-border bg-background py-4">
            <CardTitle className="text-base font-extrabold text-text-main">
              Alert Stream ({sortedAlerts.length})
            </CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            {sortedAlerts.length === 0 ? (
               <div className="p-8 text-center text-text-secondary">No alerts recorded.</div>
            ) : (
               <Table>
                 <TableHeader>
                   <TableRow className="bg-background">
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Alert ID</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Title & Details</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Cab</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Severity</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Status</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary">Time</TableHead>
                     <TableHead className="uppercase text-xs font-bold text-text-secondary text-right">Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {sortedAlerts.map((row) => {
                     const isEmergency = row.severity === AlertSeverity.EMERGENCY;
                     const isCrit = row.severity === AlertSeverity.CRITICAL;
                     const isActive = row.status === AlertStatus.ACTIVE;

                     return (
                       <TableRow key={row.alertId} className="hover:bg-background/60 transition-colors">
                         <TableCell className="font-mono text-xs font-bold text-text-main whitespace-nowrap">
                           {row.alertId}
                         </TableCell>
                         <TableCell>
                           <div className="font-bold text-sm text-text-main">{row.title}</div>
                           <div className="text-xs text-text-secondary line-clamp-1">{row.message}</div>
                         </TableCell>
                         <TableCell className="text-sm font-bold text-text-main whitespace-nowrap">
                           {row.cabId}
                         </TableCell>
                         <TableCell>
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                             isEmergency
                               ? 'bg-danger text-white animate-pulse'
                               : isCrit
                               ? 'bg-danger/15 text-danger border border-danger/30'
                               : 'bg-warning-light text-warning border border-warning/30'
                           }`}>
                             {row.severity}
                           </span>
                         </TableCell>
                         <TableCell>
                           <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                             isActive ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                           }`}>
                             {row.status}
                           </span>
                         </TableCell>
                         <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                           {new Date(row.createdAt).toLocaleTimeString()}
                         </TableCell>
                         <TableCell className="text-right whitespace-nowrap">
                           {isActive ? (
                             <button
                               onClick={() => resolveAlert(row.alertId)}
                               className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-dark transition-colors px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20"
                             >
                               <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Dismiss
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
