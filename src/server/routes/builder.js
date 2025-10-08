const express = require('express');
const { body, validationResult } = require('express-validator');
const WebsiteBuilder = require('../../website-builder/WebsiteBuilder');
const router = express.Router();

// Get available components
router.get('/components', authenticateToken, (req, res) => {
  try {
    const builder = new WebsiteBuilder();
    const components = builder.getAvailableComponents();
    res.json(components);
  } catch (error) {
    console.error('Components fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// Get available themes
router.get('/themes', authenticateToken, (req, res) => {
  try {
    const builder = new WebsiteBuilder();
    const themes = builder.getAvailableThemes();
    res.json(themes);
  } catch (error) {
    console.error('Themes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// Get available templates
router.get('/templates', authenticateToken, (req, res) => {
  try {
    const builder = new WebsiteBuilder();
    const templates = builder.getAvailableTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create website from template (persists Project + Design if DB available)
router.post('/create', [
  body('templateId').isString(),
  body('projectId').optional().isInt(),
  body('project').optional().isObject(),
  body('customizations').optional().isObject()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateId, projectId, project, customizations = {} } = req.body;

    const builder = new WebsiteBuilder();
    const prisma = req.app?.locals?.prisma;

    let ensuredProjectId = projectId;
    if (prisma && !ensuredProjectId) {
      // Create project if not provided
      const createdProject = await prisma.project.create({
        data: {
          userId: req.user.userId,
          name: project?.name || `Website ${new Date().toISOString().slice(0,10)}`,
          type: 'website',
          description: project?.description || '',
          status: 'draft',
          config: project?.config || {}
        }
      });
      ensuredProjectId = createdProject.id;
    }

    const result = await builder.createFromTemplate(templateId, {
      projectId: ensuredProjectId,
      customizations
    });

    res.json({
      message: 'Website created successfully',
      result
    });
  } catch (error) {
    console.error('Website creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create website',
      details: error.message 
    });
  }
});

// Update website design
router.put('/update/:projectId', [
  body('design').isObject()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { design } = req.body;

    const builder = new WebsiteBuilder();
    const result = await builder.updateDesign(projectId, design);

    res.json({
      message: 'Website updated successfully',
      result
    });
  } catch (error) {
    console.error('Website update error:', error);
    res.status(500).json({ 
      error: 'Failed to update website',
      details: error.message 
    });
  }
});

// Preview website
router.get('/preview/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const builder = new WebsiteBuilder();
    const preview = await builder.generatePreview(projectId);

    res.json({
      message: 'Preview generated successfully',
      preview
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate preview',
      details: error.message 
    });
  }
});

// Export website
router.post('/export/:projectId', [
  body('format').isIn(['html', 'react', 'vue', 'static']),
  body('options').optional().isObject()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { format, options = {} } = req.body;

    const builder = new WebsiteBuilder();
    const result = await builder.exportWebsite(projectId, format, options);

    res.json({
      message: 'Website exported successfully',
      result
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export website',
      details: error.message 
    });
  }
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