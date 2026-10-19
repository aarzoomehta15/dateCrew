import { customerRepo, matchRecordRepo, activityRepo, noteRepo } from '../repositories/jsonRepository.js';
import { JOURNEY_STATUSES } from '../utils/constants.js';

export async function getDashboardStats(req, res, next) {
  try {
    const matchmakerId = req.user.id;
    
    // Get assigned customers
    const allCustomers = await customerRepo.findAll({ assignedMatchmakerId: matchmakerId });
    
    const totalCustomers = allCustomers.length;
    const verifiedProfiles = allCustomers.filter(c => c.verification?.status === 'Verified').length;
    const awaitingMatches = allCustomers.filter(c => 
      c.journeyStatus === 'Ready for Matching' || c.journeyStatus === 'New' || c.journeyStatus === 'Profile Review'
    ).length;

    // Matches sent this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const allMatches = await matchRecordRepo.findAll({ matchmakerId });
    const matchesSentThisMonth = allMatches.filter(m => m.sentAt && m.sentAt >= startOfMonth).length;

    // Pipeline counts
    const pipeline = {};
    for (const status of JOURNEY_STATUSES) {
      pipeline[status] = allCustomers.filter(c => c.journeyStatus === status).length;
    }

    // Recent customers (last 5 updated)
    const recentCustomers = [...allCustomers]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        age: c.dateOfBirth ? calculateAge(c.dateOfBirth) : null,
        city: c.city,
        journeyStatus: c.journeyStatus,
        verification: c.verification?.status || 'Unverified',
      }));

    // Recent activity
    const allActivity = await activityRepo.findAll({});
    const relevantActivity = allActivity
      .filter(a => a.actorId === matchmakerId || allCustomers.some(c => c.id === a.customerId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return res.json({
      metrics: {
        totalCustomers,
        verifiedProfiles,
        awaitingMatches,
        matchesSentThisMonth,
      },
      pipeline,
      recentCustomers,
      recentActivity: relevantActivity,
    });
  } catch (err) {
    next(err);
  }
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}
