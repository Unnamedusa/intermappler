const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Redirigir / a la interfaz web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Datos de ejemplo (simula una base de datos JSON)
let datos = [
    { 
        id: 1, 
        nombre: 'Server Core', 
        descripcion: 'Sistema principal del servidor',
        activo: true,
        fechaCreacion: new Date().toISOString(),
        version: '3.14'
    },
    { 
        id: 2, 
        nombre: 'API Gateway', 
        descripcion: 'Gestor de endpoints API',
        activo: true,
        fechaCreacion: new Date(Date.now() - 86400000).toISOString(),
        version: '2.0'
    },
    { 
        id: 3, 
        nombre: 'Database Module', 
        descripcion: 'Módulo de base de datos',
        activo: false,
        fechaCreacion: new Date(Date.now() - 172800000).toISOString(),
        version: '1.5'
    },
    { 
        id: 4, 
        nombre: 'Auth Service', 
        descripcion: 'Servicio de autenticación',
        activo: true,
        fechaCreacion: new Date(Date.now() - 259200000).toISOString(),
        version: '4.2'
    },
    { 
        id: 5, 
        nombre: 'Cache System', 
        descripcion: 'Sistema de caché en memoria',
        activo: true,
        fechaCreacion: new Date(Date.now() - 345600000).toISOString(),
        version: '3.1'
    }
];

// Variables para estadísticas
let serverStats = {
    startTime: new Date().toISOString(),
    totalRequests: 0,
    endpointsCalled: {},
    averageResponseTime: 0
};

// Middleware para estadísticas
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // Incrementar contador de requests
    serverStats.totalRequests++;
    
    // Registrar endpoint llamado
    const endpoint = req.path;
    serverStats.endpointsCalled[endpoint] = (serverStats.endpointsCalled[endpoint] || 0) + 1;
    
    // Log de la petición
    console.log(`[${new Date().toISOString()}] ${req.method} ${endpoint} - ID: ${requestId}`);
    
    // Interceptar la respuesta para calcular tiempo
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        
        // Actualizar tiempo promedio de respuesta
        serverStats.averageResponseTime = 
            (serverStats.averageResponseTime * (serverStats.totalRequests - 1) + duration) / serverStats.totalRequests;
        
        // Añadir headers de estadísticas
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Request-ID', requestId);
        
        originalSend.call(this, data);
    };
    
    next();
});

// ========== ENDPOINTS DE LA API ==========

// Ruta de estado del servidor (ampliada)
app.get('/api/estado', (req, res) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const memoryUsage = process.memoryUsage();
    const memoryMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    };
    
    res.json({
        estado: 'activo',
        timestamp: new Date().toISOString(),
        datosTotales: datos.length,
        entorno: process.env.NODE_ENV || 'development',
        port: PORT,
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        uptimeSeconds: uptime,
        memory: memoryMB,
        nodeVersion: process.version,
        platform: process.platform,
        stats: {
            totalRequests: serverStats.totalRequests,
            averageResponseTime: `${Math.round(serverStats.averageResponseTime)}ms`,
            popularEndpoints: Object.entries(serverStats.endpointsCalled)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        },
        system: {
            cpus: require('os').cpus().length,
            arch: process.arch,
            hostname: require('os').hostname()
        }
    });
});

// Obtener todos los datos
app.get('/api/datos', (req, res) => {
    const { page = 1, limit = 10, sort = 'id', order = 'asc' } = req.query;
    
    // Filtrar si hay query de búsqueda
    let filteredData = [...datos];
    
    if (req.query.search) {
        const searchTerm = req.query.search.toLowerCase();
        filteredData = filteredData.filter(item => 
            item.nombre.toLowerCase().includes(searchTerm) ||
            item.descripcion?.toLowerCase().includes(searchTerm)
        );
    }
    
    if (req.query.activo) {
        const activoFilter = req.query.activo === 'true';
        filteredData = filteredData.filter(item => item.activo === activoFilter);
    }
    
    // Ordenar
    filteredData.sort((a, b) => {
        if (order === 'asc') {
            return a[sort] > b[sort] ? 1 : -1;
        } else {
            return a[sort] < b[sort] ? 1 : -1;
        }
    });
    
    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    res.json({
        data: paginatedData,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredData.length,
            totalPages: Math.ceil(filteredData.length / limit),
            hasNext: endIndex < filteredData.length,
            hasPrev: startIndex > 0
        },
        filters: {
            search: req.query.search || null,
            activo: req.query.activo || null
        }
    });
});

// Obtener un dato por ID
app.get('/api/datos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const dato = datos.find(item => item.id === id);
    
    if (dato) {
        res.json({
            success: true,
            data: dato,
            metadata: {
                requestedAt: new Date().toISOString(),
                relatedEndpoints: [
                    `/api/datos/${id}/history`,
                    `/api/datos/${id}/stats`
                ]
            }
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Dato no encontrado',
            suggestions: datos.slice(0, 3).map(d => ({ id: d.id, nombre: d.nombre }))
        });
    }
});

// Crear nuevo dato
app.post('/api/datos', (req, res) => {
    const { nombre, descripcion, activo = true, version = '1.0' } = req.body;
    
    if (!nombre) {
        return res.status(400).json({
            success: false,
            error: 'El campo "nombre" es requerido',
            requiredFields: ['nombre']
        });
    }
    
    const nuevoId = datos.length > 0 ? Math.max(...datos.map(d => d.id)) + 1 : 1;
    const nuevoDato = {
        id: nuevoId,
        nombre,
        descripcion,
        activo: Boolean(activo),
        version,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        createdBy: req.ip || 'unknown'
    };
    
    datos.push(nuevoDato);
    
    res.status(201).json({
        success: true,
        message: 'Dato creado exitosamente',
        data: nuevoDato,
        location: `/api/datos/${nuevoId}`,
        nextSteps: [
            'Actualizar el dato usando PUT',
            'Obtener detalles usando GET',
            'Eliminar usando DELETE si es necesario'
        ]
    });
});

// Actualizar dato existente
app.put('/api/datos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = datos.findIndex(item => item.id === id);
    
    if (index !== -1) {
        const updateData = {
            ...req.body,
            fechaActualizacion: new Date().toISOString(),
            updatedBy: req.ip || 'unknown'
        };
        
        // No permitir actualizar id ni fechaCreacion
        delete updateData.id;
        delete updateData.fechaCreacion;
        
        datos[index] = { 
            ...datos[index], 
            ...updateData
        };
        
        res.json({
            success: true,
            message: 'Dato actualizado exitosamente',
            data: datos[index],
            changes: Object.keys(req.body),
            previousVersion: datos[index].version
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Dato no encontrado',
            suggestion: 'Usa POST /api/datos para crear un nuevo dato'
        });
    }
});

// Actualizar parcialmente
app.patch('/api/datos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = datos.findIndex(item => item.id === id);
    
    if (index !== -1) {
        const allowedUpdates = ['nombre', 'descripcion', 'activo', 'version'];
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No hay campos válidos para actualizar',
                allowedFields: allowedUpdates
            });
        }
        
        updates.fechaActualizacion = new Date().toISOString();
        datos[index] = { ...datos[index], ...updates };
        
        res.json({
            success: true,
            message: 'Dato actualizado parcialmente',
            data: datos[index],
            updatedFields: Object.keys(updates)
        });
    } else {
        res.status(404).json({ error: 'Dato no encontrado' });
    }
});

// Eliminar dato
app.delete('/api/datos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = datos.findIndex(item => item.id === id);
    
    if (index !== -1) {
        const eliminado = datos.splice(index, 1)[0];
        
        res.json({
            success: true,
            message: 'Dato eliminado exitosamente',
            data: eliminado,
            remaining: datos.length,
            backup: `Backup recomendado para ID ${id}`
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Dato no encontrado',
            availableIds: datos.slice(0, 5).map(d => d.id)
        });
    }
});

// Endpoint de saludo mejorado
app.get('/api/saludo', (req, res) => {
    const nombre = req.query.nombre || 'Visitante';
    const idioma = req.query.lang || 'es';
    const formato = req.query.format || 'json';
    
    const saludos = {
        es: `¡Hola ${nombre}! Bienvenido al servidor JSON.`,
        en: `Hello ${nombre}! Welcome to JSON server.`,
        fr: `Bonjour ${nombre}! Bienvenue sur le serveur JSON.`,
        de: `Hallo ${nombre}! Willkommen beim JSON-Server.`,
        ja: `こんにちは ${nombre}！JSONサーバーへようこそ。`
    };
    
    const respuesta = {
        mensaje: saludos[idioma] || saludos.es,
        timestamp: new Date().toISOString(),
        metadata: {
            nombre,
            idioma,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        },
        sugerencias: {
            endpoints: '/api/estado, /api/datos, /api/docs',
            acciones: ['Crear datos con POST', 'Actualizar con PUT', 'Eliminar con DELETE']
        }
    };
    
    if (formato === 'text') {
        res.type('text').send(respuesta.mensaje);
    } else if (formato === 'html') {
        res.type('html').send(`
            <!DOCTYPE html>
            <html>
            <head><title>Saludo</title></head>
            <body>
                <h1>${respuesta.mensaje}</h1>
                <p>Timestamp: ${respuesta.timestamp}</p>
                <p>Nombre: ${nombre}</p>
                <p>Idioma: ${idioma}</p>
            </body>
            </html>
        `);
    } else {
        res.json(respuesta);
    }
});

// Endpoint de salud (health check)
app.get('/api/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
            database: datos.length >= 0 ? 'connected' : 'error',
            memory: process.memoryUsage().heapUsed < 100000000 ? 'ok' : 'warning',
            uptime: process.uptime() > 60 ? 'stable' : 'starting'
        },
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    };
    
    res.json(health);
});

// Estadísticas detalladas
app.get('/api/stats', (req, res) => {
    const now = new Date();
    const uptime = process.uptime();
    
    res.json({
        server: {
            uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
            startTime: serverStats.startTime,
            currentTime: now.toISOString()
        },
        requests: {
            total: serverStats.totalRequests,
            averageResponseTime: `${Math.round(serverStats.averageResponseTime)}ms`,
            byMethod: Object.entries(
                serverStats.endpointsCalled
            ).reduce((acc, [endpoint, count]) => {
                const method = endpoint.split(' ')[0] || 'GET';
                acc[method] = (acc[method] || 0) + count;
                return acc;
            }, {})
        },
        data: {
            totalItems: datos.length,
            activeItems: datos.filter(d => d.activo).length,
            lastCreated: datos.length > 0 ? datos[datos.length - 1].fechaCreacion : null,
            categories: [...new Set(datos.map(d => d.version))].length
        },
        system: {
            memory: {
                rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
            },
            node: process.version,
            platform: process.platform,
            cpus: require('os').cpus().length
        }
    });
});

// Busqueda avanzada
app.get('/api/search', (req, res) => {
    const { q, field = 'all', limit = 10 } = req.query;
    
    if (!q) {
        return res.status(400).json({
            error: 'Query parameter "q" is required',
            example: '/api/search?q=server&field=nombre'
        });
    }
    
    const searchTerm = q.toLowerCase();
    let results = [];
    
    if (field === 'all' || field === 'nombre') {
        results = results.concat(
            datos.filter(d => 
                d.nombre.toLowerCase().includes(searchTerm)
            ).map(d => ({ ...d, matchedField: 'nombre' }))
        );
    }
    
    if (field === 'all' || field === 'descripcion') {
        results = results.concat(
            datos.filter(d => 
                d.descripcion && d.descripcion.toLowerCase().includes(searchTerm)
            ).map(d => ({ ...d, matchedField: 'descripcion' }))
        );
    }
    
    // Eliminar duplicados
    results = results.filter((v, i, a) => 
        a.findIndex(t => t.id === v.id) === i
    );
    
    res.json({
        query: q,
        field,
        results: results.slice(0, limit),
        total: results.length,
        limit: parseInt(limit)
    });
});

// Documentación de la API
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'JSON Server API',
        version: '3.14',
        description: 'Servidor JSON avanzado para Railway con interfaz Cyberpunk',
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        endpoints: [
            {
                method: 'GET',
                path: '/estado',
                description: 'Estado del servidor y estadísticas',
                example: '/api/estado'
            },
            {
                method: 'GET',
                path: '/datos',
                description: 'Obtener todos los datos (con paginación)',
                queryParams: ['page', 'limit', 'sort', 'order', 'search', 'activo'],
                example: '/api/datos?page=1&limit=10&search=server'
            },
            {
                method: 'GET',
                path: '/datos/:id',
                description: 'Obtener un dato específico',
                example: '/api/datos/1'
            },
            {
                method: 'POST',
                path: '/datos',
                description: 'Crear nuevo dato',
                bodyParams: ['nombre', 'descripcion', 'activo', 'version'],
                example: 'POST /api/datos { "nombre": "Nuevo", "activo": true }'
            },
            {
                method: 'PUT',
                path: '/datos/:id',
                description: 'Actualizar dato completamente',
                example: 'PUT /api/datos/1 { "nombre": "Actualizado" }'
            },
            {
                method: 'PATCH',
                path: '/datos/:id',
                description: 'Actualizar dato parcialmente',
                example: 'PATCH /api/datos/1 { "activo": false }'
            },
            {
                method: 'DELETE',
                path: '/datos/:id',
                description: 'Eliminar dato',
                example: 'DELETE /api/datos/1'
            },
            {
                method: 'GET',
                path: '/saludo',
                description: 'Saludo personalizado',
                queryParams: ['nombre', 'lang', 'format'],
                example: '/api/saludo?nombre=Juan&lang=es'
            },
            {
                method: 'GET',
                path: '/health',
                description: 'Health check del servidor',
                example: '/api/health'
            },
            {
                method: 'GET',
                path: '/stats',
                description: 'Estadísticas detalladas',
                example: '/api/stats'
            },
            {
                method: 'GET',
                path: '/search',
                description: 'Búsqueda avanzada',
                queryParams: ['q', 'field', 'limit'],
                example: '/api/search?q=server&field=nombre'
            },
            {
                method: 'GET',
                path: '/docs',
                description: 'Documentación de la API (este endpoint)',
                example: '/api/docs'
            }
        ],
        interfaces: {
            web: '/',
            api: '/api',
            health: '/api/health',
            status: '/api/estado'
        },
        tips: [
            'Usa POST para crear, PUT para actualizar completamente, PATCH para actualizar parcialmente',
            'La paginación está disponible en GET /api/datos',
            'Puedes buscar datos con el parámetro "search"',
            'Consulta /api/estado para ver el estado del servidor'
        ]
    });
});

// Endpoint para resetear datos (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
    app.post('/api/reset', (req, res) => {
        datos = [
            { 
                id: 1, 
                nombre: 'Server Core', 
                descripcion: 'Sistema principal del servidor',
                activo: true,
                fechaCreacion: new Date().toISOString(),
                version: '3.14'
            },
            { 
                id: 2, 
                nombre: 'API Gateway', 
                descripcion: 'Gestor de endpoints API',
                activo: true,
                fechaCreacion: new Date(Date.now() - 86400000).toISOString(),
                version: '2.0'
            },
            { 
                id: 3, 
                nombre: 'Database Module', 
                descripcion: 'Módulo de base de datos',
                activo: false,
                fechaCreacion: new Date(Date.now() - 172800000).toISOString(),
                version: '1.5'
            }
        ];
        
        res.json({
            message: 'Datos reseteados a valores por defecto',
            count: datos.length,
            data: datos
        });
    });
}

// Endpoint para exportar datos
app.get('/api/export', (req, res) => {
    const format = req.query.format || 'json';
    
    if (format === 'csv') {
        let csv = 'id,nombre,descripcion,activo,version,fechaCreacion\n';
        datos.forEach(d => {
            csv += `${d.id},"${d.nombre}","${d.descripcion || ''}",${d.activo},"${d.version}","${d.fechaCreacion}"\n`;
        });
        
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="datos_export.csv"');
        res.send(csv);
    } else {
        res.json({
            exportedAt: new Date().toISOString(),
            count: datos.length,
            data: datos
        });
    }
});

// Manejo de rutas no encontradas (API)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        requested: req.originalUrl,
        method: req.method,
        availableEndpoints: [
            'GET    /api/estado',
            'GET    /api/datos',
            'GET    /api/datos/:id',
            'POST   /api/datos',
            'PUT    /api/datos/:id',
            'DELETE /api/datos/:id',
            'GET    /api/saludo',
            'GET    /api/health',
            'GET    /api/stats',
            'GET    /api/docs'
        ],
        suggestion: 'Visita /api/docs para ver la documentación completa'
    });
});

// Redirigir todas las demás rutas a la interfaz web
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID') || 'unknown'
    });
});

// Función para iniciar el servidor con estilo
function startServer() {
    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🚀 HELLO WORLD!!! API Server');
            console.log('='.repeat(60));
            console.log(`📡 URL: http://localhost:${PORT}`);
            console.log(`🌐 Web Interface: http://localhost:${PORT}/`);
            console.log(`🛠️  API Base: http://localhost:${PORT}/api`);
            console.log(`📊 API Status: http://localhost:${PORT}/api/estado`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
            console.log('='.repeat(60));
            console.log(`🕐 Started: ${new Date().toLocaleString()}`);
            console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Data loaded: ${datos.length} records`);
            console.log('='.repeat(60) + '\n');
            
            resolve(server);
        });
        
        server.on('error', reject);
    });
}

// Iniciar servidor
if (require.main === module) {
    startServer().catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
}

// Exportar para testing
module.exports = { app, startServer };