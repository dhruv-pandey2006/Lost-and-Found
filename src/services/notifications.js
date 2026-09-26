import { storage, COLLECTIONS } from './storage';

export function createNotification({ recipientId, type, title, message, relatedId, relatedType }) {
  return storage.create(COLLECTIONS.NOTIFICATIONS, {
    recipientId,
    type,
    title,
    message,
    relatedId,
    relatedType,
    read: false
  });
}

export function getNotifications(userId) {
  const notifications = storage.query(COLLECTIONS.NOTIFICATIONS, n => n.recipientId === userId);
  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getUnreadCount(userId) {
  return storage.count(COLLECTIONS.NOTIFICATIONS, n => n.recipientId === userId && !n.read);
}

export function markAsRead(notificationId) {
  return storage.update(COLLECTIONS.NOTIFICATIONS, notificationId, { read: true });
}

export function markAllAsRead(userId) {
  const notifications = storage.query(COLLECTIONS.NOTIFICATIONS, n => n.recipientId === userId && !n.read);
  notifications.forEach(n => {
    storage.update(COLLECTIONS.NOTIFICATIONS, n.id, { read: true });
  });
}

export function deleteNotification(notificationId) {
  return storage.remove(COLLECTIONS.NOTIFICATIONS, notificationId);
}
