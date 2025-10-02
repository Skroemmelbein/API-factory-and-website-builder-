const express = require('express');
const { body, validationResult } = require('express-validator');
const ApiGenerator = require('../../api-factory/generators/ApiGenerator');
const router = express.Router();

// Generate API from database schema
router.post('/api/database', [
  body('databaseUrl').isURL(),
  body('projectId').isInt(),
  body('options').optional().isObject()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { databaseUrl, projectId, options = {} } = req.body;

    const generator = new ApiGenerator();
    const result = await generator.generateFromDatabase(databaseUrl, {
      projectId,
      ...options
    });

    res.json({
      message: 'API generated successfully',
      result
    });
  } catch (error) {
    console.error('API generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate API',
      details: error.message 
    });
  }
});

// Generate API from OpenAPI spec
router.post('/api/openapi', [
  body('openApiSpec').isObject(),
  body('projectId').isInt(),
  body('options').optional().isObject()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { openApiSpec, projectId, options = {} } = req.body;

    const generator = new ApiGenerator();
    const result = await generator.generateFromOpenAPI(openApiSpec, {
      projectId,
      ...options
    });

    res.json({
      message: 'API generated successfully',
      result
    });
  } catch (error) {
    console.error('API generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate API',
      details: error.message 
    });
  }
});

// Generate API from configuration
router.post('/api/config', [
  body('config').isObject(),
  body('projectId').isInt()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { config, projectId } = req.body;

    const generator = new ApiGenerator();
    const result = await generator.generateFromConfig(config, { projectId });

    res.json({
      message: 'API generated successfully',
      result
    });
  } catch (error) {
    console.error('API generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate API',
      details: error.message 
    });
  }
});

// Get generation status
router.get('/api/status/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // In a real implementation, you'd check the actual generation status
    // For now, we'll return a mock status
    res.json({
      projectId: parseInt(projectId),
      status: 'completed',
      progress: 100,
      generatedFiles: [
        'routes/users.js',
        'routes/products.js',
        'models/User.js',
        'models/Product.js',
        'middleware/auth.js',
        'middleware/validation.js'
      ],
      endpoints: [
        { method: 'GET', path: '/api/users', description: 'Get all users' },
        { method: 'POST', path: '/api/users', description: 'Create user' },
        { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
        { method: 'PUT', path: '/api/users/:id', description: 'Update user' },
        { method: 'DELETE', path: '/api/users/:id', description: 'Delete user' }
      ]
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check generation status' });
  }
});

// Download generated API
router.get('/api/download/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // In a real implementation, you'd generate and return a zip file
    // For now, we'll return a mock response
    res.json({
      message: 'Download would be available here',
      downloadUrl: `/api/download/${projectId}/api-project.zip`
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to prepare download' });
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