# API Factory & Website Builder

A comprehensive tool for automatically generating REST APIs and building responsive web interfaces.

## Features

### 🚀 API Factory
- **Automatic REST API Generation**: Generate complete REST APIs from database schemas, OpenAPI specs, or configuration files
- **Multiple Database Support**: Works with PostgreSQL, MySQL, SQLite, MongoDB, and more
- **CRUD Operations**: Automatically generates Create, Read, Update, Delete endpoints
- **Authentication & Authorization**: Built-in JWT, OAuth2, and role-based access control
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Rate Limiting & Validation**: Built-in request validation and rate limiting
- **Real-time APIs**: WebSocket support for real-time features

### 🎨 Website Builder
- **Drag & Drop Interface**: Visual website builder with drag-and-drop components
- **Responsive Design**: Mobile-first, responsive templates
- **Component Library**: Pre-built components (forms, tables, charts, etc.)
- **Theme System**: Customizable themes and styling
- **Code Generation**: Generate clean HTML, CSS, and JavaScript
- **Integration Ready**: Easy integration with generated APIs
- **Export Options**: Export as static site or deploy directly

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Generate an API from database
npm run generate:api -- --database postgresql://user:pass@localhost/db

# Start the website builder
npm run builder
```

## Architecture

- **Backend**: Node.js with Express.js
- **Frontend**: React with TypeScript
- **Database**: Multi-database support via Prisma ORM
- **API Generation**: Custom code generator with templates
- **Website Builder**: React-based visual editor

## Next Steps

1. Set up the project structure
2. Implement the API factory core
3. Build the website builder interface
4. Add database integration
5. Create example projects
6. Add comprehensive documentation