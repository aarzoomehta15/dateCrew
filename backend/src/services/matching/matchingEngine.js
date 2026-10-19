/**
 * TDC Compatibility Engine
 * 
 * Ranks eligible candidates by preference compatibility, mutual suitability,
 * lifestyle alignment, shared interests, and profile completeness.
 * 
 * Principles:
 * - Deterministic rules for eligibility and scoring
 * - Explicit customer preferences used wherever available
 * - Reciprocal preference compatibility (both sides scored)
 * - Mandatory dealbreakers separated from weighted preferences
 * - Every score contribution is explainable
 * - Missing data → neutral, never penalized
 * - Gender-specific preferences are configurable soft defaults
 * - AI is never used for authoritative scoring
 */

import { SCORING_WEIGHTS, DEFAULT_GENDER_PREFERENCES, MISSING_DATA_SCORE } from './weights.js';
import { getTier } from '../../utils/constants.js';

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Check if a candidate violates any of the customer's mandatory dealbreakers.
 * Returns { eligible: boolean, violations: string[] }
 */
export function checkDealbreakers(customer, candidate) {
  const violations = [];
  const dealbreakers = customer.dealbreakers || [];

  for (const db of dealbreakers) {
    const candidateValue = candidate[db.field];
    if (candidateValue === undefined || candidateValue === null) continue; // unknown ≠ violation

    switch (db.condition) {
      case 'must_be':
        if (Array.isArray(db.value)) {
          if (!db.value.includes(candidateValue)) {
            violations.push(`${db.field} must be one of: ${db.value.join(', ')} (is: ${candidateValue})`);
          }
        } else if (candidateValue !== db.value) {
          violations.push(`${db.field} must be ${db.value} (is: ${candidateValue})`);
        }
        break;
      case 'must_not_be':
        if (Array.isArray(db.value)) {
          if (db.value.includes(candidateValue)) {
            violations.push(`${db.field} must not be one of: ${db.value.join(', ')} (is: ${candidateValue})`);
          }
        } else if (candidateValue === db.value) {
          violations.push(`${db.field} must not be ${db.value}`);
        }
        break;
      case 'min':
        if (typeof candidateValue === 'number' && candidateValue < db.value) {
          violations.push(`${db.field} must be at least ${db.value} (is: ${candidateValue})`);
        }
        break;
      case 'max':
        if (typeof candidateValue === 'number' && candidateValue > db.value) {
          violations.push(`${db.field} must be at most ${db.value} (is: ${candidateValue})`);
        }
        break;
    }
  }

  return { eligible: violations.length === 0, violations };
}

/**
 * Check basic eligibility rules. Returns { eligible: boolean, reason?: string }
 */
export function checkEligibility(customer, candidate, sentMatchIds = [], declinedIds = []) {
  // Cannot match with self
  if (customer.id === candidate.id) {
    return { eligible: false, reason: 'Same person' };
  }

  // Opposite gender for standard workflow
  if (customer.gender === candidate.gender) {
    return { eligible: false, reason: 'Same gender' };
  }

  // Already sent
  if (sentMatchIds.includes(candidate.id)) {
    return { eligible: false, reason: 'Already sent' };
  }

  // Declined or blocked
  if (declinedIds.includes(candidate.id)) {
    return { eligible: false, reason: 'Previously declined' };
  }

  // Check dealbreakers from customer side
  const customerDealbreakers = checkDealbreakers(customer, candidate);
  if (!customerDealbreakers.eligible) {
    return { eligible: false, reason: `Dealbreaker: ${customerDealbreakers.violations[0]}` };
  }

  // Check dealbreakers from candidate side (reciprocal)
  const candidateDealbreakers = checkDealbreakers(candidate, customer);
  if (!candidateDealbreakers.eligible) {
    return { eligible: false, reason: `Candidate dealbreaker: ${candidateDealbreakers.violations[0]}` };
  }

  // Check hard age constraints
  const customerAge = calculateAge(customer.dateOfBirth);
  const candidateAge = calculateAge(candidate.dateOfBirth);

  if (customerAge && candidateAge) {
    const custPref = customer.preferredAgeRange;
    if (custPref) {
      // Only enforce as hard constraint when dealbreakers include age
      const hasAgeDealbreakerCust = (customer.dealbreakers || []).some(d => d.field === 'age');
      if (hasAgeDealbreakerCust) {
        if (custPref.min && candidateAge < custPref.min) {
          return { eligible: false, reason: `Candidate age ${candidateAge} below minimum ${custPref.min}` };
        }
        if (custPref.max && candidateAge > custPref.max) {
          return { eligible: false, reason: `Candidate age ${candidateAge} above maximum ${custPref.max}` };
        }
      }
    }
  }

  return { eligible: true };
}

/**
 * Score age compatibility (0-1 scale)
 * Uses reciprocal age-range satisfaction
 */
function scoreAge(customer, candidate) {
  const custAge = calculateAge(customer.dateOfBirth);
  const candAge = calculateAge(candidate.dateOfBirth);
  const reasons = [];
  const conflicts = [];

  if (!custAge || !candAge) {
    return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
  }

  let customerSatisfaction = 1;
  let candidateSatisfaction = 1;

  // Customer's age preference for candidate
  const custPref = customer.preferredAgeRange;
  if (custPref && (custPref.min || custPref.max)) {
    const min = custPref.min || 18;
    const max = custPref.max || 100;
    if (candAge >= min && candAge <= max) {
      customerSatisfaction = 1;
      reasons.push(`Candidate age ${candAge} is within preferred range ${min}-${max}`);
    } else {
      const distance = candAge < min ? min - candAge : candAge - max;
      customerSatisfaction = Math.max(0, 1 - distance / 10);
      conflicts.push(`Candidate age ${candAge} is outside preferred range ${min}-${max}`);
    }
  }

  // Candidate's age preference for customer (reciprocal)
  const candPref = candidate.preferredAgeRange;
  if (candPref && (candPref.min || candPref.max)) {
    const min = candPref.min || 18;
    const max = candPref.max || 100;
    if (custAge >= min && custAge <= max) {
      candidateSatisfaction = 1;
    } else {
      const distance = custAge < min ? min - custAge : custAge - max;
      candidateSatisfaction = Math.max(0, 1 - distance / 10);
      conflicts.push(`Customer age ${custAge} is outside candidate's preferred range ${min}-${max}`);
    }
  }

  const score = (customerSatisfaction + candidateSatisfaction) / 2;
  return { score, available: true, reasons, conflicts };
}

/**
 * Score location compatibility (0-1 scale)
 */
function scoreLocation(customer, candidate) {
  const reasons = [];
  const conflicts = [];

  if (!customer.city || !candidate.city) {
    return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
  }

  let score = 0;
  const custCity = customer.city.toLowerCase().trim();
  const candCity = candidate.city.toLowerCase().trim();

  // Exact city match
  if (custCity === candCity) {
    score = 1;
    reasons.push(`Both in ${candidate.city}`);
  } else {
    // Check preferred locations
    const custPreferredLocations = (customer.preferredLocations || []).map(l => l.toLowerCase().trim());
    const candPreferredLocations = (candidate.preferredLocations || []).map(l => l.toLowerCase().trim());

    let custLocScore = 0;
    let candLocScore = 0;

    if (custPreferredLocations.length > 0) {
      if (custPreferredLocations.includes(candCity)) {
        custLocScore = 0.8;
        reasons.push(`Candidate's city ${candidate.city} is in customer's preferred locations`);
      }
    } else {
      custLocScore = 0.3; // neutral when no preference
    }

    if (candPreferredLocations.length > 0) {
      if (candPreferredLocations.includes(custCity)) {
        candLocScore = 0.8;
      }
    } else {
      candLocScore = 0.3;
    }

    score = (custLocScore + candLocScore) / 2;
    if (score < 0.3) {
      conflicts.push(`Different cities: ${customer.city} and ${candidate.city}`);
    }
  }

  return { score, available: true, reasons, conflicts };
}

/**
 * Score profession and education compatibility (0-1 scale)
 */
function scoreProfessionEducation(customer, candidate) {
  const reasons = [];
  const conflicts = [];
  let totalFactors = 0;
  let totalScore = 0;

  // Education match
  const custPrefEdu = (customer.preferredEducation || []).map(e => e.toLowerCase().trim());
  if (custPrefEdu.length > 0 && candidate.highestEducation) {
    totalFactors++;
    if (custPrefEdu.includes(candidate.highestEducation.toLowerCase().trim())) {
      totalScore += 1;
      reasons.push(`${candidate.highestEducation} matches education preference`);
    } else {
      totalScore += 0.3;
    }
  }

  // Profession match
  const custPrefProf = (customer.preferredProfessions || []).map(p => p.toLowerCase().trim());
  if (custPrefProf.length > 0 && candidate.designation) {
    totalFactors++;
    const candDesig = candidate.designation.toLowerCase().trim();
    if (custPrefProf.some(p => candDesig.includes(p) || p.includes(candDesig))) {
      totalScore += 1;
      reasons.push(`${candidate.designation} aligns with profession preference`);
    } else {
      totalScore += 0.3;
    }
  }

  // Reciprocal check
  const candPrefEdu = (candidate.preferredEducation || []).map(e => e.toLowerCase().trim());
  if (candPrefEdu.length > 0 && customer.highestEducation) {
    totalFactors++;
    if (candPrefEdu.includes(customer.highestEducation.toLowerCase().trim())) {
      totalScore += 1;
    } else {
      totalScore += 0.3;
    }
  }

  if (totalFactors === 0) {
    // Both have education — give partial credit for having similar levels
    if (customer.highestEducation && candidate.highestEducation) {
      return { score: 0.5, available: true, reasons: ['Both have higher education'], conflicts };
    }
    return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
  }

  return { score: totalScore / totalFactors, available: true, reasons, conflicts };
}

/**
 * Score children and family plans compatibility (0-1 scale)
 */
function scoreChildrenFamily(customer, candidate) {
  const reasons = [];
  const conflicts = [];
  let totalFactors = 0;
  let totalScore = 0;

  // Children preference
  if (customer.wantsKids && customer.wantsKids !== 'Not specified' &&
      candidate.wantsKids && candidate.wantsKids !== 'Not specified') {
    totalFactors += 2;
    
    // Direct compatibility
    if (customer.wantsKids === candidate.wantsKids) {
      totalScore += 2;
      reasons.push(`Both ${customer.wantsKids === 'Yes' ? 'want' : customer.wantsKids === 'No' ? "don't want" : 'are open to'} children`);
    } else if (customer.wantsKids === 'Maybe' || candidate.wantsKids === 'Maybe') {
      totalScore += 1.2;
      reasons.push(`Flexible on children preferences`);
    } else {
      totalScore += 0;
      conflicts.push(`Children preference conflict: ${customer.wantsKids} vs ${candidate.wantsKids}`);
    }
  }

  // Customer's preferred wantsKids
  if ((customer.preferredWantsKids || []).length > 0 && candidate.wantsKids) {
    totalFactors++;
    if (customer.preferredWantsKids.includes(candidate.wantsKids)) {
      totalScore += 1;
    } else if (candidate.wantsKids === 'Maybe') {
      totalScore += 0.5;
    } else {
      conflicts.push(`Candidate's children preference (${candidate.wantsKids}) not in customer's accepted list`);
    }
  }

  // Family values alignment
  if (customer.familyValues && candidate.familyValues &&
      customer.familyValues !== 'Other' && candidate.familyValues !== 'Other') {
    totalFactors++;
    if (customer.familyValues === candidate.familyValues) {
      totalScore += 1;
      reasons.push(`Shared ${customer.familyValues.toLowerCase()} family values`);
    } else if (
      (customer.familyValues === 'Moderate' || candidate.familyValues === 'Moderate')
    ) {
      totalScore += 0.6;
    } else {
      totalScore += 0.2;
      conflicts.push(`Different family values: ${customer.familyValues} vs ${candidate.familyValues}`);
    }
  }

  // Pet preferences
  if (customer.openToPets && customer.openToPets !== 'Not specified' &&
      candidate.openToPets && candidate.openToPets !== 'Not specified') {
    totalFactors++;
    if (customer.openToPets === candidate.openToPets) {
      totalScore += 1;
    } else if (customer.openToPets === 'Maybe' || candidate.openToPets === 'Maybe') {
      totalScore += 0.6;
    } else {
      totalScore += 0.2;
    }
  }

  if (totalFactors === 0) {
    return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
  }

  return { score: totalScore / totalFactors, available: true, reasons, conflicts };
}

/**
 * Score relocation compatibility (0-1 scale)
 */
function scoreRelocation(customer, candidate) {
  const reasons = [];
  const conflicts = [];

  const custReloc = customer.openToRelocate;
  const candReloc = candidate.openToRelocate;

  if (!custReloc || custReloc === 'Not specified' || !candReloc || candReloc === 'Not specified') {
    // Also check preferred locations overlap even without relocation preference
    const custLocs = (customer.preferredLocations || []).map(l => l.toLowerCase());
    const candLocs = (candidate.preferredLocations || []).map(l => l.toLowerCase());
    if (custLocs.length > 0 && candLocs.length > 0) {
      const overlap = custLocs.filter(l => candLocs.includes(l));
      if (overlap.length > 0) {
        reasons.push(`Shared preferred locations: ${overlap.join(', ')}`);
        return { score: 0.7, available: true, reasons, conflicts };
      }
    }
    return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
  }

  // Same city — relocation less important
  if (customer.city && candidate.city && customer.city.toLowerCase() === candidate.city.toLowerCase()) {
    reasons.push('Same city, relocation not needed');
    return { score: 0.9, available: true, reasons, conflicts };
  }

  // Both open
  if (custReloc === 'Yes' && candReloc === 'Yes') {
    reasons.push('Both open to relocation');
    return { score: 1, available: true, reasons, conflicts };
  }

  // One or both maybe
  if (custReloc === 'Maybe' || candReloc === 'Maybe') {
    return { score: 0.6, available: true, reasons: ['Flexible on relocation'], conflicts };
  }

  // Both no and different cities
  if (custReloc === 'No' && candReloc === 'No') {
    conflicts.push('Neither open to relocation and in different cities');
    return { score: 0.1, available: true, reasons, conflicts };
  }

  // One yes, one no
  return { score: 0.4, available: true, reasons, conflicts };
}

/**
 * Score shared interests and languages (0-1 scale)
 * Uses Jaccard similarity for interests
 */
function scoreInterestsLanguages(customer, candidate) {
  const reasons = [];
  const conflicts = [];
  let totalFactors = 0;
  let totalScore = 0;

  // Interests — Jaccard similarity
  const custInterests = (customer.interests || []).map(i => i.toLowerCase().trim());
  const candInterests = (candidate.interests || []).map(i => i.toLowerCase().trim());
  
  if (custInterests.length > 0 && candInterests.length > 0) {
    totalFactors++;
    const intersection = custInterests.filter(i => candInterests.includes(i));
    const union = [...new Set([...custInterests, ...candInterests])];
    const jaccard = union.length > 0 ? intersection.length / union.length : 0;
    totalScore += jaccard;
    if (intersection.length > 0) {
      reasons.push(`Shared interests: ${intersection.slice(0, 3).join(', ')}${intersection.length > 3 ? ` (+${intersection.length - 3} more)` : ''}`);
    }
  }

  // Languages — overlap with preferred languages
  const custLangs = (customer.languagesKnown || []).map(l => l.toLowerCase().trim());
  const candLangs = (candidate.languagesKnown || []).map(l => l.toLowerCase().trim());
  const custPrefLangs = (customer.preferredLanguages || []).map(l => l.toLowerCase().trim());
  const candPrefLangs = (candidate.preferredLanguages || []).map(l => l.toLowerCase().trim());

  if (custLangs.length > 0 && candLangs.length > 0) {
    totalFactors++;
    const langOverlap = custLangs.filter(l => candLangs.includes(l));
    let langScore = langOverlap.length > 0 ? Math.min(1, langOverlap.length / 2) : 0;

    // Boost if languages match preferences
    if (custPrefLangs.length > 0) {
      const prefMatch = candLangs.filter(l => custPrefLangs.includes(l));
      if (prefMatch.length > 0) langScore = Math.min(1, langScore + 0.3);
    }
    if (candPrefLangs.length > 0) {
      const prefMatch = custLangs.filter(l => candPrefLangs.includes(l));
      if (prefMatch.length > 0) langScore = Math.min(1, langScore + 0.3);
    }

    totalScore += langScore;
    if (langOverlap.length > 0) {
      reasons.push(`Common languages: ${langOverlap.join(', ')}`);
    }
  }

  // Mother tongue match
  if (customer.motherTongue && candidate.motherTongue) {
    totalFactors++;
    if (customer.motherTongue.toLowerCase() === candidate.motherTongue.toLowerCase()) {
      totalScore += 1;
      reasons.push(`Same mother tongue: ${customer.motherTongue}`);
    } else {
      totalScore += 0.3;
    }
  }

  if (totalFactors === 0) {
    return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
  }

  return { score: totalScore / totalFactors, available: true, reasons, conflicts };
}

/**
 * Score lifestyle and family values (0-1 scale)
 */
function scoreLifestyleFamilyValues(customer, candidate) {
  const reasons = [];
  const conflicts = [];
  let totalFactors = 0;
  let totalScore = 0;

  // Family values preference
  const custPrefFV = (customer.preferredFamilyValues || []).map(v => v.toLowerCase());
  if (custPrefFV.length > 0 && candidate.familyValues) {
    totalFactors++;
    if (custPrefFV.includes(candidate.familyValues.toLowerCase())) {
      totalScore += 1;
      reasons.push(`Candidate's ${candidate.familyValues} family values match preference`);
    } else {
      totalScore += 0.3;
      conflicts.push(`Candidate's family values (${candidate.familyValues}) not in preferred list`);
    }
  }

  // Religion preference (only when explicitly stated)
  const custPrefRel = (customer.preferredReligion || []).map(r => r.toLowerCase());
  if (custPrefRel.length > 0 && candidate.religion) {
    totalFactors++;
    if (custPrefRel.includes(candidate.religion.toLowerCase())) {
      totalScore += 1;
      reasons.push(`Religion preference match`);
    } else {
      totalScore += 0.2;
      conflicts.push(`Different religion preference`);
    }
  }

  // Caste preference (only when explicitly stated)
  const custPrefCaste = (customer.preferredCaste || []).map(c => c.toLowerCase());
  if (custPrefCaste.length > 0 && candidate.caste) {
    totalFactors++;
    if (custPrefCaste.includes(candidate.caste.toLowerCase())) {
      totalScore += 1;
    } else {
      totalScore += 0.3;
    }
  }

  // Dietary preference
  if (customer.dietaryPreference && candidate.dietaryPreference) {
    totalFactors++;
    if (customer.dietaryPreference.toLowerCase() === candidate.dietaryPreference.toLowerCase()) {
      totalScore += 1;
      reasons.push(`Same dietary preference: ${customer.dietaryPreference}`);
    } else {
      totalScore += 0.5;
    }
  }

  // Marital status preference
  const custPrefMarital = customer.preferredMaritalStatuses || [];
  if (custPrefMarital.length > 0 && candidate.maritalStatus) {
    totalFactors++;
    if (custPrefMarital.includes(candidate.maritalStatus)) {
      totalScore += 1;
      reasons.push(`Candidate's marital status (${candidate.maritalStatus}) is acceptable`);
    } else {
      totalScore += 0.2;
      conflicts.push(`Candidate's marital status (${candidate.maritalStatus}) not in preference`);
    }
  }

  if (totalFactors === 0) {
    return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
  }

  return { score: totalScore / totalFactors, available: true, reasons, conflicts };
}

/**
 * Score gender-specific configurable preferences (0-1 scale)
 * Total weight = 5 points in the overall scoring
 */
function scoreGenderSpecific(customer, candidate, overrides = {}) {
  const reasons = [];
  const conflicts = [];
  const custAge = calculateAge(customer.dateOfBirth);
  const candAge = calculateAge(candidate.dateOfBirth);

  const genderConfig = {
    ...DEFAULT_GENDER_PREFERENCES[customer.gender] || {},
    ...overrides,
  };

  if (customer.gender === 'Male') {
    let totalFactors = 0;
    let totalScore = 0;

    // Age direction: prefer younger partner (soft)
    if (genderConfig.preferYoungerPartner && custAge && candAge) {
      totalFactors += genderConfig.ageDirectionWeight || 2;
      if (candAge <= custAge) {
        totalScore += (genderConfig.ageDirectionWeight || 2);
        if (custAge - candAge <= 5) {
          reasons.push(`Age difference is suitable (${custAge - candAge} years)`);
        }
      } else {
        // Small penalty for older — graduated
        const diff = candAge - custAge;
        const penalty = Math.max(0, 1 - diff / 5);
        totalScore += (genderConfig.ageDirectionWeight || 2) * penalty;
      }
    }

    // Income direction (only when explicitly enabled)
    if (genderConfig.preferLowerIncomePartner && customer.incomeINR && candidate.incomeINR) {
      totalFactors += genderConfig.incomeDirectionWeight || 1;
      if (candidate.incomeINR <= customer.incomeINR) {
        totalScore += (genderConfig.incomeDirectionWeight || 1);
      } else {
        totalScore += (genderConfig.incomeDirectionWeight || 1) * 0.7;
      }
    }

    // Height direction (soft)
    if (genderConfig.preferShorterPartner && customer.heightCm && candidate.heightCm) {
      totalFactors += genderConfig.heightDirectionWeight || 2;
      if (candidate.heightCm <= customer.heightCm) {
        totalScore += (genderConfig.heightDirectionWeight || 2);
      } else {
        const diff = candidate.heightCm - customer.heightCm;
        const penalty = Math.max(0, 1 - diff / 10);
        totalScore += (genderConfig.heightDirectionWeight || 2) * penalty;
      }
    }

    if (totalFactors === 0) {
      return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
    }
    return { score: totalScore / totalFactors, available: true, reasons, conflicts };

  } else if (customer.gender === 'Female') {
    let totalFactors = 0;
    let totalScore = 0;

    // Career compatibility
    if (candidate.designation && candidate.employmentType) {
      totalFactors += genderConfig.careerCompatibilityWeight || 2;
      if (candidate.employmentType !== 'Not Working') {
        totalScore += (genderConfig.careerCompatibilityWeight || 2) * 0.8;
        reasons.push(`Candidate is employed (${candidate.designation})`);
      } else {
        totalScore += (genderConfig.careerCompatibilityWeight || 2) * 0.3;
      }
    }

    // Shared interests boost
    const custInterests = (customer.interests || []).map(i => i.toLowerCase());
    const candInterests = (candidate.interests || []).map(i => i.toLowerCase());
    if (custInterests.length > 0 && candInterests.length > 0) {
      totalFactors += genderConfig.sharedInterestsWeight || 1;
      const overlap = custInterests.filter(i => candInterests.includes(i));
      const ratio = overlap.length / Math.max(custInterests.length, 1);
      totalScore += (genderConfig.sharedInterestsWeight || 1) * Math.min(1, ratio * 1.5);
    }

    // Language compatibility
    const custLangs = (customer.languagesKnown || []).map(l => l.toLowerCase());
    const candLangs = (candidate.languagesKnown || []).map(l => l.toLowerCase());
    if (custLangs.length > 0 && candLangs.length > 0) {
      totalFactors += genderConfig.languageCompatibilityWeight || 1;
      const overlap = custLangs.filter(l => candLangs.includes(l));
      if (overlap.length > 0) {
        totalScore += (genderConfig.languageCompatibilityWeight || 1);
      } else {
        totalScore += (genderConfig.languageCompatibilityWeight || 1) * 0.2;
      }
    }

    if (totalFactors === 0) {
      return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
    }
    return { score: totalScore / totalFactors, available: true, reasons, conflicts };
  }

  // Other gender — use neutral scoring
  return { score: MISSING_DATA_SCORE, available: false, reasons, conflicts };
}

/**
 * Score profile completeness and verification (0-1 scale)
 */
function scoreProfileCompleteness(candidate) {
  const reasons = [];
  const importantFields = [
    'firstName', 'lastName', 'gender', 'dateOfBirth', 'city', 'country',
    'heightCm', 'maritalStatus', 'motherTongue', 'languagesKnown',
    'highestEducation', 'designation', 'incomeINR',
    'familyValues', 'wantsKids', 'interests',
  ];

  let filled = 0;
  for (const field of importantFields) {
    const val = candidate[field];
    if (val !== undefined && val !== null && val !== '' && 
        !(Array.isArray(val) && val.length === 0)) {
      filled++;
    }
  }

  const completeness = filled / importantFields.length;
  let score = completeness;

  // Verification bonus (small signal)
  if (candidate.verification?.status === 'Verified') {
    score = Math.min(1, score + 0.15);
    reasons.push('Verified profile');
  }

  return { score, available: true, reasons, conflicts: [], completeness };
}

/**
 * Calculate data coverage — percentage of applicable scoring dimensions available
 */
function calculateDataCoverage(categoryResults) {
  const total = Object.keys(categoryResults).length;
  const available = Object.values(categoryResults).filter(r => r.available).length;
  return total > 0 ? Math.round((available / total) * 100) : 0;
}

/**
 * Main scoring function — calculates compatibility between customer and candidate
 * Returns detailed breakdown with score, reasons, conflicts, and data coverage
 */
export function calculateCompatibility(customer, candidate, preferenceOverrides = {}) {
  const categoryResults = {
    mutualAgePreference: scoreAge(customer, candidate),
    mutualLocationPreference: scoreLocation(customer, candidate),
    professionAndEducation: scoreProfessionEducation(customer, candidate),
    childrenAndFamilyPlans: scoreChildrenFamily(customer, candidate),
    relocationCompatibility: scoreRelocation(customer, candidate),
    sharedInterestsAndLanguages: scoreInterestsLanguages(customer, candidate),
    lifestyleAndFamilyValues: scoreLifestyleFamilyValues(customer, candidate),
    genderSpecificPreferences: scoreGenderSpecific(customer, candidate, preferenceOverrides),
    profileCompletenessAndVerification: scoreProfileCompleteness(candidate),
  };

  // Calculate weighted score with proportional normalization for available categories
  let totalWeight = 0;
  let totalAvailableWeight = 0;
  let weightedScore = 0;
  const categoryBreakdown = {};

  for (const [category, result] of Object.entries(categoryResults)) {
    const weight = SCORING_WEIGHTS[category] || 0;
    totalWeight += weight;

    if (result.available) {
      totalAvailableWeight += weight;
      weightedScore += result.score * weight;
    }

    categoryBreakdown[category] = {
      score: Math.round(result.score * 100) / 100,
      weight,
      available: result.available,
      reasons: result.reasons || [],
      conflicts: result.conflicts || [],
    };
  }

  // Normalize score: distribute missing-category weights proportionally
  let finalScore;
  if (totalAvailableWeight > 0) {
    finalScore = (weightedScore / totalAvailableWeight) * 100;
  } else {
    finalScore = 50; // no data at all
  }

  // Clamp 0-100
  finalScore = Math.round(Math.max(0, Math.min(100, finalScore)));

  const dataCoverage = calculateDataCoverage(categoryResults);

  // Collect all reasons and conflicts
  const positiveReasons = [];
  const potentialConflicts = [];
  for (const result of Object.values(categoryResults)) {
    positiveReasons.push(...(result.reasons || []));
    potentialConflicts.push(...(result.conflicts || []));
  }

  // Mutual compatibility
  const mutualCompatibility = {
    customerFitForCandidate: calculateOneSidedFit(candidate, customer),
    candidateFitForCustomer: calculateOneSidedFit(customer, candidate),
  };

  return {
    score: finalScore,
    tier: getTier(finalScore),
    categoryBreakdown,
    positiveReasons,
    potentialConflicts,
    mutualCompatibility,
    dataCoverage,
    verificationStatus: candidate.verification?.status || 'Unverified',
  };
}

/**
 * Calculate one-sided fit: how well candidate meets customer's explicit preferences
 */
function calculateOneSidedFit(customer, candidate) {
  let factors = 0;
  let satisfied = 0;

  const candAge = calculateAge(candidate.dateOfBirth);
  const pref = customer.preferredAgeRange;
  if (pref && (pref.min || pref.max) && candAge) {
    factors++;
    const min = pref.min || 18;
    const max = pref.max || 100;
    if (candAge >= min && candAge <= max) satisfied++;
  }

  const prefLocs = (customer.preferredLocations || []).map(l => l.toLowerCase());
  if (prefLocs.length > 0 && candidate.city) {
    factors++;
    if (prefLocs.includes(candidate.city.toLowerCase())) satisfied++;
  }

  const prefEdu = (customer.preferredEducation || []).map(e => e.toLowerCase());
  if (prefEdu.length > 0 && candidate.highestEducation) {
    factors++;
    if (prefEdu.includes(candidate.highestEducation.toLowerCase())) satisfied++;
  }

  const prefMarital = customer.preferredMaritalStatuses || [];
  if (prefMarital.length > 0 && candidate.maritalStatus) {
    factors++;
    if (prefMarital.includes(candidate.maritalStatus)) satisfied++;
  }

  if (factors === 0) return { score: 50, factors: 0 };
  return {
    score: Math.round((satisfied / factors) * 100),
    factors,
    satisfied,
  };
}

/**
 * Main matching service — find and rank all eligible candidates for a customer
 */
export function findMatches(customer, allCandidates, sentMatchIds = [], declinedIds = [], filters = {}, preferenceOverrides = {}) {
  const results = [];

  for (const candidate of allCandidates) {
    const eligibility = checkEligibility(customer, candidate, sentMatchIds, declinedIds);
    if (!eligibility.eligible) continue;

    const compatibility = calculateCompatibility(customer, candidate, preferenceOverrides);

    // Apply optional filters
    if (filters.minScore && compatibility.score < filters.minScore) continue;
    if (filters.verifiedOnly && candidate.verification?.status !== 'Verified') continue;
    if (filters.city && candidate.city?.toLowerCase() !== filters.city.toLowerCase()) continue;
    if (filters.maritalStatus && candidate.maritalStatus !== filters.maritalStatus) continue;

    const candAge = calculateAge(candidate.dateOfBirth);
    if (filters.minAge && candAge && candAge < filters.minAge) continue;
    if (filters.maxAge && candAge && candAge > filters.maxAge) continue;

    results.push({
      candidateId: candidate.id,
      candidate: {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        gender: candidate.gender,
        age: candAge,
        city: candidate.city,
        country: candidate.country,
        heightCm: candidate.heightCm,
        maritalStatus: candidate.maritalStatus,
        highestEducation: candidate.highestEducation,
        designation: candidate.designation,
        currentCompany: candidate.currentCompany,
        incomeINR: candidate.incomeINR,
        motherTongue: candidate.motherTongue,
        languagesKnown: candidate.languagesKnown,
        interests: candidate.interests,
        wantsKids: candidate.wantsKids,
        openToRelocate: candidate.openToRelocate,
        familyValues: candidate.familyValues,
        religion: candidate.religion,
        verification: candidate.verification,
      },
      ...compatibility,
    });
  }

  // Sort by score descending, deterministic tie-break by candidateId
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.candidateId.localeCompare(b.candidateId);
  });

  return results;
}
