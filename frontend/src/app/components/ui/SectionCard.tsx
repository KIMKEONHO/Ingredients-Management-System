import { COLOR_PRESETS } from '@/lib/constants/colors';

interface SectionCardProps {
  title: string;
  variant?: 'main' | 'support' | 'statistics';
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ 
  title, 
  variant = 'main',
  children,
  className = ''
}: SectionCardProps) {
  const preset = COLOR_PRESETS[variant.toUpperCase() as keyof typeof COLOR_PRESETS] || COLOR_PRESETS.MAIN_PAGE;

  return (
    <div className={`${preset.card} rounded-xl p-6 mb-8 ${preset.border} ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
