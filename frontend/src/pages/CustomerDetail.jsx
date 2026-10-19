import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  ShieldCheck,
  FileText,
  Sparkles,
  Send,
  Plus,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react';
import { JourneyBadge, VerificationBadge } from '../components/StatusBadge';
import ScoreMeter from '../components/ScoreMeter';
import MockIntroModal from '../components/MockIntroModal';
import MatchExplainModal from '../components/MatchExplainModal';
import NoteModal from '../components/NoteModal';
import { calculateAge, formatINR, formatDate, formatTimeAgo } from '../utils/formatters';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active tab: 'biodata', 'matches', 'notes', 'history'
  const [activeTab, setActiveTab] = useState('biodata');

  // Matches State
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchFilters, setMatchFilters] = useState({
    city: '',
    minAge: '',
    maxAge: '',
    verifiedOnly: false,
    minScore: '',
  });
  const [showOverridePanel, setShowOverridePanel] = useState(false);

  // Notes State
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // History State
  const [activities, setActivities] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Modals for Match
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);

  // Status transition state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');

  useEffect(() => {
    loadCustomer();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'matches') loadMatches();
    if (activeTab === 'notes') loadNotes();
    if (activeTab === 'history') loadHistory();
  }, [activeTab, id]);

  const loadCustomer = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getCustomer(id);
      setCustomer(res.customer);
    } catch (err) {
      setError(err.message || 'Customer not found or not assigned to you');
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async (customFilters = matchFilters) => {
    setMatchesLoading(true);
    try {
      const res = await api.getCustomerMatches(id, customFilters);
      setMatches(res.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchesLoading(false);
    }
  };

  const loadNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await api.getCustomerNotes(id);
      setNotes(res.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getActivity({ customerId: id });
      setActivities(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === customer.journeyStatus) return;
    setUpdatingStatus(true);
    setStatusSuccessMsg('');
    try {
      const res = await api.updateCustomerStatus(id, newStatus);
      setCustomer(res.customer);
      setStatusSuccessMsg(`Status updated to "${newStatus}"`);
      setTimeout(() => setStatusSuccessMsg(''), 4000);
      if (activeTab === 'history') loadHistory();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading verified customer dossier...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ padding: '1.25rem', background: 'rgba(244, 63, 94, 0.15)', borderRadius: 'var(--radius-md)', color: '#fda4af' }}>
          {error || 'Customer profile not found'}
        </div>
        <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', color: 'var(--primary)' }}>
          <ArrowLeft size={16} /> Back to Customer List
        </Link>
      </div>
    );
  }

  const age = calculateAge(customer.dateOfBirth);
  const journeyStatuses = [
    'New',
    'Profile Review',
    'Ready for Matching',
    'Matches Sent',
    'Meeting Scheduled',
    'In Progress',
    'On Hold',
    'Closed',
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Back button */}
      <Link
        to="/customers"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={16} /> Back to Customer Directory
      </Link>

      {/* Header Profile Hero Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          {/* Left: Avatar + Identity */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <img
              src={customer.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
              alt={customer.firstName}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '20px',
                objectFit: 'cover',
                border: '2px solid var(--border-card)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {customer.firstName} {customer.lastName}
                </h1>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                  ({age ? `${age}y` : ''} • {customer.gender})
                </span>
                <VerificationBadge status={customer.verification?.status} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--primary)" /> {customer.city}, {customer.country}
                </span>
                {customer.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} color="var(--primary)" /> {customer.email}
                  </span>
                )}
                {customer.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} color="var(--primary)" /> {customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stage Advancement Selector */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            minWidth: '260px',
          }}>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              Journey Stage Progression
            </div>
            <select
              value={customer.journeyStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="input-control"
              style={{ fontWeight: 600, color: '#fff', background: '#1c2538' }}
            >
              {journeyStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {statusSuccessMsg && (
              <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} /> {statusSuccessMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '2rem',
      }}>
        {[
          { id: 'biodata', label: 'Verified Biodata (360°)', icon: FileText },
          { id: 'matches', label: 'Match Discovery Engine', icon: Sparkles },
          { id: 'notes', label: `Matchmaker Notes (${notes.length || '—'})`, icon: Users },
          { id: 'history', label: 'Journey Audit Trail', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.25rem',
                background: 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary)' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BIODATA & 360 OVERVIEW */}
      {activeTab === 'biodata' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', alignItems: 'flex-start' }}>
          {/* Left Column */}
          <div style={{ display: 'grid', gap: '1.75rem' }}>
            {/* Personal & Cultural Attributes */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--primary)" /> Personal & Cultural Attributes
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Marital Status</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{customer.maritalStatus}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Height</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{customer.heightCm ? `${customer.heightCm} cm (${Math.floor(customer.heightCm / 30.48)}'${Math.round((customer.heightCm % 30.48) / 2.54)}")` : 'Not specified'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Mother Tongue</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{customer.motherTongue || '—'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Languages Known</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{customer.languagesKnown?.join(', ') || '—'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Religion & Community</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{customer.religion} {customer.caste ? `• ${customer.caste}` : ''}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sub-caste & Gotra</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{customer.subCaste || '—'} {customer.gotra ? `(Gotra: ${customer.gotra})` : ''}</div>
                </div>
              </div>
            </div>

            {/* Education & Career */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} color="var(--primary)" /> Education & Career Dossier
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Current Role</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{customer.designation}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{customer.currentCompany}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Annual Income</div>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>{formatINR(customer.incomeINR)}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Employment: {customer.employmentType || 'Full-time'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Highest Education</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{customer.highestEducation || 'Graduate'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Undergraduate College</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{customer.undergraduateCollege || '—'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{customer.degree}</div>
                </div>
              </div>
            </div>

            {/* Family & Lineage */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={18} color="var(--primary)" /> Family & Lineage
              </h3>
              <div style={{ display: 'grid', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Family Type</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{customer.familyType} Family</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Family Values</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{customer.familyValues}</div>
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Family Location & Siblings</div>
                  <div style={{ color: '#e2e8f0' }}>Based in {customer.familyLocation || customer.city}. Siblings: {customer.siblings?.details || 'None'}</div>
                </div>
                {customer.familyBackground && (
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Background Overview</div>
                    <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{customer.familyBackground}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'grid', gap: '1.75rem' }}>
            {/* Lifestyle & Expectations */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Lifestyle & Personal Values</h3>
              <div style={{ display: 'grid', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Dietary Preference</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{customer.dietaryPreference || 'Not specified'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Wants Children</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{customer.wantsKids || 'Open'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Relocation</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{customer.openToRelocate || 'Open'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pets</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{customer.openToPets || 'Open'}</div>
                  </div>
                </div>

                {customer.interests && customer.interests.length > 0 && (
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Interests & Passions
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {customer.interests.map((interest, idx) => (
                        <span key={idx} style={{
                          padding: '0.25rem 0.65rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          color: '#e2e8f0',
                        }}>
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {customer.relationshipExpectations && (
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Relationship Expectations
                    </div>
                    <div style={{
                      padding: '0.85rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#cbd5e1',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}>
                      "{customer.relationshipExpectations}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Partner Preferences & Dealbreakers */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Partner Preferences & Dealbreakers</h3>
              <div style={{ display: 'grid', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Preferred Age</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>
                      {customer.preferredAgeRange?.min || '—'} to {customer.preferredAgeRange?.max || '—'} yrs
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Preferred Locations</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>
                      {customer.preferredLocations?.join(', ') || 'Flexible'}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Mandatory Dealbreakers (Rules Engine Filter)
                  </div>
                  {customer.dealbreakers && customer.dealbreakers.length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.4rem' }}>
                      {customer.dealbreakers.map((db, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.45rem 0.75rem',
                          background: 'rgba(244, 63, 94, 0.1)',
                          border: '1px solid rgba(244, 63, 94, 0.25)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#fda4af',
                          fontSize: '0.775rem',
                          fontWeight: 600,
                        }}>
                          <AlertCircle size={14} />
                          <span>{db.field} {db.condition.replace('_', ' ')}: {String(db.value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>No strict dealbreakers configured.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Credentials */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={18} color="#34d399" /> Verification Details
                </h3>
                <VerificationBadge status={customer.verification?.status} />
              </div>
              <div style={{ fontSize: '0.825rem', color: '#cbd5e1', display: 'grid', gap: '0.4rem' }}>
                <div><strong>Method:</strong> {customer.verification?.method || 'Government ID Verification'}</div>
                <div><strong>Verified At:</strong> {formatDate(customer.verification?.verifiedAt)}</div>
                {customer.verification?.notes && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    Notes: {customer.verification.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATCH DISCOVERY ENGINE */}
      {activeTab === 'matches' && (
        <div>
          {/* Header & Recalculate Filter Bar */}
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                  Ranked Match Candidates for {customer.firstName}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Filtered via dealbreakers & scored with reciprocal suitability weights.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={() => setShowOverridePanel(!showOverridePanel)}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Sliders size={15} /> Adjust Overrides & Weights
                </button>
              </div>
            </div>

            {/* Recalculate Panel */}
            {showOverridePanel && (
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
                gap: '0.75rem',
                alignItems: 'flex-end',
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Target City Filter
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore"
                    value={matchFilters.city}
                    onChange={(e) => setMatchFilters({ ...matchFilters, city: e.target.value })}
                    className="input-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Min Match Score
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={matchFilters.minScore}
                    onChange={(e) => setMatchFilters({ ...matchFilters, minScore: e.target.value })}
                    className="input-control"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px' }}>
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    checked={matchFilters.verifiedOnly}
                    onChange={(e) => setMatchFilters({ ...matchFilters, verifiedOnly: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="verifiedOnly" style={{ fontSize: '0.8rem', color: '#fff', cursor: 'pointer' }}>
                    Verified Profiles Only
                  </label>
                </div>

                <button
                  onClick={() => loadMatches(matchFilters)}
                  className="btn-primary"
                  style={{ height: '38px', padding: '0 1.25rem' }}
                >
                  Recalculate
                </button>
              </div>
            )}
          </div>

          {/* Matches List */}
          {matchesLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Calculating compatibility scores across candidate pool...
            </div>
          ) : matches.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <Heart size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No matching candidates found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                All available profiles either conflict with dealbreakers or have already been sent.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {matches.map((match) => {
                const candidate = match.candidate;
                const candAge = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : candidate.age;

                return (
                  <div
                    key={match.candidateId}
                    className="glass-card"
                    style={{
                      padding: '1.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '1.5rem',
                      alignItems: 'center',
                    }}
                  >
                    {/* Score column */}
                    <div style={{ textAlign: 'center' }}>
                      <ScoreMeter score={match.score} tier={match.tier} size="lg" />
                    </div>

                    {/* Candidate Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <Link
                          to={`/customers/${match.candidateId}`}
                          style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}
                        >
                          {candidate.firstName} {candidate.lastName}
                        </Link>
                        {candAge && (
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            • {candAge} yrs
                          </span>
                        )}
                        <VerificationBadge status={candidate.verification?.status || candidate.verification} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} color="var(--primary)" /> {candidate.city}
                        </span>
                        <span>
                          {candidate.designation} at {candidate.currentCompany}
                        </span>
                        {candidate.highestEducation && (
                          <span>• {candidate.highestEducation}</span>
                        )}
                      </div>

                      {/* Positive reasons pills */}
                      {match.positiveReasons && match.positiveReasons.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {match.positiveReasons.slice(0, 3).map((reason, idx) => (
                            <span key={idx} style={{
                              fontSize: '0.725rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              color: '#6ee7b7',
                            }}>
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '170px' }}>
                      <button
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setSelectedMatch(match);
                          setShowExplainModal(true);
                        }}
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
                      >
                        <Info size={14} /> Explain Score
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setSelectedMatch(match);
                          setShowIntroModal(true);
                        }}
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
                      >
                        <Send size={14} /> Send Introduction
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MATCHMAKER CONSULTATION NOTES */}
      {activeTab === 'notes' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>
                Consultation Remarks & Meeting Records
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Historical log of 1-on-1 check-ins and preference updates.
              </p>
            </div>
            <button onClick={() => setShowNoteModal(true)} className="btn-primary">
              <Plus size={16} /> Add Note
            </button>
          </div>

          {notesLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading customer notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <FileText size={36} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>No notes logged yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Record discussion points from discovery calls, family interactions, or meeting feedback.
              </p>
              <button onClick={() => setShowNoteModal(true)} className="btn-secondary">
                Record First Note
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {notes.map((note) => (
                <div key={note.id} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                      }}>
                        {note.type || 'General'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Recorded by Matchmaker
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {formatTimeAgo(note.createdAt)} ({formatDate(note.createdAt)})
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: JOURNEY AUDIT TRAIL */}
      {activeTab === 'history' && (
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            Complete Journey Audit Trail
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Tamper-evident chronological log of status transitions, verifications, notes, and dispatched match introductions.
          </p>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading audit logs...
            </div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              No audit logs recorded for this customer yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', borderLeft: '2px solid rgba(255, 255, 255, 0.1)', paddingLeft: '1.25rem' }}>
              {activities.map((act) => (
                <div key={act.id} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-26px',
                    top: '4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    boxShadow: '0 0 8px var(--primary)',
                  }} />
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                    {act.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    {formatDate(act.createdAt)} • {formatTimeAgo(act.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showNoteModal && (
        <NoteModal
          customerId={customer.id}
          customerName={`${customer.firstName} ${customer.lastName}`}
          onClose={() => setShowNoteModal(false)}
          onNoteAdded={(newNote) => setNotes([newNote, ...notes])}
        />
      )}

      {showExplainModal && selectedCandidate && selectedMatch && (
        <MatchExplainModal
          customer={customer}
          candidate={selectedCandidate}
          match={selectedMatch}
          onClose={() => setShowExplainModal(false)}
          onOpenSendIntro={() => setShowIntroModal(true)}
        />
      )}

      {showIntroModal && selectedCandidate && selectedMatch && (
        <MockIntroModal
          customer={customer}
          candidate={selectedCandidate}
          match={selectedMatch}
          onClose={() => setShowIntroModal(false)}
          onSuccess={() => {
            loadMatches();
            loadCustomer();
          }}
        />
      )}
    </div>
  );
}
