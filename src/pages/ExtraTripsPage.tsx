import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/data-table';
import { extraTrips, clients, stops, vehicles, drivers } from '@/data/mockData';
import { ExtraTrip, VehicleCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Search, MoreHorizontal, Edit, Check, Mail, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const categoryLabels: Record<VehicleCategory, string> = {
  mikro: 'Mikrobusz (8 fő)',
  minibusz: 'Minibusz (19 fő)',
  midibusz: 'Midibusz (29-33 fő)',
  turista: 'Turistabusz (49-55 fő)',
  alacsonypadlós: 'Alacsonypadlós (39 fő)',
};

export default function ExtraTripsPage() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ExtraTrip | null>(null);
  const [finalizeTrip, setFinalizeTrip] = useState<ExtraTrip | null>(null);

  const { currentUser, isClient, clientId } = useAuth();
  const isOffice = currentUser?.role === 'Sportbusz Iroda' || currentUser?.role === 'Admin';

  // Filter by client_id for Megrendelő users
  const clientFilteredTrips = isClient 
    ? extraTrips.filter(trip => trip.client_id === clientId)
    : extraTrips;

  const filteredTrips = clientFilteredTrips.filter(
    (trip) =>
      trip.client_name.toLowerCase().includes(search.toLowerCase()) ||
      trip.start_stop_name.toLowerCase().includes(search.toLowerCase()) ||
      trip.end_stop_name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<ExtraTrip>[] = [
    {
      key: 'client_name',
      label: 'Megrendelő',
      render: (trip) => <span className="font-medium">{trip.client_name}</span>,
    },
    {
      key: 'route',
      label: 'Útvonal',
      render: (trip) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="truncate max-w-[120px]">{trip.start_stop_name}</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate max-w-[120px]">{trip.end_stop_name}</span>
        </div>
      ),
    },
    {
      key: 'start_time',
      label: 'Időpont',
      render: (trip) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{trip.start_time}</span>
        </div>
      ),
    },
    {
      key: 'passengers',
      label: 'Utasok',
      render: (trip) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{trip.passengers} fő</span>
        </div>
      ),
    },
    {
      key: 'vehicle_category',
      label: 'Kategória',
      render: (trip) => (
        <Badge variant="outline" className="capitalize">
          {trip.vehicle_category}
        </Badge>
      ),
    },
    {
      key: 'is_return',
      label: 'Típus',
      render: (trip) => (
        <Badge variant={trip.is_return ? 'secondary' : 'outline'}>
          {trip.is_return ? 'Oda-vissza' : 'Csak oda'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Státusz',
      render: (trip) => <StatusBadge status={trip.status} />,
    },
    {
      key: 'actions',
      label: 'Műveletek',
      className: 'w-16',
      render: (trip) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedTrip(trip)}>
              <MapPin className="w-4 h-4 mr-2" />
              Részletek
            </DropdownMenuItem>
            {isOffice && trip.status !== 'Véglegesítve' && (
              <DropdownMenuItem onClick={() => setFinalizeTrip(trip)}>
                <Check className="w-4 h-4 mr-2" />
                Véglegesítés
              </DropdownMenuItem>
            )}
            {!isClient && (
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Szerkesztés
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Eseti járatok"
        description="Egyedi, alkalmi járatigények kezelése"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Új eseti igény
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Új eseti járat igénylése</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Eseti járat igény sikeresen elküldve!');
                  setIsCreateOpen(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kiindulási hely</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Válasszon megállót" />
                      </SelectTrigger>
                      <SelectContent>
                        {stops.map((stop) => (
                          <SelectItem key={stop.id} value={stop.id}>
                            {stop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Érkezési hely</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Válasszon megállót" />
                      </SelectTrigger>
                      <SelectContent>
                        {stops.map((stop) => (
                          <SelectItem key={stop.id} value={stop.id}>
                            {stop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Utaslétszám</Label>
                    <Input type="number" placeholder="pl. 25" />
                  </div>
                  <div className="space-y-2">
                    <Label>Járműkategória</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Válasszon" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <Label htmlFor="return-trip">Oda-vissza</Label>
                  <Switch id="return-trip" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Indulás időpontja</Label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label>Visszaút időpontja (opcionális)</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Megjegyzés</Label>
                  <Textarea placeholder="További információk..." />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Mégse
                  </Button>
                  <Button type="submit">Igény elküldése</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="page-content space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Új igények</p>
                  <p className="text-2xl font-bold text-primary">
                    {extraTrips.filter((t) => t.status === 'Új').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Véglegesítésre vár</p>
                  <p className="text-2xl font-bold text-warning">
                    {extraTrips.filter((t) => t.status === 'Véglegesítésre vár').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Véglegesítve</p>
                  <p className="text-2xl font-bold text-success">
                    {extraTrips.filter((t) => t.status === 'Véglegesítve').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Check className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Keresés..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable columns={columns} data={filteredTrips} onRowClick={(trip) => setSelectedTrip(trip)} />
      </div>

      {/* Trip Detail Modal */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Eseti járat részletei</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Megrendelő</span>
                <span className="font-medium">{selectedTrip.client_name}</span>
              </div>
              <div className="p-4 rounded-xl bg-muted space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">Kiindulás:</span>
                  <span>{selectedTrip.start_stop_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-destructive" />
                  <span className="font-medium">Érkezés:</span>
                  <span>{selectedTrip.end_stop_name}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Időpont</p>
                  <p className="font-medium">{selectedTrip.start_time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utasok</p>
                  <p className="font-medium">{selectedTrip.passengers} fő</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kategória</p>
                  <p className="font-medium capitalize">{selectedTrip.vehicle_category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Státusz</p>
                  <StatusBadge status={selectedTrip.status} />
                </div>
              </div>
              {selectedTrip.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Megjegyzés</p>
                  <p className="text-sm mt-1">{selectedTrip.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Finalize Modal */}
      <Dialog open={!!finalizeTrip} onOpenChange={() => setFinalizeTrip(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Járat véglegesítése</DialogTitle>
          </DialogHeader>
          {finalizeTrip && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Járat sikeresen véglegesítve!');
                setFinalizeTrip(null);
              }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-muted">
                <p className="font-medium">{finalizeTrip.client_name}</p>
                <p className="text-sm text-muted-foreground">
                  {finalizeTrip.start_stop_name} → {finalizeTrip.end_stop_name}
                </p>
                <p className="text-sm text-muted-foreground">{finalizeTrip.start_time}</p>
              </div>

              <div className="space-y-2">
                <Label>Jármű kiválasztása</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon járművet" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles
                      .filter((v) => v.category === finalizeTrip.vehicle_category && v.status === 'aktív')
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} - {vehicle.seats} fő
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sofőr kiválasztása</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon sofőrt" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.accuracy_percent}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-medium">Email előnézet</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tisztelt {finalizeTrip.client_name}! Az Ön által igényelt eseti járat
                  véglegesítésre került. Időpont: {finalizeTrip.start_time}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setFinalizeTrip(null)}>
                  Mégse
                </Button>
                <Button type="submit">
                  <Check className="w-4 h-4 mr-2" />
                  Véglegesítés
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
