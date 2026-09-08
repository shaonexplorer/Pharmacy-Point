'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface CustomerSegmentationProps {
  onFilterChange?: (filters: { tier?: string; search?: string }) => void;
}

export function CustomerSegmentation({ onFilterChange }: CustomerSegmentationProps) {
  const [tier, setTier] = useState('all');
  const [search, setSearch] = useState('');

  const handleTier = (v: string) => { setTier(v); onFilterChange?.({ tier: v === 'all' ? undefined : v, search }); };
  const handleSearch = (v: string) => { setSearch(v); onFilterChange?.({ tier: tier === 'all' ? undefined : tier, search: v }); };

  return (
    <Card className="p-4 flex flex-wrap gap-3 items-center">
      <Input placeholder="Search customers..." value={search} onChange={e => handleSearch(e.target.value)} className="w-64" />
      <Select value={tier} onValueChange={handleTier}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Tier" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value="Bronze">Bronze</SelectItem>
          <SelectItem value="Silver">Silver</SelectItem>
          <SelectItem value="Gold">Gold</SelectItem>
          <SelectItem value="Platinum">Platinum</SelectItem>
        </SelectContent>
      </Select>
    </Card>
  );
}
