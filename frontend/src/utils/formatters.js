export function formatINR(amount) {
  if (!amount && amount !== 0) return 'Not disclosed';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr/yr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'Just now';
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  if (diffInSec < 604800) return `${Math.floor(diffInSec / 86400)}d ago`;
  return formatDate(dateString);
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'New': return 'badge-new';
    case 'Profile Review': return 'badge-review';
    case 'Ready for Matching': return 'badge-ready';
    case 'Matches Sent': return 'badge-matches-sent';
    case 'Meeting Scheduled': return 'badge-meeting';
    case 'In Progress': return 'badge-progress';
    case 'On Hold': return 'badge-on-hold';
    case 'Closed': return 'badge-closed';
    default: return 'badge-new';
  }
}

export function getVerificationBadgeClass(status) {
  switch (status) {
    case 'Verified': return 'badge-verified';
    case 'Pending': return 'badge-pending';
    default: return 'badge-unverified';
  }
}

export function getTierClass(tier) {
  if (tier === 'High Potential') return 'tier-high';
  if (tier === 'Good Potential') return 'tier-good';
  return 'tier-explore';
}
