import { storage, COLLECTIONS } from './storage';

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function register({ name, email, phone, studentId, password, role = 'student' }) {
  if (!email.endsWith('@niet.co.in')) {
    return { success: false, error: 'Must use a valid NIET email address (@niet.co.in).' };
  }

  const users = storage.getAll(COLLECTIONS.USERS);
  if (users.some(u => u.email === email)) {
    return { success: false, error: 'Email already registered.' };
  }

  const hashedPassword = await hashPassword(password);
  const user = storage.create(COLLECTIONS.USERS, {
    name,
    email,
    phone,
    studentId,
    password: hashedPassword,
    role
  });

  const { password: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export async function login(email, password) {
  const users = storage.getAll(COLLECTIONS.USERS);
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const token = `token_${user.id}_${Date.now()}`;
  const { password: _, ...userWithoutPassword } = user;
  
  const sessionData = { user: userWithoutPassword, token };
  try {
    localStorage.setItem(COLLECTIONS.SESSION, JSON.stringify(sessionData));
  } catch (e) {
    console.error('Session save failed', e);
  }

  return { success: true, user: userWithoutPassword, token };
}

export function logout() {
  localStorage.removeItem(COLLECTIONS.SESSION);
}

export function getCurrentUser() {
  try {
    const sessionStr = localStorage.getItem(COLLECTIONS.SESSION);
    if (!sessionStr) return null;
    const session = JSON.parse(sessionStr);
    return session ? session.user : null;
  } catch (e) {
    return null;
  }
}

export function updateProfile(userId, updates) {
  const updated = storage.update(COLLECTIONS.USERS, userId, updates);
  if (updated) {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const sessionStr = localStorage.getItem(COLLECTIONS.SESSION);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const { password: _, ...userWithoutPassword } = updated;
        session.user = userWithoutPassword;
        localStorage.setItem(COLLECTIONS.SESSION, JSON.stringify(session));
      }
    }
    const { password: _, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
  return null;
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = storage.getById(COLLECTIONS.USERS, userId);
  if (!user) return false;
  
  const hashedOld = await hashPassword(oldPassword);
  if (user.password !== hashedOld) return false;
  
  const hashedNew = await hashPassword(newPassword);
  storage.update(COLLECTIONS.USERS, userId, { password: hashedNew });
  return true;
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}

export function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}
