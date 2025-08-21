import * as React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'green' | 'red' | 'yellow';
  className?: string;
}

export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 4,
  color = 'primary',
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    secondary: 'stroke-secondary',
    green: 'stroke-green-500',
    red: 'stroke-red-500',
    yellow: 'stroke-yellow-500',
  };

  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="stroke-gray-200 fill-none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress circle */}
      <svg
        className="absolute inset-0 h-full w-full rotate-[-90deg]"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className={cn('fill-none transition-all duration-200 ease-in-out', colorClasses[color])}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
} 