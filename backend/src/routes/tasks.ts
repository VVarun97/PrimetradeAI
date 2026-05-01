import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../db';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Get all tasks for the logged-in user
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all tasks across all users
router.get('/all', authenticate, authorizeAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new task
router.post('/', authenticate, [
  body('title').notEmpty()
], async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, status } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'pending',
        userId: req.user!.id
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task
router.put('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, description, status } = req.body;
    
    // verify ownership
    const existingTask = await prisma.task.findUnique({ where: { id: req.params.id as string } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (existingTask.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: { title, description, status }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const existingTask = await prisma.task.findUnique({ where: { id: req.params.id as string } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (existingTask.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    await prisma.task.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
