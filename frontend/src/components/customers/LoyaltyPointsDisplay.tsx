'use client';
import { Star, Trophy, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LoyaltyPointsDisplayProps {
  points?: number;
  tier?: string;
  lifetimeSpend?: number;
}

export function LoyaltyPointsDisplay({ points = 0, tier = 'Bronze', lifetimeSpend = 0 }: LoyaltyPointsDisplayProps) {
  const tiers = [
    { name: 'Bronze', min: 0, color: 'text-amber-600 dark:text-amber-300' },
    { name: 'Silver', min: 500, color: 'text-slate-500 dark:text-slate-300' },
    { name: 'Gold', min: 2000, color: 'text-yellow-500 dark:text-yellow-300' },
    { name: 'Platinum', min: 5000, color: 'text-cyan-600 dark:text-cyan-300' },
  ];
  const current = tiers.find(t => tier === t.name) || tiers[0];

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold">Loyalty</h3>
        <span className={`ml-auto text-xs font-bold uppercase tracking-wide ${current.color}`}>{tier}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold data-mono">{points}</div>
          <div className="text-xs text-muted-foreground">Points earned</div>
        </div>
        <div>
          <div className="text-2xl font-bold data-mono">${lifetimeSpend.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Lifetime spend</div>
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        {tiers.map(t => (
          <div key={t.name} className={`h-1.5 flex-1 rounded-full ${tier === t.name ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
    </Card>
  );
}
