# 🚀 DEPLOYMENT GUIDE

## Production Deployment Strategy

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE CDN                           │
│                  (SSL, DDoS Protection)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   LOAD BALANCER (Nginx)                      │
│              (SSL Termination, Rate Limiting)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│   Frontend       │                  │   Backend API    │
│   (Vercel/       │                  │   (AWS EC2/      │
│    Netlify)      │                  │    DigitalOcean) │
└──────────────────┘                  └──────────────────┘
                                               ↓
                        ┌──────────────────────┴──────────────────────┐
                        ↓                      ↓                      ↓
                ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
                │   MongoDB    │      │    Redis     │      │   AWS S3     │
                │   (Atlas)    │      │   (Cache)    │      │  (Storage)   │
                └──────────────┘      └──────────────┘      └──────────────┘
```

---

## Option 1: Cloud Platform Deployment (Recommended)

### Frontend Deployment (Vercel)

#### Step 1: Prepare Frontend
```bash
cd frontend
npm run build
```

#### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Environment Variables (Vercel Dashboard)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=wss://api.yourdomain.com
REACT_APP_ENV=production
```

#### vercel.json Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

### Backend Deployment (AWS EC2)

#### Step 1: Launch EC2 Instance
- **Instance Type:** t3.medium (2 vCPU, 4GB RAM)
- **OS:** Ubuntu 22.04 LTS
- **Storage:** 30GB SSD
- **Security Group:**
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 5000 (API - internal)

#### Step 2: Server Setup
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 3: Deploy Backend Code
```bash
# Clone repository
git clone https://github.com/yourusername/cgu-portal.git
cd cgu-portal/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

#### .env Configuration
```env
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/erp?retryWrites=true&w=majority
REDIS_URL=redis://your-redis-host:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRE=30d

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cgu-portal-documents

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 4: Start Application with PM2
```bash
# Start app
pm2 start server.js --name cgu-portal-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 5: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/cgu-portal
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size
    client_max_body_size 50M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cgu-portal /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 6: Setup SSL Certificate
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

### Database Setup (MongoDB Atlas)

#### Step 1: Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster (M10 or higher for production)
3. Choose region closest to your backend server
4. Enable backup (Point-in-Time Recovery)

#### Step 2: Configure Security
```
Network Access:
- Add EC2 instance IP
- Add 0.0.0.0/0 (if using dynamic IPs)

Database Access:
- Create user with readWrite role
- Use strong password
```

#### Step 3: Connection String
```
mongodb+srv://username:password@cluster.mongodb.net/erp?retryWrites=true&w=majority
```

#### Step 4: Create Indexes
```javascript
// Run this script once
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ studentId: 1 }, { sparse: true, unique: true });
db.attendance.createIndex({ class: 1, date: -1 });
db.notifications.createIndex({ recipient: 1, isRead: 1, createdAt: -1 });
```

---

### Redis Setup (Redis Cloud)

#### Step 1: Create Instance
1. Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create free instance (30MB)
3. Note connection details

#### Step 2: Configure Backend
```javascript
// config/redis.js
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

client.on('error', (err) => console.error('Redis error:', err));
client.connect();

module.exports = client;
```

---

### File Storage (AWS S3)

#### Step 1: Create S3 Bucket
```bash
aws s3 mb s3://cgu-portal-documents --region us-east-1
```

#### Step 2: Configure CORS
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

#### Step 3: Setup IAM User
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::cgu-portal-documents/*"
    }
  ]
}
```

---

## Option 2: Docker Deployment

### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Monitoring & Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs cgu-portal-api

# Monitor resources
pm2 monit

# View dashboard
pm2 plus
```

### Application Logging (Winston)
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Error Tracking (Sentry)
```javascript
// app.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

---

## Backup Strategy

### Database Backup (Automated)
```bash
# Create backup script
nano /home/ubuntu/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongo_$DATE"

# Compress
tar -czf "$BACKUP_DIR/mongo_$DATE.tar.gz" "$BACKUP_DIR/mongo_$DATE"
rm -rf "$BACKUP_DIR/mongo_$DATE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/mongo_$DATE.tar.gz" s3://cgu-portal-backups/

# Keep only last 7 days
find $BACKUP_DIR -name "mongo_*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /home/ubuntu/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/ubuntu/backup-db.sh
```

---

## Security Checklist

- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure firewall (UFW)
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Implement CORS properly
- [ ] Use helmet.js for security headers
- [ ] Enable MongoDB authentication
- [ ] Use strong JWT secrets
- [ ] Implement input validation
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Use SSH keys (disable password auth)
- [ ] Configure fail2ban
- [ ] Enable database encryption at rest
- [ ] Implement API key rotation

---

## Performance Optimization

### Backend
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Enable caching
const redis = require('./config/redis');
app.use((req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  redis.get(key, (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    }
    next();
  });
});
```

### Frontend
- Enable code splitting
- Lazy load routes
- Optimize images (WebP)
- Use CDN for static assets
- Enable service worker
- Implement virtual scrolling

---

## CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/cgu-portal/backend
            git pull origin main
            npm install --production
            pm2 restart cgu-portal-api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Cost Estimation (Monthly)

### Minimal Setup
- **Frontend (Vercel):** $0 (Free tier)
- **Backend (DigitalOcean Droplet):** $12
- **MongoDB Atlas (M10):** $57
- **Redis Cloud:** $0 (Free tier)
- **AWS S3:** ~$5
- **Domain + SSL:** $12/year
- **Total:** ~$75/month

### Production Setup
- **Frontend (Vercel Pro):** $20
- **Backend (AWS EC2 t3.medium):** $35
- **MongoDB Atlas (M30):** $200
- **Redis Cloud (1GB):** $15
- **AWS S3 + CloudFront:** $20
- **Monitoring (Sentry):** $26
- **Total:** ~$316/month

---

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify database connections
- [ ] Test file uploads
- [ ] Check email notifications
- [ ] Test payment gateway
- [ ] Verify SSL certificate
- [ ] Test mobile responsiveness
- [ ] Check performance (Lighthouse)
- [ ] Setup monitoring alerts
- [ ] Configure backup automation
- [ ] Update DNS records
- [ ] Test disaster recovery
- [ ] Document deployment process
- [ ] Train admin users

---

## Support & Maintenance

### Regular Tasks
- **Daily:** Monitor logs, check alerts
- **Weekly:** Review performance metrics
- **Monthly:** Security updates, backup verification
- **Quarterly:** Dependency updates, security audit

### Emergency Contacts
- DevOps Team: devops@yourdomain.com
- Database Admin: dba@yourdomain.com
- Security Team: security@yourdomain.com
