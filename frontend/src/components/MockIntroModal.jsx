import React, { useState } from 'react';
import { api } from '../api/client';
import { X, Send, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import ScoreMeter from './ScoreMeter';

export default function MockIntroModal({ customer, candidate, match, onClose, onSuccess }) {
  const [message, setMessage] = useState(
    `Hi ${customer.firstName},\n\nI would like to introduce you to ${candidate.firstName} ${candidate.lastName}, based in ${candidate.city}. They are a ${candidate.designation || 'professional'} at ${candidate.currentCompany || 'a leading firm'}. We found great mutual synergy across lifestyle preferences, career ambition, and personal values.\n\nPlease let me know if you would like me to set up an introductory conversation.`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [emailResult, setEmailResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write an introduction message');
      return;
    }

    setSending(true);
    setError('');

    try {
      const res = await api.sendMatch({
        customerId: customer.id,
        candidateId: candidate.id,
        score: match.score,
        scoreBreakdown: match.categoryBreakdown,
        explanations: match.positiveReasons || [],
        introductionMessage: message,
      });

      setEmailResult(res.email);
      if (onSuccess) onSuccess(res.matchRecord);
    } catch (err) {
      setError(err.message || 'Failed to send match introduction');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
              {emailResult ? 'Match Introduction Dispatched' : 'Curate Match Introduction'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {emailResult ? 'Simulation preview of email sent to customer' : 'Send a personalized match proposal with explainable highlights'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Pair Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
        }}>
          {/* Customer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={customer.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
              alt={customer.firstName}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Recipient</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                {customer.firstName} {customer.lastName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{customer.city}</div>
            </div>
          </div>

          {/* Compatibility score in center */}
          <div style={{ textAlign: 'center' }}>
            <ScoreMeter score={match.score} tier={match.tier} size="md" />
          </div>

          {/* Candidate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Proposed Match</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                {candidate.firstName} {candidate.lastName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{candidate.city}</div>
            </div>
            <img
              src={candidate.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={candidate.firstName}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* If sent, show simulated email preview */}
        {emailResult ? (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#6ee7b7',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}>
              <CheckCircle2 size={18} />
              <span>Mock Match Introduction sent successfully! (No real email was delivered)</span>
            </div>

            <div style={{
              background: '#0e1422',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              fontSize: '0.85rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: 600 }}>To:</span> {emailResult.preview.to}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: 600 }}>From:</span> {emailResult.preview.from}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: 600 }}>Subject:</span> {emailResult.preview.subject}
              </div>
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
              }}>
                {emailResult.preview.body}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={onClose} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            {/* Highlights bullets */}
            {match.positiveReasons && match.positiveReasons.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Algorithm Highlights & Synergy Notes:
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  {match.positiveReasons.map((reason, idx) => (
                    <span key={idx} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      color: '#a5b4fc',
                    }}>
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom message textarea */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Personalized Introduction Note to Customer:
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-control"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={sending} className="btn-primary">
                {sending ? 'Sending Mock Intro...' : (
                  <>
                    <Send size={16} />
                    Send Mock Introduction
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
