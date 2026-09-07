# Pharmacy Point - Frontend

A Next.js frontend application for the Pharmacy Point pharmacy management platform.

## Getting Started

This is a [Next.js 16](https://nextjs.org) project bootstrapped with the App Router architecture.

### Start the development server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page auto-reloads as you edit the files.

## Project Structure

```
frontend/src/
├── app/              # Next.js App Router pages
│   ├── dashboard/    # Analytics dashboard
│   ├── products/     # Product management pages
│   ├── inventory/    # Inventory management
│   ├── customers/    # Customer management
│   ├── pos/          # Point of Sale interface
│   └── companies/    # Company/supplier management
├── components/       # Reusable UI components
│   ├── dashboard/    # Dashboard-specific components
│   ├── products/     # Product components
│   ├── companies/    # Company components
│   ├── customers/    # Customer components
│   ├── inventory/    # Inventory components
│   ├── pos/          # POS components
│   ├── navigation/   # Navigation and sidebar
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and theme
└── context/          # React context providers

```

## Key Technologies

- **Next.js 16** with App Router
- **React 19** with Server Components
- **Tailwind CSS** v4
- **shadcn/ui** - Reusable component library
- **React Hook Form** + **Zod** - Form validation
- **React Query (TanStack Query)** - Server state management

## UI Components

The application uses shadcn/ui components styled with the "Clinical Precision" design system:
- Data tables with TanStack Table v8
- Forms with Zod validation
- Dialogs, select components, and cards
- Responsive grid layouts

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

## Deploy

The easiest way to deploy the Next.js app is to use the [Vercel Platform](https://vercel.com) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.