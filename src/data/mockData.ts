import {
  User, Client, Vehicle, Driver, Line, Schedule, Stop,
  ExtraTrip, GPSEvent, FuelBracket, Report, DashboardStats,
  DriverPerformance, VehicleAssignment, Conflict, SchedulerProposal, AuditLogEntry,
} from '@/types';

// ── Felhasználók ────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: '1', name: 'Horváth Béla',   email: 'horvath.bela@infinitours.hu',   role: 'Rendszeradmin' },
  { id: '2', name: 'Németh Katalin', email: 'nemeth.katalin@infinitours.hu', role: 'Műszakvezető' },
  { id: '3', name: 'Szabó Ádám',     email: 'szabo.adam@infinitours.hu',     role: 'Járattervező' },
  { id: '4', name: 'Varga Eszter',   email: 'varga.eszter@infinitours.hu',   role: 'Diszpécser' },
  { id: '5', name: 'Kiss Norbert',   email: 'kiss.norbert@infinitours.hu',   role: 'Riportnéző' },
  { id: '6', name: 'Gáz Géza',       email: 'gaz.geza@infinitours.hu',       role: 'Sofőr' },
  { id: '7', name: 'Kovács László',  email: 'kovacs.laszlo@fridakomp.hu',    role: 'Megrendelő', client_id: '2' },
];

// currentUser helper (admin alapból)
export const currentUser = users[0];

// ── Ügyfelek ────────────────────────────────────────────────────────────────
export const clients: Client[] = [
  { id: '1', name: 'Infinitours Kft.',        primary_color: '#1a3a6b', subdomain: 'infinitours', documents_count: 18 },
  { id: '2', name: 'Frida Komponens Kft.',    primary_color: '#2563eb', subdomain: 'frida',       documents_count: 7  },
  { id: '3', name: 'Esztergomi Gyár Zrt.',    primary_color: '#059669', subdomain: 'esztergom',   documents_count: 12 },
  { id: '4', name: 'Dunavársányi Üzem Kft.',  primary_color: '#dc2626', subdomain: 'dunavarsan',  documents_count: 9  },
  { id: '5', name: 'Győri Logisztika Zrt.',   primary_color: '#f97316', subdomain: 'gyor',        documents_count: 5  },
];

// ── Járművek ────────────────────────────────────────────────────────────────
export const vehicles: Vehicle[] = [
  { id: '1', plate: 'ESZ-001', category: 'midibusz',     seats: 29, status: 'aktív',   year: 2022, start_km: 0,      current_km: 38200, next_inspection: '2026-08-10', assigned_clients: ['3'],     license_expiry: '2027-03-01', efos_active: true  },
  { id: '2', plate: 'ESZ-002', category: 'minibusz',     seats: 19, status: 'aktív',   year: 2023, start_km: 0,      current_km: 21400, next_inspection: '2026-11-20', assigned_clients: ['3', '4'], license_expiry: '2027-06-15', efos_active: true  },
  { id: '3', plate: 'DVN-101', category: 'turista',      seats: 49, status: 'aktív',   year: 2021, start_km: 80000,  current_km: 155300,next_inspection: '2026-07-05', assigned_clients: ['4'],     license_expiry: '2026-09-30', efos_active: true  },
  { id: '4', plate: 'DVN-102', category: 'midibusz',     seats: 33, status: 'tartalék',year: 2019, start_km: 120000, current_km: 221800,next_inspection: '2026-06-01', assigned_clients: ['4', '5'], license_expiry: '2027-01-10', efos_active: false },
  { id: '5', plate: 'GYR-201', category: 'turista',      seats: 55, status: 'aktív',   year: 2020, start_km: 60000,  current_km: 188000,next_inspection: '2026-09-15', assigned_clients: ['5'],     license_expiry: '2027-04-22', efos_active: true  },
  { id: '6', plate: 'GYR-202', category: 'minibusz',     seats: 22, status: 'aktív',   year: 2023, start_km: 0,      current_km: 14900, next_inspection: '2026-12-01', assigned_clients: ['5'],     license_expiry: '2027-08-01', efos_active: true  },
  { id: '7', plate: 'ESZ-003', category: 'mikro',        seats: 8,  status: 'inaktív', year: 2018, start_km: 200000, current_km: 318000,next_inspection: '2026-05-25', assigned_clients: [],        license_expiry: '2026-05-01', efos_active: false },
  { id: '8', plate: 'DVN-103', category: 'alacsonypadlós',seats: 39,status: 'aktív',   year: 2022, start_km: 0,      current_km: 44100, next_inspection: '2026-10-18', assigned_clients: ['3', '4'], license_expiry: '2027-02-28', efos_active: true  },
];

export const vehicleAssignments: VehicleAssignment[] = [
  { id: '1', vehicle_id: '1', client_id: '3', from: '2024-01-01', status: 'aktív' },
  { id: '2', vehicle_id: '2', client_id: '3', from: '2024-01-01', status: 'aktív' },
  { id: '3', vehicle_id: '3', client_id: '4', from: '2023-06-01', status: 'aktív' },
  { id: '4', vehicle_id: '5', client_id: '5', from: '2024-03-01', status: 'aktív' },
];

// ── Sofőrök ─────────────────────────────────────────────────────────────────
export const drivers: Driver[] = [
  { id: '1', name: 'Gáz Géza',       chip_id: 'DRV-001', phone: '+36 30 123 4567', accuracy_percent: 94, license_expiry: '2027-05-01', efos_registered: true,  available: true  },
  { id: '2', name: 'Erős Pista',     chip_id: 'DRV-002', phone: '+36 30 234 5678', accuracy_percent: 88, license_expiry: '2026-06-15', efos_registered: true,  available: false },
  { id: '3', name: 'Futó Ferenc',    chip_id: 'DRV-003', phone: '+36 30 345 6789', accuracy_percent: 96, license_expiry: '2027-09-20', efos_registered: true,  available: true  },
  { id: '4', name: 'Volán Vilmos',   chip_id: 'DRV-004', phone: '+36 30 456 7890', accuracy_percent: 91, license_expiry: '2027-02-10', efos_registered: false, available: true  },
  { id: '5', name: 'Kerék Károly',   chip_id: 'DRV-005', phone: '+36 30 567 8901', accuracy_percent: 85, license_expiry: '2026-05-30', efos_registered: true,  available: false },
  { id: '6', name: 'Motor Márton',   chip_id: 'DRV-006', phone: '+36 30 678 9012', accuracy_percent: 92, license_expiry: '2027-07-14', efos_registered: true,  available: true  },
];

// ── Megállók ────────────────────────────────────────────────────────────────
export const stops: Stop[] = [
  { id: '1', name: 'Esztergom, Gyárkapu',         lat: 47.7941, lng: 18.7419 },
  { id: '2', name: 'Esztergom, Vasútállomás',      lat: 47.7814, lng: 18.7378 },
  { id: '3', name: 'Dunavársány, Üzemi bejárat',  lat: 47.2497, lng: 19.0153 },
  { id: '4', name: 'Dunavársány, Főtér',           lat: 47.2511, lng: 19.0121 },
  { id: '5', name: 'Győr, Logisztikai Park',       lat: 47.6875, lng: 17.6504 },
  { id: '6', name: 'Győr, Vasútállomás',           lat: 47.6834, lng: 17.6369 },
  { id: '7', name: 'Budapest, Keleti pályaudvar',  lat: 47.5001, lng: 19.0839 },
  { id: '8', name: 'Budapest, Kelenföld',          lat: 47.4639, lng: 18.9981 },
  { id: '9', name: 'Esztergom, Városháza',         lat: 47.7943, lng: 18.7382 },
  { id: '10', name: 'Dunavársány, Iskola',         lat: 47.2488, lng: 19.0137 },
];

// ── Vonalak ─────────────────────────────────────────────────────────────────
export const lines: Line[] = [
  { id: '1', client_id: '3', name: 'Esztergom Reggeli Műszak',   type: 'fix', stops_count: 4, shifts_count: 3, valid_from: '2026-01-01', valid_to: '2026-12-31' },
  { id: '2', client_id: '3', name: 'Esztergom Délutáni Műszak',  type: 'fix', stops_count: 4, shifts_count: 3, valid_from: '2026-01-01', valid_to: '2026-12-31' },
  { id: '3', client_id: '4', name: 'Dunavársány Dolgozói Járat', type: 'kör', stops_count: 5, shifts_count: 2, valid_from: '2026-01-01' },
  { id: '4', client_id: '5', name: 'Győr Logisztikai Busz',      type: 'fix', stops_count: 3, shifts_count: 2, valid_from: '2026-03-01' },
  { id: '5', client_id: '3', name: 'Esztergom Éjszakai Műszak', type: 'fix', stops_count: 4, shifts_count: 2, valid_from: '2026-01-01', valid_to: '2026-12-31' },
];

export const schedules: Schedule[] = [
  { id: '1', line_id: '1', valid_from: '2026-01-01', valid_to: '2026-06-30', fuel_bracket_id: '1' },
  { id: '2', line_id: '1', valid_from: '2026-07-01', valid_to: '2026-12-31', fuel_bracket_id: '2' },
  { id: '3', line_id: '2', valid_from: '2026-01-01', fuel_bracket_id: '1' },
  { id: '4', line_id: '3', valid_from: '2026-01-01', fuel_bracket_id: '2' },
  { id: '5', line_id: '4', valid_from: '2026-03-01', fuel_bracket_id: '1' },
];

// ── Audit log bejegyzések ───────────────────────────────────────────────────
export const auditLogs: AuditLogEntry[] = [
  { id: 'a1', trip_id: '1', action: 'létrehozva',        user_name: 'Szabó Ádám',     user_role: 'Járattervező', timestamp: '2026-05-14 09:10' },
  { id: 'a2', trip_id: '1', action: 'státusz_változás',  user_name: 'Németh Katalin', user_role: 'Műszakvezető', timestamp: '2026-05-14 10:30', old_value: 'Igény beérkezett', new_value: 'Tervezés alatt' },
  { id: 'a3', trip_id: '1', action: 'jármű_hozzárendelve', user_name: 'Németh Katalin', user_role: 'Műszakvezető', timestamp: '2026-05-14 11:00', new_value: 'ESZ-001' },
  { id: 'a4', trip_id: '1', action: 'sofőr_hozzárendelve', user_name: 'Németh Katalin', user_role: 'Műszakvezető', timestamp: '2026-05-14 11:05', new_value: 'Gáz Géza' },
  { id: 'a5', trip_id: '1', action: 'státusz_változás',  user_name: 'Varga Eszter',   user_role: 'Diszpécser',   timestamp: '2026-05-14 14:00', old_value: 'Tervezés alatt', new_value: 'Visszaigazolva' },
  { id: 'a6', trip_id: '2', action: 'létrehozva',        user_name: 'Szabó Ádám',     user_role: 'Járattervező', timestamp: '2026-05-15 08:00' },
  { id: 'a7', trip_id: '2', action: 'státusz_változás',  user_name: 'Varga Eszter',   user_role: 'Diszpécser',   timestamp: '2026-05-15 09:00', old_value: 'Igény beérkezett', new_value: 'Tervezés alatt' },
  { id: 'a8', trip_id: '3', action: 'létrehozva',        user_name: 'Kovács László',  user_role: 'Megrendelő',   timestamp: '2026-05-16 07:30' },
  { id: 'a9', trip_id: '4', action: 'létrehozva',        user_name: 'Szabó Ádám',     user_role: 'Járattervező', timestamp: '2026-05-17 10:00' },
  { id: 'a10',trip_id: '4', action: 'státusz_változás',  user_name: 'Varga Eszter',   user_role: 'Diszpécser',   timestamp: '2026-05-17 11:00', old_value: 'Igény beérkezett', new_value: 'Tervezés alatt' },
  { id: 'a11',trip_id: '4', action: 'jármű_hozzárendelve', user_name: 'Németh Katalin', user_role: 'Műszakvezető', timestamp: '2026-05-17 12:00', new_value: 'DVN-101' },
  { id: 'a12',trip_id: '4', action: 'módosítva',         user_name: 'Szabó Ádám',     user_role: 'Járattervező', timestamp: '2026-05-18 09:00', reason: 'Ügyfél kérésére 30 perccel előrehozva', old_value: '2026-05-22 07:00', new_value: '2026-05-22 06:30' },
  { id: 'a13',trip_id: '4', action: 'státusz_változás',  user_name: 'Németh Katalin', user_role: 'Műszakvezető', timestamp: '2026-05-18 10:00', old_value: 'Tervezés alatt', new_value: 'Visszaigazolva' },
  { id: 'a14',trip_id: '5', action: 'létrehozva',        user_name: 'Szabó Ádám',     user_role: 'Járattervező', timestamp: '2026-05-10 08:00' },
  { id: 'a15',trip_id: '5', action: 'státusz_változás',  user_name: 'Németh Katalin', user_role: 'Műszakvezető', timestamp: '2026-05-10 09:00', old_value: 'Igény beérkezett', new_value: 'Visszaigazolva' },
  { id: 'a16',trip_id: '5', action: 'státusz_változás',  user_name: 'Varga Eszter',   user_role: 'Diszpécser',   timestamp: '2026-05-18 06:05', old_value: 'Visszaigazolva', new_value: 'Aktív' },
  { id: 'a17',trip_id: '5', action: 'státusz_változás',  user_name: 'Varga Eszter',   user_role: 'Diszpécser',   timestamp: '2026-05-18 09:15', old_value: 'Aktív', new_value: 'Teljesített' },
  { id: 'a18',trip_id: '6', action: 'létrehozva',        user_name: 'Szabó Ádám',     user_role: 'Járattervező', timestamp: '2026-05-12 10:00' },
  { id: 'a19',trip_id: '6', action: 'elutasítva',        user_name: 'Németh Katalin', user_role: 'Műszakvezető', timestamp: '2026-05-12 11:00', reason: 'Nincs szabad jármű az adott időpontra' },
];

// ── Ütközések ───────────────────────────────────────────────────────────────
export const conflicts: Conflict[] = [
  { id: 'c1', trip_id: '2', type: 'sofor_parhuzamos',  severity: 'blocker', description: 'Gáz Géza sofőr ugyanebben az időpontban már egy másik járaton van beosztva.',  affected_entity: 'Gáz Géza',   detected_at: '2026-05-20 08:15', resolved: false },
  { id: 'c2', trip_id: '2', type: 'sofor_aetr',        severity: 'warning', description: 'Erős Pista az előző 24 órában 9 órát vezetett, AETR pihenőidő nem telt el.',    affected_entity: 'Erős Pista', detected_at: '2026-05-20 08:15', resolved: false },
  { id: 'c3', trip_id: '3', type: 'sofor_efos',        severity: 'blocker', description: 'Volán Vilmosnak nincs aktív E-FOS bejelentése a következő járathoz.',            affected_entity: 'Volán Vilmos', detected_at: '2026-05-20 09:00', resolved: false },
  { id: 'c4', trip_id: '3', type: 'jarmű_parhuzamos', severity: 'blocker', description: 'DVN-101 rendszámú jármű ugyanebben az időpontban másik járathoz van rendelve.',   affected_entity: 'DVN-101',    detected_at: '2026-05-20 09:00', resolved: false },
  { id: 'c5', trip_id: '7', type: 'sofor_jogositvany', severity: 'blocker', description: 'Kerék Károly jogosítványa 2026-05-30-án lejár, ez a járat utána esik.',          affected_entity: 'Kerék Károly', detected_at: '2026-05-20 10:30', resolved: false },
  { id: 'c6', trip_id: '7', type: 'utvonal_elteres',  severity: 'warning', description: 'Az előző hasonló járatnál a GPS nyomvonal 4.2 km-rel tért el a tervezett útvonaltól.', affected_entity: 'DVN-103', detected_at: '2026-05-20 10:30', resolved: false },
];

// ── Ütemezőmotor javaslatok ─────────────────────────────────────────────────
export const schedulerProposals: SchedulerProposal[] = [
  { id: 'p1', trip_id: '2', trip_name: 'Dunavársány Reggeli Műszak – 2026.05.21', client_name: 'Dunavársányi Üzem Kft.', start_time: '2026-05-21 05:30', end_time: '2026-05-21 07:00', suggested_vehicle_id: '4', suggested_driver_id: '3', status: 'javaslat',     created_at: '2026-05-20 06:00', score: 87 },
  { id: 'p2', trip_id: '3', trip_name: 'Győr Logisztikai Busz – 2026.05.21',      client_name: 'Győri Logisztika Zrt.',   start_time: '2026-05-21 06:00', end_time: '2026-05-21 07:30', suggested_vehicle_id: '5', suggested_driver_id: '6', status: 'javaslat',     created_at: '2026-05-20 06:00', score: 92 },
  { id: 'p3', trip_id: '1', trip_name: 'Esztergom Reggeli Műszak – 2026.05.21',   client_name: 'Esztergomi Gyár Zrt.',    start_time: '2026-05-21 05:45', end_time: '2026-05-21 06:45', suggested_vehicle_id: '1', suggested_driver_id: '1', status: 'jóváhagyott',  created_at: '2026-05-20 06:00', score: 95 },
  { id: 'p4', trip_id: '4', trip_name: 'Esztergom Délutáni Műszak – 2026.05.21',  client_name: 'Esztergomi Gyár Zrt.',    start_time: '2026-05-21 14:00', end_time: '2026-05-21 15:00', suggested_vehicle_id: '2', suggested_driver_id: '3', status: 'jóváhagyott',  created_at: '2026-05-20 06:00', score: 91 },
  { id: 'p5', trip_id: '7', trip_name: 'Dunavársány Délutáni Műszak – 2026.05.21',client_name: 'Dunavársányi Üzem Kft.', start_time: '2026-05-21 14:30', end_time: '2026-05-21 16:00', suggested_vehicle_id: '8', suggested_driver_id: '4', status: 'elutasított', created_at: '2026-05-20 06:00', score: 61, reason: 'Kerék Károly AETR-korlát miatt nem jöhet szóba, kérem másik sofőrt rendeljen.' },
  { id: 'p6', trip_id: '5', trip_name: 'Győr Éjszakai Logisztika – 2026.05.21',   client_name: 'Győri Logisztika Zrt.',   start_time: '2026-05-21 22:00', end_time: '2026-05-22 00:30', suggested_vehicle_id: '5', suggested_driver_id: '6', status: 'módosított',  created_at: '2026-05-20 06:00', score: 78 },
];

// ── Eseti / Visszatérő járatok (7 státuszos) ────────────────────────────────
export const extraTrips: ExtraTrip[] = [
  {
    id: '1',
    client_id: '3', client_name: 'Esztergomi Gyár Zrt.',
    start_stop_id: '2', start_stop_name: 'Esztergom, Vasútállomás',
    end_stop_id: '1',   end_stop_name:   'Esztergom, Gyárkapu',
    start_time: '2026-05-21 05:45', end_time: '2026-05-21 06:45',
    passengers: 22, vehicle_category: 'midibusz', status: 'Visszaigazolva',
    is_return: false, assigned_vehicle_id: '1', assigned_driver_id: '1',
    is_recurring: true, recurrence_pattern: 'Minden munkanapon 05:45',
    audit_log: auditLogs.filter(a => a.trip_id === '1'),
    conflicts: [],
  },
  {
    id: '2',
    client_id: '4', client_name: 'Dunavársányi Üzem Kft.',
    start_stop_id: '4', start_stop_name: 'Dunavársány, Főtér',
    end_stop_id: '3',   end_stop_name:   'Dunavársány, Üzemi bejárat',
    start_time: '2026-05-21 05:30', end_time: '2026-05-21 07:00',
    passengers: 31, vehicle_category: 'midibusz', status: 'Tervezés alatt',
    is_return: false,
    is_recurring: false,
    notes: 'Rendkívüli reggeli műszak, dupla létszám miatt midibusz szükséges.',
    audit_log: auditLogs.filter(a => a.trip_id === '2'),
    conflicts: conflicts.filter(c => c.trip_id === '2'),
  },
  {
    id: '3',
    client_id: '5', client_name: 'Győri Logisztika Zrt.',
    start_stop_id: '6', start_stop_name: 'Győr, Vasútállomás',
    end_stop_id: '5',   end_stop_name:   'Győr, Logisztikai Park',
    start_time: '2026-05-21 06:00', end_time: '2026-05-21 07:30',
    passengers: 44, vehicle_category: 'turista', status: 'Igény beérkezett',
    is_return: true,
    notes: 'Oda-vissza, visszaút 15:30.',
    audit_log: auditLogs.filter(a => a.trip_id === '3'),
    conflicts: conflicts.filter(c => c.trip_id === '3'),
  },
  {
    id: '4',
    client_id: '3', client_name: 'Esztergomi Gyár Zrt.',
    start_stop_id: '9', start_stop_name: 'Esztergom, Városháza',
    end_stop_id: '1',   end_stop_name:   'Esztergom, Gyárkapu',
    start_time: '2026-05-22 06:30', end_time: '2026-05-22 07:00',
    passengers: 18, vehicle_category: 'minibusz', status: 'Visszaigazolva',
    is_return: false, assigned_vehicle_id: '2', assigned_driver_id: '3',
    is_recurring: false,
    notes: 'Ügyfél kérésére 30 perccel előrehozva (eredeti: 07:00).',
    audit_log: auditLogs.filter(a => a.trip_id === '4'),
    conflicts: [],
  },
  {
    id: '5',
    client_id: '4', client_name: 'Dunavársányi Üzem Kft.',
    start_stop_id: '3', start_stop_name: 'Dunavársány, Üzemi bejárat',
    end_stop_id: '10',  end_stop_name:   'Dunavársány, Iskola',
    start_time: '2026-05-18 06:00', end_time: '2026-05-18 09:15',
    passengers: 28, vehicle_category: 'midibusz', status: 'Teljesített',
    is_return: false, assigned_vehicle_id: '8', assigned_driver_id: '6',
    audit_log: auditLogs.filter(a => a.trip_id === '5'),
    conflicts: [],
  },
  {
    id: '6',
    client_id: '5', client_name: 'Győri Logisztika Zrt.',
    start_stop_id: '5', start_stop_name: 'Győr, Logisztikai Park',
    end_stop_id: '7',   end_stop_name:   'Budapest, Keleti pályaudvar',
    start_time: '2026-05-19 08:00',
    passengers: 50, vehicle_category: 'turista', status: 'Elutasítva',
    is_return: false,
    notes: 'Nincs szabad jármű az adott időpontra.',
    audit_log: auditLogs.filter(a => a.trip_id === '6'),
    conflicts: [],
  },
  {
    id: '7',
    client_id: '4', client_name: 'Dunavársányi Üzem Kft.',
    start_stop_id: '4', start_stop_name: 'Dunavársány, Főtér',
    end_stop_id: '3',   end_stop_name:   'Dunavársány, Üzemi bejárat',
    start_time: '2026-05-21 14:30', end_time: '2026-05-21 16:00',
    passengers: 35, vehicle_category: 'alacsonypadlós', status: 'Tervezés alatt',
    is_return: false, assigned_vehicle_id: '8',
    audit_log: [],
    conflicts: conflicts.filter(c => c.trip_id === '7'),
  },
  {
    id: '8',
    client_id: '2', client_name: 'Frida Komponens Kft.',
    start_stop_id: '7', start_stop_name: 'Budapest, Keleti pályaudvar',
    end_stop_id: '8',   end_stop_name:   'Budapest, Kelenföld',
    start_time: '2026-05-25 09:00',
    passengers: 8, vehicle_category: 'mikro', status: 'Igény beérkezett',
    is_return: true, notes: 'Tárgyalásra szállítás, VIP utasok.',
    audit_log: [],
    conflicts: [],
  },
];

// ── GPS Események ───────────────────────────────────────────────────────────
export const gpsEvents: GPSEvent[] = [
  { id: '1', vehicle_id: '1', driver_id: '1', schedule_id: '1', stop_id: '2', stop_name: 'Esztergom, Vasútállomás',   timestamp: '2026-05-20 05:47', event_type: 'departure', planned_time: '05:45', difference_minutes: 2  },
  { id: '2', vehicle_id: '1', driver_id: '1', schedule_id: '1', stop_id: '9', stop_name: 'Esztergom, Városháza',      timestamp: '2026-05-20 05:55', event_type: 'arrival',   planned_time: '05:53', difference_minutes: 2  },
  { id: '3', vehicle_id: '1', driver_id: '1', schedule_id: '1', stop_id: '1', stop_name: 'Esztergom, Gyárkapu',       timestamp: '2026-05-20 06:43', event_type: 'arrival',   planned_time: '06:45', difference_minutes: -2 },
  { id: '4', vehicle_id: '5', driver_id: '6', schedule_id: '4', stop_id: '6', stop_name: 'Győr, Vasútállomás',        timestamp: '2026-05-20 06:04', event_type: 'departure', planned_time: '06:00', difference_minutes: 4  },
  { id: '5', vehicle_id: '5', driver_id: '6', schedule_id: '4', stop_id: '5', stop_name: 'Győr, Logisztikai Park',    timestamp: '2026-05-20 07:28', event_type: 'arrival',   planned_time: '07:30', difference_minutes: -2 },
];

export const fuelBrackets: FuelBracket[] = [
  { id: '1', month: '2026-05', price_from: 590, price_to: 630, revenue_value: 148 },
  { id: '2', month: '2026-04', price_from: 575, price_to: 615, revenue_value: 143 },
  { id: '3', month: '2026-03', price_from: 560, price_to: 600, revenue_value: 140 },
];

export const reports: Report[] = [
  { id: '1', type: 'külső',   period: '2026-04', created_at: '2026-05-01 10:00', url: '/reports/external-2026-04.xlsx' },
  { id: '2', type: 'belső-1', period: '2026-04', created_at: '2026-05-02 09:30', url: '/reports/internal1-2026-04.xlsx' },
  { id: '3', type: 'belső-2', period: '2026-04', created_at: '2026-05-03 14:15', url: '/reports/internal2-2026-04.xlsx' },
  { id: '4', type: 'külső',   period: '2026-03', created_at: '2026-04-01 11:00', url: '/reports/external-2026-03.xlsx' },
  { id: '5', type: 'belső-3', period: '2026-04', created_at: '2026-05-04 16:00', url: '/reports/internal3-2026-04.xlsx' },
];

// ── Dashboard statisztikák ──────────────────────────────────────────────────
export const getDashboardStats = (_role: string): DashboardStats => ({
  activeTripsToday: 18,
  vehicleStatuses: { active: 6, reserve: 1, inactive: 1 },
  fleetUtilization: 82,
  recentChanges: [
    { id: '1', type: 'trip',    description: 'Esztergom Reggeli Műszak visszaigazolva',         timestamp: '2026-05-20 11:05' },
    { id: '2', type: 'conflict',description: '2 új ütközés észlelve – Dunavársány 05:30',       timestamp: '2026-05-20 08:15' },
    { id: '3', type: 'schedule',description: 'Ütemezőmotor 6 javaslatot generált holnapra',     timestamp: '2026-05-20 06:00' },
    { id: '4', type: 'vehicle', description: 'DVN-101 jármű hozzárendelve: Dunavársányi Üzem', timestamp: '2026-05-19 16:30' },
    { id: '5', type: 'trip',    description: 'Győri Logisztika igény beérkezett',               timestamp: '2026-05-19 14:00' },
  ],
  delays: [
    { id: '1', line: 'Esztergom Reggeli Műszak',   delay_minutes: 2, location: 'Esztergom, Vasútállomás' },
    { id: '2', line: 'Győr Logisztikai Busz',       delay_minutes: 4, location: 'Győr, Vasútállomás'     },
  ],
  inspectionWarnings: [
    { vehicle_id: '7', plate: 'ESZ-003', due_date: '2026-05-25' },
    { vehicle_id: '3', plate: 'DVN-101', due_date: '2026-07-05' },
  ],
  newExtraRequests: 2,
  pendingFinalization: 3,
  upcomingTrips: [
    { id: '1', line: 'Esztergom Reggeli Műszak',    time: '05:45', status: 'Visszaigazolva' },
    { id: '2', line: 'Dunavársány Reggeli Műszak',  time: '05:30', status: 'Tervezés alatt' },
    { id: '3', line: 'Győr Logisztikai Busz',       time: '06:00', status: 'Igény beérkezett' },
    { id: '4', line: 'Esztergom Délutáni Műszak',   time: '14:00', status: 'Visszaigazolva' },
    { id: '5', line: 'Dunavársány Délutáni Műszak', time: '14:30', status: 'Tervezés alatt' },
  ],
  conflictCount: conflicts.filter(c => !c.resolved).length,
  pendingProposals: schedulerProposals.filter(p => p.status === 'javaslat').length,
});

export const getDriverPerformance = (_driverId: string): DriverPerformance[] => [
  { stop_name: 'Esztergom, Vasútállomás', planned_time: '05:45', arrival_time: '05:47', timing_status: 'late',   score: 92 },
  { stop_name: 'Esztergom, Városháza',    planned_time: '05:53', arrival_time: '05:55', timing_status: 'late',   score: 90 },
  { stop_name: 'Esztergom, Gyárkapu',     planned_time: '06:45', arrival_time: '06:43', timing_status: 'early',  score: 95 },
];
