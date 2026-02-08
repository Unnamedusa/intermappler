import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

// Configuración de variables de entorno
dotenv.config();

// Definir __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Crear servidor HTTP para Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: NODE_ENV === 'development' 
            ? ['http://localhost:3000', 'http://localhost:5173']
            : process.env.ALLOWED_ORIGINS?.split(',') || [],
        credentials: true
    }
});

// Configuración de Socket.io
io.on('connection', (socket) => {
    console.log('🔌 Nuevo cliente conectado:', socket.id);
    
    socket.on('join:map', (mapId) => {
        socket.join(`map:${mapId}`);
        console.log(`🗺️ Cliente ${socket.id} se unió al mapa ${mapId}`);
        
        // Notificar a otros en la sala
        socket.to(`map:${mapId}`).emit('user:joined', {
            userId: socket.id,
            timestamp: new Date().toISOString()
        });
    });
    
    socket.on('map:update', (data) => {
        const { mapId, layer, coordinates, action } = data;
        socket.to(`map:${mapId}`).emit('map:sync', {
            ...data,
            userId: socket.id,
            timestamp: new Date().toISOString()
        });
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Cliente desconectado:', socket.id);
    });
});

// Middlewares de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: NODE_ENV === 'development' 
        ? ['http://localhost:3000', 'http://localhost:5173']
        : process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite por IP
    message: {
        error: 'Demasiadas solicitudes desde esta IP',
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

// Configuración de sesiones
app.use(session({
    name: 'intermappler.sid',
    secret: process.env.SESSION_SECRET || 'intermappler-secret-key-prod-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/intermappler',
        ttl: 24 * 60 * 60, // 1 día
        touchAfter: 12 * 3600 // 12 horas
    }),
    cookie: {
        secure: NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 día
        sameSite: 'lax'
    }
}));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

// Middleware personalizado para inyección de variables globales
app.use((req, res, next) => {
    // Variables disponibles en todas las vistas
    res.locals.appName = 'Intermappler';
    res.locals.appVersion = '3.2.1';
    res.locals.currentYear = new Date().getFullYear();
    res.locals.nodeEnv = NODE_ENV;
    res.locals.isAuthenticated = !!req.session.userId;
    next();
});

// Rutas de API
const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '3.2.1',
        environment: NODE_ENV,
        services: {
            database: 'connected', // Aquí iría la verificación real de DB
            redis: 'connected',
            socket: io.engine.clientsCount
        }
    });
});

// Sistema de autenticación
apiRouter.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validaciones básicas
        if (!email || !password) {
            return res.status(400).json({
                error: 'Credenciales incompletas',
                message: 'Email y contraseña son requeridos'
            });
        }
        
        // Aquí iría la lógica real de autenticación con base de datos
        // Por ahora, credenciales de demo
        const demoCredentials = {
            email: 'demo@intermappler.com',
            password: 'demo123'
        };
        
        if (email === demoCredentials.email && password === demoCredentials.password) {
            // Crear sesión
            req.session.userId = 1;
            req.session.userEmail = email;
            req.session.userRole = 'admin';
            
            // Token JWT para API (en producción)
            const userData = {
                id: 1,
                email: email,
                name: 'Usuario Demo',
                role: 'admin',
                permissions: ['map:read', 'map:write', 'layer:create', 'data:export']
            };
            
            return res.json({
                success: true,
                message: 'Autenticación exitosa',
                user: userData,
                session: req.session.id,
                redirect: '/dashboard'
            });
        }
        
        res.status(401).json({
            error: 'Credenciales inválidas',
            message: 'Email o contraseña incorrectos'
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'Por favor intenta más tarde'
        });
    }
});

apiRouter.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.clearCookie('intermappler.sid');
        res.json({ success: true, message: 'Sesión cerrada exitosamente' });
    });
});

apiRouter.get('/auth/status', (req, res) => {
    if (req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                email: req.session.userEmail,
                role: req.session.userRole
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Sistema de mapeo
apiRouter.get('/maps', (req, res) => {
    // Lista de mapas de ejemplo
    const maps = [
        {
            id: 'map_001',
            name: 'Ciudad Principal - Análisis Urbano',
            description: 'Mapa de densidad poblacional y tráfico',
            layers: 5,
            lastUpdate: '2024-01-15T10:30:00Z',
            isPublic: true,
            thumbnail: '/api/maps/map_001/thumbnail'
        },
        {
            id: 'map_002',
            name: 'Red de Transporte Regional',
            description: 'Optimización de rutas logísticas',
            layers: 8,
            lastUpdate: '2024-01-14T14:20:00Z',
            isPublic: false,
            thumbnail: '/api/maps/map_002/thumbnail'
        },
        {
            id: 'map_003',
            name: 'Análisis Climático - Zona Costera',
            description: 'Predicción de cambios climáticos',
            layers: 12,
            lastUpdate: '2024-01-13T09:15:00Z',
            isPublic: true,
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

apiRouter.get('/maps/:id', (req, res) => {
    const { id } = req.params;
    
    // Mapa de ejemplo detallado
    const map = {
        id,
        name: 'Mapa Detallado - ' + id,
        description: 'Mapa de ejemplo con datos geoespaciales avanzados',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        center: [-34.6037, -58.3816], // Buenos Aires
        zoom: 12,
        layers: [
            {
                id: 'layer_1',
                name: 'Base Cartográfica',
                type: 'vector',
                visible: true,
                opacity: 1,
                source: 'openstreetmap'
            },
            {
                id: 'layer_2',
                name: 'Satélite',
                type: 'raster',
                visible: true,
                opacity: 0.7,
                source: 'maxar'
            },
            {
                id: 'layer_3',
                name: 'Puntos de Interés',
                type: 'geojson',
                visible: true,
                opacity: 1,
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            }
        ],
        permissions: {
            canEdit: true,
            canShare: true,
            canExport: true
        },
        statistics: {
            features: 1542,
            area: '125.5 km²',
            lastAnalysis: '2024-01-15T08:30:00Z'
        }
    };
    
    res.json({ success: true, map });
});

apiRouter.post('/maps/:id/analyze', (req, res) => {
    const { id } = req.params;
    const { analysisType, parameters } = req.body;
    
    // Simular análisis en proceso
    const analysisId = `analysis_${Date.now()}`;
    
    // Enviar actualización via WebSocket
    io.emit('analysis:started', {
        analysisId,
        mapId: id,
        type: analysisType,
        status: 'processing',
        progress: 0
    });
    
    // Simular progreso
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        
        io.emit('analysis:progress', {
            analysisId,
            progress,
            status: progress < 100 ? 'processing' : 'completed'
        });
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Resultados simulados
            const results = {
                analysisId,
                mapId: id,
                type: analysisType,
                completedAt: new Date().toISOString(),
                results: {
                    clusters: Math.floor(Math.random() * 50) + 10,
                    hotspots: Math.floor(Math.random() * 20) + 5,
                    recommendations: [
                        'Optimizar rutas en zona norte',
                        'Aumentar cobertura en área industrial',
                        'Reducir tiempos de respuesta en centro'
                    ]
                }
            };
            
            io.emit('analysis:completed', results);
        }
    }, 500);
    
    res.json({
        success: true,
        analysisId,
        message: 'Análisis iniciado',
        estimatedTime: '30 segundos'
    });
});

// Datos del sistema
apiRouter.get('/system/stats', (req, res) => {
    const stats = {
        platform: 'Intermappler',
        version: '3.2.1',
        status: 'operational',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        resources: {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version
        },
        usage: {
            activeUsers: io.engine.clientsCount,
            activeMaps: 3,
            totalAnalyses: 1245,
            dataProcessed: '15.7 TB'
        },
        services: {
            api: 'online',
            database: 'online',
            cache: 'online',
            storage: 'online',
            aiEngine: 'online'
        }
    };
    
    res.json(stats);
});

// Exportar datos
apiRouter.post('/export', (req, res) => {
    const { format, data } = req.body;
    const formats = ['geojson', 'kml', 'csv', 'shapefile'];
    
    if (!formats.includes(format)) {
        return res.status(400).json({
            error: 'Formato no soportado',
            supported: formats
        });
    }
    
    // Simular tiempo de procesamiento de exportación
    setTimeout(() => {
        const exportId = `export_${Date.now()}`;
        const filename = `intermappler_export_${exportId}.${format}`;
        
        res.json({
            success: true,
            exportId,
            filename,
            format,
            size: `${(Math.random() * 10 + 1).toFixed(2)} MB`,
            downloadUrl: `/api/exports/${exportId}/download`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
    }, 2000);
});

// Montar router de API
app.use('/api', apiRouter);

// Ruta principal - Login
app.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard (protegido)
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Manejo de archivos estáticos (SPA)
app.get('*', (req, res, next) => {
    // Si es una ruta de API, continuar
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Servir archivos estáticos si existen
    const filePath = path.join(__dirname, 'public', req.path);
    if (path.extname(filePath) && path.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    
    // Para SPA, servir index.html
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        documentation: 'https://docs.intermappler.com/api'
    });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    const statusCode = err.status || 500;
    const message = NODE_ENV === 'production' && statusCode === 500
        ? 'Error interno del servidor'
        : err.message;
    
    res.status(statusCode).json({
        error: 'Error del servidor',
        message,
        ...(NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString(),
        requestId: req.id
    });
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`
    🚀 Intermappler Platform v3.2.1
    =================================
    📍 Entorno: ${NODE_ENV}
    🔗 URL: http://localhost:${PORT}
    📅 Iniciado: ${new Date().toLocaleString()}
    💾 Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
    🗺️  Modo: ${io.engine ? 'WebSocket activo' : 'HTTP Only'}
    =================================
    
    📚 Endpoints disponibles:
    • GET  /                    → Login / Home
    • GET  /dashboard          → Dashboard (requiere auth)
    • POST /api/auth/login     → Autenticación
    • GET  /api/auth/status    → Estado de sesión
    • GET  /api/maps           → Lista de mapas
    • GET  /api/maps/:id       → Detalles de mapa
    • POST /api/export         → Exportar datos
    • GET  /api/health         → Health check
    • GET  /api/system/stats   → Estadísticas del sistema
    
    ⚠️  Recordatorio de seguridad:
    • Cambiar SESSION_SECRET en producción
    • Configurar MONGODB_URI para persistencia
    • Configurar ALLOWED_ORIGINS para CORS
    • Habilitar HTTPS en producción
    `);
});

// Manejo de cierre limpio
const shutdown = (signal) => {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    
    io.close(() => {
        console.log('👋 Socket.io cerrado');
    });
    
    server.close(() => {
        console.log('🛑 Servidor HTTP cerrado');
        process.exit(0);
    });
    
    // Forzar cierre después de 10 segundos
    setTimeout(() => {
        console.error('⏰ Timeout de cierre forzado');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('💥 Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promesa rechazada no manejada:', reason);
});