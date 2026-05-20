import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { extraTrips, vehicles, drivers } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  Smartphone, MapPin, Clock, Bus, Users, ChevronRight,
  AlertTriangle, CheckCircle2, Navigation, Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const DEVIATION_REASONS = [
  { value: 'forgalmi_akadaly', label: 'Forgalmi akadály / torlódás' },
  { value: 'baleset',          label: 'Baleset a tervezett útvonalon' },
  { value: 'utasvaro',        label: 'Utasvárás (késő utas)' },
  { value: 'muszaki_hiba',    label: 'Műszaki hiba' },
  { value: 'egyeb',           label: 'Egyéb ok' },
];

// Mock GPS útvonal pontok (Esztergom körzetéhez)
const MOCK_ROUTE_STOPS = [
  { name: 'Esztergom, Vasútállomás', time: '05:45', status: 'done',    lat: 47.7814, lng: 18.7378 },
  { name: 'Esztergom, Városháza',    time: '05:53', status: 'done',    lat: 47.7943, lng: 18.7382 },
  { name: 'Esztergom, Piac tér',     time: '05:58', status: 'current', lat: 47.7930, lng: 18.7410 },
  { name: 'Esztergom, Gyárkapu',     time: '06:45', status: 'upcoming',lat: 47.7941, lng: 18.7419 },
];

function RouteMap() {
  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 border border-border">
      <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Háttér térkép */}
        <rect width="400" height="200" fill="#f0f4f0" />
        <rect x="0" y="80" width="400" height="60" fill="#e8f0e8" opacity="0.5" />
        {/* Út */}
        <path d="M 40 160 Q 120 120 200 100 Q 280 80 360 50" stroke="#94a3b8" strokeWidth="3" fill="none" strokeDasharray="6 3" />
        {/* Teljesített szakasz */}
        <path d="M 40 160 Q 120 120 200 100" stroke="#22c55e" strokeWidth="4" fill="none" />
        {/* Tervezett szakasz */}
        <path d="M 200 100 Q 280 80 360 50" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="8 4" />
        {/* Megállók */}
        <circle cx="40"  cy="160" r="7" fill="#22c55e" stroke="white" strokeWidth="2" />
        <circle cx="140" cy="120" r="7" fill="#22c55e" stroke="white" strokeWidth="2" />
        <circle cx="200" cy="100" r="10" fill="#f59e0b" stroke="white" strokeWidth="2.5" />
        <circle cx="360" cy="50"  r="7" fill="#3b82f6" stroke="white" strokeWidth="2" />
        {/* Aktuális pozíció */}
        <circle cx="200" cy="100" r="20" fill="#f59e0b" opacity="0.2" />
        <text x="210" y="96" fontSize="10" fill="#92400e" fontWeight="bold">ÉN</text>
        {/* Megálló nevek */}
        <text x="25"  y="178" fontSize="8" fill="#374151">Vasútállomás</text>
        <text x="120" y="115" fontSize="8" fill="#374151">Városháza</text>
        <text x="175" y="118" fontSize="8" fill="#92400e" fontWeight="bold">Piac tér</text>
        <text x="335" y="45"  fontSize="8" fill="#1d4ed8">Gyárkapu</text>
        {/* Legenda */}
        <rect x="10" y="10" width="130" height="40" fill="white" opacity="0.9" rx="6" />
        <circle cx="22" cy="22" r="4" fill="#22c55e" />
        <text x="30" y="26" fontSize="8" fill="#374151">Teljesített</text>
        <circle cx="22" cy="38" r="4" fill="#f59e0b" />
        <text x="30" y="42" fontSize="8" fill="#374151">Aktuális pozíció</text>
      </svg>
    </div>
  );
}

export default function DriverMobilePage() {
  const { currentUser } = useAuth();
  const [deviationOpen, setDeviationOpen] = useState(false);
  const [deviationReason, setDeviationReason] = useState('');
  const [deviationDesc, setDeviationDesc] = useState('');
  const [delayMin, setDelayMin] = useState('');

  // Sofőrként a saját járatait mutatjuk (mock: 1. sofőr járatai)
  const myDriver = drivers.find(d => d.name === currentUser?.name) ?? drivers[0];
  const myTrips  = extraTrips.filter(t =>
    t.assigned_driver_id === myDriver.id &&
    (t.status === 'Visszaigazolva' || t.status === 'Aktív')
  );
  const activeTrip = extraTrips.find(t => t.status === 'Aktív' && t.assigned_driver_id === myDriver.id)
    ?? extraTrips.find(t => t.status === 'Visszaigazolva' && t.assigned_driver_id === myDriver.id);
  const myVehicle = activeTrip ? vehicles.find(v => v.id === activeTrip.assigned_vehicle_id) : null;

  const handleDeviationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Eltérés bejelentve! A diszpécser értesítve.');
    setDeviationOpen(false);
    setDeviationReason('');
    setDeviationDesc('');
    setDelayMin('');
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <PageHeader
        title="Sofőr nézet"
        description={`${myDriver.name} · ${myDriver.chip_id}`}
      />

      <div className="page-content space-y-4">
        {/* Aktív járat */}
        {activeTrip ? (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {activeTrip.status === 'Aktív' ? 'Aktív járat' : 'Következő járat'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                {activeTrip.start_stop_name}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <MapPin className="w-4 h-4 text-destructive" />
                {activeTrip.end_stop_name}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{activeTrip.start_time}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{activeTrip.passengers} utas</span>
                {myVehicle && <span className="flex items-center gap-1"><Bus className="w-4 h-4" />{myVehicle.plate}</span>}
              </div>

              {/* Útvonal megállói */}
              <div className="space-y-2 pt-1">
                {MOCK_ROUTE_STOPS.map((stop, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      stop.status === 'done'    ? 'bg-green-100'  :
                      stop.status === 'current' ? 'bg-amber-100'  : 'bg-gray-100'
                    }`}>
                      {stop.status === 'done'    ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                       stop.status === 'current' ? <Navigation className="w-4 h-4 text-amber-600" /> :
                       <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${stop.status === 'current' ? 'font-bold text-amber-800' : stop.status === 'done' ? 'text-muted-foreground line-through' : ''}`}>
                        {stop.name}
                      </p>
                    </div>
                    <span className={`text-xs ${stop.status === 'current' ? 'text-amber-700 font-bold' : 'text-muted-foreground'}`}>
                      {stop.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Térkép */}
              <RouteMap />

              {/* Gombok */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => setDeviationOpen(true)}>
                  <AlertTriangle className="w-4 h-4 mr-2" />Eltérés bejelentése
                </Button>
                <Button variant="outline">
                  <Phone className="w-4 h-4 mr-2" />Diszpécser hívása
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Smartphone className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium">Nincs aktív járat</p>
              <p className="text-sm text-muted-foreground">Ma nincs hozzád rendelt aktív járat.</p>
            </CardContent>
          </Card>
        )}

        {/* Mai összes járat */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mai beosztásom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myTrips.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nincs visszaigazolt járat ma.</p>
            ) : myTrips.map(t => {
              const v = vehicles.find(v2 => v2.id === t.assigned_vehicle_id);
              return (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border text-sm">
                  <div className={`w-2 h-10 rounded-full flex-shrink-0 ${t.status === 'Aktív' ? 'bg-green-500' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.start_stop_name} → {t.end_stop_name}</p>
                    <p className="text-xs text-muted-foreground">{t.start_time} · {t.passengers} utas{v ? ` · ${v.plate}` : ''}</p>
                  </div>
                  <Badge className={`text-[10px] ${t.status === 'Aktív' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`} variant="outline">
                    {t.status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sofőr adatok */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Saját adataim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Chip ID</span><span className="font-medium">{myDriver.chip_id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Telefon</span><span className="font-medium">{myDriver.phone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pontosság</span><span className="font-medium">{myDriver.accuracy_percent}%</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">E-FOS</span>
              <Badge variant={myDriver.efos_registered ? 'outline' : 'destructive'} className="text-[10px]">
                {myDriver.efos_registered ? 'Aktív ✓' : 'Hiányzik ⚠'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jogosítvány lejárat</span>
              <span className="font-medium">{myDriver.license_expiry ?? '–'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eltérés bejelentés modal */}
      <Dialog open={deviationOpen} onOpenChange={setDeviationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Eltérés bejelentése
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeviationSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="font-medium">{activeTrip?.start_stop_name} → {activeTrip?.end_stop_name}</p>
              <p className="text-muted-foreground">{activeTrip?.start_time}</p>
            </div>
            <div className="space-y-2">
              <Label>Az eltérés oka</Label>
              <Select value={deviationReason} onValueChange={setDeviationReason} required>
                <SelectTrigger><SelectValue placeholder="Válasszon okot..." /></SelectTrigger>
                <SelectContent>
                  {DEVIATION_REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rövid leírás</Label>
              <Textarea placeholder="Pl.: M0-ás lezárva, kerülőn megyek..." rows={3}
                value={deviationDesc} onChange={e => setDeviationDesc(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Becsült késés (perc)</Label>
              <Input type="number" placeholder="pl. 10" value={delayMin} onChange={e => setDelayMin(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDeviationOpen(false)}>Mégse</Button>
              <Button type="submit" disabled={!deviationReason || !deviationDesc}>
                <AlertTriangle className="w-4 h-4 mr-1" />Bejelentés küldése
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
