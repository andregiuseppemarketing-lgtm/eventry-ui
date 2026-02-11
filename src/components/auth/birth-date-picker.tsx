'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BirthDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  error?: string;
  className?: string;
}

export function BirthDatePicker({ value, onChange, error, className }: BirthDatePickerProps) {
  const [day, setDay] = React.useState<string>(value ? String(value.getDate()) : '');
  const [month, setMonth] = React.useState<string>(value ? String(value.getMonth() + 1) : '');
  const [year, setYear] = React.useState<string>(value ? String(value.getFullYear()) : '');

  // Generate options
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '1', label: 'Gennaio' },
    { value: '2', label: 'Febbraio' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Aprile' },
    { value: '5', label: 'Maggio' },
    { value: '6', label: 'Giugno' },
    { value: '7', label: 'Luglio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Settembre' },
    { value: '10', label: 'Ottobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Dicembre' },
  ];
  
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 13; // Minimum 13 years old
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  // Update parent when date changes
  React.useEffect(() => {
    if (day && month && year) {
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      
      // Validate date
      if (
        date.getDate() === Number(day) &&
        date.getMonth() === Number(month) - 1 &&
        date.getFullYear() === Number(year)
      ) {
        onChange(date);
      } else {
        onChange(undefined);
      }
    } else {
      onChange(undefined);
    }
  }, [day, month, year, onChange]);

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-zinc-200">
        Data di nascita
      </Label>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Day */}
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger className={cn(
            'bg-zinc-900/50 border-white/10',
            error && !day && 'border-red-500/50'
          )}>
            <SelectValue placeholder="Giorno" />
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month */}
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className={cn(
            'bg-zinc-900/50 border-white/10',
            error && !month && 'border-red-500/50'
          )}>
            <SelectValue placeholder="Mese" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className={cn(
            'bg-zinc-900/50 border-white/10',
            error && !year && 'border-red-500/50'
          )}>
            <SelectValue placeholder="Anno" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <p className="text-xs text-zinc-500">
        Devi avere almeno 18 anni per registrarti.
      </p>
    </div>
  );
}
