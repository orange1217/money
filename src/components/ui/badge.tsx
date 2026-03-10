import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'bg-primary text-primary-foreground hover:bg-primary/80': variant === 'default',
          'border border-border bg-background text-foreground': variant === 'outline',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
        },
        className
      )}
      {...props}
    />
  );
}
