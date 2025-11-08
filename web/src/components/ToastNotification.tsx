/**
 * Toast Notification System
 * A reusable toast notification component using Radix UI and Sonner
 */

import React, { useEffect, useState } from 'react';
import { Toaster, toast as sonnerToast, ToastOptions } from 'sonner';
import { Button } from '@/components/ui/button';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastSystem {
  success: (title: string, description?: string, options?: ToastOptions) => void;
  error: (title: string, description?: string, options?: ToastOptions) => void;
  info: (title: string, description?: string, options?: ToastOptions) => void;
  warning: (title: string, description?: string, options?: ToastOptions) => void;
  custom: (title: string, description?: string, options?: ToastOptions) => void;
}

export const useToast: () => ToastSystem = () => {
  const showToast = (
    variant: 'default' | 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string,
    options?: ToastOptions
  ) => {
    const toastContent = (
      <div className="flex flex-col gap-1">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm opacity-80">{description}</div>}
      </div>
    );

    switch (variant) {
      case 'success':
        sonnerToast.success(toastContent, options);
        break;
      case 'error':
        sonnerToast.error(toastContent, options);
        break;
      case 'warning':
        sonnerToast.warning(toastContent, options);
        break;
      case 'info':
        sonnerToast.info(toastContent, options);
        break;
      default:
        sonnerToast(toastContent, options);
    }
  };

  return {
    success: (title, description, options) => showToast('success', title, description, options),
    error: (title, description, options) => showToast('error', title, description, options),
    info: (title, description, options) => showToast('info', title, description, options),
    warning: (title, description, options) => showToast('warning', title, description, options),
    custom: (title, description, options) => showToast('default', title, description, options)
  };
};

// Default Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(0, 0%, 100%)',
            color: 'hsl(222.2, 84%, 4.9%)',
          },
          classNames: {
            toast: 'bg-white border border-gray-200 shadow-lg rounded-lg',
            error: 'bg-red-50 border-red-200',
            success: 'bg-green-50 border-green-200',
            warning: 'bg-yellow-50 border-yellow-200',
            info: 'bg-blue-50 border-blue-200',
          }
        }}
      />
    </>
  );
};

// Default toast function for simple use
export const toast = {
  success: (title: string, description?: string, options?: ToastOptions) => 
    sonnerToast.success(
      <div className="flex flex-col gap-1">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm opacity-80">{description}</div>}
      </div>,
      { ...options, duration: options?.duration || 4000 }
    ),
  error: (title: string, description?: string, options?: ToastOptions) => 
    sonnerToast.error(
      <div className="flex flex-col gap-1">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm opacity-80">{description}</div>}
      </div>,
      { ...options, duration: options?.duration || 6000 }
    ),
  info: (title: string, description?: string, options?: ToastOptions) => 
    sonnerToast.info(
      <div className="flex flex-col gap-1">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm opacity-80">{description}</div>}
      </div>,
      { ...options, duration: options?.duration || 4000 }
    ),
  warning: (title: string, description?: string, options?: ToastOptions) => 
    sonnerToast.warning(
      <div className="flex flex-col gap-1">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm opacity-80">{description}</div>}
      </div>,
      { ...options, duration: options?.duration || 5000 }
    )
};