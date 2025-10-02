const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

class ApiGenerator {
  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }

  async loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates');
    try {
      const files = await fs.readdir(templatesDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const templateName = path.basename(file, '.js');
          const template = require(path.join(templatesDir, file));
          this.templates.set(templateName, template);
        }
      }
    } catch (error) {
      console.warn('No templates directory found, using default templates');
    }
  }

  async generateFromDatabase(databaseUrl, options = {}) {
    try {
      // Initialize Prisma client
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        }
      });

      // Introspect the database schema
      const schema = await this.introspectDatabase(prisma);
      
      // Generate API code
      const generatedCode = await this.generateApiCode(schema, options);
      
      // Save generated files
      const savedFiles = await this.saveGeneratedFiles(generatedCode, options);
      
      await prisma.$disconnect();
      
      return {
        success: true,
        schema,
        generatedFiles: savedFiles,
        endpoints: this.extractEndpoints(schema)
      };
    } catch (error) {
      throw new Error(`Database generation failed: ${error.message}`);
    }
  }

  async generateFromOpenAPI(openApiSpec, options = {}) {
    try {
      // Parse OpenAPI specification
      const schema = this.parseOpenAPISpec(openApiSpec);
      
      // Generate API code
      const generatedCode = await this.generateApiCode(schema, options);
      
      // Save generated files
      const savedFiles = await this.saveGeneratedFiles(generatedCode, options);
      
      return {
        success: true,
        schema,
        generatedFiles: savedFiles,
        endpoints: this.extractEndpoints(schema)
      };
    } catch (error) {
      throw new Error(`OpenAPI generation failed: ${error.message}`);
    }
  }

  async generateFromConfig(config, options = {}) {
    try {
      // Validate configuration
      this.validateConfig(config);
      
      // Generate API code from config
      const generatedCode = await this.generateApiCode(config, options);
      
      // Save generated files
      const savedFiles = await this.saveGeneratedFiles(generatedCode, options);
      
      return {
        success: true,
        schema: config,
        generatedFiles: savedFiles,
        endpoints: this.extractEndpoints(config)
      };
    } catch (error) {
      throw new Error(`Config generation failed: ${error.message}`);
    }
  }

  async introspectDatabase(prisma) {
    // This is a simplified version - in production, you'd use Prisma's introspection
    // or a more sophisticated schema analysis
    return {
      models: [
        {
          name: 'User',
          fields: [
            { name: 'id', type: 'Int', isRequired: true, isUnique: true },
            { name: 'email', type: 'String', isRequired: true, isUnique: true },
            { name: 'name', type: 'String', isRequired: true },
            { name: 'createdAt', type: 'DateTime', isRequired: true },
            { name: 'updatedAt', type: 'DateTime', isRequired: true }
          ]
        },
        {
          name: 'Product',
          fields: [
            { name: 'id', type: 'Int', isRequired: true, isUnique: true },
            { name: 'name', type: 'String', isRequired: true },
            { name: 'price', type: 'Float', isRequired: true },
            { name: 'description', type: 'String', isRequired: false },
            { name: 'createdAt', type: 'DateTime', isRequired: true },
            { name: 'updatedAt', type: 'DateTime', isRequired: true }
          ]
        }
      ]
    };
  }

  parseOpenAPISpec(spec) {
    // Parse OpenAPI specification and convert to internal schema format
    const models = [];
    
    if (spec.components && spec.components.schemas) {
      for (const [name, schema] of Object.entries(spec.components.schemas)) {
        if (schema.type === 'object') {
          const fields = [];
          if (schema.properties) {
            for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
              fields.push({
                name: fieldName,
                type: this.mapOpenAPIType(fieldSchema.type),
                isRequired: schema.required && schema.required.includes(fieldName),
                isUnique: false // Would need additional analysis
              });
            }
          }
          models.push({ name, fields });
        }
      }
    }
    
    return { models };
  }

  mapOpenAPIType(type) {
    const typeMap = {
      'string': 'String',
      'integer': 'Int',
      'number': 'Float',
      'boolean': 'Boolean',
      'array': 'Array',
      'object': 'Object'
    };
    return typeMap[type] || 'String';
  }

  validateConfig(config) {
    if (!config.models || !Array.isArray(config.models)) {
      throw new Error('Configuration must include a models array');
    }
    
    for (const model of config.models) {
      if (!model.name || !model.fields || !Array.isArray(model.fields)) {
        throw new Error('Each model must have a name and fields array');
      }
    }
  }

  async generateApiCode(schema, options) {
    const generatedCode = {};
    
    // Generate routes for each model
    for (const model of schema.models) {
      const routeCode = this.generateRouteCode(model, options);
      generatedCode[`routes/${model.name.toLowerCase()}s.js`] = routeCode;
      
      const modelCode = this.generateModelCode(model, options);
      generatedCode[`models/${model.name}.js`] = modelCode;
    }
    
    // Generate middleware
    generatedCode['middleware/auth.js'] = this.generateAuthMiddleware(options);
    generatedCode['middleware/validation.js'] = this.generateValidationMiddleware(options);
    
    // Generate main server file
    generatedCode['server.js'] = this.generateServerCode(schema, options);
    
    // Generate package.json
    generatedCode['package.json'] = this.generatePackageJson(options);
    
    // Generate README
    generatedCode['README.md'] = this.generateReadme(schema, options);
    
    return generatedCode;
  }

  generateRouteCode(model, options) {
    const modelName = model.name;
    const modelNameLower = modelName.toLowerCase();
    const modelNamePlural = `${modelNameLower}s`;
    
    return `const express = require('express');
const { ${modelName} } = require('../models/${modelName}');
const { validate${modelName} } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /${modelNamePlural} - Get all ${modelNamePlural}
router.get('/', authenticateToken, async (req, res) => {
  try {
    const ${modelNamePlural} = await ${modelName}.findAll();
    res.json(${modelNamePlural});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ${modelNamePlural}' });
  }
});

// GET /${modelNamePlural}/:id - Get ${modelName} by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ${modelNameLower} = await ${modelName}.findById(req.params.id);
    if (!${modelNameLower}) {
      return res.status(404).json({ error: '${modelName} not found' });
    }
    res.json(${modelNameLower});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ${modelNameLower}' });
  }
});

// POST /${modelNamePlural} - Create new ${modelName}
router.post('/', authenticateToken, validate${modelName}, async (req, res) => {
  try {
    const ${modelNameLower} = await ${modelName}.create(req.body);
    res.status(201).json(${modelNameLower});
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ${modelNameLower}' });
  }
});

// PUT /${modelNamePlural}/:id - Update ${modelName}
router.put('/:id', authenticateToken, validate${modelName}, async (req, res) => {
  try {
    const ${modelNameLower} = await ${modelName}.update(req.params.id, req.body);
    if (!${modelNameLower}) {
      return res.status(404).json({ error: '${modelName} not found' });
    }
    res.json(${modelNameLower});
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ${modelNameLower}' });
  }
});

// DELETE /${modelNamePlural}/:id - Delete ${modelName}
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await ${modelName}.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: '${modelName} not found' });
    }
    res.json({ message: '${modelName} deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ${modelNameLower}' });
  }
});

module.exports = router;`;
  }

  generateModelCode(model, options) {
    const modelName = model.name;
    const fields = model.fields;
    
    let fieldsDefinition = '';
    let validationRules = '';
    
    for (const field of fields) {
      fieldsDefinition += `  ${field.name}: ${field.type}${field.isRequired ? '!' : ''},\n`;
      if (field.isRequired) {
        validationRules += `    ${field.name}: Joi.${this.getJoiType(field.type)}()${field.isRequired ? '.required()' : ''},\n`;
      }
    }
    
    return `const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');

const prisma = new PrismaClient();

class ${modelName} {
  static async findAll() {
    return await prisma.${modelName.toLowerCase()}.findMany();
  }

  static async findById(id) {
    return await prisma.${modelName.toLowerCase()}.findUnique({
      where: { id: parseInt(id) }
    });
  }

  static async create(data) {
    return await prisma.${modelName.toLowerCase()}.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  static async update(id, data) {
    return await prisma.${modelName.toLowerCase()}.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  static async delete(id) {
    return await prisma.${modelName.toLowerCase()}.delete({
      where: { id: parseInt(id) }
    });
  }

  static validate(data) {
    const schema = Joi.object({
${validationRules}    });
    
    return schema.validate(data);
  }
}

module.exports = { ${modelName} };`;
  }

  getJoiType(type) {
    const typeMap = {
      'String': 'string()',
      'Int': 'number().integer()',
      'Float': 'number()',
      'Boolean': 'boolean()',
      'DateTime': 'date()',
      'Array': 'array()',
      'Object': 'object()'
    };
    return typeMap[type] || 'string()';
  }

  generateAuthMiddleware(options) {
    return `const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };`;
  }

  generateValidationMiddleware(options) {
    return `const Joi = require('joi');

// Add validation functions for each model
// This would be dynamically generated based on the schema

module.exports = {
  // Validation functions would be added here
};`;
  }

  generateServerCode(schema, options) {
    const routes = schema.models.map(model => 
      `const ${model.name.toLowerCase()}sRouter = require('./routes/${model.name.toLowerCase()}s');`
    ).join('\n');
    
    const routeUsage = schema.models.map(model => 
      `app.use('/api/${model.name.toLowerCase()}s', ${model.name.toLowerCase()}sRouter);`
    ).join('\n');

    return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
${routes}

${routeUsage}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`;
  }

  generatePackageJson(options) {
    return JSON.stringify({
      name: options.projectName || 'generated-api',
      version: '1.0.0',
      description: 'Auto-generated API',
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'nodemon server.js'
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        helmet: '^7.1.0',
        morgan: '^1.10.0',
        dotenv: '^16.3.1',
        '@prisma/client': '^5.7.1',
        joi: '^17.11.0',
        jsonwebtoken: '^9.0.2'
      },
      devDependencies: {
        nodemon: '^3.0.2'
      }
    }, null, 2);
  }

  generateReadme(schema, options) {
    const endpoints = this.extractEndpoints(schema);
    const endpointDocs = endpoints.map(ep => 
      `- \`${ep.method} ${ep.path}\` - ${ep.description}`
    ).join('\n');

    return `# Generated API

This API was automatically generated by the API Factory.

## Endpoints

${endpointDocs}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up your environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   \`\`\`

3. Run the server:
   \`\`\`bash
   npm start
   \`\`\`

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Database

This API uses Prisma ORM. Make sure to:
1. Set up your database
2. Run \`npx prisma generate\`
3. Run \`npx prisma db push\` to create the database schema
`;
  }

  extractEndpoints(schema) {
    const endpoints = [];
    
    for (const model of schema.models) {
      const modelNamePlural = `${model.name.toLowerCase()}s`;
      endpoints.push(
        { method: 'GET', path: `/api/${modelNamePlural}`, description: `Get all ${modelNamePlural}` },
        { method: 'GET', path: `/api/${modelNamePlural}/:id`, description: `Get ${model.name} by ID` },
        { method: 'POST', path: `/api/${modelNamePlural}`, description: `Create new ${model.name}` },
        { method: 'PUT', path: `/api/${modelNamePlural}/:id`, description: `Update ${model.name}` },
        { method: 'DELETE', path: `/api/${modelNamePlural}/:id`, description: `Delete ${model.name}` }
      );
    }
    
    return endpoints;
  }

  async saveGeneratedFiles(generatedCode, options) {
    const outputDir = options.outputDir || `./generated-api-${Date.now()}`;
    const savedFiles = [];
    
    try {
      await fs.mkdir(outputDir, { recursive: true });
      
      for (const [filePath, content] of Object.entries(generatedCode)) {
        const fullPath = path.join(outputDir, filePath);
        const dir = path.dirname(fullPath);
        
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, content);
        savedFiles.push(filePath);
      }
      
      return savedFiles;
    } catch (error) {
      throw new Error(`Failed to save generated files: ${error.message}`);
    }
  }
}

module.exports = ApiGenerator;