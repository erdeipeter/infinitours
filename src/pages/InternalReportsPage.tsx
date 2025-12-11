import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { lines, vehicles, drivers, stops } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar, Route, Bus, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface InternalReportPageProps {
  variant: 1 | 2 | 3;
}

export default function InternalReportsPage({ variant }: InternalReportPageProps) {
  const [dateFrom, setDateFrom] = useState('2024-12-01');
  const [dateTo, setDateTo] = useState('2024-12-11');

  const titles: Record<number, string> = {
    1: 'Belső riport 1 - Teljesítmény',
    2: 'Belső riport 2 - GPS pontosság',
    3: 'Belső riport 3 - Kihasználtság',
  };

  const handleDownload = () => {
    toast.success('Riport letöltése megkezdődött...');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={titles[variant]}
        description="Belső elemzési riportok"
        actions={
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Letöltés (XLS)
          </Button>
        }
      />

      <div className="page-content space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>Kezdő dátum</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Záró dátum</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              {variant === 1 && (
                <div className="space-y-2">
                  <Label>Járat</Label>
                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Válasszon" />
                    </SelectTrigger>
                    <SelectContent>
                      {lines.map((line) => (
                        <SelectItem key={line.id} value={line.id}>{line.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button variant="outline">Szűrés</Button>
            </div>
          </CardContent>
        </Card>

        {variant === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Route className="w-5 h-5 text-primary" />
                Járat teljesítmény
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Járat</th>
                      <th>Műszakkód</th>
                      <th>Rendszám</th>
                      <th>Fizetett km</th>
                      <th>Árbevétel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.slice(0, 5).map((line, idx) => (
                      <tr key={line.id}>
                        <td className="font-medium">{line.name}</td>
                        <td>M{idx + 1}</td>
                        <td className="font-mono">{vehicles[idx % vehicles.length].plate}</td>
                        <td>{(1200 + idx * 340).toLocaleString('hu-HU')} km</td>
                        <td className="font-semibold text-success">{((1200 + idx * 340) * 145).toLocaleString('hu-HU')} Ft</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {variant === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                GPS pontosság mátrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-x-auto">
                <table className="data-table min-w-[800px]">
                  <thead>
                    <tr>
                      <th>Megálló</th>
                      {['H', 'K', 'Sze', 'Cs', 'P'].map((day) => (
                        <th key={day} className="text-center">{day}</th>
                      ))}
                      <th>Sofőr</th>
                      <th>Összpont</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stops.slice(0, 5).map((stop, idx) => (
                      <tr key={stop.id}>
                        <td className="font-medium">{stop.name}</td>
                        {[0, 1, 2, 3, 4].map((day) => {
                          const score = Math.floor(Math.random() * 3);
                          const colors = ['bg-success/20 text-success', 'bg-warning/20 text-warning', 'bg-destructive/20 text-destructive'];
                          return (
                            <td key={day} className="text-center">
                              <span className={`inline-block w-8 h-8 rounded-lg ${colors[score]} font-semibold leading-8`}>
                                {10 - score * 2}
                              </span>
                            </td>
                          );
                        })}
                        <td>{drivers[idx % drivers.length].name}</td>
                        <td className="font-bold">{40 + Math.floor(Math.random() * 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {variant === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Járműkihasználtság
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kategória</th>
                      <th>Összes jármű</th>
                      <th>Napi igény (átlag)</th>
                      <th>Rendelkezésre áll</th>
                      <th>Kihasználtság</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Mikrobusz', 'Minibusz', 'Midibusz', 'Turistabusz', 'Alacsonypadlós'].map((cat, idx) => {
                      const total = 2 + idx;
                      const demand = 1 + idx * 0.8;
                      const util = Math.round((demand / total) * 100);
                      return (
                        <tr key={cat}>
                          <td className="font-medium">{cat}</td>
                          <td>{total}</td>
                          <td>{demand.toFixed(1)}</td>
                          <td>{total - Math.floor(idx / 2)}</td>
                          <td>
                            <span className={`font-semibold ${util > 80 ? 'text-success' : util > 50 ? 'text-warning' : 'text-destructive'}`}>
                              {util}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
