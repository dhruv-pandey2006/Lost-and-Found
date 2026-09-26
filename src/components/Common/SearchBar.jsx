import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Search items...',
  onClear
}) => {
  return (
    <div className="search-bar">
      <div className="search-bar-icon-left">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-bar-input"
      />
      {value && onClear && (
        <button 
          className="search-bar-clear" 
          onClick={onClear}
          aria-label="Clear search"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
