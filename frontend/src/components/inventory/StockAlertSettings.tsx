'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function StockAlertSettings() {
  const [threshold, setThreshold] = useState('10');
  const [recipients, setRecipients] = useState('admin@pharmacy.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Stock Alert Settings</CardTitle>
        <CardDescription>Configure low-stock thresholds and notification recipients.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="threshold">Low Stock Threshold</Label>
          <Input id="threshold" type="number" value={threshold} onChange={e => setThreshold(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipients">Recipients (comma-separated)</Label>
          <Input id="recipients" value={recipients} onChange={e => setRecipients(e.target.value)} />
        </div>
        <Button onClick={handleSave} className="w-full">{saved ? 'Saved' : 'Save Settings'}</Button>
      </CardContent>
    </Card>
  );
}
