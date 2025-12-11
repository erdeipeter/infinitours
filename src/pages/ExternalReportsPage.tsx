import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { lines, extraTrips, stops, drivers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, Calendar, Route, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/ui/status-badge';

export default function ExternalReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2024-12');

  const fixLines = lines.filter((l) => l.type === 'fix');
  const korLines = lines.filter((l) => l.type === 'kör');
  const esetiTrips = extraTrips.filter((t) => t.status === 'Véglegesítve');

  const handleDownload = () => {
    toast.success('Riport letöltése megkezdődött...');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Külső riportok"
        description="Havi teljesítési riportok megrendelőknek"
        actions={
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Letöltés (XLS)
          </Button>
        }
      />

      <div className="page-content space-y-6">
        {/* Month Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Időszak:</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-12">2024. December</SelectItem>
                  <SelectItem value="2024-11">2024. November</SelectItem>
                  <SelectItem value="2024-10">2024. Október</SelectItem>
                  <SelectItem value="2024-09">2024. Szeptember</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="fix" className="space-y-6">
          <TabsList>
            <TabsTrigger value="fix">Fix járatok</TabsTrigger>
            <TabsTrigger value="kor">Körjáratok</TabsTrigger>
            <TabsTrigger value="eseti">Eseti járatok</TabsTrigger>
          </TabsList>

          <TabsContent value="fix">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Route className="w-5 h-5 text-primary" />
                  Fix járatok - {selectedMonth}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Járat neve</th>
                        <th>Megállók</th>
                        <th>Műszakok</th>
                        <th>Teljesített km</th>
                        <th>Árbevétel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fixLines.map((line) => (
                        <tr key={line.id}>
                          <td className="font-medium">{line.name}</td>
                          <td>{line.stops_count}</td>
                          <td>{line.shifts_count}</td>
                          <td>{Math.round(Math.random() * 5000 + 2000).toLocaleString('hu-HU')} km</td>
                          <td className="font-semibold text-success">
                            {Math.round(Math.random() * 500000 + 200000).toLocaleString('hu-HU')} Ft
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50">
                        <td colSpan={3} className="font-semibold">Összesen</td>
                        <td className="font-semibold">12,450 km</td>
                        <td className="font-semibold text-success">1,805,250 Ft</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kor">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Route className="w-5 h-5 text-primary" />
                  Körjáratok - {selectedMonth}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Járat neve</th>
                        <th>Megállók</th>
                        <th>Körök/nap</th>
                        <th>Teljesített km</th>
                        <th>Árbevétel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {korLines.map((line) => (
                        <tr key={line.id}>
                          <td className="font-medium">{line.name}</td>
                          <td>{line.stops_count}</td>
                          <td>{line.shifts_count}</td>
                          <td>{Math.round(Math.random() * 3000 + 1000).toLocaleString('hu-HU')} km</td>
                          <td className="font-semibold text-success">
                            {Math.round(Math.random() * 300000 + 100000).toLocaleString('hu-HU')} Ft
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50">
                        <td colSpan={3} className="font-semibold">Összesen</td>
                        <td className="font-semibold">6,230 km</td>
                        <td className="font-semibold text-success">903,350 Ft</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eseti">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Eseti járatok - {selectedMonth}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Dátum</th>
                        <th>Megrendelő</th>
                        <th>Útvonal</th>
                        <th>Utasok</th>
                        <th>Árbevétel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {esetiTrips.map((trip) => (
                        <tr key={trip.id}>
                          <td>{trip.start_time.split(' ')[0]}</td>
                          <td className="font-medium">{trip.client_name}</td>
                          <td className="text-sm">
                            {trip.start_stop_name} → {trip.end_stop_name}
                          </td>
                          <td>{trip.passengers} fő</td>
                          <td className="font-semibold text-success">
                            {Math.round(Math.random() * 50000 + 20000).toLocaleString('hu-HU')} Ft
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50">
                        <td colSpan={4} className="font-semibold">Összesen</td>
                        <td className="font-semibold text-success">145,600 Ft</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
