import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getDashboardStats, currentUser, vehicles, extraTrips } from '@/data/mockData';
import {
  Bus,
  Route,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Wrench,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const stats = getDashboardStats(currentUser.role);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Üdvözöljük, ${currentUser.name.split(' ')[0]}!`}
        description={`${currentUser.role} - ${new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      <div className="page-content space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Aktív járatok ma"
            value={stats.activeTripsToday}
            icon={Route}
            trend={{ value: 12, label: 'vs tegnap', positive: true }}
          />
          <StatCard
            title="Aktív járművek"
            value={stats.vehicleStatuses.active}
            icon={Bus}
            iconClassName="bg-success/10 text-success"
          />
          <StatCard
            title="Flottakihasználtság"
            value={`${stats.fleetUtilization}%`}
            icon={TrendingUp}
            iconClassName="bg-accent/10 text-accent"
          />
          <StatCard
            title="Késések ma"
            value={stats.delays.length}
            icon={AlertTriangle}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Status Distribution */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bus className="w-5 h-5 text-primary" />
                Járműstátuszok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm">Aktív</span>
                  </div>
                  <span className="font-semibold">{stats.vehicleStatuses.active}</span>
                </div>
                <Progress value={(stats.vehicleStatuses.active / vehicles.length) * 100} className="h-2 bg-muted" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="text-sm">Tartalék</span>
                  </div>
                  <span className="font-semibold">{stats.vehicleStatuses.reserve}</span>
                </div>
                <Progress value={(stats.vehicleStatuses.reserve / vehicles.length) * 100} className="h-2 bg-muted [&>div]:bg-warning" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Inaktív</span>
                  </div>
                  <span className="font-semibold">{stats.vehicleStatuses.inactive}</span>
                </div>
                <Progress value={(stats.vehicleStatuses.inactive / vehicles.length) * 100} className="h-2 bg-muted [&>div]:bg-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Changes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Legutóbbi módosítások
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentChanges.map((change) => (
                  <div key={change.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {change.type === 'schedule' && <Calendar className="w-4 h-4 text-primary" />}
                      {change.type === 'vehicle' && <Bus className="w-4 h-4 text-warning" />}
                      {change.type === 'trip' && <Route className="w-4 h-4 text-success" />}
                      {change.type === 'driver' && <Users className="w-4 h-4 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{change.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{change.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delays */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Aktuális késések
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.delays.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Nincs aktuális késés</p>
              ) : (
                <div className="space-y-3">
                  {stats.delays.map((delay) => (
                    <div key={delay.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <div>
                        <p className="font-medium text-sm">{delay.line}</p>
                        <p className="text-xs text-muted-foreground">{delay.location}</p>
                      </div>
                      <span className="text-warning font-semibold">+{delay.delay_minutes} perc</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inspection Warnings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-destructive" />
                Műszaki vizsga figyelmeztetések
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.inspectionWarnings.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Nincs közelgő műszaki vizsga</p>
              ) : (
                <div className="space-y-3">
                  {stats.inspectionWarnings.map((warning) => (
                    <div key={warning.vehicle_id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <Bus className="w-5 h-5 text-destructive" />
                        <span className="font-medium">{warning.plate}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{warning.due_date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Extra Trip Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              Eseti járat igények
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-3xl font-bold text-primary">{extraTrips.filter(t => t.status === 'Új').length}</p>
                <p className="text-sm text-muted-foreground mt-1">Új igények</p>
              </div>
              <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 text-center">
                <p className="text-3xl font-bold text-warning">{extraTrips.filter(t => t.status === 'Véglegesítésre vár').length}</p>
                <p className="text-sm text-muted-foreground mt-1">Véglegesítésre vár</p>
              </div>
              <div className="p-4 rounded-xl bg-success/5 border border-success/20 text-center">
                <p className="text-3xl font-bold text-success">{extraTrips.filter(t => t.status === 'Véglegesítve').length}</p>
                <p className="text-sm text-muted-foreground mt-1">Véglegesítve</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
