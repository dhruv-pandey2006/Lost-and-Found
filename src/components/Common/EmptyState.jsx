import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = SearchX, 
  title = 'No Results Found', 
  message = 'We couldn\'t find what you\'re looking for.',
  action 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
