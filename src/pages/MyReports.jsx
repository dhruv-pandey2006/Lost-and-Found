import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, FileWarning } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import storage, { COLLECTIONS } from '../services/storage';
import Badge from '../components/Common/Badge';
import Button from '../components/Common/Button';
import EmptyState from '../components/Common/EmptyState';
import './MyReports.css';

export default function MyReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'
  const [items, setItems] = useState({ lost: [], found: [] });
  const [loading, setLoading] = useState(true);

  const fetchItems = () => {
    if (!user) return;
    setLoading(true);
    
    const lost = storage.getAll(COLLECTIONS.LOST_ITEMS).filter(i => i.reportedBy === user.id);
    const found = storage.getAll(COLLECTIONS.FOUND_ITEMS).filter(i => i.reportedBy === user.id);
    
    // Sort by newest first
    lost.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    found.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setItems({ lost, found });
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = (type, id) => {
    if (window.confirm('Are you sure you want to delete this report? This cannot be undone.')) {
      const collectionName = type === 'lost' ? COLLECTIONS.LOST_ITEMS : COLLECTIONS.FOUND_ITEMS;
      storage.remove(collectionName, id);

      // Also remove related matches
      const relatedMatches = storage.query(COLLECTIONS.MATCHES, m =>
        type === 'lost' ? m.lostItemId === id : m.foundItemId === id
      );
      relatedMatches.forEach(m => storage.remove(COLLECTIONS.MATCHES, m.id));

      showToast('Report deleted successfully', 'success');
      fetchItems();
    }
  };

  if (!user) return <div className="container">Please log in to view your reports.</div>;
  if (loading) return <div className="container loading">Loading your reports...</div>;

  const currentItems = activeTab === 'lost' ? items.lost : items.found;

  return (
    <div className="my-reports-page container">
      <div className="reports-header">
        <h1>My Reports</h1>
        <p className="subtitle">Manage items you have reported lost or found.</p>
        
        <div className="reports-tabs">
          <button 
            className={`tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
            onClick={() => setActiveTab('lost')}
          >
            Lost Items ({items.lost.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'found' ? 'active' : ''}`}
            onClick={() => setActiveTab('found')}
          >
            Found Items ({items.found.length})
          </button>
        </div>
      </div>

      {currentItems.length > 0 ? (
        <div className="reports-list">
          {currentItems.map(item => (
            <div key={item.id} className="report-card">
              <div className="report-image">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="placeholder-img">No Image</div>
                )}
              </div>
              
              <div className="report-content">
                <div className="report-main">
                  <h3>{item.title}</h3>
                  <div className="report-meta">
                    <span className="meta-item">{item.category}</span>
                    <span className="meta-dot">•</span>
                    <span className="meta-item">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="report-status">
                  <Badge variant={item.status === 'resolved' ? 'success' : 'warning'}>
                    {item.status || 'Active'}
                  </Badge>
                </div>
                
                <div className="report-actions">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/item/${activeTab}/${item.id}`)}
                    className="action-btn view-btn"
                  >
                    <Eye size={16} /> View
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(activeTab, item.id)}
                    className="action-btn delete-btn"
                  >
                    <Trash2 size={16} /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title={`No ${activeTab} items reported`}
          message={`You haven't reported any ${activeTab} items yet.`}
          icon={FileWarning}
          action={
            <Button onClick={() => navigate('/report')}>
              Report a {activeTab} item
            </Button>
          }
        />
      )}
    </div>
  );
}
