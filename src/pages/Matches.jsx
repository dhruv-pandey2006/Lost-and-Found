import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import storage, { COLLECTIONS } from '../services/storage';
import { STATUS } from '../utils/constants';
import MatchScore from '../components/Common/MatchScore';
import Button from '../components/Common/Button';
import EmptyState from '../components/Common/EmptyState';
import './Matches.css';

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Load matches where user is owner of lost item or finder of found item
    const allMatches = storage.getAll(COLLECTIONS.MATCHES);

    const relevantMatches = allMatches.filter(match => {
      const lostItem = storage.getById(COLLECTIONS.LOST_ITEMS, match.lostItemId);
      const foundItem = storage.getById(COLLECTIONS.FOUND_ITEMS, match.foundItemId);

      if (!lostItem || !foundItem) return false;

      // Already resolved (claimed and handed over) - nothing left to do here
      if (lostItem.status === STATUS.RESOLVED || foundItem.status === STATUS.RESOLVED) return false;

      // User owns either the lost or found item
      return lostItem.reportedBy === user.id || foundItem.reportedBy === user.id;
    }).map(match => {
      const lostItem = storage.getById(COLLECTIONS.LOST_ITEMS, match.lostItemId);
      const foundItem = storage.getById(COLLECTIONS.FOUND_ITEMS, match.foundItemId);
      
      return {
        ...match,
        lostItem,
        foundItem,
        userRole: lostItem.reportedBy === user.id ? 'owner' : 'finder'
      };
    });
    
    relevantMatches.sort((a, b) => b.score - a.score);
    setMatches(relevantMatches);
    setLoading(false);
  }, [user]);

  if (!user) return <div className="container">Please log in to view matches.</div>;
  if (loading) return <div className="container loading">Loading matches...</div>;

  return (
    <div className="matches-page container">
      <div className="matches-header">
        <h1>Your Matches</h1>
        <p className="subtitle">Potential matches for your reported items.</p>
      </div>

      {matches.length > 0 ? (
        <div className="matches-list">
          {matches.map(match => (
            <div key={match.id} className="match-card">
              <div className="match-comparison">
                {/* Lost Item (Left) */}
                <div className="match-item-side" onClick={() => navigate(`/item/lost/${match.lostItemId}`)}>
                  <span className="side-label">Lost Item</span>
                  <div className="match-item-preview">
                    {match.lostItem.image ? (
                      <img src={match.lostItem.image} alt={match.lostItem.title} />
                    ) : (
                      <div className="preview-placeholder">No Image</div>
                    )}
                    <div className="preview-info">
                      <h4>{match.lostItem.title}</h4>
                      <p>{match.lostItem.date ? new Date(match.lostItem.date).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Score (Center) */}
                <div className="match-score-center">
                  <MatchScore score={match.score} size="lg" />
                  <span className="confidence-label">
                    {match.score > 80 ? 'High Confidence' : match.score > 50 ? 'Medium Confidence' : 'Low Confidence'}
                  </span>
                </div>

                {/* Found Item (Right) */}
                <div className="match-item-side" onClick={() => navigate(`/item/found/${match.foundItemId}`)}>
                  <span className="side-label">Found Item</span>
                  <div className="match-item-preview">
                    {match.foundItem.image ? (
                      <img src={match.foundItem.image} alt={match.foundItem.title} />
                    ) : (
                      <div className="preview-placeholder">No Image</div>
                    )}
                    <div className="preview-info">
                      <h4>{match.foundItem.title}</h4>
                      <p>{match.foundItem.date ? new Date(match.foundItem.date).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="match-details">
                <div className="match-reasons">
                  <h5>Match Breakdown:</h5>
                  <ul>
                    {match.details?.reasons?.map((reason, i) => (
                      <li key={i}>
                        <CheckCircle2 size={16} className="text-success" />
                        {reason}
                      </li>
                    ))}
                    {!match.details?.reasons?.length && <li>Details not available</li>}
                  </ul>
                </div>
                
                <div className="match-actions">
                  {match.userRole === 'owner' ? (
                    <Button onClick={() => navigate(`/claim/${match.id}`)} className="claim-btn">
                      Claim This Item <ChevronRight size={18} />
                    </Button>
                  ) : (
                    <div className="finder-notice">
                      <ShieldAlert size={20} className="text-warning" />
                      <span>Waiting for owner to claim</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No matches found yet"
          message="Keep checking back! We'll notify you when a match is found for your items."
          icon={ShieldAlert}
        />
      )}
    </div>
  );
}
