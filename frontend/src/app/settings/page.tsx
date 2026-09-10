'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { StockAlertSettings } from '@/components/inventory/StockAlertSettings';
import { DueAccountAlertSettings } from '@/components/customers/DueAccountAlertSettings';
import {
  Loader2,
  ArrowLeft,
  Settings,
  Save,
  Building2,
  Phone,
  FileText,
  Shield,
  Percent,
  Calendar,
  Package,
  Bell,
  AlertTriangle,
} from 'lucide-react';

/**
 * Clinical Precision — Settings Page
 *
 * System-wide configuration for the pharmacy management platform.
 * Tabs: General (pharmacy info), Alerts (notification settings),
 * System (operational parameters).
 *
 * Design spec (DESIGN.md → Clinical Precision):
 *  - prescription-border-l accent on page header
 *  - card-elevated for configuration cards
 *  - label-md for form fields
 *  - data-mono for numerical inputs (tax rate, return window)
 *  - Tertiary (Safety Green) icon for General tab
 *  - Warning (Amber) icon for Alerts tab
 *  - Primary (Pharma Teal) icon for System tab
 */
export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // ── General Settings State ──
  const [pharmacyName, setPharmacyName] = useState('Pharmacy Point');
  const [pharmacyAddress, setPharmacyAddress] = useState(
    '1200 Medical Center Dr, Suite 300, New Era, NY 10001'
  );
  const [pharmacyPhone, setPharmacyPhone] = useState('(212) 555-0199');
  const [pharmacyEmail, setPharmacyEmail] = useState('contact@pharmacypoint.com');
  const [pharmacyLicense, setPharmacyLicense] = useState('PH-28491-NE');

  // ── System Settings State ──
  const [taxRate, setTaxRate] = useState('8.5');
  const [returnWindow, setReturnWindow] = useState('30');
  const [currency, setCurrency] = useState('USD');
  const [lowStockDefault, setLowStockDefault] = useState('10');

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Auth redirect
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background sm:max-w-7xl mx-auto">
      <div className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          {/* ── Page Header (signature: prescription-border-l accent) ── */}
          <div className="flex items-start justify-between">
            <div className="prescription-border-l pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                  <Settings className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h1 className="text-headline-lg text-foreground">Settings</h1>
                  <p className="text-body-md text-on-surface-variant">
                    Configure pharmacy information, alerts, and system parameters
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hidden md:flex" />
              <Button asChild variant="outline" size="sm">
                <a href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </a>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-surface-container border border-border">
              <TabsTrigger
                value="general"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="flex items-center gap-2 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground"
              >
                <Bell className="h-4 w-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="flex items-center gap-2 data-[state=active]:bg-tertiary data-[state=active]:text-tertiary-foreground"
              >
                <Shield className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>

            {/* ── General Tab ── */}
            <TabsContent value="general" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pharmacy Information */}
                <Card className="border-border bg-card card-elevated">
                  <CardHeader>
                    <CardTitle className="text-headline-sm flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-tertiary" />
                      Pharmacy Information
                    </CardTitle>
                    <CardDescription>
                      Configure your pharmacy's public details and license information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pharmacy-name" className="text-label-md">
                        Pharmacy Name
                      </Label>
                      <Input
                        id="pharmacy-name"
                        value={pharmacyName}
                        onChange={(e) => setPharmacyName(e.target.value)}
                        className="bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pharmacy-license" className="text-label-md">
                        License Number
                      </Label>
                      <Input
                        id="pharmacy-license"
                        value={pharmacyLicense}
                        onChange={(e) => setPharmacyLicense(e.target.value)}
                        className="font-mono bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                      />
                      <p className="text-xs text-on-surface-variant">
                        Required for receipt generation and regulatory compliance.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pharmacy-address" className="text-label-md">
                        Address
                      </Label>
                      <Textarea
                        id="pharmacy-address"
                        value={pharmacyAddress}
                        onChange={(e) => setPharmacyAddress(e.target.value)}
                        rows={3}
                        className="bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="pharmacy-phone" className="text-label-md">
                          Phone
                        </Label>
                        <Input
                          id="pharmacy-phone"
                          value={pharmacyPhone}
                          onChange={(e) => setPharmacyPhone(e.target.value)}
                          className="bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pharmacy-email" className="text-label-md">
                          Email
                        </Label>
                        <Input
                          id="pharmacy-email"
                          type="email"
                          value={pharmacyEmail}
                          onChange={(e) => setPharmacyEmail(e.target.value)}
                          className="bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Receipt Configuration */}
                <Card className="border-border bg-card card-elevated">
                  <CardHeader>
                    <CardTitle className="text-headline-sm flex items-center gap-2">
                      <FileText className="h-5 w-5 text-secondary" />
                      Receipt Settings
                    </CardTitle>
                    <CardDescription>
                      Configure default receipt and prescription note templates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="receipt-template" className="text-label-md">
                        Default Prescription Note
                      </Label>
                      <Textarea
                        id="receipt-template"
                        placeholder="e.g. Take 1 tablet daily with food. Refills: 5"
                        rows={4}
                        className="bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                      <p className="text-xs text-on-surface-variant">
                        Default note appended to all prescription receipt items.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-1">
                        <Label className="text-label-md">Show Barcode on Receipts</Label>
                        <p className="text-xs text-on-surface-variant">
                          Include scannable reference on printed receipts
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="barcode-toggle"
                          defaultChecked
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <Label htmlFor="barcode-toggle" className="text-sm text-foreground">
                          Enabled
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-1">
                        <Label className="text-label-md">Print Logos by Default</Label>
                        <p className="text-xs text-on-surface-variant">
                          Include pharmacy logo on receipts and reports
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        id="logo-toggle"
                        defaultChecked
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Alerts Tab ── */}
            <TabsContent value="alerts" className="mt-6">
              <div className="space-y-6">
                <div className="prescription-border-l pl-4">
                  <h2 className="text-headline-md text-foreground">Alert Configuration</h2>
                  <p className="text-body-md text-on-surface-variant mt-1">
                    Configure automated email alerts for inventory, expiry, and due accounts.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Low Stock Alerts */}
                  <Card className="border-border bg-card card-elevated">
                    <CardHeader>
                      <CardTitle className="text-headline-sm flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        Stock Alerts
                      </CardTitle>
                      <CardDescription>
                        Configure low-stock thresholds and email recipients.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StockAlertSettings />
                    </CardContent>
                  </Card>

                  {/* Expiry Alerts */}
                  <Card className="border-border bg-card card-elevated">
                    <CardHeader>
                      <CardTitle className="text-headline-sm flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-error" />
                        Expiry Alerts
                      </CardTitle>
                      <CardDescription>
                        Configure expiration warning thresholds.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry-warning-days" className="text-label-md">
                          Warning Window (days)
                        </Label>
                        <Input
                          id="expiry-warning-days"
                          type="number"
                          min="1"
                          max="180"
                          defaultValue="30"
                          className="w-24 font-mono bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-on-surface-variant">
                          Send alerts for products expiring within this many days.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="critical-expiry-days" className="text-label-md">
                          Critical Window (days)
                        </Label>
                        <Input
                          id="critical-expiry-days"
                          type="number"
                          min="1"
                          max="30"
                          defaultValue="7"
                          className="w-24 font-mono bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-on-surface-variant">
                          Highlight products expiring within this period as critical.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="auto-dispose-toggle"
                          className="h-4 w-4 rounded border-border text-error focus:ring-error"
                        />
                        <Label htmlFor="auto-dispose-toggle" className="text-sm text-foreground">
                          Auto-flag expired products for disposal
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Due Account Alerts */}
                  <Card className="border-border bg-card card-elevated lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-headline-sm flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Due Account Alerts
                      </CardTitle>
                      <CardDescription>
                        Configure credit-sale alerts and notification recipients.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DueAccountAlertSettings />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ── System Tab ── */}
            <TabsContent value="system" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Operational Settings */}
                <Card className="border-border bg-card card-elevated">
                  <CardHeader>
                    <CardTitle className="text-headline-sm flex items-center gap-2">
                      <Shield className="h-5 w-5 text-tertiary" />
                      Operational Parameters
                    </CardTitle>
                    <CardDescription>
                      System-wide operational defaults for transactions and returns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate" className="text-label-md flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Default Tax Rate (%)
                      </Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-20 font-mono bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                      />
                      <p className="text-xs text-on-surface-variant">
                        Applied to all new sales transactions.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="return-window"
                        className="text-label-md flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        Return Window (days)
                      </Label>
                      <Input
                        id="return-window"
                        type="number"
                        min="0"
                        max="365"
                        value={returnWindow}
                        onChange={(e) => setReturnWindow(e.target.value)}
                        className="w-20 font-mono bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                      />
                      <p className="text-xs text-on-surface-variant">
                        Maximum days allowed for returns/refunds.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-currency" className="text-label-md">
                        Currency
                      </Label>
                      <Input
                        id="default-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-24 font-mono bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="low-stock-default"
                        className="text-label-md flex items-center gap-1"
                      >
                        <Package className="h-3 w-3" />
                        Default Low Stock Threshold
                      </Label>
                      <Input
                        id="low-stock-default"
                        type="number"
                        min="0"
                        value={lowStockDefault}
                        onChange={(e) => setLowStockDefault(e.target.value)}
                        className="w-20 font-mono bg-surface-container-low/50 border-border focus:ring-2 focus:ring-primary/50"
                      />
                      <p className="text-xs text-on-surface-variant">
                        Default threshold for new products. Can be overridden per product.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card className="border-border bg-card card-elevated">
                  <CardHeader>
                    <CardTitle className="text-headline-sm flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Payment Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure accepted payment methods and Stripe integration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-1">
                        <Label className="text-label-md">Cash Payments</Label>
                        <p className="text-xs text-on-surface-variant">
                          Accept cash at POS
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </div>

                    <Separator className="border-border/40" />

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-1">
                        <Label className="text-label-md">Card Payments (Stripe)</Label>
                        <p className="text-xs text-on-surface-variant">
                          Process card payments via Stripe Checkout
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </div>

                    <Separator className="border-border/40" />

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-1">
                        <Label className="text-label-md">Credit Sales</Label>
                        <p className="text-xs text-on-surface-variant">
                          Allow credit sales with due account tracking
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-on-surface-variant">
                        Stripe status: <span className="font-medium text-tertiary">Connected</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button — spans both columns */}
                <Card className="border-border bg-card card-elevated lg:col-span-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-body-sm text-on-surface-variant">
                        Changes will be saved locally and applied to new sessions.
                      </p>
                      <Button
                        onClick={handleSave}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saved ? 'Saved!' : 'Save All Settings'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
