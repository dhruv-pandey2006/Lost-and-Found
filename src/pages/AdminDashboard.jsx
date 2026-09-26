import React, { useState, useEffect } from 'react';
import { Users, FileX, FilePlus, Radar, Check, X as XIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Badge from '../components/Common/Badge';
import Card from '../components/Common/Card';
import EmptyState from '../components/Common/EmptyState';
import Modal from '../components/Common/Modal';
import SearchBar from '../components/Common/SearchBar';
import storage, { COLLECTIONS } from '../services/storage';
import { createNotification } from '../services/notifications';
import { ROLES, STATUS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState({
    users: 0,
    lostItems: 0,
    foundItems: 0,
    matches: 0,
    active: 0,
    resolved: 0,
    pendingClaims: 0,
    resolutionRate: 0
  });

  const [pendingClaims, setPendingClaims] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportTab, setReportTab] = useState('lost');
  const [searchQuery, setSearchQuery] = useState('');

  const [rejectModal, setRejectModal] = useState({ isOpen: false, claimId: null, reason: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null, collection: null });

  useEffect(() => {
    loadData();
  }, [reportTab, searchQuery]);

  const loadData = () => {
    // Stats
    const totalUsers = storage.count(COLLECTIONS.USERS);
    const lostItems = storage.count(COLLECTIONS.LOST_ITEMS);
    const foundItems = storage.count(COLLECTIONS.FOUND_ITEMS);
    const totalMatches = storage.count(COLLECTIONS.MATCHES);

    const activeLost = storage.count(COLLECTIONS.LOST_ITEMS, i => i.status === STATUS.ACTIVE);
    const activeFound = storage.count(COLLECTIONS.FOUND_ITEMS, i => i.status === STATUS.ACTIVE);
    const resolvedLost = storage.count(COLLECTIONS.LOST_ITEMS, i => i.status === STATUS.RESOLVED);
    const resolvedFound = storage.count(COLLECTIONS.FOUND_ITEMS, i => i.status === STATUS.RESOLVED);

    const activeCount = activeLost + activeFound;
    const resolvedCount = resolvedLost + resolvedFound;
    const totalItems = lostItems + foundItems;

    const pendingClaimsList = storage.query(COLLECTIONS.CLAIMS, c => c.status === STATUS.PENDING);

    setStats({
      users: totalUsers,
      lostItems,
      foundItems,
      matches: totalMatches,
      active: activeCount,
      resolved: resolvedCount,
      pendingClaims: pendingClaimsList.length,
      resolutionRate: totalItems > 0 ? Math.round((resolvedCount / totalItems) * 100) : 0
    });

    // Claims
    const populatedClaims = pendingClaimsList.map(claim => {
      const item = storage.getById(COLLECTIONS.FOUND_ITEMS, claim.foundItemId);
      const claimant = storage.getById(COLLECTIONS.USERS, claim.claimantId);
      const relatedMatch = storage.getById(COLLECTIONS.MATCHES, claim.matchId);
      return { ...claim, item, claimant, matchScore: relatedMatch?.score };
    });
    setPendingClaims(populatedClaims);

    // Users
    setAllUsers(storage.getAll(COLLECTIONS.USERS));

    // Reports
    const collection = reportTab === 'lost' ? COLLECTIONS.LOST_ITEMS : COLLECTIONS.FOUND_ITEMS;
    let items = storage.getAll(collection);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.title?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q));
    }

    // populate reporter
    items = items.map(item => ({
      ...item,
      reporter: storage.getById(COLLECTIONS.USERS, item.reportedBy)
    }));

    setReports(items);
  };

  const handleApproveClaim = (claim) => {
    storage.update(COLLECTIONS.CLAIMS, claim.id, { status: STATUS.APPROVED });
    if (claim.item) {
      storage.update(COLLECTIONS.FOUND_ITEMS, claim.foundItemId, { status: 'claimed' });
    }

    createNotification({
      recipientId: claim.claimantId,
      type: 'claim_approved',
      title: 'Claim Approved',
      message: 'Your claim has been approved! Collect from security office.',
      relatedId: claim.id,
      relatedType: 'claim'
    });

    showToast('Claim approved successfully', 'success');
    loadData();
  };

  const handleRejectClaim = () => {
    storage.update(COLLECTIONS.CLAIMS, rejectModal.claimId, { status: STATUS.REJECTED, rejectionReason: rejectModal.reason });

    const claim = pendingClaims.find(c => c.id === rejectModal.claimId);
    if (claim) {
      createNotification({
        recipientId: claim.claimantId,
        type: 'claim_rejected',
        title: 'Claim Rejected',
        message: `Your claim was rejected. Reason: ${rejectModal.reason}`,
        relatedId: claim.id,
        relatedType: 'claim'
      });
    }

    setRejectModal({ isOpen: false, claimId: null, reason: '' });
    showToast('Claim rejected', 'info');
    loadData();
  };

  const handleDeleteItem = () => {
    storage.remove(deleteModal.collection, deleteModal.itemId);
    setDeleteModal({ isOpen: false, itemId: null, collection: null });
    showToast('Item deleted', 'success');
    loadData();
  };

  const handleChangeRole = (userId, newRole) => {
    storage.update(COLLECTIONS.USERS, userId, { role: newRole });
    showToast('User role updated', 'success');
    loadData();
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">Admin Dashboard</h1>
      
      <div className="admin-analytics">
        <Card className="admin-stat-card stat-users">
          <div className="stat-icon"><Users /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.users}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </Card>
        <Card className="admin-stat-card stat-lost">
          <div className="stat-icon"><FileX /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.lostItems}</span>
            <span className="stat-label">Lost Items</span>
          </div>
        </Card>
        <Card className="admin-stat-card stat-found">
          <div className="stat-icon"><FilePlus /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.foundItems}</span>
            <span className="stat-label">Found Items</span>
          </div>
        </Card>
        <Card className="admin-stat-card stat-matches">
          <div className="stat-icon"><Radar /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.matches}</span>
            <span className="stat-label">Total Matches</span>
          </div>
        </Card>
        
        <Card className="admin-stat-card stat-active">
          <div className="stat-icon"><Radar /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active Reports</span>
          </div>
        </Card>
        <Card className="admin-stat-card stat-resolved">
          <div className="stat-icon"><Check /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-label">Resolved Items</span>
          </div>
        </Card>
        <Card className="admin-stat-card stat-claims">
          <div className="stat-icon"><FileX /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.pendingClaims}</span>
            <span className="stat-label">Pending Claims</span>
          </div>
        </Card>
        <Card className="admin-stat-card stat-rate">
          <div className="stat-icon"><Users /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.resolutionRate}%</span>
            <span className="stat-label">Resolution Rate</span>
          </div>
        </Card>
      </div>

      <section className="admin-section admin-claims">
        <div className="section-header">
          <h2>Pending Claims <Badge variant="warning">{stats.pendingClaims}</Badge></h2>
        </div>
        {pendingClaims.length === 0 ? (
          <EmptyState title="No pending claims" message="No pending claims to review" icon={Check} />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Claimant</th>
                  <th>Item</th>
                  <th>Match Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingClaims.map(claim => (
                  <tr key={claim.id}>
                    <td>{claim.claimant?.name || 'Unknown'}</td>
                    <td>{claim.item?.title || 'Unknown Item'}</td>
                    <td>{claim.matchScore || 0}%</td>
                    <td>{claim.accuracy || 0}%</td>
                    <td>{formatDate(claim.createdAt)}</td>
                    <td className="actions-cell">
                      <Button variant="success" size="sm" onClick={() => handleApproveClaim(claim)}>
                        <Check size={16} /> Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setRejectModal({ isOpen: true, claimId: claim.id, reason: '' })}>
                        <XIcon size={16} /> Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section admin-reports">
        <div className="section-header">
          <h2>All Reports</h2>
          <div className="reports-controls">
            <div className="tabs">
              <button className={`tab ${reportTab === 'lost' ? 'active' : ''}`} onClick={() => setReportTab('lost')}>Lost Items</button>
              <button className={`tab ${reportTab === 'found' ? 'active' : ''}`} onClick={() => setReportTab('found')}>Found Items</button>
            </div>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search reports..." />
          </div>
        </div>
        
        {reports.length === 0 ? (
          <EmptyState title="No reports found" message="Try adjusting your search" />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(item => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td><Badge>{item.status}</Badge></td>
                    <td>{item.reporter?.name || 'Unknown'}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => setDeleteModal({ isOpen: true, itemId: item.id, collection: reportTab === 'lost' ? COLLECTIONS.LOST_ITEMS : COLLECTIONS.FOUND_ITEMS })}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section admin-users">
        <div className="section-header">
          <h2>User Management</h2>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Student ID</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.studentId || '-'}</td>
                  <td><Badge>{u.role}</Badge></td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <select 
                      value={u.role} 
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      disabled={u.id === user?.id}
                      className="role-select"
                    >
                      <option value={ROLES.STUDENT}>Student</option>
                      <option value={ROLES.SECURITY}>Security</option>
                      <option value={ROLES.ADMIN}>Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={rejectModal.isOpen} onClose={() => setRejectModal({ isOpen: false, claimId: null, reason: '' })} title="Reject Claim">
        <div className="modal-body">
          <Input 
            label="Rejection Reason" 
            value={rejectModal.reason} 
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })} 
            placeholder="Why is this claim being rejected?"
          />
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setRejectModal({ isOpen: false, claimId: null, reason: '' })}>Cancel</Button>
            <Button variant="danger" onClick={handleRejectClaim} disabled={!rejectModal.reason.trim()}>Confirm Reject</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, itemId: null, collection: null })} title="Confirm Delete">
        <div className="modal-body">
          <p>Are you sure you want to delete this report? This action cannot be undone.</p>
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, itemId: null, collection: null })}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteItem}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
