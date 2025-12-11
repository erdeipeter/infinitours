import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import DriversPage from "./pages/DriversPage";
import TripsPage from "./pages/TripsPage";
import ExtraTripsPage from "./pages/ExtraTripsPage";
import SchedulesPage from "./pages/SchedulesPage";
import CorrectionsPage from "./pages/CorrectionsPage";
import ExternalReportsPage from "./pages/ExternalReportsPage";
import InternalReportsPage from "./pages/InternalReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
          <Route path="/clients" element={<AppLayout><ClientsPage /></AppLayout>} />
          <Route path="/clients/:id" element={<AppLayout><ClientDetailPage /></AppLayout>} />
          <Route path="/vehicles" element={<AppLayout><VehiclesPage /></AppLayout>} />
          <Route path="/vehicles/:id" element={<AppLayout><VehicleDetailPage /></AppLayout>} />
          <Route path="/drivers" element={<AppLayout><DriversPage /></AppLayout>} />
          <Route path="/trips/fix" element={<AppLayout><TripsPage type="fix" /></AppLayout>} />
          <Route path="/trips/kor" element={<AppLayout><TripsPage type="kör" /></AppLayout>} />
          <Route path="/trips/eseti" element={<AppLayout><ExtraTripsPage /></AppLayout>} />
          <Route path="/schedules" element={<AppLayout><SchedulesPage /></AppLayout>} />
          <Route path="/corrections" element={<AppLayout><CorrectionsPage /></AppLayout>} />
          <Route path="/reports/external" element={<AppLayout><ExternalReportsPage /></AppLayout>} />
          <Route path="/reports/internal-1" element={<AppLayout><InternalReportsPage variant={1} /></AppLayout>} />
          <Route path="/reports/internal-2" element={<AppLayout><InternalReportsPage variant={2} /></AppLayout>} />
          <Route path="/reports/internal-3" element={<AppLayout><InternalReportsPage variant={3} /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
