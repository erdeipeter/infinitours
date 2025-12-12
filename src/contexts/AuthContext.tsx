import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { users, clients } from '@/data/mockData';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isClient: boolean;
  isInternalUser: boolean;
  clientId: string | undefined;
  clientName: string | undefined;
  login: (email: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isClient = currentUser?.role === 'Megrendelő';
  const isInternalUser = currentUser !== null && currentUser.role !== 'Megrendelő';
  const clientId = currentUser?.client_id;
  const clientName = clientId ? clients.find(c => c.id === clientId)?.name : undefined;

  const login = (email: string): boolean => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      isClient,
      isInternalUser,
      clientId,
      clientName,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
