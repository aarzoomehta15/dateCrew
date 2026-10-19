import React, { useState } from 'react';
import { api } from '../api/client';
import { X, MessageSquarePlus, AlertCircle } from 'lucide-react';

export default function NoteModal({ customerId, customerName, onClose, onNoteAdded }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState('Meeting');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter note content');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.addCustomerNote(customerId, { content, type });
      if (onNoteAdded) onNoteAdded(res.note);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record note');
    } finally {
      setSubmitting(false);
    }
  };

  const noteTypes = ['Meeting', 'Call', 'Follow-up', 'General'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '540px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Record Matchmaker Note</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Add consultation remarks or meeting feedback for {customerName}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.9rem',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Note Type Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Interaction Type
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {noteTypes.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    background: type === t ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: type === t ? '#fff' : 'var(--text-muted)',
                    border: type === t ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Consultation Notes / Feedback
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Discussed preferences on relocation. Customer indicated they are flexible if the candidate is in Bangalore or Mumbai..."
              className="input-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              <MessageSquarePlus size={16} />
              {submitting ? 'Saving Note...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
