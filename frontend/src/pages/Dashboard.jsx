import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { JourneyBadge, VerificationBadge } from '../components/StatusBadge';
import { formatTimeAgo } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading matchmaking workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', borderRadius: 'var(--radius-md)', color: '#fda4af' }}>
          {error}
        </div>
      </div>
    );
  }

  const { metrics, pipeline = {}, recentCustomers = [], recentActivity = [] } = data || {};

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}>
            <Sparkles size={12} /> Executive Matchmaker Console
          </div>
          <h1 style={{ fontSize: '2rem', letterSpacing: '-0.03em' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Matchmaker'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Here is your active matchmaking pipeline and verified profile queue today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/customers" className="btn-secondary">
            <Users size={16} /> Manage Customers
          </Link>
          <Link to="/matches" className="btn-primary">
            <Send size={16} /> View Introductions
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        {/* Total Customers */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Assigned Customers
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', lineHeight: 1 }}>
            {metrics?.totalCustomers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '0.5rem' }}>
            Directly under your care
          </div>
        </div>

        {/* Verified Profiles */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Verified Biodatas
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', lineHeight: 1 }}>
            {metrics?.verifiedProfiles || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '0.5rem' }}>
            {metrics?.totalCustomers ? Math.round(((metrics.verifiedProfiles || 0) / metrics.totalCustomers) * 100) : 0}% verification rate
          </div>
        </div>

        {/* Awaiting Matches */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Ready for Matching
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', lineHeight: 1 }}>
            {metrics?.awaitingMatches || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fcd34d', marginTop: '0.5rem' }}>
            Eligible for immediate discovery
          </div>
        </div>

        {/* Matches Sent */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Sent Introductions
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f472b6',
            }}>
              <Send size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', lineHeight: 1 }}>
            {metrics?.matchesSentThisMonth || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f472b6', marginTop: '0.5rem' }}>
            Dispatched mock proposals
          </div>
        </div>
      </div>

      {/* Interactive Pipeline Funnel */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Matchmaking Pipeline Funnel</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Customer volume across journey stages
            </p>
          </div>
          <Link to="/customers" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View Full Pipeline <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
        }}>
          {Object.entries(pipeline).map(([stage, count]) => (
            <Link
              to={`/customers?status=${encodeURIComponent(stage)}`}
              key={stage}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 0.75rem',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '0.25rem' }}>
                {count}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.2 }}>
                {stage}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Customers + Live Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', alignItems: 'flex-start' }}>
        {/* Recent Customers */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Recently Updated Customers</h3>
            <Link to="/customers" style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
              View all
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {recentCustomers.map((cust) => (
              <Link
                key={cust.id}
                to={`/customers/${cust.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#fff' }}>
                      {cust.firstName} {cust.lastName}
                    </span>
                    {cust.age && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        ({cust.age} yrs)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {cust.city}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <VerificationBadge status={cust.verification} />
                  <JourneyBadge status={cust.journeyStatus} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--primary)" /> Matchmaking Audit Trail
            </h3>
          </div>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {recentActivity.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  paddingBottom: '0.85rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  marginTop: '6px',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                    {act.description}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    {formatTimeAgo(act.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
