const theme = require('./src/lib/theme').theme;

/**
 * Tailwind CSS configuration based on Clinical Precision DESIGN.md
 *
 * This configuration extracts design tokens from the DESIGN.md specification
 * and makes them available to Tailwind CSS utilities.
 */

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...theme.colors,
      },
      borderRadius: {
        ...theme.borderRadius,
      },
      spacing: {
        ...theme.spacing,
      },
      fontFamily: {
        ...theme.fontFamily,
      },
      boxShadow: {
        ...theme.boxShadow,
      },
      // Font sizes based on DESIGN.md typography
      fontSize: {
        // display-lg: 36px, 700 weight, 44px line-height
        'display-lg': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        // headline-lg: 28px, 600 weight, 36px line-height
        'headline-lg': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        // headline-lg-mobile: 24px, 600 weight, 32px line-height
        'headline-lg-mobile': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        // headline-md: 20px, 600 weight, 28px line-height
        'headline-md': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        // body-lg: 16px, 400 weight, 24px line-height
        'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        // body-md: 14px, 400 weight, 20px line-height
        'body-md': ['.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        // label-md: 12px, 600 weight, 16px line-height, 0.05em tracking
        'label-md': ['.75rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }],
        // data-mono: JetBrains Mono, 14px, 500 weight, 20px line-height
        'data-mono': ['.875rem', { lineHeight: '1.25rem', fontWeight: '500', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }],
      },
      // Custom animation definitions from DESIGN.md
      animation: {
        'spin-slow': 'spin-slow 1s linear infinite',
      },
      keyframes: {
        'spin-slow': {
          to: {
            transform: 'rotate(360deg)',
          },
        },
      },
    },
  },
  plugins: [],
};
