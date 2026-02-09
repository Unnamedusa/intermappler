const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIGURACIÓN: TU IP Y PUERTO ===
const YOUR_IP_ADDRESS = process.env.YOUR_IP || 'TU_IP_PUBLICA_AQUI';
const ALLOW_LOCALHOST = true;

// Lista de IPs permitidas
const ALLOWED_IPS = new Set([
  YOUR_IP_ADDRESS,
  'localhost',
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1'
]);

// Middleware para verificar IP personalizada
const personalIpWhitelist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  let cleanIP = clientIP;
  if (clientIP.startsWith('::ffff:')) {
    cleanIP = clientIP.replace('::ffff:', '');
  }
  
  if (ALLOWED_IPS.has(cleanIP) || ALLOWED_IPS.has(clientIP)) {
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
          body { font-family: 'Segoe UI', sans-serif; background: #0a1929; color: #e6f7ff; 
                 display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .container { text-align: center; padding: 40px; background: rgba(13, 27, 42, 0.95); 
                      border: 2px solid #2d4a6e; border-radius: 16px; max-width: 600px; }
          h1 { color: #ff6b6b; margin-bottom: 20px; }
          .ip-display { background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 8px; 
                       margin: 20px 0; font-family: monospace; border: 1px solid #ff6b6b; }
          .instructions { background: rgba(26, 115, 232, 0.1); padding: 15px; border-radius: 8px; 
                         margin-top: 20px; text-align: left; border: 1px solid #1a73e8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="color: #ffd600; font-size: 48px; margin-bottom: 20px;">🔒</div>
          <h1>ACCESO RESTRINGIDO</h1>
          <p>Solo IPs autorizadas pueden acceder al sistema.</p>
          
          <div class="ip-display">Tu IP: ${cleanIP}</div>
          
          <div class="instructions">
            <p><strong>Para acceder:</strong></p>
            <ol>
              <li>Usa tu IP autorizada: <strong>${YOUR_IP_ADDRESS}</strong></li>
              <li>Accede desde: <code>http://${YOUR_IP_ADDRESS}:${PORT}</code></li>
              <li>O usa localhost: <code>http://localhost:${PORT}</code></li>
            </ol>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            <strong>Sistema: INTERMAPPLER v8.0</strong><br>
            Hora: ${new Date().toLocaleString()}
          </p>
        </div>
      </body>
      </html>
    `);
  }
};

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP'
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP para HTA
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
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));

// Configuración CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes(YOUR_IP_ADDRESS)) {
      callback(null, true);
    } else {
      callback(new Error(`Acceso no permitido desde ${origin}`));
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Otros middlewares
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(morgan(':date[iso] :method :url :status :response-time ms - :remote-addr'));

// Aplicar IP whitelist personalizada
app.use(personalIpWhitelist);

// Aplicar rate limiting
app.use(limiter);

// Crear directorio public si no existe
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Servir archivos estáticos
app.use(express.static('public', {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.hta')) {
      res.setHeader('Content-Type', 'application/hta');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Guardar el archivo HTA en public/
const saveHTAFile = () => {
  const htaContent = `<!DOCTYPE html>
<HTML>
<HEAD>
<HTA:APPLICATION 
    ID="INTERMAPPLERv8"
    APPLICATIONNAME="INTERMAPPLER v8.0 - Persistent Plugin Platform"
    BORDER="thick"
    BORDERSTYLE="normal"
    CAPTION="yes"
    MAXIMIZEBUTTON="yes"
    MINIMIZEBUTTON="yes"
    SHOWINTASKBAR="yes"
    SINGLEINSTANCE="yes"
    SYSMENU="yes"
    WINDOWSTATE="maximize"
    INNERBORDER="no"
    SCROLL="no"
/>

<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://cdnjs.cloudflare.com https://unpkg.com https://*.tile.openstreetmap.org https://server.arcgisonline.com https://*.tile.opentopomap.org; img-src * data: blob:;">
<title>INTERMAPPLER v8.0 - Advanced Geospatial Intelligence Platform</title>

<!-- External Libraries -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

<style>
/* ===== INTERMAPPLER v8.0 - GEOSPATIAL INTELLIGENCE PLATFORM ===== */

/* ============================================
   1. CSS CUSTOM PROPERTIES (VARIABLES)
   ============================================ */
:root {
    /* Color Palette - Geopolitical */
    --usa-blue: #1a237e;
    --russia-red: #c62828;
    --china-red: #d32f2f;
    --eu-blue: #0d47a1;
    --nato-blue: #1565c0;
    --neutral-gray: #546e7a;
    --threat-orange: #ff6f00;
    --high-threat-red: #b71c1c;
    --safe-green: #2e7d32;
    --warning-yellow: #ffd600;
    --civil-blue: #2196f3;
    --weather-blue: #03a9f4;
    --meteorology-purple: #7b1fa2;
    
    /* Plugin Colors */
    --plugin-java: #f89820;
    --plugin-python: #3776ab;
    --plugin-nodejs: #68a063;
    --plugin-js: #f7df1e;
    --plugin-cpp: #00599c;
    --plugin-rust: #dea584;
    
    /* Interface Theme */
    --dark-bg: #0a1929;
    --panel-dark: #132f4c;
    --panel-light: #ffffff;
    --text-dark: #e6f7ff;
    --text-light: #1a202c;
    --border-dark: #2d4a6e;
    --border-light: #e2e8f0;
    --primary-color: #1a73e8;
    --secondary-color: #0d47a1;
    --overlay-dark: rgba(13, 27, 42, 0.95);
    
    /* Z-Index Layering System */
    --z-base: 1;
    --z-map: 10;
    --z-sidebar: 100;
    --z-topbar: 200;
    --z-panels: 300;
    --z-modals: 400;
    --z-notifications: 500;
    --z-tooltips: 600;
    --z-plugin: 700;
    
    /* Spacing System */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    
    /* Shadows */
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.25);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.35);
    --shadow-xl: 0 15px 50px rgba(0, 0, 0, 0.5);
}

/* ============================================
   2. RESET & BASE STYLES
   ============================================ */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', system-ui, -apple-system, 'Roboto', sans-serif;
    background: linear-gradient(135deg, var(--dark-bg) 0%, #071421 100%);
    color: var(--text-dark);
    height: 100vh;
    overflow: hidden;
    line-height: 1.6;
}

/* ============================================
   3. MAIN LAYOUT - FIXED POSITIONING
   ============================================ */
.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    position: relative;
    z-index: var(--z-base);
}

/* ============================================
   4. TOP BAR - FIXED POSITION
   ============================================ */
.top-bar {
    height: 60px;
    background: var(--overlay-dark);
    border-bottom: 2px solid var(--border-dark);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-lg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: var(--z-topbar);
    flex-shrink: 0;
}

.map-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.control-btn {
    background: linear-gradient(135deg, var(--nato-blue), var(--primary-color));
    color: white;
    border: none;
    border-radius: var(--radius-md);
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-sm);
}

.control-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4);
}

.time-display {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.time-display > div:first-child {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 18px;
    font-weight: 700;
    color: #8bb5f5;
}

.time-display > div:last-child {
    font-size: 12px;
    opacity: 0.8;
    color: #8bb5f5;
}

/* ============================================
   5. MAIN CONTENT AREA - FLEX LAYOUT
   ============================================ */
.main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
}

/* ============================================
   6. SIDEBAR - FIXED WIDTH
   ============================================ */
.sidebar {
    width: 280px;
    background: var(--overlay-dark);
    border-right: 2px solid var(--border-dark);
    display: flex;
    flex-direction: column;
    box-shadow: 5px 0 25px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: var(--z-sidebar);
    overflow: hidden;
    flex-shrink: 0;
}

.logo-section {
    padding: var(--spacing-lg) var(--spacing-md);
    border-bottom: 2px solid var(--border-dark);
    background: linear-gradient(135deg, 
        rgba(10, 25, 41, 0.9) 0%, 
        rgba(26, 35, 126, 0.2) 100%);
    text-align: center;
}

.logo {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(90deg, var(--nato-blue), var(--plugin-js));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    letter-spacing: 1px;
}

.logo i {
    font-size: 28px;
}

.status-indicator {
    font-size: 11px;
    background: linear-gradient(135deg, var(--safe-green), #4caf50);
    color: white;
    padding: 4px 10px;
    border-radius: 15px;
    margin-top: var(--spacing-sm);
    display: inline-block;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(0.98); }
}

.sidebar-nav {
    flex: 1;
    padding: var(--spacing-md) 0;
    overflow-y: auto;
    overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar {
    width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
}

.sidebar-nav::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 3px;
}

.nav-section {
    margin-bottom: var(--spacing-lg);
}

.section-title {
    padding: 8px 16px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #8bb5f5;
    font-weight: 600;
    opacity: 0.8;
}

.nav-item {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: 4px solid transparent;
    background: transparent;
    margin: 2px 0;
    user-select: none;
}

.nav-item:hover {
    background: rgba(26, 115, 232, 0.15);
    padding-left: 20px;
    border-left-color: rgba(26, 115, 232, 0.5);
}

.nav-item.active {
    background: rgba(26, 115, 232, 0.25);
    border-left-color: var(--primary-color);
}

.nav-item i {
    width: 20px;
    text-align: center;
    font-size: 16px;
    transition: transform 0.3s ease;
}

.nav-item:hover i {
    transform: scale(1.1);
}

.nav-item span {
    font-size: 13px;
    font-weight: 500;
}

/* ============================================
   7. MAP CONTAINER - FLEXIBLE AREA
   ============================================ */
.map-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    z-index: var(--z-map);
}

#map {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

/* ============================================
   8. PLUGIN SYSTEM STYLES
   ============================================ */
.plugin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
    max-height: 400px;
    overflow-y: auto;
    padding: var(--spacing-sm);
}

.plugin-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-dark);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
}

.plugin-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.plugin-card.running {
    border-color: var(--safe-green);
    background: rgba(46, 125, 50, 0.1);
}

.plugin-card.error {
    border-color: var(--high-threat-red);
    background: rgba(183, 28, 28, 0.1);
}

.plugin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
}

.plugin-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: white;
}

.plugin-icon.java { background: var(--plugin-java); }
.plugin-icon.python { background: var(--plugin-python); }
.plugin-icon.nodejs { background: var(--plugin-nodejs); }
.plugin-icon.javascript { background: var(--plugin-js); }
.plugin-icon.cpp { background: var(--plugin-cpp); }

.plugin-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.plugin-action-btn {
    background: none;
    border: none;
    color: var(--text-dark);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    font-size: 12px;
}

.plugin-action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.plugin-meta {
    font-size: 10px;
    opacity: 0.7;
    margin-top: var(--spacing-xs);
}

.plugin-desc {
    font-size: 12px;
    margin-top: var(--spacing-sm);
    opacity: 0.9;
    line-height: 1.4;
}

.plugin-status {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.plugin-status.running { background: var(--safe-green); }
.plugin-status.stopped { background: var(--neutral-gray); }
.plugin-status.error { background: var(--high-threat-red); }

.plugin-console {
    background: rgba(0, 0, 0, 0.8);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    margin-top: var(--spacing-md);
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 11px;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.plugin-output-line {
    margin-bottom: 2px;
    line-height: 1.3;
}

.plugin-output-line.stdout { color: #00ff00; }
.plugin-output-line.stderr { color: #ff6b6b; }
.plugin-output-line.info { color: #4ecdc4; }
.plugin-output-line.error { color: #ff6b6b; }

/* ============================================
   9. FLOATING PANELS - POSITIONED OVER MAP
   ============================================ */
.floating-panel {
    position: absolute;
    background: var(--overlay-dark);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-dark);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    box-shadow: var(--shadow-xl);
    z-index: var(--z-panels);
    animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 80vh;
    overflow-y: auto;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid rgba(0, 180, 216, 0.3);
}

.panel-title {
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(90deg, var(--primary-color), var(--plugin-js));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 8px;
}

.close-panel {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.close-panel:hover {
    background: rgba(255, 59, 48, 0.8);
    transform: rotate(90deg);
}

/* Panel positioning utilities */
.panel-top-left { top: 80px; left: 300px; }
.panel-top-right { top: 80px; right: 20px; }
.panel-bottom-left { bottom: 20px; left: 300px; }
.panel-bottom-right { bottom: 20px; right: 20px; }
.panel-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* ============================================
   10. NOTIFICATION SYSTEM
   ============================================ */
.notification {
    position: fixed;
    top: 70px;
    right: 20px;
    min-width: 300px;
    max-width: 400px;
    background: var(--overlay-dark);
    border: 1px solid var(--border-dark);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-xl);
    z-index: var(--z-notifications);
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
}

.notification.show {
    opacity: 1;
    transform: translateX(0);
}

.notification.success {
    border-left: 4px solid var(--safe-green);
}

.notification.warning {
    border-left: 4px solid var(--warning-yellow);
}

.notification.error {
    border-left: 4px solid var(--high-threat-red);
}

.notification.info {
    border-left: 4px solid var(--primary-color);
}

/* ============================================
   11. FORM ELEMENTS
   ============================================ */
input[type="text"],
input[type="number"],
input[type="password"],
textarea,
select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-dark);
    border-radius: var(--radius-md);
    padding: 8px 12px;
    color: var(--text-dark);
    font-size: 13px;
    width: 100%;
    transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
input[type="password"]:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: var(--primary-color);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.15);
}

.input-group {
    margin-bottom: var(--spacing-md);
}

.input-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: 12px;
    font-weight: 600;
    color: #8bb5f5;
}

/* ============================================
   12. BUTTONS
   ============================================ */
.btn {
    padding: 8px 16px;
    border: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid var(--border-dark);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
    background: linear-gradient(135deg, var(--high-threat-red), #d32f2f);
    color: white;
}

.btn-danger:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(183, 28, 28, 0.4);
}

/* ============================================
   13. UTILITY CLASSES
   ============================================ */
.hidden { display: none !important; }
.visible { display: block !important; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.text-center { text-align: center; }
.text-right { text-align: right; }
.fw-bold { font-weight: 700; }
.fw-semibold { font-weight: 600; }
.opacity-80 { opacity: 0.8; }

/* ============================================
   14. RESPONSIVE DESIGN
   ============================================ */
@media (max-width: 1200px) {
    .sidebar {
        width: 250px;
    }
    
    .panel-top-left {
        left: 270px;
    }
    
    .panel-bottom-left {
        left: 270px;
    }
}

@media (max-width: 992px) {
    .sidebar {
        position: fixed;
        left: -280px;
        top: 60px;
        height: calc(100vh - 60px);
        z-index: var(--z-modals);
        transition: left 0.3s ease;
    }
    
    .sidebar.mobile-open {
        left: 0;
    }
    
    .panel-top-left {
        left: 20px;
    }
    
    .panel-bottom-left {
        left: 20px;
    }
    
    .floating-panel {
        max-width: 90vw;
    }
}

@media (max-width: 768px) {
    .top-bar {
        padding: 0 var(--spacing-md);
    }
    
    .map-controls {
        gap: var(--spacing-sm);
    }
    
    .control-btn {
        padding: 6px 12px;
        font-size: 12px;
    }
    
    .time-display > div:first-child {
        font-size: 16px;
    }
}
</style>
</HEAD>

<BODY>
<!-- App Container -->
<div class="app-container">
    
    <!-- TOP BAR - Fixed Position -->
    <header class="top-bar">
        <div class="map-controls">
            <button class="control-btn" onclick="setMapType('satellite')">
                <i class="fas fa-satellite"></i>
                Satellite
            </button>
            <button class="control-btn" onclick="setMapType('terrain')">
                <i class="fas fa-mountain"></i>
                Terrain
            </button>
            <button class="control-btn" onclick="setMapType('street')">
                <i class="fas fa-map"></i>
                Street
            </button>
            <button class="control-btn" onclick="clearAllLayers()">
                <i class="fas fa-eraser"></i>
                Clear Layers
            </button>
            <button class="control-btn" onclick="exportPlugins()">
                <i class="fas fa-download"></i>
                Export Plugins
            </button>
        </div>
        
        <div class="time-display">
            <div id="currentTime">--:--:-- UTC</div>
            <div id="systemInfoDisplay">System Ready</div>
        </div>
    </header>
    
    <!-- MAIN CONTENT - Flex Layout -->
    <main class="main-content">
        
        <!-- SIDEBAR - Fixed Width -->
        <aside class="sidebar" id="sidebar">
            <div class="logo-section">
                <div class="logo">
                    <i class="fas fa-globe-americas"></i>
                    <span>INTERMAPPLER</span>
                </div>
                <div class="status-indicator">
                    <span id="statusText">SYSTEM OPERATIONAL</span>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <!-- Geospatial Analysis -->
                <div class="nav-section">
                    <div class="section-title">Geospatial Analysis</div>
                    <div class="nav-item active" onclick="showMilitaryLayer()">
                        <i class="fas fa-crosshairs"></i>
                        <span>Target Analysis</span>
                    </div>
                    <div class="nav-item" onclick="showThreatAnalysis()">
                        <i class="fas fa-radar"></i>
                        <span>Radar Coverage</span>
                    </div>
                    <div class="nav-item" onclick="showWeatherLayer()">
                        <i class="fas fa-cloud-sun-rain"></i>
                        <span>Weather Patterns</span>
                    </div>
                </div>
                
                <!-- Plugin Management -->
                <div class="nav-section">
                    <div class="section-title">Plugin System</div>
                    <div class="nav-item" onclick="showPluginManager()">
                        <i class="fas fa-puzzle-piece"></i>
                        <span>Plugin Manager</span>
                    </div>
                    <div class="nav-item" onclick="createBasePlugin()">
                        <i class="fas fa-plus-circle"></i>
                        <span>Create Base Plugin</span>
                    </div>
                    <div class="nav-item" onclick="loadDefaultPlugins()">
                        <i class="fas fa-box-open"></i>
                        <span>Load Defaults</span>
                    </div>
                </div>
                
                <!-- Data Layers -->
                <div class="nav-section">
                    <div class="section-title">Data Layers</div>
                    <div class="nav-item" onclick="toggleSatelliteLayer()">
                        <i class="fas fa-satellite-dish"></i>
                        <span>Satellite Imagery</span>
                    </div>
                    <div class="nav-item" onclick="toggleTerrainLayer()">
                        <i class="fas fa-mountain"></i>
                        <span>Terrain Elevation</span>
                    </div>
                    <div class="nav-item" onclick="toggleInfrastructureLayer()">
                        <i class="fas fa-road"></i>
                        <span>Infrastructure</span>
                    </div>
                </div>
                
                <!-- System Tools -->
                <div class="nav-section">
                    <div class="section-title">System Tools</div>
                    <div class="nav-item" onclick="showSystemInfo()">
                        <i class="fas fa-info-circle"></i>
                        <span>System Info</span>
                    </div>
                    <div class="nav-item" onclick="backupSystem()">
                        <i class="fas fa-save"></i>
                        <span>Backup System</span>
                    </div>
                    <div class="nav-item" onclick="toggleFullscreen()">
                        <i class="fas fa-expand"></i>
                        <span>Fullscreen</span>
                    </div>
                </div>
            </nav>
        </aside>
        
        <!-- MAP CONTAINER - Flexible Area -->
        <div class="map-container">
            <div id="map"></div>
        </div>
        
    </main>
</div>

<!-- External Scripts -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
// ===== INTERMAPPLER v8.0 - PERSISTENT PLUGIN PLATFORM =====

// Global Variables
let map = null;
let currentMapType = 'street';
let activeLayers = new Map();
let plugins = new Map();
let pluginAPI = null;
let pluginStorage = new Map();

// Supported plugin types
const PLUGIN_TYPES = {
    '.js': { name: 'JavaScript', runtime: 'browser', icon: 'javascript' },
    '.json': { name: 'JSON Config', runtime: 'browser', icon: 'cog' },
    '.geojson': { name: 'GeoJSON', runtime: 'browser', icon: 'globe' },
    '.csv': { name: 'CSV Data', runtime: 'browser', icon: 'table' },
    '.zip': { name: 'Plugin Bundle', runtime: 'multi', icon: 'archive' }
};

// Plugin storage keys
const STORAGE_KEYS = {
    PLUGINS: 'intermapper_plugins_v8',
    PLUGIN_DATA: 'intermapper_plugin_data_',
    SYSTEM: 'intermapper_system_v8'
};

// ===== INITIALIZATION =====
async function initializeApp() {
    console.log('Initializing INTERMAPPLER v8.0...');
    
    try {
        await initializeMap();
        await initializePluginSystem();
        await loadPersistedPlugins();
        startSystemServices();
        
        showNotification(
            'System Ready',
            'INTERMAPPLER v8.0 initialized with persistent plugins',
            'success'
        );
        
        updateStatus('OPERATIONAL');
        
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('System Error', 'Failed to initialize system', 'error');
    }
}

// ===== MAP SYSTEM =====
async function initializeMap() {
    return new Promise((resolve) => {
        try {
            map = L.map('map', {
                center: [40.4168, -3.7038],
                zoom: 10,
                zoomControl: true,
                attributionControl: true,
                maxBounds: [[-85, -180], [85, 180]],
                maxBoundsViscosity: 1.0
            });
            
            setMapType('street');
            
            L.control.scale({
                imperial: false,
                metric: true
            }).addTo(map);
            
            L.control.layers(null, null, {
                collapsed: false,
                position: 'bottomright'
            }).addTo(map);
            
            resolve();
            
        } catch (error) {
            console.error('Map initialization error:', error);
            showNotification('Map Error', 'Failed to initialize map', 'error');
            resolve();
        }
    });
}

function setMapType(type) {
    if (!map) return;
    
    if (map.baseLayer) {
        map.removeLayer(map.baseLayer);
    }
    
    let tileUrl, options;
    
    switch(type) {
        case 'satellite':
            tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            options = {
                attribution: 'Esri World Imagery',
                maxZoom: 19,
                noWrap: true
            };
            break;
            
        case 'terrain':
            tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
            options = {
                attribution: 'OpenTopoMap',
                maxZoom: 17,
                noWrap: true
            };
            break;
            
        case 'street':
        default:
            tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            options = {
                attribution: 'OpenStreetMap',
                maxZoom: 19,
                noWrap: true
            };
            break;
    }
    
    map.baseLayer = L.tileLayer(tileUrl, options).addTo(map);
    currentMapType = type;
    
    showNotification('Map View', \`Switched to \${type} view\`, 'info');
}

function clearAllLayers() {
    activeLayers.forEach((layer, id) => {
        if (layer && layer !== map.baseLayer) {
            map.removeLayer(layer);
            activeLayers.delete(id);
        }
    });
    
    showNotification('Map Cleared', 'All overlay layers removed', 'info');
}

// ===== PLUGIN SYSTEM =====
async function initializePluginSystem() {
    console.log('Initializing plugin system...');
    pluginAPI = createPluginAPI();
    await loadDefaultPlugins();
}

function createPluginAPI() {
    return {
        map: {
            addMarker: (lat, lng, options = {}) => {
                const marker = L.marker([lat, lng], options).addTo(map);
                const id = \`marker_\${Date.now()}\`;
                activeLayers.set(id, marker);
                return { id, remove: () => map.removeLayer(marker) };
            },
            
            addLayer: (url, options = {}) => {
                const layer = L.tileLayer(url, options).addTo(map);
                const id = \`layer_\${Date.now()}\`;
                activeLayers.set(id, layer);
                return { id, remove: () => map.removeLayer(layer) };
            },
            
            getCenter: () => map.getCenter(),
            getZoom: () => map.getZoom(),
            
            addGeoJSON: (geojson, options = {}) => {
                const layer = L.geoJSON(geojson, options).addTo(map);
                const id = \`geojson_\${Date.now()}\`;
                activeLayers.set(id, layer);
                return { id, remove: () => map.removeLayer(layer) };
            }
        },
        
        ui: {
            showNotification: (title, message, type = 'info') => {
                showNotification(title, message, type);
            },
            
            createPanel: (title, content, position = 'top-right') => {
                return createPluginPanel(title, content, position);
            }
        },
        
        data: {
            get: (key) => pluginStorage.get(key),
            
            set: (key, value) => {
                pluginStorage.set(key, value);
                savePluginData(key, value);
            },
            
            fetch: async (url, options = {}) => {
                try {
                    const response = await fetch(url, options);
                    return await response.json();
                } catch (error) {
                    throw new Error(\`Fetch failed: \${error.message}\`);
                }
            }
        },
        
        plugin: {
            register: (config) => registerPlugin(config),
            getConfig: (pluginId) => plugins.get(pluginId)
        }
    };
}

// ===== PLUGIN MANAGEMENT =====
async function loadPersistedPlugins() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.PLUGINS);
        if (saved) {
            const pluginData = JSON.parse(saved);
            
            for (const [id, data] of Object.entries(pluginData)) {
                try {
                    const plugin = {
                        id,
                        name: data.name,
                        type: data.type,
                        code: data.code,
                        config: data.config || {},
                        enabled: data.enabled || false,
                        status: 'stopped',
                        lastRun: data.lastRun ? new Date(data.lastRun) : null,
                        outputs: data.outputs || [],
                        metadata: data.metadata || {}
                    };
                    
                    plugins.set(id, plugin);
                    
                    const pluginDataKey = \`\${STORAGE_KEYS.PLUGIN_DATA}\${id}\`;
                    const storedData = localStorage.getItem(pluginDataKey);
                    if (storedData) {
                        pluginStorage.set(id, JSON.parse(storedData));
                    }
                    
                    if (plugin.enabled) {
                        setTimeout(() => startPlugin(id), 100);
                    }
                    
                } catch (error) {
                    console.error(\`Error loading plugin \${id}:\`, error);
                }
            }
            
            console.log(\`Loaded \${plugins.size} persisted plugins\`);
        }
    } catch (error) {
        console.error('Error loading persisted plugins:', error);
    }
}

function savePluginsToStorage() {
    try {
        const pluginData = {};
        
        plugins.forEach((plugin, id) => {
            pluginData[id] = {
                name: plugin.name,
                type: plugin.type,
                code: plugin.code,
                config: plugin.config,
                enabled: plugin.enabled,
                lastRun: plugin.lastRun ? plugin.lastRun.toISOString() : null,
                outputs: plugin.outputs.slice(-50),
                metadata: plugin.metadata
            };
        });
        
        localStorage.setItem(STORAGE_KEYS.PLUGINS, JSON.stringify(pluginData));
        console.log('Plugins saved to storage');
        
    } catch (error) {
        console.error('Error saving plugins:', error);
    }
}

function savePluginData(pluginId, data) {
    try {
        const key = \`\${STORAGE_KEYS.PLUGIN_DATA}\${pluginId}\`;
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving plugin data:', error);
    }
}

async function showPluginManager() {
    const panelHTML = \`
        <div class="floating-panel panel-top-right" id="pluginPanel" style="width: 850px; max-height: 80vh;">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fas fa-puzzle-piece"></i>
                    Plugin Manager
                    <span style="font-size: 12px; opacity: 0.8; margin-left: 10px;">
                        (\${plugins.size} plugins loaded)
                    </span>
                </div>
                <button class="close-panel" onclick="closePanel('pluginPanel')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="panel-content">
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button class="btn btn-primary" onclick="uploadPlugin()">
                        <i class="fas fa-upload"></i>
                        Upload Plugin
                    </button>
                    <button class="btn btn-secondary" onclick="createBasePlugin()">
                        <i class="fas fa-plus"></i>
                        Create Base Plugin
                    </button>
                    <button class="btn btn-secondary" onclick="refreshPlugins()">
                        <i class="fas fa-sync"></i>
                        Refresh
                    </button>
                </div>
                
                <div class="plugin-grid" id="pluginGrid">
                    <!-- Plugins will be loaded here -->
                </div>
                
                <div id="pluginConsole" class="plugin-console" style="margin-top: 20px; display: none;"></div>
            </div>
        </div>
    \`;
    
    const existing = document.getElementById('pluginPanel');
    if (existing) existing.remove();
    
    document.querySelector('.map-container').insertAdjacentHTML('beforeend', panelHTML);
    refreshPluginGrid();
}

function refreshPluginGrid() {
    const grid = document.getElementById('pluginGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (plugins.size === 0) {
        grid.innerHTML = \`
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; opacity: 0.7;">
                <i class="fas fa-puzzle-piece" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>No plugins loaded</h3>
                <p>Upload a plugin or create a base plugin to get started</p>
            </div>
        \`;
        return;
    }
    
    plugins.forEach((plugin, id) => {
        const fileType = plugin.type || '.js';
        const typeInfo = PLUGIN_TYPES[fileType] || { name: 'Unknown', icon: 'question' };
        
        const cardHTML = \`
            <div class="plugin-card \${plugin.enabled ? 'running' : ''}" 
                 onclick="showPluginDetails('\${id}')">
                <div class="plugin-header">
                    <div class="plugin-icon \${typeInfo.icon}">
                        <i class="fas fa-\${typeInfo.icon}"></i>
                    </div>
                    <div class="plugin-actions">
                        <button class="plugin-action-btn" onclick="togglePlugin('\${id}', event)">
                            <i class="fas fa-\${plugin.enabled ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="plugin-action-btn" onclick="deletePlugin('\${id}', event)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h4 style="margin: 8px 0; font-size: 14px;">\${plugin.name}</h4>
                <div class="plugin-desc">\${plugin.metadata.description || 'No description available'}</div>
                <div class="plugin-meta">
                    Type: \${typeInfo.name} | 
                    Status: <span style="color: \${plugin.enabled ? 'var(--safe-green)' : 'var(--neutral-gray)'}">
                        \${plugin.enabled ? 'RUNNING' : 'STOPPED'}
                    </span>
                </div>
                \${plugin.lastRun ? \`
                    <div class="plugin-meta">
                        Last run: \${formatDate(plugin.lastRun)}
                    </div>
                \` : ''}
                <div class="plugin-status \${plugin.enabled ? 'running' : 'stopped'}"></div>
            </div>
        \`;
        
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function uploadPlugin() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = Object.keys(PLUGIN_TYPES).join(',');
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            await processUploadedPlugin(file);
            refreshPluginGrid();
            showNotification('Plugin Uploaded', \`\${file.name} loaded successfully\`, 'success');
        } catch (error) {
            showNotification('Upload Error', error.message, 'error');
        }
    };
    
    input.click();
}

async function processUploadedPlugin(file) {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const typeInfo = PLUGIN_TYPES[extension];
    
    if (!typeInfo) {
        throw new Error(\`Unsupported file type: \${extension}\`);
    }
    
    const pluginId = \`plugin_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    
    const plugin = {
        id: pluginId,
        name: file.name,
        type: extension,
        file: file,
        size: file.size,
        enabled: false,
        status: 'stopped',
        lastRun: null,
        outputs: [],
        metadata: {},
        config: {}
    };
    
    if (extension === '.js' || extension === '.json' || extension === '.geojson' || extension === '.csv') {
        plugin.code = await readFileAsText(file);
        
        if (extension === '.json') {
            try {
                const config = JSON.parse(plugin.code);
                plugin.metadata = {
                    description: config.description || 'No description',
                    version: config.version || '1.0.0',
                    author: config.author || 'Unknown'
                };
                plugin.config = config;
            } catch (e) {
                plugin.metadata.description = 'JSON Data Plugin';
            }
        }
        
    } else if (extension === '.zip') {
        plugin.metadata.description = 'Plugin Bundle';
        plugin.config = { isBundle: true };
    }
    
    plugins.set(pluginId, plugin);
    savePluginsToStorage();
    
    return plugin;
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

async function startPlugin(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    try {
        plugin.enabled = true;
        plugin.status = 'running';
        plugin.lastRun = new Date();
        
        let result;
        switch (plugin.type) {
            case '.js':
                result = await executeJavaScriptPlugin(plugin);
                break;
            case '.json':
                result = await executeJSONPlugin(plugin);
                break;
            case '.geojson':
                result = await executeGeoJSONPlugin(plugin);
                break;
            case '.csv':
                result = await executeCSVPlugin(plugin);
                break;
            default:
                result = 'Plugin loaded';
        }
        
        plugin.outputs.push({
            type: 'info',
            message: \`Plugin started successfully: \${result}\`,
            timestamp: new Date()
        });
        
        showNotification('Plugin Started', \`\${plugin.name} is now active\`, 'success');
        
    } catch (error) {
        plugin.enabled = false;
        plugin.status = 'error';
        plugin.outputs.push({
            type: 'error',
            message: \`Startup failed: \${error.message}\`,
            timestamp: new Date()
        });
        
        showNotification('Plugin Error', \`\${plugin.name}: \${error.message}\`, 'error');
    }
    
    savePluginsToStorage();
    refreshPluginGrid();
}

function stopPlugin(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    plugin.enabled = false;
    plugin.status = 'stopped';
    
    plugin.outputs.push({
        type: 'info',
        message: 'Plugin stopped',
        timestamp: new Date()
    });
    
    savePluginsToStorage();
    refreshPluginGrid();
    showNotification('Plugin Stopped', \`\${plugin.name} has been stopped\`, 'info');
}

function togglePlugin(pluginId, event) {
    if (event) event.stopPropagation();
    
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    if (plugin.enabled) {
        stopPlugin(pluginId);
    } else {
        startPlugin(pluginId);
    }
}

function deletePlugin(pluginId, event) {
    if (event) event.stopPropagation();
    
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    if (confirm(\`Delete plugin "\${plugin.name}"? This action cannot be undone.\`)) {
        if (plugin.enabled) {
            stopPlugin(pluginId);
        }
        
        plugins.delete(pluginId);
        localStorage.removeItem(\`\${STORAGE_KEYS.PLUGIN_DATA}\${pluginId}\`);
        
        savePluginsToStorage();
        refreshPluginGrid();
        
        showNotification('Plugin Deleted', \`\${plugin.name} has been removed\`, 'info');
    }
}

function showPluginDetails(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    const panelHTML = \`
        <div class="floating-panel panel-center" id="pluginDetails" style="width: 700px; max-height: 80vh;">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fas fa-info-circle"></i>
                    Plugin Details: \${plugin.name}
                </div>
                <button class="close-panel" onclick="closePanel('pluginDetails')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="panel-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h4 style="margin-bottom: 10px;">Plugin Information</h4>
                        <div style="font-size: 13px;">
                            <div><strong>Type:</strong> \${plugin.type}</div>
                            <div><strong>Size:</strong> \${formatFileSize(plugin.size)}</div>
                            <div><strong>Status:</strong> <span style="color: \${plugin.enabled ? 'var(--safe-green)' : 'var(--neutral-gray)'}">
                                \${plugin.enabled ? 'RUNNING' : 'STOPPED'}
                            </span></div>
                            \${plugin.lastRun ? \`<div><strong>Last run:</strong> \${formatDate(plugin.lastRun)}</div>\` : ''}
                            \${plugin.metadata.version ? \`<div><strong>Version:</strong> \${plugin.metadata.version}</div>\` : ''}
                            \${plugin.metadata.author ? \`<div><strong>Author:</strong> \${plugin.metadata.author}</div>\` : ''}
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 10px;">Actions</h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button class="btn \${plugin.enabled ? 'btn-secondary' : 'btn-primary'}" onclick="togglePlugin('\${pluginId}')">
                                <i class="fas fa-\${plugin.enabled ? 'pause' : 'play'}"></i>
                                \${plugin.enabled ? 'Stop Plugin' : 'Start Plugin'}
                            </button>
                            <button class="btn btn-secondary" onclick="editPlugin('\${pluginId}')">
                                <i class="fas fa-edit"></i>
                                Edit Plugin
                            </button>
                            <button class="btn btn-danger" onclick="deletePlugin('\${pluginId}')">
                                <i class="fas fa-trash"></i>
                                Delete Plugin
                            </button>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 10px;">Description</h4>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                        \${plugin.metadata.description || 'No description available'}
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4 style="margin-bottom: 10px;">Recent Output</h4>
                    <div class="plugin-console" style="max-height: 200px;">
                        \${plugin.outputs.slice(-10).map(output => \`
                            <div class="plugin-output-line \${output.type}">
                                [\${formatTime(output.timestamp)}] \${output.message}
                            </div>
                        \`).join('')}
                    </div>
                </div>
            </div>
        </div>
    \`;
    
    closePanel('pluginDetails');
    document.querySelector('.map-container').insertAdjacentHTML('beforeend', panelHTML);
}

// ===== PLUGIN EXECUTION =====
async function executeJavaScriptPlugin(plugin) {
    try {
        const context = {
            pluginId: plugin.id,
            pluginName: plugin.name,
            api: pluginAPI,
            config: plugin.config,
            log: (message, type = 'info') => {
                plugin.outputs.push({
                    type: type,
                    message: message,
                    timestamp: new Date()
                });
            }
        };
        
        const executeCode = \`
            (function() {
                const plugin = \${JSON.stringify(context)};
                \${plugin.code}
                return window.__pluginResult;
            })();
        \`;
        
        const result = eval(executeCode);
        return result || 'Plugin executed successfully';
        
    } catch (error) {
        throw new Error(\`JavaScript execution error: \${error.message}\`);
    }
}

async function executeJSONPlugin(plugin) {
    try {
        const config = JSON.parse(plugin.code);
        
        if (config.mapLayers) {
            config.mapLayers.forEach(layer => {
                pluginAPI.map.addLayer(layer.url, layer.options);
            });
        }
        
        if (config.markers) {
            config.markers.forEach(marker => {
                pluginAPI.map.addMarker(marker.lat, marker.lng, marker.options);
            });
        }
        
        return 'JSON configuration applied';
        
    } catch (error) {
        throw new Error(\`JSON parsing error: \${error.message}\`);
    }
}

async function executeGeoJSONPlugin(plugin) {
    try {
        const geojson = JSON.parse(plugin.code);
        pluginAPI.map.addGeoJSON(geojson);
        return 'GeoJSON data loaded to map';
        
    } catch (error) {
        throw new Error(\`GeoJSON parsing error: \${error.message}\`);
    }
}

async function executeCSVPlugin(plugin) {
    try {
        const rows = plugin.code.split('\\n');
        const headers = rows[0].split(',');
        
        let count = 0;
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');
            if (cols.length >= 2) {
                const lat = parseFloat(cols[0]);
                const lng = parseFloat(cols[1]);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    const label = cols[2] || \`Point \${i}\`;
                    pluginAPI.map.addMarker(lat, lng, { title: label });
                    count++;
                }
            }
        }
        
        return \`Loaded \${count} data points from CSV\`;
        
    } catch (error) {
        throw new Error(\`CSV processing error: \${error.message}\`);
    }
}

// ===== BASE PLUGIN CREATION =====
function createBasePlugin() {
    const basePluginCode = \`// INTERMAPPLER Base Plugin Template
// This plugin demonstrates the plugin API capabilities

class BasePlugin {
    constructor(api) {
        this.api = api;
        this.name = "Base Plugin";
        this.version = "1.0.0";
        this.markers = [];
    }
    
    async initialize() {
        // Get current map center
        const center = this.api.map.getCenter();
        
        // Add a marker at center
        const marker = this.api.map.addMarker(
            center.lat,
            center.lng,
            {
                title: "Base Plugin Marker",
                draggable: true
            }
        );
        this.markers.push(marker);
        
        // Show notification
        this.api.ui.showNotification(
            "Base Plugin",
            "Plugin initialized successfully!",
            "success"
        );
        
        // Log to plugin console
        this.api.data.set("initialized", new Date().toISOString());
        
        return "Base plugin initialized";
    }
    
    addRandomMarker() {
        const lat = 40.4 + Math.random() * 0.2;
        const lng = -3.7 + Math.random() * 0.2;
        
        const marker = this.api.map.addMarker(lat, lng, {
            title: "Random Point",
            icon: L.divIcon({
                html: '<i class="fas fa-map-marker-alt" style="color: #ff6b6b; font-size: 24px;"></i>',
                className: 'custom-marker'
            })
        });
        
        this.markers.push(marker);
        return marker;
    }
    
    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }
    
    getMarkerCount() {
        return this.markers.length;
    }
}

// Plugin entry point
window.__pluginResult = (function() {
    const plugin = new BasePlugin(plugin);
    return plugin.initialize();
})();\`;

    const pluginId = \`base_plugin_\${Date.now()}\`;
    
    const plugin = {
        id: pluginId,
        name: 'Base Plugin Template',
        type: '.js',
        code: basePluginCode,
        enabled: false,
        status: 'stopped',
        lastRun: null,
        outputs: [],
        metadata: {
            description: 'Example base plugin demonstrating plugin API usage',
            version: '1.0.0',
            author: 'INTERMAPPLER System',
            category: 'Template'
        },
        config: {
            autoStart: false,
            category: 'utility'
        },
        size: basePluginCode.length
    };
    
    plugins.set(pluginId, plugin);
    savePluginsToStorage();
    refreshPluginGrid();
    
    editPlugin(pluginId);
    
    showNotification(
        'Base Plugin Created',
        'A new base plugin template has been created and opened for editing',
        'success'
    );
}

function editPlugin(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    const panelHTML = \`
        <div class="floating-panel panel-center" id="pluginEditor" style="width: 900px; height: 80vh;">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fas fa-edit"></i>
                    Plugin Editor: \${plugin.name}
                </div>
                <button class="close-panel" onclick="closePanel('pluginEditor')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="panel-content" style="display: flex; flex-direction: column; height: calc(100% - 60px);">
                <div style="margin-bottom: 15px;">
                    <input type="text" 
                           id="pluginName" 
                           value="\${plugin.name}" 
                           placeholder="Plugin Name"
                           style="width: 100%;">
                </div>
                
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <label class="input-label">Plugin Code:</label>
                    <textarea id="pluginCode" 
                              style="flex: 1; width: 100%; font-family: 'Consolas', monospace; font-size: 13px;"
                              spellcheck="false">\${plugin.code || ''}</textarea>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary" onclick="savePluginChanges('\${pluginId}')">
                        <i class="fas fa-save"></i>
                        Save Changes
                    </button>
                    <button class="btn btn-secondary" onclick="testPlugin('\${pluginId}')">
                        <i class="fas fa-play"></i>
                        Test Plugin
                    </button>
                    <button class="btn btn-secondary" onclick="closePanel('pluginEditor')">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    \`;
    
    closePanel('pluginEditor');
    document.querySelector('.map-container').insertAdjacentHTML('beforeend', panelHTML);
}

function savePluginChanges(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    const nameInput = document.getElementById('pluginName');
    const codeInput = document.getElementById('pluginCode');
    
    if (!nameInput || !codeInput) return;
    
    plugin.name = nameInput.value || plugin.name;
    plugin.code = codeInput.value;
    plugin.size = plugin.code.length;
    
    savePluginsToStorage();
    refreshPluginGrid();
    closePanel('pluginEditor');
    
    showNotification('Plugin Updated', \`\${plugin.name} has been saved\`, 'success');
}

function testPlugin(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    const codeInput = document.getElementById('pluginCode');
    if (codeInput) {
        plugin.code = codeInput.value;
    }
    
    startPlugin(pluginId);
}

// ===== DEFAULT PLUGINS =====
async function loadDefaultPlugins() {
    if (plugins.size === 0) {
        await createExamplePlugins();
        showNotification(
            'Default Plugins',
            'Example plugins have been loaded',
            'info'
        );
    }
}

async function createExamplePlugins() {
    const weatherPlugin = {
        id: 'example_weather',
        name: 'Weather Overlay',
        type: '.js',
        code: \`// Weather Overlay Plugin
const weatherPlugin = {
    async initialize() {
        // Add weather tile layer
        const layer = plugin.api.map.addLayer(
            'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={apiKey}',
            {
                layer: 'clouds_new',
                apiKey: 'demo',
                attribution: 'Weather data © OpenWeatherMap',
                opacity: 0.7
            }
        );
        
        plugin.api.ui.showNotification(
            'Weather Plugin',
            'Weather overlay activated',
            'info'
        );
        
        return 'Weather plugin initialized';
    }
};

window.__pluginResult = weatherPlugin.initialize();\`,
        enabled: false,
        status: 'stopped',
        metadata: {
            description: 'Adds weather overlay to the map',
            version: '1.0.0',
            author: 'INTERMAPPLER',
            category: 'visualization'
        },
        config: {},
        size: 500
    };
    
    const measurementPlugin = {
        id: 'example_measurement',
        name: 'Measurement Tools',
        type: '.js',
        code: \`// Measurement Tools Plugin
const measurementPlugin = {
    measurements: [],
    
    async initialize() {
        plugin.api.ui.showNotification(
            'Measurement Tools',
            'Right-click on map to measure distance',
            'info'
        );
        
        // Add map click handler
        plugin.api.map.on('contextmenu', this.handleRightClick.bind(this));
        
        return 'Measurement tools ready';
    },
    
    handleRightClick(e) {
        const latlng = e.latlng;
        
        // Add measurement point
        const marker = plugin.api.map.addMarker(
            latlng.lat,
            latlng.lng,
            {
                title: 'Measurement Point',
                draggable: true
            }
        );
        
        this.measurements.push({
            marker: marker,
            position: latlng,
            timestamp: new Date()
        });
        
        plugin.api.ui.showNotification(
            'Measurement',
            \`Point added at \${latlng.lat.toFixed(4)}, \${latlng.lng.toFixed(4)}\`,
            'info'
        );
    }
};

window.__pluginResult = measurementPlugin.initialize();\`,
        enabled: false,
        status: 'stopped',
        metadata: {
            description: 'Adds measurement tools to the map',
            version: '1.0.0',
            author: 'INTERMAPPLER',
            category: 'tools'
        },
        config: {},
        size: 800
    };
    
    plugins.set(weatherPlugin.id, weatherPlugin);
    plugins.set(measurementPlugin.id, measurementPlugin);
    
    savePluginsToStorage();
}

// ===== EXPORT/IMPORT =====
function exportPlugins() {
    try {
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            plugins: Array.from(plugins.values()).map(plugin => ({
                id: plugin.id,
                name: plugin.name,
                type: plugin.type,
                code: plugin.code,
                metadata: plugin.metadata,
                config: plugin.config
            }))
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`intermapper_plugins_\${Date.now()}.json\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Export Complete', 'Plugins exported successfully', 'success');
        
    } catch (error) {
        showNotification('Export Error', 'Failed to export plugins', 'error');
    }
}

// ===== UTILITY FUNCTIONS =====
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = \`notification \${type}\`;
    notification.innerHTML = \`
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-\${getNotificationIcon(type)}" style="font-size: 18px;"></i>
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">\${title}</div>
                <div style="font-size: 12px; opacity: 0.9;">\${message}</div>
            </div>
        </div>
    \`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function closePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => panel.remove(), 300);
    }
}

function formatDate(date) {
    if (!date) return 'Never';
    if (typeof date === 'string') date = new Date(date);
    
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return \`\${Math.floor(diff / 60000)} minutes ago\`;
    if (diff < 86400000) return \`\${Math.floor(diff / 3600000)} hours ago\`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatTime(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateStatus(status) {
    const statusElement = document.getElementById('statusText');
    if (statusElement) {
        statusElement.textContent = status;
    }
}

function startSystemServices() {
    setInterval(updateTime, 1000);
    updateTime();
    
    setInterval(updateSystemInfo, 3000);
    updateSystemInfo();
    
    setInterval(savePluginsToStorage, 30000);
}

function updateTime() {
    const now = new Date();
    const timeString = now.toUTCString().split(' ')[4];
    const element = document.getElementById('currentTime');
    if (element) {
        element.textContent = timeString + ' UTC';
    }
}

function updateSystemInfo() {
    const activePlugins = Array.from(plugins.values()).filter(p => p.enabled).length;
    const totalPlugins = plugins.size;
    
    const element = document.getElementById('systemInfoDisplay');
    if (element) {
        element.textContent = \`Plugins: \${activePlugins}/\${totalPlugins} active\`;
    }
}

function refreshPlugins() {
    refreshPluginGrid();
    showNotification('Plugins Refreshed', 'Plugin list updated', 'info');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            showNotification('Fullscreen Error', 'Could not enter fullscreen mode', 'error');
        });
    } else {
        document.exitFullscreen();
    }
}

function backupSystem() {
    try {
        const backup = {
            version: '8.0',
            timestamp: new Date().toISOString(),
            plugins: Array.from(plugins.values()),
            settings: {}
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`intermapper_backup_\${Date.now()}.json\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Backup Created', 'System backup saved successfully', 'success');
        
    } catch (error) {
        showNotification('Backup Error', 'Failed to create backup', 'error');
    }
}

// ===== MAP LAYER FUNCTIONS =====
function showMilitaryLayer() {
    const bases = [
        { name: 'HQ Command', lat: 40.4168, lng: -3.7038, type: 'command' },
        { name: 'Air Base Alpha', lat: 40.5, lng: -3.8, type: 'airbase' },
        { name: 'Naval Station', lat: 40.3, lng: -3.6, type: 'naval' }
    ];
    
    bases.forEach(base => {
        const icon = L.divIcon({
            html: \`<i class="fas fa-\${getMilitaryIcon(base.type)}" 
                      style="color: var(--usa-blue); font-size: 24px;"></i>\`,
            className: 'custom-marker'
        });
        
        L.marker([base.lat, base.lng], { icon: icon })
            .addTo(map)
            .bindPopup(\`<b>\${base.name}</b><br>Type: \${base.type.toUpperCase()}\`);
    });
    
    showNotification('Military Layer', 'Military bases displayed on map', 'info');
}

function getMilitaryIcon(type) {
    const icons = {
        command: 'flag',
        airbase: 'fighter-jet',
        naval: 'ship',
        default: 'crosshairs'
    };
    return icons[type] || icons.default;
}

function showThreatAnalysis() {
    const threatLayer = L.layerGroup().addTo(map);
    
    const threats = [
        { lat: 40.45, lng: -3.65, radius: 5000, level: 'high' },
        { lat: 40.35, lng: -3.75, radius: 3000, level: 'medium' }
    ];
    
    threats.forEach(threat => {
        L.circle([threat.lat, threat.lng], {
            radius: threat.radius,
            color: threat.level === 'high' ? '#ff0000' : '#ff9900',
            fillColor: threat.level === 'high' ? '#ff0000' : '#ff9900',
            fillOpacity: 0.2,
            weight: 2
        }).addTo(threatLayer)
        .bindPopup(\`<b>Threat Zone</b><br>Level: \${threat.level.toUpperCase()}<br>Radius: \${threat.radius}m\`);
    });
    
    activeLayers.set('threat_analysis', threatLayer);
    showNotification('Threat Analysis', 'Threat zones displayed on map', 'warning');
}

function showWeatherLayer() {
    const weatherLayer = L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={apiKey}', {
        layer: 'clouds_new',
        apiKey: 'demo',
        attribution: 'Weather data © OpenWeatherMap',
        opacity: 0.6,
        maxZoom: 19
    }).addTo(map);
    
    activeLayers.set('weather', weatherLayer);
    showNotification('Weather Layer', 'Weather overlay activated', 'info');
}

function toggleSatelliteLayer() {
    setMapType('satellite');
}

function toggleTerrainLayer() {
    setMapType('terrain');
}

function toggleInfrastructureLayer() {
    const infraLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap',
        opacity: 0.7,
        maxZoom: 19
    }).addTo(map);
    
    if (activeLayers.has('infrastructure')) {
        map.removeLayer(activeLayers.get('infrastructure'));
        activeLayers.delete('infrastructure');
        showNotification('Infrastructure', 'Layer hidden', 'info');
    } else {
        activeLayers.set('infrastructure', infraLayer);
        showNotification('Infrastructure', 'Roads and buildings displayed', 'info');
    }
}

function showSystemInfo() {
    const panelHTML = \`
        <div class="floating-panel panel-center" id="systemInfoPanel" style="width: 600px;">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fas fa-info-circle"></i>
                    System Information
                </div>
                <button class="close-panel" onclick="closePanel('systemInfoPanel')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="panel-content">
                <div style="font-family: monospace; font-size: 13px;">
                    <div class="mb-sm"><strong>Platform:</strong> INTERMAPPLER v8.0</div>
                    <div class="mb-sm"><strong>Environment:</strong> HTA Application</div>
                    <div class="mb-sm"><strong>Map Engine:</strong> Leaflet 1.9.4</div>
                    <div class="mb-sm"><strong>Total Plugins:</strong> \${plugins.size}</div>
                    <div class="mb-sm"><strong>Active Plugins:</strong> \${Array.from(plugins.values()).filter(p => p.enabled).length}</div>
                    <div class="mb-sm"><strong>Active Layers:</strong> \${activeLayers.size}</div>
                    <div class="mb-sm"><strong>Screen:</strong> \${window.screen.width}×\${window.screen.height}</div>
                    <div class="mb-sm"><strong>User Agent:</strong> \${navigator.userAgent}</div>
                    <div class="mb-sm"><strong>Storage:</strong> \${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB used</div>
                </div>
                
                <div style="margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="clearSystemCache()">
                        <i class="fas fa-trash"></i>
                        Clear Cache
                    </button>
                    <button class="btn btn-secondary" onclick="backupSystem()" style="margin-left: 10px;">
                        <i class="fas fa-save"></i>
                        Backup System
                    </button>
                </div>
            </div>
        </div>
    \`;
    
    closePanel('systemInfoPanel');
    document.querySelector('.map-container').insertAdjacentHTML('beforeend', panelHTML);
}

function clearSystemCache() {
    if (confirm('Clear all cached plugin data? This will not delete the plugins themselves.')) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(STORAGE_KEYS.PLUGIN_DATA)) {
                localStorage.removeItem(key);
            }
        }
        
        pluginStorage.clear();
        
        showNotification('Cache Cleared', 'Plugin cache has been cleared', 'success');
    }
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleResize);
}

function handleKeyPress(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    if (event.key === 'Escape') {
        document.querySelectorAll('.floating-panel').forEach(panel => closePanel(panel.id));
    }
    
    if (event.key === 'f' && event.ctrlKey) {
        event.preventDefault();
        toggleFullscreen();
    }
}

function handleBeforeUnload(event) {
    savePluginsToStorage();
}

function handleResize() {
    if (map) {
        map.invalidateSize();
    }
}

// ===== INITIALIZE APPLICATION =====
window.addEventListener('load', () => {
    initializeApp();
    initializeEventListeners();
});

// Additional CSS for custom markers
const style = document.createElement('style');
style.textContent = \`
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    .custom-marker {
        background: transparent !important;
        border: none !important;
    }
    
    .leaflet-control-layers {
        background: var(--overlay-dark) !important;
        color: var(--text-dark) !important;
        border: 1px solid var(--border-dark) !important;
        backdrop-filter: blur(10px) !important;
    }
    
    .leaflet-control-layers label {
        color: var(--text-dark) !important;
    }
    
    .leaflet-control-layers input {
        accent-color: var(--primary-color);
    }
    
    .leaflet-bar {
        background: var(--overlay-dark) !important;
        border: 1px solid var(--border-dark) !important;
    }
    
    .leaflet-bar a {
        background-color: transparent !important;
        color: var(--text-dark) !important;
        border-bottom: 1px solid var(--border-dark) !important;
    }
    
    .leaflet-bar a:hover {
        background-color: rgba(26, 115, 232, 0.2) !important;
    }
    
    .leaflet-control-zoom-in,
    .leaflet-control-zoom-out {
        font-size: 18px !important;
    }
\`;
document.head.appendChild(style);
</script>

</BODY>
</HTML>`;

  fs.writeFileSync('public/intermapper.hta', htaContent);
  console.log('✅ Archivo HTA creado en public/intermapper.hta');
};

// Guardar el archivo HTA al iniciar
saveHTAFile();

// Ruta principal - servir el HTA como descarga
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>INTERMAPPLER v8.0 - Descarga</title>
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
          color: #4ecdc4;
          margin-bottom: 20px;
        }
        .btn {
          display: inline-block;
          padding: 15px 30px;
          background: linear-gradient(135deg, #1a73e8, #0d47a1);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin: 10px;
          font-weight: 600;
          font-size: 16px;
        }
        .btn:hover {
          background: linear-gradient(135deg, #0d47a1, #1a73e8);
        }
        .instructions {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>INTERMAPPLER v8.0</h1>
        <p>Advanced Geospatial Intelligence Platform</p>
        
        <div style="margin: 30px 0;">
          <a href="/intermapper.hta" class="btn" download>
            <i class="fas fa-download"></i> Descargar HTA
          </a>
          <a href="/status" class="btn">
            <i class="fas fa-server"></i> Estado del Sistema
          </a>
        </div>
        
        <div class="instructions">
          <h3>Instrucciones de instalación:</h3>
          <ol>
            <li>Descarga el archivo HTA haciendo clic en el botón arriba</li>
            <li>Guarda el archivo en tu computadora</li>
            <li>Haz doble clic en "intermapper.hta" para ejecutar</li>
            <li>El sistema se ejecutará como una aplicación de Windows</li>
          </ol>
          <p><strong>Nota:</strong> Necesitas Internet para cargar los mapas y librerías.</p>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
          <p>IP del cliente: ${req.ip}</p>
          <p>Sistema protegido por IP - Solo acceso autorizado</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Ruta para descargar el HTA
app.get('/download', (req, res) => {
  res.download('public/intermapper.hta', 'INTERMAPPLER_v8.0.hta');
});

// Ruta para obtener el HTA directamente
app.get('/intermapper.hta', (req, res) => {
  res.download('public/intermapper.hta', 'INTERMAPPLER_v8.0.hta', (err) => {
    if (err) {
      console.error('Error downloading HTA:', err);
      res.status(500).send('Error downloading file');
    }
  });
});

// Ruta de estado
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
    system: 'INTERMAPPLER v8.0 - HTA Application Server',
    hta_file: 'available',
    uptime: process.uptime()
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
        body { font-family: 'Segoe UI', sans-serif; background: #0a1929; color: #e6f7ff; 
               display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { text-align: center; padding: 40px; background: rgba(13, 27, 42, 0.95); 
                    border: 2px solid #2d4a6e; border-radius: 16px; max-width: 600px; }
        h1 { color: #4ecdc4; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404 - Ruta no encontrada</h1>
        <p>La ruta solicitada no existe en este servidor.</p>
        <p><a href="/" style="color: #8bb5f5;">Volver al inicio</a></p>
        <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <p style="font-size: 12px; margin: 5px 0;">IP del cliente: ${req.ip}</p>
          <p style="font-size: 12px; margin: 5px 0;">Ruta solicitada: ${req.url}</p>
          <p style="font-size: 12px; margin: 5px 0;">Hora: ${new Date().toLocaleString()}</p>
        </div>
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

// Función para obtener IP pública
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
    let currentIP = YOUR_IP_ADDRESS;
    if (currentIP === 'TU_IP_PUBLICA_AQUI' && process.env.NODE_ENV !== 'production') {
      try {
        currentIP = await getPublicIP();
        console.log(`🌍 IP pública detectada: ${currentIP}`);
      } catch (error) {
        console.log('⚠️  No se pudo detectar IP pública');
      }
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
      ┌─────────────────────────────────────────────────────────┐
      │                                                         │
      │   🛡️  INTERMAPPLER v8.0 - HTA Application Server       │
      │                                                         │
      │   🔐 MODO RESTRINGIDO: Solo IP Autorizada              │
      │                                                         │
      │   🌐 URL local: http://localhost:${PORT}               │
      │   📍 URL IP:    http://${currentIP}:${PORT}            │
      │                                                         │
      │   📥 Descargar HTA: /download                           │
      │                                                         │
      └─────────────────────────────────────────────────────────┘
      
      📡 IPs Autorizadas:
      ${Array.from(ALLOWED_IPS).map(ip => `      • ${ip}`).join('\n')}
      
      🔐 Características:
      • Solo tu IP permitida (${currentIP})
      • Sistema HTA para ejecución local
      • Plugin system completo
      • Mapas interactivos Leaflet
      
      📊 Estado: OPERACIONAL
      ⏰ Iniciado: ${new Date().toLocaleString()}
      `);
      
      console.log('\n🔗 Rutas de acceso:');
      console.log(`   Principal:    http://localhost:${PORT}`);
      console.log(`   Descarga HTA: http://localhost:${PORT}/download`);
      console.log(`   Estado:       http://localhost:${PORT}/status`);
      console.log(`   HTA directo:  http://localhost:${PORT}/intermapper.hta`);
    });
    
    // Manejar cierre elegante
    process.on('SIGTERM', () => {
      console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });
    
    return { app, server };
    
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

module.exports = { app, startServer };