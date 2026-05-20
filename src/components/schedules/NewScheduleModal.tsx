import { useState } from 'react';
import { Schedule } from '@/types';
import { fuelBrackets } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
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
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface NewScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleCreated: (schedule: Schedule) => void;
}

interface ScheduleStop {
  stop_id: string;
  sequence: number;
  planned_time: string;
}

export function NewScheduleModal({ open, onOpenChange, onScheduleCreated }: NewScheduleModalProps) {
  const { lines, stops, addSchedule, addStop: addStopGlobal, addLine } = useData();
  const [newStopName, setNewStopName] = useState('');
  const [newLineName, setNewLineName] = useState('');
  const [formData, setFormData] = useState({
    line_id: '',
    valid_from: '',
    valid_to: '',
    fuel_bracket_id: '',
  });
  const [scheduleStops, setScheduleStops] = useState<ScheduleStop[]>([
    { stop_id: '', sequence: 1, planned_time: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      line_id: '',
      valid_from: '',
      valid_to: '',
      fuel_bracket_id: '',
    });
    setScheduleStops([{ stop_id: '', sequence: 1, planned_time: '' }]);
    setErrors({});
  };

  const addStop = () => {
    setScheduleStops([
      ...scheduleStops,
      { stop_id: '', sequence: scheduleStops.length + 1, planned_time: '' }
    ]);
  };

  const removeStop = (index: number) => {
    if (scheduleStops.length <= 1) return;
    const newStops = scheduleStops.filter((_, i) => i !== index);
    // Update sequence numbers
    setScheduleStops(newStops.map((stop, i) => ({ ...stop, sequence: i + 1 })));
  };

  const updateStop = (index: number, field: keyof ScheduleStop, value: string | number) => {
    const newStops = [...scheduleStops];
    newStops[index] = { ...newStops[index], [field]: value };
    setScheduleStops(newStops);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.line_id) {
      newErrors.line_id = 'A járat kiválasztása kötelező.';
    }
    if (!formData.valid_from) {
      newErrors.valid_from = 'Az érvényesség kezdete kötelező.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newSchedule: Schedule = {
      id: `schedule-${Date.now()}`,
      line_id: formData.line_id,
      valid_from: formData.valid_from,
      valid_to: formData.valid_to || undefined,
      fuel_bracket_id: formData.fuel_bracket_id || undefined,
    };

    // Store schedule stops in metadata
    (newSchedule as any).stops = scheduleStops.filter(s => s.stop_id && s.planned_time);

    // Add via global state
    addSchedule(newSchedule);
    
    onScheduleCreated(newSchedule);
    toast.success('Menetrend létrehozva.');
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Új menetrend létrehozása</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="line_id">Járat kiválasztása *</Label>
              <Select
                value={formData.line_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, line_id: value });
                  if (errors.line_id) setErrors({ ...errors, line_id: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon járatot" />
                </SelectTrigger>
                <SelectContent>
                  {lines.map(line => (
                    <SelectItem key={line.id} value={line.id}>{line.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.line_id && <p className="text-sm text-destructive">{errors.line_id}</p>}
              <div className="flex gap-2 pt-1">
                <Input
                  placeholder="Új járat neve..."
                  value={newLineName}
                  onChange={(e) => setNewLineName(e.target.value)}
                  className="h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!newLineName.trim()) return;
                    const id = `line-${Date.now()}`;
                    addLine({
                      id,
                      client_id: '1',
                      name: newLineName.trim(),
                      type: 'fix',
                      stops_count: 0,
                      shifts_count: 0,
                    });
                    setFormData({ ...formData, line_id: id });
                    setNewLineName('');
                    toast.success('Új járat hozzáadva.');
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Új járat
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Érvényesség kezdete *</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => {
                    setFormData({ ...formData, valid_from: e.target.value });
                    if (errors.valid_from) setErrors({ ...errors, valid_from: '' });
                  }}
                />
                {errors.valid_from && <p className="text-sm text-destructive">{errors.valid_from}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_to">Érvényesség vége</Label>
                <Input
                  id="valid_to"
                  type="date"
                  value={formData.valid_to}
                  onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_bracket_id">Ársáv / Üzemanyag ársáv</Label>
              <Select
                value={formData.fuel_bracket_id}
                onValueChange={(value) => setFormData({ ...formData, fuel_bracket_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon ársávot" />
                </SelectTrigger>
                <SelectContent>
                  {fuelBrackets.map(bracket => (
                    <SelectItem key={bracket.id} value={bracket.id}>
                      {bracket.month} - {bracket.revenue_value} Ft/km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stops */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Megállók</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStop}>
                <Plus className="w-4 h-4 mr-1" />
                Megálló hozzáadása
              </Button>
            </div>

            <div className="space-y-3">
              {scheduleStops.map((scheduleStop, index) => (
                <div key={index} className="flex items-end gap-3 p-3 border border-border rounded-lg bg-muted/30">
                  <div className="w-12 h-8 flex items-center justify-center bg-primary/10 rounded text-primary font-semibold text-sm">
                    {scheduleStop.sequence}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Megálló</Label>
                    <Select
                      value={scheduleStop.stop_id}
                      onValueChange={(value) => updateStop(index, 'stop_id', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Válasszon megállót" />
                      </SelectTrigger>
                      <SelectContent>
                        {stops.map(stop => (
                          <SelectItem key={stop.id} value={stop.id}>{stop.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28 space-y-1">
                    <Label className="text-xs">Tervezett idő</Label>
                    <Input
                      type="time"
                      value={scheduleStop.planned_time}
                      onChange={(e) => updateStop(index, 'planned_time', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => removeStop(index)}
                    disabled={scheduleStops.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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
