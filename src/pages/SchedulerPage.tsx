import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  extraTrips, schedulerProposals as initialProposals, vehicles, drivers,
} from '@/data/mockData';
import { SchedulerProposal, ProposalStatus, ExtraTrip, TripStatus } from '@/types';
import {
  Cpu, CheckCircle2, XCircle, Clock, Bus, User, Star,
  ChevronDown, ChevronUp, Play, ArrowRight, MapPin,
  Shuffle, Route, AlertTriangle, Zap, BarChart3, Navigation,
  FileText, Users, Eye, ChevronLeft, RefreshCw, AlertCircle,
  ThumbsUp, ThumbsDown, Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ── Segédek ───────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<ProposalStatus, { label: string; cls: string }> = {
  javaslat:    { label: 'Javaslat',    cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  jóváhagyott: { label: 'Jóváhagyott', cls: 'bg-green-100 text-green-800 border-green-300' },
  módosított:  { label: 'Módosított',  cls: 'bg-blue-100 text-blue-800 border-blue-300'   },
  elutasított: { label: 'Elutasított', cls: 'bg-red-100 text-red-800 border-red-300'      },
};
const TRIP_STATUS_CLS: Partial<Record<TripStatus, string>> = {
  'Igény beérkezett': 'bg-slate-100 text-slate-700',
  'Tervezés alatt':   'bg-amber-100 text-amber-800',
  'Visszaigazolva':   'bg-blue-100  text-blue-800',
  'Aktív':            'bg-green-100 text-green-800',
};
const CAT_LABELS: Record<string, string> = {
  mikro:'Mikrobusz (8 fő)', minibusz:'Minibusz (19 fő)', midibusz:'Midibusz (29-33 fő)',
  turista:'Turistabusz (49-55 fő)', alacsonypadlós:'Alacsonypadlós (39 fő)',
  szerviz:'Szerviz', szemely:'Személygépkocsi',
};

// ── Optimalizálási lépések ────────────────────────────────────────────────────
interface OptStep {
  id: string; label: string; detail: string;
  icon: React.ElementType; durationMs: number; result?: string;
}
const buildSteps = (trip: ExtraTrip): OptStep[] => {
  const avV = vehicles.filter(v => v.status==='aktív' && v.category===trip.vehicle_category);
  const avD = drivers.filter(d => d.available && d.efos_registered);
  return [
    { id:'s1', icon:FileText,      durationMs:1400, label:'Igény elemzése',           detail:`${trip.passengers} utas · ${CAT_LABELS[trip.vehicle_category]??trip.vehicle_category} · ${trip.start_time}`, result:'Igény értelmezve ✓' },
    { id:'s2', icon:Bus,           durationMs:2000, label:'Szabad járművek szűrése',  detail:`Kapacitás (min. ${trip.passengers} fő), kategória és elérhetőség ellenőrzése...`, result:`${avV.length} megfelelő jármű` },
    { id:'s3', icon:User,          durationMs:1800, label:'Sofőr elérhetőség',         detail:'Munkaidő, AETR pihenőidő, E-FOS és jogosítvány ellenőrzése...', result:`${avD.length} elérhető sofőr` },
    { id:'s4', icon:AlertTriangle, durationMs:2200, label:'Ütközésvizsgálat',          detail:'Párhuzamos járatok, napi munkaidő-korlát, lejárt dokumentumok...', result:`${6-avD.length} sofőr kiszűrve` },
    { id:'s5', icon:Route,         durationMs:2800, label:'Útvonal-optimalizálás',     detail:'Megállók sorrendjének optimalizálása koordináták alapján...', result:'Optimális sorrend: −18% km' },
    { id:'s6', icon:Star,          durationMs:1600, label:'Párosítás & pontszámítás',  detail:'Minden sofőr–jármű pár pontozása: pontosság, kihasználtság, túlóra-kockázat...', result:`Legjobb pár kiválasztva` },
    { id:'s7', icon:Zap,           durationMs:1000, label:'Javaslat generálva',        detail:'Beosztási javaslat elkészítve.', result:'Kész ✓' },
  ];
};

// ── Útvonal vizualizáció ──────────────────────────────────────────────────────
const STOPS_UNOPT = [
  {name:'Gyárkapu',x:320,y:55},{name:'Vasútállomás',x:75,y:80},
  {name:'Városháza',x:160,y:155},{name:'Piac tér',x:245,y:110},
];
const STOPS_OPT = [
  {name:'Vasútállomás',x:75,y:80},{name:'Városháza',x:160,y:155},
  {name:'Piac tér',x:245,y:110},{name:'Gyárkapu',x:320,y:55},
];
function RouteViz({ stops:s, color, label, totalKm }: { stops:typeof STOPS_OPT; color:string; label:string; totalKm:number }) {
  const mid = color.replace('#','');
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color==='#ef4444'?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{totalKm} km</span>
      </div>
      <svg viewBox="0 0 400 210" className="w-full" style={{height:120}}>
        <defs><marker id={`a${mid}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={color}/>
        </marker></defs>
        {s.slice(0,-1).map((st,i)=>(
          <line key={i} x1={st.x} y1={st.y} x2={s[i+1].x} y2={s[i+1].y}
            stroke={color} strokeWidth="2.5" opacity="0.85"
            strokeDasharray={color==='#ef4444'?'7 3':''} markerEnd={`url(#a${mid})`}/>
        ))}
        {s.map((st,i)=>(
          <g key={i}>
            <circle cx={st.x} cy={st.y} r={i===0||i===s.length-1?10:7}
              fill={i===0?'#22c55e':i===s.length-1?'#ef4444':color} stroke="white" strokeWidth="2"/>
            <text x={st.x} y={st.y-14} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">{st.name}</text>
            <text x={st.x} y={st.y+4}  textAnchor="middle" fontSize="8" fill="white"  fontWeight="bold">{i+1}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Optimalizáló animáció + eredmény ─────────────────────────────────────────
function OptimizerView({ trip, proposal, onDone }: {
  trip: ExtraTrip;
  proposal: SchedulerProposal | null;
  onDone: (p: SchedulerProposal) => void;
}) {
  const steps = buildSteps(trip);
  const [currentStep, setCurrentStep] = useState(-1);
  const [doneSteps,   setDoneSteps]   = useState<string[]>([]);
  const [showRoute,   setShowRoute]   = useState(false);
  const [finished,    setFinished]    = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const vehicle = vehicles.find(v => v.id === proposal?.suggested_vehicle_id);
  const driver  = drivers.find(d  => d.id  === proposal?.suggested_driver_id);

  useEffect(() => {
    if (proposal) return; // már van eredmény, ne futtassuk újra
    let idx = 0;
    const run = () => {
      if (idx >= steps.length) { setFinished(true); return; }
      setCurrentStep(idx);
      if (steps[idx].id === 's5') setShowRoute(true);
      timer.current = setTimeout(() => {
        setDoneSteps(prev => [...prev, steps[idx].id]);
        idx++;
        timer.current = setTimeout(run, 200);
      }, steps[idx].durationMs);
    };
    timer.current = setTimeout(run, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const progress = Math.round((doneSteps.length / steps.length) * 100);

  return (
    <div className="space-y-5">
      {/* ── Animáció (csak amíg nem kész) ── */}
      {!finished && !proposal && (
        <>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-medium">Optimalizálás folyamatban...</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5"/>
          </div>
          <div className="space-y-2">
            {steps.map((step, idx) => {
              const isDone    = doneSteps.includes(step.id);
              const isCurrent = currentStep === idx && !isDone;
              const Icon = step.icon;
              return (
                <div key={step.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-500 ${
                  isDone?'bg-green-50 border-green-200':isCurrent?'bg-blue-50 border-blue-300 shadow-md':'bg-gray-50/40 border-transparent opacity-35'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isDone?'bg-green-500':isCurrent?'bg-blue-500':'bg-gray-300'
                  }`}>
                    {isDone?<CheckCircle2 className="w-4 h-4 text-white"/>
                     :isCurrent?<Icon className="w-4 h-4 text-white animate-pulse"/>
                     :<Icon className="w-4 h-4 text-white"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isDone?'text-green-800':isCurrent?'text-blue-800':'text-gray-400'}`}>{step.label}</span>
                      {isDone && step.result && <span className="text-xs text-green-600 ml-auto bg-green-100 px-2 py-0.5 rounded-full">{step.result}</span>}
                      {isCurrent && <span className="text-xs text-blue-500 ml-auto animate-pulse">folyamatban...</span>}
                    </div>
                    {(isCurrent||isDone) && <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          {showRoute && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600"/>Útvonal-optimalizálás
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 flex-col md:flex-row items-center">
                  <RouteViz stops={STOPS_UNOPT} color="#ef4444" label="Eredeti sorrend" totalKm={26}/>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-green-600"/>
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">−18% km</span>
                  </div>
                  <RouteViz stops={STOPS_OPT} color="#22c55e" label="Optimalizált sorrend" totalKm={9}/>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── EREDMÉNY (animáció után azonnal megjelenik) ── */}
      {(finished || proposal) && vehicle && driver && proposal && (
        <div className="space-y-4">
          {/* Fejléc */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-white"/>
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-800">Optimalizálás kész – ez a legjobb javaslat</p>
              <p className="text-sm text-green-700">{proposal.trip_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-green-700">{proposal.score}</p>
              <p className="text-xs text-green-600">/ 100 pont</p>
            </div>
          </div>

          {/* Optimalizált útvonal */}
          <Card className="border-blue-200 bg-blue-50/20">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600"/>Optimalizált útvonal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-col md:flex-row items-center">
                <RouteViz stops={STOPS_UNOPT} color="#ef4444" label="Eredeti sorrend" totalKm={26}/>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-green-600"/>
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">−18% km</span>
                </div>
                <RouteViz stops={STOPS_OPT} color="#22c55e" label="Javasolt sorrend" totalKm={9}/>
              </div>
            </CardContent>
          </Card>

          {/* Javasolt jármű + sofőr */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bus className="w-4 h-4 text-primary"/>Javasolt jármű
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bus className="w-5 h-5 text-primary"/>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{vehicle.plate}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.seats} fő · {vehicle.category} · {vehicle.year}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted text-center">
                    <p className="text-muted-foreground">Futásteljesítmény</p>
                    <p className="font-semibold mt-0.5">{vehicle.current_km.toLocaleString('hu-HU')} km</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted text-center">
                    <p className="text-muted-foreground">Következő vizsga</p>
                    <p className="font-semibold mt-0.5">{vehicle.next_inspection ?? '–'}</p>
                  </div>
                </div>
                {vehicle.efos_active
                  ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-[10px]">E-FOS aktív ✓</Badge>
                  : <Badge variant="destructive" className="text-[10px]">E-FOS hiányzik ⚠</Badge>}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary"/>Javasolt sofőr
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary"/>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.chip_id} · {driver.phone}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Pontossági arány</span>
                    <span className={`font-bold ${driver.accuracy_percent>=93?'text-green-600':driver.accuracy_percent>=88?'text-amber-600':'text-red-500'}`}>
                      {driver.accuracy_percent}%
                    </span>
                  </div>
                  <Progress value={driver.accuracy_percent} className="h-1.5"/>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted text-center">
                    <p className="text-muted-foreground">E-FOS</p>
                    <p className={`font-semibold mt-0.5 ${driver.efos_registered?'text-green-600':'text-red-600'}`}>
                      {driver.efos_registered?'Aktív ✓':'Hiányzik ⚠'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted text-center">
                    <p className="text-muted-foreground">Jogosítvány</p>
                    <p className="font-semibold mt-0.5">{driver.license_expiry ?? '–'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pontszám bontás */}
          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary"/>Pontszám bontása
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { label:'Sofőr pontossága',              val: Math.round(driver.accuracy_percent * 0.4),  max:40, color:'bg-blue-500' },
                { label:'Jármű kapacitás-illeszkedés',  val: vehicle.seats >= trip.passengers ? 28 : 15, max:30, color:'bg-green-500'},
                { label:'Túlóra-kockázat (alacsony = jó)', val:15, max:20, color:'bg-amber-500' },
                { label:'Ütközésmentesség',              val:10, max:10, color:'bg-emerald-500'},
              ].map(r => (
                <div key={r.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-mono font-semibold">{r.val}/{r.max}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.color} transition-all duration-700`}
                      style={{ width:`${(r.val/r.max)*100}%` }}/>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold">Összpontszám</span>
                <span className={`text-xl font-bold ${proposal.score>=90?'text-green-600':proposal.score>=75?'text-amber-600':'text-red-500'}`}>
                  {proposal.score} / 100
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Döntés gombok */}
          {proposal.status === 'javaslat' && (
            <div className="flex gap-3">
              <Button size="lg" className="flex-1 h-12 text-base" onClick={() => onDone(proposal)}>
                <ThumbsUp className="w-5 h-5 mr-2"/>Jóváhagyom
              </Button>
              <Button size="lg" variant="outline" className="flex-1 h-12 text-base text-red-700 border-red-300 hover:bg-red-50"
                onClick={() => onDone({ ...proposal, status: 'elutasított' })}>
                <ThumbsDown className="w-5 h-5 mr-2"/>Elutasítom
              </Button>
            </div>
          )}
          {proposal.status !== 'javaslat' && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              proposal.status==='jóváhagyott'?'bg-green-50 border-green-200':'bg-red-50 border-red-200'
            }`}>
              {proposal.status==='jóváhagyott'
                ?<CheckCircle2 className="w-6 h-6 text-green-600"/>
                :<XCircle     className="w-6 h-6 text-red-600"/>}
              <p className={`font-semibold ${proposal.status==='jóváhagyott'?'text-green-800':'text-red-800'}`}>
                {proposal.status==='jóváhagyott'?'Jóváhagyva – a beosztás érvényes':'Elutasítva'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Igény előnézet panel ──────────────────────────────────────────────────────
function TripReviewPanel({ trip, onStart, onBack }: {
  trip: ExtraTrip; onStart: () => void; onBack: () => void;
}) {
  const matchV = vehicles.filter(v => v.status==='aktív' && v.category===trip.vehicle_category && v.seats>=trip.passengers);
  const otherV = vehicles.filter(v => v.status==='aktív' && v.category!==trip.vehicle_category);
  const avD    = drivers.filter(d => d.available && d.efos_registered);
  const blockedD = drivers.filter(d => !d.available || !d.efos_registered);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0">
          <ChevronLeft className="w-4 h-4 mr-1"/>Vissza
        </Button>
        <div>
          <h3 className="font-semibold">Igény áttekintése</h3>
          <p className="text-sm text-muted-foreground">Ellenőrizd az igény részleteit és az elérhető erőforrásokat</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary"/>Az igény részletei
        </CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-muted-foreground">Megrendelő</p><p className="font-semibold">{trip.client_name}</p></div>
            <div><p className="text-xs text-muted-foreground">Státusz</p>
              <Badge className={`text-xs ${TRIP_STATUS_CLS[trip.status]??''}`} variant="outline">{trip.status}</Badge>
            </div>
          </div>
          <Separator/>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white border space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3 text-green-600"/>Kiindulás</p>
              <p className="font-medium text-sm">{trip.start_stop_name}</p>
              <p className="text-xs text-primary font-semibold">{trip.start_time}</p>
            </div>
            <div className="p-3 rounded-lg bg-white border space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500"/>Érkezés</p>
              <p className="font-medium text-sm">{trip.end_stop_name}</p>
              <p className="text-xs text-muted-foreground">{trip.end_time??'Nincs megadva'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              {label:'Utasszám', value:`${trip.passengers} fő`, icon:'👥'},
              {label:'Kategória', value:CAT_LABELS[trip.vehicle_category]??trip.vehicle_category, icon:'🚌'},
              {label:'Típus', value:trip.is_return?'Oda-vissza':'Csak oda', icon:'↔️'},
            ].map(item=>(
              <div key={item.label} className="p-3 rounded-lg bg-white border">
                <p className="text-lg">{item.icon}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                <p className="font-medium text-xs mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          {trip.is_recurring&&<div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-blue-50 border border-blue-100"><RefreshCw className="w-4 h-4 text-blue-600 flex-shrink-0"/><span className="text-blue-800">{trip.recurrence_pattern??'Visszatérő járat'}</span></div>}
          {trip.notes&&<div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm"><p className="text-xs text-muted-foreground mb-1">📝 Megjegyzés</p><p className="text-amber-900">{trip.notes}</p></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <Bus className="w-4 h-4 text-primary"/>Elérhető járművek
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            <span className="text-green-700 font-semibold">{matchV.length}</span> megfelelő ·
            <span className="text-amber-600 font-semibold ml-1">{otherV.length}</span> más kategória
          </span>
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Az igény <span className="font-semibold text-foreground">{trip.passengers} férőhelyet</span> igényel (<span className="font-semibold text-foreground">{CAT_LABELS[trip.vehicle_category]}</span>).</p>
          {matchV.map(v=>(
            <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50/50">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"><Bus className="w-4 h-4 text-green-700"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{v.plate}</span>
                  <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-300">Megfelelő</Badge>
                  {!v.efos_active&&<Badge variant="destructive" className="text-[10px]">E-FOS hiányzik</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{v.seats} fő · {v.category} · {v.year} · {v.current_km.toLocaleString('hu-HU')} km</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-muted-foreground">Vizsga</p>
                <p className={`font-medium ${v.next_inspection&&v.next_inspection<'2026-08-01'?'text-amber-600':'text-foreground'}`}>{v.next_inspection??'–'}</p>
              </div>
            </div>
          ))}
          {matchV.length===0&&<div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"><AlertCircle className="w-4 h-4 flex-shrink-0"/>Nincs megfelelő kategóriájú szabad jármű.</div>}
          {otherV.length>0&&(
            <details className="mt-1"><summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground py-1 select-none">+ {otherV.length} más kategóriájú jármű (tartalék)</summary>
              <div className="mt-2 space-y-1.5">
                {otherV.map(v=>(
                  <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-gray-50 opacity-70">
                    <Bus className="w-4 h-4 text-gray-500 flex-shrink-0"/>
                    <span className="text-sm font-medium">{v.plate}</span>
                    <span className="text-xs text-muted-foreground">{v.seats} fő · {v.category}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-primary"/>Sofőrök elérhetősége
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            <span className="text-green-700 font-semibold">{avD.length}</span> elérhető ·
            <span className="text-red-600 font-semibold ml-1">{blockedD.length}</span> nem elérhető
          </span>
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {avD.map(d=>(
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50/50">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-green-700"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{d.name}</span>
                  <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-300">🟢 Szabad</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{d.chip_id} · {d.accuracy_percent}% pontosság · Jogosítvány: {d.license_expiry??'–'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Várható pont</p>
                <p className={`font-bold text-sm ${d.accuracy_percent>=93?'text-green-600':d.accuracy_percent>=88?'text-amber-600':'text-red-500'}`}>
                  ~{Math.round(d.accuracy_percent*0.94)}
                </p>
              </div>
            </div>
          ))}
          {blockedD.length>0&&(
            <>
              <Separator className="my-2"/>
              <p className="text-xs text-muted-foreground font-medium">Nem elérhető:</p>
              {blockedD.map(d=>(
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-gray-500"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-600">{d.name}</span>
                      {!d.available&&<Badge variant="destructive" className="text-[10px]">🔴 Foglalt</Badge>}
                      {!d.efos_registered&&<Badge variant="destructive" className="text-[10px]">E-FOS hiányzik</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.chip_id} · {d.accuracy_percent}% pontosság</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-dashed">
        <div className="flex-1">
          <p className="font-medium text-sm">Készen áll az optimalizálásra</p>
          <p className="text-xs text-muted-foreground">{matchV.length} jármű · {avD.length} sofőr kerül értékelésre</p>
        </div>
        <Button onClick={onStart} size="lg" className="flex-shrink-0">
          <Play className="w-4 h-4 mr-2"/>Optimalizálás indítása
        </Button>
      </div>
    </div>
  );
}

// ── Proposal lista kártya ─────────────────────────────────────────────────────
function ProposalCard({ p, onApprove, onReject, expanded, onToggle }: {
  p:SchedulerProposal; onApprove:(p:SchedulerProposal)=>void;
  onReject:(p:SchedulerProposal)=>void; expanded:boolean; onToggle:()=>void;
}) {
  const vehicle=vehicles.find(v=>v.id===p.suggested_vehicle_id);
  const driver =drivers.find(d=>d.id===p.suggested_driver_id);
  const s=STATUS_STYLE[p.status];
  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      p.status==='javaslat'?'border-amber-200 bg-amber-50/30':
      p.status==='jóváhagyott'?'border-green-200 bg-green-50/30':
      p.status==='elutasított'?'border-red-200 bg-red-50/20 opacity-75':'border-blue-200 bg-blue-50/20'}`}>
      <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={onToggle}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          p.status==='javaslat'?'bg-amber-100':p.status==='jóváhagyott'?'bg-green-100':p.status==='elutasított'?'bg-red-100':'bg-blue-100'}`}>
          {p.status==='jóváhagyott'?<CheckCircle2 className="w-5 h-5 text-green-600"/>:p.status==='elutasított'?<XCircle className="w-5 h-5 text-red-600"/>:<Cpu className="w-5 h-5 text-amber-600"/>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{p.trip_name}</span>
            <Badge className={`text-[10px] border ${s.cls}`} variant="outline">{s.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{p.client_name}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{p.start_time.split(' ')[1]}</span>
            {vehicle&&<span className="flex items-center gap-1"><Bus className="w-3 h-3"/>{vehicle.plate}</span>}
            {driver&&<span className="flex items-center gap-1"><User className="w-3 h-3"/>{driver.name}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500"/>
            <span className={`text-xs font-bold ${p.score>=90?'text-green-600':p.score>=75?'text-amber-600':'text-red-600'}`}>{p.score}</span>
          </div>
          {expanded?<ChevronUp className="w-4 h-4 text-muted-foreground"/>:<ChevronDown className="w-4 h-4 text-muted-foreground"/>}
        </div>
      </div>
      {expanded&&(
        <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-white/60">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Jármű</p>
              {vehicle?<><p className="font-medium">{vehicle.plate}</p><p className="text-xs text-muted-foreground">{vehicle.seats} fő · {vehicle.category}</p></>:<p>–</p>}
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Sofőr</p>
              {driver?<><p className="font-medium">{driver.name}</p><p className="text-xs text-muted-foreground">{driver.accuracy_percent}% pontosság</p></>:<p>–</p>}
            </div>
          </div>
          {p.reason&&<div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm"><p className="text-xs text-muted-foreground mb-1">Indoklás</p><p className="text-red-800">{p.reason}</p></div>}
          {p.status==='javaslat'&&(
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={()=>onApprove(p)}><ThumbsUp className="w-4 h-4 mr-1"/>Jóváhagyás</Button>
              <Button size="sm" variant="outline" className="flex-1 text-red-700 border-red-300 hover:bg-red-50" onClick={()=>onReject(p)}><ThumbsDown className="w-4 h-4 mr-1"/>Elutasítás</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function SchedulerPage() {
  const [proposals,    setProposals]    = useState<SchedulerProposal[]>(initialProposals);
  const [activeTab,    setActiveTab]    = useState('igenyek');
  const [reviewTrip,   setReviewTrip]   = useState<ExtraTrip|null>(null);
  const [optimizing,   setOptimizing]   = useState<ExtraTrip|null>(null);
  const [currentProposal, setCurrentProposal] = useState<SchedulerProposal|null>(null);
  const [expanded,     setExpanded]     = useState<string|null>(null);
  const [rejectTarget, setRejectTarget] = useState<SchedulerProposal|null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingTrips      = extraTrips.filter(t=>(t.status==='Igény beérkezett'||t.status==='Tervezés alatt')&&!proposals.some(p=>p.trip_id===t.id&&p.status!=='elutasított'));
  const waitingTrips      = extraTrips.filter(t=>t.status==='Visszaigazolva'||t.status==='Aktív');
  const pendingProposals  = proposals.filter(p=>p.status==='javaslat');
  const approvedProposals = proposals.filter(p=>p.status==='jóváhagyott'||p.status==='módosított');
  const rejectedProposals = proposals.filter(p=>p.status==='elutasított');

  const handleOpenReview = (trip:ExtraTrip) => {
    setReviewTrip(trip); setOptimizing(null); setCurrentProposal(null);
    setActiveTab('optimalizalas');
  };

  const handleStartOptimization = () => {
    if(!reviewTrip) return;
    const avDriver  = drivers.find(d=>d.available&&d.efos_registered)??drivers[0];
    const avVehicle = vehicles.find(v=>v.status==='aktív'&&v.category===reviewTrip.vehicle_category&&v.efos_active)??vehicles[0];
    const newP: SchedulerProposal = {
      id:`p${Date.now()}`, trip_id:reviewTrip.id,
      trip_name:`${reviewTrip.client_name} – ${reviewTrip.start_time}`,
      client_name:reviewTrip.client_name,
      start_time:reviewTrip.start_time, end_time:reviewTrip.end_time??reviewTrip.start_time,
      suggested_vehicle_id:avVehicle.id, suggested_driver_id:avDriver.id,
      status:'javaslat', created_at:new Date().toLocaleString('hu-HU'),
      score:Math.floor(Math.random()*12)+84,
    };
    setProposals(prev=>[newP,...prev]);
    setCurrentProposal(newP);
    setOptimizing(reviewTrip);
    setReviewTrip(null);
  };

  // Jóváhagyás/elutasítás az eredmény nézetből
  const handleResultDecision = (p: SchedulerProposal) => {
    if (p.status === 'elutasított') {
      setRejectTarget(p);
    } else {
      setProposals(prev=>prev.map(x=>x.id===p.id?{...x,status:'jóváhagyott'}:x));
      setCurrentProposal(prev=>prev?{...prev,status:'jóváhagyott'}:null);
      toast.success(`Jóváhagyva: ${p.trip_name}`);
    }
  };

  const handleApprove = (p:SchedulerProposal) => {
    setProposals(prev=>prev.map(x=>x.id===p.id?{...x,status:'jóváhagyott'}:x));
    toast.success(`Jóváhagyva: ${p.trip_name}`);
  };
  const handleApproveAll = () => {
    setProposals(prev=>prev.map(p=>p.status==='javaslat'?{...p,status:'jóváhagyott'}:p));
    toast.success(`${pendingProposals.length} javaslat jóváhagyva!`);
  };
  const handleReject = () => {
    if(!rejectTarget||!rejectReason.trim()) return;
    setProposals(prev=>prev.map(x=>x.id===rejectTarget.id?{...x,status:'elutasított',reason:rejectReason}:x));
    if(currentProposal?.id===rejectTarget.id) setCurrentProposal(prev=>prev?{...prev,status:'elutasított',reason:rejectReason}:null);
    toast.error(`Elutasítva: ${rejectTarget.trip_name}`);
    setRejectTarget(null); setRejectReason('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Ütemezőmotor" description="AI-alapú beosztástervezés – igénytől a jóváhagyott beosztásig"
        actions={activeTab==='javaslatok'&&pendingProposals.length>0?(
          <Button onClick={handleApproveAll}><CheckCircle2 className="w-4 h-4 mr-2"/>Mind jóváhagyása ({pendingProposals.length})</Button>
        ):undefined}/>

      <div className="page-content space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:'Ütemezendő',value:pendingTrips.length,      icon:Clock,        bg:'bg-slate-50', text:'text-slate-700'},
            {label:'Döntésre vár',value:pendingProposals.length, icon:Cpu,          bg:'bg-amber-50', text:'text-amber-700'},
            {label:'Jóváhagyott',value:approvedProposals.length, icon:CheckCircle2, bg:'bg-green-50', text:'text-green-700'},
            {label:'Visszaigazolt',value:waitingTrips.length,    icon:Route,        bg:'bg-blue-50',  text:'text-blue-700'},
          ].map(k=>(
            <Card key={k.label} className="border-0 shadow-sm">
              <CardContent className={`p-4 flex items-center gap-3 rounded-xl ${k.bg}`}>
                <k.icon className={`w-5 h-5 ${k.text} flex-shrink-0`}/>
                <div><p className={`text-xl font-bold ${k.text}`}>{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={v=>{setActiveTab(v);if(v==='igenyek'){setReviewTrip(null);setOptimizing(null);setCurrentProposal(null);}}}>
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="igenyek" className="flex items-center gap-1.5">
              <Clock className="w-4 h-4"/>Igények
              {pendingTrips.length>0&&<Badge className="bg-slate-700 text-white text-[10px] px-1.5 ml-0.5">{pendingTrips.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="optimalizalas" className="flex items-center gap-1.5">
              <Eye className="w-4 h-4"/>Előnézet & Optimalizálás
            </TabsTrigger>
            <TabsTrigger value="javaslatok" className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4"/>Javaslatok
              {pendingProposals.length>0&&<Badge variant="destructive" className="text-[10px] px-1.5 ml-0.5">{pendingProposals.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 */}
          <TabsContent value="igenyek" className="mt-4 space-y-4">
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600"/>Ütemezésre váró igények
              <Badge variant="outline" className="ml-auto">{pendingTrips.length} db</Badge>
            </CardTitle></CardHeader><CardContent className="space-y-3">
              {pendingTrips.length===0?(
                <div className="text-center py-8"><CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2"/><p className="font-medium text-green-700">Minden igény ütemezve</p></div>
              ):pendingTrips.map(trip=>(
                <div key={trip.id} className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{trip.client_name}</span>
                      <Badge className={`text-[10px] ${TRIP_STATUS_CLS[trip.status]??''}`} variant="outline">{trip.status}</Badge>
                      {trip.is_return&&<Badge variant="outline" className="text-[10px]">Oda-vissza</Badge>}
                      {trip.is_recurring&&<Badge variant="outline" className="text-[10px]">↺ Visszatérő</Badge>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 text-green-600 flex-shrink-0"/><span className="truncate">{trip.start_stop_name}</span>
                      <ArrowRight className="w-3 h-3 flex-shrink-0"/>
                      <MapPin className="w-3 h-3 text-red-500 flex-shrink-0"/><span className="truncate">{trip.end_stop_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{trip.start_time}</span>
                      <span>{trip.passengers} utas · {trip.vehicle_category}</span>
                    </div>
                    {trip.notes&&<p className="text-xs text-amber-700 mt-1 bg-amber-50 px-2 py-1 rounded">📝 {trip.notes}</p>}
                  </div>
                  <Button size="sm" onClick={()=>handleOpenReview(trip)} className="flex-shrink-0">
                    <Eye className="w-3.5 h-3.5 mr-1.5"/>Megtekintés
                  </Button>
                </div>
              ))}
            </CardContent></Card>

            {waitingTrips.length>0&&(
              <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600"/>Visszaigazolt járatok
                <Badge variant="outline" className="ml-auto bg-green-50 text-green-700">{waitingTrips.length} db</Badge>
              </CardTitle></CardHeader><CardContent className="space-y-2">
                {waitingTrips.map(trip=>{
                  const v=vehicles.find(v2=>v2.id===trip.assigned_vehicle_id);
                  const d=drivers.find(d2=>d2.id===trip.assigned_driver_id);
                  return(
                    <div key={trip.id} className="flex items-center gap-3 p-3 rounded-lg border bg-green-50/30 border-green-100 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{trip.client_name}</span>
                        <span className="text-muted-foreground text-xs ml-2">{trip.start_time}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">{v&&`🚌 ${v.plate}`}{d&&` · 👤 ${d.name}`}</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-[10px]" variant="outline">{trip.status}</Badge>
                    </div>
                  );
                })}
              </CardContent></Card>
            )}
          </TabsContent>

          {/* TAB 2 */}
          <TabsContent value="optimalizalas" className="mt-4">
            {reviewTrip&&!optimizing&&(
              <Card><CardContent className="pt-4">
                <TripReviewPanel trip={reviewTrip} onStart={handleStartOptimization} onBack={()=>{setReviewTrip(null);setActiveTab('igenyek');}}/>
              </CardContent></Card>
            )}
            {optimizing&&currentProposal&&(
              <Card><CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary animate-spin"/>
                  {currentProposal.status!=='javaslat'?'Eredmény':'Optimalizálás: '+optimizing.client_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{optimizing.start_stop_name} → {optimizing.end_stop_name} · {optimizing.start_time}</p>
              </CardHeader><CardContent>
                <OptimizerView trip={optimizing} proposal={currentProposal.status!=='javaslat'?null:currentProposal} onDone={handleResultDecision}/>
                {/* Az eredmény panel manuálisan is megjelenik ha az animáció végzett */}
                {currentProposal.status==='javaslat'&&(
                  <OptimizerView key="result" trip={optimizing} proposal={currentProposal} onDone={handleResultDecision}/>
                )}
              </CardContent></Card>
            )}
            {!reviewTrip&&!optimizing&&(
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground"/>
                </div>
                <p className="font-semibold text-lg">Válassz igényt az Igények fülről</p>
                <p className="text-muted-foreground mt-1 text-sm">Kattints a „Megtekintés" gombra egy igénynél.</p>
                <Button variant="outline" className="mt-4" onClick={()=>setActiveTab('igenyek')}>
                  <ArrowRight className="w-4 h-4 mr-2"/>Ugrás az igényekhez
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TAB 3 */}
          <TabsContent value="javaslatok" className="mt-4 space-y-4">
            {pendingProposals.length>0&&(<Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500"/>Döntésre váró javaslatok<Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200">{pendingProposals.length} db</Badge></CardTitle></CardHeader><CardContent className="space-y-2">{pendingProposals.map(p=><ProposalCard key={p.id} p={p} onApprove={handleApprove} onReject={setRejectTarget} expanded={expanded===p.id} onToggle={()=>setExpanded(expanded===p.id?null:p.id)}/>)}</CardContent></Card>)}
            {approvedProposals.length>0&&(<Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/>Jóváhagyott beosztás<Badge className="ml-auto bg-green-50 text-green-700">{approvedProposals.length} db</Badge></CardTitle></CardHeader><CardContent className="space-y-2">{approvedProposals.map(p=><ProposalCard key={p.id} p={p} onApprove={handleApprove} onReject={setRejectTarget} expanded={expanded===p.id} onToggle={()=>setExpanded(expanded===p.id?null:p.id)}/>)}</CardContent></Card>)}
            {rejectedProposals.length>0&&(<Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500"/>Elutasított javaslatok<Badge variant="outline" className="ml-auto">{rejectedProposals.length} db</Badge></CardTitle></CardHeader><CardContent className="space-y-2">{rejectedProposals.map(p=><ProposalCard key={p.id} p={p} onApprove={handleApprove} onReject={setRejectTarget} expanded={expanded===p.id} onToggle={()=>setExpanded(expanded===p.id?null:p.id)}/>)}</CardContent></Card>)}
            {proposals.length===0&&(<div className="text-center py-16 text-muted-foreground"><Shuffle className="w-10 h-10 mx-auto mb-2 opacity-40"/><p>Még nincs javaslat. Indítsd el az ütemezőt az Igények fülről.</p></div>)}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={()=>{setRejectTarget(null);setRejectReason('');}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Javaslat elutasítása</DialogTitle></DialogHeader>
          {rejectTarget&&(
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted text-sm"><p className="font-medium">{rejectTarget.trip_name}</p><p className="text-muted-foreground">{rejectTarget.client_name}</p></div>
              <div className="space-y-2"><Label>Indoklás (kötelező)</Label>
                <Textarea placeholder="Pl.: Más sofőrt kérek, mert..." rows={3} value={rejectReason} onChange={e=>setRejectReason(e.target.value)}/>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>{setRejectTarget(null);setRejectReason('');}}>Mégse</Button>
                <Button variant="destructive" disabled={!rejectReason.trim()} onClick={handleReject}><XCircle className="w-4 h-4 mr-1"/>Elutasítás</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
