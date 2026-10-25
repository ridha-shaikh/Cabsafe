import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useSimulationStore, isStaleDemoEvent } from '../store/simulationStore';
import { safetyEventService } from '../services';
import {
  AlertTriangle, Clock, ShieldAlert, CheckCircle2, Navigation,
  FileText, RefreshCw, AlertCircle, Loader2
} from 'lucide-react';
import { EventSeverity, EventStatus, CabSimState } from '../types/enums';
import { IncidentInvestigationModal } from '../components/safety/IncidentInvestigationModal';
import { SafetyEvent } from '../types/entities';

export default function SafetyEventsPage() {
  const { safetyEvents: storeEvents, cabs, resolveSafetyEvent, updateCab, hydrateSafetyEvents, resolvedEventIds } = useSimulationStore();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CRITICAL'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<SafetyEvent | null>(null);
  const [apiEvents, setApiEvents] = useState<SafetyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch events from RDS via safetyEventService
  const loadEvents = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);
    try {
      const data = await safetyEventService.getAll();
      if (Array.isArray(data)) {
        setApiEvents(data);
        if (data.length > 0) {
          hydrateSafetyEvents(data);
        }
      }
    } catch (err: any) {
      console.warn('[SafetyEventsPage] Fetch error:', err?.message);
      setError(err?.message || 'Failed to fetch safety events from live database');
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [hydrateSafetyEvents]);

  useEffect(() => {
    loadEvents();
    // Auto-refresh periodically to pick up real-time RDS inserts
    const interval = setInterval(() => {
      loadEvents(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  // An event is live if its status is ACTIVE, not manually/persisted resolved, has no endTime, and not a stale demo drill
  const isEventLive = useCallback((e: SafetyEvent) => {
    if (resolvedEventIds.has(e.eventId)) return false;
    if (e.endTime) return false;
    if (e.status === EventStatus.RESOLVED || (e.status as any) === 'RESOLVED') return false;
    if (isStaleDemoEvent(e)) return false; // Stale demo drills (> 30 min old) expire, real incidents stay active
    return e.status === EventStatus.ACTIVE || (e.status as any) === 'ACTIVE';
  }, [resolvedEventIds]);

  // Merge store events and API events, deduplicating by eventId and keeping latest state
  const allEvents = useMemo(() => {
    const map = new Map<string, SafetyEvent>();

    // 1. Add store events (in-memory simulation events)
    storeEvents.forEach(e => {
      if (e?.eventId) map.set(e.eventId, e);
    });

    // 2. Overlay API events (from RDS)
    apiEvents.forEach(e => {
      if (e?.eventId) {
        const existing = map.get(e.eventId);
        map.set(e.eventId, { ...existing, ...e });
      }
    });

    // 3. Apply resolved overrides
    const list = Array.from(map.values()).map(e => {
      const isBackendResolved =
        e.status === EventStatus.RESOLVED ||
        (e.status as any) === 'RESOLVED' ||
        Boolean(e.endTime);
      const isExpiredDemo = isStaleDemoEvent(e);
      const isSessionResolved = resolvedEventIds.has(e.eventId);

      if (isBackendResolved || isExpiredDemo) {
        return { ...e, status: EventStatus.RESOLVED };
      }
      if (isSessionResolved) {
        // Backend status and endTime remain unchanged; isSessionResolved flag drives UI presentation
        return { ...e, isSessionResolved: true } as SafetyEvent;
      }
      return e;
    });

    // 4. Sort descending by time (newest first)
    return list.sort((a, b) => {
      const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
      const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [storeEvents, apiEvents, resolvedEventIds]);

  const liveActiveEvents = useMemo(() => allEvents.filter(isEventLive), [allEvents, isEventLive]);
  const criticalEvents = useMemo(() => allEvents.filter(e => e.severity === EventSeverity.CRITICAL || (e.severity as any) === 'CRITICAL'), [allEvents]);

  const displayedEvents = useMemo(() => {
    return allEvents.filter(e => {
      if (filter === 'ACTIVE') return isEventLive(e);
      if (filter === 'CRITICAL') return e.severity === EventSeverity.CRITICAL || (e.severity as any) === 'CRITICAL';
      return true;
    });
  }, [allEvents, filter, isEventLive]);

  const handleQuickResolve = (e: React.MouseEvent, eventId: string, cabId: string) => {
    e.stopPropagation();
    resolveSafetyEvent(eventId);
    // Clear anomaly from cab only if this was its specific active event
    const cab = cabs[cabId];
    if (cab?.activeEventId === eventId) {
      updateCab(cabId, {
        activeEventId: undefined,
        activeAnomalyType: null,
        state: CabSimState.ON_TRIP,
      });
    }
  };

  const renderTelemetry = (event: SafetyEvent, isLive: boolean, liveCab?: any) => {
    const eventType = String(event.eventType || '');

    if (eventType === 'OVER_SPEEDING') {
      if (isLive && liveCab && liveCab.currentSpeed > 60) {
        return (
          <span className="text-danger font-black">
            Speed: {Math.round(liveCab.currentSpeed)} km/h (+{Math.round(liveCab.currentSpeed - 60)})
          </span>
        );
      }
      if (event.maxValue != null) {
        return (
          <span className="text-text-main font-bold">
            Peak: {Math.round(Number(event.maxValue))} km/h{' '}
            <span className="text-[10px] font-normal text-text-secondary">
              (Limit: {event.thresholdValue != null ? Math.round(Number(event.thresholdValue)) : 60})
            </span>
          </span>
        );
      }
    }

    if (eventType === 'HARSH_BRAKING') {
      return (
        <span className="text-text-main font-bold">
          Decel: {event.maxValue != null ? Number(event.maxValue).toFixed(1) : '-6.0'} m/sÂ²
        </span>
      );
    }

    if (eventType === 'SUDDEN_ACCELERATION') {
      return (
        <span className="text-text-main font-bold">
          Accel: +{event.maxValue != null ? Number(event.maxValue).toFixed(1) : '4.0'} m/sÂ²
        </span>
      );
    }

    if (eventType === 'SOS') {
      return (
        <span className="text-danger font-extrabold flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-danger animate-ping mr-1.5"></span>
          Emergency Trigger
        </span>
      );
    }

    if (event.maxValue != null) {
      return (
        <span className="text-text-main font-bold">
          Val: {Number(event.maxValue).toFixed(1)}
        </span>
      );
    }

    return 'â€”';
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'â€”';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? 'â€”' : d.toLocaleTimeString();
    } catch {
      return 'â€”';
    }
  };

  return (
    <PageContainer title="Safety Events" description="Monitor and review driving anomalies and safety events across the fleet.">

      {/* API Error Notification */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>RDS Sync Issue: {error}</span>
          </div>
          <button
            onClick={() => loadEvents(true)}
            className="ml-4 font-bold text-red-700 hover:text-red-900 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className={`${liveActiveEvents.length > 0 ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200' : 'bg-surface border-border'} shadow-sm cursor-pointer transition-all`}
          onClick={() => setFilter('ACTIVE')}
        >
           <CardContent className="p-6">
              <div className="flex items-center text-amber-700 mb-2">
                <AlertTriangle className={`h-5 w-5 mr-2 ${liveActiveEvents.length > 0 ? 'animate-bounce' : ''}`} />
                <span className="font-bold text-sm uppercase tracking-wide">Live Active Events</span>
              </div>
              <div className="text-4xl font-extrabold text-amber-800">{liveActiveEvents.length}</div>
              <p className="text-xs text-text-secondary mt-1 font-medium">
                {liveActiveEvents.length === 0 ? 'All active cabs driving within safe limits' : `${liveActiveEvents.length} running vehicle(s) currently flagged for anomaly`}
              </p>
           </CardContent>
        </Card>

        <Card className="bg-surface border-border shadow-sm cursor-pointer" onClick={() => setFilter('ALL')}>
           <CardContent className="p-6">
              <div className="flex items-center text-text-secondary mb-2">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-bold text-sm uppercase tracking-wide">Historical Log</span>
              </div>
              <div className="text-4xl font-extrabold text-text-main">{allEvents.length}</div>
              <p className="text-xs text-text-secondary mt-1 font-medium">Total incidents recorded across fleet</p>
           </CardContent>
        </Card>

        <Card className="bg-danger/10 border-danger/20 shadow-sm cursor-pointer" onClick={() => setFilter('CRITICAL')}>
           <CardContent className="p-6">
              <div className="flex items-center text-danger mb-2">
                <ShieldAlert className="h-5 w-5 mr-2" />
                <span className="font-bold text-sm uppercase tracking-wide">Critical Incidents</span>
              </div>
              <div className="text-4xl font-extrabold text-danger">{criticalEvents.length}</div>
              <p className="text-xs text-text-secondary mt-1 font-medium">High-risk over-speeding or emergency incidents</p>
           </CardContent>
        </Card>
      </div>

      {/* Events Table Card */}
      <Card className="border border-border shadow-sm overflow-hidden bg-surface">
        <CardHeader className="border-b border-border bg-background flex flex-row items-center justify-between py-4">
           <div>
             <CardTitle className="text-base font-extrabold text-text-main">
               Vehicle Infractions & Driving Anomalies ({displayedEvents.length})
             </CardTitle>
             <p className="text-xs text-text-secondary mt-0.5">
               Showing {filter === 'ALL' ? 'all historical & live events' : filter === 'ACTIVE' ? 'only live active events' : 'critical severity events'}
             </p>
           </div>
           <div className="flex items-center space-x-2">
             <button
               onClick={() => loadEvents(true)}
               disabled={loading || isRefreshing}
               className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text-main flex items-center space-x-1.5 transition-colors disabled:opacity-50"
               title="Refresh safety events from live RDS"
             >
               <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
               <span className="hidden sm:inline">Refresh</span>
             </button>
             {(['ALL', 'ACTIVE', 'CRITICAL'] as const).map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                   filter === f
                     ? 'bg-primary text-white shadow-sm'
                     : 'bg-surface border border-border text-text-secondary hover:text-text-main'
                 }`}
               >
                 {f === 'ALL' ? 'All Incidents' : f === 'ACTIVE' ? `Live Active (${liveActiveEvents.length})` : 'Critical Only'}
               </button>
             ))}
           </div>
        </CardHeader>

        <div className="px-6 py-2.5 bg-amber-50/80 border-b border-amber-200/70 text-[11px] text-amber-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Resolution Notice:</strong> Manual resolutions are tracked in your active operator session. Permanent status updates in AWS RDS require deploying a backend <code className="bg-amber-100/90 text-amber-900 px-1 py-0.5 rounded font-mono text-[10px]">PATCH /events</code> route.
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="px-3.5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider">ID</th>
                <th className="px-3.5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Type</th>
                <th className="px-3.5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Cab / Driver</th>
                <th className="px-3.5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Telemetry</th>
                <th className="px-3.5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Severity</th>
                <th className="px-3.5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-3.5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Time</th>
                <th className="px-3.5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && allEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-text-secondary font-medium text-xs">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      <span className="font-semibold text-text-main">Loading safety events from RDS database...</span>
                      <span className="text-[11px] text-text-secondary">Querying live AWS API Gateway endpoint</span>
                    </div>
                  </td>
                </tr>
              ) : displayedEvents.length === 0 ? (
                 <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-text-secondary font-medium text-xs">
                       {filter === 'ACTIVE'
                         ? 'âœ“ No active driving violations right now. All running cabs are operating safely.'
                         : filter === 'CRITICAL'
                         ? 'No critical severity safety events found.'
                         : 'No safety events found in the database.'}
                    </td>
                 </tr>
              ) : (
                displayedEvents.map((event) => {
                  const isLive = isEventLive(event);
                  const liveCab = cabs[event.cabId];
                  const isCritical = event.severity === EventSeverity.CRITICAL || (event.severity as any) === 'CRITICAL';

                  return (
                    <tr key={event.eventId} className={`${isLive ? 'bg-amber-50/60 font-semibold' : 'hover:bg-background/60'} transition-colors`}>
                      <td className="px-3.5 py-3 text-xs font-mono font-bold text-text-main whitespace-nowrap">
                        {event.eventId}
                      </td>
                      <td className="px-3.5 py-3 text-xs font-extrabold text-text-main whitespace-nowrap">
                        {(event.eventType || 'UNKNOWN').replace(/_/g, ' ')}
                      </td>
                      <td className="px-3.5 py-3 text-xs whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-text-main">{event.cabId}</span>
                          {isLive && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-green-100 text-green-800 animate-pulse">
                              <Navigation className="h-2.5 w-2.5 mr-0.5" /> LIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-secondary">{event.driverId || liveCab?.driverId || 'Unassigned'}</div>
                      </td>
                      <td className="px-3.5 py-3 text-xs font-mono font-semibold whitespace-nowrap">
                        {renderTelemetry(event, isLive, liveCab)}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-danger/15 text-danger border border-danger/30'
                            : 'bg-warning-light text-warning border border-warning/30'
                        }`}>
                          {event.severity}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        {isLive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                            Active Now
                          </span>
                        ) : (event as any).isSessionResolved ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300" title="Resolved in operator session. Permanent RDS update requires backend PATCH route.">
                            Resolved (Session)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                            {event.status || 'Resolved'}
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-[11px] text-text-secondary whitespace-nowrap">
                        {formatTime(event.startTime || event.createdAt)}
                      </td>
                      <td className="px-3.5 py-3 text-xs font-bold text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isLive && (
                            <button
                              onClick={(e) => handleQuickResolve(e, event.eventId, event.cabId)}
                              title="Resolve this anomaly immediately"
                              className="inline-flex items-center text-[11px] font-bold text-white bg-green-600 hover:bg-green-700 transition-colors px-2 py-1 rounded-lg shadow-sm"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="inline-flex items-center text-[11px] font-bold text-text-secondary hover:text-text-main hover:bg-background border border-border transition-colors px-2 py-1 rounded-lg"
                          >
                            <FileText className="h-3 w-3 mr-1" /> Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Incident Investigation & Dispatch Action Modal */}
      {selectedEvent && (
        <IncidentInvestigationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </PageContainer>
  );
}
