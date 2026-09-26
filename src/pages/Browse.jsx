import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Calendar, MapPin, Tag, Search } from 'lucide-react';
import storage, { COLLECTIONS } from '../services/storage';
import ItemCard from '../components/Common/ItemCard';
import SearchBar from '../components/Common/SearchBar';
import EmptyState from '../components/Common/EmptyState';
import './Browse.css';

export default function Browse() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'lost', 'found'
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    color: ''
  });

  useEffect(() => {
    const loadItems = () => {
      const lost = storage.getAll(COLLECTIONS.LOST_ITEMS);
      const found = storage.getAll(COLLECTIONS.FOUND_ITEMS);
      setItems([
        ...lost.map(item => ({ ...item, type: 'lost' })),
        ...found.map(item => ({ ...item, type: 'found' }))
      ]);
    };
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Tab filter
      if (activeTab !== 'all' && item.type !== activeTab) return false;
      
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.locationId?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Dropdown filters
      if (filters.category && item.category !== filters.category) return false;
      if (filters.location && item.locationId !== filters.location) return false;
      if (filters.color && item.color !== filters.color) return false;

      return true;
    }).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [items, activeTab, searchQuery, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleItemClick = (type, id) => {
    navigate(`/item/${type}/${id}`);
  };

  // Extract unique values for filters
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const locations = [...new Set(items.map(i => i.locationId).filter(Boolean))];
  const colors = [...new Set(items.map(i => i.color).filter(Boolean))];

  return (
    <div className="browse-page container">
      <div className="browse-header">
        <h1>Browse Items</h1>
        
        <div className="browse-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Items
          </button>
          <button 
            className={`tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
            onClick={() => setActiveTab('lost')}
          >
            Lost Items
          </button>
          <button 
            className={`tab-btn ${activeTab === 'found' ? 'active' : ''}`}
            onClick={() => setActiveTab('found')}
          >
            Found Items
          </button>
        </div>
      </div>

      <div className="browse-controls">
        <SearchBar 
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
          placeholder="Search by title, description, location..."
        />
        
        <div className="browse-filters">
          <div className="filter-group">
            <Tag size={16} />
            <select 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <MapPin size={16} />
            <select 
              value={filters.location} 
              onChange={(e) => handleFilterChange('location', e.target.value)}
              aria-label="Filter by location"
            >
              <option value="">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={filters.color} 
              onChange={(e) => handleFilterChange('color', e.target.value)}
              aria-label="Filter by color"
            >
              <option value="">All Colors</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="browse-count">
        Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
      </div>

      {filteredItems.length > 0 ? (
        <div className="browse-grid">
          {filteredItems.map(item => (
            <ItemCard 
              key={`${item.type}-${item.id}`} 
              item={item} 
              onClick={() => handleItemClick(item.type, item.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No items found"
          message="Try adjusting your filters or search query."
          icon={Search}
        />
      )}
    </div>
  );
}
