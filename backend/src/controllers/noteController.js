import { noteRepo, customerRepo, activityRepo } from '../repositories/jsonRepository.js';
import { noteCreateSchema, noteUpdateSchema } from '../validators/schemas.js';
import { createAppError } from '../middleware/errorHandler.js';

/**
 * List notes for a customer (authorized)
 */
export async function listNotes(req, res, next) {
  try {
    const customer = await customerRepo.findById(req.params.id);
    if (!customer) throw createAppError('Customer not found', 404);
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    const notes = await noteRepo.findAll({ customerId: req.params.id });
    // Sort newest first
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.json({ notes });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a note for a customer
 */
export async function createNote(req, res, next) {
  try {
    const customer = await customerRepo.findById(req.params.id);
    if (!customer) throw createAppError('Customer not found', 404);
    if (customer.assignedMatchmakerId !== req.user.id) {
      throw createAppError('Not authorized', 403);
    }

    const { content, type } = noteCreateSchema.parse(req.body);
    const note = await noteRepo.create({
      customerId: req.params.id,
      authorId: req.user.id,
      content,
      type,
    });

    // Record activity
    await activityRepo.create({
      customerId: req.params.id,
      actorId: req.user.id,
      action: 'note_added',
      description: `Added ${type} note`,
      metadata: { noteId: note.id, type },
    });

    return res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a note (only by creator)
 */
export async function updateNote(req, res, next) {
  try {
    const note = await noteRepo.findById(req.params.id);
    if (!note) throw createAppError('Note not found', 404);
    if (note.authorId !== req.user.id) {
      throw createAppError('Not authorized to edit this note', 403);
    }

    const updates = noteUpdateSchema.parse(req.body);
    const updated = await noteRepo.update(req.params.id, updates);

    return res.json({ note: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a note (only by creator, with soft confirmation via client)
 */
export async function deleteNote(req, res, next) {
  try {
    const note = await noteRepo.findById(req.params.id);
    if (!note) throw createAppError('Note not found', 404);
    if (note.authorId !== req.user.id) {
      throw createAppError('Not authorized to delete this note', 403);
    }

    await noteRepo.delete(req.params.id);

    // Record activity
    await activityRepo.create({
      customerId: note.customerId,
      actorId: req.user.id,
      action: 'note_deleted',
      description: `Deleted ${note.type} note`,
      metadata: { noteId: req.params.id },
    });

    return res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
}
