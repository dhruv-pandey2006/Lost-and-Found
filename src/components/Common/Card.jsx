import React from 'react';

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
);

const Card = ({
  children,
  className = '',
  hoverable = true,
  onClick,
  status,
  ...rest
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'found':
        return 'var(--color-success)';
      case 'error':
      case 'lost':
        return 'var(--color-error)';
      case 'warning':
      case 'pending':
        return 'var(--color-warning)';
      case 'info':
        return 'var(--color-primary)';
      default:
        return 'transparent';
    }
  };

  const statusStyle = status ? { borderTop: `4px solid ${getStatusColor()}` } : {};

  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
      style={statusStyle}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
