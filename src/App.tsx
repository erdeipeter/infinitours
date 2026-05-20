import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { RouteGuard } from "@/components/layout/RouteGuard";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import DriversPage from "./pages/DriversPage";
import TripsPage from "./pages/TripsPage";
import ClientTripsPage from "./pages/ClientTripsPage";
import ExtraTripsPage from "./pages/ExtraTripsPage";
import SchedulesPage from "./pages/SchedulesPage";
import CorrectionsPage from "./pages/CorrectionsPage";
import ExternalReportsPage from "./pages/ExternalReportsPage";
import InternalReportsPage from "./pages/InternalReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import DashboardRouter from "./pages/DashboardRouter";
import DispatcherPage from "./pages/DispatcherPage";
import SchedulerPage from "./pages/SchedulerPage";
import DriverMobilePage from "./pages/DriverMobilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/dashboard" element={<AppLayout><DashboardRouter /></AppLayout>} />

            {/* Új Infinitours oldalak */}
            <Route path="/dispatcher" element={<AppLayout><RouteGuard allowedRoles={['Rendszeradmin','Műszakvezető','Diszpécser']}><DispatcherPage /></RouteGuard></AppLayout>} />
            <Route path="/scheduler"  element={<AppLayout><RouteGuard allowedRoles={['Rendszeradmin','Műszakvezető']}><SchedulerPage /></RouteGuard></AppLayout>} />
            <Route path="/driver"     element={<AppLayout><RouteGuard allowedRoles={['Rendszeradmin','Sofőr']}><DriverMobilePage /></RouteGuard></AppLayout>} />

            {/* Megrendelő */}
            <Route path="/trips/client" element={<AppLayout><RouteGuard allowedRoles={['Megrendelő']}><ClientTripsPage /></RouteGuard></AppLayout>} />

            {/* Belső oldalak */}
            <Route path="/clients"     element={<AppLayout><RouteGuard internalOnly><ClientsPage /></RouteGuard></AppLayout>} />
            <Route path="/clients/:id" element={<AppLayout><RouteGuard internalOnly><ClientDetailPage /></RouteGuard></AppLayout>} />
            <Route path="/vehicles"    element={<AppLayout><RouteGuard internalOnly><VehiclesPage /></RouteGuard></AppLayout>} />
            <Route path="/vehicles/:id"element={<AppLayout><RouteGuard internalOnly><VehicleDetailPage /></RouteGuard></AppLayout>} />
            <Route path="/drivers"     element={<AppLayout><RouteGuard internalOnly><DriversPage /></RouteGuard></AppLayout>} />
            <Route path="/trips/fix"   element={<AppLayout><RouteGuard internalOnly><TripsPage type="fix" /></RouteGuard></AppLayout>} />
            <Route path="/trips/kor"   element={<AppLayout><RouteGuard internalOnly><TripsPage type="kör" /></RouteGuard></AppLayout>} />
            <Route path="/schedules"   element={<AppLayout><RouteGuard internalOnly><SchedulesPage /></RouteGuard></AppLayout>} />
            <Route path="/corrections" element={<AppLayout><RouteGuard internalOnly><CorrectionsPage /></RouteGuard></AppLayout>} />
            <Route path="/reports/internal-1" element={<AppLayout><RouteGuard internalOnly><InternalReportsPage variant={1} /></RouteGuard></AppLayout>} />
            <Route path="/reports/internal-2" element={<AppLayout><RouteGuard internalOnly><InternalReportsPage variant={2} /></RouteGuard></AppLayout>} />
            <Route path="/reports/internal-3" element={<AppLayout><RouteGuard internalOnly><InternalReportsPage variant={3} /></RouteGuard></AppLayout>} />
            <Route path="/settings"    element={<AppLayout><RouteGuard internalOnly><SettingsPage /></RouteGuard></AppLayout>} />

            {/* Mindenki */}
            <Route path="/trips/eseti"     element={<AppLayout><ExtraTripsPage /></AppLayout>} />
            <Route path="/reports/external"element={<AppLayout><ExternalReportsPage /></AppLayout>} />
            <Route path="/profile"         element={<AppLayout><ProfilePage /></AppLayout>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
