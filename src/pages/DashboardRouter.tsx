import { useAuth } from '@/contexts/AuthContext';
import DashboardPage from './DashboardPage';
import ClientDashboardPage from './ClientDashboardPage';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function DashboardRouter() {
  const { currentUser, isClient } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  // Render appropriate dashboard based on role
  if (isClient) {
    return <ClientDashboardPage />;
  }

  return <DashboardPage />;
}
