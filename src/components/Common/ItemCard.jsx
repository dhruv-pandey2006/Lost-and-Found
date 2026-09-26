import React from 'react';
import { MapPin, Calendar, HelpCircle } from 'lucide-react';
import Badge from './Badge';
import './ItemCard.css';

const getCategoryIcon = (category) => {
  // We can map this to different lucide icons based on category. HelpCircle as default
  return <HelpCircle size={48} className="item-card-placeholder-icon" />;
};

const ItemCard = ({ item, onClick }) => {
  const {
    id,
    title,
    category,
    color,
    description,
    location,
    date,
    image,
    status,
    type,
  } = item;

  const typeBadgeVariant = type?.toUpperCase() === 'LOST' ? 'lost' : type?.toUpperCase() === 'FOUND' ? 'found' : 'default';

  return (
    <div className="item-card card-hoverable" onClick={onClick}>
      <div className="item-card-image-container">
        {image ? (
          <img src={image} alt={title} className="item-card-image" />
        ) : (
          <div className="item-card-placeholder">
            {getCategoryIcon(category)}
          </div>
        )}
        <div className="item-card-overlay"></div>
        <div className="item-card-badges-top">
          {type && <Badge variant={typeBadgeVariant}>{type.toUpperCase()}</Badge>}
        </div>
      </div>
      
      <div className="item-card-content">
        <div className="item-card-header">
          <h3 className="item-card-title">{title}</h3>
        </div>
        
        <p className="item-card-description">{description}</p>
        
        <div className="item-card-meta">
          <div className="item-card-meta-row">
            <MapPin size={16} className="item-card-meta-icon" />
            <span className="item-card-meta-text">{location}</span>
          </div>
          <div className="item-card-meta-row">
            <Calendar size={16} className="item-card-meta-icon" />
            <span className="item-card-meta-text">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="item-card-footer">
          <Badge variant="category" size="sm">{category}</Badge>
          <Badge variant={status.toLowerCase()} size="sm">{status}</Badge>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
