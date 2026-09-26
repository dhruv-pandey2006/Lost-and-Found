import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Tag, Info, User, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import storage, { COLLECTIONS } from '../services/storage';
import Badge from '../components/Common/Badge';
import Button from '../components/Common/Button';
import MatchScore from '../components/Common/MatchScore';
import './ItemDetail.css';

export default function ItemDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isSecurity } = useAuth();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = () => {
      setLoading(true);
      const collectionName = type === 'lost' ? COLLECTIONS.LOST_ITEMS : COLLECTIONS.FOUND_ITEMS;
      const foundItem = storage.getById(collectionName, id);

      if (foundItem) {
        // Find matches connecting this item to other items
        const allMatches = storage.getAll(COLLECTIONS.MATCHES);
        const itemMatches = allMatches.filter(m =>
          type === 'lost' ? m.lostItemId === id : m.foundItemId === id
        );

        // Enrich matches with full item data
        const enrichedMatches = itemMatches.map(m => {
          const matchedItemType = type === 'lost' ? COLLECTIONS.FOUND_ITEMS : COLLECTIONS.LOST_ITEMS;
          const matchedItemId = type === 'lost' ? m.foundItemId : m.lostItemId;
          const matchedItemData = storage.getById(matchedItemType, matchedItemId);
          return {
            ...m,
            matchedItem: matchedItemData
          };
        }).filter(m => m.matchedItem); // Only keep if matched item exists

        // Students may only view items they reported themselves, or items
        // matched to something they reported. Staff can view anything.
        const isOwner = foundItem.reportedBy === user.id;
        const isStaff = isAdmin || isSecurity;
        const isMatchedToUser = enrichedMatches.some(m => m.matchedItem.reportedBy === user.id);

        if (!isOwner && !isStaff && !isMatchedToUser) {
          showToast('You are not authorized to view this item', 'error');
          navigate('/dashboard');
          setLoading(false);
          return;
        }

        setItem({ ...foundItem, type });
        setMatches(enrichedMatches.sort((a, b) => b.score - a.score));
      }
      setLoading(false);
    };

    fetchItem();
  }, [type, id, user, isAdmin, isSecurity, navigate, showToast]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const collectionName = type === 'lost' ? COLLECTIONS.LOST_ITEMS : COLLECTIONS.FOUND_ITEMS;
      storage.remove(collectionName, id);
      navigate('/my-reports');
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${type}/${id}`);
  };

  const handleClaim = (matchId) => {
    navigate(`/claim/${matchId}`);
  };

  if (loading) return <div className="container loading">Loading...</div>;
  if (!item) return <div className="container error">Item not found.</div>;

  const isOwner = user && item.reportedBy === user.id;
  const isFoundItem = type === 'found';
  // The match connecting this found item to something the current user reported lost
  const claimableMatch = !isOwner && isFoundItem
    ? matches.find(m => m.matchedItem.reportedBy === user?.id)
    : null;

  return (
    <div className="item-detail-page container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="item-detail-layout">
        <div className="item-detail-left">
          <div className="item-detail-image">
            {item.image ? (
              <img src={item.image} alt={item.title} />
            ) : (
              <div className="image-placeholder">No image available</div>
            )}
            <div className="item-badges">
              <Badge variant={type === 'lost' ? 'error' : 'success'}>
                {type === 'lost' ? 'Lost Item' : 'Found Item'}
              </Badge>
              <Badge variant={item.status === 'resolved' ? 'success' : 'warning'}>
                {item.status || 'Active'}
              </Badge>
            </div>
          </div>
          
          <div className="item-detail-description">
            <h3>Description</h3>
            <p>{item.description || 'No description provided.'}</p>
          </div>
        </div>

        <div className="item-detail-content">
          <h1 className="item-title">{item.title}</h1>
          
          <div className="detail-attributes">
            <div className="attr-row">
              <Tag className="attr-icon" size={20} />
              <div className="attr-content">
                <span className="attr-label">Category</span>
                <span className="attr-value">{item.category}</span>
              </div>
            </div>
            
            {item.color && (
              <div className="attr-row">
                <div className="attr-color-dot" style={{ backgroundColor: item.color }}></div>
                <div className="attr-content">
                  <span className="attr-label">Color</span>
                  <span className="attr-value">{item.color}</span>
                </div>
              </div>
            )}
            
            {item.brand && (
              <div className="attr-row">
                <Info className="attr-icon" size={20} />
                <div className="attr-content">
                  <span className="attr-label">Brand / Model</span>
                  <span className="attr-value">{item.brand}</span>
                </div>
              </div>
            )}
            
            <div className="attr-row">
              <MapPin className="attr-icon" size={20} />
              <div className="attr-content">
                <span className="attr-label">{type === 'lost' ? 'Lost at' : 'Found at'}</span>
                <span className="attr-value">{item.locationId}</span>
              </div>
            </div>
            
            <div className="attr-row">
              <Calendar className="attr-icon" size={20} />
              <div className="attr-content">
                <span className="attr-label">Date {type === 'lost' ? 'Lost' : 'Found'}</span>
                <span className="attr-value">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="attr-row">
              <User className="attr-icon" size={20} />
              <div className="attr-content">
                <span className="attr-label">Reported By</span>
                <span className="attr-value">{item.reportedByName || 'Anonymous'}</span>
              </div>
            </div>
            
            <div className="attr-row">
              <Clock className="attr-icon" size={20} />
              <div className="attr-content">
                <span className="attr-label">Posted on</span>
                <span className="attr-value">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="detail-actions">
            {isOwner ? (
              <div className="owner-actions">
                <Button variant="outline" onClick={handleEdit}>Edit Item</Button>
                <Button variant="danger" onClick={handleDelete}>Delete Item</Button>
              </div>
            ) : (
              claimableMatch && (
                <Button
                  className="w-full"
                  onClick={() => handleClaim(claimableMatch.id)}
                >
                  Claim This Item
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {matches.length > 0 && isOwner && (
        <div className="detail-matches">
          <h3>Potential Matches ({matches.length})</h3>
          <div className="matches-grid">
            {matches.map(match => (
              <div key={match.id} className="match-mini-card" onClick={() => navigate(`/matches`)}>
                <MatchScore score={match.score} size="sm" />
                <div className="match-mini-info">
                  <h4>{match.matchedItem.title}</h4>
                  <p><MapPin size={12}/> {match.matchedItem.locationId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
