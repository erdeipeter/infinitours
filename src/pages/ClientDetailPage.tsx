import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { clients, vehicles, vehicleAssignments, fuelBrackets } from '@/data/mockData';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Building2, Palette, Globe, FileText, Fuel, Calendar, Bus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { EditClientModal } from '@/components/clients/EditClientModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientData, setClientData] = useState<Client | null>(null);
  
  const client = clientData || clients.find(c => c.id === id);
  
  if (!client) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Megrendelő nem található</p>
      </div>
    );
  }

  const canEdit = currentUser?.role === 'Admin';
  const assignedVehicles = vehicles.filter(v => v.assigned_clients.includes(client.id));
  const fuelBracket = fuelBrackets.find(fb => fb.id === client.fuel_bracket_id);

  const handleSaveClient = (updatedClient: Client) => {
    // Update in mock data
    const index = clients.findIndex(c => c.id === updatedClient.id);
    if (index !== -1) {
      clients[index] = updatedClient;
    }
    setClientData(updatedClient);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={client.name}
        description="Megrendelő részletek"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/clients')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Vissza
            </Button>
            {canEdit ? (
              <Button onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Szerkesztés
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button disabled className="opacity-50 cursor-not-allowed">
                    <Edit className="w-4 h-4 mr-2" />
                    Szerkesztés
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ehhez a funkcióhoz nincs jogosultságod.</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        }
      />

      <EditClientModal
        client={client}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleSaveClient}
      />

      <div className="page-content space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Alapadatok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Név</span>
                <span className="font-medium">{client.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Aldomain</span>
                <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{client.subdomain}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Dokumentumok</span>
                <Badge variant="secondary">{client.documents_count} db</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Color & Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Szín & Logó
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Elsődleges szín</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-border"
                    style={{ backgroundColor: client.primary_color }}
                  />
                  <span className="font-mono text-sm">{client.primary_color}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Logó</span>
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: client.primary_color }}>
                    {client.name.charAt(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fuel Bracket */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Fuel className="w-5 h-5 text-primary" />
                Üzemanyag ársáv
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fuelBracket ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Időszak</span>
                    <span className="font-medium">{fuelBracket.month}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Ársáv</span>
                    <span className="font-medium">{fuelBracket.price_from} - {fuelBracket.price_to} Ft/l</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Árbevétel érték</span>
                    <span className="font-medium">{fuelBracket.revenue_value} Ft/km</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nincs beállított ársáv</p>
              )}
            </CardContent>
          </Card>

          {/* Holidays */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Szünnapok
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">2024-12-24 - Szenteste</Badge>
                <Badge variant="outline" className="mr-2">2024-12-25 - Karácsony</Badge>
                <Badge variant="outline" className="mr-2">2024-12-26 - Karácsony</Badge>
                <Badge variant="outline" className="mr-2">2025-01-01 - Újév</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bus className="w-5 h-5 text-primary" />
              Hozzárendelt járművek
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedVehicles.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nincs hozzárendelt jármű</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold">{vehicle.plate}</span>
                      <StatusBadge status={vehicle.status} />
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{vehicle.category}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.seats} férőhely</p>
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
