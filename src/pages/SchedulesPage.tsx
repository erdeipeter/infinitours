import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/data-table';
import { schedules, lines, fuelBrackets, stops } from '@/data/mockData';
import { Schedule } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Calendar, Clock, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchedulesPage() {
  const [search, setSearch] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const getLineName = (lineId: string) => lines.find((l) => l.id === lineId)?.name || '-';
  const getFuelBracket = (bracketId?: string) => fuelBrackets.find((fb) => fb.id === bracketId);

  const schedulesWithDetails = schedules.map((schedule) => ({
    ...schedule,
    line_name: getLineName(schedule.line_id),
  }));

  const filteredSchedules = schedulesWithDetails.filter((schedule) =>
    schedule.line_name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<typeof schedulesWithDetails[0]>[] = [
    {
      key: 'line_name',
      label: 'Járat neve',
      render: (schedule) => <span className="font-medium">{schedule.line_name}</span>,
    },
    {
      key: 'valid_from',
      label: 'Érvényesség',
      render: (schedule) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {schedule.valid_from} → {schedule.valid_to || 'folyamatos'}
          </span>
        </div>
      ),
    },
    {
      key: 'fuel_bracket_id',
      label: 'Ársáv',
      render: (schedule) => {
        const bracket = getFuelBracket(schedule.fuel_bracket_id);
        return bracket ? (
          <Badge variant="outline">{bracket.revenue_value} Ft/km</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Műveletek',
      className: 'w-16',
      render: (schedule) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedSchedule(schedule)}>
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

  const sampleTimes = ['06:00', '06:15', '06:30', '06:45', '07:00'];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Menetrendek"
        description="Járatok menetrendjének kezelése és verziózása"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Új menetrend
          </Button>
        }
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
          data={filteredSchedules}
          onRowClick={(schedule) => setSelectedSchedule(schedule)}
        />
      </div>

      {/* Schedule Detail Modal */}
      <Dialog open={!!selectedSchedule} onOpenChange={() => setSelectedSchedule(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSchedule && getLineName(selectedSchedule.line_id)} - Menetrend</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Érvényesség</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {selectedSchedule.valid_from} → {selectedSchedule.valid_to || 'folyamatos'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Ársáv</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {getFuelBracket(selectedSchedule.fuel_bracket_id)?.revenue_value || '-'} Ft/km
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Megállók és időpontok
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-border" />
                    
                    <div className="space-y-4">
                      {stops.slice(0, 5).map((stop, idx) => (
                        <div key={stop.id} className="flex items-center gap-4 relative">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground z-10">
                            {idx + 1}
                          </div>
                          <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span className="font-medium">{stop.name}</span>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono">{sampleTimes[idx]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Verzió előzmények
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div>
                        <p className="font-medium">Aktuális verzió</p>
                        <p className="text-sm text-muted-foreground">{selectedSchedule.valid_from} -tól</p>
                      </div>
                      <Badge>Aktív</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Előző verzió</p>
                        <p className="text-sm text-muted-foreground">2023-07-01 - 2023-12-31</p>
                      </div>
                      <Badge variant="secondary">Lejárt</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
