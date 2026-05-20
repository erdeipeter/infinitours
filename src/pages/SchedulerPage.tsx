import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  extraTrips, schedulerProposals as initialProposals,
  vehicles, drivers, stops,
} from '@/data/mockData';
import { SchedulerProposal, ProposalStatus, ExtraTrip, TripStatus } from '@/types';
import {
  Cpu, CheckCircle2, XCircle, Clock, Bus, User,
  Star, ChevronDown, ChevronUp, Play, ArrowRight,
  MapPin, Shuffle, Route, AlertTriangle, Zap,
  BarChart3, Navigation, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

// ── Státusz stílusok ─────────────────────────────────────────────────────────
const STATUS_STYLE: Record<ProposalStatus, { label: string; cls: string }> = {
  javaslat:    { label: 'Javaslat',    cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  jóváhagyott: { label: 'Jóváhagyott', cls: 'bg-green-100 text-green-800 border-green-300' },
  módosított:  { label: 'Módosított',  cls: 'bg-blue-100 text-blue-800 border-blue-300'   },
  elutasított: { label: 'Elutasított', cls: 'bg-red-100 text-red-800 border-red-300'      },
};

const TRIP_STATUS_CLS: Partial<Record<TripStatus, string>> = {
  'Igény beérkezett': 'bg-slate-100 text-slate-700',
  'Tervezés alatt':   'bg-amber-100 text-amber-800',
  'Visszaigazolva':   'bg-blue-100 text-blue-800',
  'Aktív':            'bg-green-100 text-green-800',
};

// ── Optimalizálási lépések ───────────────────────────────────────────────────
interface OptStep {
  id: string;
  label: string;
  detail: string;
  icon: React.ElementType;
  durationMs: number;
  result?: string;
}

const buildSteps = (trip: ExtraTrip): OptStep[] => [
  { id: 's1', label: 'Igény elemzése',           icon: BarChart3,   durationMs: 600,  detail: `${trip.passengers} utas, ${trip.vehicle_category}, ${trip.start_time}`,        result: 'Igény értelmezve ✓' },
  { id: 's2', label: 'Szabad járművek szűrése',  icon: Bus,         durationMs: 900,  detail: 'Kapacitás, kategória és elérhetőség ellenőrzése...',                             result: `${vehicles.filter(v => v.status === 'aktív').length} aktív jármű megfelel` },
  { id: 's3', label: 'Sofőr elérhetőség',        icon: User,        durationMs: 700,  detail: 'Munkaidő, AETR pihenőidő és E-FOS bejelentés ellenőrzése...',                   result: `${drivers.filter(d => d.available && d.efos_registered).length} sofőr elérhető` },
  { id: 's4', label: 'Ütközésvizsgálat',         icon: AlertTriangle, durationMs: 800, detail: 'Párhuzamos járatok, lejárt jogosítvány, munkaidő-korlát...',                   result: '2 ütközés kiszűrve' },
  { id: 's5', label: 'Útvonal-optimalizálás',    icon: Route,       durationMs: 1200, detail: 'Megállók sorrendjének optimalizálása, takarékos útvonal számítása...',           result: 'Optimális sorrend: -18% km' },
  { id: 's6', label: 'Párosítás értékelése',     icon: Star,        durationMs: 600,  detail: 'Sofőr–jármű párok pontszámozása (pontosság, kihasználtság, túlóra-kockázat)...', result: 'Legjobb páros: 94 pont' },
  { id: 's7', label: 'Javaslat generálva',       icon: Zap,         durationMs: 400,  detail: 'Beosztási javaslat elkészítve műszakvezető jóváhagyásra vár.',                  result: 'Kész ✓' },
];

// ── Útvonal-optimalizáló vizualizáció ────────────────────────────────────────
const DEMO_STOPS_UNOPT = [
  { name: 'Esztergom, Gyárkapu',       km: 0,  x: 320, y: 60  },
  { name: 'Esztergom, Vasútállomás',   km: 12, x: 80,  y: 80  },
  { name: 'Esztergom, Városháza',      km: 8,  x: 160, y: 150 },
  { name: 'Esztergom, Piac tér',       km: 6,  x: 240, y: 110 },
];
const DEMO_STOPS_OPT = [
  { name: 'Esztergom, Vasútállomás',   km: 0,  x: 80,  y: 80  },
  { name: 'Esztergom, Városháza',      km: 3,  x: 160, y: 150 },
  { name: 'Esztergom, Piac tér',       km: 2,  x: 240, y: 110 },
  { name: 'Esztergom, Gyárkapu',       km: 4,  x: 320, y: 60  },
];

function RouteViz({ stops: s, color, label, totalKm }: {
  stops: typeof DEMO_STOPS_UNOPT; color: string; label: string; totalKm: number;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color === '#ef4444' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {totalKm} km
        </span>
      </div>
      <svg viewBox="0 0 400 220" className="w-full" style={{ height: 140 }}>
        <defs>
          <marker id={`arr-${color.slice(1)}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={color} />
          </marker>
        </defs>
        {/* Vonalak */}
        {s.slice(0, -1).map((st, i) => (
          <line key={i}
            x1={st.x} y1={st.y} x2={s[i + 1].x} y2={s[i + 1].y}
            stroke={color} strokeWidth="2.5" strokeDasharray={color === '#ef4444' ? '6 3' : ''}
            markerEnd={`url(#arr-${color.slice(1)})`}
            opacity="0.8"
          />
        ))}
        {/* Pontok */}
        {s.map((st, i) => (
          <g key={i}>
            <circle cx={st.x} cy={st.y} r={i === 0 ? 10 : i === s.length - 1 ? 10 : 7}
              fill={i === 0 ? '#22c55e' : i === s.length - 1 ? '#ef4444' : color} stroke="white" strokeWidth="2" />
            <text x={st.x} y={st.y - 14} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">
              {st.name.split(',')[1]?.trim() ?? st.name}
            </text>
            <text x={st.x} y={st.y + 4} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">{i + 1}</text>
          </g>
        ))}
      </svg>
      <div className="flex gap-1 mt-1 flex-wrap">
        {s.map((st, i) => (
          <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
              style={{ background: color }}>{i + 1}</span>
            <span className="truncate max-w-[90px]">{st.name.split(',')[1]?.trim()}</span>
            {i < s.length - 1 && <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Optimalizáló animáció ─────────────────────────────────────────────────────
function OptimizerAnimation({ trip, onDone }: { trip: ExtraTrip; onDone: () => void }) {
  const steps = buildSteps(trip);
  const [currentStep, setCurrentStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<string[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let idx = 0;
    const runStep = () => {
      if (idx >= steps.length) { setFinished(true); setTimeout(onDone, 800); return; }
      setCurrentStep(idx);
      if (steps[idx].id === 's5') setShowRoute(true);
      timerRef.current = setTimeout(() => {
        setDoneSteps(prev => [...prev, steps[idx].id]);
        idx++;
        timerRef.current = setTimeout(runStep, 120);
      }, steps[idx].durationMs);
    };
    timerRef.current = setTimeout(runStep, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const progress = Math.round(((doneSteps.length) / steps.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Optimalizálás folyamatban...</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Lépések */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isDone    = doneSteps.includes(step.id);
          const isCurrent = currentStep === idx && !isDone;
          const Icon = step.icon;
          return (
            <div key={step.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
              isDone    ? 'bg-green-50 border-green-200' :
              isCurrent ? 'bg-blue-50 border-blue-300 shadow-sm' :
              'bg-gray-50/50 border-transparent opacity-40'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 text-white" />
                  : isCurrent
                    ? <Icon className="w-4 h-4 text-white animate-pulse" />
                    : <Icon className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDone ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                  {isDone && step.result && (
                    <span className="text-xs text-green-600 ml-auto">{step.result}</span>
                  )}
                </div>
                {(isCurrent || isDone) && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Útvonal vizualizáció */}
      {showRoute && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              Útvonal-optimalizálás eredménye
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-col md:flex-row">
              <RouteViz stops={DEMO_STOPS_UNOPT} color="#ef4444" label="Eredeti sorrend" totalKm={26} />
              <div className="flex items-center justify-center flex-shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="w-6 h-6 text-green-600" />
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">-18% km</span>
                </div>
              </div>
              <RouteViz stops={DEMO_STOPS_OPT}  color="#22c55e" label="Optimalizált sorrend" totalKm={9} />
            </div>
          </CardContent>
        </Card>
      )}

      {finished && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Optimalizálás kész!</p>
            <p className="text-sm text-green-600">Beosztási javaslat generálva – átváltás a Javaslatok tabra...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Proposal kártya ──────────────────────────────────────────────────────────
function ProposalCard({
  p, onApprove, onReject, expanded, onToggle,
}: {
  p: SchedulerProposal;
  onApprove: (p: SchedulerProposal) => void;
  onReject:  (p: SchedulerProposal) => void;
  expanded:  boolean;
  onToggle:  () => void;
}) {
  const vehicle = vehicles.find(v => v.id === p.suggested_vehicle_id);
  const driver  = drivers.find(d => d.id === p.suggested_driver_id);
  const s = STATUS_STYLE[p.status];

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      p.status === 'javaslat'    ? 'border-amber-200 bg-amber-50/30' :
      p.status === 'jóváhagyott' ? 'border-green-200 bg-green-50/30' :
      p.status === 'elutasított' ? 'border-red-200 bg-red-50/20 opacity-75' :
      'border-blue-200 bg-blue-50/20'
    }`}>
      <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={onToggle}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          p.status === 'javaslat' ? 'bg-amber-100' : p.status === 'jóváhagyott' ? 'bg-green-100' :
          p.status === 'elutasított' ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          {p.status === 'jóváhagyott' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
           p.status === 'elutasított' ? <XCircle     className="w-5 h-5 text-red-600"   /> :
           p.status === 'módosított'  ? <AlertTriangle className="w-5 h-5 text-blue-600"/> :
           <Cpu className="w-5 h-5 text-amber-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{p.trip_name}</span>
            <Badge className={`text-[10px] border ${s.cls}`} variant="outline">{s.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{p.client_name}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.start_time.split(' ')[1]} – {p.end_time.split(' ')[1]}</span>
            {vehicle && <span className="flex items-center gap-1"><Bus  className="w-3 h-3" />{vehicle.plate}</span>}
            {driver  && <span className="flex items-center gap-1"><User className="w-3 h-3" />{driver.name}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500" />
            <span className={`text-xs font-bold ${p.score >= 90 ? 'text-green-600' : p.score >= 75 ? 'text-amber-600' : 'text-red-600'}`}>{p.score}</span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-white/60">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Bus className="w-3 h-3" />Javasolt jármű</p>
              {vehicle ? <>
                <p className="font-medium">{vehicle.plate}</p>
                <p className="text-xs text-muted-foreground">{vehicle.seats} fő · {vehicle.category}</p>
                {!vehicle.efos_active && <Badge variant="destructive" className="text-[10px] mt-1">E-FOS hiányzik ⚠</Badge>}
              </> : <p className="text-muted-foreground">–</p>}
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><User className="w-3 h-3" />Javasolt sofőr</p>
              {driver ? <>
                <p className="font-medium">{driver.name}</p>
                <p className="text-xs text-muted-foreground">{driver.accuracy_percent}% pontosság</p>
                {!driver.available && <Badge variant="destructive" className="text-[10px] mt-1">Nem elérhető ⚠</Badge>}
              </> : <p className="text-muted-foreground">–</p>}
            </div>
          </div>
          {/* Score breakdown */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Pontszám bontása</p>
            {[
              { label: 'Sofőr pontosság',         val: driver  ? Math.round(driver.accuracy_percent * 0.4)  : 0, max: 40 },
              { label: 'Jármű kihasználtság',     val: vehicle ? Math.round((vehicle.seats > 20 ? 28 : 20)) : 0, max: 30 },
              { label: 'Túlóra-kockázat (alacsony = jó)', val: 15, max: 20 },
              { label: 'Ütközésmentesség',        val: 10, max: 10 },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <span className="w-36 text-muted-foreground">{r.label}</span>
                <Progress value={(r.val / r.max) * 100} className="h-1.5 flex-1" />
                <span className="w-8 text-right font-mono">{r.val}/{r.max}</span>
              </div>
            ))}
          </div>
          {p.reason && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Indoklás</p>
              <p className="text-red-800">{p.reason}</p>
            </div>
          )}
          {p.status === 'javaslat' && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => onApprove(p)}>
                <CheckCircle2 className="w-4 h-4 mr-1" />Jóváhagyás
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-red-700 border-red-300 hover:bg-red-50" onClick={() => onReject(p)}>
                <XCircle className="w-4 h-4 mr-1" />Elutasítás
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function SchedulerPage() {
  const { currentUser } = useAuth();
  const [proposals, setProposals]     = useState<SchedulerProposal[]>(initialProposals);
  const [activeTab, setActiveTab]     = useState('igenyek');
  const [optimizing, setOptimizing]   = useState<ExtraTrip | null>(null);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SchedulerProposal | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Ütemezendő igények: amelyekhez még nincs javaslat vagy jármű nincs hozzárendelve
  const pendingTrips = extraTrips.filter(t =>
    (t.status === 'Igény beérkezett' || t.status === 'Tervezés alatt') &&
    !proposals.some(p => p.trip_id === t.id && p.status !== 'elutasított')
  );
  const waitingTrips = extraTrips.filter(t =>
    t.status === 'Visszaigazolva' || t.status === 'Aktív'
  );

  const pendingProposals  = proposals.filter(p => p.status === 'javaslat');
  const approvedProposals = proposals.filter(p => p.status === 'jóváhagyott' || p.status === 'módosított');
  const rejectedProposals = proposals.filter(p => p.status === 'elutasított');

  const handleStartOptimization = (trip: ExtraTrip) => {
    setOptimizing(trip);
    setActiveTab('optimalizalas');
  };

  const handleOptimizationDone = () => {
    if (!optimizing) return;
    // Új javaslat generálása
    const avDriver  = drivers.find(d => d.available && d.efos_registered) ?? drivers[0];
    const avVehicle = vehicles.find(v => v.status === 'aktív' && v.efos_active) ?? vehicles[0];
    const newProposal: SchedulerProposal = {
      id:   `p${Date.now()}`,
      trip_id:     optimizing.id,
      trip_name:   `${optimizing.client_name} – ${optimizing.start_time}`,
      client_name: optimizing.client_name,
      start_time:  optimizing.start_time,
      end_time:    optimizing.end_time ?? optimizing.start_time,
      suggested_vehicle_id: avVehicle.id,
      suggested_driver_id:  avDriver.id,
      status:      'javaslat',
      created_at:  new Date().toLocaleString('hu-HU'),
      score:       Math.floor(Math.random() * 15) + 82,
    };
    setProposals(prev => [newProposal, ...prev]);
    toast.success('Javaslat generálva! Átváltás jóváhagyásra...');
    setTimeout(() => { setActiveTab('javaslatok'); setOptimizing(null); }, 1200);
  };

  const handleApprove = (p: SchedulerProposal) => {
    setProposals(prev => prev.map(x => x.id === p.id ? { ...x, status: 'jóváhagyott' } : x));
    toast.success(`Jóváhagyva: ${p.trip_name}`);
  };

  const handleApproveAll = () => {
    setProposals(prev => prev.map(p => p.status === 'javaslat' ? { ...p, status: 'jóváhagyott' } : p));
    toast.success(`${pendingProposals.length} javaslat jóváhagyva!`);
  };

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setProposals(prev => prev.map(x => x.id === rejectTarget.id
      ? { ...x, status: 'elutasított', reason: rejectReason } : x));
    toast.error(`Elutasítva: ${rejectTarget.trip_name}`);
    setRejectTarget(null); setRejectReason('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ütemezőmotor"
        description={`AI-alapú beosztástervezés · ${new Date().toLocaleDateString('hu-HU', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        actions={
          activeTab === 'javaslatok' && pendingProposals.length > 0 ? (
            <Button onClick={handleApproveAll}>
              <CheckCircle2 className="w-4 h-4 mr-2" />Mind jóváhagyása ({pendingProposals.length})
            </Button>
          ) : undefined
        }
      />

      <div className="page-content space-y-4">
        {/* KPI sáv */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Ütemezendő igény',  value: pendingTrips.length,      icon: Clock,        bg: 'bg-slate-50',  text: 'text-slate-700'  },
            { label: 'Döntésre vár',      value: pendingProposals.length,  icon: Cpu,          bg: 'bg-amber-50',  text: 'text-amber-700'  },
            { label: 'Jóváhagyott',       value: approvedProposals.length, icon: CheckCircle2, bg: 'bg-green-50',  text: 'text-green-700'  },
            { label: 'Visszaigazolt járat', value: waitingTrips.length,    icon: Route,        bg: 'bg-blue-50',   text: 'text-blue-700'   },
          ].map(k => (
            <Card key={k.label} className="border-0 shadow-sm">
              <CardContent className={`p-4 flex items-center gap-3 rounded-xl ${k.bg}`}>
                <k.icon className={`w-5 h-5 ${k.text} flex-shrink-0`} />
                <div>
                  <p className={`text-xl font-bold ${k.text}`}>{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="igenyek" className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />Igények
              {pendingTrips.length > 0 && (
                <Badge className="bg-slate-700 text-white text-[10px] px-1.5 ml-0.5">{pendingTrips.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="optimalizalas" className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />Optimalizálás
            </TabsTrigger>
            <TabsTrigger value="javaslatok" className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />Javaslatok
              {pendingProposals.length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 ml-0.5">{pendingProposals.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Igények ── */}
          <TabsContent value="igenyek" className="mt-4 space-y-4">
            {/* Ütemezendők */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  Ütemezésre váró igények
                  <Badge variant="outline" className="ml-auto">{pendingTrips.length} db</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingTrips.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-700">Minden igény ütemezve</p>
                    <p className="text-sm text-muted-foreground">Nincs ütemezésre váró járat.</p>
                  </div>
                ) : pendingTrips.map(trip => (
                  <div key={trip.id} className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{trip.client_name}</span>
                        <Badge className={`text-[10px] ${TRIP_STATUS_CLS[trip.status] ?? ''}`} variant="outline">{trip.status}</Badge>
                        {trip.is_return && <Badge variant="outline" className="text-[10px]">Oda-vissza</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{trip.start_stop_name}</span>
                        <ArrowRight className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{trip.end_stop_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{trip.start_time}</span>
                        <span>{trip.passengers} utas · {trip.vehicle_category}</span>
                      </div>
                      {trip.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">📝 {trip.notes}</p>
                      )}
                    </div>
                    <Button size="sm" onClick={() => handleStartOptimization(trip)}
                      className="flex-shrink-0 bg-primary hover:bg-primary/90">
                      <Play className="w-3.5 h-3.5 mr-1.5" />Ütemezés
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Visszaigazolt járatok */}
            {waitingTrips.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Már ütemezett, visszaigazolt járatok
                    <Badge variant="outline" className="ml-auto bg-green-50 text-green-700">{waitingTrips.length} db</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {waitingTrips.map(trip => {
                    const v = vehicles.find(v2 => v2.id === trip.assigned_vehicle_id);
                    const d = drivers.find(d2 => d2.id === trip.assigned_driver_id);
                    return (
                      <div key={trip.id} className="flex items-center gap-3 p-3 rounded-lg border bg-green-50/30 border-green-100 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{trip.client_name}</span>
                          <span className="text-muted-foreground text-xs ml-2">{trip.start_time}</span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {v && `🚌 ${v.plate}`}{d && ` · 👤 ${d.name}`}
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-[10px]" variant="outline">{trip.status}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4" />Hogyan működik az ütemező?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                  {[
                    ['1. Igény elemzése',       'Utasszám, kategória, időpont, útvonal'],
                    ['2. Jármű-szűrés',         'Kapacitás, elérhetőség, E-FOS státusz'],
                    ['3. Sofőr-szűrés',         'AETR pihenőidő, munkaidő, jogosítvány'],
                    ['4. Ütközésvizsgálat',     'Párhuzamos járatok automatikus kiszűrése'],
                    ['5. Útvonal-optimalizálás','Megálló sorrend legrövidebb út szerint'],
                    ['6. Párosítás & pontszám', 'Legjobb sofőr–jármű pár kiválasztása'],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-2">
                      <span className="font-semibold flex-shrink-0">{title}:</span>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Optimalizálás ── */}
          <TabsContent value="optimalizalas" className="mt-4">
            {optimizing ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary animate-spin" />
                    Optimalizálás: {optimizing.client_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {optimizing.start_stop_name} → {optimizing.end_stop_name} · {optimizing.start_time}
                  </p>
                </CardHeader>
                <CardContent>
                  <OptimizerAnimation trip={optimizing} onDone={handleOptimizationDone} />
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Cpu className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-lg">Nincs futó optimalizálás</p>
                <p className="text-muted-foreground mt-1 text-sm">Az Igények tabról indítsd el az ütemezőt egy igényre kattintva.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab('igenyek')}>
                  <ArrowRight className="w-4 h-4 mr-2" />Ugrás az igényekhez
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── Tab 3: Javaslatok ── */}
          <TabsContent value="javaslatok" className="mt-4 space-y-4">
            {pendingProposals.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />Döntésre váró javaslatok
                    <Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200">{pendingProposals.length} db</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingProposals.map(p => (
                    <ProposalCard key={p.id} p={p}
                      onApprove={handleApprove} onReject={setRejectTarget}
                      expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
                  ))}
                </CardContent>
              </Card>
            )}
            {approvedProposals.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />Jóváhagyott beosztás
                    <Badge className="ml-auto bg-green-50 text-green-700">{approvedProposals.length} db</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {approvedProposals.map(p => (
                    <ProposalCard key={p.id} p={p}
                      onApprove={handleApprove} onReject={setRejectTarget}
                      expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
                  ))}
                </CardContent>
              </Card>
            )}
            {rejectedProposals.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />Elutasított javaslatok
                    <Badge variant="outline" className="ml-auto">{rejectedProposals.length} db</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rejectedProposals.map(p => (
                    <ProposalCard key={p.id} p={p}
                      onApprove={handleApprove} onReject={setRejectTarget}
                      expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
                  ))}
                </CardContent>
              </Card>
            )}
            {proposals.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Shuffle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>Még nincs javaslat. Indítsd el az ütemezőt az Igények tabról.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Elutasítás modal */}
      <Dialog open={!!rejectTarget} onOpenChange={() => { setRejectTarget(null); setRejectReason(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Javaslat elutasítása</DialogTitle></DialogHeader>
          {rejectTarget && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium">{rejectTarget.trip_name}</p>
                <p className="text-muted-foreground">{rejectTarget.client_name}</p>
              </div>
              <div className="space-y-2">
                <Label>Indoklás (kötelező)</Label>
                <Textarea placeholder="Pl.: Más sofőrt kérek, mert..." rows={3}
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(''); }}>Mégse</Button>
                <Button variant="destructive" disabled={!rejectReason.trim()} onClick={handleReject}>
                  <XCircle className="w-4 h-4 mr-1" />Elutasítás
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
