import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/data-table';
import { extraTrips as initialTrips, stops, vehicles, drivers } from '@/data/mockData';
import { ExtraTrip, TripStatus, VehicleCategory, AuditLogEntry, Conflict } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Search, MapPin, Users, Clock, ArrowRight, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, RefreshCw, FileText, Bus,
  User, History, AlertCircle,
} from 'lucide-react';

// ── Segédadatok ──────────────────────────────────────────────────────────────
const ALL_STATUSES: TripStatus[] = [
  'Igény beérkezett','Tervezés alatt','Visszaigazolva','Aktív','Teljesített','Elutasítva','Lemondva',
];

const STATUS_COLOR: Record<TripStatus, string> = {
  'Igény beérkezett': 'bg-slate-100 text-slate-700 border-slate-300',
  'Tervezés alatt':   'bg-amber-100 text-amber-800 border-amber-300',
  'Visszaigazolva':   'bg-blue-100 text-blue-800 border-blue-300',
  'Aktív':            'bg-green-100 text-green-800 border-green-300',
  'Teljesített':      'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Elutasítva':       'bg-red-100 text-red-800 border-red-300',
  'Lemondva':         'bg-gray-100 text-gray-600 border-gray-300',
};

const NEXT_STATUS: Partial<Record<TripStatus, TripStatus>> = {
  'Igény beérkezett': 'Tervezés alatt',
  'Tervezés alatt':   'Visszaigazolva',
  'Visszaigazolva':   'Aktív',
  'Aktív':            'Teljesített',
};

const CAT_LABELS: Record<VehicleCategory, string> = {
  mikro: 'Mikrobusz (8 fő)', minibusz: 'Minibusz (19 fő)',
  midibusz: 'Midibusz (29-33 fő)', turista: 'Turistabusz (49-55 fő)',
  alacsonypadlós: 'Alacsonypadlós (39 fő)', szerviz: 'Szerviz gépkocsi', szemely: 'Személygépkocsi',
};

const CONFLICT_LABEL: Record<string, string> = {
  sofor_parhuzamos: 'Sofőr ütközés', sofor_aetr: 'AETR pihenőidő',
  sofor_jogositvany: 'Lejárt jogosítvány', sofor_efos: 'Hiányzó E-FOS',
  'jarmű_parhuzamos': 'Jármű ütközés', 'jarmű_kapacitas': 'Kapacitástúllépés',
  utvonal_elteres: 'Útvonal eltérés',
};

// ── Státusz stepper ──────────────────────────────────────────────────────────
function TripStatusStepper({ status }: { status: TripStatus }) {
  const flow: TripStatus[] = ['Igény beérkezett','Tervezés alatt','Visszaigazolva','Aktív','Teljesített'];
  const terminal = status === 'Elutasítva' || status === 'Lemondva';
  const currentIdx = flow.indexOf(status);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {terminal ? (
        <Badge variant="destructive" className="text-xs">{status}</Badge>
      ) : (
        flow.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s} className="flex items-center gap-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                active ? STATUS_COLOR[s] : done ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}>
                {done ? '✓' : ''}{s}
              </span>
              {i < flow.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Ütközés badge ────────────────────────────────────────────────────────────
function ConflictBadges({ conflicts }: { conflicts: Conflict[] }) {
  const active = conflicts.filter(c => !c.resolved);
  if (!active.length) return null;
  const blockers = active.filter(c => c.severity === 'blocker');
  const warnings = active.filter(c => c.severity === 'warning');
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {blockers.length > 0 && (
        <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 border border-red-300 rounded-full px-2 py-0.5 font-medium">
          <XCircle className="w-3 h-3" />{blockers.length} blokkoló
        </span>
      )}
      {warnings.length > 0 && (
        <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 border border-amber-300 rounded-full px-2 py-0.5 font-medium">
          <AlertTriangle className="w-3 h-3" />{warnings.length} figyelmeztetés
        </span>
      )}
    </div>
  );
}

// ── Audit log panel ──────────────────────────────────────────────────────────
function AuditLogPanel({ log }: { log: AuditLogEntry[] }) {
  if (!log.length) return <p className="text-sm text-muted-foreground">Nincs napló bejegyzés.</p>;
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {[...log].reverse().map(entry => (
        <div key={entry.id} className="flex gap-3 text-sm">
          <div className="w-1 rounded-full bg-primary/30 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{entry.user_name}</span>
              <Badge variant="outline" className="text-[10px] py-0">{entry.user_role}</Badge>
              <span className="text-muted-foreground text-xs ml-auto">{entry.timestamp}</span>
            </div>
            <p className="text-muted-foreground">
              {entry.action === 'státusz_változás' && entry.old_value && entry.new_value
                ? `Státusz: ${entry.old_value} → ${entry.new_value}`
                : entry.action === 'jármű_hozzárendelve' ? `Jármű hozzárendelve: ${entry.new_value}`
                : entry.action === 'sofőr_hozzárendelve' ? `Sofőr hozzárendelve: ${entry.new_value}`
                : entry.action === 'módosítva' && entry.reason ? `Módosítva: ${entry.reason}`
                : entry.action}
            </p>
            {entry.reason && entry.action !== 'módosítva' && (
              <p className="text-xs text-muted-foreground italic">Indoklás: {entry.reason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ExtraTripsPage() {
  const { currentUser, isClient, clientId, isJarattervezo, isMuszakvezeto, isDiszpecser, isAdmin } = useAuth();
  const [trips, setTrips] = useState<ExtraTrip[]>(initialTrips);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TripStatus | 'mind'>('mind');
  const [selectedTrip, setSelectedTrip] = useState<ExtraTrip | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusChangeTrip, setStatusChangeTrip] = useState<{ trip: ExtraTrip; next: TripStatus } | null>(null);
  const [indoklas, setIndoklas] = useState('');
  const [assignVehicle, setAssignVehicle] = useState('');
  const [assignDriver, setAssignDriver] = useState('');

  const canEdit = isJarattervezo || isMuszakvezeto || isDiszpecser || isAdmin;

  const displayTrips = (isClient ? trips.filter(t => t.client_id === clientId) : trips)
    .filter(t => filterStatus === 'mind' || t.status === filterStatus)
    .filter(t =>
      t.client_name.toLowerCase().includes(search.toLowerCase()) ||
      t.start_stop_name.toLowerCase().includes(search.toLowerCase()) ||
      t.end_stop_name.toLowerCase().includes(search.toLowerCase())
    );

  const countByStatus = (s: TripStatus) => trips.filter(t => t.status === s).length;

  // Státuszváltás
  const handleStatusChange = (trip: ExtraTrip, next: TripStatus) => {
    const needsReason = trip.status === 'Visszaigazolva'; // visszaigazolás után indoklás kell
    if (needsReason && next !== 'Aktív') { setStatusChangeTrip({ trip, next }); return; }
    if (next === 'Elutasítva' || next === 'Lemondva') { setStatusChangeTrip({ trip, next }); return; }
    applyStatusChange(trip, next, '');
  };

  const applyStatusChange = (trip: ExtraTrip, next: TripStatus, reason: string) => {
    const newEntry: AuditLogEntry = {
      id: `a${Date.now()}`, trip_id: trip.id, action: 'státusz_változás',
      user_name: currentUser?.name ?? 'Ismeretlen', user_role: currentUser?.role ?? 'Diszpécser',
      timestamp: new Date().toLocaleString('hu-HU'),
      old_value: trip.status, new_value: next,
      reason: reason || undefined,
    };
    setTrips(prev => prev.map(t => t.id === trip.id
      ? { ...t, status: next, audit_log: [...(t.audit_log ?? []), newEntry] }
      : t
    ));
    if (selectedTrip?.id === trip.id) {
      setSelectedTrip(prev => prev ? { ...prev, status: next, audit_log: [...(prev.audit_log ?? []), newEntry] } : null);
    }
    toast.success(`Státusz módosítva: ${next}`);
    setStatusChangeTrip(null);
    setIndoklas('');
  };

  const handleAssign = (trip: ExtraTrip) => {
    const entries: AuditLogEntry[] = [];
    const now = new Date().toLocaleString('hu-HU');
    if (assignVehicle) {
      const v = vehicles.find(v => v.id === assignVehicle);
      entries.push({ id: `a${Date.now()}`, trip_id: trip.id, action: 'jármű_hozzárendelve',
        user_name: currentUser?.name ?? '', user_role: currentUser?.role ?? 'Műszakvezető',
        timestamp: now, new_value: v?.plate });
    }
    if (assignDriver) {
      const d = drivers.find(d => d.id === assignDriver);
      entries.push({ id: `a${Date.now()+1}`, trip_id: trip.id, action: 'sofőr_hozzárendelve',
        user_name: currentUser?.name ?? '', user_role: currentUser?.role ?? 'Műszakvezető',
        timestamp: now, new_value: d?.name });
    }
    setTrips(prev => prev.map(t => t.id === trip.id
      ? { ...t,
          assigned_vehicle_id: assignVehicle || t.assigned_vehicle_id,
          assigned_driver_id: assignDriver || t.assigned_driver_id,
          audit_log: [...(t.audit_log ?? []), ...entries] }
      : t
    ));
    if (selectedTrip?.id === trip.id) {
      setSelectedTrip(prev => prev ? {
        ...prev,
        assigned_vehicle_id: assignVehicle || prev.assigned_vehicle_id,
        assigned_driver_id: assignDriver || prev.assigned_driver_id,
        audit_log: [...(prev.audit_log ?? []), ...entries],
      } : null);
    }
    toast.success('Hozzárendelés mentve!');
    setAssignVehicle('');
    setAssignDriver('');
  };

  const columns: Column<ExtraTrip>[] = [
    {
      key: 'client_name', label: 'Megrendelő',
      render: t => (
        <div>
          <span className="font-medium text-sm">{t.client_name}</span>
          {t.is_recurring && <Badge variant="outline" className="ml-2 text-[10px]"><RefreshCw className="w-2.5 h-2.5 mr-1 inline" />Visszatérő</Badge>}
        </div>
      ),
    },
    {
      key: 'route', label: 'Útvonal',
      render: t => (
        <div className="text-sm flex items-center gap-1 max-w-[200px]">
          <span className="truncate">{t.start_stop_name}</span>
          <ArrowRight className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
          <span className="truncate">{t.end_stop_name}</span>
        </div>
      ),
    },
    {
      key: 'start_time', label: 'Időpont',
      render: t => <span className="text-sm whitespace-nowrap flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-muted-foreground" />{t.start_time}</span>,
    },
    {
      key: 'passengers', label: 'Utasok',
      render: t => <span className="text-sm flex items-center gap-1"><Users className="w-3.5 h-3.5 text-muted-foreground" />{t.passengers} fő</span>,
    },
    {
      key: 'status', label: 'Státusz',
      render: t => (
        <div>
          <Badge className={`text-xs border ${STATUS_COLOR[t.status]}`} variant="outline">{t.status}</Badge>
          {t.conflicts && <ConflictBadges conflicts={t.conflicts} />}
        </div>
      ),
    },
    {
      key: 'actions', label: '', className: 'w-8',
      render: t => (
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedTrip(t); }}>
          <FileText className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Eseti járatok" description="Járatigények kezelése – igénytől a teljesítésig"
        actions={
          canEdit ? (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Új eseti igény</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader><DialogTitle>Új eseti járat igénylése</DialogTitle></DialogHeader>
                <form onSubmit={e => { e.preventDefault(); toast.success('Eseti járat igény sikeresen elküldve!'); setIsCreateOpen(false); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kiindulási hely</Label>
                      <Select><SelectTrigger><SelectValue placeholder="Megálló" /></SelectTrigger>
                        <SelectContent>{stops.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Érkezési hely</Label>
                      <Select><SelectTrigger><SelectValue placeholder="Megálló" /></SelectTrigger>
                        <SelectContent>{stops.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Utasszám</Label><Input type="number" placeholder="pl. 25" /></div>
                    <div className="space-y-2">
                      <Label>Járműkategória</Label>
                      <Select><SelectTrigger><SelectValue placeholder="Válasszon" /></SelectTrigger>
                        <SelectContent>{Object.entries(CAT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Indulás</Label><Input type="datetime-local" /></div>
                    <div className="space-y-2"><Label>Visszaút (opcionális)</Label><Input type="datetime-local" /></div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <Label>Oda-vissza</Label><Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <Label>Visszatérő járat</Label><Switch />
                  </div>
                  <div className="space-y-2"><Label>Megjegyzés</Label><Textarea placeholder="További információk..." /></div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Mégse</Button>
                    <Button type="submit">Igény beküldése</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="page-content space-y-4">
        {/* Összefoglaló kártyák */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {ALL_STATUSES.map(s => (
            <Card key={s} className={`cursor-pointer transition-all hover:shadow-md ${filterStatus === s ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilterStatus(filterStatus === s ? 'mind' : s)}>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{countByStatus(s)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Keresés */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Keresés..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          {filterStatus !== 'mind' && (
            <Button variant="outline" size="sm" onClick={() => setFilterStatus('mind')}>
              <XCircle className="w-4 h-4 mr-1" />Szűrő törlése
            </Button>
          )}
        </div>

        <DataTable columns={columns} data={displayTrips} onRowClick={t => setSelectedTrip(t)} />
      </div>

      {/* ── Részletek drawer ── */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Járat részletei
            </DialogTitle>
          </DialogHeader>

          {selectedTrip && (() => {
            const trip = trips.find(t => t.id === selectedTrip.id) ?? selectedTrip;
            const vehicle = vehicles.find(v => v.id === trip.assigned_vehicle_id);
            const driver  = drivers.find(d => d.id === trip.assigned_driver_id);
            const nextStatus = NEXT_STATUS[trip.status];
            const activeConflicts = (trip.conflicts ?? []).filter(c => !c.resolved);

            return (
              <div className="space-y-5">
                {/* Státusz stepper */}
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Állapot folyamat</p>
                  <TripStatusStepper status={trip.status} />
                </div>

                {/* Ütközések */}
                {activeConflicts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />Ütközések ({activeConflicts.length})
                    </p>
                    {activeConflicts.map(c => (
                      <div key={c.id} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                        c.severity === 'blocker' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                      }`}>
                        {c.severity === 'blocker'
                          ? <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium">{CONFLICT_LABEL[c.type]} – {c.affected_entity}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{c.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Útvonal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted space-y-1">
                    <p className="text-xs text-muted-foreground">Kiindulás</p>
                    <p className="font-medium text-sm">{trip.start_stop_name}</p>
                    <p className="text-xs text-muted-foreground">{trip.start_time}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted space-y-1">
                    <p className="text-xs text-muted-foreground">Érkezés</p>
                    <p className="font-medium text-sm">{trip.end_stop_name}</p>
                    <p className="text-xs text-muted-foreground">{trip.end_time ?? '–'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Utasok</p><p className="font-medium">{trip.passengers} fő</p></div>
                  <div><p className="text-xs text-muted-foreground">Kategória</p><p className="font-medium capitalize">{trip.vehicle_category}</p></div>
                  <div><p className="text-xs text-muted-foreground">Típus</p>
                    <p className="font-medium">{trip.is_return ? 'Oda-vissza' : 'Csak oda'}{trip.is_recurring ? ' · Visszatérő' : ''}</p>
                  </div>
                </div>

                {trip.recurrence_pattern && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <span>{trip.recurrence_pattern}</span>
                  </div>
                )}

                {trip.notes && (
                  <div className="p-3 rounded-lg bg-muted text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Megjegyzés</p>
                    <p>{trip.notes}</p>
                  </div>
                )}

                {/* Hozzárendelések */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border text-sm">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Bus className="w-3 h-3" />Jármű</p>
                    {vehicle ? (
                      <div>
                        <p className="font-medium">{vehicle.plate}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.seats} fő · {vehicle.category}</p>
                        {!vehicle.efos_active && <Badge variant="destructive" className="text-[10px] mt-1">E-FOS hiányzik</Badge>}
                      </div>
                    ) : <p className="text-muted-foreground">Nem hozzárendelve</p>}
                  </div>
                  <div className="p-3 rounded-lg border text-sm">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><User className="w-3 h-3" />Sofőr</p>
                    {driver ? (
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-xs text-muted-foreground">{driver.accuracy_percent}% pontosság</p>
                        {!driver.efos_registered && <Badge variant="destructive" className="text-[10px] mt-1">E-FOS hiányzik</Badge>}
                      </div>
                    ) : <p className="text-muted-foreground">Nem hozzárendelve</p>}
                  </div>
                </div>

                {/* Hozzárendelés szerkesztése */}
                {canEdit && trip.status !== 'Teljesített' && trip.status !== 'Elutasítva' && trip.status !== 'Lemondva' && (
                  <div className="p-4 rounded-xl border border-dashed space-y-3">
                    <p className="text-sm font-medium">Hozzárendelés módosítása</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Jármű</Label>
                        <Select value={assignVehicle} onValueChange={setAssignVehicle}>
                          <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                          <SelectContent>
                            {vehicles.filter(v => v.status === 'aktív').map(v => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.plate} – {v.seats} fő{!v.efos_active ? ' ⚠️' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Sofőr</Label>
                        <Select value={assignDriver} onValueChange={setAssignDriver}>
                          <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                          <SelectContent>
                            {drivers.map(d => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name} ({d.accuracy_percent}%){!d.available ? ' 🔴' : ' 🟢'}{!d.efos_registered ? ' ⚠️' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAssign(trip)} disabled={!assignVehicle && !assignDriver}>
                      Hozzárendelés mentése
                    </Button>
                  </div>
                )}

                {/* Státuszváltó gombok */}
                {canEdit && (
                  <div className="flex gap-2 flex-wrap">
                    {nextStatus && (
                      <Button size="sm" className="flex items-center gap-2"
                        onClick={() => handleStatusChange(trip, nextStatus)}>
                        <CheckCircle2 className="w-4 h-4" />
                        Továbblép: {nextStatus}
                      </Button>
                    )}
                    {trip.status !== 'Elutasítva' && trip.status !== 'Lemondva' && trip.status !== 'Teljesített' && (
                      <>
                        <Button size="sm" variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-50"
                          onClick={() => handleStatusChange(trip, 'Lemondva')}>
                          Lemondás
                        </Button>
                        {isMuszakvezeto && (
                          <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => handleStatusChange(trip, 'Elutasítva')}>
                            Elutasítás
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Audit log */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <History className="w-4 h-4 text-muted-foreground" />Módosítási napló
                  </p>
                  <AuditLogPanel log={trip.audit_log ?? []} />
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Indoklás modal ── */}
      <Dialog open={!!statusChangeTrip} onOpenChange={() => { setStatusChangeTrip(null); setIndoklas(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusChangeTrip?.next === 'Lemondva' ? 'Lemondás megerősítése' :
               statusChangeTrip?.next === 'Elutasítva' ? 'Elutasítás megerősítése' :
               `Státuszváltás: ${statusChangeTrip?.next}`}
            </DialogTitle>
          </DialogHeader>
          {statusChangeTrip && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium">{statusChangeTrip.trip.client_name}</p>
                <p className="text-muted-foreground">{statusChangeTrip.trip.start_stop_name} → {statusChangeTrip.trip.end_stop_name}</p>
              </div>
              <div className="space-y-2">
                <Label>
                  Indoklás {statusChangeTrip.trip.status === 'Visszaigazolva' || statusChangeTrip.next === 'Elutasítva' || statusChangeTrip.next === 'Lemondva' ? '(kötelező)' : '(opcionális)'}
                </Label>
                <Textarea
                  placeholder="Adja meg az indoklást..."
                  value={indoklas}
                  onChange={e => setIndoklas(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setStatusChangeTrip(null); setIndoklas(''); }}>Mégse</Button>
                <Button
                  variant={statusChangeTrip.next === 'Elutasítva' || statusChangeTrip.next === 'Lemondva' ? 'destructive' : 'default'}
                  disabled={(statusChangeTrip.trip.status === 'Visszaigazolva' || statusChangeTrip.next === 'Elutasítva' || statusChangeTrip.next === 'Lemondva') && !indoklas.trim()}
                  onClick={() => applyStatusChange(statusChangeTrip.trip, statusChangeTrip.next, indoklas)}
                >
                  Megerősítés
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
