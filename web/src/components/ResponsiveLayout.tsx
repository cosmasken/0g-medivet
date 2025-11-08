/**
 * ResponsiveLayout Component
 * A responsive layout component that adapts to different screen sizes
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hasSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  sidebar,
  header,
  footer,
  hasSidebar = false,
  sidebarPosition = 'left'
}) => {
  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {header && <header className="sticky top-0 z-10 bg-white border-b">{header}</header>}
      
      <div className="flex flex-1 overflow-hidden">
        {hasSidebar && sidebarPosition === 'left' && (
          <aside className="hidden md:block w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        
        {hasSidebar && sidebarPosition === 'right' && (
          <aside className="hidden md:block w-64 bg-gray-50 border-l p-4 overflow-y-auto">
            {sidebar}
          </aside>
        )}
      </div>
      
      {footer && <footer className="border-t bg-gray-50 p-4">{footer}</footer>}
    </div>
  );
};

export default ResponsiveLayout;