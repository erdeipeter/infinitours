import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { schedulerProposals as initial, vehicles, drivers } from '@/data/mockData';
import { SchedulerProposal, ProposalStatus } from '@/types';
import {
  Cpu, CheckCircle2, XCircle, AlertTriangle, Clock, Bus, User,
  Star, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

const STATUS_STYLE: Record<ProposalStatus, { label: string; cls: string }> = {
  javaslat:     { label: 'Javaslat',     cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  jóváhagyott:  { label: 'Jóváhagyott',  cls: 'bg-green-100 text-green-800 border-green-300' },
  módosított:   { label: 'Módosított',   cls: 'bg-blue-100 text-blue-800 border-blue-300'   },
  elutasított:  { label: 'Elutasított',  cls: 'bg-red-100 text-red-800 border-red-300'      },
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <Progress value={score} className="h-2 flex-1" />
      <span className={`text-xs font-bold w-8 text-right ${score >= 90 ? 'text-green-600' : score >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
        {score}
      </span>
    </div>
  );
}

export default function SchedulerPage() {
  const [proposals, setProposals] = useState<SchedulerProposal[]>(initial);
  const [rejectTarget, setRejectTarget] = useState<SchedulerProposal | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const pending    = proposals.filter(p => p.status === 'javaslat');
  const approved   = proposals.filter(p => p.status === 'jóváhagyott' || p.status === 'módosított');
  const rejected   = proposals.filter(p => p.status === 'elutasított');

  const handleApprove = (p: SchedulerProposal) => {
    setProposals(prev => prev.map(x => x.id === p.id ? { ...x, status: 'jóváhagyott' } : x));
    toast.success(`Javaslat jóváhagyva: ${p.trip_name}`);
  };

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setProposals(prev => prev.map(x => x.id === rejectTarget.id
      ? { ...x, status: 'elutasított', reason: rejectReason }
      : x
    ));
    toast.error(`Javaslat elutasítva: ${rejectTarget.trip_name}`);
    setRejectTarget(null);
    setRejectReason('');
  };

  const handleApproveAll = () => {
    setProposals(prev => prev.map(p => p.status === 'javaslat' ? { ...p, status: 'jóváhagyott' } : p));
    toast.success(`${pending.length} javaslat jóváhagyva!`);
  };

  function ProposalCard({ p }: { p: SchedulerProposal }) {
    const vehicle = vehicles.find(v => v.id === p.suggested_vehicle_id);
    const driver  = drivers.find(d => d.id === p.suggested_driver_id);
    const isOpen  = expanded === p.id;
    const s = STATUS_STYLE[p.status];

    return (
      <div className={`rounded-xl border overflow-hidden transition-all ${
        p.status === 'javaslat' ? 'border-amber-200 bg-amber-50/30' :
        p.status === 'jóváhagyott' ? 'border-green-200 bg-green-50/30' :
        p.status === 'elutasított' ? 'border-red-200 bg-red-50/20 opacity-75' :
        'border-blue-200 bg-blue-50/20'
      }`}>
        <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(isOpen ? null : p.id)}>
          {/* Státusz ikon */}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            p.status === 'javaslat' ? 'bg-amber-100' : p.status === 'jóváhagyott' ? 'bg-green-100' :
            p.status === 'elutasított' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {p.status === 'jóváhagyott' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
             p.status === 'elutasított' ? <XCircle className="w-5 h-5 text-red-600" /> :
             p.status === 'módosított'  ? <AlertTriangle className="w-5 h-5 text-blue-600" /> :
             <Cpu className="w-5 h-5 text-amber-600" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{p.trip_name}</span>
              <Badge className={`text-[10px] border ${s.cls}`} variant="outline">{s.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{p.client_name}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.start_time} – {p.end_time.split(' ')[1]}</span>
              {vehicle && <span className="flex items-center gap-1"><Bus className="w-3 h-3" />{vehicle.plate}</span>}
              {driver  && <span className="flex items-center gap-1"><User className="w-3 h-3" />{driver.name}</span>}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold">{p.score}</span>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {isOpen && (
          <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-white/60">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Optimalizálási pontszám</p>
              <ScoreBar score={p.score} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Bus className="w-3 h-3" />Javasolt jármű</p>
                {vehicle ? (
                  <div>
                    <p className="font-medium">{vehicle.plate}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.seats} fő · {vehicle.category}</p>
                    {!vehicle.efos_active && <Badge variant="destructive" className="text-[10px] mt-1">E-FOS hiányzik ⚠</Badge>}
                  </div>
                ) : <p className="text-muted-foreground">–</p>}
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><User className="w-3 h-3" />Javasolt sofőr</p>
                {driver ? (
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.accuracy_percent}% pontosság</p>
                    {!driver.available && <Badge variant="destructive" className="text-[10px] mt-1">Nem elérhető ⚠</Badge>}
                    {!driver.efos_registered && <Badge variant="destructive" className="text-[10px] mt-1">E-FOS hiányzik ⚠</Badge>}
                  </div>
                ) : <p className="text-muted-foreground">–</p>}
              </div>
            </div>

            {p.reason && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm">
                <p className="text-xs text-muted-foreground mb-1">Elutasítás indoklása</p>
                <p className="text-red-800">{p.reason}</p>
              </div>
            )}

            {p.status === 'javaslat' && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => handleApprove(p)}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />Jóváhagyás
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-red-700 border-red-300 hover:bg-red-50"
                  onClick={() => setRejectTarget(p)}>
                  <XCircle className="w-4 h-4 mr-1" />Elutasítás
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Ütemezőmotor" description="AI által generált beosztási javaslatok – 2026.05.21."
        actions={
          pending.length > 0 ? (
            <Button onClick={handleApproveAll}>
              <CheckCircle2 className="w-4 h-4 mr-2" />Mind jóváhagyása ({pending.length})
            </Button>
          ) : undefined
        }
      />

      <div className="page-content space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Összes javaslat',  value: proposals.length,    icon: Cpu,          color: 'text-blue-600',  bg: 'bg-blue-50'  },
            { label: 'Döntésre vár',     value: pending.length,      icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Jóváhagyott',      value: approved.length,     icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Elutasított',      value: rejected.length,     icon: XCircle,      color: 'text-red-600',   bg: 'bg-red-50'   },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center`}>
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

        {/* Javaslatok szekció */}
        {pending.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Döntésre váró javaslatok
                <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-700 border-amber-200">{pending.length} db</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map(p => <ProposalCard key={p.id} p={p} />)}
            </CardContent>
          </Card>
        )}

        {/* Jóváhagyott */}
        {approved.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Jóváhagyott beosztás
                <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">{approved.length} db</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {approved.map(p => <ProposalCard key={p.id} p={p} />)}
            </CardContent>
          </Card>
        )}

        {/* Elutasított */}
        {rejected.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Elutasított javaslatok
                <Badge variant="outline" className="ml-auto">{rejected.length} db</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rejected.map(p => <ProposalCard key={p.id} p={p} />)}
            </CardContent>
          </Card>
        )}

        {/* Info box */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4 text-sm text-blue-800">
            <p className="font-semibold flex items-center gap-2 mb-1"><RefreshCw className="w-4 h-4" />Az ütemezőmotor működéséről</p>
            <p className="text-blue-700 text-xs">A rendszer a visszaigazolt járatmenetrend, a sofőr- és jármű-elérhetőség, valamint az AETR-szabályok alapján generálja a beosztási javaslatokat. A végső jóváhagyás minden esetben a műszakvezetőnél marad. A javaslatok optimalizálási pontszáma 0–100-ig terjed.</p>
          </CardContent>
        </Card>
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
                <Textarea placeholder="Pl.: Kerék Károly AETR-korlát miatt nem jöhet szóba..." rows={3}
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
