import { storage, COLLECTIONS } from '../services/storage';
import { hashPassword } from '../services/auth';
import { STATUS } from './constants';
import { createNotification } from '../services/notifications';

export async function seedDatabase() {
  if (localStorage.getItem('niet_lf_seeded')) {
    return false;
  }

  try {
    // 1. Create Demo Users
    const sPass = await hashPassword('student123');
    const s2Pass = await hashPassword('student123');
    const aPass = await hashPassword('admin123');
    const secPass = await hashPassword('security123');

    const student = storage.create(COLLECTIONS.USERS, {
      name: 'Demo Student',
      email: 'student@niet.co.in',
      phone: '9876543210',
      studentId: 'NIET2024001',
      password: sPass,
      role: 'student'
    });

    storage.create(COLLECTIONS.USERS, {
      name: 'Demo Student Two',
      email: 'student2@niet.co.in',
      phone: '9876543213',
      studentId: 'NIET2024002',
      password: s2Pass,
      role: 'student'
    });

    const admin = storage.create(COLLECTIONS.USERS, {
      name: 'System Admin',
      email: 'admin@niet.co.in',
      phone: '9876543211',
      studentId: 'ADMIN001',
      password: aPass,
      role: 'admin'
    });

    const security = storage.create(COLLECTIONS.USERS, {
      name: 'Campus Security',
      email: 'security@niet.co.in',
      phone: '9876543212',
      studentId: 'SEC001',
      password: secPass,
      role: 'security'
    });

    const d1 = new Date(); d1.setDate(d1.getDate() - 2);
    const d2 = new Date(); d2.setDate(d2.getDate() - 5);
    const d3 = new Date(); d3.setDate(d3.getDate() - 10);
    const d4 = new Date(); d4.setDate(d4.getDate() - 1);

    // 2. Create Lost Items
    const lostItem1 = storage.create(COLLECTIONS.LOST_ITEMS, {
      title: 'Black JBL earbuds with charging case',
      category: 'electronics',
      color: 'black',
      brand: 'JBL',
      description: 'Lost my wireless earbuds. They have a small scratch on the back of the case.',
      locationId: 'library',
      date: d1.toISOString().split('T')[0],
      reportedBy: student.id,
      status: STATUS.ACTIVE,
      image: null
    });

    const lostItem2 = storage.create(COLLECTIONS.LOST_ITEMS, {
      title: 'Blue Wildcraft backpack with laptop',
      category: 'bags',
      color: 'blue',
      brand: 'Wildcraft',
      description: 'Blue backpack containing my Dell laptop and some notebooks.',
      locationId: 'cafeteria',
      date: d2.toISOString().split('T')[0],
      reportedBy: student.id,
      status: STATUS.ACTIVE,
      image: null
    });

    storage.create(COLLECTIONS.LOST_ITEMS, {
      title: 'College ID card - Rahul Sharma',
      category: 'id-card',
      color: 'white',
      brand: '',
      description: 'Lost my college ID card near the main gate.',
      locationId: 'main-building',
      date: d3.toISOString().split('T')[0],
      reportedBy: admin.id,
      status: STATUS.ACTIVE,
      image: null
    });

    storage.create(COLLECTIONS.LOST_ITEMS, {
      title: 'Silver iPhone 15 with cracked screen protector',
      category: 'electronics',
      color: 'silver',
      brand: 'Apple',
      description: 'Silver iPhone. Has a clear case and a cracked screen protector.',
      locationId: 'sports-complex',
      date: d4.toISOString().split('T')[0],
      reportedBy: student.id,
      status: STATUS.ACTIVE,
      image: null
    });

    // 3. Create Found Items
    const foundItem1 = storage.create(COLLECTIONS.FOUND_ITEMS, {
      title: 'Found black JBL wireless earphones',
      category: 'electronics',
      color: 'black',
      brand: 'JBL',
      description: 'Found black earbuds case on the reading table in the library.',
      locationId: 'library',
      date: d1.toISOString().split('T')[0],
      reportedBy: security.id,
      status: STATUS.ACTIVE,
      image: null,
      handedToSecurity: true,
      storageLocation: 'Security Desk A',
      securityQuestions: [{ question: 'What is the exact model?', answer: 'tune 230nc' }]
    });

    storage.create(COLLECTIONS.FOUND_ITEMS, {
      title: 'White water bottle Milton',
      category: 'water-bottles',
      color: 'white',
      brand: 'Milton',
      description: 'Found a white thermos near the labs.',
      locationId: 'labs',
      date: d2.toISOString().split('T')[0],
      reportedBy: student.id,
      status: STATUS.ACTIVE,
      image: null,
      handedToSecurity: true,
      storageLocation: 'Labs Front Desk'
    });

    storage.create(COLLECTIONS.FOUND_ITEMS, {
      title: 'Blue backpack Wildcraft',
      category: 'bags',
      color: 'blue',
      brand: 'Wildcraft',
      description: 'Left behind in the cafeteria.',
      locationId: 'cafeteria',
      date: d2.toISOString().split('T')[0],
      reportedBy: admin.id,
      status: STATUS.ACTIVE,
      image: null,
      handedToSecurity: true,
      storageLocation: 'Admin Office'
    });

    // 4. Create Pre-computed Matches
    storage.create(COLLECTIONS.MATCHES, {
      lostItemId: lostItem1.id,
      foundItemId: foundItem1.id,
      score: 85,
      reasons: ['Same category: electronics', 'Colors match: black', 'Similar descriptions/brand', 'Same location: library'],
      status: 'pending'
    });

    // 5. Create Notifications for the match
    createNotification({
      recipientId: lostItem1.reportedBy,
      type: 'match_found',
      title: 'High Confidence Match Found',
      message: 'We found a strong match for your lost JBL earbuds.',
      relatedId: foundItem1.id,
      relatedType: 'found'
    });

    // Set flag
    localStorage.setItem('niet_lf_seeded', 'true');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}
