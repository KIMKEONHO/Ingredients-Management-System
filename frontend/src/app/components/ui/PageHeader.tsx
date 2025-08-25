import { COLOR_PRESETS, COLORS } from '@/lib/constants/colors';

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: 'main' | 'support' | 'statistics';
  children?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  description, 
  variant = 'main',
  children 
}: PageHeaderProps) {
  const preset = COLOR_PRESETS[variant.toUpperCase() as keyof typeof COLOR_PRESETS] || COLOR_PRESETS.MAIN_PAGE;

  const headerClass = 'header' in preset ? preset.header : COLORS.BACKGROUNDS.HEADER;
  
  return (
    <div className={`${headerClass} rounded-xl p-6 mb-8 text-white`}>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      {description && (
        <p className="text-blue-100 mb-6">{description}</p>
      )}
      {children}
    </div>
  );
}
