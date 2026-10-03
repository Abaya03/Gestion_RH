import React from 'react';
import { CompanyLogo } from './CompanyLogo';

interface ImropLogoProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
}

export const ImropLogo: React.FC<ImropLogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true 
}) => {
  let sizeVariant: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  if (typeof size === 'string') {
    if (size === 'sm' || size === 'md' || size === 'lg' || size === 'xl' || size === '2xl') {
      sizeVariant = size;
    }
  } else if (typeof size === 'number') {
    if (size <= 36) sizeVariant = 'sm';
    else if (size <= 56) sizeVariant = 'md';
    else if (size <= 80) sizeVariant = 'lg';
    else sizeVariant = 'xl';
  }

  return (
    <CompanyLogo
      size={sizeVariant}
      className={className}
      showText={showText}
    />
  );
};
