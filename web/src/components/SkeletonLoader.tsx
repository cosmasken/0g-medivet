/**
 * SkeletonLoader Component
 * A reusable skeleton loader for content placeholders
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  variant?: 'text' | 'rectangular' | 'circular' | 'avatar' | 'card';
  width?: string | number;
  height?: string | number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  count = 1,
  variant = 'text',
  width,
  height
}) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md";
  
  let variantClasses = '';
  switch (variant) {
    case 'rectangular':
      variantClasses = 'w-full h-48';
      break;
    case 'circular':
      variantClasses = 'w-12 h-12 rounded-full';
      break;
    case 'avatar':
      variantClasses = 'w-10 h-10 rounded-full';
      break;
    case 'card':
      variantClasses = 'w-full h-64 rounded-xl';
      break;
    default: // text
      variantClasses = 'w-full h-4';
  }

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(baseClasses, variantClasses, className)}
          style={style}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;