// frontend/src/lib/theme.ts
/**
 * Clinical Precision Design System Theme
 *
 * This file defines the Tailwind CSS theme configuration based on DESIGN.md specifications.
 * All design tokens from DESIGN.md are mapped to Tailwind's @theme directive.
 */

export const theme = {
  // Colors from DESIGN.md
  colors: {
    // Primary - Pharma Teal
    primary: '#00685f',
    'on-primary': '#ffffff',
    'primary-container': '#008378',
    'on-primary-container': '#f4fffc',
    
    // Secondary - Medi-Blue
    secondary: '#006398',
    'on-secondary': '#ffffff',
    'secondary-container': '#5bb8fe',
    'on-secondary-container': '#00476e',
    
    // Tertiary - Safety Green
    tertiary: '#006b2c',
    'on-tertiary': '#ffffff',
    'tertiary-container': '#00873a',
    'on-tertiary-container': '#f7fff2',
    
    // Error
    error: '#ba1a1a',
    'on-error': '#ffffff',
    
    // Surface Palette
    background: '#f8f9ff',
    'on-background': '#0b1c30',
    'surface-container-lowest': '#ffffff',
    'surface-container-low': '#eff4ff',
    'surface-container': '#e5eeff',
    'surface-container-high': '#dce9ff',
    'surface-container-highest': '#d3e4fe',
    'surface-dim': '#cbdbf5',
    'surface-bright': '#f8f9ff',
    surface: '#f8f9ff',
    'on-surface': '#0b1c30',
    'on-surface-variant': '#3d4947',
    outline: '#6d7a77',
    'outline-variant': '#bcc9c6',
    'surface-tint': '#006a61',
    'surface-variant': '#d3e4fe',
    
    // Fixed Color Tokens
    'primary-fixed': '#89f5e7',
    'primary-fixed-dim': '#6bd8cb',
    'on-primary-fixed': '#00201d',
    'on-primary-fixed-variant': '#005049',
    'secondary-fixed': '#cce5ff',
    'secondary-fixed-dim': '#93ccff',
    'on-secondary-fixed': '#001d31',
    'on-secondary-fixed-variant': '#004b73',
    'tertiary-fixed': '#7ffc97',
    'tertiary-fixed-dim': '#62df7d',
    'on-tertiary-fixed': '#002109',
    'on-tertiary-fixed-variant': '#005320',
    
    // Override Colors (used for theme overrides)
    'override-neutral-color': '#64748b',
    'override-primary-color': '#0d9488',
    'override-secondary-color': '#0284c7',
    'override-tertiary-color': '#16a34a',
    
    // Derived Semantic Tokens
    foreground: '#0b1c30',
    card: '#ffffff',
    'card-foreground': '#0b1c30',
    accent: '#eff4ff',
    'accent-foreground': '#0b1c30',
    muted: '#eff4ff',
    'muted-foreground': '#3d4947',
    border: '#6d7a77',
    input: '#bcc9c6',
    ring: '#00685f',
    
    // Variant colors
    warning: '#ca8a04',
    'on-warning': '#ffffff',
    'warning-container': '#e5c24e',
    'on-warning-container': '#4a3a0e',
    destructive: '#ba1a1a',
    
    // Status colors
    success: '#006b2c',
    'success-foreground': '#ffffff',
    
    // Dark mode colors (referenced in DESIGN.md)
    'dark-background': '#0b1c30',
    'dark-on-background': '#eaf1ff',
    'dark-surface-container-lowest': '#213145',
    'dark-on-surface': '#eaf1ff',
    'dark-on-surface-variant': '#a3c2b0',
    'dark-inverse-surface': '#213145',
    'dark-inverse-on-surface': '#eaf1ff',
    'dark-inverse-primary': '#6bd8cb',
  },
  
  // Border radius from DESIGN.md
  borderRadius: {
    sm: '0.25rem',    // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px',  // pills
  },
  
  // Spacing tokens
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2.5rem',     // 40px
    containerMax: '90rem',  // 1440px
    gutter: '1.25rem',       // 20px
    marginDesktop: '2.5rem', // 40px
  },
  
  // Typography
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },
  
  // Shadow specifications from DESIGN.md
  boxShadow: {
    card: '0 4px 12px rgba(0, 0, 0, 0.04)',
    'card-hover': '0 6px 16px rgba(0, 0, 0, 0.06)',
    popover: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
};
