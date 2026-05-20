import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/data-table';
import { clients as initialClients } from '@/data/mockData';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, FileText } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Client>[] = [
    {
      key: 'name',
      label: 'Név',
      render: (client) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: client.primary_color }}
          >
            {client.name.charAt(0)}
          </div>
          <span className="font-medium">{client.name}</span>
        </div>
      ),
    },
    {
      key: 'primary_color',
      label: 'Szín',
      render: (client) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md border border-border"
            style={{ backgroundColor: client.primary_color }}
          />
          <span className="text-sm text-muted-foreground">{client.primary_color}</span>
        </div>
      ),
    },
    {
      key: 'subdomain',
      label: 'Aldomain',
      render: (client) => (
        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{client.subdomain}</span>
      ),
    },
    {
      key: 'documents_count',
      label: 'Dokumentumok',
      render: (client) => (
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span>{client.documents_count}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Műveletek',
      className: 'w-16',
      render: (client) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
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
        title="Megrendelők"
        description="Ügyfelek és partnerek kezelése"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Új megrendelő
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Új megrendelő hozzáadása</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Megrendelő sikeresen hozzáadva!');
                  setIsDialogOpen(false);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Cégnév</Label>
                  <Input placeholder="pl. ABC Logisztika Kft." />
                </div>
                <div className="space-y-2">
                  <Label>Aldomain</Label>
                  <Input placeholder="pl. abc-logisztika" />
                </div>
                <div className="space-y-2">
                  <Label>Elsődleges szín</Label>
                  <Input type="color" defaultValue="#2563eb" className="h-10 w-full" />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Mégse
                  </Button>
                  <Button type="submit">Mentés</Button>
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
              placeholder="Keresés név vagy aldomain alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredClients}
          onRowClick={(client) => navigate(`/clients/${client.id}`)}
        />
      </div>
    </div>
  );
}
