# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd api-factory-website-builder
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development servers:**
   ```bash
   npm run dev
   ```
   This will start both the backend (port 3000) and frontend (port 3001).

### 🌐 Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🛠️ Usage

### API Factory

1. **Via Web Interface:**
   - Go to http://localhost:3001/api-factory
   - Choose your source (Database, OpenAPI, Config)
   - Configure your project
   - Generate and download your API

2. **Via CLI:**
   ```bash
   # Interactive mode
   npm run generate:api -- interactive
   
   # From database
   npm run generate:api -- from-database --database "postgresql://user:pass@localhost:5432/db" --name "my-api"
   
   # From OpenAPI spec
   npm run generate:api -- from-openapi --file "openapi.json" --name "my-api"
   ```

### Website Builder

1. **Via Web Interface:**
   - Go to http://localhost:3001/website-builder
   - Choose a template or start from scratch
   - Drag and drop components
   - Customize and export

2. **Available Templates:**
   - Landing Page
   - Portfolio
   - Blog
   - E-commerce

## 📁 Project Structure

```
├── src/
│   ├── server/           # Backend API server
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Server utilities
│   ├── client/           # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── contexts/
│   │   └── public/
│   ├── api-factory/      # API generation logic
│   │   ├── generators/
│   │   └── templates/
│   ├── website-builder/  # Website building logic
│   │   ├── components/
│   │   ├── templates/
│   │   └── themes/
│   └── cli/              # Command line tools
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | Database connection string | sqlite:./dev.db |
| `JWT_SECRET` | JWT signing secret | (required) |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3001 |

### Database Setup

The application supports multiple databases:
- PostgreSQL
- MySQL
- SQLite
- MongoDB

Update `DATABASE_URL` in your `.env` file:
```bash
# PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# MySQL
DATABASE_URL="mysql://username:password@localhost:3306/database"

# SQLite
DATABASE_URL="sqlite:./dev.db"

# MongoDB
DATABASE_URL="mongodb://localhost:27017/database"
```

## 🚀 Deployment

### Backend Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Build the React app:**
   ```bash
   cd src/client
   npm run build
   ```

2. **Deploy the `build` folder to your hosting service**

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 API Examples

### Authentication

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Generate API

```bash
# From database
curl -X POST http://localhost:3000/api/generate/api/database \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"databaseUrl":"postgresql://user:pass@localhost:5432/db","projectId":1}'
```

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection issues:**
   - Check your `DATABASE_URL` format
   - Ensure database server is running
   - Verify credentials

3. **CORS errors:**
   - Update `CORS_ORIGIN` in `.env`
   - Check frontend URL matches CORS origin

### Getting Help

- Check the API documentation at `/api-docs`
- Review server logs for error details
- Ensure all environment variables are set correctly

## 🎯 Next Steps

1. **Customize Templates:** Add your own API templates and website components
2. **Add Authentication:** Implement OAuth2 or other auth providers
3. **Database Integration:** Set up your preferred database
4. **Deploy:** Deploy to your preferred hosting platform
5. **Monitor:** Add logging and monitoring solutions

## 📖 Learn More

- [API Documentation](http://localhost:3000/api-docs)
- [React Documentation](https://reactjs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)