import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { FileX, FilePlus, Search, Radar, ArrowRight, Activity, Clock, Inbox, AlertCircle, FileText } from 'lucide-react';
import { storage, COLLECTIONS } from '../services/storage';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import Badge from '../components/Common/Badge';
import EmptyState from '../components/Common/EmptyState';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin, isSecurity } = useAuth();
  const { unreadCount, notifications } = useNotifications();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    lostCount: 0,
    foundCount: 0,
    matchesCount: 0,
  });

  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    if (user) {
      // Calculate stats
      const userLost = storage.getAll(COLLECTIONS.LOST_ITEMS).filter(item => item.reportedBy === user.id);
      const userFound = storage.getAll(COLLECTIONS.FOUND_ITEMS).filter(item => item.reportedBy === user.id);

      const allMatches = storage.getAll(COLLECTIONS.MATCHES);
      const userMatches = allMatches.filter(match => {
        const lostItem = storage.getById(COLLECTIONS.LOST_ITEMS, match.lostItemId);
        const foundItem = storage.getById(COLLECTIONS.FOUND_ITEMS, match.foundItemId);
        return (lostItem && lostItem.reportedBy === user.id) || (foundItem && foundItem.reportedBy === user.id);
      });

      setStats({
        lostCount: userLost.length,
        foundCount: userFound.length,
        matchesCount: userMatches.length,
      });

      // Get recent items
      const lostWithType = userLost.map(i => ({ ...i, type: 'lost' }));
      const foundWithType = userFound.map(i => ({ ...i, type: 'found' }));
      const combinedItems = [...lostWithType, ...foundWithType]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentItems(combinedItems);
    }
  }, [user]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name}!</h1>
          <p className="current-date">{currentDate}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/report-lost" className="quick-action-card action-lost">
            <div className="action-icon-wrapper">
              <FileX size={24} className="action-icon" />
            </div>
            <div className="action-details">
              <h3>Report Lost</h3>
              <p>Lost something? File a report here.</p>
            </div>
          </Link>

          <Link to="/report-found" className="quick-action-card action-found">
            <div className="action-icon-wrapper">
              <FilePlus size={24} className="action-icon" />
            </div>
            <div className="action-details">
              <h3>Report Found</h3>
              <p>Found an item? Help return it.</p>
            </div>
          </Link>

          {isAdmin || isSecurity ? (
            <Link to="/browse" className="quick-action-card action-browse">
              <div className="action-icon-wrapper">
                <Search size={24} className="action-icon" />
              </div>
              <div className="action-details">
                <h3>Browse Items</h3>
                <p>Search all reported items on campus.</p>
              </div>
            </Link>
          ) : (
            <Link to="/my-reports" className="quick-action-card action-browse">
              <div className="action-icon-wrapper">
                <FileText size={24} className="action-icon" />
              </div>
              <div className="action-details">
                <h3>My Reports</h3>
                <p>View and manage items you've reported.</p>
              </div>
            </Link>
          )}

          <Link to="/matches" className="quick-action-card action-matches">
            <div className="action-icon-wrapper">
              <Radar size={24} className="action-icon" />
            </div>
            <div className="action-details">
              <h3>View Matches</h3>
              <p>Check potential item matches.</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-number">{stats.lostCount}</span>
            <span className="stat-label">My Lost Reports</span>
          </div>
          <Activity className="stat-icon" size={32} />
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-number">{stats.foundCount}</span>
            <span className="stat-label">My Found Reports</span>
          </div>
          <Activity className="stat-icon" size={32} />
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-number">{stats.matchesCount}</span>
            <span className="stat-label">Matches Found</span>
          </div>
          <Radar className="stat-icon" size={32} />
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-number">{unreadCount}</span>
            <span className="stat-label">Notifications</span>
          </div>
          <Inbox className="stat-icon" size={32} />
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-col left-col">
          <div className="col-header">
            <h2>Recent Reports</h2>
            <Link to="/my-reports" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="recent-list">
            {recentItems.length > 0 ? (
              recentItems.map(item => (
                <Link to={`/item/${item.type}/${item.id}`} key={item.id} className="recent-item-row">
                  <div className="item-main-info">
                    <h4 className="item-title">{item.title}</h4>
                    <span className="item-date">
                      <Clock size={14} /> {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <div className="item-badges">
                    <Badge variant={item.type === 'lost' ? 'danger' : 'success'}>
                      {item.type.toUpperCase()}
                    </Badge>
                    <Badge variant={
                      item.status === 'active' ? 'primary' :
                        item.status === 'resolved' ? 'success' : 'default'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                icon={FileX}
                title="No recent reports"
                message="You haven't reported any lost or found items yet."
              />
            )}
          </div>
        </div>

        <div className="dashboard-col right-col">
          <div className="col-header">
            <h2>Recent Notifications</h2>
            <Link to="/notifications" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="recent-list">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className={`recent-notification-row ${!notification.read ? 'unread' : ''}`}
                  onClick={() => navigate('/notifications')}
                >
                  <div className="notification-icon-wrapper">
                    <AlertCircle size={20} className="notification-icon" />
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formatRelativeTime(notification.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Inbox}
                title="No notifications"
                message="You're all caught up!"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
