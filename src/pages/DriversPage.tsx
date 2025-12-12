import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/data-table';
import { drivers, getDriverPerformance } from '@/data/mockData';
import { Driver } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Phone, CreditCard } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { NewDriverModal } from '@/components/drivers/NewDriverModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function DriversPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isNewDriverModalOpen, setIsNewDriverModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const canCreateDriver = currentUser?.role === 'Admin' || currentUser?.role === 'Flottamenedzser';

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(search.toLowerCase()) ||
      driver.chip_id.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      label: 'Név',
      render: (driver) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-semibold text-primary">
              {driver.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <span className="font-medium">{driver.name}</span>
        </div>
      ),
    },
    {
      key: 'chip_id',
      label: 'Azonosító',
      render: (driver) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-sm">{driver.chip_id}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Telefonszám',
      render: (driver) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{driver.phone}</span>
        </div>
      ),
    },
    {
      key: 'accuracy_percent',
      label: 'Pontosság',
      render: (driver) => (
        <div className="flex items-center gap-3 min-w-[120px]">
          <Progress
            value={driver.accuracy_percent}
            className={cn(
              'h-2 flex-1',
              driver.accuracy_percent >= 90 && '[&>div]:bg-success',
              driver.accuracy_percent >= 80 && driver.accuracy_percent < 90 && '[&>div]:bg-warning',
              driver.accuracy_percent < 80 && '[&>div]:bg-destructive'
            )}
          />
          <span className="font-semibold text-sm">{driver.accuracy_percent}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Műveletek',
      className: 'w-16',
      render: (driver) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedDriver(driver)}>
              <Eye className="w-4 h-4 mr-2" />
              Teljesítmény
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

  const performance = selectedDriver ? getDriverPerformance(selectedDriver.id) : [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sofőrök"
        description="Járművezetők és teljesítményük kezelése"
        actions={
          canCreateDriver ? (
            <Button onClick={() => setIsNewDriverModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Új sofőr
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled className="opacity-50 cursor-not-allowed">
                  <Plus className="w-4 h-4 mr-2" />
                  Új sofőr
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ehhez a funkcióhoz nincs jogosultságod.</p>
              </TooltipContent>
            </Tooltip>
          )
        }
      />

      <NewDriverModal
        open={isNewDriverModalOpen}
        onOpenChange={setIsNewDriverModalOpen}
        onDriverCreated={() => setRefreshKey(prev => prev + 1)}
      />

      <div className="page-content space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Keresés név vagy azonosító alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredDrivers}
          onRowClick={(driver) => setSelectedDriver(driver)}
        />
      </div>

      {/* Driver Performance Modal */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold text-primary">
                  {selectedDriver?.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              {selectedDriver?.name} - Teljesítmény
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
              <span className="text-muted-foreground">Összesített pontosság</span>
              <span className="text-2xl font-bold text-primary">{selectedDriver?.accuracy_percent}%</span>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Megálló neve</th>
                    <th>Tervezett</th>
                    <th>Érkezés</th>
                    <th>Státusz</th>
                    <th>Pontszám</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-medium">{row.stop_name}</td>
                      <td>{row.planned_time}</td>
                      <td>{row.arrival_time}</td>
                      <td>
                        <StatusBadge status={row.timing_status} />
                      </td>
                      <td className="font-semibold">{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
