import React from 'react';

const PageLayout = ({ title, subtitle, children, actions }) => {
  return (
    <div className="page-wrapper">
      <div className="page-layout container">
        {(title || subtitle || actions) && (
          <header className="page-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-6, 1.5rem)',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            paddingBottom: 'var(--spacing-4, 1rem)'
          }}>
            <div className="page-header-content">
              {title && <h1 className="page-title" style={{
                fontFamily: "var(--font-heading, 'Inter', sans-serif)",
                color: "var(--color-primary, #1a365d)",
                fontSize: "1.75rem",
                margin: "0 0 0.25rem 0"
              }}>{title}</h1>}
              {subtitle && <p className="page-subtitle" style={{
                color: "var(--color-text-light, #475569)",
                margin: "0",
                fontSize: "0.9375rem"
              }}>{subtitle}</p>}
            </div>
            {actions && (
              <div className="page-header-actions" style={{
                display: 'flex',
                gap: 'var(--spacing-2, 0.5rem)'
              }}>
                {actions}
              </div>
            )}
          </header>
        )}
        
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
