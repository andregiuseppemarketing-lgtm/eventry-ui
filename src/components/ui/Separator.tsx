interface SeparatorProps {
  className?: string;
}

export function Separator({ className = '' }: SeparatorProps) {
  return <hr className={`border-gray-200 ${className}`} />;
}
