import { cn } from '@/lib/utils';

type StatusType = 'aktív' | 'tartalék' | 'inaktív' | 'Új' | 'Véglegesítésre vár' | 'Véglegesítve' | 'early' | 'ontime' | 'late';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  'aktív': 'status-badge status-active',
  'tartalék': 'status-badge status-reserve',
  'inaktív': 'status-badge status-inactive',
  'Új': 'status-badge status-new',
  'Véglegesítésre vár': 'status-badge status-pending',
  'Véglegesítve': 'status-badge status-confirmed',
  'early': 'status-badge timing-early',
  'ontime': 'status-badge timing-ontime',
  'late': 'status-badge timing-late',
};

const statusLabels: Record<StatusType, string> = {
  'aktív': 'Aktív',
  'tartalék': 'Tartalék',
  'inaktív': 'Inaktív',
  'Új': 'Új',
  'Véglegesítésre vár': 'Véglegesítésre vár',
  'Véglegesítve': 'Véglegesítve',
  'early': 'Korán',
  'ontime': 'Időben',
  'late': 'Késés',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusStyles[status], className)}>
      {statusLabels[status]}
    </span>
  );
}
