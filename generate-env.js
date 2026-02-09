const fs = require('fs');
const crypto = require('crypto');

console.log('🔧 Generating secure .env file...\n');

const envContent = `# INTERMAPPLER v8.0 - Environment Configuration
# NEVER COMMIT THIS FILE TO VERSION CONTROL!

# Server Configuration
PORT=3000
NODE_ENV=development

# Security Configuration
IP_WHITELIST_MODE=development  # development | strict | production
ALLOWED_IPS=127.0.0.1,localhost

# Production Configuration (uncomment for production)
# IP_WHITELIST_MODE=production
# ALLOWED_IPS=YOUR_PUBLIC_IP_HERE,YOUR_OTHER_IP_HERE

# Security Tokens (generate your own)
SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}
API_KEY=${crypto.randomBytes(16).toString('hex')}

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Application
APP_NAME=INTERMAPPLER
APP_VERSION=8.0.0
`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file generated successfully');
console.log('\n⚠️  IMPORTANT: Update ALLOWED_IPS with your actual IP addresses');
console.log('   Run: npm run myip');