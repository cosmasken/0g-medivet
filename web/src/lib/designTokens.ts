/**
 * Design Tokens
 * Consistent design system for the MediVet platform
 */

// Color palette
export const colors = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  // Secondary colors
  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Success, warning, error colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbf0',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Background and text colors
  background: {
    default: '#ffffff',
    paper: '#f9fafb',
    surface: '#f3f4f6'
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af',
    inverse: '#ffffff'
  }
};

// Spacing scale
export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
};

// Typography scale
export const typography = {
  h1: {
    fontSize: '2.5rem',    // 40px
    lineHeight: '3rem',    // 48px
    fontWeight: '600',
  },
  h2: {
    fontSize: '2rem',      // 32px
    lineHeight: '2.5rem',  // 40px
    fontWeight: '600',
  },
  h3: {
    fontSize: '1.5rem',    // 24px
    lineHeight: '2rem',    // 32px
    fontWeight: '600',
  },
  h4: {
    fontSize: '1.25rem',   // 20px
    lineHeight: '1.75rem', // 28px
    fontWeight: '600',
  },
  body: {
    fontSize: '1rem',      // 16px
    lineHeight: '1.5rem',  // 24px
    fontWeight: '400',
  },
  small: {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.25rem', // 20px
    fontWeight: '400',
  },
  xsmall: {
    fontSize: '0.75rem',   // 12px
    lineHeight: '1rem',    // 16px
    fontWeight: '400',
  },
};

// Breakpoints
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Common shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
};

// Border radius
export const borderRadius = {
  sm: '0.125rem',  // 2px
  md: '0.25rem',   // 4px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
};

// Z-index values
export const zIndex = {
  modal: 1000,
  drawer: 1100,
  dropdown: 1200,
  toast: 1300,
  tooltip: 1400,
};

// Transitions
export const transitions = {
  ease: 'all 0.2s ease',
  easeIn: 'all 0.2s ease-in',
  easeOut: 'all 0.2s ease-out',
  easeInOut: 'all 0.2s ease-in-out',
  quick: 'all 0.1s ease',
};

// Components
export const components = {
  button: {
    primary: {
      background: colors.primary[600],
      color: colors.text.inverse,
      hover: colors.primary[700],
      active: colors.primary[800],
    },
    secondary: {
      background: colors.secondary[100],
      color: colors.text.primary,
      hover: colors.secondary[200],
      active: colors.secondary[300],
    },
    success: {
      background: colors.success[600],
      color: colors.text.inverse,
      hover: colors.success[700],
      active: colors.success[800],
    },
    error: {
      background: colors.error[600],
      color: colors.text.inverse,
      hover: colors.error[700],
      active: colors.error[800],
    },
  },
  card: {
    background: colors.background.paper,
    border: colors.secondary[200],
    borderRadius: borderRadius.lg,
    shadow: shadows.md,
  },
  input: {
    border: colors.secondary[300],
    borderRadius: borderRadius.md,
    focus: colors.primary[500],
    error: colors.error[500],
  }
};