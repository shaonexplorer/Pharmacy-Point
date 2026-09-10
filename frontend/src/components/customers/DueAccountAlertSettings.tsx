'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Send, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function DueAccountAlertSettings() {
  const [threshold, setThreshold] = useState('100');
  const [recipients, setRecipients] = useState('');
  const [saved, setSaved] = useState(false);

  const sendAlertMutation = useMutation({
    mutationFn: (data: { threshold?: number; recipients?: string[] }) =>
      api.notifications.sendDueAccountAlert(data),
  });

  const handleSave = async () => {
    setSaved(false);
    try {
      const recipientList = recipients
        ? recipients
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean)
        : undefined;

      await sendAlertMutation.mutateAsync({
        threshold: Number(threshold),
        recipients: recipientList,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to send due account alerts:', error);
    }
  };

  return (
    <Card className="max-w-lg card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Due Account Alert Settings
        </CardTitle>
        <CardDescription>
          Configure the due-amount threshold and notification recipients for credit-sale alerts.
          Click "Send Alerts" to dispatch emails to all customers with balances above the threshold.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="due-threshold">Due Amount Threshold ($)</Label>
          <Input
            id="due-threshold"
            type="number"
            min="0"
            step="1"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            disabled={sendAlertMutation.isPending}
          />
          <p className="text-xs text-on-surface-variant">
            Emails will be sent to customers whose outstanding balance exceeds this amount.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="due-recipients">Recipients (comma-separated)</Label>
          <Input
            id="due-recipients"
            placeholder="admin@pharmacy.com, manager@pharmacy.com"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            disabled={sendAlertMutation.isPending}
          />
          <p className="text-xs text-on-surface-variant">
            Leave empty to use the default recipients from{' '}
            <code className="text-data-mono">ALERT_RECIPIENTS</code> environment variable.
          </p>
        </div>

        {sendAlertMutation.isError && (
          <div className="rounded-md border border-error/30 bg-error/5 p-3">
            <div className="flex items-start gap-2.5 text-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-body-sm">
                {sendAlertMutation.error?.message ||
                  'Failed to send alerts. Please check your SMTP configuration.'}
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={handleSave}
          className="w-full"
          disabled={sendAlertMutation.isPending || !threshold}
        >
          {sendAlertMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Alerts...
            </>
          ) : saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Alert Emails
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
