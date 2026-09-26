import React, { useState, useEffect } from 'react';
import { Package, Shield, Check, FileText, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import Button from '../components/Common/Button';
import Badge from '../components/Common/Badge';
import Card from '../components/Common/Card';
import EmptyState from '../components/Common/EmptyState';
import SearchBar from '../components/Common/SearchBar';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';
import storage, { COLLECTIONS } from '../services/storage';
import { createNotification } from '../services/notifications';
import { STATUS } from '../utils/constants';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import './SecurityDashboard.css';

export default function SecurityDashboard() {
  const { showToast } = useToast();
  
  const [approvedClaims, setApprovedClaims] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recentHandovers, setRecentHandovers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [questionModal, setQuestionModal] = useState({ isOpen: false, itemId: null, questions: [{ question: '', answer: '' }] });

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const loadData = () => {
    // Approved Claims (Ready for handover)
    const claims = storage.query(COLLECTIONS.CLAIMS, c => c.status === STATUS.APPROVED);
    const populatedClaims = claims.map(c => {
      const match = storage.getById(COLLECTIONS.MATCHES, c.matchId);
      return {
        ...c,
        item: storage.getById(COLLECTIONS.FOUND_ITEMS, c.foundItemId),
        claimant: storage.getById(COLLECTIONS.USERS, c.claimantId),
        matchScore: match?.score
      };
    });
    setApprovedClaims(populatedClaims);

    // Inventory (Items handed to security, not yet resolved)
    let invItems = storage.query(COLLECTIONS.FOUND_ITEMS, i => i.handedToSecurity && i.status !== STATUS.RESOLVED);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      invItems = invItems.filter(i => i.title?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q));
    }
    setInventory(invItems);

    // Recent Handovers
    const collectedClaims = storage.query(COLLECTIONS.CLAIMS, c => c.status === 'collected')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10)
      .map(c => ({
        ...c,
        item: storage.getById(COLLECTIONS.FOUND_ITEMS, c.foundItemId),
        claimant: storage.getById(COLLECTIONS.USERS, c.claimantId)
      }));
    setRecentHandovers(collectedClaims);
  };

  const handleMarkCollected = (claim) => {
    const now = new Date().toISOString();

    // Update Claim
    storage.update(COLLECTIONS.CLAIMS, claim.id, {
      status: 'collected',
      updatedAt: now
    });

    // Update Found Item
    if (claim.item) {
      storage.update(COLLECTIONS.FOUND_ITEMS, claim.foundItemId, {
        status: STATUS.RESOLVED,
        updatedAt: now
      });

      // If there is a linked lost item, update it too (from match)
      const match = storage.query(COLLECTIONS.MATCHES, m => m.foundItemId === claim.foundItemId && m.lostItemId)[0];
      if (match) {
        storage.update(COLLECTIONS.LOST_ITEMS, match.lostItemId, {
          status: STATUS.RESOLVED,
          updatedAt: now
        });

        // Notify loser
        const lostItem = storage.getById(COLLECTIONS.LOST_ITEMS, match.lostItemId);
        if (lostItem) {
          createNotification({
            recipientId: lostItem.reportedBy,
            type: 'item_resolved',
            title: 'Item Returned',
            message: 'Your lost item has been successfully returned!',
            relatedId: claim.id,
            relatedType: 'claim'
          });
        }
      }
    }

    // Notify claimant
    createNotification({
      recipientId: claim.claimantId,
      type: 'item_resolved',
      title: 'Item Collected',
      message: 'Item has been successfully returned!',
      relatedId: claim.id,
      relatedType: 'claim'
    });

    showToast('Item marked as collected successfully', 'success');
    loadData();
  };

  const openQuestionModal = (item) => {
    const existing = item.securityQuestions;
    setQuestionModal({
      isOpen: true,
      itemId: item.id,
      questions: existing && existing.length > 0
        ? existing.map(q => ({ question: q.question, answer: q.answer }))
        : [{ question: '', answer: '' }]
    });
  };

  const closeQuestionModal = () => {
    setQuestionModal({ isOpen: false, itemId: null, questions: [{ question: '', answer: '' }] });
  };

  const handleQuestionRowChange = (index, field, value) => {
    setQuestionModal(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const addQuestionRow = () => {
    setQuestionModal(prev => (
      prev.questions.length < 3
        ? { ...prev, questions: [...prev.questions, { question: '', answer: '' }] }
        : prev
    ));
  };

  const removeQuestionRow = (index) => {
    setQuestionModal(prev => {
      const questions = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions: questions.length > 0 ? questions : [{ question: '', answer: '' }] };
    });
  };

  const handleSaveQuestion = () => {
    const validQuestions = questionModal.questions
      .filter(q => q.question.trim() && q.answer.trim())
      .map(q => ({ question: q.question.trim(), answer: q.answer.trim().toLowerCase() }));

    if (validQuestions.length === 0) {
      showToast('Please fill in at least one question and answer', 'error');
      return;
    }

    storage.update(COLLECTIONS.FOUND_ITEMS, questionModal.itemId, {
      securityQuestions: validQuestions
    });

    closeQuestionModal();
    showToast('Verification questions saved', 'success');
    loadData();
  };

  return (
    <div className="security-page">
      <div className="security-header">
        <div>
          <h1 className="page-title">Security Desk</h1>
          <p className="page-subtitle">Manage item handovers and verification</p>
        </div>
        <Shield size={32} className="header-icon" />
      </div>

      <section className="security-section security-approved">
        <div className="section-header">
          <h2>Items Ready for Handover <Badge variant="success">{approvedClaims.length}</Badge></h2>
        </div>
        
        {approvedClaims.length === 0 ? (
          <EmptyState title="No items pending handover" message="There are currently no approved claims waiting for collection." icon={Check} />
        ) : (
          <div className="handover-grid">
            {approvedClaims.map(claim => (
              <Card key={claim.id} className="handover-card">
                <div className="handover-item-details">
                  <div className="item-info">
                    <h3>{claim.item?.title || 'Unknown Item'}</h3>
                    <p className="item-meta">Location: {claim.item?.storageLocation || 'Security Office'}</p>
                    <p className="item-meta">Approved: {formatDate(claim.createdAt)}</p>
                  </div>
                </div>
                <div className="handover-claimant-details">
                  <h4>Claimant</h4>
                  <p><strong>Name:</strong> {claim.claimant?.name}</p>
                  <p><strong>Contact:</strong> {claim.claimant?.phone || claim.claimant?.email}</p>
                  <p><strong>Match Score:</strong> {claim.matchScore}%</p>
                </div>
                <div className="handover-actions">
                  <Button variant="success" className="handover-btn" onClick={() => handleMarkCollected(claim)}>
                    <Package size={18} /> Mark as Collected
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="security-grid-2">
        <section className="security-section security-inventory">
          <div className="section-header">
            <h2>Items at Security Office</h2>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search inventory..." />
          </div>
          
          <div className="inventory-list">
            {inventory.length === 0 ? (
              <EmptyState title="No items found" message="No matching items in security inventory." />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date Received</th>
                    <th>Status</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>{item.storageLocation || 'Main Office'}</td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td><Badge>{item.status}</Badge></td>
                      <td>
                        <Button variant="outline" size="sm" onClick={() => openQuestionModal(item)}>
                          <HelpCircle size={14} />
                          {item.securityQuestions?.length > 0 ? 'Edit Question' : 'Set Question'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="security-section security-recent">
          <div className="section-header">
            <h2>Recently Completed</h2>
          </div>
          
          <div className="recent-list">
            {recentHandovers.length === 0 ? (
              <p className="text-muted">No recent handovers.</p>
            ) : (
              recentHandovers.map(claim => (
                <div key={claim.id} className="recent-item">
                  <div className="recent-icon"><Check size={20} /></div>
                  <div className="recent-details">
                    <p className="recent-title">{claim.item?.title || 'Item'}</p>
                    <p className="recent-meta">Handed to {claim.claimant?.name} • {formatRelativeTime(claim.updatedAt || claim.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={questionModal.isOpen}
        onClose={closeQuestionModal}
        title="Set Verification Questions"
      >
        <div className="modal-body">
          <p className="page-subtitle">
            Ask something you can only know from having the actual item in hand - the claimant needs to get at least 2 out of 3 correct before you hand it over.
          </p>

          {questionModal.questions.map((q, index) => (
            <div key={index} className="security-question-row">
              <div className="sq-inputs">
                <Input
                  label={`Question ${index + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionRowChange(index, 'question', e.target.value)}
                  placeholder="e.g., What color is the lining inside?"
                  fullWidth
                />
                <Input
                  label="Expected Answer"
                  value={q.answer}
                  onChange={(e) => handleQuestionRowChange(index, 'answer', e.target.value)}
                  placeholder="e.g., red"
                  fullWidth
                />
              </div>
              {questionModal.questions.length > 1 && (
                <button type="button" className="sq-delete-btn" onClick={() => removeQuestionRow(index)} title="Remove question">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}

          {questionModal.questions.length < 3 && (
            <button type="button" className="add-question-btn" onClick={addQuestionRow}>
              <Plus size={16} /> Add Another Question
            </button>
          )}

          <div className="modal-actions">
            <Button variant="outline" onClick={closeQuestionModal}>Cancel</Button>
            <Button onClick={handleSaveQuestion}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
