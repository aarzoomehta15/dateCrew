import { customerRepo, activityRepo } from '../repositories/jsonRepository.js';
import { customerUpdateSchema, statusUpdateSchema } from '../validators/schemas.js';
import { createAppError } from '../middleware/errorHandler.js';

/**
 * List customers assigned to the logged-in matchmaker with search, filter, sort, pagination
 */
export async function listCustomers(req, res, next) {
  try {
    const matchmakerId = req.user.id;
    const {
      search, status, verification, gender, maritalStatus,
      sortField = 'updatedAt', sortOrder = 'desc',
      page = 1, limit = 20,
    } = req.query;

    // Build filter
    const filter = { assignedMatchmakerId: matchmakerId };
    if (status) filter.journeyStatus = status;
    if (gender) filter.gender = gender;
    if (maritalStatus) filter.maritalStatus = maritalStatus;

    // Get all matching customers
    let customers = await customerRepo.findAll(filter);

    // Verification filter
    if (verification) {
      customers = customers.filter(c => (c.verification?.status || 'Unverified') === verification);
    }

    // Search across fields
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(c =>
        (c.firstName && c.firstName.toLowerCase().includes(searchLower)) ||
        (c.lastName && c.lastName.toLowerCase().includes(searchLower)) ||
        (c.email && c.email.toLowerCase().includes(searchLower)) ||
        (c.city && c.city.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    customers.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return -1 * sortDir;
      if (aVal > bVal) return 1 * sortDir;
      return (a.id || '').localeCompare(b.id || '');
    });

    // Pagination
    const total = customers.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const totalPages = Math.ceil(total / limitNum);
    const startIdx = (pageNum - 1) * limitNum;
    const data = customers.slice(startIdx, startIdx + limitNum).map(sanitizeCustomerList);

    return res.json({ data, total, page: pageNum, totalPages, limit: limitNum });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single customer profile (authorization checked)
 */
export async function getCustomer(req, res, next) {
  try {
    const customer = await customerRepo.findById(req.params.id);
    if (!customer) {
      throw createAppError('Customer not found', 404);
    }
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized to view this customer', 403);
    }
    return res.json({ customer });
  } catch (err) {
    next(err);
  }
}

/**
 * Update customer fields
 */
export async function updateCustomer(req, res, next) {
  try {
    const customer = await customerRepo.findById(req.params.id);
    if (!customer) throw createAppError('Customer not found', 404);
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    const updates = customerUpdateSchema.parse(req.body);
    const updated = await customerRepo.update(req.params.id, updates);

    // Record activity
    await activityRepo.create({
      customerId: req.params.id,
      actorId: req.user.id,
      action: 'profile_updated',
      description: `Profile updated: ${Object.keys(updates).join(', ')}`,
      metadata: { fields: Object.keys(updates) },
    });

    return res.json({ customer: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Update journey status
 */
export async function updateStatus(req, res, next) {
  try {
    const customer = await customerRepo.findById(req.params.id);
    if (!customer) throw createAppError('Customer not found', 404);
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    const { status } = statusUpdateSchema.parse(req.body);
    const previousStatus = customer.journeyStatus;
    const updated = await customerRepo.update(req.params.id, { journeyStatus: status });

    // Record activity
    await activityRepo.create({
      customerId: req.params.id,
      actorId: req.user.id,
      action: 'status_changed',
      description: `Status changed from "${previousStatus}" to "${status}"`,
      metadata: { previousStatus, newStatus: status },
    });

    return res.json({ customer: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Sanitize customer for list view (exclude sensitive details)
 */
function sanitizeCustomerList(c) {
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    gender: c.gender,
    dateOfBirth: c.dateOfBirth,
    city: c.city,
    country: c.country,
    maritalStatus: c.maritalStatus,
    journeyStatus: c.journeyStatus,
    verification: c.verification?.status || 'Unverified',
    updatedAt: c.updatedAt,
  };
}
