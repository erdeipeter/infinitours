export type UserRole =
  | 'Rendszeradmin'
  | 'Műszakvezető'
  | 'Járattervező'
  | 'Diszpécser'
  | 'Riportnéző'
  | 'Sofőr'
  | 'Megrendelő';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  client_id?: string;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  primary_color: string;
  subdomain: string;
  logo_url?: string;
  fuel_bracket_id?: string;
  documents_count: number;
}

export type VehicleCategory =
  | 'mikro'
  | 'minibusz'
  | 'midibusz'
  | 'turista'
  | 'alacsonypadlós'
  | 'szerviz'
  | 'szemely';

export type VehicleStatus = 'aktív' | 'tartalék' | 'inaktív';

export interface Vehicle {
  id: string;
  plate: string;
  category: VehicleCategory;
  seats: number;
  status: VehicleStatus;
  year: number;
  start_km: number;
  current_km: number;
  next_inspection?: string;
  assigned_clients: string[];
  license_expiry?: string;
  efos_active?: boolean;
}

export interface VehicleAssignment {
  id: string;
  vehicle_id: string;
  client_id: string;
  from: string;
  to?: string;
  status: VehicleStatus;
}

export interface Driver {
  id: string;
  name: string;
  chip_id: string;
  phone: string;
  accuracy_percent: number;
  license_expiry?: string;
  efos_registered?: boolean;
  available?: boolean;
}

export type LineType = 'fix' | 'kör' | 'eseti';

export interface Line {
  id: string;
  client_id: string;
  name: string;
  type: LineType;
  stops_count: number;
  shifts_count: number;
  valid_from?: string;
  valid_to?: string;
}

export interface Schedule {
  id: string;
  line_id: string;
  valid_from: string;
  valid_to?: string;
  fuel_bracket_id?: string;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface ScheduleStop {
  schedule_id: string;
  stop_id: string;
  sequence: number;
  planned_time: string;
}

export type TripStatus =
  | 'Igény beérkezett'
  | 'Tervezés alatt'
  | 'Visszaigazolva'
  | 'Aktív'
  | 'Teljesített'
  | 'Elutasítva'
  | 'Lemondva';

export type ExtraTripStatus = 'Új' | 'Véglegesítésre vár' | 'Véglegesítve';

export interface ExtraTrip {
  id: string;
  client_id: string;
  client_name: string;
  start_stop_id: string;
  start_stop_name: string;
  end_stop_id: string;
  end_stop_name: string;
  start_time: string;
  end_time?: string;
  passengers: number;
  vehicle_category: VehicleCategory;
  status: TripStatus;
  is_return: boolean;
  notes?: string;
  assigned_vehicle_id?: string;
  assigned_driver_id?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  audit_log?: AuditLogEntry[];
  conflicts?: Conflict[];
}

export interface TripAssignment {
  trip_id: string;
  vehicle_id: string;
  driver_id: string;
}

export type EventType = 'arrival' | 'departure';

export interface GPSEvent {
  id: string;
  vehicle_id: string;
  driver_id: string;
  schedule_id: string;
  stop_id: string;
  stop_name: string;
  timestamp: string;
  event_type: EventType;
  planned_time: string;
  difference_minutes: number;
}

export interface FuelBracket {
  id: string;
  month: string;
  price_from: number;
  price_to: number;
  revenue_value: number;
}

export type ReportType = 'külső' | 'belső-1' | 'belső-2' | 'belső-3';

export interface Report {
  id: string;
  type: ReportType;
  period: string;
  created_at: string;
  url?: string;
}

export interface DashboardStats {
  activeTripsToday: number;
  vehicleStatuses: { active: number; reserve: number; inactive: number };
  fleetUtilization: number;
  recentChanges: { id: string; type: string; description: string; timestamp: string }[];
  delays: { id: string; line: string; delay_minutes: number; location: string }[];
  inspectionWarnings: { vehicle_id: string; plate: string; due_date: string }[];
  newExtraRequests: number;
  pendingFinalization: number;
  upcomingTrips: { id: string; line: string; time: string; status: string }[];
  conflictCount: number;
  pendingProposals: number;
}

export interface DriverPerformance {
  stop_name: string;
  planned_time: string;
  arrival_time: string;
  timing_status: 'early' | 'ontime' | 'late';
  score: number;
}

export type ConflictType =
  | 'sofor_parhuzamos'
  | 'sofor_aetr'
  | 'sofor_jogositvany'
  | 'sofor_efos'
  | 'jarmű_parhuzamos'
  | 'jarmű_kapacitas'
  | 'utvonal_elteres';

export type ConflictSeverity = 'blocker' | 'warning';

export interface Conflict {
  id: string;
  trip_id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affected_entity: string;
  detected_at: string;
  resolved?: boolean;
}

export type ProposalStatus = 'javaslat' | 'jóváhagyott' | 'módosított' | 'elutasított';

export interface SchedulerProposal {
  id: string;
  trip_id: string;
  trip_name: string;
  client_name: string;
  start_time: string;
  end_time: string;
  suggested_vehicle_id: string;
  suggested_driver_id: string;
  status: ProposalStatus;
  reason?: string;
  created_at: string;
  score: number;
}

export type AuditAction =
  | 'létrehozva'
  | 'státusz_változás'
  | 'jármű_hozzárendelve'
  | 'sofőr_hozzárendelve'
  | 'módosítva'
  | 'lemondva'
  | 'elutasítva';

export interface AuditLogEntry {
  id: string;
  trip_id: string;
  action: AuditAction;
  user_name: string;
  user_role: UserRole;
  timestamp: string;
  old_value?: string;
  new_value?: string;
  reason?: string;
}

export type DeviationReason =
  | 'forgalmi_akadaly'
  | 'baleset'
  | 'utasvaro'
  | 'muszaki_hiba'
  | 'egyeb';

export interface DeviationReport {
  id: string;
  trip_id: string;
  driver_id: string;
  reason: DeviationReason;
  description: string;
  reported_at: string;
  location?: string;
  estimated_delay_minutes?: number;
}
