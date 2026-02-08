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
if (NODE_ENV !== 'test') {
    app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
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
            thumbnail: '/api/maps/map_001/thumbnail'
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
            thumbnail: '/api/maps/map_002/thumbnail'
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
            thumbnail: '/api/maps/map_003/thumbnail'
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

// Ruta principal - Login (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Para cualquier otra ruta, servir index.html (SPA)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'Endpoint no encontrado',
            path: req.path,
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
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    const statusCode = err.status || 500;
    const message = NODE_ENV === 'production' && statusCode === 500
        ? 'Error interno del servidor'
        : err.message;
    
    res.status(statusCode).json({
        success: false,
        error: 'Error del servidor',
        message,
        ...(NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Intermappler Platform v3.2.1
    =================================
    📍 Entorno: ${NODE_ENV}
    🔗 URL: http://0.0.0.0:${PORT}
    📁 Archivos estáticos: ./public/
    📅 Iniciado: ${new Date().toLocaleString()}
    💾 Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
    =================================
    
    📚 Rutas principales:
    • GET  /                    → Login (index.html)
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