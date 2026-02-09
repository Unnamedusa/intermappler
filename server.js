const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const ip = require('ip');
const geoip = require('geoip-lite');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIGURACIÓN SEGURA DE IPs ===
const IP_WHITELIST_MODE = process.env.IP_WHITELIST_MODE || 'development';

// IPs de desarrollo (nunca publicar)
const DEVELOPMENT_IPS = new Set([
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  'localhost'
]);

// IPs de producción (configurar en .env)
const PRODUCTION_IPS = (process.env.ALLOWED_IPS || '')
  .split(',')
  .filter(ip => ip.trim())
  .map(ip => ip.trim());

// Función para obtener IPs permitidas según el modo
function getAllowedIPs() {
  switch (IP_WHITELIST_MODE) {
    case 'production':
      return new Set([...PRODUCTION_IPS, ...DEVELOPMENT_IPS]);
    case 'strict':
      return new Set(PRODUCTION_IPS);
    case 'development':
    default:
      return new Set([
        ...DEVELOPMENT_IPS,
        ip.address(), // IP local de la máquina
        ...PRODUCTION_IPS
      ]);
  }
}

const ALLOWED_IPS = getAllowedIPs();

// Middleware para verificar IP con logging seguro
const ipWhitelist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const forwardedIP = req.headers['x-forwarded-for'];
  
  let cleanIP = clientIP;
  if (clientIP.startsWith('::ffff:')) {
    cleanIP = clientIP.replace('::ffff:', '');
  }
  
  // Verificar todas las IPs posibles
  const isAllowed = ALLOWED_IPS.has(cleanIP) || 
                    ALLOWED_IPS.has(clientIP) ||
                    (forwardedIP && ALLOWED_IPS.has(forwardedIP.split(',')[0].trim()));
  
  // Logging seguro (sin exponer IPs en producción)
  if (IP_WHITELIST_MODE !== 'production') {
    console.log(`🔍 IP Check: ${cleanIP} - ${isAllowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
  }
  
  if (isAllowed) {
    next();
  } else {
    // Obtener información geográfica (solo para logging)
    const geo = geoip.lookup(cleanIP);
    
    // Respuesta genérica sin exponer información sensible
    res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Access Restricted</title>
        <style>
          body { 
            font-family: 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #0a1929 0%, #071421 100%);
            color: #e6f7ff; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
          }
          .container { 
            text-align: center; 
            padding: 40px; 
            background: rgba(13, 27, 42, 0.95); 
            border: 2px solid #2d4a6e; 
            border-radius: 16px; 
            max-width: 600px; 
          }
          h1 { color: #ff6b6b; margin-bottom: 20px; }
          .warning { 
            background: rgba(255, 107, 107, 0.1); 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border: 1px solid #ff6b6b; 
          }
          .info { 
            background: rgba(26, 115, 232, 0.1); 
            padding: 15px; 
            border-radius: 8px; 
            margin-top: 20px; 
            border: 1px solid #1a73e8; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="color: #ffd600; font-size: 48px; margin-bottom: 20px;">🔒</div>
          <h1>ACCESS RESTRICTED</h1>
          <p>This system is restricted to authorized IP addresses only.</p>
          
          <div class="warning">
            <p><strong>Security Notice:</strong></p>
            <p>Unauthorized access attempts are logged and monitored.</p>
          </div>
          
          <div class="info">
            <p><strong>To Request Access:</strong></p>
            <ul style="text-align: left; margin-left: 20px;">
              <li>Contact system administrator</li>
              <li>Provide your authorized IP address</li>
              <li>Access from approved network locations only</li>
            </ul>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            <strong>System:</strong> INTERMAPPLER v8.0<br>
            <strong>Mode:</strong> ${IP_WHITELIST_MODE.toUpperCase()}<br>
            <strong>Time:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </body>
      </html>
    `);
    
    // Logging seguro del intento de acceso
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: cleanIP,
      forwardedIP: forwardedIP || 'none',
      geo: geo ? `${geo.country}/${geo.city}` : 'unknown',
      path: req.path,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED'
    };
    
    fs.appendFileSync(
      'logs/access.log', 
      JSON.stringify(logEntry) + '\n'
    );
  }
};

// Configuración de rate limiting mejorada
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req, res) => {
    // Límites diferentes según IP
    const clientIP = req.ip.replace('::ffff:', '');
    return DEVELOPMENT_IPS.has(clientIP) ? 500 : 100;
  },
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware de seguridad mejorado
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "https://*.tile.openstreetmap.org", "https://server.arcgisonline.com", "https://*.tile.opentopomap.org"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { 
    maxAge: 31536000, 
    includeSubDomains: true, 
    preload: true 
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));

// Configuración CORS segura
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como desde file:// o HTA)
    if (!origin) {
      return callback(null, true);
    }
    
    // Solo permitir orígenes específicos en producción
    if (IP_WHITELIST_MODE === 'production') {
      const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : [];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // En desarrollo, permitir más flexibilidad
      callback(null, true);
    }
  },
  credentials: false,
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Otros middlewares
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Morgan con formato personalizado
app.use(morgan((tokens, req, res) => {
  const clientIP = req.ip.replace('::ffff:', '');
  const ipDisplay = DEVELOPMENT_IPS.has(clientIP) ? clientIP : '***.***.***.***';
  
  return [
    tokens.date(req, res, 'iso'),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    '-', ipDisplay
  ].join(' ');
}));

// Crear directorios necesarios
const directories = ['public', 'logs', 'backups', 'scripts'];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Aplicar IP whitelist
app.use(ipWhitelist);

// Aplicar rate limiting
app.use(limiter);

// Servir archivos estáticos
app.use(express.static('public', {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.hta')) {
      res.setHeader('Content-Type', 'application/hta');
      res.setHeader('Content-Disposition', 'attachment; filename="INTERMAPPLER_v8.0.hta"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

// Generar archivo HTA dinámicamente
const generateHTAFile = () => {
  try {
    // Leer la plantilla HTA
    let htaTemplate;
    if (fs.existsSync('templates/intermapper-template.hta')) {
      htaTemplate = fs.readFileSync('templates/intermapper-template.hta', 'utf8');
    } else {
      // Template básico si no existe
      htaTemplate = fs.readFileSync('intermapper_full.hta', 'utf8');
    }
    
    // Inyectar variables dinámicas
    const htaContent = htaTemplate
      .replace('{{SERVER_URL}}', `http://${ip.address()}:${PORT}`)
      .replace('{{TIMESTAMP}}', new Date().toISOString())
      .replace('{{VERSION}}', '8.0.0');
    
    fs.writeFileSync('public/intermapper.hta', htaContent);
    console.log('✅ HTA file generated successfully');
    
    // Crear hash del archivo para verificación
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(htaContent).digest('hex');
    fs.writeFileSync('public/intermapper.hta.sha256', hash);
    
  } catch (error) {
    console.error('❌ Error generating HTA file:', error.message);
  }
};

// Generar archivo HTA al iniciar
generateHTAFile();

// Ruta principal - Página de descarga segura
app.get('/', (req, res) => {
  const clientIP = req.ip.replace('::ffff:', '');
  const isLocal = DEVELOPMENT_IPS.has(clientIP);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>INTERMAPPLER v8.0 - Secure Download Portal</title>
      <style>
        body {
          font-family: 'Segoe UI', system-ui, sans-serif;
          background: linear-gradient(135deg, #0a1929 0%, #071421 100%);
          color: #e6f7ff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(13, 27, 42, 0.95);
          border: 2px solid #2d4a6e;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          backdrop-filter: blur(10px);
        }
        h1 {
          background: linear-gradient(90deg, #4ecdc4, #44a08d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .version {
          color: #8bb5f5;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .btn-group {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 30px 0;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          background: linear-gradient(135deg, #1a73e8, #0d47a1);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(26, 115, 232, 0.3);
          background: linear-gradient(135deg, #0d47a1, #1a73e8);
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .security-info {
          background: rgba(255, 107, 107, 0.1);
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          border: 1px solid rgba(255, 107, 107, 0.3);
          text-align: left;
        }
        .system-info {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          opacity: 0.7;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: ${isLocal ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)'};
          color: ${isLocal ? '#4caf50' : '#ff9800'};
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid ${isLocal ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'};
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="font-size: 48px; margin-bottom: 20px;">🗺️</div>
        <h1>INTERMAPPLER v8.0</h1>
        <div class="version">Advanced Geospatial Intelligence Platform</div>
        
        <div class="badge">
          ${isLocal ? '📍 LOCAL ACCESS' : '🌐 REMOTE ACCESS'}
        </div>
        
        <div class="btn-group">
          <a href="/intermapper.hta" class="btn" download>
            <span style="font-size: 20px;">⬇️</span>
            <span>Download HTA Application</span>
          </a>
          <a href="/status" class="btn btn-secondary">
            <span style="font-size: 20px;">📊</span>
            <span>System Status</span>
          </a>
        </div>
        
        <div class="security-info">
          <h3 style="color: #ff6b6b; margin-top: 0;">🔐 Security Notice</h3>
          <ul style="margin-left: 20px;">
            <li>This system is IP-restricted and monitored</li>
            <li>HTA files should only be run on trusted systems</li>
            <li>All access is logged for security purposes</li>
            <li>Keep your IP address confidential</li>
          </ul>
        </div>
        
        <div style="text-align: left; margin: 30px 0;">
          <h3 style="color: #4ecdc4;">📋 Installation Instructions:</h3>
          <ol style="margin-left: 20px;">
            <li><strong>Download</strong> the HTA file using the button above</li>
            <li><strong>Save</strong> the file to a secure location on your computer</li>
            <li><strong>Run</strong> the HTA file by double-clicking it</li>
            <li><strong>Internet connection</strong> is required for maps and libraries</li>
            <li><strong>Windows</strong> with Internet Explorer compatibility required</li>
          </ol>
        </div>
        
        <div class="system-info">
          <p><strong>System Mode:</strong> ${IP_WHITELIST_MODE.toUpperCase()}</p>
          <p><strong>Connection:</strong> ${isLocal ? 'Local Network' : 'Remote Access'}</p>
          <p><strong>Server Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Version:</strong> 8.0.0 - Persistent Plugin Platform</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Ruta de estado del sistema
app.get('/status', (req, res) => {
  const clientIP = req.ip.replace('::ffff:', '');
  const isLocal = DEVELOPMENT_IPS.has(clientIP);
  
  res.json({
    system: {
      name: 'INTERMAPPLER',
      version: '8.0.0',
      status: 'operational',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    security: {
      mode: IP_WHITELIST_MODE,
      ip_restricted: true,
      local_access: isLocal,
      authorized_ips_count: ALLOWED_IPS.size
    },
    server: {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version
    },
    files: {
      hta_available: fs.existsSync('public/intermapper.hta'),
      hta_size: fs.existsSync('public/intermapper.hta') 
        ? `${(fs.statSync('public/intermapper.hta').size / 1024 / 1024).toFixed(2)} MB`
        : 'not available'
    }
  });
});

// Ruta para información de red (solo local)
app.get('/network', (req, res) => {
  const clientIP = req.ip.replace('::ffff:', '');
  
  if (!DEVELOPMENT_IPS.has(clientIP)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Network information is only available locally'
    });
  }
  
  res.json({
    network: {
      server_ip: ip.address(),
      client_ip: clientIP,
      local_network: `${ip.address()}:${PORT}`,
      subnet: ip.subnet('192.168.1.1', '255.255.255.0'),
      allowed_ips_count: ALLOWED_IPS.size
    }
  });
});

// Ruta para descargar logs (solo local)
app.get('/logs', (req, res) => {
  const clientIP = req.ip.replace('::ffff:', '');
  
  if (!DEVELOPMENT_IPS.has(clientIP)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Logs are only available locally'
    });
  }
  
  if (fs.existsSync('logs/access.log')) {
    res.download('logs/access.log', 'access.log');
  } else {
    res.status(404).json({ error: 'No logs available' });
  }
});

// Ruta para verificar HTA
app.get('/verify', (req, res) => {
  if (fs.existsSync('public/intermapper.hta')) {
    const stats = fs.statSync('public/intermapper.hta');
    res.json({
      available: true,
      filename: 'intermapper.hta',
      size: `${(stats.size / 1024).toFixed(2)} KB`,
      created: stats.birthtime,
      modified: stats.mtime,
      download_url: '/intermapper.hta'
    });
  } else {
    res.status(404).json({
      available: false,
      message: 'HTA file not generated yet'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mode: IP_WHITELIST_MODE
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <style>
        body { 
          font-family: 'Segoe UI', sans-serif; 
          background: linear-gradient(135deg, #0a1929 0%, #071421 100%);
          color: #e6f7ff; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0; 
        }
        .container { 
          text-align: center; 
          padding: 40px; 
          background: rgba(13, 27, 42, 0.95); 
          border: 2px solid #2d4a6e; 
          border-radius: 16px; 
          max-width: 600px; 
        }
        h1 { 
          background: linear-gradient(90deg, #4ecdc4, #44a08d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="font-size: 64px; margin-bottom: 20px;">🧭</div>
        <h1>404 - Path Not Found</h1>
        <p>The requested resource could not be found on this server.</p>
        <p style="margin-top: 30px;">
          <a href="/" style="color: #8bb5f5; text-decoration: none; font-weight: 600;">
            ← Return to Home
          </a>
        </p>
        <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <p style="font-size: 12px; margin: 5px 0; opacity: 0.7;">
            <strong>System:</strong> INTERMAPPLER v8.0
          </p>
          <p style="font-size: 12px; margin: 5px 0; opacity: 0.7;">
            <strong>Time:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    ip: req.ip,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  
  // Log error
  const errorLog = {
    timestamp: new Date().toISOString(),
    ip: req.ip.replace('::ffff:', ''),
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  };
  
  fs.appendFileSync(
    'logs/errors.log', 
    JSON.stringify(errorLog) + '\n'
  );
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
async function startServer() {
  try {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 INTERMAPPLER v8.0 - Secure HTA Server              ║
║                                                          ║
║   🔐 Security Mode: ${IP_WHITELIST_MODE.padEnd(14)}     ║
║   🌐 Local Access:  http://localhost:${PORT}            ║
║   📍 Server IP:     http://${ip.address()}:${PORT}      ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║   📊 Available Routes:                                  ║
║   • /              - Download portal                    ║
║   • /status        - System status                      ║
║   • /health        - Health check                       ║
║   • /verify        - HTA verification                   ║
║   • /intermapper.hta - Direct download                  ║
║                                                          ║
║   ${DEVELOPMENT_IPS.has(ip.address()) ? '✅ Running in LOCAL mode' : '🌍 Running in REMOTE mode'}
║                                                          ║
╚══════════════════════════════════════════════════════════╝

📡 Server started at: ${new Date().toLocaleString()}
📈 Mode: ${IP_WHITELIST_MODE}
🔒 IP Restrictions: ${ALLOWED_IPS.size} allowed IPs
📁 HTA Generated: ${fs.existsSync('public/intermapper.hta') ? '✅ Yes' : '❌ No'}
      `);
    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Cerrar otras conexiones aquí si las hubiera
        
        console.log('🛑 Server shutdown complete');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Solo iniciar si se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, getAllowedIPs };