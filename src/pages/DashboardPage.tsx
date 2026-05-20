import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { getDashboardStats, vehicles, extraTrips, conflicts, schedulerProposals } from '@/data/mockData';
import {
  Bus, Route, AlertTriangle, Clock, TrendingUp, Cpu,
  CheckCircle2, XCircle, Wrench, Radio, AlertCircle, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const stats = getDashboardStats(currentUser?.role ?? '');
  const unresolvedConflicts = conflicts.filter(c => !c.resolved);
  const blockers = unresolvedConflicts.filter(c => c.severity === 'blocker');
  const pendingProposals = schedulerProposals.filter(p => p.status === 'javaslat');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Üdvözöljük, ${currentUser?.name?.split(' ')[0]}!`}
        description={`${currentUser?.role} · ${new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />
      <div className="page-content space-y-6">

        {/* Fő KPI-k */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Aktív járatok ma"     value={stats.activeTripsToday}        icon={Route}       trend={{ value: 8, label: 'vs tegnap', positive: true }} />
          <StatCard title="Aktív járművek"       value={stats.vehicleStatuses.active}  icon={Bus}         iconClassName="bg-success/10 text-success" />
          <StatCard title="Flottakihasználtság"  value={`${stats.fleetUtilization}%`}  icon={TrendingUp}  iconClassName="bg-accent/10 text-accent" />
          <StatCard title="Késések ma"           value={stats.delays.length}           icon={AlertTriangle} iconClassName="bg-warning/10 text-warning" />
        </div>

        {/* Alert sáv – ütközések és javaslatok */}
        {(blockers.length > 0 || pendingProposals.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blockers.length > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => navigate('/dispatcher')}>
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-800">{blockers.length} blokkoló ütközés</p>
                  <p className="text-sm text-red-600">Azonnali beavatkozás szükséges</p>
                </div>
                <Button size="sm" variant="destructive">Megtekintés</Button>
              </div>
            )}
            {pendingProposals.length > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => navigate('/scheduler')}>
                <Cpu className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">{pendingProposals.length} beosztási javaslat vár</p>
                  <p className="text-sm text-amber-600">Holnapi műszak ütemezőmotor javaslatai</p>
                </div>
                <Button size="sm" variant="outline" className="border-amber-300">Jóváhagyás</Button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Járműstátuszok */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bus className="w-5 h-5 text-primary" />Járműstátuszok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Aktív',    count: stats.vehicleStatuses.active,  icon: CheckCircle2, cls: 'text-success', barCls: '' },
                { label: 'Tartalék', count: stats.vehicleStatuses.reserve, icon: Clock,        cls: 'text-warning', barCls: '[&>div]:bg-warning' },
                { label: 'Inaktív',  count: stats.vehicleStatuses.inactive,icon: XCircle,      cls: 'text-muted-foreground', barCls: '[&>div]:bg-muted-foreground' },
              ].map(s => (
                <div key={s.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><s.icon className={`w-4 h-4 ${s.cls}`} /><span className="text-sm">{s.label}</span></div>
                    <span className="font-semibold">{s.count}</span>
                  </div>
                  <Progress value={(s.count / vehicles.length) * 100} className={`h-2 bg-muted ${s.barCls}`} />
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                  <Wrench className="w-4 h-4" />
                  <span>{stats.inspectionWarnings.length} jármű közelgő műszaki vizsgával</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Közelgő járatok */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />Közelgő járatok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.upcomingTrips.map(t => {
                const statusCls =
                  t.status === 'Visszaigazolva'   ? 'bg-blue-100 text-blue-800'  :
                  t.status === 'Tervezés alatt'   ? 'bg-amber-100 text-amber-800':
                  t.status === 'Igény beérkezett' ? 'bg-slate-100 text-slate-700':
                  t.status === 'Aktív'            ? 'bg-green-100 text-green-800': '';
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="text-sm font-mono font-bold text-primary w-12 flex-shrink-0">{t.time}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{t.line}</p></div>
                    <Badge className={`text-[10px] ${statusCls}`} variant="outline">{t.status}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Legutóbbi változások + Eseti igények */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />Legutóbbi változások
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentChanges.map(c => (
                <div key={c.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    c.type === 'conflict' ? 'bg-red-500' : c.type === 'schedule' ? 'bg-amber-500' : 'bg-primary'
                  }`} />
                  <div className="flex-1">
                    <p>{c.description}</p>
                    <p className="text-xs text-muted-foreground">{c.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Route className="w-5 h-5 text-primary" />Eseti igények összesítő
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Igény beérkezett', color: 'bg-slate-400' },
                { label: 'Tervezés alatt',   color: 'bg-amber-400' },
                { label: 'Visszaigazolva',   color: 'bg-blue-500'  },
                { label: 'Aktív',            color: 'bg-green-500' },
                { label: 'Teljesített',      color: 'bg-emerald-600' },
              ].map(s => {
                const count = extraTrips.filter(t => t.status === s.label).length;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color}`} />
                    <span className="text-sm flex-1">{s.label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
