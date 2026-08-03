# DESIGN.md — Clinical Precision Design System

> **Project:** Modern Pharmacy Management Dashboard  
> **Design System:** Clinical Precision  
> **Created:** 2026-08-03  
> **Device Target:** Desktop (2560px width)  
> **Source:** Google Stitch — `projects/16769129460188176504`

---

## Screen Inventory

This Stitch project contains **4 screens** that form the core UI for the Pharmacy Point application:

| # | Screen Title | Dimensions | Purpose |
|---|-------------|------------|---------|
| 1 | Dashboard Overview | 2560 × 2900 | KPI cards, quick actions, recent activity snapshot |
| 2 | POS Terminal | 2560 × 2192 | Point-of-sale interface with product search, cart, and checkout |
| 3 | Inventory Management | 2560 × 2054 | Product inventory table with stock levels and low-stock filtering |
| 4 | Sales & Analytics Reports | 2560 × 8150 | Sales insights, charts, and transaction reports |

> **Note:** The `Sales & Analytics Reports` screen is exceptionally tall (8150px), indicating a long-scroll layout with multiple chart sections and data tables.

### Screen-to-Route Mapping

| Stitch Screen | App Route | Status |
|---|---|---|
| Dashboard Overview | `/dashboard` | ✅ Implemented |
| POS Terminal | `/pos` | ✅ Implemented |
| Inventory Management | `/inventory` | ✅ Implemented |
| Sales & Analytics Reports | `/analytics` | ✅ Implemented |

---

## Design Tokens

### Colors

#### Semantic Palette

| Token | Hex | Usage |
|---|---|---|
| **primary** | `#00685f` | Primary actions, active nav states, brand-critical elements |
| **on-primary** | `#ffffff` | Text/icons on primary surfaces |
| **primary-container** | `#008378` | Elevated primary surfaces |
| **on-primary-container** | `#f4fffc` | Text on primary-container |
| **secondary** | `#006398` | Informational callouts, secondary buttons |
| **on-secondary** | `#ffffff` | Text/icons on secondary surfaces |
| **secondary-container** | `#5bb8fe` | Elevated secondary surfaces |
| **on-secondary-container** | `#00476e` | Text on secondary-container |
| **tertiary** | `#006b2c` | "In Stock," "Verified," success states |
| **on-tertiary** | `#ffffff` | Text/icons on tertiary surfaces |
| **tertiary-container** | `#00873a` | Elevated tertiary surfaces |
| **on-tertiary-container** | `#f7fff2` | Text on tertiary-container |
| **error** | `#ba1a1a` | Error states |
| **on-error** | `#ffffff` | Text/icons on error surfaces |

#### Surface Palette (Light Mode)

| Token | Hex | Usage |
|---|---|---|
| **background** | `#f8f9ff` | Page background |
| **on-background** | `#0b1c30` | Primary text on background |
| **surface-container-lowest** | `#ffffff` | Lowest surface level (cards) |
| **surface-container-low** | `#eff4ff` | Slightly elevated surfaces |
| **surface-container** | `#e5eeff` | Surface level 1 (default cards) |
| **surface-container-high** | `#dce9ff` | Surface level 2 |
| **surface-container-highest** | `#d3e4fe` | Highest surface level |
| **surface-dim** | `#cbdbf5` | Dimmed surface variant |
| **surface-bright** | `#f8f9ff` | Bright surface variant |
| **surface** | `#f8f9ff` | Default surface |
| **on-surface** | `#0b1c30` | Text on surface |
| **on-surface-variant** | `#3d4947` | Muted text on surface |
| **outline** | `#6d7a77` | Borders, dividers |
| **outline-variant** | `#bcc9c6` | Subtle borders |
| **surface-tint** | `#006a61` | Tint overlay for surfaces |
| **surface-variant** | `#d3e4fe` | Surface variant |

#### Fixed Color Tokens

| Token | Hex | Usage |
|---|---|---|
| **primary-fixed** | `#89f5e7` | Disabled/selected primary states |
| **primary-fixed-dim** | `#6bd8cb` | Dimmed primary-fixed |
| **on-primary-fixed** | `#00201d` | Text on primary-fixed |
| **on-primary-fixed-variant** | `#005049` | Variant text on primary-fixed |
| **secondary-fixed** | `#cce5ff` | Disabled/selected secondary states |
| **secondary-fixed-dim** | `#93ccff` | Dimmed secondary-fixed |
| **on-secondary-fixed** | `#001d31` | Text on secondary-fixed |
| **on-secondary-fixed-variant** | `#004b73` | Variant text on secondary-fixed |
| **tertiary-fixed** | `#7ffc97` | Disabled/selected tertiary states |
| **tertiary-fixed-dim** | `#62df7d` | Dimmed tertiary-fixed |
| **on-tertiary-fixed** | `#002109` | Text on tertiary-fixed |
| **on-tertiary-fixed-variant** | `#005320` | Variant text on tertiary-fixed |

#### Color Mode Overrides

| Token | Hex | Notes |
|---|---|---|
| **overrideNeutralColor** | `#64748b` | Neutral color override |
| **overridePrimaryColor** | `#0d9488` | Primary color override |
| **overrideSecondaryColor** | `#0284c7` | Secondary color override |
| **overrideTertiaryColor** | `#16a34a` | Tertiary color override |

#### Dark Mode Reference

> The design system supports dark mode. Key dark-mode values:
> - **inverse-surface:** `#213145`
> - **inverse-on-surface:** `#eaf1ff`
> - **inverse-primary:** `#6bd8cb`

---

### Typography

| Style | Font Family | Font Size | Font Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| **display-lg** | Inter | 36px | 700 | 44px | -0.02em | Page hero titles |
| **headline-lg** | Inter | 28px | 600 | 36px | -0.01em | Section headings |
| **headline-lg-mobile** | Inter | 24px | 600 | 32px | — | Mobile headings |
| **headline-md** | Inter | 20px | 600 | 28px | — | Subsection headings, KPI titles |
| **body-lg** | Inter | 16px | 400 | 24px | — | Primary body text |
| **body-md** | Inter | 14px | 400 | 20px | — | Secondary body, captions |
| **label-md** | Inter | 12px | 600 | 16px | 0.05em | Table headers, labels, uppercase |
| **data-mono** | JetBrains Mono | 14px | 500 | 20px | — | Drug SKUs, dosages, quantities, prices |

#### Typography Principles

- **Inter** is the foundational typeface — chosen for exceptional legibility in data-dense pharmacy environments.
- **Headlines** use semi-bold weights with slight negative letter-spacing to create a "locked-in" professional look.
- **Data Display** uses `data-mono` (JetBrains Mono) for drug SKUs, dosages, and quantities to prevent character confusion (e.g., `0` vs `O`).
- **Labels** are uppercase with increased letter-spacing (0.05em) to differentiate from actionable body text.

---

### Spacing

| Token | Value | Usage |
|---|---|---|
| **xs** | 4px | Minimal spacing, tight padding |
| **sm** | 8px | Small gaps, compact elements |
| **md** | 16px | Standard padding, element spacing |
| **lg** | 24px | Section padding, card padding |
| **xl** | 40px | Large section gaps, container padding |
| **base** | 4px | Base unit for the linear scale |

#### Layout Spacing (from techstack.md reference)

| Token | Value | Usage |
|---|---|---|
| **container-max** | 1440px | Maximum content width |
| **gutter** | 20px | Grid column gutter |
| **margin-desktop** | 40px | Desktop outer margins |

#### Spacing Rhythm

- An **8px linear scale** governs all padding and margins.
- On **tablet** (POS terminals), touch targets for medications and quantity selectors must maintain a minimum height of **48px**, utilizing `md` (16px) spacing between interactive elements.
- On **mobile**, margins reduce to `md` (16px) and the grid collapses to 4 columns.

---

### Shape (Border Radius)

| Token | Value | Usage |
|---|---|---|
| **sm** | 0.25rem (4px) | Small elements, compact UI |
| **DEFAULT** | 0.5rem (8px) | Base components: buttons, input fields |
| **md** | 0.75rem (12px) | Medium-radius containers |
| **lg** | 1rem (16px) | Container elements: KPI cards, modals |
| **xl** | 1.5rem (24px) | Large containers, section headers |
| **full** | 9999px | Status chips (In-stock, Pending) — full pill shape |

#### Shape Principles

- **Base Components:** Buttons and input fields use `0.5rem` (8px) radius.
- **Container Elements:** KPI cards and modals use `rounded-lg` (1rem / 16px) to soften large data blocks.
- **Feedback Elements:** Status chips use a full pill-shape (999px) to distinguish them from actionable buttons.

---

### Layout & Grid

- **Grid System:** 12-column system on desktop, collapsing to 4 columns on mobile.
- **Margins:** Large 40px margins on desktop to allow the interface to "breathe," reducing the feeling of clutter in complex inventory screens.
- **Fluid Grid:** Employs a fluid grid with fixed-width constraints for maximum readability on large pharmacy monitors.
- **Adaptation:** On tablet (POS terminals), touch targets for medications and quantity selectors must maintain a minimum height of 48px.

---

### Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**.

| Level | Description | Properties |
|---|---|---|
| **Base** | Page background | `#f8f9ff` (light mode) |
| **Surface Level 1** | KPI cards, data tables | White (`#ffffff`), subtle shadow |
| **Surface Level 2** | Dropdowns, tooltips | Soft, diffused shadow |
| **Overlay Level** | Modals, popovers | 40% opacity backdrop blur (Glassmorphism) |

#### Shadow Specifications

- **Standard cards:** Blur: 12px, Y: 4px, Opacity: 4-6%
- **Hover state:** Cards subtly increase shadow spread and lift (Y: -2px) to provide tactile feedback.
- **Modals:** Use a 40% opacity backdrop blur (Glassmorphism) to maintain context while focusing on inventory management tasks.

---

## Brand & Style

The design system is engineered for high-stakes pharmacy environments where clarity, speed, and trust are paramount. The brand personality is clinical yet accessible, prioritizing cognitive ease to reduce dispensing errors.

The visual style follows a **Corporate / Modern** approach with elements of **Minimalism**. It utilizes expansive white space in light mode and deep structured layers in dark mode to organize complex medical data. The interface avoids unnecessary decoration, using functional color and purposeful geometry to guide the pharmacist's workflow. The aesthetic response should be one of calm reliability and professional authority.

### Color Usage Guidelines

- **Primary (Pharma Teal — `#00685f`):** Used for primary actions, active navigation states, and brand-critical elements. It signals professional health services.
- **Secondary (Medi-Blue — `#006398`):** Applied to informational callouts, secondary buttons, and data visualization categories related to patient records.
- **Tertiary (Safety Green — `#006b2c`):** Specifically reserved for "In Stock," "Verified," and "Success" states to provide immediate positive reinforcement.
- **Neutral:** A range of cool slates (`#0F172A` to `#F8FAFC`) that manage structural hierarchy without competing with functional colors.

---

## Component Specifications

### KPI Cards

- **Primary metric:** Uses `headline-md` (20px, 600 weight, 28px line-height).
- **Sparkline:** Uses `primary_color` or `tertiary_color`.
- **Description:** Uses `label-md` (12px, 600 weight, 0.05em letter-spacing).
- **Container:** Surface Level 1 with `rounded-lg` (16px) corners.
- **Hover:** Subtle shadow increase with Y-lift (-2px).

### Data Tables

- **Zebra-striping:** Used in dark mode with 5% luminosity difference between rows.
- **Headers:** `label-md` (uppercase, 12px, 600 weight, 0.05em tracking).
- **Borders:** Subtle bottom border only — **no vertical borders** allowed.
- **Data cells:** `body-md` (14px, 400 weight).
- **Numerical data:** `data-mono` (JetBrains Mono, 14px, 500 weight) for precise alignment.

### POS Interface

- **Buttons:** Large-format with `rounded-lg` (16px) corners.
- **Primary actions:** Use `primary_color` (Pharma Teal) — e.g., "Checkout."
- **Secondary actions:** Use `secondary_color` (Medi-Blue) — e.g., "Add to Cart."
- **Touch targets:** Minimum 48px height on tablet/POS terminals.
- **Product grid:** Spacing of `md` (16px) between interactive elements.

### Input Fields

- **Border:** 1px border (`neutral-300` / `outline-variant`).
- **Focus state:** Transition to 2px `primary_color` border with a subtle outer glow.
- **Radius:** `DEFAULT` (0.5rem / 8px).

### Inventory Modals

- **Layout:** Centered layout.
- **Backdrop:** 40% opacity backdrop blur (Glassmorphism).
- **Destructive actions:** All "Destructive" actions (e.g., Delete Batch) must be outlined in red but filled only on hover to prevent accidental triggers.

### Status Chips

- **Background:** Low-saturation background with high-saturation text of the same hue.
- **Example:** Light green background with dark green text for "In Stock."
- **Shape:** Full pill-shape (999px radius) to distinguish from actionable buttons.
- **Colors:**
  - **In Stock / Success:** `tertiary` (`#006b2c`)
  - **Low Stock / Warning:** Use `secondary` or a warning variant
  - **Out of Stock / Error:** `error` (`#ba1a1a`)
  - **Pending / Processing:** Use `primary` (`#00685f`)

---

## Screen-Specific Notes

### 1. Dashboard Overview (2560 × 2900)

This is the primary landing page for pharmacy staff. Based on the existing codebase implementation:

- **KPI Cards Row:** Displays key metrics (total products, low stock items, total sales, pending orders).
- **Quick Actions:** Cards for "Add Product," "New Order," "Stock Adjustment," "Add Customer."
- **Recent Activity:** Timeline of recent inventory transactions, orders, and customer activity.
- **Revenue Chart:** Small sparkline or bar chart on KPI cards using `primary_color` or `tertiary_color`.

### 2. POS Terminal (2560 × 2192)

The point-of-sale interface, already implemented in the codebase:

- **Product Search:** Top bar with text input and category filters.
- **Product Grid:** Large-format product cards with `rounded-lg` corners, minimum 48px touch targets.
- **Cart Panel:** Right sidebar showing cart items with quantity selectors and price calculations.
- **Checkout Button:** Primary action using `primary_color` (Pharma Teal).
- **Tax Calculation:** Default 8.5% tax rate, displayed using `data-mono` for numerical clarity.
- **Staff Attribution:** Order is attributed to the session user via `staffId`.

### 3. Inventory Management (2560 × 2054)

Inventory tracking interface with low stock filtering:

- **Product Table:** Data table with zebra-striping, no vertical borders, `label-md` uppercase headers.
- **Low Stock Filter:** Toggle to show only products below minimum stock levels.
- **Stock Level Display:** Uses `data-mono` for quantities, with `tertiary` color for "In Stock" status.
- **Stock Adjustment:** Modal with centered layout and glassmorphic backdrop blur.
- **Transaction History:** Accessible via a separate view showing all `InventoryTransaction` records.

### 4. Sales & Analytics Reports (2560 × 8150)

The longest screen (8150px height), indicating multiple chart sections and data tables:

- **Revenue Overview:** Large line or bar charts showing sales trends over time.
- **Top Products:** Table or list of best-selling products with `data-mono` for quantities and prices.
- **Category Breakdown:** Pie or donut chart showing sales distribution by product category.
- **Customer Analytics:** Sales by customer segment or top customer ranking.
- **Inventory Turnover:** Metrics on stock movement and reorder frequency.
- **Time Filtering:** Controls to view data by day, week, month, or custom range.

---

## Implementation Notes

- **Design System Integration:** Colors, typography, spacing, and shape values should be defined as CSS custom properties (CSS variables) or Tailwind CSS theme extensions.
- **Path Aliases:** Use `@/components`, `@/hooks`, `@/app` for frontend imports.
- **Shared Types:** Use `@pharmacy-point/types` for shared TypeScript types between frontend and backend.
- **Form Validation:** Use Zod for all form validation, matching backend API schemas.
- **Server State:** Use React Query (TanStack Query) for all server data fetching and caching.
- **Font Loading:** Inter for body text and headlines; JetBrains Mono for numerical data display.
