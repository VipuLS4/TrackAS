import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'soft' | 'elevated' | 'none';
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  shadow = 'soft',
  gradient = false,
}) => {
  const baseClasses = 'bg-surface rounded-md border border-gray-100 transition-smooth';
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    soft: 'shadow-soft',
    elevated: 'shadow-elevated',
    none: 'shadow-none',
  };

  const hoverClasses = hover ? 'hover:shadow-elevated hover:transform hover:-translate-y-1' : '';
  const gradientClasses = gradient ? 'bg-gradient-card' : '';

  return (
    <div className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClasses} ${gradientClasses} ${className}`}>
      {children}
    </div>
  );
};

// Card Header Component
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

// Card Title Component
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4;
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '', 
  level = 3 
}) => {
  const levelClasses = {
    1: 'text-h1 font-heading font-bold text-text',
    2: 'text-h2 font-heading font-bold text-text',
    3: 'text-h3 font-heading font-semibold text-text',
    4: 'text-h4 font-heading font-semibold text-text',
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`${levelClasses[level]} ${className}`}>
      {children}
    </Tag>
  );
};

// Card Content Component
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-body text-muted ${className}`}>
      {children}
    </div>
  );
};

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};
