import React from 'react';
import { cn } from '@/lib/utils';
import { NumberBall as NumberBallType, BallColor } from '@/lib/lottery/types';

interface NumberBallProps {
  ball: NumberBallType;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  delay?: number;
  index?: number;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl font-bold'
};

const colorClasses: Record<BallColor, string> = {
  red: 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 border-red-700 shadow-red-500/30',
  blue: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-blue-700 shadow-blue-500/30',
  green: 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 border-green-700 shadow-green-500/30',
  yellow: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-yellow-700 shadow-yellow-500/30',
};

export const NumberBall = React.memo(function NumberBall({
  ball,
  size = 'md',
  animated = false,
  delay = 0,
  index = 0
}: NumberBallProps) {
  const ballColor: BallColor = ball.color || 'red';

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border-2 text-white shadow-lg',
        'transition-all duration-300',
        sizeClasses[size],
        colorClasses[ballColor],
        ball.isSpecial && 'ring-4 ring-yellow-400/50 ring-offset-2 ring-offset-background',
        animated && 'animate-number-appear'
      )}
      style={{
        animationDelay: `${delay + index * 80}ms`,
        transform: animated ? 'scale(1)' : 'scale(0.95)',
      }}
    >
      {typeof ball.value === 'number' && ball.value < 10
        ? `0${ball.value}`
        : ball.value}
    </div>
  );
});
