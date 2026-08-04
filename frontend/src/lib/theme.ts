// frontend/src/lib/theme.ts
/**
 * Clinical Precision Design System Theme
 *
 * This file provides the Tailwind CSS theme configuration based on
 * DESIGN.md specifications. All design tokens are also defined as CSS
 * custom properties in `globals.css` — this file serves as the
 * programmatic single-source-of-truth for runtime usage (e.g. inline
 * styles, dynamic color computation).
 *
 * Colors are stored in HSL format to match the CSS variables in globals.css,
 * enabling proper alpha compositing via the `/<alpha-value>` syntax.
 */

export const theme = {
  // Colors from DESIGN.md — mapped to HSL values matching globals.css
  colors: {
    // Primary — Pharma Teal  #00685f
    primary: 'hsl(175 100% 20%)',
    'on-primary': 'hsl(0 0% 100%)',
    'primary-container': 'hsl(175 100% 26%)',
    'on-primary-container': 'hsl(164 100% 98%)',
    'primary-fixed': 'hsl(172 84% 75%)',
    'primary-fixed-dim': 'hsl(173 58% 63%)',
    'on-primary-fixed': 'hsl(174 100% 6%)',
    'on-primary-fixed-variant': 'hsl(175 100% 16%)',

    // Secondary — Medi-Blue  #006398
    secondary: 'hsl(201 100% 30%)',
    'on-secondary': 'hsl(0 0% 100%)',
    'secondary-container': 'hsl(206 99% 68%)',
    'on-secondary-container': 'hsl(201 100% 22%)',
    'secondary-fixed': 'hsl(211 100% 90%)',
    'secondary-fixed-dim': 'hsl(207 100% 72%)',
    'on-secondary-fixed': 'hsl(204 100% 10%)',
    'on-secondary-fixed-variant': 'hsl(201 100% 23%)',

    // Tertiary — Safety Green  #006b2c
    tertiary: 'hsl(145 100% 21%)',
    'on-tertiary': 'hsl(0 0% 100%)',
    'tertiary-container': 'hsl(146 100% 26%)',
    'on-tertiary-container': 'hsl(97 100% 97%)',
    'tertiary-fixed': 'hsl(132 95% 74%)',
    'tertiary-fixed-dim': 'hsl(133 66% 63%)',
    'on-tertiary-fixed': 'hsl(136 100% 6%)',
    'on-tertiary-fixed-variant': 'hsl(143 100% 16%)',

    // Error  #ba1a1a
    error: 'hsl(0 75% 42%)',
    'on-error': 'hsl(0 0% 100%)',
    'error-container': 'hsl(0 75% 55%)',
    'on-error-container': 'hsl(0 0% 98%)',

    // Warning (Amber)  #ca8a04 — Low Stock / Caution states
    warning: 'hsl(41 96% 40%)',
    'on-warning': 'hsl(0 0% 100%)',
    'warning-container': 'hsl(46 74% 60%)',
    'on-warning-container': 'hsl(44 68% 17%)',

    // Status aliases (semantic)
    success: 'hsl(145 100% 21%)', // = tertiary
    'success-foreground': 'hsl(0 0% 100%)', // = on-tertiary
    destructive: 'hsl(0 75% 42%)', // = error
    'destructive-foreground': 'hsl(0 0% 100%)', // = on-error

    // Surface Palette (Light Mode)
    background: 'hsl(231 100% 99%)',
    'on-background': 'hsl(212 63% 12%)',
    'surface-container-lowest': 'hsl(0 0% 100%)',
    'surface-container-low': 'hsl(221 100% 97%)',
    'surface-container': 'hsl(219 100% 95%)',
    'surface-container-high': 'hsl(218 100% 93%)',
    'surface-container-highest': 'hsl(216 96% 91%)',
    'surface-dim': 'hsl(217 68% 88%)',
    'surface-bright': 'hsl(231 100% 99%)',
    surface: 'hsl(231 100% 99%)',
    'on-surface': 'hsl(212 63% 12%)',
    'on-surface-variant': 'hsl(170 9% 26%)',
    outline: 'hsl(166 6% 45%)',
    'outline-variant': 'hsl(166 11% 76%)',
    'surface-tint': 'hsl(175 100% 21%)',
    'surface-variant': 'hsl(216 96% 91%)',

    // Derived Semantic Tokens
    foreground: 'hsl(212 63% 12%)', // = on-background
    card: 'hsl(0 0% 100%)', // = surface-container-lowest
    'card-foreground': 'hsl(212 63% 12%)', // = on-surface
    accent: 'hsl(221 100% 97%)', // = surface-container-low
    'accent-foreground': 'hsl(212 63% 12%)',
    muted: 'hsl(221 100% 97%)', // = surface-container-low
    'muted-foreground': 'hsl(170 9% 26%)', // = on-surface-variant
    border: 'hsl(166 6% 45%)', // = outline
    input: 'hsl(166 11% 76%)', // = outline-variant
    ring: 'hsl(175 100% 20%)', // = primary
    popover: 'hsl(219 100% 95%)', // = surface-container
    'popover-foreground': 'hsl(212 63% 12%)',

    // Chart colors for analytics
    'chart-1': 'hsl(175 100% 20%)', // primary
    'chart-2': 'hsl(201 100% 30%)', // secondary
    'chart-3': 'hsl(145 100% 21%)', // tertiary
    'chart-4': 'hsl(41 96% 40%)', // warning
    'chart-5': 'hsl(216 96% 91%)', // surface-container-highest

    // Sidebar tokens (shadcn v4)
    sidebar: 'hsl(0 0% 100%)',
    'sidebar-foreground': 'hsl(212 63% 12%)',
    'sidebar-primary': 'hsl(175 100% 20%)',
    'sidebar-primary-foreground': 'hsl(0 0% 100%)',
    'sidebar-accent': 'hsl(221 100% 97%)',
    'sidebar-accent-foreground': 'hsl(212 63% 12%)',
    'sidebar-border': 'hsl(166 11% 76%)',
    'sidebar-ring': 'hsl(175 100% 20%)',

    // ── Dark mode colors (for runtime use) ──────────────────────

    // Dark: Surface
    'dark-background': 'hsl(212 63% 12%)',
    'dark-on-background': 'hsl(220 100% 96%)',
    'dark-surface-container-lowest': 'hsl(218 45% 16%)',
    'dark-on-surface': 'hsl(220 100% 96%)',
    'dark-on-surface-variant': 'hsl(145 20% 70%)',
    'dark-inverse-surface': 'hsl(218 45% 16%)',
    'dark-inverse-on-surface': 'hsl(220 100% 96%)',
    'dark-inverse-primary': 'hsl(173 58% 63%)',

    // Dark: Primary
    'dark-primary': 'hsl(173 58% 63%)',
    'dark-on-primary': 'hsl(172 100% 11%)',

    // Dark: Secondary
    'dark-secondary': 'hsl(208 100% 79%)',
    'dark-on-secondary': 'hsl(208 100% 15%)',

    // Dark: Tertiary
    'dark-tertiary': 'hsl(133 66% 63%)',
    'dark-on-tertiary': 'hsl(144 100% 11%)',

    // Dark: Warning
    'dark-warning': 'hsl(41 73% 59%)',
    'dark-on-warning': 'hsl(44 68% 17%)',

    // Dark: Error
    'dark-error': 'hsl(0 100% 71%)',
    'dark-on-error': 'hsl(172 100% 11%)',
  },

  // Border radius from DESIGN.md
  borderRadius: {
    sm: '0.25rem', // 4px — small elements, compact UI
    DEFAULT: '0.5rem', // 8px — base: buttons, input fields
    md: '0.75rem', // 12px — medium-radius containers
    lg: '1rem', // 16px — KPI cards, modals, containers
    xl: '1.5rem', // 24px — large containers, section headers
    full: '9999px', // pills — status chips
  },

  // Spacing tokens (8px base rhythm)
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2.5rem', // 40px
    containerMax: '90rem', // 1440px
    gutter: '1.25rem', // 20px
    marginDesktop: '2.5rem', // 40px
  },

  // Typography from DESIGN.md
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },

  // Typography scale (matches globals.css utility classes)
  fontSize: {
    'display-lg': [
      '1.5rem',
      { lineHeight: '2.75rem', fontWeight: '700', letterSpacing: '-0.02em' },
    ],
    'headline-lg': [
      '1.75rem',
      { lineHeight: '2.25rem', fontWeight: '600', letterSpacing: '-0.01em' },
    ],
    'headline-md': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
    'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
    'body-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
    'body-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
    'label-md': ['0.75rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.05em' }],
    'data-mono': [
      '0.875rem',
      { lineHeight: '1.25rem', fontWeight: '500', fontFamily: 'JetBrains Mono' },
    ],
  },

  // Shadow specifications from DESIGN.md
  boxShadow: {
    card: '0 4px 12px hsl(0 0% 0 / 0.04)',
    'card-hover': '0 6px 16px hsl(0 0% 0 / 0.06)',
    popover: '0 4px 12px hsl(0 0% 0 / 0.08)',
    sm: '0 1px 2px hsl(0 0% 0 / 0.05)',
    default: '0 1px 3px hsl(0 0% 0 / 0.1), 0 1px 2px hsl(0 0% 0 / 0.06)',
    md: '0 4px 6px hsl(0 0% 0 / 0.07)',
    lg: '0 10px 15px hsl(0 0% 0 / 0.1)',
  },
};
