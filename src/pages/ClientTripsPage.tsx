import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/data-table';
import { lines, clients, stops } from '@/data/mockData';
import { Line } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ClientTripsPage() {
  const { clientId } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);

  // Filter lines by client_id
  const clientLines = lines.filter(
    (line) =>
      line.client_id === clientId &&
      line.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Line>[] = [
    {
      key: 'name',
      label: 'Járat neve',
      render: (line) => <span className="font-medium">{line.name}</span>,
    },
    {
      key: 'type',
      label: 'Típus',
      render: (line) => (
        <Badge variant="outline" className="capitalize">
          {line.type === 'fix' ? 'Fix' : 'Kör'}
        </Badge>
      ),
    },
    {
      key: 'stops_count',
      label: 'Megállók',
      render: (line) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{line.stops_count}</span>
        </div>
      ),
    },
    {
      key: 'shifts_count',
      label: 'Műszakok/Körök',
      render: (line) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{line.shifts_count}</span>
        </div>
      ),
    },
    {
      key: 'valid_from',
      label: 'Érvényesség',
      render: (line) => (
        <Badge variant="outline">
          {line.valid_from} → {line.valid_to || 'folyamatos'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-16',
      render: (line) => (
        <Button variant="ghost" size="icon" onClick={() => setSelectedLine(line)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Járatok"
        description="Az Ön megrendelt járatainak áttekintése"
      />

      <div className="page-content space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Keresés járat alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={clientLines}
          onRowClick={(line) => setSelectedLine(line)}
        />
      </div>

      {/* Line Detail Modal */}
      <Dialog open={!!selectedLine} onOpenChange={() => setSelectedLine(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedLine?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Típus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{selectedLine?.type === 'fix' ? 'Fix járat' : 'Körjárat'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Érvényesség</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {selectedLine?.valid_from} → {selectedLine?.valid_to || 'folyamatos'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Megállók listája
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stops.slice(0, selectedLine?.stops_count || 5).map((stop, idx) => (
                    <div key={stop.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <span>{stop.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {selectedLine?.type === 'fix' ? 'Műszakok' : 'Körök'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: selectedLine?.shifts_count || 3 }).map((_, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="font-medium">{selectedLine?.type === 'fix' ? `${idx + 1}. műszak` : `${idx + 1}. kör`}</p>
                      <p className="text-sm text-muted-foreground">
                        {6 + idx * 8}:00 - {14 + idx * 8}:00
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
