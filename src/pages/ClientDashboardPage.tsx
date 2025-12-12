import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { lines, extraTrips, reports } from '@/data/mockData';
import { Route, Clock, FileText, Check, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboardPage() {
  const { currentUser, clientId, clientName } = useAuth();
  const navigate = useNavigate();

  // Filter data by client_id
  const clientLines = lines.filter(l => l.client_id === clientId);
  const clientExtraTrips = extraTrips.filter(t => t.client_id === clientId);
  const clientReports = reports.filter(r => r.type === 'külső').slice(0, 3);

  // Group extra trips by status
  const newTrips = clientExtraTrips.filter(t => t.status === 'Új');
  const pendingTrips = clientExtraTrips.filter(t => t.status === 'Véglegesítésre vár');
  const finalizedTrips = clientExtraTrips.filter(t => t.status === 'Véglegesítve');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Üdvözöljük, ${currentUser?.name.split(' ')[0]}!`}
        description={`${clientName} - ${new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      <div className="page-content space-y-6">
        {/* Upcoming Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              Következő járatok
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/trips/client')}>
              Összes járat
            </Button>
          </CardHeader>
          <CardContent>
            {clientLines.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Nincs aktív járat</p>
            ) : (
              <div className="space-y-3">
                {clientLines.slice(0, 3).map((line) => (
                  <div key={line.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{line.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {line.stops_count} megálló • {line.shifts_count} {line.type === 'fix' ? 'műszak' : 'kör'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Érvényes:</p>
                      <p className="text-sm font-medium">{line.valid_from} - {line.valid_to || '∞'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extra Trip Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Eseti igények állapota
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/trips/eseti')}>
              Új igény
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{newTrips.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Új igények</p>
              </div>
              <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                </div>
                <p className="text-2xl font-bold text-warning">{pendingTrips.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Véglegesítésre vár</p>
              </div>
              <div className="p-4 rounded-xl bg-success/5 border border-success/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">{finalizedTrips.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Véglegesítve</p>
              </div>
            </div>

            {clientExtraTrips.length > 0 && (
              <div className="mt-4 space-y-2">
                {clientExtraTrips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{trip.start_stop_name} → {trip.end_stop_name}</p>
                      <p className="text-xs text-muted-foreground">{trip.start_time}</p>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Teljesítési igazolások
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports/external')}>
              Összes riport
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{report.period}</p>
                    <p className="text-sm text-muted-foreground">Létrehozva: {report.created_at}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Letöltés
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
