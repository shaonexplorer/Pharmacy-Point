---
name: Clinical Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#3b3bc9'
  on-tertiary: '#ffffff'
  tertiary-container: '#5457e2'
  on-tertiary-container: '#eae8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  body-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.01em
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.02em
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-numeric-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
  button-text:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  grid-gutter: 0.75rem
  pos-touch-min: 2.75rem
---

## Brand & Style

This design system delivers a clinical, high-efficiency operational environment built specifically for licensed pharmacists, pharmacy technicians, and retail healthcare cashiers. The aesthetic balances pharmaceutical rigor with high-velocity desktop and touchscreen POS utility. The emotional tone is authoritative, serene, and immutably accurate—eliminating optical fatigue across 12-hour dispensary shifts while preventing dispensing and transaction errors through uncompromising visual hierarchy.

The design movement combines **Corporate Modern SaaS** with **Tactile Clinical Ergonomics**:

- Surfaces remain pristine, sterile, and structured, relying on slate-tinted white layers rather than cold generic grays.
- Density is prioritized: information displays are compact, compact tabular metrics ensure zero unnecessary scrolling during prescription verification, and tactile action targets prevent mis-taps at counter terminals.
- High-contrast states convey critical alerts (drug interactions, controlled substance verifications, stock-outs) with unambiguous clarity conforming stringently to WCAG AAA standards for legibility.

## Colors

The palette establishes an immediate medical association while maintaining optimal daylight and fluorescent-lit terminal visibility.

- **Primary (`#0f766e` Deep Medical Teal)**: Anchors primary dispensary actions, active POS cart checkouts, and confirmed status headers. Paired with `#0d9488` for hover states and `#042f2e` for pressed/selected navigation anchors.
- **Secondary (`#0284c7` Clinical Cyan)**: Directs auxiliary workflows such as insurance adjudication, patient profile switching, and prescriber lookup.
- **Tertiary (`#6366f1` Royal Indigo)**: Reserved strictly for Rx script tracking, digital refills, e-prescriptions, and lot/batch management.
- **Neutral Core**:
  - App Canvas Surface: `#f8fafc` (Slate 50)
  - Sub-surface / Sidebar / Panel Wells: `#f1f5f9` (Slate 100)
  - Structural Borders & Dividing Hairlines: `#e2e8f0` (Slate 200)
  - Card & Container Surface: `#ffffff`
  - Body Text: `#334155` (Slate 700)
  - Primary Titles & Numerical Data: `#0f172a` (Slate 900)
  - Subdued Metadata: `#64748b` (Slate 500)

### Status & Clinical Safety Tokens

Color coding in this system communicates pharmaceutical state directly:

- **Active / Paid / In-Stock**: Surface `#ecfdf5`, Border `#a7f3d0`, Text `#065f46`, Solid `#10b981`
- **Expiring Soon / Warning / Partial Fill**: Surface `#fffbeb`, Border `#fde68a`, Text `#92400e`, Solid `#f59e0b`
- **Expired / Out of Stock / Contraindication**: Surface `#fef2f2`, Border `#fecaca`, Text `#991b1b`, Solid `#ef4444`
- **Prescription / Batch / Compounding**: Surface `#eef2ff`, Border `#c7d2fe`, Text `#3730a3`, Solid `#6366f1`

## Typography

The typographical engine satisfies two opposing constraints: dense information architecture for inventory and prescription queues, and rapid numerical legibility for POS totals and medication dosing (e.g., distinguishing `0.5mg` from `5.0mg`).

- **Display & Section Headers (`Plus Jakarta Sans`)**: Clean, clinical geometry with humanist warmth. Keeps large dispensary monitors feeling contemporary without sacrificing structural density.
- **Body & Controls (`Inter`)**: Tuned for maximum micro-legibility at 11px–13px. High x-height and clear distinction between glyphs (`1`, `l`, `I`) prevent drug-naming confusion (such as Hydralazine vs. Hydroxyzine).
- **Tabular Numerics & Dosage Codes (`JetBrains Mono`)**: Mandatory for NDC codes, Lot numbers, DEA registry strings, currency figures, and inventory tallies. Monospaced character alignment guarantees scanning efficiency across tight table rows.

## Layout & Spacing

The system operates on an uncompromising 4px/8px base rhythm optimized for split-pane POS and prescription validation desks.

- **Dispensary Split-Screen Architecture (Desktop & Widescreen POS)**:
  - Standard split-view uses a fixed 380px or 440px right utility sidebar for the Active Cart / Dispense Ledger, while the left 60–70% fluid grid displays the inventory catalog, barcode scan stream, or drug lookup table.
  - Form factors adapt at `640px` (Mobile Handheld Scanner), `1024px` (Countertop Tablet), and `1440px` (Primary Pharmacist Terminal).
- **Density Tiering**:
  - **Clinical Desk Density (Mouse & Keyboard)**: Row heights fixed to 36px; cell padding at 6px horizontal, 4px vertical to present 20+ prescriptions per screen without pagination.
  - **POS Counter Touch Density**: All tactile quick-keys, tender buttons, and payment shortcuts must respect `pos-touch-min` (44px/2.75rem) to ensure error-free index-finger operation during rapid checkout lines.

## Elevation & Depth

Visual hierarchy uses crisp, low-contrast structural outlines paired with micro ambient drop shadows. Blurs are held to strict optical minimums to maintain a sterile, razor-sharp medical aesthetic.

- **Level 0 (Flat Canvas)**: `#f8fafc` — Background surface for the entire viewport. Zero shadow.
- **Level 1 (Card & Module Shells)**: `#ffffff` surface, bounded by a 1px solid `#e2e8f0` border. Shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Dropdowns, Drug Interaction Flyouts, POS Autocomplete)**: `#ffffff` surface, 1px solid `#cbd5e1` border. Shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals, Controlled Substance Verification, Dispense Overrides)**: `#ffffff` surface, 1px solid `#94a3b8` border. Backdrop overlay of `rgba(15, 23, 42, 0.45)`. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.
- **Active Selection Depth**: Selected order rows or active POS cart items receive a left accent strip (`3px solid #0f766e`) and a subtle surface tint (`#f0fdfa`) instead of a heavy drop shadow.

## Shapes

The design system employs a **Soft (`1`)** shape language. Corners are clipped subtly rather than bubbly, maintaining a sober, clinical identity that reinforces geometric discipline.

- **Standard Inputs, Badges, Table Rows, and Dropdowns**: `0.25rem` (4px). Keeps interface density high and aligns cleanly with tabular data grids.
- **Cards, POS Modals, and Flyout Drawers**: `0.5rem` (8px). Softens the overall application boundary without wasting corner screen real estate.
- **Pill Exceptions**: Reserved strictly for quantity counters and critical dosage warning tags (`rounded-full` / 9999px) to differentiate them from actionable rectangular buttons.

## Components

### Buttons & POS Action Keys

- **Primary Dispense/Checkout Button**: Solid `#0f766e`, text `#ffffff`, border 1px solid `#0d9488`. Active state shifts to `#042f2e`. On hover: `#0d9488`. Minimum touch target of 44px on POS screens with uppercase bold typography (`button-text`).
- **Secondary / Void Action**: Ghost or outlined button with 1px solid `#cbd5e1`, text `#334155`, surface `#ffffff`. Hover brings `#f1f5f9`.
- **Destructive (Discard Fill / Cancel Rx)**: Surface `#ffffff`, border 1px solid `#fecaca`, text `#dc2626`. Hover state fills `#fef2f2`.
- **Tactile POS Keypad**: Rectangular tiles with subtle bottom inset shadows (`box-shadow: inset 0 -2px 0 #cbd5e1`), providing satisfying tactile feedback on receipt of touch or click.

### Status Badges & Pills

- Badges use 1px solid borders with 15% opacity backgrounds of their respective semantic color.
- Height is fixed at 20px, uppercase `label-caps` typography, horizontal padding of 6px.
- Statuses include leading micro-indicators: a 5px solid dot indicating real-time sync (e.g., green for DEA approved, amber for awaiting pharmacist review).

### Data Grids & Prescription Lists

- Headers: Background `#f8fafc`, bottom border 1px solid `#cbd5e1`, typography `label-caps`, text `#64748b`.
- Rows: Clean alternating zebra striping is rejected in favor of pure white cards separated by 1px hairline `#f1f5f9` dividers, highlighting instantly to `#f0fdfa` on row hover.
- Density: Cell vertical padding fixed at 6px. Numerical columns (Stock, Price, Rx Number, Qty) must align right with `label-numeric-md`.

### Barcode & Medication Input Fields

- Inputs feature high-contrast `#0f172a` text on `#ffffff` backgrounds with an inset `#e2e8f0` border.
- Focus State: 1.5px solid `#0f766e` with an ambient glow of `0 0 0 3px rgba(15, 118, 110, 0.15)`.
- Includes integrated slot accessories for barcode scanner icons, clear-all hotkeys (Esc), and dosage suffixes (`mg`, `ml`, `tablets`).

### Clinical Alert Cards

- Inline warning cards for Drug-Drug Interaction (DDI) alerts feature a left vertical accent bar (4px solid `#ef4444` or `#f59e0b`).
- Background: Solid `#ffffff` with a faint wash matching the status token, clearly setting the risk tier apart from ordinary POS receipt items.
