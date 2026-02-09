const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const ip = require('ip');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad - Solo permitir localhost
const ALLOWED_IPS = new Set([
  '127.0.0.1',
  'localhost',
  '::1',
  '::ffff:127.0.0.1'
]);

// Middleware para verificar IP
const ipWhitelist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const cleanIP = ip.isV4Format(clientIP) ? clientIP : clientIP.replace('::ffff:', '');
  
  // Verificar si la IP está permitida
  if (ALLOWED_IPS.has(cleanIP)) {
    console.log(`✅ Acceso permitido desde: ${cleanIP}`);
    next();
  } else {
    console.log(`🚫 Acceso bloqueado desde: ${cleanIP}`);
    res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Acceso Restringido</title>
        <style>
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
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
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
            max-width: 600px;
          }
          h1 {
            color: #ff6b6b;
            margin-bottom: 20px;
          }
          .warning {
            color: #ffd600;
            font-size: 48px;
            margin-bottom: 20px;
          }
          .ip-display {
            background: rgba(255, 107, 107, 0.1);
            padding: 10px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: monospace;
            border: 1px solid #ff6b6b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="warning">⚠️</div>
          <h1>ACCESO RESTRINGIDO</h1>
          <p>Esta aplicación solo está disponible para acceso local.</p>
          <div class="ip-detected">
            <p>IP detectada:</p>
            <div class="ip-display">${cleanIP}</div>
          </div>
          <p>Tu dirección IP no está autorizada para acceder a este sistema.</p>
          <p><strong>Sistema: INTERMAPPLER v8.0 - Acceso Local Only</strong></p>
        </div>
      </body>
      </html>
    `);
  }
};

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP'
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://server.arcgisonline.com", "https://*.tile.opentopomap.org"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'same-origin' },
  xssFilter: true
}));

// Configuración CORS estricta
app.use(cors({
  origin: function(origin, callback) {
    // Solo permitir solicitudes sin origen (localhost/curl) o desde localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Otros middlewares
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));

// Aplicar IP whitelist a todas las rutas
app.use(ipWhitelist);

// Aplicar rate limiting
app.use(limiter);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '.'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
});

// Ruta de verificación de estado (solo localhost)
app.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    version: '8.0.0',
    access: 'localhost-only',
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    message: 'INTERMAPPLER v8.0 - Secure Local Access'
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - No Encontrado</title>
      <style>
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
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
          color: #4ecdc4;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404 - Ruta no encontrada</h1>
        <p>La ruta solicitada no existe en este servidor.</p>
        <p><a href="/" style="color: #8bb5f5;">Volver al inicio</a></p>
      </div>
    </body>
    </html>
  `);
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Acceso CORS denegado',
      message: 'Esta aplicación solo permite acceso desde localhost'
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error en el sistema'
  });
});

// Iniciar servidor
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`
  ┌─────────────────────────────────────────────────────┐
  │                                                     │
  │   🛡️  INTERMAPPLER v8.0 - Sistema Seguro           │
  │                                                     │
  │   ⚠️  MODO RESTRINGIDO: Solo localhost             │
  │                                                     │
  │   🌐 URL local: http://localhost:${PORT}           │
  │   📍 IP local:  http://127.0.0.1:${PORT}           │
  │                                                     │
  │   🚫 Acceso externo: BLOQUEADO                     │
  │                                                     │
  └─────────────────────────────────────────────────────┘
  
  🔐 Características de seguridad:
  • Solo IPs locales permitidas
  • Rate limiting activado
  • Headers de seguridad Helmet
  • CORS estrictamente configurado
  • Logging detallado de acceso
  
  📊 Estado del sistema: OPERACIONAL
  ⏰ Iniciado: ${new Date().toLocaleString()}
  `);
});

// Manejar cierre elegante
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

// Exportar para testing
module.exports = { app, server };