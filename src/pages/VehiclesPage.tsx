import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/data-table';
import { clients } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { Vehicle, VehicleCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Wrench, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NewVehicleModal } from '@/components/vehicles/NewVehicleModal';

const categoryLabels: Record<VehicleCategory, string> = {
  mikro: 'Mikrobusz',
  minibusz: 'Minibusz',
  midibusz: 'Midibusz',
  turista: 'Turistabusz',
  alacsonypadlós: 'Alacsonypadlós',
  szerviz: 'Szerviz gépkocsi',
  szemely: 'Személygépkocsi',
};

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { vehicles } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);

  const canCreateVehicle =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Flottamenedzser' ||
    currentUser?.role === 'Rendszeradmin' ||
    currentUser?.role === 'Műszakvezető';

  const handleVehicleCreated = useCallback(() => {}, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || vehicle.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getClientNames = (clientIds: string[]) => {
    return clientIds
      .map((id) => clients.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const columns: Column<Vehicle>[] = [
    {
      key: 'plate',
      label: 'Rendszám',
      render: (vehicle) => (
        <span className="font-mono font-bold text-foreground">{vehicle.plate}</span>
      ),
    },
    {
      key: 'category',
      label: 'Kategória',
      render: (vehicle) => (
        <Badge variant="outline" className="capitalize">
          {categoryLabels[vehicle.category]}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Státusz',
      render: (vehicle) => <StatusBadge status={vehicle.status} />,
    },
    {
      key: 'seats',
      label: 'Férőhely',
      render: (vehicle) => <span>{vehicle.seats} fő</span>,
    },
    {
      key: 'assigned_clients',
      label: 'Megrendelők',
      render: (vehicle) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {getClientNames(vehicle.assigned_clients) || '-'}
        </span>
      ),
    },
    {
      key: 'next_inspection',
      label: 'Köv. műszaki',
      render: (vehicle) => (
        <div className="flex items-center gap-1">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{vehicle.next_inspection || '-'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Műveletek',
      className: 'w-16',
      render: (vehicle) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              Megtekintés
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
        title="Járművek"
        description="Flotta és járműpark kezelése"
        actions={
          canCreateVehicle ? (
            <Button onClick={() => setIsNewVehicleModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Új jármű
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled className="opacity-50 cursor-not-allowed">
                  <Plus className="w-4 h-4 mr-2" />
                  Új jármű
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ehhez a funkcióhoz nincs jogosultságod.</p>
              </TooltipContent>
            </Tooltip>
          )
        }
      />

      <div className="page-content space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Keresés rendszám alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Státusz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Minden státusz</SelectItem>
              <SelectItem value="aktív">Aktív</SelectItem>
              <SelectItem value="tartalék">Tartalék</SelectItem>
              <SelectItem value="inaktív">Inaktív</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Kategória" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Minden kategória</SelectItem>
              <SelectItem value="mikro">Mikrobusz</SelectItem>
              <SelectItem value="minibusz">Minibusz</SelectItem>
              <SelectItem value="midibusz">Midibusz</SelectItem>
              <SelectItem value="turista">Turistabusz</SelectItem>
              <SelectItem value="alacsonypadlós">Alacsonypadlós</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filteredVehicles}
          onRowClick={(vehicle) => navigate(`/vehicles/${vehicle.id}`)}
        />
      </div>

      <NewVehicleModal
        open={isNewVehicleModalOpen}
        onOpenChange={setIsNewVehicleModalOpen}
        onVehicleCreated={handleVehicleCreated}
      />
    </div>
  );
}
