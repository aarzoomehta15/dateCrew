import { z } from 'zod';
import {
  JOURNEY_STATUSES,
  VERIFICATION_STATUSES,
  MARITAL_STATUSES,
  GENDERS,
  FAMILY_TYPES,
  FAMILY_VALUES,
  TERNARY_OPTIONS,
  NOTE_TYPES,
  MATCH_STATUSES,
} from '../utils/constants.js';

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const customerUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  gender: z.enum(GENDERS).optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  heightCm: z.number().min(100).max(250).optional().nullable(),
  maritalStatus: z.enum(MARITAL_STATUSES).optional(),
  motherTongue: z.string().optional(),
  languagesKnown: z.array(z.string()).optional(),
  undergraduateCollege: z.string().optional(),
  degree: z.string().optional(),
  highestEducation: z.string().optional(),
  currentCompany: z.string().optional(),
  designation: z.string().optional(),
  employmentType: z.string().optional(),
  incomeINR: z.number().min(0).optional().nullable(),
  workLocation: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  gotra: z.string().optional(),
  familyType: z.enum([...FAMILY_TYPES, '']).optional(),
  familyValues: z.enum([...FAMILY_VALUES, '']).optional(),
  familyBackground: z.string().optional(),
  siblings: z.object({
    count: z.number().min(0).optional(),
    details: z.string().optional(),
  }).optional(),
  familyLocation: z.string().optional(),
  wantsKids: z.enum(TERNARY_OPTIONS).optional(),
  openToRelocate: z.enum(TERNARY_OPTIONS).optional(),
  openToPets: z.enum(TERNARY_OPTIONS).optional(),
  dietaryPreference: z.string().optional(),
  interests: z.array(z.string()).optional(),
  relationshipExpectations: z.string().optional(),
  preferredAgeRange: z.object({
    min: z.number().min(18).max(100).optional().nullable(),
    max: z.number().min(18).max(100).optional().nullable(),
  }).optional(),
  preferredHeightRangeCm: z.object({
    min: z.number().min(100).max(250).optional().nullable(),
    max: z.number().min(100).max(250).optional().nullable(),
  }).optional(),
  preferredIncomeRangeINR: z.object({
    min: z.number().min(0).optional().nullable(),
    max: z.number().min(0).optional().nullable(),
  }).optional(),
  preferredLocations: z.array(z.string()).optional(),
  preferredProfessions: z.array(z.string()).optional(),
  preferredEducation: z.array(z.string()).optional(),
  preferredLanguages: z.array(z.string()).optional(),
  preferredFamilyValues: z.array(z.string()).optional(),
  preferredReligion: z.array(z.string()).optional(),
  preferredCaste: z.array(z.string()).optional(),
  preferredMaritalStatuses: z.array(z.enum(MARITAL_STATUSES)).optional(),
  preferredWantsKids: z.array(z.enum(TERNARY_OPTIONS)).optional(),
  preferredRelocation: z.array(z.enum(TERNARY_OPTIONS)).optional(),
  preferredPets: z.array(z.enum(TERNARY_OPTIONS)).optional(),
  dealbreakers: z.array(z.object({
    field: z.string(),
    condition: z.string(),
    value: z.any(),
  })).optional(),
  verification: z.object({
    status: z.enum(VERIFICATION_STATUSES).optional(),
    verifiedAt: z.string().nullable().optional(),
    method: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
}).strict(false);

export const statusUpdateSchema = z.object({
  status: z.enum(JOURNEY_STATUSES),
});

export const noteCreateSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  type: z.enum(NOTE_TYPES).default('General'),
});

export const noteUpdateSchema = z.object({
  content: z.string().min(1, 'Note content is required').optional(),
  type: z.enum(NOTE_TYPES).optional(),
});

export const matchSendSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  candidateId: z.string().min(1, 'Candidate ID is required'),
  score: z.number().min(0).max(100),
  scoreBreakdown: z.record(z.any()).optional(),
  explanations: z.array(z.string()).optional(),
  introductionMessage: z.string().min(1, 'Introduction message is required'),
});

export const matchStatusUpdateSchema = z.object({
  status: z.enum(MATCH_STATUSES),
});

export const matchRecalculateSchema = z.object({
  preferenceOverrides: z.record(z.any()).optional(),
  filters: z.object({
    minAge: z.number().optional(),
    maxAge: z.number().optional(),
    city: z.string().optional(),
    maritalStatus: z.enum(MARITAL_STATUSES).optional(),
    verifiedOnly: z.boolean().optional(),
    minScore: z.number().min(0).max(100).optional(),
  }).optional(),
}).optional();

export const aiExplanationSchema = z.object({
  customerId: z.string().min(1),
  candidateId: z.string().min(1),
  score: z.number().min(0).max(100),
  scoreBreakdown: z.record(z.any()),
  positiveReasons: z.array(z.string()),
  potentialConflicts: z.array(z.string()),
});

// AI response validation
export const aiResponseSchema = z.object({
  summary: z.string().min(1),
  reasons: z.array(z.string()).min(1),
  considerations: z.array(z.string()),
  introductionDraft: z.string().min(1),
  humanReviewRequired: z.boolean().default(true),
});
