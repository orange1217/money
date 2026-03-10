import React from 'react';
import { cn } from '@/lib/utils';
import { LotteryType } from '@/lib/lottery/types';
import { getLotteryTypeName } from '@/lib/lottery/rules';
import { Badge } from '@/components/ui/badge';

interface LotteryCardProps {
  type: LotteryType;
  selected: boolean;
  onClick: () => void;
  icon: string;
  description: string;
}

export const LotteryCard = React.memo(function LotteryCard({
  type,
  selected,
  onClick,
  icon,
  description
}: LotteryCardProps) {
  const colorMap: Record<LotteryType, string> = {
    [LotteryType.DOUBLE_COLOR]: 'from-red-500 to-blue-500',
    [LotteryType.SUPER_LOTTO]: 'from-blue-500 to-green-500',
    [LotteryType.HAPPY_8]: 'from-green-500 to-teal-500',
    [LotteryType.FUCAI_3D]: 'from-yellow-500 to-orange-500',
  };

  const name = getLotteryTypeName(type);

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02]',
        'group overflow-hidden min-h-[60px] sm:min-h-[72px]',
        {
          'border-primary bg-primary/5': selected,
          'border-border bg-card hover:border-primary/50': !selected,
        }
      )}
    >
      {/* 背景渐变效果 */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-200',
          'bg-gradient-to-br blur-2xl',
          colorMap[type],
          selected ? 'opacity-10' : 'group-hover:opacity-5'
        )}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-3xl sm:text-4xl">{icon}</div>
          <div className="text-left">
            <div className="font-semibold text-base sm:text-lg text-foreground">{name}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{description}</div>
          </div>
        </div>
        {selected && (
          <Badge variant="default" className="shrink-0 text-xs sm:text-sm">
            已选择
          </Badge>
        )}
      </div>
    </button>
  );
});
