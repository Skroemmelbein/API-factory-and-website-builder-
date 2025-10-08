const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Use Prisma-backed projects if available
let projects = [];

// Get all projects for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const prisma = req.app?.locals?.prisma;
  if (prisma) {
    const list = await prisma.project.findMany({
      where: { userId: req.user.userId },
      orderBy: { updatedAt: 'desc' }
    });
    return res.json(list);
  }
  const userProjects = projects.filter(project => project.userId === req.user.userId);
  res.json(userProjects);
});

// Get specific project
router.get('/:id', authenticateToken, async (req, res) => {
  const prisma = req.app?.locals?.prisma;
  if (prisma) {
    const project = await prisma.project.findFirst({ where: { id: parseInt(req.params.id), userId: req.user.userId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    return res.json(project);
  }
  const project = projects.find(p => p.id === parseInt(req.params.id) && p.userId === req.user.userId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// Create new project
router.post('/', [
  body('name').trim().isLength({ min: 1 }),
  body('type').isIn(['api', 'website', 'fullstack']),
  body('description').optional().trim()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, description, config } = req.body;
    const prisma = req.app?.locals?.prisma;
    if (prisma) {
      const project = await prisma.project.create({
        data: {
          name,
          type,
          description: description || '',
          config: config || {},
          status: 'draft',
          userId: req.user.userId
        }
      });
      return res.status(201).json(project);
    }
    const project = { id: projects.length + 1, userId: req.user.userId, name, type, description: description || '', config: config || {}, status: 'draft', createdAt: new Date(), updatedAt: new Date() };
    projects.push(project);
    res.status(201).json(project);
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const prisma = req.app?.locals?.prisma;
    if (prisma) {
      const updates = req.body;
      try {
        const updated = await prisma.project.update({
          where: { id: parseInt(req.params.id) },
          data: {
            ...(updates.name ? { name: updates.name } : {}),
            ...(updates.description !== undefined ? { description: updates.description } : {}),
            ...(updates.config ? { config: updates.config } : {})
          }
        });
        if (updated.userId !== req.user.userId) return res.status(404).json({ error: 'Project not found' });
        return res.json(updated);
      } catch (e) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }
    const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.user.userId);
    if (projectIndex === -1) return res.status(404).json({ error: 'Project not found' });
    const project = projects[projectIndex];
    const updates = req.body;
    if (updates.name) project.name = updates.name;
    if (updates.description !== undefined) project.description = updates.description;
    if (updates.config) project.config = { ...project.config, ...updates.config };
    project.updatedAt = new Date();
    projects[projectIndex] = project;
    res.json(project);
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  const prisma = req.app?.locals?.prisma;
  if (prisma) {
    try {
      const project = await prisma.project.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!project || project.userId !== req.user.userId) return res.status(404).json({ error: 'Project not found' });
      await prisma.design.deleteMany({ where: { projectId: project.id } });
      await prisma.project.delete({ where: { id: project.id } });
      return res.json({ message: 'Project deleted successfully' });
    } catch (e) {
      return res.status(404).json({ error: 'Project not found' });
    }
  }
  const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.user.userId);
  if (projectIndex === -1) return res.status(404).json({ error: 'Project not found' });
  projects.splice(projectIndex, 1);
  res.json({ message: 'Project deleted successfully' });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;