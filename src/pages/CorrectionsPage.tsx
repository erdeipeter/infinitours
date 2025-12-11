import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { gpsEvents, lines, vehicles, drivers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Calendar, Search, Save, AlertTriangle, Bus, User, Clock, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CorrectionsPage() {
  const [selectedDate, setSelectedDate] = useState('2024-12-11');
  const [selectedLine, setSelectedLine] = useState('');
  const [corrections, setCorrections] = useState<Record<string, { vehicle?: string; driver?: string; reason?: string }>>({});

  // Filter events that might need correction (simulating missing data)
  const missingEvents = gpsEvents.filter((event) => Math.random() > 0.5).map((event) => ({
    ...event,
    needs_vehicle: !event.vehicle_id || Math.random() > 0.7,
    needs_driver: !event.driver_id || Math.random() > 0.7,
  }));

  const handleSave = () => {
    toast.success('Korrekciók sikeresen mentve!');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Teljesítés korrekció"
        description="Hiányzó GPS adatok és hozzárendelések pótlása"
        actions={
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Mentés
          </Button>
        }
      />

      <div className="page-content space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Szűrők
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Dátum</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Járat</Label>
                <Select value={selectedLine} onValueChange={setSelectedLine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon járatot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Minden járat</SelectItem>
                    {lines.map((line) => (
                      <SelectItem key={line.id} value={line.id}>
                        {line.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Keresés
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hiányzó események</p>
                  <p className="text-2xl font-bold text-warning">{missingEvents.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hiányzó jármű</p>
                  <p className="text-2xl font-bold text-destructive">
                    {missingEvents.filter((e) => e.needs_vehicle).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hiányzó sofőr</p>
                  <p className="text-2xl font-bold text-destructive">
                    {missingEvents.filter((e) => e.needs_driver).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              GPS hiányzó események - {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {missingEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nincs korrigálandó esemény</p>
            ) : (
              <div className="space-y-4">
                {missingEvents.map((event) => (
                  <div key={event.id} className="p-4 rounded-xl border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{event.stop_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{event.timestamp}</span>
                        </div>
                      </div>
                      <StatusBadge
                        status={event.difference_minutes > 3 ? 'late' : event.difference_minutes < -2 ? 'early' : 'ontime'}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {event.needs_vehicle && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Bus className="w-4 h-4 text-destructive" />
                            Rendszám hozzárendelése
                          </Label>
                          <Select
                            value={corrections[event.id]?.vehicle || ''}
                            onValueChange={(value) =>
                              setCorrections((prev) => ({
                                ...prev,
                                [event.id]: { ...prev[event.id], vehicle: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Válasszon" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicles.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.plate}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {event.needs_driver && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <User className="w-4 h-4 text-destructive" />
                            Sofőr hozzárendelése
                          </Label>
                          <Select
                            value={corrections[event.id]?.driver || ''}
                            onValueChange={(value) =>
                              setCorrections((prev) => ({
                                ...prev,
                                [event.id]: { ...prev[event.id], driver: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Válasszon" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Indoklás</Label>
                        <Input
                          placeholder="pl. GPS hiba, chip elfelejtve..."
                          value={corrections[event.id]?.reason || ''}
                          onChange={(e) =>
                            setCorrections((prev) => ({
                              ...prev,
                              [event.id]: { ...prev[event.id], reason: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
