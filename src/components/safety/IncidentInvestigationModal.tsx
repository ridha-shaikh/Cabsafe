import React, { useState } from 'react';
import { SafetyEvent } from '../../types/entities';
import { useSimulationStore } from '../../store/simulationStore';
import { MOCK_DRIVERS, MOCK_CABS } from '../../data/mockData';
import {
  X, AlertTriangle, ShieldAlert, Phone, Radio, FileText,
  CheckCircle2, Gauge, MapPin, User, Car, ExternalLink
} from 'lucide-react';
import { EventSeverity, EventStatus } from '../../types/enums';
import { useNavigate } from 'react-router-dom';

interface IncidentInvestigationModalProps {
  event: SafetyEvent;
  onClose: () => void;
}

export function IncidentInvestigationModal({ event, onClose }: IncidentInvestigationModalProps) {
  const { cabs, updateCab, resolveSafetyEvent } = useSimulationStore();
  const navigate = useNavigate();

  const cab = cabs[event.cabId];
  const driver = MOCK_DRIVERS.find(d => d.driverId === event.driverId || d.assignedCabId === event.cabId);
  const cabMeta = MOCK_CABS.find(c => c.cabId === event.cabId);

  const [warningSent, setWarningSent] = useState(false);
  const [callingDriver, setCallingDriver] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [demeritApplied, setDemeritApplied] = useState(false);
  const [notes, setNotes] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const isLive = (event.status === EventStatus.ACTIVE || event.status === ('ACTIVE' as any)) && !!cab && cab.activeEventId === event.eventId;
  const currentSpeed = cab ? Math.round(cab.currentSpeed) : (event.maxValue != null ? Math.round(Number(event.maxValue)) : 0);
  const speedLimit = 60; // City speed limit for Chennai
  const speedDelta = currentSpeed - speedLimit;

  // Real functionality: Dispatching an in-cab IoT warning forces the simulated vehicle to decelerate!
  const handleSendInCabWarning = () => {
    setWarningSent(true);

    if (cab) {
      // Cause real physical deceleration in the simulation engine!
      updateCab(event.cabId, {
        targetSpeed: 50,
        activeAnomalyType: null,
        anomalyTargetSpeed: undefined,
        anomalyDurationMs: 0,
        activeEventId: undefined,
      });

      // Mark event as resolved by dispatcher intervention
      resolveSafetyEvent(event.eventId);
    }
  };

  const handleCallDriver = () => {
    setCallingDriver(true);
    let sec = 0;
    const interval = setInterval(() => {
      sec++;
      setCallTimer(sec);
    }, 1000);

    // Auto-hangup after 6 seconds
    setTimeout(() => {
      clearInterval(interval);
      setCallingDriver(false);
      setCallTimer(0);
    }, 6000);
  };

  const handleApplyDemerit = () => {
    setDemeritApplied(true);
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col">

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border bg-background flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${
              event.severity === EventSeverity.CRITICAL ? 'bg-danger/15 text-danger' : 'bg-warning-light text-warning'
            }`}>
              {event.severity === EventSeverity.CRITICAL ? (
                <ShieldAlert className="h-6 w-6" />
              ) : (
                <AlertTriangle className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-text-main">
                  {(event.eventType || 'UNKNOWN').replace(/_/g, ' ')} Incident
                </h3>
                <span className="font-mono text-xs text-text-secondary">({event.eventId})</span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Telemetry violation review & driver remediation console
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-main hover:bg-background rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Telemetry Snapshot Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background border border-border rounded-xl p-4">
              <div className="flex items-center text-xs font-bold text-text-secondary mb-1">
                <Gauge className="h-4 w-4 mr-1 text-primary" /> Vehicle Speed
              </div>
              <div className="text-2xl font-black font-mono text-text-main">
                {currentSpeed} <span className="text-xs font-normal text-text-secondary">km/h</span>
              </div>
              {event.eventType === 'OVER_SPEEDING' && speedDelta > 0 && (
                <div className="text-[11px] font-bold text-danger mt-1">
                  +{speedDelta} km/h over {speedLimit} limit
                </div>
              )}
            </div>

            <div className="bg-background border border-border rounded-xl p-4">
              <div className="flex items-center text-xs font-bold text-text-secondary mb-1">
                <MapPin className="h-4 w-4 mr-1 text-info" /> Corridor
              </div>
              <div className="text-sm font-bold text-text-main truncate" title={cab?.startLocationName ? `${cab.startLocationName} â†’ ${cab.destinationLocationName}` : 'Chennai Arterial'}>
                {cab?.startLocationName ? `${cab.startLocationName} â†’ ${cab.destinationLocationName}` : 'Chennai Roadway'}
              </div>
              <div className="text-[11px] font-mono text-text-secondary mt-1">
                {cab?.latitude != null ? cab.latitude.toFixed(4) : (event.startLatitude != null ? Number(event.startLatitude).toFixed(4) : '13.0827')}, {cab?.longitude != null ? cab.longitude.toFixed(4) : (event.startLongitude != null ? Number(event.startLongitude).toFixed(4) : '80.2707')}
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-4">
              <div className="flex items-center text-xs font-bold text-text-secondary mb-1">
                <Car className="h-4 w-4 mr-1 text-warning" /> Violation Status
              </div>
              <div className="text-sm font-bold mt-1">
                {isLive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                    Live Violation
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800">
                    Normalized
                  </span>
                )}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">
                {event.startTime ? new Date(event.startTime).toLocaleTimeString() : (event.createdAt ? new Date(event.createdAt).toLocaleTimeString() : 'â€”')}
              </div>
            </div>
          </div>

          {/* Vehicle & Driver Dossier */}
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary flex items-center">
              <User className="h-4 w-4 mr-1.5" /> Driver & Vehicle Dossier
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary text-xs">Driver:</span>
                <p className="font-bold text-text-main">
                  {driver ? `${driver.fullName} (${driver.driverId})` : event.driverId || 'Assigned Driver'}
                </p>
                <span className="text-text-secondary text-xs mt-1 block">Contact:</span>
                <p className="font-mono text-xs font-semibold text-text-main">
                  {driver?.phone || '+91 98401 23456'}
                </p>
              </div>
              <div>
                <span className="text-text-secondary text-xs">Vehicle:</span>
                <p className="font-bold text-text-main">
                  {event.cabId} â€” {cabMeta?.model || 'Sedan'} ({cabMeta?.registrationNumber || 'TN-01-AB-1234'})
                </p>
                <span className="text-text-secondary text-xs mt-1 block">Driver Safety Rating:</span>
                <p className="font-bold text-amber-700">
                  {demeritApplied ? '82 / 100 (-5 Demerit applied)' : '87 / 100 (Tier: Good)'}
                </p>
              </div>
            </div>
          </div>

          {/* Real Operator Remediation Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
              Dispatcher Response Actions
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* Action 1: In-Cab IoT Warning (Has real physical effect on the car!) */}
              <button
                onClick={handleSendInCabWarning}
                disabled={warningSent || !isLive}
                className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                  warningSent
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : isLive
                    ? 'bg-primary/5 hover:bg-primary/10 border-primary/30 text-text-main'
                    : 'bg-background border-border opacity-50 cursor-not-allowed text-text-secondary'
                }`}
              >
                <div className={`p-2 rounded-lg ${warningSent ? 'bg-green-200 text-green-800' : 'bg-primary/10 text-primary'}`}>
                  {warningSent ? <CheckCircle2 className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wide">
                    {warningSent ? 'Warning Broadcasted' : 'Send In-Cab Speed Alert'}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {warningSent
                      ? 'IoT MQTT command delivered. Vehicle decelerating to 50 km/h.'
                      : 'Pushes automated audio/dash alert to cab. Forces vehicle deceleration.'}
                  </p>
                </div>
              </button>

              {/* Action 2: Voice Dial Driver */}
              <button
                onClick={handleCallDriver}
                disabled={callingDriver}
                className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                  callingDriver
                    ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                    : 'bg-background hover:bg-surface border-border text-text-main'
                }`}
              >
                <div className={`p-2 rounded-lg ${callingDriver ? 'bg-amber-200 text-amber-800' : 'bg-surface border border-border text-text-main'}`}>
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wide">
                    {callingDriver ? `Connected (${callTimer}s)...` : 'Emergency Call Driver'}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {callingDriver
                      ? `Voice channel open with ${driver?.fullName || 'driver'} via console`
                      : 'Direct dispatch call via simulated driver communications gateway.'}
                  </p>
                </div>
              </button>

              {/* Action 3: Apply Safety Demerit */}
              <button
                onClick={handleApplyDemerit}
                disabled={demeritApplied}
                className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                  demeritApplied
                    ? 'bg-danger/10 border-danger/30 text-danger'
                    : 'bg-background hover:bg-surface border-border text-text-main'
                }`}
              >
                <div className="p-2 rounded-lg bg-surface border border-border text-danger">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wide">
                    {demeritApplied ? 'Demerit Applied' : 'Log Driver Demerit (-5 Pts)'}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {demeritApplied
                      ? '5 penalty points deducted from driver quarterly safety record.'
                      : 'Records administrative infraction on driver personnel file.'}
                  </p>
                </div>
              </button>

              {/* Action 4: Track On Live Map */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/monitoring');
                }}
                className="p-3.5 rounded-xl border border-border bg-background hover:bg-surface text-left flex items-start space-x-3 transition-all text-text-main"
              >
                <div className="p-2 rounded-lg bg-surface border border-border text-info">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wide">
                    Track On Live Map
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Jump to Live Monitoring view to follow this vehicle on the map.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Operator Audit Log Note */}
          <form onSubmit={handleSaveNotes} className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide block">
              Dispatcher Incident Audit Notes
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Driver confirmed slowing down; heavy traffic at Guindy"
                className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-lg text-text-main placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-text-main hover:bg-text-secondary text-white text-xs font-bold rounded-lg transition-colors"
              >
                {noteSaved ? 'Saved âœ“' : 'Add Note'}
              </button>
            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            {isLive ? 'ðŸ”´ Violation active in vehicle telemetry stream' : 'ðŸŸ¢ Sensor data normalized'}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
}
