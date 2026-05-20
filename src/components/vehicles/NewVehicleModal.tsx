import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { clients } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const vehicleCategories = [
  { value: 'mikro', label: 'Mikrobusz' },
  { value: 'minibusz', label: 'Minibusz' },
  { value: 'midibusz', label: 'Midibusz' },
  { value: 'turista', label: 'Turistabusz' },
  { value: 'alacsonypadlós', label: 'Alacsonypadlós busz' },
  { value: 'szerviz', label: 'Szerviz gépkocsi' },
  { value: 'szemelygepkocsi', label: 'Személygépkocsi' },
];

const vehicleStatuses = [
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

const formSchema = z.object({
  plate: z.string().min(1, 'Rendszám megadása kötelező'),
  year: z.coerce.number().min(1900, 'Érvénytelen évjárat').max(new Date().getFullYear() + 1, 'Érvénytelen évjárat'),
  category: z.string().min(1, 'Kategória kiválasztása kötelező'),
  seats: z.coerce.number().optional(),
  passenger_seats: z.coerce.number().optional(),
  start_km: z.coerce.number().optional(),
  start_km_date: z.date().optional(),
  current_km: z.coerce.number().optional(),
  assigned_clients: z.array(z.string()).default([]),
  status: z.string().min(1, 'Státusz kiválasztása kötelező'),
  financing: z.string().optional(),
  valid_inspection: z.date().optional(),
  next_inspection: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleCreated: () => void;
}

export function NewVehicleModal({ open, onOpenChange, onVehicleCreated }: NewVehicleModalProps) {
  const { vehicles, addVehicle } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: '',
      year: new Date().getFullYear(),
      category: '',
      seats: undefined,
      passenger_seats: undefined,
      start_km: 0,
      current_km: 0,
      assigned_clients: [],
      status: 'aktív',
      financing: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    // Check if plate already exists
    const plateExists = vehicles.some(
      (v) => v.plate.toLowerCase() === data.plate.toLowerCase()
    );

    if (plateExists) {
      form.setError('plate', { message: 'Ez a rendszám már létezik.' });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - in real app, this would save to database
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create new vehicle (for mock data)
    const newVehicle = {
      id: String(vehicles.length + 1),
      plate: data.plate.toUpperCase(),
      category: data.category as any,
      seats: data.seats || 0,
      status: data.status as any,
      year: data.year,
      start_km: data.start_km || 0,
      current_km: data.current_km || 0,
      next_inspection: data.next_inspection ? format(data.next_inspection, 'yyyy-MM-dd') : undefined,
      assigned_clients: data.assigned_clients,
    };

    // Add via global state
    addVehicle(newVehicle);


    setIsSubmitting(false);
    toast.success('Jármű sikeresen létrehozva.');
    form.reset();
    onOpenChange(false);
    onVehicleCreated();
  };

  const handleClientToggle = (clientId: string, checked: boolean) => {
    const current = form.getValues('assigned_clients');
    if (checked) {
      form.setValue('assigned_clients', [...current, clientId]);
    } else {
      form.setValue('assigned_clients', current.filter((id) => id !== clientId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Új jármű hozzáadása</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Alapadatok */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                Alapadatok
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rendszám *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-123" {...field} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Évjárat *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Járműkategória *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Válasszon kategóriát" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Férőhelyek száma</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passenger_seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utasülések száma</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kezdő km állás</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_km_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Kezdő km állás dátuma</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'yyyy.MM.dd', { locale: hu }) : 'Válasszon dátumot'}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="current_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jelenlegi km állás</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Megrendelők és státusz */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                Megrendelők és státusz
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assigned_clients"
                  render={() => (
                    <FormItem className="col-span-2">
                      <FormLabel>Hozzárendelt megrendelők</FormLabel>
                      <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-background">
                        {clients.map((client) => (
                          <div key={client.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`client-${client.id}`}
                              checked={form.watch('assigned_clients').includes(client.id)}
                              onCheckedChange={(checked) =>
                                handleClientToggle(client.id, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`client-${client.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {client.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jármű státusz *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Válasszon státuszt" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="financing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finanszírozás</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Válasszon típust" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {financingOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Műszaki adatok */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                Műszaki adatok
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valid_inspection"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Érvényes műszaki vizsga dátuma</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'yyyy.MM.dd', { locale: hu }) : 'Válasszon dátumot'}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="next_inspection"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Következő műszaki vizsga dátuma</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'yyyy.MM.dd', { locale: hu }) : 'Válasszon dátumot'}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Mégse
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Mentés...' : 'Mentés'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
