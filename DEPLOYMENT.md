# 🚂 Railway Deployment Guide

Complete guide for deploying InterMappler Ultimate to Railway.

---

## 📋 Prerequisites

- GitHub/GitLab account
- Railway account (sign up at https://railway.app)
- Project code ready in a repository

---

## 🚀 Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/intermappler.git
   git push -u origin main
   ```

2. **Login to Railway**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"

3. **Connect Repository**
   - Authorize Railway to access your GitHub
   - Select your InterMappler repository
   - Railway will auto-detect the Node.js project

4. **Configure Environment Variables**
   - Click on your project
   - Go to "Variables" tab
   - Add the following:
   
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-NOW
   ALLOWED_ORIGINS=https://your-railway-domain.railway.app
   ENABLE_CLUSTERING=true
   ENABLE_HEATMAP=true
   ENABLE_ROUTING=true
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Wait for build to complete
   - Your app will be live!

6. **Get Your URL**
   - Go to "Settings" tab
   - Under "Domains"
   - Click "Generate Domain"
   - Your app will be available at: `https://your-app-name.railway.app`

---

### Method 2: Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd intermappler-railway
   railway init
   ```

4. **Link to Project** (if exists)
   ```bash
   railway link
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-secret-key
   railway variables set ALLOWED_ORIGINS=https://yourdomain.com
   ```

6. **Deploy**
   ```bash
   railway up
   ```

7. **Open in Browser**
   ```bash
   railway open
   ```

---

### Method 3: Manual Upload

1. **Create ZIP file**
   ```bash
   # Exclude node_modules and .env
   zip -r intermappler.zip . -x "node_modules/*" ".env" ".git/*"
   ```

2. **Railway Dashboard**
   - Create new project
   - Select "Empty Project"
   - Upload your ZIP file
   - Configure variables
   - Deploy

---

## ⚙️ Environment Variables Configuration

### Required Variables

```env
NODE_ENV=production
PORT=3000  # Railway sets this automatically
```

### Recommended Variables

```env
# Security
JWT_SECRET=change-this-to-a-random-32-character-string
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Features
ENABLE_CLUSTERING=true
ENABLE_HEATMAP=true
ENABLE_ROUTING=true
ENABLE_GEOCODING=true
ENABLE_EXPORT=true

# Map Configuration
DEFAULT_MAP_CENTER_LAT=40.416775
DEFAULT_MAP_CENTER_LNG=-3.703790
DEFAULT_MAP_ZOOM=6
MAX_MARKERS=1000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### How to Set Variables in Railway

**Via Dashboard:**
1. Select your project
2. Click on the service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add key-value pairs
6. Save

**Via CLI:**
```bash
railway variables set KEY=VALUE
```

**Bulk Set:**
```bash
railway variables set $(cat .env.production)
```

---

## 🔧 Build Configuration

Railway automatically detects Node.js projects, but you can customize:

### package.json (Already Configured)

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### railway.json (Already Included)

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Railway

1. Go to your project
2. Click on "Settings"
3. Scroll to "Domains"
4. Click "Add Domain"
5. Enter your domain: `intermappler.com`

### Step 2: Configure DNS

Add these DNS records at your domain provider:

**For root domain (intermappler.com):**
```
Type: CNAME
Name: @
Value: your-app.railway.app
```

**For subdomain (www.intermappler.com):**
```
Type: CNAME
Name: www
Value: your-app.railway.app
```

### Step 3: Update Environment Variable

```bash
railway variables set ALLOWED_ORIGINS=https://intermappler.com,https://www.intermappler.com
```

### Step 4: Wait for DNS Propagation

- Can take 5 minutes to 48 hours
- Check with: `dig intermappler.com`
- SSL certificate auto-generated

---

## 📊 Monitoring & Logs

### View Logs

**Via Dashboard:**
1. Select your project
2. Click "Logs" tab
3. Real-time logs displayed

**Via CLI:**
```bash
railway logs
```

**Follow logs:**
```bash
railway logs --follow
```

### Health Check

Your app includes a health endpoint:
```
GET https://your-app.railway.app/health
```

Response:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2026-02-10T...",
  "uptime": 12345
}
```

### Metrics Dashboard

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request count
- Response times

Access via: Project → Metrics

---

## 🔄 Continuous Deployment

### Automatic Deployments

Railway auto-deploys on:
- Push to main branch
- Pull request merge
- Tag creation

### Configure Auto-Deploy

**Enable/Disable:**
1. Project Settings
2. "Deployments" section
3. Toggle "Auto Deploy"

### Deployment Triggers

**Custom branch:**
```bash
railway up --branch production
```

**Specific commit:**
```bash
railway up --commit abc123
```

---

## 🗄️ Database Integration (Future)

### Add Database to Railway

1. **PostgreSQL:**
   ```bash
   railway add --plugin postgresql
   ```

2. **MongoDB:**
   ```bash
   railway add --plugin mongodb
   ```

3. **Redis:**
   ```bash
   railway add --plugin redis
   ```

### Connection String

Railway auto-adds these variables:
- `DATABASE_URL` (PostgreSQL)
- `MONGO_URL` (MongoDB)
- `REDIS_URL` (Redis)

Use in your code:
```javascript
const db = process.env.DATABASE_URL;
```

---

## 💰 Pricing & Limits

### Free Tier (Starter Plan)
- $5 free credit/month
- Enough for small projects
- Sleep after inactivity
- Limited resources

### Developer Plan ($5/month)
- $5 credit included
- Pay for usage
- No sleep
- Better resources

### Pro Plan ($20/month)
- $20 credit included
- Priority support
- Higher limits
- Team features

**Cost Estimation:**
- Small app: $0-5/month
- Medium traffic: $5-15/month
- High traffic: $15+/month

---

## 🔐 Security Best Practices

### 1. Environment Variables
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set it
railway variables set JWT_SECRET=<generated-value>
```

### 2. HTTPS Only
- Railway provides free SSL
- Enabled automatically
- No configuration needed

### 3. CORS Configuration
```bash
railway variables set ALLOWED_ORIGINS=https://yourdomain.com
```

### 4. Rate Limiting
- Already configured in code
- Monitors via logs
- Adjust if needed

---

## 🐛 Troubleshooting

### Build Fails

**Check logs:**
```bash
railway logs --build
```

**Common issues:**
- Node version mismatch → Update `engines` in package.json
- Missing dependencies → Check package.json
- Build command fails → Check railway.json

### App Crashes

**View crash logs:**
```bash
railway logs --filter error
```

**Common causes:**
- Missing environment variables
- Port binding issues
- Memory limits exceeded

**Fix port binding:**
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {...});
```

### Slow Performance

**Optimize:**
1. Enable compression (already done)
2. Use CDN for static assets
3. Optimize database queries
4. Add caching layer

### Database Connection Issues

**Check connection string:**
```bash
railway variables get DATABASE_URL
```

**Test connection:**
```javascript
console.log('DB URL:', process.env.DATABASE_URL);
```

---

## 📈 Scaling

### Vertical Scaling
- Increase memory/CPU in Railway dashboard
- Settings → Resources
- Adjust slider

### Horizontal Scaling
- Available on Pro plan
- Add replicas
- Load balancing automatic

### Performance Tips
1. Enable compression ✅ (already enabled)
2. Use CDN for static files
3. Implement caching
4. Optimize database queries
5. Use connection pooling

---

## 🔄 Rollback

### Rollback to Previous Deployment

**Via Dashboard:**
1. Go to "Deployments"
2. Find previous successful deployment
3. Click "Redeploy"

**Via CLI:**
```bash
railway rollback
```

**Rollback to specific deployment:**
```bash
railway rollback <deployment-id>
```

---

## 📚 Additional Resources

### Documentation
- Railway Docs: https://docs.railway.app
- Node.js on Railway: https://docs.railway.app/languages/nodejs
- Environment Variables: https://docs.railway.app/develop/variables

### Support
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Report bugs
- Email: team@railway.app

### Monitoring Services
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: Performance monitoring
- **DataDog**: Infrastructure monitoring

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible at Railway URL
- [ ] Health check endpoint works (`/health`)
- [ ] Environment variables are set
- [ ] HTTPS is working
- [ ] Custom domain configured (if applicable)
- [ ] CORS is properly configured
- [ ] Rate limiting is working
- [ ] Logs are accessible
- [ ] Monitoring is set up
- [ ] Backups configured (if using database)
- [ ] Team members have access
- [ ] Documentation updated
- [ ] Users notified of deployment

---

## 🎉 Success!

Your InterMappler Ultimate app should now be live on Railway!

**Next Steps:**
1. Share the URL with users
2. Monitor performance
3. Gather feedback
4. Plan next features

**Need Help?**
- Check the troubleshooting section
- Visit Railway Discord
- Contact support

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Railway Version:** Latest

Happy Mapping! 🗺️✨
