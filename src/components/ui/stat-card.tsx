import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className, iconClassName }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-2',
              trend.positive ? 'text-success' : 'text-destructive'
            )}>
              {trend.positive ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          iconClassName || 'bg-primary/10 text-primary'
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
