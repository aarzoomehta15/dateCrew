import { customerRepo, matchRecordRepo, activityRepo } from '../repositories/jsonRepository.js';
import { findMatches, calculateAge } from '../services/matching/matchingEngine.js';
import { generateExplanation } from '../services/ai/aiService.js';
import { sendMatchIntroduction } from '../services/email/emailService.js';
import { matchSendSchema, matchStatusUpdateSchema, matchRecalculateSchema } from '../validators/schemas.js';
import { createAppError } from '../middleware/errorHandler.js';

/**
 * Get ranked match candidates for a customer
 */
export async function getMatches(req, res, next) {
  try {
    const customer = await customerRepo.findById(req.params.id);
    if (!customer) throw createAppError('Customer not found', 404);
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    // Get all candidates (everyone in the system, not just assigned ones)
    const allCustomers = await customerRepo.findAll({});

    // Get already sent match IDs
    const sentMatches = await matchRecordRepo.findAll({ customerId: customer.id });
    const sentMatchIds = sentMatches.map(m => m.candidateId);
    const declinedIds = sentMatches
      .filter(m => m.status === 'Declined')
      .map(m => m.candidateId);

    // Parse filters from query
    const filters = {};
    if (req.query.minAge) filters.minAge = parseInt(req.query.minAge);
    if (req.query.maxAge) filters.maxAge = parseInt(req.query.maxAge);
    if (req.query.city) filters.city = req.query.city;
    if (req.query.maritalStatus) filters.maritalStatus = req.query.maritalStatus;
    if (req.query.verifiedOnly === 'true') filters.verifiedOnly = true;
    if (req.query.minScore) filters.minScore = parseInt(req.query.minScore);

    const matches = findMatches(customer, allCustomers, sentMatchIds, declinedIds, filters);

    return res.json({
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        gender: customer.gender,
        age: calculateAge(customer.dateOfBirth),
        city: customer.city,
        maritalStatus: customer.maritalStatus,
      },
      matches,
      totalCandidates: matches.length,
      alreadySent: sentMatchIds.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Recalculate matches with preference overrides
 */
export async function recalculateMatches(req, res, next) {
  try {
    const customer = await customerRepo.findById(req.params.id);
    if (!customer) throw createAppError('Customer not found', 404);
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    const body = matchRecalculateSchema.parse(req.body || {});
    const preferenceOverrides = body?.preferenceOverrides || {};
    const filters = body?.filters || {};

    const allCustomers = await customerRepo.findAll({});
    const sentMatches = await matchRecordRepo.findAll({ customerId: customer.id });
    const sentMatchIds = sentMatches.map(m => m.candidateId);
    const declinedIds = sentMatches
      .filter(m => m.status === 'Declined')
      .map(m => m.candidateId);

    const matches = findMatches(customer, allCustomers, sentMatchIds, declinedIds, filters, preferenceOverrides);

    return res.json({
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        gender: customer.gender,
        age: calculateAge(customer.dateOfBirth),
        city: customer.city,
      },
      matches,
      totalCandidates: matches.length,
      recalculated: true,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate AI explanation for a specific match
 */
export async function getMatchExplanation(req, res, next) {
  try {
    const { customerId, candidateId } = req.body || {};
    if (!customerId || !candidateId) {
      throw createAppError('customerId and candidateId are required', 400);
    }

    const customer = await customerRepo.findById(customerId);
    if (!customer) throw createAppError('Customer not found', 404);
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    const candidate = await customerRepo.findById(candidateId);
    if (!candidate) throw createAppError('Candidate not found', 404);

    // Get deterministic score
    const allCustomers = await customerRepo.findAll({});
    const sentMatches = await matchRecordRepo.findAll({ customerId: customer.id });
    const sentMatchIds = sentMatches.map(m => m.candidateId);
    const matches = findMatches(customer, allCustomers, sentMatchIds, []);
    const matchData = matches.find(m => m.candidateId === candidateId);

    if (!matchData) {
      throw createAppError('Candidate is not eligible for this customer', 400);
    }

    const explanation = await generateExplanation({
      customer: { ...customer, age: calculateAge(customer.dateOfBirth) },
      candidate: { ...candidate, age: calculateAge(candidate.dateOfBirth) },
      score: matchData.score,
      scoreBreakdown: matchData.categoryBreakdown,
      positiveReasons: matchData.positiveReasons,
      potentialConflicts: matchData.potentialConflicts,
    });

    return res.json({ explanation });
  } catch (err) {
    next(err);
  }
}

/**
 * Send a match introduction
 */
export async function sendMatch(req, res, next) {
  try {
    const data = matchSendSchema.parse(req.body);
    const { customerId, candidateId, score, scoreBreakdown, explanations, introductionMessage } = data;

    // Authorization checks
    const customer = await customerRepo.findById(customerId);
    if (!customer) throw createAppError('Customer not found', 404);
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    const candidate = await customerRepo.findById(candidateId);
    if (!candidate) throw createAppError('Candidate not found', 404);

    // Prevent duplicates
    const existing = await matchRecordRepo.findOne({ customerId, candidateId });
    if (existing) {
      throw createAppError('A match introduction has already been sent for this pair', 409);
    }

    // Create match record
    const matchRecord = await matchRecordRepo.create({
      customerId,
      candidateId,
      matchmakerId: req.user.id,
      score,
      scoreBreakdown: scoreBreakdown || {},
      explanations: explanations || [],
      introductionMessage,
      status: 'Sent',
      sentAt: new Date().toISOString(),
    });

    // Simulate email
    const emailResult = await sendMatchIntroduction({
      customer,
      candidate,
      introductionMessage,
      matchmaker: req.user,
    });

    // Record activity
    await activityRepo.create({
      customerId,
      actorId: req.user.id,
      action: 'match_sent',
      description: `Match introduction sent to ${customer.firstName} for candidate ${candidate.firstName} ${candidate.lastName}`,
      metadata: { matchRecordId: matchRecord.id, candidateId, score },
    });

    // Update customer status if appropriate
    if (customer.journeyStatus === 'Ready for Matching') {
      await customerRepo.update(customerId, { journeyStatus: 'Matches Sent' });
    }

    return res.status(201).json({
      matchRecord,
      email: emailResult,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List sent matches
 */
export async function listSentMatches(req, res, next) {
  try {
    const matchmakerId = req.user.id;
    const { status, search, page = 1, limit = 20 } = req.query;

    let records = await matchRecordRepo.findAll({ matchmakerId });

    // Filter by status
    if (status) {
      records = records.filter(r => r.status === status);
    }

    // Enrich with customer and candidate names
    const enriched = await Promise.all(records.map(async (r) => {
      const customer = await customerRepo.findById(r.customerId);
      const candidate = await customerRepo.findById(r.candidateId);
      return {
        ...r,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
        candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown',
        customerCity: customer?.city,
        candidateCity: candidate?.city,
      };
    }));

    // Search
    let filtered = enriched;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = enriched.filter(r =>
        r.customerName.toLowerCase().includes(searchLower) ||
        r.candidateName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by sentAt descending
    filtered.sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt));

    // Paginate
    const total = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const totalPages = Math.ceil(total / limitNum);
    const startIdx = (pageNum - 1) * limitNum;
    const data = filtered.slice(startIdx, startIdx + limitNum);

    return res.json({ data, total, page: pageNum, totalPages, limit: limitNum });
  } catch (err) {
    next(err);
  }
}

/**
 * Update sent match status
 */
export async function updateSentMatchStatus(req, res, next) {
  try {
    const record = await matchRecordRepo.findById(req.params.id);
    if (!record) throw createAppError('Match record not found', 404);
    if (record.matchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    const { status } = matchStatusUpdateSchema.parse(req.body);
    const previousStatus = record.status;
    const updated = await matchRecordRepo.update(req.params.id, { status });

    // Record activity
    await activityRepo.create({
      customerId: record.customerId,
      actorId: req.user.id,
      action: 'match_status_updated',
      description: `Match status changed from "${previousStatus}" to "${status}"`,
      metadata: { matchRecordId: req.params.id, previousStatus, newStatus: status },
    });

    return res.json({ matchRecord: updated });
  } catch (err) {
    next(err);
  }
}
