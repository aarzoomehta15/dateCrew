import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listCustomers, getCustomer, updateCustomer, updateStatus } from '../controllers/customerController.js';
import { listNotes, createNote } from '../controllers/noteController.js';
import { getMatches, recalculateMatches } from '../controllers/matchController.js';

const router = Router();

router.get('/', authenticate, listCustomers);
router.get('/:id', authenticate, getCustomer);
router.patch('/:id', authenticate, updateCustomer);
router.patch('/:id/status', authenticate, updateStatus);

// Notes
router.get('/:id/notes', authenticate, listNotes);
router.post('/:id/notes', authenticate, createNote);

// Matches
router.get('/:id/matches', authenticate, getMatches);
router.post('/:id/matches/recalculate', authenticate, recalculateMatches);

export default router;
