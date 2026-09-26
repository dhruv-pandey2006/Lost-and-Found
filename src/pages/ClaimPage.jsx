import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import storage, { COLLECTIONS } from '../services/storage';
import { createNotification } from '../services/notifications';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import './ClaimPage.css';

export default function ClaimPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [match, setMatch] = useState(null);
  const [lostItem, setLostItem] = useState(null);
  const [foundItem, setFoundItem] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const allMatches = storage.getAll(COLLECTIONS.MATCHES);
    const foundMatch = allMatches.find(m => m.id === matchId);

    if (foundMatch) {
      const lItem = storage.getById(COLLECTIONS.LOST_ITEMS, foundMatch.lostItemId);
      const fItem = storage.getById(COLLECTIONS.FOUND_ITEMS, foundMatch.foundItemId);

      if (!lItem || lItem.reportedBy !== user.id) {
        showToast('You are not authorized to claim this item', 'error');
        navigate('/matches');
        setLoading(false);
        return;
      }

      setMatch(foundMatch);
      setLostItem(lItem);
      setFoundItem(fItem);

      // Initialize answers object
      if (fItem && fItem.securityQuestions) {
        const initialAnswers = {};
        fItem.securityQuestions.forEach((q, idx) => {
          initialAnswers[idx] = '';
        });
        setAnswers(initialAnswers);
      }
    } else {
      showToast('Match not found', 'error');
      navigate('/matches');
    }
    setLoading(false);
  }, [matchId, user, navigate, showToast]);

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!foundItem || !foundItem.securityQuestions) {
      showToast('No security questions found to verify against.', 'error');
      return;
    }

    const questions = foundItem.securityQuestions;
    let correctCount = 0;

    questions.forEach((q, idx) => {
      const userAnswer = (answers[idx] || '').trim().toLowerCase();
      const correctAnswer = (q.answer || '').trim().toLowerCase();
      
      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    const accuracy = correctCount / questions.length;
    const isVerified = accuracy >= 0.67; // At least 2/3 correct

    if (isVerified) {
      // Create claim record
      const newClaim = storage.create(COLLECTIONS.CLAIMS, {
        matchId,
        claimantId: user.id,
        foundItemId: foundItem.id,
        lostItemId: lostItem.id,
        answers,
        accuracy,
        status: 'pending'
      });

      // Notify the found item owner
      createNotification({
        recipientId: foundItem.reportedBy,
        type: 'claim_submitted',
        title: 'New Claim Received',
        message: `Someone has submitted a claim for your found item: ${foundItem.title}`,
        relatedId: newClaim.id,
        relatedType: 'claim'
      });

      showToast('Claim submitted successfully! The admin/finder will review it.', 'success');
      navigate('/matches');
    } else {
      showToast('Verification failed. Your answers did not match sufficiently.', 'error');
    }
  };

  if (loading) return <div className="container loading">Loading claim details...</div>;
  if (!match || !lostItem || !foundItem) return <div className="container error">Error loading details.</div>;

  const hasQuestions = foundItem.securityQuestions && foundItem.securityQuestions.length > 0;

  return (
    <div className="claim-page container">
      <div className="claim-header">
        <h1>Claim Verification</h1>
        <p className="subtitle">Prove ownership of this item to proceed with the claim.</p>
      </div>

      <div className="claim-layout">
        <div className="claim-info-panel">
          <div className="verification-notice">
            <ShieldCheck size={24} className="notice-icon" />
            <div>
              <h3>Security Verification</h3>
              <p>Answer the verification question(s) set by campus security after inspecting the item. You need to get at least 2 out of 3 correct to claim this item.</p>
            </div>
          </div>

          <div className="claim-item-preview">
            <h3>Item to Claim</h3>
            <div className="preview-card">
              {foundItem.image ? (
                <img src={foundItem.image} alt={foundItem.title} className="preview-img" />
              ) : (
                <div className="preview-placeholder">No Image</div>
              )}
              <div className="preview-details">
                <h4>{foundItem.title}</h4>
                <p>{foundItem.category}</p>
                <p className="text-sm text-slate-500">Found on {new Date(foundItem.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="claim-form-panel">
          <form onSubmit={handleSubmit} className="security-form">
            {hasQuestions ? (
              foundItem.securityQuestions.map((q, idx) => (
                <div key={idx} className="question-group">
                  <label className="question-label">
                    Question {idx + 1}: {q.question}
                  </label>
                  <Input
                    type="text"
                    placeholder="Your answer..."
                    value={answers[idx] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    required
                  />
                </div>
              ))
            ) : (
              <div className="no-questions-notice">
                <AlertCircle size={20} className="text-warning" />
                <p>Security hasn't set a verification question for this item yet. Check back once it's been logged at the security office.</p>
              </div>
            )}

            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!hasQuestions}>
                Submit Claim Verification
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
