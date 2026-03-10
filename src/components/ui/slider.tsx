import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onValueChange([newValue]);
    };

    const percentage = ((value[0] - min) / (max - min)) * 100;

    return (
      <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className="absolute w-full cursor-pointer opacity-0"
          {...props}
        />
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background shadow-sm"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
