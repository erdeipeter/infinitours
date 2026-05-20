import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { extraTrips, conflicts, drivers, vehicles } from '@/data/mockData';
import { Conflict, ExtraTrip, TripStatus } from '@/types';
import {
  AlertTriangle, XCircle, CheckCircle2, Clock, Bus, User,
  Radio, RefreshCw, ChevronRight, AlertCircle, MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const STATUS_COLOR: Record<TripStatus, string> = {
  'Igény beérkezett': 'bg-slate-100 text-slate-700',
  'Tervezés alatt':   'bg-amber-100 text-amber-800',
  'Visszaigazolva':   'bg-blue-100 text-blue-800',
  'Aktív':            'bg-green-100 text-green-800',
  'Teljesített':      'bg-emerald-100 text-emerald-800',
  'Elutasítva':       'bg-red-100 text-red-800',
  'Lemondva':         'bg-gray-100 text-gray-600',
};

const CONFLICT_LABEL: Record<string, string> = {
  sofor_parhuzamos: 'Sofőr ütközés', sofor_aetr: 'AETR',
  sofor_jogositvany: 'Lejárt jogosítvány', sofor_efos: 'Hiányzó E-FOS',
  'jarmű_parhuzamos': 'Jármű ütközés', 'jarmű_kapacitas': 'Kapacitástúllépés',
  utvonal_elteres: 'Útvonal eltérés',
};

function ConflictRow({ c, onResolve }: { c: Conflict; onResolve: (id: string) => void }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${
      c.severity === 'blocker' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
    }`}>
      {c.severity === 'blocker'
        ? <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        : <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{CONFLICT_LABEL[c.type]}</span>
          <Badge variant={c.severity === 'blocker' ? 'destructive' : 'outline'}
            className="text-[10px]">{c.severity === 'blocker' ? 'BLOKKOL' : 'Figyelmeztetés'}</Badge>
          <span className="text-xs text-muted-foreground ml-auto">{c.detected_at}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>
        <p className="text-xs font-medium mt-1">Érintett: {c.affected_entity}</p>
      </div>
      <Button size="sm" variant="outline" className="flex-shrink-0 text-xs"
        onClick={() => onResolve(c.id)}>
        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Feloldva
      </Button>
    </div>
  );
}

export default function DispatcherPage() {
  const [activeConflicts, setActiveConflicts] = useState<Conflict[]>(conflicts);
  const [selectedTrip, setSelectedTrip] = useState<ExtraTrip | null>(null);
  const [lastRefresh] = useState(new Date().toLocaleTimeString('hu-HU'));

  const unresolved = activeConflicts.filter(c => !c.resolved);
  const blockers   = unresolved.filter(c => c.severity === 'blocker');
  const warnings   = unresolved.filter(c => c.severity === 'warning');

  const todayTrips = extraTrips.filter(t =>
    t.status !== 'Elutasítva' && t.status !== 'Lemondva' && t.status !== 'Teljesített'
  );

  const getConflictsForTrip = (tripId: string) =>
    activeConflicts.filter(c => c.trip_id === tripId && !c.resolved);

  const handleResolve = (id: string) => {
    setActiveConflicts(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c));
    toast.success('Ütközés feloldva és naplózva.');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Diszpécser nézet"
        description={`Napi operatív vezérlés · Utolsó frissítés: ${lastRefresh}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.info('Frissítve!')}>
            <RefreshCw className="w-4 h-4 mr-2" />Frissítés
          </Button>
        }
      />

      <div className="page-content space-y-6">
        {/* KPI sor */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Aktív járatok',    value: todayTrips.filter(t => t.status === 'Aktív').length,    icon: Radio,          color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Blokkoló ütközés', value: blockers.length,                                        icon: XCircle,        color: 'text-red-600',    bg: 'bg-red-50'   },
            { label: 'Figyelmeztetés',   value: warnings.length,                                        icon: AlertTriangle,  color: 'text-amber-600',  bg: 'bg-amber-50' },
            { label: 'Tervezett ma',     value: todayTrips.length,                                      icon: Clock,          color: 'text-blue-600',   bg: 'bg-blue-50'  },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}>
                  <k.icon className={`w-5 h-5 ${k.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ütközések */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Aktív ütközések
                {unresolved.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">{unresolved.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unresolved.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                  <p className="font-medium text-green-700">Nincs aktív ütközés</p>
                  <p className="text-sm text-muted-foreground">Minden járat ütközésmentes</p>
                </div>
              ) : (
                unresolved.map(c => <ConflictRow key={c.id} c={c} onResolve={handleResolve} />)
              )}
            </CardContent>
          </Card>

          {/* Mai járatok */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bus className="w-5 h-5 text-primary" />
                Mai járatok
                <Badge variant="outline" className="ml-auto">{todayTrips.length} db</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
              {todayTrips.map(trip => {
                const tripConflicts = getConflictsForTrip(trip.id);
                const vehicle = vehicles.find(v => v.id === trip.assigned_vehicle_id);
                const driver  = drivers.find(d => d.id === trip.assigned_driver_id);
                return (
                  <div key={trip.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      tripConflicts.some(c => c.severity === 'blocker') ? 'border-red-200 bg-red-50/50' :
                      tripConflicts.length > 0 ? 'border-amber-200 bg-amber-50/50' : 'border-border'
                    }`}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{trip.client_name}</span>
                          <Badge className={`text-[10px] ${STATUS_COLOR[trip.status]}`} variant="outline">
                            {trip.status}
                          </Badge>
                          {tripConflicts.length > 0 && (
                            <Badge variant="destructive" className="text-[10px]">
                              {tripConflicts.length} ütközés
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{trip.start_time}
                          <ChevronRight className="w-3 h-3" />
                          <MapPin className="w-3 h-3" />{trip.start_stop_name} → {trip.end_stop_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {vehicle && <span className="flex items-center gap-1"><Bus className="w-3 h-3" />{vehicle.plate}</span>}
                          {driver  && <span className="flex items-center gap-1"><User className="w-3 h-3" />{driver.name}</span>}
                          {!vehicle && !driver && <span className="text-amber-600">⚠ Nincs hozzárendelve</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sofőr státuszok */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />Sofőr elérhetőség
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {drivers.map(d => (
                <div key={d.id} className={`p-3 rounded-lg border text-center ${d.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-2 ${d.available ? 'bg-green-100' : 'bg-gray-200'}`}>
                    <User className={`w-4 h-4 ${d.available ? 'text-green-700' : 'text-gray-500'}`} />
                  </div>
                  <p className="text-xs font-medium leading-tight">{d.name}</p>
                  <p className={`text-[10px] mt-1 ${d.available ? 'text-green-600' : 'text-gray-500'}`}>
                    {d.available ? '🟢 Szabad' : '🔴 Foglalt'}
                  </p>
                  {!d.efos_registered && <p className="text-[10px] text-red-600">E-FOS ⚠</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Járat részletei popup */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Járat részletei</DialogTitle></DialogHeader>
          {selectedTrip && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={`${STATUS_COLOR[selectedTrip.status]}`} variant="outline">{selectedTrip.status}</Badge>
                <span className="font-semibold">{selectedTrip.client_name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Kiindulás</p><p className="font-medium">{selectedTrip.start_stop_name}</p><p className="text-xs">{selectedTrip.start_time}</p></div>
                <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Érkezés</p><p className="font-medium">{selectedTrip.end_stop_name}</p><p className="text-xs">{selectedTrip.end_time ?? '–'}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Jármű</p>
                  {vehicles.find(v => v.id === selectedTrip.assigned_vehicle_id)
                    ? <p className="font-medium">{vehicles.find(v => v.id === selectedTrip.assigned_vehicle_id)?.plate}</p>
                    : <p className="text-amber-600">Nincs hozzárendelve</p>}
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Sofőr</p>
                  {drivers.find(d => d.id === selectedTrip.assigned_driver_id)
                    ? <p className="font-medium">{drivers.find(d => d.id === selectedTrip.assigned_driver_id)?.name}</p>
                    : <p className="text-amber-600">Nincs hozzárendelve</p>}
                </div>
              </div>
              {getConflictsForTrip(selectedTrip.id).map(c => (
                <ConflictRow key={c.id} c={c} onResolve={handleResolve} />
              ))}
              <div className="flex justify-end gap-2 pt-2">
                {selectedTrip.status === 'Visszaigazolva' && (
                  <Button size="sm" onClick={() => { toast.success('Járat aktiválva!'); setSelectedTrip(null); }}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />Aktiválás
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
