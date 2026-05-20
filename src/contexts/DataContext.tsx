import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Vehicle, Driver, Line, Schedule, Stop } from '@/types';
import {
  vehicles as initialVehicles,
  drivers as initialDrivers,
  lines as initialLines,
  schedules as initialSchedules,
  stops as initialStops,
} from '@/data/mockData';

interface DataContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  lines: Line[];
  schedules: Schedule[];
  stops: Stop[];
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  addDriver: (d: Driver) => void;
  addLine: (l: Line) => void;
  addSchedule: (s: Schedule) => void;
  addStop: (s: Stop) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [stops, setStops] = useState<Stop[]>(initialStops);

  const addVehicle = useCallback((v: Vehicle) => setVehicles((prev) => [v, ...prev]), []);
  const updateVehicle = useCallback(
    (id: string, patch: Partial<Vehicle>) =>
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v))),
    []
  );
  const addDriver = useCallback((d: Driver) => setDrivers((prev) => [d, ...prev]), []);
  const addLine = useCallback((l: Line) => setLines((prev) => [l, ...prev]), []);
  const addSchedule = useCallback((s: Schedule) => setSchedules((prev) => [s, ...prev]), []);
  const addStop = useCallback((s: Stop) => setStops((prev) => [...prev, s]), []);

  return (
    <DataContext.Provider
      value={{
        vehicles,
        drivers,
        lines,
        schedules,
        stops,
        addVehicle,
        updateVehicle,
        addDriver,
        addLine,
        addSchedule,
        addStop,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
