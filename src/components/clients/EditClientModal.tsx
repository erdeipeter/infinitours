import { useState } from 'react';
import { Client } from '@/types';
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

interface EditClientModalProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedClient: Client) => void;
}

export function EditClientModal({ client, open, onOpenChange, onSave }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    name: client.name,
    primary_color: client.primary_color,
    subdomain: client.subdomain,
    discord_webhook_url: (client as any).discord_webhook_url || '',
    description: (client as any).description || '',
    holidays: (client as any).holidays || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'A név megadása kötelező.';
    }
    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Az aldomain megadása kötelező.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedClient: Client = {
      ...client,
      name: formData.name.trim(),
      primary_color: formData.primary_color,
      subdomain: formData.subdomain.trim(),
    };

    // Store additional fields in metadata if needed
    (updatedClient as any).discord_webhook_url = formData.discord_webhook_url;
    (updatedClient as any).description = formData.description;
    (updatedClient as any).holidays = formData.holidays;

    onSave(updatedClient);
    toast.success('Megrendelő adatai mentve.');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Megrendelő szerkesztése</DialogTitle>
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
              placeholder="Megrendelő neve"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Aldomain *</Label>
            <Input
              id="subdomain"
              value={formData.subdomain}
              onChange={(e) => {
                setFormData({ ...formData, subdomain: e.target.value });
                if (errors.subdomain) setErrors({ ...errors, subdomain: '' });
              }}
              placeholder="aldomain"
            />
            {errors.subdomain && <p className="text-sm text-destructive">{errors.subdomain}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_color">Alapszín</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="primary_color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-12 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                placeholder="#000000"
                className="flex-1 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discord_webhook_url">Discord webhook URL</Label>
            <Input
              id="discord_webhook_url"
              value={formData.discord_webhook_url}
              onChange={(e) => setFormData({ ...formData, discord_webhook_url: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Leírás</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Megrendelő leírása..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holidays">Szünnapok</Label>
            <Textarea
              id="holidays"
              value={formData.holidays}
              onChange={(e) => setFormData({ ...formData, holidays: e.target.value })}
              placeholder="2024-12-24, 2024-12-25, 2025-01-01..."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">Vesszővel elválasztva</p>
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
