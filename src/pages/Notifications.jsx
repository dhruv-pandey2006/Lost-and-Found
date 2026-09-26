import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Radar, FileCheck, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/Common/Button';
import EmptyState from '../components/Common/EmptyState';
import './Notifications.css';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }

    // Navigate based on type
    if (notif.type === 'match_found') {
      navigate('/matches');
    } else if (notif.type === 'claim_submitted' || notif.type === 'claim_approved' || notif.type === 'claim_rejected') {
      // For simplicity, navigating to matches where they can see claim status or to specific item
      navigate('/matches');
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'match_found': return <Radar size={20} className="icon-match" />;
      case 'claim_submitted': return <FileCheck size={20} className="icon-claim" />;
      case 'claim_approved': return <CheckCircle size={20} className="icon-success" />;
      case 'claim_rejected': return <XCircle size={20} className="icon-error" />;
      default: return <Bell size={20} className="icon-default" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return <div className="container">Please log in to view notifications.</div>;

  return (
    <div className="notifications-page container">
      <div className="notifications-header">
        <div className="header-title">
          <h1>Notifications</h1>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notification-icon-wrapper">
                {getIcon(notif.type)}
              </div>
              
              <div className="notification-content">
                <h4 className="notification-title">{notif.title}</h4>
                <p className="notification-message">{notif.message}</p>
              </div>
              
              <div className="notification-meta">
                <span className="notification-time">{formatRelativeTime(notif.createdAt)}</span>
                {!notif.read && <div className="unread-dot"></div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No notifications yet"
          message="You're all caught up! We'll notify you when there are updates on your items."
          icon={Bell}
        />
      )}
    </div>
  );
}
