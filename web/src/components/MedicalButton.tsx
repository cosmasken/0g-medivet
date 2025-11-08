/**
 * MedicalButton Component
 * A consistent button component for medical actions
 */

import React from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MedicalButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MedicalButton: React.FC<MedicalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  onClick
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200',
    success: 'bg-green-600 hover:bg-green-700 text-white border border-green-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-500',
    error: 'bg-red-600 hover:bg-red-700 text-white border border-red-600',
    outline: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent'
  };

  const disabledClass = 'opacity-50 cursor-not-allowed';

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    sizeClasses[size],
    variantClasses[variant],
    disabled || loading ? disabledClass : '',
    className
  );

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <span className="mr-2">
          <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} />
        </span>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default MedicalButton;