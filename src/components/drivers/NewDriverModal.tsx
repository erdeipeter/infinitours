import { useState } from 'react';
import { Driver } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface NewDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDriverCreated: (driver: Driver) => void;
}

export function NewDriverModal({ open, onOpenChange, onDriverCreated }: NewDriverModalProps) {
  const { drivers, addDriver } = useData();
  const [formData, setFormData] = useState({
    name: '',
    chip_id: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      chip_id: '',
      phone: '',
      notes: '',
    });
    setErrors({});
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'A név megadása kötelező.';
    }
    if (!formData.chip_id.trim()) {
      newErrors.chip_id = 'Az azonosító megadása kötelező.';
    } else {
      const existingDriver = drivers.find(
        d => d.chip_id.toLowerCase() === formData.chip_id.toLowerCase()
      );
      if (existingDriver) {
        newErrors.chip_id = 'Ez az azonosító már létezik.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newDriver: Driver = {
      id: `driver-${Date.now()}`,
      name: formData.name.trim(),
      chip_id: formData.chip_id.trim().toUpperCase(),
      phone: formData.phone.trim(),
      accuracy_percent: 100, // New drivers start with 100%
    };

    // Store notes in metadata if needed
    (newDriver as any).notes = formData.notes;

    // Add to drivers array (mock persistence)
    drivers.push(newDriver);
    
    onDriverCreated(newDriver);
    toast.success('Sofőr létrehozva.');
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Új sofőr hozzáadása</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Név *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Sofőr neve"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chip_id">Azonosító (csippantó kód) *</Label>
            <Input
              id="chip_id"
              value={formData.chip_id}
              onChange={(e) => {
                setFormData({ ...formData, chip_id: e.target.value });
                if (errors.chip_id) setErrors({ ...errors, chip_id: '' });
              }}
              placeholder="DRV-007"
              className="font-mono"
            />
            {errors.chip_id && <p className="text-sm text-destructive">{errors.chip_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefonszám</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+36 30 123 4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Megjegyzés</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="További megjegyzések..."
              rows={2}
            />
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
