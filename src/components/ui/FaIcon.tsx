import React from 'react';

interface FaIconProps {
  name: string;
  className?: string;
  spin?: boolean;
}

export function FaIcon({ name, className = '', spin = false }: FaIconProps) {
  return (
    <i
      className={`fa-slab fa-regular fa-${name} ${spin ? 'fa-spin' : ''} ${className}`}
      aria-hidden="true"
    />
  );
}

export default FaIcon;
