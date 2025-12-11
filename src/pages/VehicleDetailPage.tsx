import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { vehicles, clients, vehicleAssignments } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Bus, Gauge, Calendar, Building2, History, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const categoryLabels: Record<string, string> = {
  mikro: 'Mikrobusz',
  minibusz: 'Minibusz',
  midibusz: 'Midibusz',
  turista: 'Turistabusz',
  alacsonypadlós: 'Alacsonypadlós',
};

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Jármű nem található</p>
      </div>
    );
  }

  const assignedClients = vehicle.assigned_clients
    .map((clientId) => clients.find((c) => c.id === clientId))
    .filter(Boolean);

  const kmDriven = vehicle.current_km - vehicle.start_km;
  const monthlyKm = Math.round(kmDriven / 12);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={vehicle.plate}
        description={`${categoryLabels[vehicle.category]} - ${vehicle.seats} férőhely`}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/vehicles')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Vissza
            </Button>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Szerkesztés
            </Button>
          </div>
        }
      />

      <div className="page-content">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Alapadatok</TabsTrigger>
            <TabsTrigger value="assignments">Megrendelő hozzárendelések</TabsTrigger>
            <TabsTrigger value="history">Státusz előzmények</TabsTrigger>
            <TabsTrigger value="kpi">KPI-k</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Bus className="w-5 h-5 text-primary" />
                    Jármű adatok
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Rendszám</span>
                    <span className="font-mono font-bold">{vehicle.plate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Kategória</span>
                    <Badge variant="outline">{categoryLabels[vehicle.category]}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Státusz</span>
                    <StatusBadge status={vehicle.status} />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Férőhelyek</span>
                    <span className="font-medium">{vehicle.seats} fő</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Évjárat</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-primary" />
                    Kilométeróra
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Kezdő km</span>
                    <span className="font-medium">{vehicle.start_km.toLocaleString('hu-HU')} km</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Jelenlegi km</span>
                    <span className="font-medium">{vehicle.current_km.toLocaleString('hu-HU')} km</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Megtett km</span>
                    <span className="font-semibold text-primary">{kmDriven.toLocaleString('hu-HU')} km</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Műszaki vizsga
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Következő vizsga időpontja</p>
                      <p className="text-xl font-semibold mt-1">{vehicle.next_inspection || 'Nincs adat'}</p>
                    </div>
                    {vehicle.next_inspection && (
                      <Badge variant={new Date(vehicle.next_inspection) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'destructive' : 'secondary'}>
                        {new Date(vehicle.next_inspection) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? 'Hamarosan esedékes'
                          : 'Rendben'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Hozzárendelt megrendelők
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedClients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nincs hozzárendelt megrendelő</p>
                ) : (
                  <div className="space-y-3">
                    {assignedClients.map((client) => (
                      <div
                        key={client!.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/clients/${client!.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: client!.primary_color }}
                          >
                            {client!.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{client!.name}</p>
                            <p className="text-sm text-muted-foreground">{client!.subdomain}</p>
                          </div>
                        </div>
                        <StatusBadge status="aktív" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Státusz változások
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <div className="flex-1">
                      <p className="font-medium">Aktív</p>
                      <p className="text-sm text-muted-foreground">2024-01-15 - Jelenleg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <div className="flex-1">
                      <p className="font-medium">Tartalék</p>
                      <p className="text-sm text-muted-foreground">2023-12-01 - 2024-01-15</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <div className="flex-1">
                      <p className="font-medium">Aktív</p>
                      <p className="text-sm text-muted-foreground">2023-06-01 - 2023-12-01</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpi" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Havi fizetett km</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{monthlyKm.toLocaleString('hu-HU')}</p>
                  <p className="text-sm text-muted-foreground mt-1">km/hó átlag</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Bruttó km (összes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{vehicle.current_km.toLocaleString('hu-HU')}</p>
                  <p className="text-sm text-muted-foreground mt-1">km összesen</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Árbevétel/km</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-accent">145</p>
                  <p className="text-sm text-muted-foreground mt-1">Ft/km</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Kihasználtság
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Heti kihasználtság</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Havi kihasználtság</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
