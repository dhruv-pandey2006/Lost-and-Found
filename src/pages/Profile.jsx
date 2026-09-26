import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Hash, ShieldAlert, Lock, Save, Trash2, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Badge from '../components/Common/Badge';
import Card from '../components/Common/Card';
import Modal from '../components/Common/Modal';
import storage, { COLLECTIONS } from '../services/storage';
import { formatDate } from '../utils/helpers';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    reported: 0,
    matches: 0,
    claims: 0
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || ''
      });

      // Load stats
      const reportedLost = storage.count(COLLECTIONS.LOST_ITEMS, i => i.reportedBy === user.id);
      const reportedFound = storage.count(COLLECTIONS.FOUND_ITEMS, i => i.reportedBy === user.id);
      const myClaims = storage.count(COLLECTIONS.CLAIMS, c => c.claimantId === user.id);

      setStats({
        reported: reportedLost + reportedFound,
        matches: 0, // Simplified for now
        claims: myClaims
      });
    }
  }, [user]);

  const handleUpdateProfile = () => {
    if (!profileData.name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    const result = updateProfile({ name: profileData.name, phone: profileData.phone });
    if (result.success) {
      showToast('Profile updated successfully', 'success');
    } else {
      showToast(result.error || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      // Very basic simulation of change password
      const users = storage.getAll(COLLECTIONS.USERS);
      const currentUserRecord = users.find(u => u.id === user.id);

      if (currentUserRecord && currentUserRecord.password !== currentPassword) {
        showToast('Incorrect current password', 'error');
        return;
      }

      storage.update(COLLECTIONS.USERS, user.id, { password: newPassword });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully', 'success');
    } catch (err) {
      showToast('Failed to change password', 'error');
    }
  };

  const handleClearData = () => {
    try {
      // Remove all user's reports
      const lost = storage.getAll(COLLECTIONS.LOST_ITEMS).filter(i => i.reportedBy === user.id);
      const found = storage.getAll(COLLECTIONS.FOUND_ITEMS).filter(i => i.reportedBy === user.id);
      const claims = storage.getAll(COLLECTIONS.CLAIMS).filter(c => c.claimantId === user.id);

      lost.forEach(i => storage.remove(COLLECTIONS.LOST_ITEMS, i.id));
      found.forEach(i => storage.remove(COLLECTIONS.FOUND_ITEMS, i.id));
      claims.forEach(c => storage.remove(COLLECTIONS.CLAIMS, c.id));

      setDeleteModalOpen(false);
      showToast('All your data has been cleared', 'success');

      // Reload stats
      setStats({ reported: 0, matches: 0, claims: 0 });
    } catch (err) {
      showToast('Failed to clear data', 'error');
    }
  };

  if (!user) return null;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitials(user.name)}
        </div>
        <div className="profile-header-info">
          <h1>{user.name}</h1>
          <div className="profile-badges">
            <Badge variant="primary">{user.role}</Badge>
            <span className="member-since">Member since {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-section">
          <h2>Profile Information</h2>
          <Card className="profile-card">
            <div className="form-group-read">
              <label>Email Address</label>
              <div className="read-value">
                <Mail size={16} /> {user.email}
              </div>
            </div>

            <div className="form-group-read">
              <label>Student/Staff ID</label>
              <div className="read-value">
                <Hash size={16} /> {user.studentId || 'N/A'}
              </div>
            </div>

            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              icon={<User size={18} />}
            />

            <Input
              label="Phone Number"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              icon={<Phone size={18} />}
            />

            <Button onClick={handleUpdateProfile} className="mt-4">
              <Save size={18} /> Save Changes
            </Button>
          </Card>
        </section>

        <section className="profile-section">
          <h2>Activity Summary</h2>
          <Card className="profile-card stats-card">
            <div className="stat-item">
              <span className="stat-number">{stats.reported}</span>
              <span className="stat-label">Items Reported</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.claims}</span>
              <span className="stat-label">Claims Submitted</span>
            </div>
          </Card>
        </section>

        <section className="profile-section">
          <h2>Change Password</h2>
          <Card className="profile-card">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              icon={<Lock size={18} />}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              icon={<Lock size={18} />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              icon={<Lock size={18} />}
            />
            <Button variant="outline" onClick={handleChangePassword} className="mt-4">
              Change Password
            </Button>
          </Card>
        </section>

        <section className="profile-section danger-zone">
          <h2>Danger Zone</h2>
          <Card className="profile-card danger-card">
            <div className="danger-content">
              <div>
                <h3>Clear My Data</h3>
                <p>This will permanently delete all your reported lost/found items and claims. Your account will remain active.</p>
              </div>
              <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
                <Trash2 size={18} /> Clear Data
              </Button>
            </div>
          </Card>
        </section>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Clear Data Confirmation">
        <div className="modal-body">
          <p>Are you absolutely sure you want to clear all your data? This action <strong>cannot</strong> be undone.</p>
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleClearData}>Yes, clear my data</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
