import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  circle?: boolean;
}

export default function Skeleton({
  className = '',
  width,
  height,
  circle = false,
}: SkeletonProps) {
  return (
    <div
      style={{
        width: width,
        height: height,
      }}
      className={`shimmer-bg ${circle ? 'rounded-full' : 'rounded-sm'} ${className}`}
    />
  );
}
