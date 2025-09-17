const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Factory & Website Builder',
      version: '1.0.0',
      description: 'A comprehensive tool for automatically generating REST APIs and building responsive web interfaces',
      contact: {
        name: 'API Factory Team',
        email: 'support@apifactory.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Project ID'
            },
            userId: {
              type: 'integer',
              description: 'Owner user ID'
            },
            name: {
              type: 'string',
              description: 'Project name'
            },
            type: {
              type: 'string',
              enum: ['api', 'website', 'fullstack'],
              description: 'Project type'
            },
            description: {
              type: 'string',
              description: 'Project description'
            },
            status: {
              type: 'string',
              enum: ['draft', 'generating', 'completed', 'error'],
              description: 'Project status'
            },
            config: {
              type: 'object',
              description: 'Project configuration'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Additional error details'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/server/routes/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs;