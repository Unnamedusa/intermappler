const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIGURACIÓN: TU IP Y PUERTO ===
// REEMPLAZA ESTOS VALORES CON TU IP Y PUERTO
const YOUR_IP_ADDRESS = 'TU_IP_PUBLICA_AQUI'; // Ej: '192.168.1.100'
const YOUR_LOCAL_PORT = 3000; // El puerto que usas localmente
const ALLOW_LOCALHOST = true; // Permitir acceso desde localhost

// Lista de IPs permitidas (agrega más si necesitas)
const ALLOWED_IPS = new Set([
  YOUR_IP_ADDRESS,
  '127.0.0.1',
  'localhost',
  '::1',
  '::ffff:127.0.0.1'
]);

// Middleware para verificar IP personalizada
const personalIpWhitelist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Limpiar IP (remover prefijos)
  let cleanIP = clientIP;
  if (clientIP.startsWith('::ffff:')) {
    cleanIP = clientIP.replace('::ffff:', '');
  }
  
  // Verificar IP
  if (ALLOWED_IPS.has(cleanIP) || ALLOWED_IPS.has(clientIP)) {
    console.log(`✅ Acceso permitido desde tu IP: ${cleanIP}`);
    next();
  } else {
    console.log(`🚫 Acceso bloqueado desde IP: ${cleanIP}`);
    
    // Página personalizada de acceso denegado
    res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Acceso Restringido - Solo para IP Autorizada</title>
        <style>
          body {
            font-family: 'Segoe UI', system-ui, sans-serif;
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
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            border: 1px solid #ff6b6b;
            font-size: 14px;
            word-break: break-all;
          }
          .allowed-ip {
            background: rgba(46, 125, 50, 0.1);
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            border: 1px solid #2e7d32;
          }
          .instructions {
            background: rgba(26, 115, 232, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: left;
            border: 1px solid #1a73e8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="warning">🔒</div>
          <h1>ACCESO RESTRINGIDO</h1>
          <p>Este sistema solo está disponible para IPs autorizadas.</p>
          
          <div class="ip-detected">
            <p><strong>Tu IP detectada:</strong></p>
            <div class="ip-display">${cleanIP}</div>
          </div>
          
          <div class="allowed-ips">
            <p><strong>IPs autorizadas:</strong></p>
            ${Array.from(ALLOWED_IPS).map(ip => `
              <div class="allowed-ip">${ip}</div>
            `).join('')}
          </div>
          
          <div class="instructions">
            <p><strong>Para acceder:</strong></p>
            <ol>
              <li>Asegúrate de estar usando tu IP: <strong>${YOUR_IP_ADDRESS}</strong></li>
              <li>Accede desde: <code>http://${YOUR_IP_ADDRESS}:${YOUR_LOCAL_PORT}</code></li>
              <li>O usa localhost: <code>http://localhost:${YOUR_LOCAL_PORT}</code></li>
            </ol>
          </div>
          
          <p><strong>Sistema: INTERMAPPLER v8.0 - Acceso Personal</strong></p>
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

// Configuración CORS estricta - solo tu IP
app.use(cors({
  origin: function(origin, callback) {
    // Solo permitir solicitudes desde tu IP o sin origen (localhost)
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.includes(YOUR_IP_ADDRESS)) {
      callback(null, true);
    } else {
      callback(new Error(`Acceso no permitido desde ${origin}. Solo IP autorizada: ${YOUR_IP_ADDRESS}`));
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
app.use(morgan(':date[iso] :method :url :status :response-time ms - :remote-addr'));

// Aplicar IP whitelist personalizada a todas las rutas
app.use(personalIpWhitelist);

// Aplicar rate limiting
app.use(limiter);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '.'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    // Headers de seguridad adicionales
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Authorized-IP': req.ip
    }
  });
});

// Ruta de verificación de estado
app.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    version: '8.0.0',
    access: 'personal-ip-only',
    authorized_ip: YOUR_IP_ADDRESS,
    allowed_ips: Array.from(ALLOWED_IPS),
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    serverPort: PORT,
    message: 'INTERMAPPLER v8.0 - Acceso Personal Restringido'
  });
});

// Ruta para verificar tu IP actual
app.get('/myip', (req, res) => {
  res.json({
    your_current_ip: req.ip,
    authorized_ip: YOUR_IP_ADDRESS,
    is_authorized: ALLOWED_IPS.has(req.ip.replace('::ffff:', '')),
    access_granted: 'yes',
    timestamp: new Date().toISOString()
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
          font-family: 'Segoe UI', system-ui, sans-serif;
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
        <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
          IP del cliente: ${req.ip}
        </p>
      </div>
    </body>
    </html>
  `);
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.message.includes('Acceso no permitido desde')) {
    return res.status(403).json({
      error: 'Acceso CORS denegado',
      message: err.message,
      authorized_ip: YOUR_IP_ADDRESS,
      your_ip: req.ip
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error en el sistema',
    timestamp: new Date().toISOString()
  });
});

// Función para obtener tu IP pública
function getPublicIP() {
  return new Promise((resolve, reject) => {
    const https = require('https');
    https.get('https://api.ipify.org?format=json', (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data).ip);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Iniciar servidor
async function startServer() {
  try {
    // Obtener IP pública automáticamente si no está configurada
    let currentIP = YOUR_IP_ADDRESS;
    if (currentIP === 'TU_IP_PUBLICA_AQUI') {
      try {
        currentIP = await getPublicIP();
        console.log(`🌍 IP pública detectada: ${currentIP}`);
      } catch (error) {
        console.log('⚠️  No se pudo detectar IP pública. Usando configuración manual.');
      }
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
      ┌─────────────────────────────────────────────────────────┐
      │                                                         │
      │   🛡️  INTERMAPPLER v8.0 - Sistema Personal             │
      │                                                         │
      │   🔐 MODO RESTRINGIDO: Solo IP Autorizada              │
      │                                                         │
      │   🌐 URL local: http://localhost:${PORT}               │
      │   📍 URL IP:    http://${currentIP}:${PORT}            │
      │                                                         │
      │   🚫 Otras IPs: BLOQUEADAS                             │
      │                                                         │
      └─────────────────────────────────────────────────────────┘
      
      📡 IPs Autorizadas:
      ${Array.from(ALLOWED_IPS).map(ip => `      • ${ip}`).join('\n')}
      
      🔐 Características de seguridad:
      • Solo tu IP permitida (${currentIP})
      • Rate limiting activado
      • Headers de seguridad Helmet
      • CORS estrictamente configurado
      • Logging detallado de acceso
      
      📊 Estado del sistema: OPERACIONAL
      ⏰ Iniciado: ${new Date().toLocaleString()}
      `);
      
      // Rutas de acceso
      console.log('\n🔗 Rutas de acceso:');
      console.log(`   Local:    http://localhost:${PORT}`);
      console.log(`   Por IP:   http://${currentIP}:${PORT}`);
      console.log(`   Estado:   http://localhost:${PORT}/status`);
      console.log(`   Tu IP:    http://localhost:${PORT}/myip`);
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
    
    return { app, server };
    
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

// Exportar para testing
module.exports = { app, startServer };