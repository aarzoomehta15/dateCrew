import React from 'react';
import { getStatusBadgeClass, getVerificationBadgeClass } from '../utils/formatters';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function JourneyBadge({ status }) {
  return (
    <span className={`badge ${getStatusBadgeClass(status)}`}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'currentColor',
      }} />
      {status}
    </span>
  );
}

export function VerificationBadge({ status }) {
  const getIcon = () => {
    if (status === 'Verified') return <CheckCircle2 size={13} />;
    if (status === 'Pending') return <Clock size={13} />;
    return <AlertCircle size={13} />;
  };

  return (
    <span className={`badge ${getVerificationBadgeClass(status)}`}>
      {getIcon()}
      {status || 'Unverified'}
    </span>
  );
}
