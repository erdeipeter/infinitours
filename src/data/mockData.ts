import { 
  User, Client, Vehicle, Driver, Line, Schedule, Stop, 
  ExtraTrip, GPSEvent, FuelBracket, Report, DashboardStats,
  DriverPerformance, VehicleAssignment
} from '@/types';

export const users: User[] = [
  { id: '1', name: 'Kiss András', email: 'kiss.andras@ontime.hu', role: 'Admin', avatar: '' },
  { id: '2', name: 'Nagy Mónika', email: 'nagy.monika@ontime.hu', role: 'Sportbusz Iroda', avatar: '' },
  { id: '3', name: 'Tóth Gábor', email: 'toth.gabor@ontime.hu', role: 'Flottamenedzser', avatar: '' },
  { id: '4', name: 'Kovács László', email: 'kovacs.laszlo@auchan.hu', role: 'Megrendelő', client_id: '2', avatar: '' },
  { id: '5', name: 'Szabó Péter', email: 'szabo.peter@shinheung.hu', role: 'Megrendelő', client_id: '1', avatar: '' },
];

export const clients: Client[] = [
  { id: '1', name: 'Shinheung SEC Kft.', primary_color: '#2563eb', subdomain: 'shinheung', logo_url: '', fuel_bracket_id: '1', documents_count: 12 },
  { id: '2', name: 'Auchan Logisztika', primary_color: '#dc2626', subdomain: 'auchan', logo_url: '', fuel_bracket_id: '2', documents_count: 8 },
  { id: '3', name: 'Dunakeszi Önkormányzat', primary_color: '#059669', subdomain: 'dunakeszi', logo_url: '', fuel_bracket_id: '1', documents_count: 15 },
  { id: '4', name: 'Samsung SDI Hungary', primary_color: '#1d4ed8', subdomain: 'samsung', logo_url: '', fuel_bracket_id: '3', documents_count: 20 },
  { id: '5', name: 'Hankook Tire Magyarország', primary_color: '#f97316', subdomain: 'hankook', logo_url: '', fuel_bracket_id: '2', documents_count: 6 },
];

export const vehicles: Vehicle[] = [
  { id: '1', plate: 'ABC-123', category: 'minibusz', seats: 19, status: 'aktív', year: 2021, start_km: 0, current_km: 45230, next_inspection: '2025-03-15', assigned_clients: ['1', '2'] },
  { id: '2', plate: 'XYZ-888', category: 'turista', seats: 49, status: 'tartalék', year: 2019, start_km: 120000, current_km: 189500, next_inspection: '2025-01-20', assigned_clients: ['3'] },
  { id: '3', plate: 'DEF-456', category: 'midibusz', seats: 29, status: 'aktív', year: 2022, start_km: 0, current_km: 28900, next_inspection: '2025-06-10', assigned_clients: ['1', '4'] },
  { id: '4', plate: 'GHI-789', category: 'mikro', seats: 8, status: 'aktív', year: 2023, start_km: 0, current_km: 15200, next_inspection: '2025-08-22', assigned_clients: ['2'] },
  { id: '5', plate: 'JKL-012', category: 'alacsonypadlós', seats: 39, status: 'inaktív', year: 2018, start_km: 200000, current_km: 312000, next_inspection: '2025-02-01', assigned_clients: ['5'] },
  { id: '6', plate: 'MNO-345', category: 'turista', seats: 55, status: 'aktív', year: 2020, start_km: 50000, current_km: 145000, next_inspection: '2025-04-18', assigned_clients: ['3', '4'] },
  { id: '7', plate: 'PQR-678', category: 'minibusz', seats: 19, status: 'aktív', year: 2022, start_km: 0, current_km: 32100, next_inspection: '2025-07-05', assigned_clients: ['1'] },
  { id: '8', plate: 'STU-901', category: 'midibusz', seats: 33, status: 'tartalék', year: 2020, start_km: 80000, current_km: 167800, next_inspection: '2025-05-12', assigned_clients: ['5', '2'] },
];

export const vehicleAssignments: VehicleAssignment[] = [
  { id: '1', vehicle_id: '1', client_id: '1', from: '2024-01-01', status: 'aktív' },
  { id: '2', vehicle_id: '1', client_id: '2', from: '2024-01-01', status: 'aktív' },
  { id: '3', vehicle_id: '2', client_id: '3', from: '2023-06-15', status: 'tartalék' },
  { id: '4', vehicle_id: '3', client_id: '1', from: '2024-02-01', status: 'aktív' },
  { id: '5', vehicle_id: '3', client_id: '4', from: '2024-03-01', status: 'aktív' },
];

export const drivers: Driver[] = [
  { id: '1', name: 'Gáz Géza', chip_id: 'DRV-001', phone: '+36 30 123 4567', accuracy_percent: 94 },
  { id: '2', name: 'Erős Pista', chip_id: 'DRV-002', phone: '+36 30 234 5678', accuracy_percent: 88 },
  { id: '3', name: 'Futó Ferenc', chip_id: 'DRV-003', phone: '+36 30 345 6789', accuracy_percent: 96 },
  { id: '4', name: 'Volán Vilmos', chip_id: 'DRV-004', phone: '+36 30 456 7890', accuracy_percent: 91 },
  { id: '5', name: 'Kerék Károly', chip_id: 'DRV-005', phone: '+36 30 567 8901', accuracy_percent: 85 },
  { id: '6', name: 'Motor Márton', chip_id: 'DRV-006', phone: '+36 30 678 9012', accuracy_percent: 92 },
];

export const stops: Stop[] = [
  { id: '1', name: 'Monor, Széchenyi utca', lat: 47.3528, lng: 19.4492 },
  { id: '2', name: 'Dunakeszi, Auchan', lat: 47.6369, lng: 19.1378 },
  { id: '3', name: 'Göd, Vasútállomás', lat: 47.6897, lng: 19.1344 },
  { id: '4', name: 'Budapest, Örs vezér tere', lat: 47.5057, lng: 19.1342 },
  { id: '5', name: 'Vecsés, Ferihegy', lat: 47.4322, lng: 19.2517 },
  { id: '6', name: 'Gyömrő, Autóbusz állomás', lat: 47.4283, lng: 19.3944 },
  { id: '7', name: 'Pécel, Vasútállomás', lat: 47.4917, lng: 19.3428 },
  { id: '8', name: 'Maglód, Községháza', lat: 47.4367, lng: 19.3472 },
  { id: '9', name: 'Ecser, Gyár főbejárat', lat: 47.4508, lng: 19.3072 },
  { id: '10', name: 'Üllő, Bevásárlóközpont', lat: 47.3867, lng: 19.3444 },
];

export const lines: Line[] = [
  { id: '1', client_id: '1', name: 'Shinheung Reggeli Műszak', type: 'fix', stops_count: 5, shifts_count: 3, valid_from: '2024-01-01', valid_to: '2024-12-31' },
  { id: '2', client_id: '1', name: 'Shinheung Délutáni Műszak', type: 'fix', stops_count: 5, shifts_count: 3, valid_from: '2024-01-01', valid_to: '2024-12-31' },
  { id: '3', client_id: '2', name: 'Auchan Dolgozói Járat', type: 'kör', stops_count: 8, shifts_count: 4, valid_from: '2024-01-01' },
  { id: '4', client_id: '3', name: 'Dunakeszi Iskolabusz A', type: 'fix', stops_count: 6, shifts_count: 2, valid_from: '2024-09-01', valid_to: '2025-06-15' },
  { id: '5', client_id: '3', name: 'Dunakeszi Iskolabusz B', type: 'kör', stops_count: 7, shifts_count: 2, valid_from: '2024-09-01', valid_to: '2025-06-15' },
  { id: '6', client_id: '4', name: 'Samsung Éjszakai Műszak', type: 'fix', stops_count: 4, shifts_count: 2, valid_from: '2024-03-01' },
];

export const schedules: Schedule[] = [
  { id: '1', line_id: '1', valid_from: '2024-01-01', valid_to: '2024-06-30', fuel_bracket_id: '1' },
  { id: '2', line_id: '1', valid_from: '2024-07-01', valid_to: '2024-12-31', fuel_bracket_id: '2' },
  { id: '3', line_id: '2', valid_from: '2024-01-01', fuel_bracket_id: '1' },
  { id: '4', line_id: '3', valid_from: '2024-01-01', fuel_bracket_id: '2' },
  { id: '5', line_id: '4', valid_from: '2024-09-01', valid_to: '2025-06-15', fuel_bracket_id: '1' },
];

export const extraTrips: ExtraTrip[] = [
  { id: '1', client_id: '1', client_name: 'Shinheung SEC Kft.', start_stop_id: '4', start_stop_name: 'Budapest, Örs vezér tere', end_stop_id: '9', end_stop_name: 'Ecser, Gyár főbejárat', start_time: '2024-12-15 08:00', end_time: '2024-12-15 09:30', passengers: 25, vehicle_category: 'midibusz', status: 'Új', is_return: false, notes: 'Gyárlátogatás' },
  { id: '2', client_id: '2', client_name: 'Auchan Logisztika', start_stop_id: '2', start_stop_name: 'Dunakeszi, Auchan', end_stop_id: '4', end_stop_name: 'Budapest, Örs vezér tere', start_time: '2024-12-16 07:00', passengers: 40, vehicle_category: 'turista', status: 'Véglegesítésre vár', is_return: true, assigned_vehicle_id: '6' },
  { id: '3', client_id: '3', client_name: 'Dunakeszi Önkormányzat', start_stop_id: '3', start_stop_name: 'Göd, Vasútállomás', end_stop_id: '2', end_stop_name: 'Dunakeszi, Auchan', start_time: '2024-12-14 10:00', passengers: 18, vehicle_category: 'minibusz', status: 'Véglegesítve', is_return: false, assigned_vehicle_id: '1', assigned_driver_id: '1' },
  { id: '4', client_id: '4', client_name: 'Samsung SDI Hungary', start_stop_id: '1', start_stop_name: 'Monor, Széchenyi utca', end_stop_id: '9', end_stop_name: 'Ecser, Gyár főbejárat', start_time: '2024-12-17 06:00', passengers: 30, vehicle_category: 'midibusz', status: 'Új', is_return: true },
];

export const gpsEvents: GPSEvent[] = [
  { id: '1', vehicle_id: '1', driver_id: '1', schedule_id: '1', stop_id: '1', stop_name: 'Monor, Széchenyi utca', timestamp: '2024-12-11 06:02', event_type: 'departure', planned_time: '06:00', difference_minutes: 2 },
  { id: '2', vehicle_id: '1', driver_id: '1', schedule_id: '1', stop_id: '6', stop_name: 'Gyömrő, Autóbusz állomás', timestamp: '2024-12-11 06:18', event_type: 'arrival', planned_time: '06:15', difference_minutes: 3 },
  { id: '3', vehicle_id: '1', driver_id: '1', schedule_id: '1', stop_id: '7', stop_name: 'Pécel, Vasútállomás', timestamp: '2024-12-11 06:28', event_type: 'arrival', planned_time: '06:30', difference_minutes: -2 },
  { id: '4', vehicle_id: '3', driver_id: '3', schedule_id: '3', stop_id: '4', stop_name: 'Budapest, Örs vezér tere', timestamp: '2024-12-11 14:05', event_type: 'departure', planned_time: '14:00', difference_minutes: 5 },
  { id: '5', vehicle_id: '3', driver_id: '3', schedule_id: '3', stop_id: '9', stop_name: 'Ecser, Gyár főbejárat', timestamp: '2024-12-11 14:42', event_type: 'arrival', planned_time: '14:45', difference_minutes: -3 },
];

export const fuelBrackets: FuelBracket[] = [
  { id: '1', month: '2024-12', price_from: 580, price_to: 620, revenue_value: 145 },
  { id: '2', month: '2024-11', price_from: 560, price_to: 600, revenue_value: 140 },
  { id: '3', month: '2024-10', price_from: 540, price_to: 580, revenue_value: 135 },
];

export const reports: Report[] = [
  { id: '1', type: 'külső', period: '2024-11', created_at: '2024-12-01 10:00', url: '/reports/external-2024-11.xlsx' },
  { id: '2', type: 'belső-1', period: '2024-11', created_at: '2024-12-02 09:30', url: '/reports/internal1-2024-11.xlsx' },
  { id: '3', type: 'belső-2', period: '2024-11', created_at: '2024-12-03 14:15', url: '/reports/internal2-2024-11.xlsx' },
  { id: '4', type: 'külső', period: '2024-10', created_at: '2024-11-01 11:00', url: '/reports/external-2024-10.xlsx' },
];

export const getDashboardStats = (role: string): DashboardStats => ({
  activeTripsToday: 24,
  vehicleStatuses: {
    active: 6,
    reserve: 2,
    inactive: 1,
  },
  fleetUtilization: 78,
  recentChanges: [
    { id: '1', type: 'schedule', description: 'Shinheung Reggeli Műszak menetrend módosítva', timestamp: '2024-12-11 09:30' },
    { id: '2', type: 'vehicle', description: 'JKL-012 státusz: inaktív', timestamp: '2024-12-11 08:15' },
    { id: '3', type: 'trip', description: 'Új eseti járat: Samsung SDI Hungary', timestamp: '2024-12-11 07:45' },
    { id: '4', type: 'driver', description: 'Új sofőr hozzáadva: Motor Márton', timestamp: '2024-12-10 16:20' },
  ],
  delays: [
    { id: '1', line: 'Auchan Dolgozói Járat', delay_minutes: 8, location: 'Göd, Vasútállomás' },
    { id: '2', line: 'Shinheung Reggeli Műszak', delay_minutes: 5, location: 'Pécel, Vasútállomás' },
  ],
  inspectionWarnings: [
    { vehicle_id: '2', plate: 'XYZ-888', due_date: '2025-01-20' },
    { vehicle_id: '5', plate: 'JKL-012', due_date: '2025-02-01' },
  ],
  newExtraRequests: 2,
  pendingFinalization: 1,
  upcomingTrips: [
    { id: '1', line: 'Shinheung Reggeli Műszak', time: '06:00', status: 'aktív' },
    { id: '2', line: 'Auchan Dolgozói Járat', time: '07:00', status: 'aktív' },
    { id: '3', line: 'Dunakeszi Iskolabusz A', time: '07:30', status: 'tervezett' },
  ],
});

export const getDriverPerformance = (driverId: string): DriverPerformance[] => [
  { stop_name: 'Monor, Széchenyi utca', planned_time: '06:00', arrival_time: '06:02', timing_status: 'late', score: 8 },
  { stop_name: 'Gyömrő, Autóbusz állomás', planned_time: '06:15', arrival_time: '06:14', timing_status: 'early', score: 10 },
  { stop_name: 'Pécel, Vasútállomás', planned_time: '06:30', arrival_time: '06:30', timing_status: 'ontime', score: 10 },
  { stop_name: 'Maglód, Községháza', planned_time: '06:45', arrival_time: '06:48', timing_status: 'late', score: 7 },
  { stop_name: 'Ecser, Gyár főbejárat', planned_time: '07:00', arrival_time: '06:58', timing_status: 'early', score: 10 },
];

export const currentUser = users[0]; // Admin by default
