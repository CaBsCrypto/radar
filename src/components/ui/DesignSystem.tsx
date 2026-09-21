import React from 'react';

export type BadgeVariant = 'blue' | 'emerald' | 'amber' | 'purple' | 'slate' | 'rose';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'blue',
  size = 'md',
  children,
  icon: Icon,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border whitespace-nowrap transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3 flex-shrink-0' : 'w-3.5 h-3.5 flex-shrink-0'} />}
      <span>{children}</span>
    </span>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs',
    subtle: 'bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80',
    interactive: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer',
  };

  return (
    <div
      className={`rounded-2xl transition-colors ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  badgeText,
  badgeVariant = 'blue',
  title,
  description,
  action,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        {badgeText && (
          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant} size="sm" icon={Icon}>
              {badgeText}
            </Badge>
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 self-start md:self-center">{action}</div>}
    </div>
  );
};

interface MetricTileProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: BadgeVariant;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  variant = 'blue',
  className = '',
  onClick,
  active = false,
}) => {
  const colorMap: Record<BadgeVariant, { text: string; bg: string; border: string }> = {
    blue: {
      text: 'text-blue-600 dark:text-blue-400',
      bg: active ? 'bg-blue-50 dark:bg-blue-950/50' : 'bg-slate-50 dark:bg-slate-950/60',
      border: active ? 'border-blue-500 dark:border-blue-500/80 ring-1 ring-blue-400' : 'border-slate-200 dark:border-slate-800',
    },
    emerald: {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: active ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-slate-50 dark:bg-slate-950/60',
      border: active ? 'border-emerald-500 dark:border-emerald-500/80 ring-1 ring-emerald-400' : 'border-slate-200 dark:border-slate-800',
    },
    amber: {
      text: 'text-amber-600 dark:text-amber-400',
      bg: active ? 'bg-amber-50 dark:bg-amber-950/50' : 'bg-slate-50 dark:bg-slate-950/60',
      border: active ? 'border-amber-500 dark:border-amber-500/80 ring-1 ring-amber-400' : 'border-slate-200 dark:border-slate-800',
    },
    purple: {
      text: 'text-purple-600 dark:text-purple-400',
      bg: active ? 'bg-purple-50 dark:bg-purple-950/50' : 'bg-slate-50 dark:bg-slate-950/60',
      border: active ? 'border-purple-500 dark:border-purple-500/80 ring-1 ring-purple-400' : 'border-slate-200 dark:border-slate-800',
    },
    slate: {
      text: 'text-slate-800 dark:text-slate-200',
      bg: active ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-950/60',
      border: active ? 'border-slate-400 dark:border-slate-600' : 'border-slate-200 dark:border-slate-800',
    },
    rose: {
      text: 'text-rose-600 dark:text-rose-400',
      bg: active ? 'bg-rose-50 dark:bg-rose-950/50' : 'bg-slate-50 dark:bg-slate-950/60',
      border: active ? 'border-rose-500 dark:border-rose-500/80 ring-1 ring-rose-400' : 'border-slate-200 dark:border-slate-800',
    },
  };

  const style = colorMap[variant];

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all text-center ${style.bg} ${style.border} ${
        onClick ? 'cursor-pointer hover:border-blue-400 active:scale-95' : ''
      } ${className}`}
    >
      <div className={`text-lg sm:text-xl font-extrabold font-['Outfit'] ${style.text}`}>
        {value}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5 font-medium truncate">
        {Icon && <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${style.text}`} />}
        <span className="truncate">{label}</span>
      </div>
      {sublabel && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          {sublabel}
        </div>
      )}
    </div>
  );
};
