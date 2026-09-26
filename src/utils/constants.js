export const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: 'Smartphone' },
  { id: 'clothing', label: 'Clothing', icon: 'Shirt' },
  { id: 'accessories', label: 'Accessories', icon: 'Watch' },
  { id: 'documents', label: 'Documents', icon: 'FileText' },
  { id: 'keys', label: 'Keys', icon: 'Key' },
  { id: 'bags', label: 'Bags/Backpacks', icon: 'Briefcase' },
  { id: 'stationery', label: 'Stationery', icon: 'PenTool' },
  { id: 'water-bottles', label: 'Water Bottles', icon: 'Droplet' },
  { id: 'sports', label: 'Sports Equipment', icon: 'Activity' },
  { id: 'wallet', label: 'Wallet/Purse', icon: 'CreditCard' },
  { id: 'id-card', label: 'ID Card', icon: 'User' },
  { id: 'other', label: 'Other', icon: 'Box' },
];

export const COLORS = [
  { id: 'black', label: 'Black', hex: '#000000' },
  { id: 'white', label: 'White', hex: '#FFFFFF' },
  { id: 'silver', label: 'Silver', hex: '#C0C0C0' },
  { id: 'gray', label: 'Gray', hex: '#808080' },
  { id: 'red', label: 'Red', hex: '#FF0000' },
  { id: 'blue', label: 'Blue', hex: '#0000FF' },
  { id: 'green', label: 'Green', hex: '#008000' },
  { id: 'yellow', label: 'Yellow', hex: '#FFFF00' },
  { id: 'orange', label: 'Orange', hex: '#FFA500' },
  { id: 'purple', label: 'Purple', hex: '#800080' },
  { id: 'pink', label: 'Pink', hex: '#FFC0CB' },
  { id: 'brown', label: 'Brown', hex: '#A52A2A' }
];

export const CAMPUS_LOCATIONS = [
  { id: 'main-building', label: 'Main Building' },
  { id: 'block-a', label: 'Block A' },
  { id: 'block-b', label: 'Block B' },
  { id: 'block-c', label: 'Block C' },
  { id: 'block-d', label: 'Block D' },
  { id: 'block-e', label: 'Block E' },
  { id: 'block-f', label: 'Block F' },
  { id: 'library', label: 'Library' },
  { id: 'cafeteria', label: 'Cafeteria' },
  { id: 'sports-complex', label: 'Sports Complex' },
  { id: 'auditorium', label: 'Auditorium' },
  { id: 'parking-area', label: 'Parking Area' },
  { id: 'hostel-a', label: 'Hostel A' },
  { id: 'hostel-b', label: 'Hostel B' },
  { id: 'labs', label: 'Labs' },
  { id: 'seminar-hall', label: 'Seminar Hall' },
  { id: 'admin-block', label: 'Admin Block' }
];

export const STATUS = {
  ACTIVE: 'active',
  MATCHED: 'matched',
  CLAIMED: 'claimed',
  RESOLVED: 'resolved',
  EXPIRED: 'expired',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COLLECTED: 'collected'
};

export const ROLES = {
  STUDENT: 'student',
  SECURITY: 'security',
  ADMIN: 'admin'
};

export const REPORT_TYPES = {
  LOST: 'lost',
  FOUND: 'found'
};

export const SECURITY_QUESTIONS = [
  'What was inside the item?',
  'What is the brand?',
  'Any distinguishing marks?',
  'What was the approximate value?',
  'What was the phone wallpaper?',
  'Any stickers or accessories attached?',
  'What is the lock screen/password hint?',
  'What case/cover was on it?'
];

export const COLOR_SYNONYMS = {
  grey: 'gray',
  silver: 'gray',
  navy: 'blue',
  maroon: 'red',
  cyan: 'blue',
  magenta: 'pink',
  lime: 'green',
  olive: 'green',
  teal: 'blue',
  indigo: 'purple',
  violet: 'purple',
  gold: 'yellow'
};
