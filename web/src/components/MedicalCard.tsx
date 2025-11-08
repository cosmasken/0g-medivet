/**
 * MedicalCard Component
 * A consistent card component for medical records and related content
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { components, colors } from '@/lib/designTokens';

interface MedicalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'warning' | 'critical';
  border?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const MedicalCard: React.FC<MedicalCardProps> = ({
  children,
  className,
  variant = 'default',
  border = true,
  padding = 'md',
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const variantClasses = {
    default: `bg-white ${border ? 'border border-gray-200' : ''}`,
    highlight: `bg-blue-50 border border-blue-200`,
    warning: `bg-yellow-50 border border-yellow-200`,
    critical: `bg-red-50 border border-red-200`
  };

  const baseClasses = cn(
    'rounded-lg shadow-sm',
    paddingClasses[padding],
    variantClasses[variant],
    onClick && 'cursor-pointer hover:shadow-md transition-shadow',
    className
  );

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default MedicalCard;