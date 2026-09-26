import { generateId } from '../utils/helpers';

export const COLLECTIONS = {
  USERS: 'niet_lf_users',
  LOST_ITEMS: 'niet_lf_lost_items',
  FOUND_ITEMS: 'niet_lf_found_items',
  MATCHES: 'niet_lf_matches',
  CLAIMS: 'niet_lf_claims',
  NOTIFICATIONS: 'niet_lf_notifications',
  SESSION: 'niet_lf_session'
};

export const storage = {
  _getCollection(name) {
    try {
      const data = localStorage.getItem(name);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading from localStorage (${name}):`, e);
      return [];
    }
  },

  _setCollection(name, data) {
    try {
      localStorage.setItem(name, JSON.stringify(data));
    } catch (e) {
      console.error(`Error writing to localStorage (${name}):`, e);
    }
  },
  
  getAll(collection) {
    return this._getCollection(collection);
  },
  
  getById(collection, id) {
    const items = this._getCollection(collection);
    return items.find(item => item.id === id) || null;
  },
  
  query(collection, filterFn) {
    const items = this._getCollection(collection);
    return items.filter(filterFn);
  },
  
  create(collection, data) {
    const items = this._getCollection(collection);
    const now = new Date().toISOString();
    const newItem = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    items.push(newItem);
    this._setCollection(collection, items);
    return newItem;
  },
  
  update(collection, id, updates) {
    const items = this._getCollection(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    items[index] = updatedItem;
    this._setCollection(collection, items);
    return updatedItem;
  },
  
  remove(collection, id) {
    const items = this._getCollection(collection);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    this._setCollection(collection, filtered);
    return true;
  },
  
  count(collection, filterFn) {
    const items = this._getCollection(collection);
    if (!filterFn) return items.length;
    return items.filter(filterFn).length;
  },
  
  clear(collection) {
    localStorage.removeItem(collection);
  },
  
  clearAll() {
    Object.values(COLLECTIONS).forEach(col => {
      localStorage.removeItem(col);
    });
  }
};

export default storage;
