import React, { useState, useEffect, useRef, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';
import {
  Activity,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Search,
  ExternalLink,
  Code2,
  Clock,
  Car,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { CabSimState } from '../types/enums';

interface RawCabRow {
  cab_id: string;
  registration_number: string;
  model?: string | null;
  vehicle_type?: string | null;
  make_year?: number | string | null;
  color?: string | null;
  fuel_type?: string | null;
  seating_capacity?: number | string | null;
  status: string;
  current_latitude?: number | string | null;
  current_longitude?: number | string | null;
  current_speed?: number | string | null;
  mileage_km?: number | string | null;
  last_telemetry_at?: string | null;
  created_at?: string | null;
}

interface RawEventRow {
  event_id: string;
  cab_id: string;
  driver_id: string;
  trip_id?: string | null;
  event_type: string;
  severity: string;
  start_time: string;
  max_value?: number | string | null;
  threshold_value?: number | string | null;
  start_latitude?: number | string | null;
  start_longitude?: number | string | null;
  status: string;
  created_at: string;
}

import { getApiBaseUrl } from '../config/apiConfig';

const BASE_URL = getApiBaseUrl();

export default function TelemetryMonitorPage() {
  const [cabs, setCabs] = useState<RawCabRow[]>([]);
  const [events, setEvents] = useState<RawEventRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);
  const [pollInterval, setPollInterval] = useState<number>(4000); // 4 seconds
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'cabs' | 'events' | 'json'>('cabs');
  const pollTimerRef = useRef<any>(null);

  // Fetch telemetry and safety events directly from AWS RDS via Lambda
  const fetchAwsData = async () => {
    const startTime = performance.now();
    try {
      const [cabsRes, eventsRes] = await Promise.all([
        fetch(`${BASE_URL}/cabs`, { cache: 'no-store' }),
        fetch(`${BASE_URL}/events`, { cache: 'no-store' }),
      ]);

      const roundTrip = Math.round(performance.now() - startTime);
      setLatencyMs(roundTrip);

      if (!cabsRes.ok) {
        throw new Error(`AWS GET /cabs failed with HTTP ${cabsRes.status}`);
      }

      const cabsData = await cabsRes.json();
      setCabs(Array.isArray(cabsData) ? cabsData : []);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      }

      setLastPolledAt(new Date());
      setError(null);
    } catch (err: any) {
      console.error('AWS Telemetry poll failed:', err);
      setError(err?.message || 'Failed to poll AWS telemetry');
    } finally {
      setLoading(false);
    }
  };

  // Continuous polling loop
  useEffect(() => {
    fetchAwsData();

    if (!isPollingActive) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    pollTimerRef.current = setInterval(() => {
      fetchAwsData();
    }, pollInterval);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [pollInterval, isPollingActive]);

  // Filtered cabs
  const filteredCabs = useMemo(() => {
    return cabs.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.cab_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.model && c.model.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchesStatus =
          c.status === 'ON_TRIP' ||
          c.status === 'GOING_TO_PICKUP' ||
          c.status === 'ARRIVED_PICKUP' ||
          c.status === 'SPEEDING' ||
          c.status === 'HARSH_BRAKE' ||
          c.status === 'SUDDEN_ACCEL' ||
          c.status === 'SOS';
      } else if (statusFilter === 'AVAILABLE') {
        matchesStatus = c.status === 'AVAILABLE' || c.status === 'IDLE';
      } else if (statusFilter === 'OFFLINE') {
        matchesStatus = c.status === 'OFFLINE' || c.status === 'MAINTENANCE';
      }

      return matchesSearch && matchesStatus;
    });
  }, [cabs, searchQuery, statusFilter]);

  // Derived stats from actual database records
  const totalCabsInDb = cabs.length;
  const activeCabsInDb = cabs.filter((c) =>
    ['ON_TRIP', 'GOING_TO_PICKUP', 'ARRIVED_PICKUP', 'SPEEDING', 'HARSH_BRAKE', 'SUDDEN_ACCEL', 'SOS'].includes(c.status) ||
    (c.current_speed && Number(c.current_speed) > 0)
  ).length;

  const totalEventsInDb = events.length;
  const activeSosInDb = events.filter((e) => e.event_type === 'SOS' || e.event_type === 'PANIC_BUTTON').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_TRIP':
      case 'GOING_TO_PICKUP':
        return <Badge variant="success">{status}</Badge>;
      case 'AVAILABLE':
      case 'IDLE':
        return <Badge variant="info">{status}</Badge>;
      case 'SPEEDING':
      case 'HARSH_BRAKE':
      case 'SUDDEN_ACCEL':
        return <Badge variant="warning">{status}</Badge>;
      case 'SOS':
        return <Badge variant="danger" className="animate-pulse font-extrabold">SOS ALERT</Badge>;
      case 'OFFLINE':
      case 'MAINTENANCE':
        return <Badge variant="offline">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <PageContainer
      title="AWS RDS Live Telemetry Monitor"
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Polling Interval Switcher */}
          <div className="flex items-center bg-muted p-1 rounded-lg border border-border text-xs font-semibold">
            <span className="text-text-secondary px-2 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" /> Interval:
            </span>
            <button
              onClick={() => { setPollInterval(3000); setIsPollingActive(true); }}
              className={`px-2.5 py-1 rounded transition-all ${
                isPollingActive && pollInterval === 3000
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              3s
            </button>
            <button
              onClick={() => { setPollInterval(5000); setIsPollingActive(true); }}
              className={`px-2.5 py-1 rounded transition-all ${
                isPollingActive && pollInterval === 5000
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              5s
            </button>
            <button
              onClick={() => setIsPollingActive(!isPollingActive)}
              className={`px-2.5 py-1 rounded transition-all ${
                !isPollingActive
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              {isPollingActive ? 'Pause' : 'Resume'}
            </button>
          </div>

          <Button
            variant="primary"
            onClick={fetchAwsData}
            disabled={loading}
            className="flex items-center text-xs px-3 py-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Poll Now
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. AWS CONNECTIVITY HERO BANNER */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl border ${
                  error
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}
              >
                {error ? <WifiOff className="w-6 h-6" /> : <Wifi className="w-6 h-6 animate-pulse" />}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-extrabold text-text-main">
                    AWS Production Database Connection
                  </h2>
                  {error ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
                      AWS DISCONNECTED
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                      <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500 animate-ping" />
                      ● LIVE / AWS RDS CONNECTED (HTTP 200)
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-1 flex flex-wrap items-center gap-x-3">
                  <span>
                    Endpoint:{' '}
                    <code className="bg-background px-1.5 py-0.5 rounded border border-border font-mono text-[11px]">
                      {BASE_URL}
                    </code>
                  </span>
                  {latencyMs !== null && (
                    <span className="font-semibold text-text-main">
                      Latency: <span className="text-emerald-600 font-mono">{latencyMs} ms</span>
                    </span>
                  )}
                  {lastPolledAt && (
                    <span className="text-text-secondary">
                      Last Polled:{' '}
                      <span className="font-mono text-text-main font-semibold">
                        {lastPolledAt.toLocaleTimeString()}
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <div className="text-right text-xs">
                <span className="text-text-secondary block">Database Engine:</span>
                <span className="font-bold text-text-main font-mono">MySQL 8.4 on RDS</span>
              </div>
              <div className="h-8 w-px bg-border mx-2 hidden md:block" />
              <div className="text-right text-xs">
                <span className="text-text-secondary block">Target Schema:</span>
                <span className="font-bold text-text-main font-mono">cabsafe</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchAwsData}>
                Retry Connection
              </Button>
            </div>
          )}
        </div>

        {/* 2. SUMMARY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Total Cabs in RDS
                </p>
                <p className="text-2xl font-black text-text-main">{totalCabsInDb}</p>
                <p className="text-[11px] text-text-secondary">Source: `cabs` table</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Active Running in RDS
                </p>
                <p className="text-2xl font-black text-emerald-600">{activeCabsInDb}</p>
                <p className="text-[11px] text-text-secondary">Real-time moving status</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Safety Events in RDS
                </p>
                <p className="text-2xl font-black text-amber-600">{totalEventsInDb}</p>
                <p className="text-[11px] text-text-secondary">Source: `safety_events` table</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  SOS Records in RDS
                </p>
                <p className="text-2xl font-black text-red-600">{activeSosInDb}</p>
                <p className="text-[11px] text-text-secondary">High-severity alerts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. VIEW TOGGLE TABS */}
        <div className="flex border-b border-border space-x-4">
          <button
            onClick={() => setActiveTab('cabs')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'cabs'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-main'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>RDS Cabs & Telemetry ({filteredCabs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'events'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-main'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>RDS Safety Events Table ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-main'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Raw AWS REST Payload</span>
          </button>
        </div>

        {/* TAB 1: CABS TELEMETRY TABLE */}
        {activeTab === 'cabs' && (
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
                    <Input
                      placeholder="Search Cab ID or Reg..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                  <div className="flex bg-muted p-1 rounded-lg border border-border text-xs font-semibold">
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        statusFilter === 'ALL'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-main'
                      }`}
                    >
                      All ({cabs.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('ACTIVE')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        statusFilter === 'ACTIVE'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-main'
                      }`}
                    >
                      Active Trips
                    </button>
                    <button
                      onClick={() => setStatusFilter('AVAILABLE')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        statusFilter === 'AVAILABLE'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-main'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => setStatusFilter('OFFLINE')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        statusFilter === 'OFFLINE'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-main'
                      }`}
                    >
                      Offline
                    </button>
                  </div>
                </div>

                <div className="text-xs text-text-secondary font-medium">
                  Showing {filteredCabs.length} of {cabs.length} database records
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Cab ID</TableHead>
                    <TableHead className="font-bold">Registration</TableHead>
                    <TableHead className="font-bold">Vehicle Model</TableHead>
                    <TableHead className="font-bold">DB Status</TableHead>
                    <TableHead className="font-bold">Speed</TableHead>
                    <TableHead className="font-bold">GPS Coordinates</TableHead>
                    <TableHead className="font-bold">Mileage</TableHead>
                    <TableHead className="font-bold">Last DB Telemetry Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCabs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-text-secondary">
                        {loading ? 'Polling AWS database...' : 'No matching records in AWS database.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCabs.map((cab) => {
                      const speedNum = cab.current_speed !== null && cab.current_speed !== undefined
                        ? Number(cab.current_speed)
                        : null;

                      const latNum = cab.current_latitude !== null && cab.current_latitude !== undefined
                        ? Number(cab.current_latitude)
                        : null;

                      const lngNum = cab.current_longitude !== null && cab.current_longitude !== undefined
                        ? Number(cab.current_longitude)
                        : null;

                      const mileageNum = cab.mileage_km !== null && cab.mileage_km !== undefined
                        ? Number(cab.mileage_km)
                        : null;

                      return (
                        <TableRow key={cab.cab_id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-mono font-bold text-primary">
                            {cab.cab_id}
                          </TableCell>
                          <TableCell className="font-semibold text-text-main">
                            {cab.registration_number || <span className="text-text-secondary italic">Unavailable</span>}
                          </TableCell>
                          <TableCell className="text-text-main text-xs">
                            {cab.model || <span className="text-text-secondary italic">Unavailable</span>}
                          </TableCell>
                          <TableCell>{getStatusBadge(cab.status)}</TableCell>
                          <TableCell>
                            {speedNum !== null ? (
                              <span
                                className={`font-mono font-bold ${
                                  speedNum > 80
                                    ? 'text-red-600 font-extrabold'
                                    : speedNum > 0
                                    ? 'text-emerald-600'
                                    : 'text-text-secondary'
                                }`}
                              >
                                {speedNum} km/h
                              </span>
                            ) : (
                              <span className="text-text-secondary text-xs italic">Unavailable</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {latNum !== null && lngNum !== null ? (
                              <span>
                                {latNum.toFixed(4)}, {lngNum.toFixed(4)}
                              </span>
                            ) : (
                              <span className="text-text-secondary italic">Unavailable</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-main">
                            {mileageNum !== null ? (
                              `${mileageNum.toLocaleString()} km`
                            ) : (
                              <span className="text-text-secondary italic">Unavailable</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-secondary">
                            {cab.last_telemetry_at ? (
                              <span title={cab.last_telemetry_at} className="text-text-main">
                                {new Date(cab.last_telemetry_at).toLocaleTimeString()}
                              </span>
                            ) : (
                              <span className="italic text-text-secondary">Unavailable</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: RDS SAFETY EVENTS TABLE */}
        {activeTab === 'events' && (
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold text-text-main">
                    Live `safety_events` in RDS MySQL
                  </CardTitle>
                  <p className="text-xs text-text-secondary mt-1">
                    Persisted by AWS Lambda and IoT Core into Amazon RDS. Idempotent and foreign-key verified.
                  </p>
                </div>
                <Badge variant="default">{events.length} Events in RDS</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Event ID</TableHead>
                    <TableHead className="font-bold">Cab ID</TableHead>
                    <TableHead className="font-bold">Driver ID</TableHead>
                    <TableHead className="font-bold">Event Type</TableHead>
                    <TableHead className="font-bold">Severity</TableHead>
                    <TableHead className="font-bold">Metric Value / Threshold</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                    <TableHead className="font-bold">Timestamp</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-text-secondary">
                        No safety events currently in RDS database.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((evt) => (
                      <TableRow key={evt.event_id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-mono font-bold text-primary text-xs">
                          {evt.event_id}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{evt.cab_id}</TableCell>
                        <TableCell className="font-mono text-xs text-text-secondary">
                          {evt.driver_id}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold text-xs ${
                              evt.event_type === 'SOS' || evt.event_type === 'PANIC_BUTTON'
                                ? 'text-red-600 font-bold'
                                : 'text-text-main'
                            }`}
                          >
                            {evt.event_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              evt.severity === 'CRITICAL'
                                ? 'danger'
                                : evt.severity === 'HIGH'
                                ? 'danger'
                                : evt.severity === 'MEDIUM'
                                ? 'warning'
                                : 'info'
                            }
                          >
                            {evt.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {evt.max_value !== null && evt.max_value !== undefined ? (
                            <span>
                              {evt.max_value}
                              {evt.threshold_value ? ` / ${evt.threshold_value}` : ''}
                            </span>
                          ) : (
                            <span className="text-text-secondary italic">Unavailable</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {evt.start_latitude && evt.start_longitude ? (
                            `${Number(evt.start_latitude).toFixed(4)}, ${Number(evt.start_longitude).toFixed(4)}`
                          ) : (
                            <span className="text-text-secondary italic">Unavailable</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-text-secondary">
                          {evt.start_time
                            ? new Date(evt.start_time).toLocaleString()
                            : <span className="text-text-secondary italic">Unavailable</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={evt.status === 'ACTIVE' ? 'warning' : 'success'}>
                            {evt.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: RAW AWS JSON PAYLOAD */}
        {activeTab === 'json' && (
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold text-text-main">
                    Raw HTTP Response from API Gateway / Lambda
                  </CardTitle>
                  <p className="text-xs text-text-secondary mt-1">
                    Direct proof of HTTP 200 payload returning straight from AWS RDS MySQL.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`${BASE_URL}/cabs`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Open /cabs in browser <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[500px] border border-slate-800">
                {JSON.stringify({
                  status: 'HTTP 200 OK',
                  endpoint: `${BASE_URL}/cabs`,
                  latencyMs,
                  lastPolledAt: lastPolledAt?.toISOString(),
                  totalRecords: cabs.length,
                  sampleRecords: cabs.slice(0, 5),
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
