---
name: Clinical Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#006b2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00873a'
  on-tertiary-container: '#f7fff2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1440px
  gutter: 20px
---

## Brand & Style

The design system is engineered for high-stakes pharmacy environments where clarity, speed, and trust are paramount. The brand personality is clinical yet accessible, prioritizing cognitive ease to reduce dispensing errors.

The visual style follows a **Corporate / Modern** approach with elements of **Minimalism**. It utilizes expansive white space in light mode and deep structured layers in dark mode to organize complex medical data. The interface avoids unnecessary decoration, using functional color and purposeful geometry to guide the pharmacist’s workflow. The aesthetic response should be one of calm reliability and professional authority.

## Colors

This design system utilizes a palette rooted in healthcare stability.

- **Primary (Pharma Teal):** Used for primary actions, active navigation states, and brand-critical elements. It signals professional health services.
- **Secondary (Medi-Blue):** Applied to informational callouts, secondary buttons, and data visualization categories related to patient records.
- **Tertiary (Safety Green):** Specifically reserved for "In Stock," "Verified," and "Success" states to provide immediate positive reinforcement.
- **Neutral:** A range of cool slates (`#0F172A` to `#F8FAFC`) that manage structural hierarchy without competing with functional colors.

**Color Modes:**

- **Light Mode:** Uses a "Soft Gray" surface (`#F1F5F9`) to reduce glare during long shifts, with high-contrast text (`#0F172A`) for maximum legibility.
- **Dark Mode:** Employs a "Deep Navy" foundation (`#020617`). Surfaces use subtle shifts in luminosity to define depth rather than heavy borders, with vibrant accents to maintain accessibility.

## Typography

Inter is the foundational typeface, selected for its exceptional legibility in data-dense environments and its neutral, professional tone.

- **Headlines:** Use semi-bold weights with slight negative letter-spacing to create a "locked-in" professional look.
- **Data Display:** For drug SKUs, dosages, and quantities, use `data-mono` (JetBrains Mono) to ensure numerical clarity and prevent character confusion (e.g., '0' vs 'O').
- **Labels:** Uppercase labels with increased letter-spacing are used for table headers and small metadata categories to differentiate them from actionable body text.

## Layout & Spacing

The design system employs a **Fluid Grid** with fixed-width constraints for maximum readability on large pharmacy monitors.

- **Grid:** A 12-column system on desktop, collapsing to 4 columns on mobile.
- **Margins:** Large 40px margins on desktop to allow the interface to "breathe," reducing the feeling of clutter in complex inventory screens.
- **Rhythm:** An 8px linear scale governs all padding and margins.
- **Adaptation:** On tablet (POS terminals), touch targets for medications and quantity selectors must maintain a minimum height of 48px, utilizing `md` spacing (16px) between interactive elements.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**.

- **Surface Levels:** The background is the lowest level. KPI cards and data tables sit on "Surface Level 1" (White in light mode, Navy-800 in dark).
- **Shadows:** Use extremely soft, highly diffused shadows (Blur: 12px, Y: 4px, Opacity: 4-6%) to lift cards from the background without creating harsh visual breaks.
- **Interactive Depth:** On hover, cards should subtly increase their shadow spread and lift (Y: -2px) to provide tactile feedback.
- **Modals:** Use a 40% opacity backdrop blur (Glassmorphism) to maintain the pharmacist's context while focusing on inventory management tasks.

## Shapes

The shape language is "Rounded," striking a balance between clinical precision and modern software approachability.

- **Base Components:** Buttons and Input fields use a 0.5rem (8px) radius.
- **Container Elements:** KPI Cards and Modals use `rounded-lg` (1rem / 16px) to soften the large data blocks.
- **Feedback Elements:** Status chips (In-stock, Pending) use a full pill-shape (999px) to distinguish them from actionable buttons.

## Components

- **KPI Cards:** Feature a `headline-md` for the primary metric, a small sparkline using `primary_color` or `tertiary_color`, and a `label-md` for the description.
- **Data Tables:** Use zebra-striping in dark mode with 5% luminosity difference. Headers are `label-md` (uppercase) with a subtle bottom border. No vertical borders allowed.
- **POS Interface:** Buttons must be large-format with `rounded-lg` corners. Use `secondary_color` for secondary actions like "Add to Cart" and `primary_color` for "Checkout."
- **Input Fields:** Use a 1px border (`neutral-300`). On focus, transition to a 2px `primary_color` border with a subtle outer glow.
- **Inventory Modals:** Centered layout. All "Destructive" actions (e.g., Delete Batch) must be outlined in red but filled only on hover to prevent accidental triggers.
- **Status Chips:** Low-saturation background with high-saturation text of the same hue (e.g., light green background with dark green text for "In Stock").
