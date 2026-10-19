import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Send,
  Mail,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  X,
} from 'lucide-react';
import ScoreMeter from '../components/ScoreMeter';
import { formatDate, formatTimeAgo } from '../utils/formatters';

export default function SentMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedEmailPreview, setSelectedEmailPreview] = useState(null);

  useEffect(() => {
    loadMatches();
  }, [statusFilter]);

  const loadMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getSentMatches({
        status: statusFilter,
        search,
      });
      setMatches(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load sent matches');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (matchId, newStatus) => {
    try {
      await api.updateSentMatchStatus(matchId, newStatus);
      setMatches(matches.map(m => m.id === matchId ? { ...m, status: newStatus } : m));
    } catch (err) {
      alert(err.message || 'Failed to update match status');
    }
  };

  const matchStatuses = [
    'Sent',
    'Awaiting Response',
    'Interested',
    'Meeting Scheduled',
    'Declined',
    'Completed',
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sent':
        return <span className="badge badge-new"><Send size={12} /> Sent</span>;
      case 'Awaiting Response':
        return <span className="badge badge-review"><Clock size={12} /> Awaiting Response</span>;
      case 'Interested':
        return <span className="badge badge-ready"><CheckCircle2 size={12} /> Interested</span>;
      case 'Meeting Scheduled':
        return <span className="badge badge-meeting"><Calendar size={12} /> Meeting Scheduled</span>;
      case 'Declined':
        return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.3)' }}><XCircle size={12} /> Declined</span>;
      case 'Completed':
        return <span className="badge badge-progress">Completed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Sent Match Introductions & Registry
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track client responses, schedule dates, and monitor match outcomes.
          </p>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Total Sent: <strong style={{ color: '#fff' }}>{matches.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by customer or candidate name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadMatches()}
              className="input-control"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <div style={{ minWidth: '200px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-control"
            >
              <option value="">All Match Statuses</option>
              {matchStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button onClick={loadMatches} className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            Filter
          </button>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading match introduction records...
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', borderRadius: 'var(--radius-md)', color: '#fda4af' }}>
          {error}
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Mail size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No match introductions found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Select an eligible customer from the directory to discover and send match introductions.
          </p>
          <Link to="/customers" className="btn-primary">
            Explore Customer Directory
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {matches.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'auto 1.5fr 1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              {/* Score circle */}
              <div>
                <ScoreMeter score={item.score} size="md" />
              </div>

              {/* Pair Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                  <Link
                    to={`/customers/${item.customerId}`}
                    style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}
                  >
                    {item.customerName}
                  </Link>
                  <ArrowRight size={14} color="var(--text-dim)" />
                  <Link
                    to={`/customers/${item.candidateId}`}
                    style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}
                  >
                    {item.candidateName}
                  </Link>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                  <span>Dispatched: {formatDate(item.sentAt || item.createdAt)} ({formatTimeAgo(item.sentAt || item.createdAt)})</span>
                </div>

                {item.explanations && item.explanations.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {item.explanations.slice(0, 2).map((exp, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.725rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#c7d2fe',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}>
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <div style={{ marginBottom: '0.4rem' }}>
                  {getStatusBadge(item.status)}
                </div>
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className="input-control"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
                >
                  {matchStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Email preview button */}
              <div>
                <button
                  onClick={() => setSelectedEmailPreview(item)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
                >
                  <Eye size={15} /> View Email Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedEmailPreview && (
        <div className="modal-overlay" onClick={() => setSelectedEmailPreview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                  Simulated Introduction Message
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                  To {selectedEmailPreview.customerName} regarding {selectedEmailPreview.candidateName}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmailPreview(null)}
                style={{ background: 'transparent', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: '#0e1422',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              fontSize: '0.875rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {selectedEmailPreview.introductionMessage}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedEmailPreview(null)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
