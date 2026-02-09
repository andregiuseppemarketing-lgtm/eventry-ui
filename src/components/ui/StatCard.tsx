import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className = '' }: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600 font-medium">{title}</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
          {subtitle && (
            <div className={`text-sm mt-2 ${trend ? trendColors[trend] : 'text-gray-600'}`}>
              {subtitle}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-2xl text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
