// Shared constants used throughout the application
export const JOURNEY_STATUSES = [
  'New',
  'Profile Review',
  'Ready for Matching',
  'Matches Sent',
  'Meeting Scheduled',
  'In Progress',
  'On Hold',
  'Closed',
];

export const VERIFICATION_STATUSES = ['Verified', 'Pending', 'Unverified'];

export const MARITAL_STATUSES = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'];

export const GENDERS = ['Male', 'Female', 'Other'];

export const FAMILY_TYPES = ['Joint', 'Nuclear', 'Other'];

export const FAMILY_VALUES = ['Traditional', 'Moderate', 'Liberal', 'Other'];

export const TERNARY_OPTIONS = ['Yes', 'No', 'Maybe', 'Not specified'];

export const NOTE_TYPES = ['Call', 'Meeting', 'Follow-up', 'General'];

export const MATCH_STATUSES = [
  'Sent',
  'Awaiting Response',
  'Interested',
  'Meeting Scheduled',
  'Declined',
  'Completed',
];

export const MATCH_TIERS = {
  HIGH_POTENTIAL: { label: 'High Potential', min: 80, max: 100 },
  GOOD_POTENTIAL: { label: 'Good Potential', min: 65, max: 79 },
  EXPLORE: { label: 'Explore', min: 0, max: 64 },
};

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Self-employed',
  'Business Owner',
  'Freelance',
  'Government',
  'Not Working',
  'Other',
];

export function getTier(score) {
  if (score >= MATCH_TIERS.HIGH_POTENTIAL.min) return MATCH_TIERS.HIGH_POTENTIAL.label;
  if (score >= MATCH_TIERS.GOOD_POTENTIAL.min) return MATCH_TIERS.GOOD_POTENTIAL.label;
  return MATCH_TIERS.EXPLORE.label;
}
