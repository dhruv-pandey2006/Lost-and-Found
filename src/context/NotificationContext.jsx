import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as notificationService from '../services/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      // Assuming notificationService.getNotifications exists and returns notifications for current user
      const notifs = await notificationService.getNotifications(user.id);
      setNotifications(notifs || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, [user]);

  // Initial fetch and polling
  useEffect(() => {
    if (user) {
      refresh();
      const interval = setInterval(() => {
        refresh();
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, refresh]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  }, [user]);

  const addNotification = useCallback(async (data) => {
    try {
      await notificationService.createNotification(data);
      refresh();
    } catch (error) {
      console.error("Failed to create notification", error);
    }
  }, [refresh]);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    refresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
