"use client"

import { useState, useEffect } from 'react';

interface CircularProgressBarProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
}

export function CircularProgressBar({
  progress,
  size = 80,
  strokeWidth = 8,
  circleColor = 'var(--chart-1)'
}: CircularProgressBarProps) {
  const [offset, setOffset] = useState(0);
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    const progressOffset = ((100 - progress) / 100) * circumference;
    setOffset(progressOffset);
  }, [progress, circumference]);
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={circleColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
        
        {/* Display Progress Text */}
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fontSize="1.2rem"
          fontWeight="bold"
          fill="currentColor"
        >
          {`${progress}%`}
        </text>
      </svg>
    </div>
  );
}