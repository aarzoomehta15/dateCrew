/**
 * TDC Compatibility Engine — Weight Configuration
 * 
 * All category weights are defined here in one place.
 * Weights must sum to 100.
 */
export const SCORING_WEIGHTS = {
  mutualAgePreference: 15,
  mutualLocationPreference: 10,
  professionAndEducation: 15,
  childrenAndFamilyPlans: 20,
  relocationCompatibility: 10,
  sharedInterestsAndLanguages: 10,
  lifestyleAndFamilyValues: 10,
  genderSpecificPreferences: 5,
  profileCompletenessAndVerification: 5,
};

// Verify weights sum to 100
const weightSum = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0);
if (weightSum !== 100) {
  throw new Error(`Scoring weights must sum to 100, got ${weightSum}`);
}

/**
 * Default soft preference configuration for gender-specific scoring.
 * These are configurable per customer and are NOT absolute rules.
 */
export const DEFAULT_GENDER_PREFERENCES = {
  Male: {
    preferYoungerPartner: true,
    preferLowerIncomePartner: false, // not assumed by default
    preferShorterPartner: true,
    ageDirectionWeight: 2,
    incomeDirectionWeight: 1,
    heightDirectionWeight: 2,
  },
  Female: {
    // Female defaults focus on stated preferences rather than directional assumptions
    careerCompatibilityWeight: 2,
    sharedInterestsWeight: 1,
    familyValuesWeight: 1,
    languageCompatibilityWeight: 1,
  },
};

/**
 * Missing data handling policy:
 * - NEUTRAL: Score 0.5 (don't penalize, don't reward)
 * - This prevents unknown data from being treated as a mismatch or assumed positive
 */
export const MISSING_DATA_SCORE = 0.5;
