import { useState } from 'react';
import { Vehicle, VehicleCategory, VehicleStatus } from '@/types';
import { vehicles, clients } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface EditVehicleModalProps {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedVehicle: Vehicle) => void;
}

const categoryOptions = [
  { value: 'mikro', label: 'Mikrobusz' },
  { value: 'minibusz', label: 'Minibusz' },
  { value: 'midibusz', label: 'Midibusz' },
  { value: 'turista', label: 'Turistabusz' },
  { value: 'alacsonypadlós', label: 'Alacsonypadlós busz' },
  { value: 'szerviz', label: 'Szerviz gépkocsi' },
  { value: 'szemely', label: 'Személygépkocsi' },
];

const statusOptions = [
  { value: 'aktív', label: 'Aktív' },
  { value: 'tartalék', label: 'Aktív tartalék' },
  { value: 'inaktív', label: 'Inaktív' },
];

const financingOptions = [
  { value: 'sajat', label: 'Saját tulajdon' },
  { value: 'nyilt_lizing', label: 'Nyílt végű lízing' },
  { value: 'zart_lizing', label: 'Zárt végű lízing' },
  { value: 'operativ_lizing', label: 'Operatív lízing' },
  { value: 'kolcson', label: 'Kölcsön jármű' },
];

export function EditVehicleModal({ vehicle, open, onOpenChange, onSave }: EditVehicleModalProps) {
  const [formData, setFormData] = useState({
    plate: vehicle.plate,
    year: vehicle.year,
    category: vehicle.category,
    seats: vehicle.seats,
    passenger_seats: (vehicle as any).passenger_seats || vehicle.seats,
    start_km: vehicle.start_km,
    start_km_date: (vehicle as any).start_km_date || '',
    current_km: vehicle.current_km,
    assigned_clients: [...vehicle.assigned_clients],
    status: vehicle.status,
    financing: (vehicle as any).financing || 'sajat',
    valid_inspection: (vehicle as any).valid_inspection || '',
    next_inspection: vehicle.next_inspection || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClientToggle = (clientId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assigned_clients: checked
        ? [...prev.assigned_clients, clientId]
        : prev.assigned_clients.filter(id => id !== clientId)
    }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.plate.trim()) {
      newErrors.plate = 'A rendszám megadása kötelező.';
    } else {
      const existingVehicle = vehicles.find(
        v => v.plate.toLowerCase() === formData.plate.toLowerCase() && v.id !== vehicle.id
      );
      if (existingVehicle) {
        newErrors.plate = 'Ez a rendszám már létezik.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedVehicle: Vehicle = {
      ...vehicle,
      plate: formData.plate.trim().toUpperCase(),
      year: formData.year,
      category: formData.category,
      seats: formData.seats,
      start_km: formData.start_km,
      current_km: formData.current_km,
      assigned_clients: formData.assigned_clients,
      status: formData.status as 'aktív' | 'tartalék' | 'inaktív',
      next_inspection: formData.next_inspection,
    };

    // Store additional fields
    (updatedVehicle as any).passenger_seats = formData.passenger_seats;
    (updatedVehicle as any).start_km_date = formData.start_km_date;
    (updatedVehicle as any).financing = formData.financing;
    (updatedVehicle as any).valid_inspection = formData.valid_inspection;

    onSave(updatedVehicle);
    toast.success('Jármű adatai mentve.');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Jármű szerkesztése</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Alapadatok */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Alapadatok</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plate">Rendszám *</Label>
                <Input
                  id="plate"
                  value={formData.plate}
                  onChange={(e) => {
                    setFormData({ ...formData, plate: e.target.value });
                    if (errors.plate) setErrors({ ...errors, plate: '' });
                  }}
                  placeholder="ABC-123"
                  className="font-mono"
                />
                {errors.plate && <p className="text-sm text-destructive">{errors.plate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Évjárat</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Járműkategória</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as VehicleCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon kategóriát" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seats">Férőhelyek száma</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passenger_seats">Utasülések száma</Label>
                <Input
                  id="passenger_seats"
                  type="number"
                  value={formData.passenger_seats}
                  onChange={(e) => setFormData({ ...formData, passenger_seats: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_km">Kezdő km állás</Label>
                <Input
                  id="start_km"
                  type="number"
                  value={formData.start_km}
                  onChange={(e) => setFormData({ ...formData, start_km: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_km_date">Kezdő km dátuma</Label>
                <Input
                  id="start_km_date"
                  type="date"
                  value={formData.start_km_date}
                  onChange={(e) => setFormData({ ...formData, start_km_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_km">Jelenlegi km állás</Label>
                <Input
                  id="current_km"
                  type="number"
                  value={formData.current_km}
                  onChange={(e) => setFormData({ ...formData, current_km: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Megrendelők és státusz */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Megrendelők és státusz</h3>
            
            <div className="space-y-2">
              <Label>Hozzárendelt megrendelők</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-lg max-h-32 overflow-y-auto">
                {clients.map(client => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`client-${client.id}`}
                      checked={formData.assigned_clients.includes(client.id)}
                      onCheckedChange={(checked) => handleClientToggle(client.id, checked as boolean)}
                    />
                    <Label
                      htmlFor={`client-${client.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {client.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Jármű státusz</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as VehicleStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon státuszt" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="financing">Finanszírozás</Label>
                <Select
                  value={formData.financing}
                  onValueChange={(value) => setFormData({ ...formData, financing: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon típust" />
                  </SelectTrigger>
                  <SelectContent>
                    {financingOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Műszaki adatok */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Műszaki adatok</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_inspection">Érvényes műszaki vizsga dátuma</Label>
                <Input
                  id="valid_inspection"
                  type="date"
                  value={formData.valid_inspection}
                  onChange={(e) => setFormData({ ...formData, valid_inspection: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_inspection">Következő műszaki vizsga dátuma</Label>
                <Input
                  id="next_inspection"
                  type="date"
                  value={formData.next_inspection}
                  onChange={(e) => setFormData({ ...formData, next_inspection: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button onClick={handleSubmit}>
            Mentés
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
