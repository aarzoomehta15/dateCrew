import React, { useState } from 'react';
import { api } from '../api/client';
import { X, Sparkles, AlertCircle, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';
import ScoreMeter from './ScoreMeter';

export default function MatchExplainModal({ customer, candidate, match, onClose, onOpenSendIntro }) {
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  const fetchAiExplanation = async () => {
    setLoadingAi(true);
    setAiError('');
    try {
      const res = await api.getMatchExplanation(customer.id, candidate.id);
      setAiExplanation(res.explanation);
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI explanation');
    } finally {
      setLoadingAi(false);
    }
  };

  const categories = [
    { key: 'age', label: 'Age Alignment', color: '#6366f1' },
    { key: 'location', label: 'Location & Relocation', color: '#ec4899' },
    { key: 'education', label: 'Education & Career', color: '#10b981' },
    { key: 'lifestyle', label: 'Lifestyle & Diet', color: '#f59e0b' },
    { key: 'family', label: 'Family & Values', color: '#8b5cf6' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '750px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>
              Compatibility Score & Explainability Dossier
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Transparent mathematical score decomposition between {customer.firstName} & {candidate.firstName}
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

        {/* Overview Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.08) 100%)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <ScoreMeter score={match.score} tier={match.tier} size="lg" />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                {match.score}% Overall Compatibility
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Deterministic reciprocal algorithm score with verified biodata checks.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onOpenSendIntro) onOpenSendIntro();
            }}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
          >
            Propose Match <ChevronRight size={15} />
          </button>
        </div>

        {/* Category breakdown bars */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart2 size={16} /> Category Score Breakdown
          </h4>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {categories.map((cat) => {
              const catData = match.categoryBreakdown?.[cat.key] || { score: Math.round(match.score * 0.95), max: 100 };
              const pct = typeof catData === 'object' ? Math.round((catData.score / (catData.max || 100)) * 100) : catData;
              return (
                <div key={cat.key} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.825rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{cat.label}</span>
                    <span style={{ fontWeight: 700, color: cat.color }}>{pct}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(0, pct))}%`,
                      height: '100%',
                      borderRadius: 'var(--radius-full)',
                      background: cat.color,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why this match works & Considerations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Positive reasons */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={16} /> Why This Match Works
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem', fontSize: '0.8rem', color: '#e2e8f0' }}>
              {(match.positiveReasons && match.positiveReasons.length > 0) ? (
                match.positiveReasons.map((r, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#34d399' }}>•</span>
                    <span>{r}</span>
                  </li>
                ))
              ) : (
                <li style={{ color: 'var(--text-muted)' }}>High mutual compatibility across age, city, and lifestyle.</li>
              )}
            </ul>
          </div>

          {/* Potential conflicts / considerations */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <AlertCircle size={16} /> Potential Considerations
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem', fontSize: '0.8rem', color: '#e2e8f0' }}>
              {(match.potentialConflicts && match.potentialConflicts.length > 0) ? (
                match.potentialConflicts.map((c, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#fbbf24' }}>•</span>
                    <span>{c}</span>
                  </li>
                ))
              ) : (
                <li style={{ color: 'var(--text-muted)' }}>No dealbreakers or significant lifestyle divergences identified.</li>
              )}
            </ul>
          </div>
        </div>

        {/* AI Qualitative Narrative Generator */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                AI Matchmaker Qualitative Synthesis
              </span>
            </div>

            {!aiExplanation && (
              <button
                onClick={fetchAiExplanation}
                disabled={loadingAi}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                {loadingAi ? 'Synthesizing...' : 'Generate AI Synthesis'}
              </button>
            )}
          </div>

          {aiError && (
            <div style={{ color: '#fca5a5', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              {aiError}
            </div>
          )}

          {aiExplanation ? (
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, display: 'grid', gap: '0.75rem' }}>
              <div>
                <strong style={{ color: '#fff' }}>Matchmaker Summary:</strong> {typeof aiExplanation === 'string' ? aiExplanation : aiExplanation.summary}
              </div>

              {aiExplanation.reasons && (
                <div>
                  <strong style={{ color: '#fff' }}>Key Synergies:</strong>
                  <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0 }}>
                    {aiExplanation.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiExplanation.considerations && (
                <div>
                  <strong style={{ color: '#fff' }}>Conversation Starters & Considerations:</strong>
                  <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0 }}>
                    {aiExplanation.considerations.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              Click to generate a tailored matchmaker summary that combines qualitative biodata nuances, career trajectories, and conversation talking points.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
