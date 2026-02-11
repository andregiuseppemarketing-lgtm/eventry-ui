'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  max?: number;
}

export function MultiSelect({ options, selected, onChange, label, max }: MultiSelectProps) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label} {max && `(max ${max})`}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                'border border-border',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
              {option}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} selezionat{selected.length === 1 ? 'o' : 'i'}
        </p>
      )}
    </div>
  );
}
