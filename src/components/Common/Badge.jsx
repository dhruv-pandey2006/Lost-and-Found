import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const baseClasses = 'badge';
  const variantClass = `badge-${variant}`;
  const sizeClass = `badge-${size}`;
  
  const combinedClasses = [baseClasses, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={combinedClasses}>
      {children}
    </span>
  );
};

export default Badge;
