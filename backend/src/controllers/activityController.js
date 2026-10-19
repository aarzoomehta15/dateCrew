import { activityRepo } from '../repositories/jsonRepository.js';

export async function listActivity(req, res, next) {
  try {
    const { customerId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (customerId) filter.customerId = customerId;

    let activities = await activityRepo.findAll(filter);
    
    // Sort newest first
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const total = activities.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const totalPages = Math.ceil(total / limitNum);
    const startIdx = (pageNum - 1) * limitNum;
    const data = activities.slice(startIdx, startIdx + limitNum);

    return res.json({ data, total, page: pageNum, totalPages, limit: limitNum });
  } catch (err) {
    next(err);
  }
}
