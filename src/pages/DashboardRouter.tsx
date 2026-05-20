import { useAuth } from '@/contexts/AuthContext';
import DashboardPage from './DashboardPage';
import ClientDashboardPage from './ClientDashboardPage';

export default function DashboardRouter() {
  const { isClient } = useAuth();
  return isClient ? <ClientDashboardPage /> : <DashboardPage />;
}
