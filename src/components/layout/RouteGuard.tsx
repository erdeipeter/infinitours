import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  internalOnly?: boolean;
}

// Routes accessible to Megrendelő users
const CLIENT_ALLOWED_ROUTES = [
  '/dashboard',
  '/trips/client',
  '/trips/eseti',
  '/reports/external',
  '/profile',
];

export function RouteGuard({ children, allowedRoles, internalOnly = false }: RouteGuardProps) {
  const { currentUser, isClient } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if internal-only route and user is client
    if (internalOnly && isClient) {
      toast.error('Ehhez a funkcióhoz nincs jogosultságod.');
      navigate('/dashboard');
      return;
    }

    // Check allowed roles if specified
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      toast.error('Ehhez a funkcióhoz nincs jogosultságod.');
      navigate('/dashboard');
      return;
    }
  }, [currentUser, isClient, internalOnly, allowedRoles, navigate]);

  if (!currentUser) {
    return null;
  }

  if (internalOnly && isClient) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return null;
  }

  return <>{children}</>;
}
