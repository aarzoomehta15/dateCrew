import {
  findMatches,
  calculateAge,
  checkDealbreakers,
  checkEligibility,
} from '../src/services/matching/matchingEngine.js';

describe('TDC Matching Engine', () => {
  const customerA = {
    id: 'cust-A',
    firstName: 'Aarav',
    gender: 'Male',
    dateOfBirth: '1995-01-01',
    city: 'Bangalore',
    maritalStatus: 'Never Married',
    motherTongue: 'Hindi',
    incomeINR: 5000000,
    heightCm: 180,
    dietaryPreference: 'Vegetarian',
    wantsKids: 'Yes',
    openToPets: 'Yes',
    openToRelocate: 'Maybe',
    interests: ['Running', 'Reading', 'Travel'],
    preferredAgeRange: { min: 25, max: 32 },
    preferredHeightRangeCm: { min: 160, max: 175 },
    preferredLocations: ['Bangalore', 'Mumbai'],
    dealbreakers: [
      { field: 'maritalStatus', condition: 'must_be', value: 'Never Married' },
      { field: 'wantsKids', condition: 'must_not_be', value: 'No' },
    ],
  };

  const eligibleCandidateB = {
    id: 'cust-B',
    firstName: 'Pooja',
    gender: 'Female',
    dateOfBirth: '1996-05-10',
    city: 'Bangalore',
    maritalStatus: 'Never Married',
    motherTongue: 'Hindi',
    incomeINR: 4000000,
    heightCm: 165,
    dietaryPreference: 'Vegetarian',
    wantsKids: 'Yes',
    openToPets: 'Yes',
    openToRelocate: 'Maybe',
    interests: ['Running', 'Yoga', 'Travel'],
    preferredAgeRange: { min: 28, max: 35 },
    preferredLocations: ['Bangalore'],
    dealbreakers: [],
  };

  const candidateDealbreakerViolation = {
    id: 'cust-C',
    firstName: 'Meera',
    gender: 'Female',
    dateOfBirth: '1994-03-01',
    city: 'Bangalore',
    maritalStatus: 'Divorced', // Violates customerA's dealbreaker
    wantsKids: 'No',           // Violates customerA's dealbreaker
    interests: ['Art'],
    dealbreakers: [],
  };

  describe('calculateAge', () => {
    test('calculates correct age from dateOfBirth', () => {
      const age = calculateAge('1995-01-01');
      expect(typeof age).toBe('number');
      expect(age).toBeGreaterThanOrEqual(29);
    });

    test('returns null for missing dateOfBirth', () => {
      expect(calculateAge(null)).toBeNull();
      expect(calculateAge('')).toBeNull();
    });
  });

  describe('checkDealbreakers', () => {
    test('passes candidate who meets all dealbreaker conditions', () => {
      const result = checkDealbreakers(customerA, eligibleCandidateB);
      expect(result.eligible).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    test('flags candidate who violates dealbreakers', () => {
      const result = checkDealbreakers(customerA, candidateDealbreakerViolation);
      expect(result.eligible).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('checkEligibility', () => {
    test('rejects candidate with same ID', () => {
      const result = checkEligibility(customerA, customerA);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Same person');
    });

    test('rejects candidate with same gender for standard opposite-gender workflow', () => {
      const sameGenderMale = { id: 'cust-D', gender: 'Male' };
      const result = checkEligibility(customerA, sameGenderMale);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Same gender');
    });

    test('rejects candidate if match was already sent', () => {
      const result = checkEligibility(customerA, eligibleCandidateB, ['cust-B']);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Already sent');
    });

    test('accepts eligible candidate', () => {
      const result = checkEligibility(customerA, eligibleCandidateB, []);
      expect(result.eligible).toBe(true);
    });
  });

  describe('findMatches', () => {
    test('ranks candidates deterministically with transparent explainable breakdown', () => {
      const allCandidates = [eligibleCandidateB, candidateDealbreakerViolation];
      const matches = findMatches(customerA, allCandidates, []);

      expect(matches).toBeDefined();
      expect(Array.isArray(matches)).toBe(true);
      // Violation candidate should be filtered out
      expect(matches.length).toBe(1);
      expect(matches[0].candidateId).toBe('cust-B');
      expect(matches[0].score).toBeGreaterThan(60);
      expect(matches[0].tier).toBeDefined();
      expect(matches[0].categoryBreakdown).toBeDefined();
      expect(Array.isArray(matches[0].positiveReasons)).toBe(true);
      expect(matches[0].positiveReasons.length).toBeGreaterThan(0);
    });
  });
});
