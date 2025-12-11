import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/data-table';
import { lines, clients, stops } from '@/data/mockData';
import { Line } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, MapPin, Clock, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TripsPageProps {
  type: 'fix' | 'kör';
}

export default function TripsPage({ type }: TripsPageProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);

  const typeLabel = type === 'fix' ? 'Fix' : 'Kör';
  const filteredLines = lines.filter(
    (line) =>
      line.type === type &&
      (line.name.toLowerCase().includes(search.toLowerCase()) ||
        clients.find((c) => c.id === line.client_id)?.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.name || '-';

  const columns: Column<Line>[] = [
    {
      key: 'name',
      label: 'Járat neve',
      render: (line) => <span className="font-medium">{line.name}</span>,
    },
    {
      key: 'client_id',
      label: 'Megrendelő',
      render: (line) => (
        <span className="text-muted-foreground">{getClientName(line.client_id)}</span>
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
      label: type === 'fix' ? 'Műszakok' : 'Körök',
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
      label: 'Műveletek',
      className: 'w-16',
      render: (line) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedLine(line)}>
              <Eye className="w-4 h-4 mr-2" />
              Részletek
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Szerkesztés
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Törlés
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${typeLabel} járatok`}
        description={type === 'fix' ? 'Rendszeres, fix útvonalú járatok kezelése' : 'Körjáratok és műszakváltások kezelése'}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Új {typeLabel.toLowerCase()} járat
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Új {typeLabel.toLowerCase()} járat létrehozása</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Járat sikeresen létrehozva!');
                  setIsDialogOpen(false);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Járat neve</Label>
                  <Input placeholder="pl. Reggeli műszak A" />
                </div>
                <div className="space-y-2">
                  <Label>Megrendelő</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Válasszon megrendelőt" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Érvényesség kezdete</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Érvényesség vége</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Mégse
                  </Button>
                  <Button type="submit">Létrehozás</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="page-content space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Keresés járat vagy megrendelő alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredLines}
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
                  <CardTitle className="text-sm text-muted-foreground">Megrendelő</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{selectedLine && getClientName(selectedLine.client_id)}</p>
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
                  {type === 'fix' ? 'Műszakok' : 'Körök'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: selectedLine?.shifts_count || 3 }).map((_, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="font-medium">{type === 'fix' ? `${idx + 1}. műszak` : `${idx + 1}. kör`}</p>
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
