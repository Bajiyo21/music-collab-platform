# TuneCollab - Deployment & Setup Guide

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:3000)
pnpm dev

# Type check
pnpm check

# Run tests
pnpm test
```

## 📦 Production Build

```bash
# Build optimized bundles
pnpm build

# Start production server
pnpm start
```

## 🌐 Manus Deployment

TuneCollab is optimized for deployment on Manus with automatic scaling and custom domain support.

### Prerequisites
- Manus account
- Project initialized in Manus dashboard
- Database connection configured

### Deployment Steps

1. **Create a Checkpoint**
   - All changes must be saved as a checkpoint before publishing
   - Use the Management UI or CLI to create checkpoints

2. **Click Publish**
   - Open the Management UI
   - Click "Publish" button in the top-right
   - Choose deployment strategy:
     - **Autoscale** (Recommended): Serverless, scales to 0 when inactive
     - **Reserved**: Always-on instances for guaranteed uptime

3. **Configure Domain**
   - Auto-generated domain: `tunecollab.manus.space`
   - Custom domain: Connect via Settings → Domains
   - SSL/TLS: Automatic with Let's Encrypt

4. **Monitor Deployment**
   - Dashboard shows deployment status
   - Logs available in Management UI
   - Real-time analytics and metrics

### Environment Variables

Set these in the Manus dashboard (Settings → Secrets):

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/tunecollab

# Authentication
JWT_SECRET=your-secure-random-secret-key
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner Info
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# Built-in APIs
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
```

## 🗄️ Database Setup

### MySQL Connection

```bash
# Connect to database
mysql -h your-host -u your-user -p your-database

# Run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Schema Overview

```sql
-- Core tables
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Music tables
CREATE TABLE tracks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  duration INT,
  fileKey VARCHAR(255),
  plays INT DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Collaboration tables
CREATE TABLE collaborations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creatorId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('draft', 'in_progress', 'completed') DEFAULT 'draft',
  FOREIGN KEY (creatorId) REFERENCES users(id)
);

-- See drizzle/schema.ts for complete schema
```

## 🔐 Security Best Practices

### Authentication
- Manus OAuth handles user authentication
- Session cookies are secure and HTTP-only
- JWT tokens signed with `JWT_SECRET`
- Protected procedures require authentication

### Data Protection
- All passwords hashed with bcrypt
- Sensitive data encrypted at rest
- HTTPS enforced in production
- CORS configured for allowed origins

### File Storage
- Audio files stored in S3-compatible storage
- Presigned URLs for secure access
- Files scanned for malware
- Access logs maintained

## 📊 Monitoring & Logging

### Application Logs
- Dev: `.manus-logs/devserver.log`
- Production: Available in Management UI

### Database Logs
- Query performance monitoring
- Connection pool status
- Slow query logs

### Metrics
- Request latency
- Error rates
- User activity
- Storage usage

## 🔄 CI/CD Pipeline

### GitHub Integration

```bash
# Export to GitHub
1. Open Management UI → More (⋯) → GitHub
2. Select repository owner and name
3. Click "Export"
4. Repository created with full source code
```

### Automated Deployments

```yaml
# .github/workflows/deploy.yml
name: Deploy to Manus

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      # Deploy to Manus
```

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
# Test API endpoints
pnpm test:api
```

### E2E Tests
```bash
# Test user flows
pnpm test:e2e
```

## 📈 Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading of pages
- Image optimization
- CSS minification
- JavaScript minification

### Backend
- Database query optimization
- Connection pooling
- Caching with Redis (optional)
- API response compression

### Database
- Indexed columns for fast queries
- Optimized table relationships
- Query execution plans reviewed
- Regular backups scheduled

## 🔄 Scaling Strategy

### Autoscale (Recommended)
- Instances scale from 0 to N based on traffic
- Perfect for variable workloads
- Cost-effective for low-traffic periods
- Cold starts handled gracefully

### Reserved Hosting
- Fixed number of always-on instances
- Guaranteed uptime and performance
- Ideal for production with consistent traffic
- Higher cost but predictable

### Database Scaling
- Read replicas for high-traffic scenarios
- Connection pooling for efficiency
- Sharding for massive datasets (future)

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME
```

**OAuth Not Working**
- Verify `VITE_APP_ID` is correct
- Check `OAUTH_SERVER_URL` is accessible
- Ensure redirect URL matches settings

**Deployment Stuck**
- Check logs in Management UI
- Verify all environment variables set
- Ensure database migrations completed

## 📞 Support

- **Documentation**: https://docs.manus.im
- **Community**: https://community.manus.im
- **Support Email**: support@manus.im

## 🎯 Next Steps

1. **Set up database**: Configure MySQL connection
2. **Configure OAuth**: Set up Manus OAuth app
3. **Upload files**: Set up S3 storage
4. **Deploy**: Click Publish in Management UI
5. **Monitor**: Track metrics and logs
6. **Iterate**: Gather feedback and improve

## 📝 Checklist Before Publishing

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm check`)
- [ ] Production build successful (`pnpm build`)
- [ ] Checkpoint created
- [ ] Custom domain configured (optional)
- [ ] Monitoring alerts set up

## 🎉 You're Ready!

TuneCollab is now ready for production deployment. Click "Publish" in the Management UI to go live!

---

**Questions?** Check the [README.md](./README.md) for more information or reach out to support.
