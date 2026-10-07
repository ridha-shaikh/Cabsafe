import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useSimulationStore } from './store/simulationStore';
import { SimulationState } from './types/enums';
import { simulationEngine } from './simulation/SimulationEngine';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FleetPage from './pages/FleetPage';
import DriversPage from './pages/DriversPage';
import DriverDetailPage from './pages/DriverDetailPage';
import PassengersPage from './pages/PassengersPage';
import BookingsPage from './pages/BookingsPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import SafetyEventsPage from './pages/SafetyEventsPage';
import SOSPage from './pages/SOSPage';
import AlertsPage from './pages/AlertsPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';
import DatabaseOverviewPage from './pages/DatabaseOverviewPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  useEffect(() => {
    if (isAuthenticated) {
      useSimulationStore.getState().setConfig({ state: SimulationState.RUNNING });
      simulationEngine.start();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/fleet" element={<FleetPage />} />
                  <Route path="/drivers" element={<DriversPage />} />
                  <Route path="/drivers/:id" element={<DriverDetailPage />} />
                  <Route path="/passengers" element={<PassengersPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/trips" element={<TripsPage />} />
                  <Route path="/trips/:id" element={<TripDetailPage />} />
                  <Route path="/monitoring" element={<LiveMonitoringPage />} />
                  <Route path="/safety-events" element={<SafetyEventsPage />} />
                  <Route path="/sos" element={<SOSPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/database" element={<DatabaseOverviewPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
