import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuración de variables de entorno
dotenv.config();

// Definir __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middlewares de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: NODE_ENV === 'development' 
        ? ['http://localhost:3000', 'http://localhost:5173']
        : process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: {
        error: 'Demasiadas solicitudes',
        retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// Compresión
app.use(compression());

// Logging
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos desde el directorio actual
app.use(express.static(__dirname, {
    maxAge: NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

// Middleware para variables globales
app.use((req, res, next) => {
    res.locals.appName = 'Intermappler';
    res.locals.appVersion = '3.2.1';
    res.locals.currentYear = new Date().getFullYear();
    res.locals.nodeEnv = NODE_ENV;
    next();
});

// ==================== RUTAS DE API ====================

// Health check para Railway
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'intermappler-web',
        version: '3.2.1',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        node: process.version,
        platform: process.platform
    });
});

// Sistema de autenticación
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Credenciales incompletas',
                message: 'Email y contraseña son requeridos'
            });
        }
        
        // Credenciales de demo
        const demoCredentials = {
            email: 'demo@intermappler.com',
            password: 'demo123'
        };
        
        if (email === demoCredentials.email && password === demoCredentials.password) {
            const userData = {
                id: 1,
                email: email,
                name: 'Usuario Demo',
                role: 'admin',
                permissions: ['map:read', 'map:write', 'layer:create', 'data:export'],
                avatar: null,
                lastLogin: new Date().toISOString()
            };
            
            return res.json({
                success: true,
                message: 'Autenticación exitosa',
                user: userData,
                token: 'demo-token-' + Date.now(),
                redirect: '/dashboard'
            });
        }
        
        res.status(401).json({
            success: false,
            error: 'Credenciales inválidas',
            message: 'Email o contraseña incorrectos. Usa: demo@intermappler.com / demo123'
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Por favor intenta más tarde'
        });
    }
});

// Estado de autenticación
app.get('/api/auth/status', (req, res) => {
    const token = req.headers.authorization;
    
    if (token && token.startsWith('demo-token-')) {
        res.json({
            authenticated: true,
            user: {
                id: 1,
                email: 'demo@intermappler.com',
                name: 'Usuario Demo',
                role: 'admin'
            }
        });
    } else {
        res.json({ 
            authenticated: false,
            message: 'No autenticado'
        });
    }
});

// Sistema de mapeo
app.get('/api/maps', (req, res) => {
    const maps = [
        {
            id: 'map_001',
            name: 'Ciudad Principal - Análisis Urbano',
            description: 'Mapa de densidad poblacional y tráfico',
            type: 'urban',
            layers: 5,
            features: 1245,
            area: '45.8 km²',
            createdAt: '2024-01-10T08:00:00Z',
            updatedAt: '2024-01-15T14:30:00Z',
            thumbnail: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Mapa+Urbano'
        },
        {
            id: 'map_002',
            name: 'Red de Transporte Regional',
            description: 'Optimización de rutas logísticas',
            type: 'transport',
            layers: 8,
            features: 892,
            area: '320.5 km²',
            createdAt: '2024-01-05T10:15:00Z',
            updatedAt: '2024-01-14T09:45:00Z',
            thumbnail: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Transporte'
        },
        {
            id: 'map_003',
            name: 'Análisis Climático - Zona Costera',
            description: 'Predicción de cambios climáticos',
            type: 'environmental',
            layers: 12,
            features: 2103,
            area: '780.2 km²',
            createdAt: '2024-01-01T12:00:00Z',
            updatedAt: '2024-01-13T16:20:00Z',
            thumbnail: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Clima'
        }
    ];
    
    res.json({
        success: true,
        count: maps.length,
        maps,
        pagination: {
            page: 1,
            limit: 10,
            total: maps.length
        }
    });
});

app.get('/api/maps/:id', (req, res) => {
    const { id } = req.params;
    
    const mapDetails = {
        id,
        name: `Mapa Detallado - ${id.toUpperCase()}`,
        description: 'Mapa de ejemplo con datos geoespaciales avanzados de Intermappler',
        metadata: {
            created: '2024-01-01T00:00:00Z',
            updated: new Date().toISOString(),
            author: 'Sistema Intermappler',
            version: '3.2.1'
        },
        view: {
            center: [-34.6037, -58.3816],
            zoom: 12,
            bounds: [[-34.65, -58.45], [-34.55, -58.30]]
        },
        layers: [
            {
                id: 'base_map',
                name: 'Mapa Base',
                type: 'vector',
                source: 'openstreetmap',
                visible: true,
                opacity: 1.0,
                order: 0
            },
            {
                id: 'satellite',
                name: 'Imágenes Satelitales',
                type: 'raster',
                source: 'maxar',
                visible: true,
                opacity: 0.7,
                order: 1
            },
            {
                id: 'points_of_interest',
                name: 'Puntos de Interés',
                type: 'geojson',
                source: 'custom',
                visible: true,
                opacity: 1.0,
                order: 2,
                count: 156
            }
        ],
        statistics: {
            totalFeatures: 1542,
            totalArea: '125.5 km²',
            dataPoints: 12548,
            lastAnalysis: '2024-01-15T08:30:00Z',
            processingTime: '2.4s'
        },
        permissions: {
            canEdit: true,
            canShare: true,
            canExport: true,
            canAnalyze: true
        }
    };
    
    res.json({ 
        success: true, 
        map: mapDetails 
    });
});

// Análisis de mapas
app.post('/api/maps/:id/analyze', (req, res) => {
    const { id } = req.params;
    const { analysisType, parameters = {} } = req.body;
    
    const analysisTypes = {
        'density': 'Análisis de Densidad',
        'cluster': 'Detección de Clusters',
        'route': 'Optimización de Rutas',
        'prediction': 'Predicción de Patrones'
    };
    
    if (!analysisTypes[analysisType]) {
        return res.status(400).json({
            success: false,
            error: 'Tipo de análisis no válido',
            validTypes: Object.keys(analysisTypes)
        });
    }
    
    const analysisId = `analysis_${Date.now()}`;
    
    // Simular procesamiento
    setTimeout(() => {
        res.json({
            success: true,
            analysisId,
            mapId: id,
            type: analysisType,
            typeName: analysisTypes[analysisType],
            status: 'completed',
            completedAt: new Date().toISOString(),
            results: {
                clustersDetected: Math.floor(Math.random() * 50) + 10,
                hotspotsFound: Math.floor(Math.random() * 20) + 5,
                processingTime: (Math.random() * 5 + 1).toFixed(2) + 's',
                confidence: (Math.random() * 30 + 70).toFixed(1) + '%',
                recommendations: [
                    `Optimizar distribución en ${Math.floor(Math.random() * 5) + 3} áreas clave`,
                    'Reducir tiempos de respuesta en zona central',
                    'Aumentar cobertura en áreas periféricas'
                ]
            }
        });
    }, 1500);
});

// Estadísticas del sistema
app.get('/api/system/stats', (req, res) => {
    const stats = {
        platform: {
            name: 'Intermappler',
            version: '3.2.1',
            environment: NODE_ENV,
            status: 'operational',
            uptime: process.uptime(),
            started: new Date(Date.now() - process.uptime() * 1000).toISOString()
        },
        resources: {
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
            },
            node: {
                version: process.version,
                platform: process.platform,
                arch: process.arch
            }
        },
        usage: {
            totalMaps: 3,
            totalAnalyses: 1247,
            activeSessions: Math.floor(Math.random() * 50) + 10,
            dataProcessed: '15.8 TB',
            apiRequests: Math.floor(Math.random() * 10000) + 5000
        },
        services: {
            api: { status: 'online', latency: '12ms' },
            storage: { status: 'online', latency: '45ms' }
        },
        timestamp: new Date().toISOString()
    };
    
    res.json(stats);
});

// Exportar datos
app.post('/api/export', (req, res) => {
    const { format, mapId, layers } = req.body;
    const validFormats = ['geojson', 'kml', 'csv', 'shapefile', 'png', 'pdf'];
    
    if (!validFormats.includes(format)) {
        return res.status(400).json({
            success: false,
            error: 'Formato no soportado',
            supported: validFormats
        });
    }
    
    if (!mapId) {
        return res.status(400).json({
            success: false,
            error: 'Mapa no especificado',
            message: 'El ID del mapa es requerido para exportar'
        });
    }
    
    const exportId = `export_${Date.now()}`;
    const filename = `intermappler_${mapId}_${exportId}.${format}`;
    const fileSize = (Math.random() * 15 + 1).toFixed(2);
    
    res.json({
        success: true,
        exportId,
        filename,
        format: format.toUpperCase(),
        mapId,
        size: `${fileSize} MB`,
        downloadUrl: `/api/exports/${exportId}/download`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
});

// Descargar exportación
app.get('/api/exports/:id/download', (req, res) => {
    const { id } = req.params;
    
    res.json({
        success: true,
        exportId: id,
        status: 'available',
        directDownload: `https://intermappler.s3.amazonaws.com/exports/${id}.zip`,
        message: 'Usa el enlace directDownload para descargar el archivo'
    });
});

// ==================== RUTAS DE LA APLICACIÓN WEB ====================

// Ruta principal - Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dashboard - Intermappler</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    color: #f1f5f9;
                    min-height: 100vh;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #334155;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #60a5fa;
                }
                .logo i { font-size: 2rem; }
                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.5rem;
                    background: #3b82f6;
                    color: white;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: background 0.2s;
                }
                .btn:hover { background: #2563eb; }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-top: 2rem;
                }
                .card {
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    transition: transform 0.2s, border-color 0.2s;
                }
                .card:hover {
                    transform: translateY(-4px);
                    border-color: #60a5fa;
                }
                .card h3 {
                    color: #60a5fa;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-top: 2rem;
                }
                .stat-item {
                    text-align: center;
                    padding: 1rem;
                    background: #0f172a;
                    border-radius: 0.5rem;
                }
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #60a5fa;
                }
                .stat-label {
                    font-size: 0.875rem;
                    color: #94a3b8;
                }
                .api-endpoints {
                    margin-top: 3rem;
                    padding: 2rem;
                    background: #1e293b;
                    border-radius: 1rem;
                    border: 1px solid #334155;
                }
                .api-endpoints h3 {
                    color: #60a5fa;
                    margin-bottom: 1rem;
                }
                .endpoint-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .endpoint-list code {
                    background: #0f172a;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-family: 'Courier New', monospace;
                    border: 1px solid #334155;
                }
                footer {
                    margin-top: 3rem;
                    text-align: center;
                    padding-top: 2rem;
                    border-top: 1px solid #334155;
                    color: #94a3b8;
                    font-size: 0.875rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div class="logo">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>Intermappler Dashboard</span>
                    </div>
                    <div class="user-menu">
                        <span><i class="fas fa-user"></i> Usuario Demo</span>
                        <a href="/" class="btn">
                            <i class="fas fa-sign-out-alt"></i>
                            Cerrar Sesión
                        </a>
                    </div>
                </header>
                
                <main>
                    <h1>Bienvenido a Intermappler</h1>
                    <p style="color: #94a3b8; margin-bottom: 1rem;">
                        Plataforma de mapeo inteligente - Versión 3.2.1
                    </p>
                    
                    <div class="dashboard-grid">
                        <div class="card">
                            <h3><i class="fas fa-map"></i> Mis Mapas</h3>
                            <p>Gestiona tus proyectos de mapeo y análisis geoespacial.</p>
                            <div class="stats">
                                <div class="stat-item">
                                    <div class="stat-value" id="totalMaps">3</div>
                                    <div class="stat-label">Activos</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">12</div>
                                    <div class="stat-label">Capas</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">1.2k</div>
                                    <div class="stat-label">Puntos</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3><i class="fas fa-chart-line"></i> Análisis</h3>
                            <p>Resultados de análisis predictivos y de patrones.</p>
                            <div class="stats">
                                <div class="stat-item">
                                    <div class="stat-value">15</div>
                                    <div class="stat-label">Completados</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">92%</div>
                                    <div class="stat-label">Precisión</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">3</div>
                                    <div class="stat-label">En Proceso</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3><i class="fas fa-database"></i> Sistema</h3>
                            <p>Información sobre recursos y capacidad.</p>
                            <div class="stats">
                                <div class="stat-item">
                                    <div class="stat-value" id="memoryUsage">--</div>
                                    <div class="stat-label">Memoria</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value" id="activeUsers">--</div>
                                    <div class="stat-label">Usuarios</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">99.8%</div>
                                    <div class="stat-label">Uptime</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="api-endpoints">
                        <h3><i class="fas fa-code"></i> API Endpoints Disponibles</h3>
                        <div class="endpoint-list">
                            <code>GET /api/health</code>
                            <code>POST /api/auth/login</code>
                            <code>GET /api/auth/status</code>
                            <code>GET /api/maps</code>
                            <code>GET /api/maps/:id</code>
                            <code>POST /api/maps/:id/analyze</code>
                            <code>GET /api/system/stats</code>
                            <code>POST /api/export</code>
                        </div>
                        <p style="margin-top: 1rem; color: #94a3b8; font-size: 0.875rem;">
                            <i class="fas fa-info-circle"></i> Usa estas rutas para integrar con tu aplicación.
                        </p>
                    </div>
                </main>
                
                <footer>
                    <p>© 2024 Intermappler Technologies - Plataforma de Mapeo Inteligente v3.2.1</p>
                    <p style="margin-top: 0.5rem;">
                        <span id="serverStatus" style="color: #10b981;">
                            <i class="fas fa-circle"></i> Servidor operativo
                        </span>
                        • 
                        <span id="currentTime"></span>
                    </p>
                </footer>
            </div>
            
            <script>
                // Actualizar estadísticas en tiempo real
                async function updateStats() {
                    try {
                        const response = await fetch('/api/system/stats');
                        const data = await response.json();
                        
                        // Actualizar valores en la página
                        document.getElementById('totalMaps').textContent = data.usage.totalMaps;
                        document.getElementById('memoryUsage').textContent = data.resources.memory.used;
                        document.getElementById('activeUsers').textContent = data.usage.activeSessions;
                        
                        // Actualizar estado del servidor
                        const statusEl = document.getElementById('serverStatus');
                        if (data.platform.status === 'operational') {
                            statusEl.innerHTML = '<i class="fas fa-circle" style="color: #10b981;"></i> Servidor operativo';
                            statusEl.style.color = '#10b981';
                        }
                    } catch (error) {
                        console.log('Error actualizando stats:', error);
                        document.getElementById('serverStatus').innerHTML = 
                            '<i class="fas fa-circle" style="color: #ef4444;"></i> Error de conexión';
                        document.getElementById('serverStatus').style.color = '#ef4444';
                    }
                }
                
                // Actualizar hora actual
                function updateTime() {
                    const now = new Date();
                    document.getElementById('currentTime').textContent = 
                        'Hora del servidor: ' + now.toLocaleTimeString('es-ES');
                }
                
                // Actualizar cada 30 segundos
                setInterval(updateStats, 30000);
                setInterval(updateTime, 1000);
                
                // Inicializar
                updateStats();
                updateTime();
            </script>
        </body>
        </html>
    `);
});

// Ruta para servir archivos CSS y JS específicos
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'), {
        headers: {
            'Content-Type': 'text/css'
        }
    });
});

app.get('/js/:file', (req, res) => {
    const { file } = req.params;
    res.sendFile(path.join(__dirname, 'js', file), {
        headers: {
            'Content-Type': 'application/javascript'
        }
    });
});

// Middleware de errores 404 para API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET  /api/health',
            'POST /api/auth/login',
            'GET  /api/auth/status',
            'GET  /api/maps',
            'GET  /api/maps/:id',
            'POST /api/maps/:id/analyze',
            'GET  /api/system/stats',
            'POST /api/export'
        ]
    });
});

// Para archivos HTML, servir página de error personalizada
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Página no encontrada - Intermappler</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body {
                        font-family: system-ui, sans-serif;
                        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                        color: #f1f5f9;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 1rem;
                    }
                    .error-container {
                        text-align: center;
                        max-width: 600px;
                    }
                    h1 {
                        font-size: 6rem;
                        color: #60a5fa;
                        margin: 0;
                    }
                    h2 {
                        margin: 1rem 0;
                        color: #94a3b8;
                    }
                    .back-link {
                        display: inline-block;
                        margin-top: 2rem;
                        padding: 0.75rem 1.5rem;
                        background: #3b82f6;
                        color: white;
                        text-decoration: none;
                        border-radius: 0.5rem;
                        transition: background 0.2s;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                    .back-link:hover {
                        background: #2563eb;
                    }
                    code {
                        background: rgba(0,0,0,0.3);
                        padding: 0.25rem 0.5rem;
                        border-radius: 0.25rem;
                        font-family: 'Courier New', monospace;
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>404</h1>
                    <h2>Página no encontrada</h2>
                    <p>La ruta <code>${req.path}</code> no existe en Intermappler.</p>
                    <a href="/" class="back-link">
                        <i class="fas fa-arrow-left"></i>
                        Volver al inicio
                    </a>
                </div>
            </body>
            </html>
        `);
    } else {
        res.status(404).json({
            success: false,
            error: 'Recurso no encontrado',
            path: req.path,
            timestamp: new Date().toISOString()
        });
    }
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    const statusCode = err.status || 500;
    const message = NODE_ENV === 'production' && statusCode === 500
        ? 'Error interno del servidor'
        : err.message;
    
    if (req.accepts('json')) {
        res.status(statusCode).json({
            success: false,
            error: 'Error del servidor',
            message,
            ...(NODE_ENV === 'development' && { stack: err.stack }),
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(statusCode).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - Intermappler</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body {
                        font-family: system-ui, sans-serif;
                        background: #0f172a;
                        color: #f1f5f9;
                        padding: 2rem;
                        text-align: center;
                    }
                    .error-code {
                        font-size: 4rem;
                        color: #ef4444;
                    }
                    .back-link {
                        display: inline-block;
                        margin-top: 2rem;
                        padding: 0.75rem 1.5rem;
                        background: #3b82f6;
                        color: white;
                        text-decoration: none;
                        border-radius: 0.5rem;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                </style>
            </head>
            <body>
                <div class="error-code">${statusCode}</div>
                <h2>${message}</h2>
                <a href="/" class="back-link">
                    <i class="fas fa-home"></i>
                    Volver al inicio
                </a>
            </body>
            </html>
        `);
    }
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Intermappler Platform v3.2.1
    =================================
    📍 Entorno: ${NODE_ENV}
    🔗 URL: http://0.0.0.0:${PORT}
    🌐 Público: http://localhost:${PORT}
    📅 Iniciado: ${new Date().toLocaleString()}
    💾 Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
    =================================
    
    📚 Rutas principales:
    • GET  /                    → Login
    • GET  /dashboard          → Dashboard
    • POST /api/auth/login     → Autenticación
    • GET  /api/maps           → Lista de mapas
    • GET  /api/health         → Health check
    • GET  /api/system/stats   → Estadísticas
    
    ⚠️  Credenciales de demostración:
    • Email: demo@intermappler.com
    • Contraseña: demo123
    
    ✅ Servidor listo para Railway
    `);
});

// Manejo de cierre limpio
const shutdown = (signal) => {
    console.log(`\n🛑 ${signal} recibido. Cerrando servidor...`);
    server.close(() => {
        console.log('👋 Servidor HTTP cerrado');
        process.exit(0);
    });
    
    setTimeout(() => {
        console.error('⏰ Timeout de cierre forzado');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));