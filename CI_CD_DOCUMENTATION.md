# CI/CD Pipeline Documentation for Billify E-commerce Platform

This document explains the comprehensive CI/CD pipeline implementation for the Billify e-commerce platform using GitHub Actions.

## Overview

The CI/CD pipeline consists of 6 main workflows:

1. **CI Pipeline** (`ci.yml`) - Continuous Integration
2. **CD Pipeline** (`cd.yml`) - Continuous Deployment
3. **Code Quality** (`code-quality.yml`) - Code analysis and quality checks
4. **Security Scan** (`security.yml`) - Security vulnerability scanning
5. **Performance Monitoring** (`performance.yml`) - Performance testing and monitoring
6. **Release** (`release.yml`) - Automated release management

## Workflow Details

### 1. CI Pipeline (`ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

- **Client CI**: Runs linting, tests, and builds for the React frontend
- **Server CI**: Runs tests for the Node.js backend with Redis service
- **Docker CI**: Tests Docker image builds for both client and server
- **Integration Tests**: Runs end-to-end integration tests

**Key Features:**

- Multi-node version testing (Node.js 18.x, 20.x)
- Test coverage reporting to Codecov
- Docker build caching for faster builds
- Artifact uploads for build results

### 2. CD Pipeline (`cd.yml`)

**Triggers:**

- Push to `main` branch
- Successful CI pipeline completion
- Git tags starting with `v*`

**Jobs:**

- **Build and Push**: Creates and pushes Docker images to GitHub Container Registry
- **Deploy Staging**: Deploys to staging environment on every main branch push
- **Deploy Production**: Deploys to production only on version tags
- **Notify**: Sends deployment status notifications to Slack

**Key Features:**

- Multi-platform Docker builds (AMD64, ARM64)
- Blue-green deployment strategy
- Health checks after deployment
- Automated rollback on failure

### 3. Code Quality (`code-quality.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests
- Weekly scheduled runs

**Jobs:**

- **SonarCloud Analysis**: Comprehensive code quality analysis
- **ESLint Analysis**: JavaScript/React linting with SARIF reports
- **Prettier Check**: Code formatting validation
- **Bundle Analysis**: Frontend bundle size monitoring
- **Lighthouse CI**: Performance, accessibility, and SEO audits
- **Dependency Review**: Security review of dependencies

### 4. Security Scan (`security.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests
- Daily scheduled runs

**Jobs:**

- **CodeQL Analysis**: GitHub's semantic code analysis
- **Dependency Scan**: NPM audit and Snyk vulnerability scanning
- **Container Scan**: Docker image security scanning with Trivy
- **Secrets Scan**: TruffleHog secret detection
- **License Scan**: License compliance checking
- **OWASP ZAP**: Web application security testing

### 5. Performance Monitoring (`performance.yml`)

**Triggers:**

- Push to `main` branch
- Daily scheduled runs
- Manual workflow dispatch

**Jobs:**

- **Load Testing**: K6 load testing with performance thresholds
- **Bundle Size**: Frontend bundle size monitoring and alerts
- **Database Performance**: MongoDB performance benchmarking

### 6. Release (`release.yml`)

**Triggers:**

- Git tags matching pattern `v*`

**Jobs:**

- **Create Release**: Generates GitHub release with changelog
- **Build Assets**: Creates distribution packages
- **Deploy Release**: Deploys release to production
- **Update Docs**: Updates documentation with version info
- **Notify Release**: Sends release notifications

## Setup Instructions

### 1. Required Secrets

Add these secrets to your GitHub repository settings:

#### Deployment Secrets

```
STAGING_HOST=your-staging-server.com
STAGING_USER=deploy
STAGING_SSH_KEY=<private-ssh-key>
PRODUCTION_HOST=your-production-server.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=<private-ssh-key>
```

#### Third-party Service Tokens

```
SONAR_TOKEN=<sonarcloud-token>
SNYK_TOKEN=<snyk-api-token>
LHCI_GITHUB_APP_TOKEN=<lighthouse-ci-token>
CODECOV_TOKEN=<codecov-token>
```

#### Notification Secrets

```
SLACK_WEBHOOK=<slack-webhook-url>
EMAIL_USERNAME=<smtp-username>
EMAIL_PASSWORD=<smtp-password>
NOTIFICATION_EMAIL=team@yourcompany.com
```

#### Application Secrets

```
VITE_API_URL=https://api.billify.com/api
REDIS_PASSWORD=<redis-password>
```

### 2. Environment Configuration

Create environment files for different stages:

**.env.staging**

```env
NODE_ENV=staging
MONGODB_URI=mongodb://staging-db:27017/billify_staging
REDIS_URL=redis://:password@staging-redis:6379
JWT_SECRET=staging-jwt-secret
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=staging-cloud
```

**.env.production**

```env
NODE_ENV=production
MONGODB_URI=mongodb://prod-db:27017/billify_production
REDIS_URL=redis://:password@prod-redis:6379
JWT_SECRET=production-jwt-secret
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=production-cloud
```

### 3. Server Setup

#### Staging Server

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Create deployment directory
sudo mkdir -p /app/billify-staging
sudo chown $USER:$USER /app/billify-staging

# Clone repository
cd /app/billify-staging
git clone https://github.com/your-org/billify.git .

# Setup environment
cp .env.staging.example .env.staging
# Edit .env.staging with your values
```

#### Production Server

```bash
# Similar setup as staging
sudo mkdir -p /app/billify-production
sudo chown $USER:$USER /app/billify-production

cd /app/billify-production
git clone https://github.com/your-org/billify.git .
cp .env.production.example .env.production
# Edit .env.production with your values

# Create deployment script
cat > deploy-release.sh << 'EOF'
#!/bin/bash
VERSION=$1
echo "Deploying version $VERSION"

# Stop current containers
docker compose -f docker-compose.production.yml down

# Update environment with new images
export CLIENT_IMAGE="ghcr.io/your-org/billify/client:$VERSION"
export SERVER_IMAGE="ghcr.io/your-org/billify/server:$VERSION"

# Start new containers
docker compose -f docker-compose.production.yml up -d

# Wait for services to be ready
sleep 30

# Health check
curl -f https://billify.com/health || exit 1

echo "Deployment successful!"
EOF

chmod +x deploy-release.sh
```

### 4. Third-party Service Setup

#### SonarCloud

1. Go to https://sonarcloud.io
2. Import your GitHub repository
3. Update `sonar-project.properties` with your project key
4. Add `SONAR_TOKEN` to GitHub secrets

#### Snyk

1. Sign up at https://snyk.io
2. Get your API token from account settings
3. Add `SNYK_TOKEN` to GitHub secrets

#### Lighthouse CI

1. Set up LHCI server or use Lighthouse CI GitHub app
2. Update `lighthouserc.json` with your configuration
3. Add `LHCI_GITHUB_APP_TOKEN` to GitHub secrets

## Usage

### Development Workflow

1. **Feature Development**

   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **Create Pull Request**

   - CI pipeline runs automatically
   - Code quality checks execute
   - Security scans perform
   - Review and merge after all checks pass

3. **Release Process**
   ```bash
   # After merging to main
   git checkout main
   git pull origin main
   git tag v1.2.3
   git push origin v1.2.3
   ```

### Monitoring and Maintenance

#### View Pipeline Status

- Go to Actions tab in GitHub repository
- Monitor workflow runs and results
- Check for failed jobs and investigate

#### Performance Monitoring

- Review load test results in artifacts
- Monitor bundle size changes
- Check Lighthouse scores

#### Security Monitoring

- Review security scan results
- Address identified vulnerabilities
- Monitor dependency updates

## Best Practices

### 1. Branch Protection

Set up branch protection rules for `main`:

- Require status checks to pass
- Require branches to be up to date
- Require review from code owners
- Restrict force pushes

### 2. Environment Management

- Keep staging and production environments in sync
- Use infrastructure as code (Docker Compose)
- Regularly update dependencies

### 3. Monitoring

- Set up application monitoring (APM)
- Configure log aggregation
- Implement health checks

### 4. Security

- Regularly rotate secrets
- Keep dependencies updated
- Review security scan results
- Implement OWASP guidelines

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Check logs in GitHub Actions
# Common causes:
- Dependency conflicts
- Environment variable issues
- Test failures
- Linting errors
```

#### 2. Deployment Failures

```bash
# SSH connection issues
ssh-keygen -R <server-ip>  # Remove old host key
ssh -vvv user@server       # Debug connection

# Docker issues
docker system prune -f     # Clean up space
docker-compose logs        # Check container logs
```

#### 3. Test Failures

```bash
# Run tests locally
npm test
npm run test:coverage

# Check test environment
# Verify database connections
# Check service dependencies
```

## Support

For issues with the CI/CD pipeline:

1. Check the GitHub Actions logs
2. Review this documentation
3. Contact the DevOps team
4. Create an issue in the repository

## Contributing

When modifying the CI/CD pipeline:

1. Test changes in a feature branch
2. Update this documentation
3. Get approval from the DevOps team
4. Monitor the first few runs after deployment
