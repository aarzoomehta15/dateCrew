import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import {
  Search,
  Filter,
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { JourneyBadge, VerificationBadge } from '../components/StatusBadge';
import { calculateAge, formatINR } from '../utils/formatters';

export default function CustomerList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Query state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [verification, setVerification] = useState(searchParams.get('verification') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    loadCustomers();
  }, [searchParams]);

  const loadCustomers = async () => {
    setLoading(true);
    setError('');

    const params = {
      page: searchParams.get('page') || 1,
      limit: 12,
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      verification: searchParams.get('verification') || '',
      gender: searchParams.get('gender') || '',
    };

    try {
      const res = await api.getCustomers(params);
      setCustomers(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (verification) params.verification = verification;
    if (gender) params.gender = gender;
    params.page = '1';
    setSearchParams(params);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = Object.fromEntries(searchParams.entries());
    params.page = String(newPage);
    setSearchParams(params);
    setPage(newPage);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setVerification('');
    setGender('');
    setSearchParams({});
    setPage(1);
  };

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
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Customer Directory & Roster
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage verified client biodatas, journey milestones, and compatibility eligibility.
          </p>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: '#fff' }}>{customers.length}</strong> of <strong style={{ color: '#fff' }}>{total}</strong> customers
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by name, city, company, degree..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="input-control"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Status Select */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
            className="input-control"
          >
            <option value="">All Journey Stages</option>
            {journeyStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Verification Select */}
          <select
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
            className="input-control"
          >
            <option value="">All Verifications</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Unverified">Unverified</option>
          </select>

          {/* Gender Select */}
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="input-control"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={applyFilters} className="btn-primary" style={{ padding: '0.65rem 1rem' }}>
              Filter
            </button>
            {(search || status || verification || gender) && (
              <button onClick={clearFilters} className="btn-secondary" style={{ padding: '0.65rem 0.85rem' }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading assigned customers...
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', borderRadius: 'var(--radius-md)', color: '#fda4af' }}>
          {error}
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Users size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No customers found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            No customer profiles match your current search or filter criteria.
          </p>
          <button onClick={clearFilters} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {customers.map((cust) => {
            const age = calculateAge(cust.dateOfBirth);
            return (
              <Link
                key={cust.id}
                to={`/customers/${cust.id}`}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                }}
              >
                {/* Card Top: Avatar, Name, Badges */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <img
                    src={cust.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={cust.firstName}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      border: '1.5px solid var(--border-card)',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                        {cust.firstName} {cust.lastName}
                      </span>
                      {age && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          • {age}y
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>{cust.city || 'Location unlisted'}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <JourneyBadge status={cust.journeyStatus} />
                  <VerificationBadge status={cust.verification?.status} />
                </div>

                {/* Key Attributes */}
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  display: 'grid',
                  gap: '0.4rem',
                  color: '#cbd5e1',
                  marginBottom: '1.25rem',
                  flex: 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Briefcase size={14} color="var(--text-dim)" />
                    <span style={{ fontWeight: 600 }}>{cust.designation || 'Professional'}</span>
                    <span style={{ color: 'var(--text-dim)' }}>at {cust.currentCompany || 'Private Corp'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <GraduationCap size={14} color="var(--text-dim)" />
                    <span>{cust.highestEducation || cust.degree || cust.undergraduateCollege || 'Graduate'}</span>
                  </div>

                  {cust.incomeINR && (
                    <div style={{ fontSize: '0.775rem', color: '#34d399', fontWeight: 600, marginTop: '0.1rem' }}>
                      Compensation: {formatINR(cust.incomeINR)}
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}>
                  <span>View Full Biodata</span>
                  <Sparkles size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.85rem' }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Page <strong style={{ color: '#fff' }}>{page}</strong> of <strong style={{ color: '#fff' }}>{totalPages}</strong>
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.85rem' }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
