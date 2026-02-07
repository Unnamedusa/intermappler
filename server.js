const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { encryptData, decryptData } = require('./base/incript/orchestrator');
const LoginSystem = require('./base/auth/login-system');
const SessionManager = require('./base/auth/session-manager');
const TranslationSystem = require('./base/utils/translator');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID', 'X-Language']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de idioma
app.use((req, res, next) => {
    // Detectar idioma de varias formas
    const languageSources = [
        req.headers['x-language'],
        req.query.lang,
        req.cookies?.language,
        req.acceptsLanguages().shift()
    ];
    
    const detectedLang = languageSources.find(lang => lang) || 'es';
    req.language = TranslationSystem.validateLanguage(detectedLang);
    
    // Añadir headers de respuesta
    res.setHeader('Content-Language', req.language);
    res.setHeader('X-Detected-Language', req.language);
    
    next();
});

// Middleware de traducción automática
app.use((req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        // Solo traducir si el cliente lo solicita
        const shouldTranslate = req.headers['x-translate'] === 'true' || 
                               req.query.translate === 'true';
        
        if (shouldTranslate && data && typeof data === 'object') {
            // Traducir los textos del response
            data = TranslationSystem.translateObject(data, req.language);
            
            // Añadir metadata de traducción
            if (!data._translation) {
                data._translation = {
                    source_language: 'es',
                    target_language: req.language,
                    auto_translated: true,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        return originalJson.call(this, data);
    };
    
    next();
});

// Servir archivos estáticos desde la carpeta web
app.use(express.static(path.join(__dirname, 'web'), {
    setHeaders: (res, filePath) => {
        // Añadir headers de seguridad
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    }
}));

// Sistema de cuentas encriptadas
let cuentas = [
    {
        id: 1,
        usuario: "admin",
        datosEncriptados: "",
        metadata: {
            fechaCreacion: new Date().toISOString(),
            nivelSeguridad: "alto",
            capasActivadas: 3,
            language: 'es'
        }
    }
];

// Variables para estadísticas
let serverStats = {
    startTime: new Date().toISOString(),
    totalRequests: 0,
    endpointsCalled: {},
    averageResponseTime: 0,
    intentosHackeo: 0,
    hackersBloqueados: 0,
    languagesUsed: {}
};

// Middleware para estadísticas y seguridad
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // Registrar idioma usado
    const lang = req.language;
    serverStats.languagesUsed[lang] = (serverStats.languagesUsed[lang] || 0) + 1;
    
    // Detectar patrones sospechosos
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    
    // Patrones comunes de ataque
    const patronesSospechosos = [
        /sqlmap/i, /nikto/i, /metasploit/i, /nmap/i, /burpsuite/i,
        /hydra/i, /dirb/i, /wpscan/i, /union.*select/i, /drop.*table/i,
        /exec.*cmdshell/i, /script.*alert/i, /<script>/i, /etc.*passwd/i
    ];
    
    let esSospechoso = false;
    const url = req.url.toLowerCase();
    const bodyString = JSON.stringify(req.body).toLowerCase();
    
    for (const patron of patronesSospechosos) {
        if (patron.test(url) || patron.test(bodyString) || patron.test(userAgent)) {
            esSospechoso = true;
            serverStats.intentosHackeo++;
            
            console.warn(`🚨 INTENTO SOSPECHOSO DETECTADO - IP: ${ip}, Idioma: ${lang}`);
            
            // Activar modo Sneaker
            if (typeof activarModoSneaker === 'function') {
                activarModoSneaker(ip, userAgent);
            }
            
            break;
        }
    }
    
    // Incrementar contador de requests
    serverStats.totalRequests++;
    
    // Registrar endpoint llamado
    const endpoint = req.path;
    serverStats.endpointsCalled[endpoint] = (serverStats.endpointsCalled[endpoint] || 0) + 1;
    
    // Log de la petición
    console.log(`[${new Date().toISOString()}] ${req.method} ${endpoint} - ID: ${requestId} 🌐 ${lang} ${esSospechoso ? '🚨' : '✅'}`);
    
    // Interceptar la respuesta
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        
        serverStats.averageResponseTime = 
            (serverStats.averageResponseTime * (serverStats.totalRequests - 1) + duration) / serverStats.totalRequests;
        
        // Headers de respuesta
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Request-ID', requestId);
        res.setHeader('X-Security-Level', 'InterMappler-3Capas');
        res.setHeader('X-Language-Served', lang);
        res.setHeader('X-Intento-Hackeo', esSospechoso ? 'si' : 'no');
        
        if (esSospechoso) {
            serverStats.hackersBloqueados++;
            const respuestaFalsa = {
                status: "success",
                message: "Acceso concedido",
                data: generarDatosFalsos(),
                timestamp: new Date().toISOString(),
                fake: true,
                sneakerMode: "active",
                _translation: {
                    warning: "Esta respuesta está traducida automáticamente para engañar al atacante"
                }
            };
            
            // Traducir respuesta falsa al idioma del atacante
            const respuestaTraducida = TranslationSystem.translateObject(respuestaFalsa, lang);
            return originalSend.call(this, JSON.stringify(respuestaTraducida));
        }
        
        originalSend.call(this, data);
    };
    
    next();
});

// ========== ENDPOINTS DE AUTENTICACIÓN Y SESIÓN ==========

// Ruta principal - Interfaz InterMappler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'login', 'login.html'));
});

// Endpoint de login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password, userType, subrole, language = 'es' } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');

        // Validar tipo de usuario
        const validUserTypes = Object.keys(SessionManager.ROLES);
        if (!validUserTypes.includes(userType)) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Tipo de usuario inválido', req.language),
                error_code: 'INVALID_USER_TYPE'
            });
        }

        // Autenticar usuario
        const authResult = await LoginSystem.authenticate(
            username, 
            password, 
            subrole,
            ipAddress,
            userAgent
        );

        // Actualizar idioma preferido del usuario
        if (authResult.success) {
            const user = SessionManager.demoUsers.find(u => u.username === username);
            if (user) {
                user.preferredLanguage = language;
            }
        }

        // Traducir mensajes de éxito si se solicita
        if (req.headers['x-translate'] === 'true') {
            authResult.message = TranslationSystem.translate(authResult.message || 'Login exitoso', req.language);
        }

        res.json(authResult);

    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(401).json({ 
            error: TranslationSystem.translate(error.message, req.language),
            error_code: 'AUTH_FAILED'
        });
    }
});

// Validar sesión
app.get('/api/auth/validate', (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        const token = req.headers['authorization'];

        if (!sessionId) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Session ID requerido', req.language),
                error_code: 'MISSING_SESSION_ID'
            });
        }

        const validation = LoginSystem.validateToken(token, sessionId);
        
        if (validation.valid) {
            const response = {
                valid: true,
                user: validation.session.user,
                permissions: validation.session.permissions,
                language: validation.session.user.preferredLanguage || 'es'
            };
            
            res.json(response);
        } else {
            res.status(401).json({
                valid: false,
                reason: TranslationSystem.translate(validation.reason, req.language),
                error_code: 'SESSION_INVALID'
            });
        }

    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error validando sesión', req.language),
            error_code: 'VALIDATION_ERROR'
        });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Session ID requerido', req.language),
                error_code: 'MISSING_SESSION_ID'
            });
        }

        const success = LoginSystem.logout(sessionId);
        
        if (success) {
            res.json({ 
                success: true, 
                message: TranslationSystem.translate('Sesión cerrada correctamente', req.language)
            });
        } else {
            res.status(404).json({ 
                error: TranslationSystem.translate('Sesión no encontrada', req.language),
                error_code: 'SESSION_NOT_FOUND'
            });
        }

    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error cerrando sesión', req.language),
            error_code: 'LOGOUT_ERROR'
        });
    }
});

// Recuperación de contraseña
app.post('/api/auth/recover', async (req, res) => {
    try {
        const { email, language = 'es' } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Email requerido', req.language),
                error_code: 'MISSING_EMAIL'
            });
        }

        const result = await LoginSystem.initiatePasswordReset(email);
        
        // Traducir respuesta
        if (req.headers['x-translate'] === 'true') {
            result.message = TranslationSystem.translate(result.message, language);
        }
        
        res.json(result);

    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error en recuperación', req.language),
            error_code: 'RECOVERY_ERROR'
        });
    }
});

// Cambiar idioma de usuario
app.post('/api/auth/language', (req, res) => {
    try {
        const { sessionId, language } = req.body;
        
        if (!sessionId || !language) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Session ID e idioma requeridos', req.language),
                error_code: 'MISSING_PARAMS'
            });
        }

        const validation = LoginSystem.validateToken(null, sessionId);
        
        if (validation.valid) {
            // Actualizar idioma del usuario en la sesión
            validation.session.user.preferredLanguage = TranslationSystem.validateLanguage(language);
            SessionManager.sessions.set(sessionId, validation.session);
            
            res.json({
                success: true,
                message: TranslationSystem.translate('Idioma actualizado correctamente', language),
                new_language: language,
                translated_message: TranslationSystem.translate('Idioma actualizado correctamente', language)
            });
        } else {
            res.status(401).json({
                error: TranslationSystem.translate('Sesión inválida', req.language),
                error_code: 'INVALID_SESSION'
            });
        }

    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error cambiando idioma', req.language),
            error_code: 'LANGUAGE_CHANGE_ERROR'
        });
    }
});

// Obtener jerarquía de roles (traducida)
app.get('/api/auth/roles', (req, res) => {
    try {
        const roleHierarchy = SessionManager.getRoleHierarchy();
        const language = req.language;
        
        // Traducir nombres y descripciones de roles
        const translatedHierarchy = roleHierarchy.map(role => ({
            ...role,
            name: TranslationSystem.translate(role.name, language),
            description: TranslationSystem.translate(role.description, language),
            translated: true,
            source_language: 'es',
            target_language: language
        }));
        
        res.json(translatedHierarchy);
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error obteniendo roles', req.language),
            error_code: 'ROLES_ERROR'
        });
    }
});

// Estadísticas de login (con traducción)
app.get('/api/auth/stats', (req, res) => {
    try {
        const stats = LoginSystem.getLoginStats();
        const language = req.language;
        
        // Traducir las keys de las estadísticas si se solicita
        const translatedStats = { ...stats };
        
        if (req.headers['x-translate'] === 'true') {
            // Traducir nombres de las categorías
            translatedStats._translated = true;
            translatedStats._language = language;
        }
        
        res.json(translatedStats);
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error obteniendo estadísticas', req.language),
            error_code: 'STATS_ERROR'
        });
    }
});

// Verificar si usuario existe
app.get('/api/auth/check-user/:username', (req, res) => {
    const { username } = req.params;
    const language = req.language;
    
    const exists = SessionManager.demoUsers.some(user => 
        user.username === username
    );
    
    res.json({ 
        exists,
        message: exists 
            ? TranslationSystem.translate('Usuario encontrado', language)
            : TranslationSystem.translate('Usuario no encontrado', language),
        language
    });
});

// ========== ENDPOINTS DEL SISTEMA INTERMAPPLER ==========

// Estado del sistema (con traducción completa)
app.get('/api/estado', (req, res) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const baseResponse = {
        sistema: "InterMappler",
        version: "1.0.0",
        estado: "operativo",
        seguridad: {
            nivel: "3-capas",
            capa1: "quantum-fractal",
            capa2: "enigma-modern",
            capa3: "sneaker-python",
            activado: true
        },
        estadisticas: {
            uptime: `${hours}h ${minutes}m ${seconds}s`,
            peticiones: serverStats.totalRequests,
            intentosHackeo: serverStats.intentosHackeo,
            hackersBloqueados: serverStats.hackersBloqueados,
            tiempoRespuesta: `${Math.round(serverStats.averageResponseTime)}ms`,
            idiomas_usados: serverStats.languagesUsed
        },
        timestamp: new Date().toISOString(),
        language: req.language,
        available_languages: TranslationSystem.getAvailableLanguages()
    };
    
    res.json(baseResponse);
});

// Encriptar datos (con soporte multilenguaje)
app.post('/api/encriptar', async (req, res) => {
    try {
        const { datos, nivel = 3, language = 'es' } = req.body;
        
        if (!datos) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Datos requeridos', req.language),
                error_code: 'MISSING_DATA'
            });
        }
        
        const datosEncriptados = await encryptData(datos, nivel);
        
        const response = {
            success: true,
            datosEncriptados,
            nivelEncriptacion: nivel,
            timestamp: new Date().toISOString(),
            hash: generarHash(datos),
            message: TranslationSystem.translate('Datos encriptados exitosamente', language)
        };
        
        res.json(response);
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error en encriptación', req.language),
            message: TranslationSystem.translate(error.message, req.language),
            error_code: 'ENCRYPTION_ERROR'
        });
    }
});

// Desencriptar datos
app.post('/api/desencriptar', async (req, res) => {
    try {
        const { datosEncriptados, clave, language = 'es' } = req.body;
        
        if (!datosEncriptados || !clave) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Datos encriptados y clave requeridos', req.language),
                error_code: 'MISSING_PARAMS'
            });
        }
        
        // Verificar clave de acceso
        if (!verificarClave(clave)) {
            serverStats.intentosHackeo++;
            return res.status(403).json({ 
                error: TranslationSystem.translate('Clave inválida', req.language),
                sneakerMode: "activado",
                error_code: 'INVALID_KEY'
            });
        }
        
        const datosOriginales = await decryptData(datosEncriptados);
        
        res.json({
            success: true,
            datos: datosOriginales,
            timestamp: new Date().toISOString(),
            message: TranslationSystem.translate('Datos desencriptados exitosamente', language)
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error en desencriptación', req.language),
            message: TranslationSystem.translate(error.message, req.language),
            error_code: 'DECRYPTION_ERROR'
        });
    }
});

// Registrar nueva cuenta
app.post('/api/cuenta/registrar', async (req, res) => {
    try {
        const { usuario, datos, language = 'es' } = req.body;
        
        if (!usuario || !datos) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Usuario y datos requeridos', req.language),
                error_code: 'MISSING_PARAMS'
            });
        }
        
        // Verificar si usuario ya existe
        const existe = cuentas.some(c => c.usuario === usuario);
        if (existe) {
            return res.status(409).json({ 
                error: TranslationSystem.translate('Usuario ya existe', req.language),
                error_code: 'USER_EXISTS'
            });
        }
        
        // Encriptar datos con las 3 capas
        const datosEncriptados = await encryptData(datos, 3);
        
        const nuevaCuenta = {
            id: cuentas.length + 1,
            usuario,
            datosEncriptados,
            metadata: {
                fechaCreacion: new Date().toISOString(),
                nivelSeguridad: "alto",
                capasActivadas: 3,
                ultimoAcceso: null,
                language: language
            }
        };
        
        cuentas.push(nuevaCuenta);
        
        res.status(201).json({
            success: true,
            message: TranslationSystem.translate('Cuenta creada exitosamente', language),
            cuentaId: nuevaCuenta.id,
            timestamp: nuevaCuenta.metadata.fechaCreacion,
            language_set: language
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error al crear cuenta', req.language),
            message: TranslationSystem.translate(error.message, req.language),
            error_code: 'ACCOUNT_CREATION_ERROR'
        });
    }
});

// Obtener información de cuenta
app.get('/api/cuenta/:usuario', async (req, res) => {
    try {
        const { usuario } = req.params;
        const language = req.query.lang || req.language;
        const cuenta = cuentas.find(c => c.usuario === usuario);
        
        if (!cuenta) {
            return res.status(404).json({ 
                error: TranslationSystem.translate('Cuenta no encontrada', language),
                error_code: 'ACCOUNT_NOT_FOUND'
            });
        }
        
        // Traducir metadata
        const metadataTraducida = { ...cuenta.metadata };
        if (req.headers['x-translate'] === 'true') {
            metadataTraducida.nivelSeguridad = TranslationSystem.translate(
                metadataTraducida.nivelSeguridad, 
                language
            );
        }
        
        res.json({
            success: true,
            metadata: metadataTraducida,
            seguridad: {
                nivel: "3-capas",
                estado: TranslationSystem.translate("protegido", language)
            },
            language: language
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error al obtener cuenta', req.language),
            error_code: 'ACCOUNT_FETCH_ERROR'
        });
    }
});

// Sistema de mapas (con traducción)
app.get('/api/mapas', (req, res) => {
    const language = req.language;
    
    const mapas = [
        {
            id: 1,
            nombre: TranslationSystem.translate("Central Hub", language),
            tipo: TranslationSystem.translate("principal", language),
            seguridad: TranslationSystem.translate("alta", language),
            acceso: TranslationSystem.translate("verificado", language)
        },
        {
            id: 2,
            nombre: TranslationSystem.translate("Data Vault", language),
            tipo: TranslationSystem.translate("almacenamiento", language),
            seguridad: TranslationSystem.translate("máxima", language),
            acceso: TranslationSystem.translate("restringido", language)
        }
    ];
    
    res.json({
        success: true,
        mapas,
        timestamp: new Date().toISOString(),
        language: language,
        total_maps: mapas.length
    });
});

// Test de seguridad (con traducción)
app.post('/api/test/seguridad', async (req, res) => {
    const testData = {
        mensaje: "Test de seguridad InterMappler",
        timestamp: new Date().toISOString(),
        datosSensibles: {
            clave: "no_revelar",
            token: "test_" + Math.random().toString(36).substr(2, 16)
        }
    };
    
    const language = req.language;
    
    try {
        const encriptado = await encryptData(testData, 3);
        const desencriptado = await decryptData(encriptado);
        
        res.json({
            test: TranslationSystem.translate("completo", language),
            original: testData,
            encriptado: encriptado.substring(0, 100) + "...",
            desencriptado: desencriptado,
            validacion: JSON.stringify(testData) === JSON.stringify(desencriptado) 
                ? TranslationSystem.translate("✅ OK", language) 
                : TranslationSystem.translate("❌ FALLO", language),
            capas: 3,
            message: TranslationSystem.translate("Test de seguridad completado", language)
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate(error.message, language),
            error_code: 'SECURITY_TEST_ERROR'
        });
    }
});

// Panel de administración de seguridad
app.get('/api/seguridad/panel', (req, res) => {
    const language = req.language;
    
    const response = {
        sistema: TranslationSystem.translate("InterMappler Security Panel", language),
        estadisticas: {
            totalRequests: serverStats.totalRequests,
            intentosHackeo: serverStats.intentosHackeo,
            hackersBloqueados: serverStats.hackersBloqueados,
            tasaBloqueo: serverStats.intentosHackeo > 0 
                ? Math.round((serverStats.hackersBloqueados / serverStats.intentosHackeo) * 100) 
                : 0,
            idiomas_detectados: Object.keys(serverStats.languagesUsed).length
        },
        cuentas: cuentas.length,
        estadoCapas: {
            capa1: TranslationSystem.translate("activa", language),
            capa2: TranslationSystem.translate("activa", language),
            capa3: TranslationSystem.translate("activa", language)
        },
        timestamp: new Date().toISOString(),
        language: language
    };
    
    res.json(response);
});

// Health check extendido
app.get('/api/health', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const language = req.language;
    
    res.json({
        status: TranslationSystem.translate("healthy", language),
        sistema: "InterMappler",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        recursos: {
            memoria: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            uptime: process.uptime()
        },
        seguridad: TranslationSystem.translate("3-capas-activa", language),
        endpointsActivos: Object.keys(serverStats.endpointsCalled).length,
        language: language,
        supported_languages: TranslationSystem.getAvailableLanguages()
    });
});

// ========== ENDPOINTS DE TRADUCCIÓN ==========

// Traducir texto
app.post('/api/translate/text', (req, res) => {
    try {
        const { text, target_language, source_language = 'auto' } = req.body;
        
        if (!text || !target_language) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Texto e idioma destino requeridos', req.language),
                error_code: 'MISSING_PARAMS'
            });
        }
        
        const translation = TranslationSystem.translate(text, target_language, source_language);
        
        res.json({
            success: true,
            original_text: text,
            translated_text: translation,
            source_language: source_language === 'auto' ? TranslationSystem.detectLanguage(text) : source_language,
            target_language: target_language,
            confidence: 0.95, // Confianza simulada
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error en traducción', req.language),
            message: error.message,
            error_code: 'TRANSLATION_ERROR'
        });
    }
});

// Traducir objeto JSON
app.post('/api/translate/object', (req, res) => {
    try {
        const { data, target_language, source_language = 'auto' } = req.body;
        
        if (!data || !target_language) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Datos e idioma destino requeridos', req.language),
                error_code: 'MISSING_PARAMS'
            });
        }
        
        const translated = TranslationSystem.translateObject(data, target_language, source_language);
        
        res.json({
            success: true,
            original_data: data,
            translated_data: translated,
            source_language: source_language === 'auto' ? TranslationSystem.detectLanguage(JSON.stringify(data)) : source_language,
            target_language: target_language,
            items_translated: TranslationSystem.countTranslatedItems(data, translated),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error en traducción', req.language),
            error_code: 'OBJECT_TRANSLATION_ERROR'
        });
    }
});

// Detectar idioma
app.post('/api/translate/detect', (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Texto requerido', req.language),
                error_code: 'MISSING_TEXT'
            });
        }
        
        const detection = TranslationSystem.detectLanguage(text);
        
        res.json({
            success: true,
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            detected_language: detection.language,
            confidence: detection.confidence,
            iso_code: detection.iso_code,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error detectando idioma', req.language),
            error_code: 'DETECTION_ERROR'
        });
    }
});

// Obtener idiomas disponibles
app.get('/api/translate/languages', (req, res) => {
    const languages = TranslationSystem.getAvailableLanguages();
    const language = req.language;
    
    // Traducir nombres de idiomas
    const translatedLanguages = languages.map(lang => ({
        ...lang,
        name: TranslationSystem.translate(lang.name, language),
        native_name: lang.native_name
    }));
    
    res.json({
        success: true,
        languages: translatedLanguages,
        total: languages.length,
        default_language: 'es',
        timestamp: new Date().toISOString(),
        current_language: language
    });
});

// Traducción en tiempo real (WebSocket simulation)
app.post('/api/translate/realtime', (req, res) => {
    try {
        const { text, target_language, session_id } = req.body;
        
        if (!text || !target_language) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Parámetros requeridos', req.language),
                error_code: 'MISSING_PARAMS'
            });
        }
        
        // Simular procesamiento en tiempo real
        const words = text.split(' ');
        const translatedWords = words.map(word => 
            TranslationSystem.translate(word, target_language)
        );
        
        const translation = translatedWords.join(' ');
        
        res.json({
            success: true,
            original: text,
            translation: translation,
            target_language: target_language,
            processing_time: text.length * 0.01, // ms simulados
            real_time: true,
            session_id: session_id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error en traducción en tiempo real', req.language),
            error_code: 'REALTIME_TRANSLATION_ERROR'
        });
    }
});

// ========== ENDPOINTS DEL SISTEMA ==========

// Documentación de la API (multilenguaje)
app.get('/api/docs', (req, res) => {
    const language = req.language;
    
    const docs = {
        name: TranslationSystem.translate('JSON Server API', language),
        version: "3.14",
        description: TranslationSystem.translate('Servidor JSON avanzado para Railway con interfaz Cyberpunk', language),
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        endpoints: [
            {
                method: 'GET',
                path: '/estado',
                description: TranslationSystem.translate('Estado del servidor y estadísticas', language),
                example: '/api/estado'
            },
            {
                method: 'GET',
                path: '/auth/roles',
                description: TranslationSystem.translate('Jerarquía de roles del sistema', language),
                example: '/api/auth/roles?lang=en'
            },
            {
                method: 'POST',
                path: '/auth/login',
                description: TranslationSystem.translate('Iniciar sesión en el sistema', language),
                example: 'POST /api/auth/login'
            },
            {
                method: 'POST',
                path: '/translate/text',
                description: TranslationSystem.translate('Traducir texto a otro idioma', language),
                example: 'POST /api/translate/text { "text": "Hello", "target_language": "es" }'
            }
        ],
        translation: {
            available: true,
            auto_detect: true,
            supported_languages: TranslationSystem.getAvailableLanguages().map(l => l.code),
            endpoint: '/api/translate'
        },
        tips: [
            TranslationSystem.translate('Usa el header X-Language para especificar idioma', language),
            TranslationSystem.translate('Añade ?translate=true para traducción automática', language),
            TranslationSystem.translate('Consulta /api/translate/languages para idiomas soportados', language)
        ]
    };
    
    res.json(docs);
});

// Exportar datos
app.get('/api/export', (req, res) => {
    const format = req.query.format || 'json';
    const language = req.query.lang || req.language;
    
    if (format === 'csv') {
        let csv = TranslationSystem.translate('id,nombre,descripcion,activo,version,fechaCreacion', language) + '\n';
        cuentas.forEach(d => {
            csv += `${d.id},"${d.usuario}","",${d.metadata.nivelSeguridad},"3.0","${d.metadata.fechaCreacion}"\n`;
        });
        
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.header('Content-Disposition', `attachment; filename="datos_${language}.csv"`);
        res.send(csv);
    } else {
        res.json({
            exportedAt: new Date().toISOString(),
            count: cuentas.length,
            data: cuentas,
            language: language,
            message: TranslationSystem.translate('Datos exportados exitosamente', language)
        });
    }
});

// ========== FUNCIONES AUXILIARES ==========

function verificarClave(clave) {
    const claveMaestra = process.env.MASTER_KEY || "InterMappler2024";
    return clave === claveMaestra;
}

function generarHash(datos) {
    const crypto = require('crypto');
    const str = JSON.stringify(datos);
    return crypto.createHash('sha256').update(str).digest('hex');
}

function generarDatosFalsos() {
    const mapasFalsos = [
        {
            id: "map_001",
            nombre: "Base Secreta Alpha",
            coordenadas: "47°23'23.6\"N 8°32'33.1\"E",
            seguridad: "nivel-5",
            datosFalsos: true
        }
    ];
    
    return {
        usuario: "admin",
        token: "fake_token_" + Math.random().toString(36).substr(2, 16),
        session_id: "fake_session_" + Math.random().toString(36).substr(2, 24),
        mapas: mapasFalsos,
        acceso_completo: true,
        debug_info: "Modo sneaker activado - Datos falsos generados"
    };
}

function activarModoSneaker(ip, userAgent) {
    console.log(`🛡️  Modo Sneaker activado para IP: ${ip}`);
    
    const logEntry = {
        timestamp: new Date().toISOString(),
        ip,
        userAgent,
        accion: "sneaker_activado",
        tipo: "defensa_activa"
    };
    
    fs.appendFileSync(
        path.join(__dirname, 'base', 'security.log'),
        JSON.stringify(logEntry) + '\n'
    );
}

// Ruta 404 para API
app.use('/api/*', (req, res) => {
    const language = req.language;
    
    res.status(404).json({
        error: TranslationSystem.translate("Endpoint no encontrado", language),
        sistema: "InterMappler",
        requested: req.originalUrl,
        method: req.method,
        language: language,
        suggestion: TranslationSystem.translate("Visita /api/docs para documentación", language),
        availableEndpoints: [
            'GET    /api/estado',
            'POST   /api/auth/login',
            'GET    /api/auth/roles',
            'POST   /api/translate/text',
            'GET    /api/docs'
        ]
    });
});

// Todas las demás rutas van a la interfaz web
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'web', 'index.html'));
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('🚨 Error del sistema:', err.stack);
    const language = req.language || 'es';
    
    res.status(500).json({
        error: TranslationSystem.translate("Error interno del sistema", language),
        sistema: "InterMappler",
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID') || 'unknown',
        language: language,
        error_code: 'INTERNAL_SERVER_ERROR',
        support_contact: "support@intermappler.org"
    });
});

// ========== SISTEMA DE TRADUCCIÓN ==========
// Crear el directorio para el sistema de traducción
const translationDir = path.join(__dirname, 'base', 'utils');
if (!fs.existsSync(translationDir)) {
    fs.mkdirSync(translationDir, { recursive: true });
}

// Crear el archivo translator.js
const translatorPath = path.join(translationDir, 'translator.js');
if (!fs.existsSync(translatorPath)) {
    const translatorCode = `
// Sistema de Traducción para InterMappler

class TranslationSystem {
    constructor() {
        this.languages = this.loadLanguages();
        this.translations = this.loadTranslations();
        this.defaultLanguage = 'es';
        this.autoDetect = true;
    }

    loadLanguages() {
        return [
            { code: 'es', name: 'Español', native_name: 'Español', region: 'ES' },
            { code: 'en', name: 'Inglés', native_name: 'English', region: 'US' },
            { code: 'fr', name: 'Francés', native_name: 'Français', region: 'FR' },
            { code: 'de', name: 'Alemán', native_name: 'Deutsch', region: 'DE' },
            { code: 'it', name: 'Italiano', native_name: 'Italiano', region: 'IT' },
            { code: 'pt', name: 'Portugués', native_name: 'Português', region: 'PT' },
            { code: 'ru', name: 'Ruso', native_name: 'Русский', region: 'RU' },
            { code: 'zh', name: 'Chino', native_name: '中文', region: 'CN' },
            { code: 'ja', name: 'Japonés', native_name: '日本語', region: 'JP' },
            { code: 'ko', name: 'Coreano', native_name: '한국어', region: 'KR' },
            { code: 'ar', name: 'Árabe', native_name: 'العربية', region: 'SA' },
            { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', region: 'IN' }
        ];
    }

    loadTranslations() {
        // Base de datos de traducciones
        return {
            // Términos del sistema
            'InterMappler': {
                es: 'InterMappler',
                en: 'InterMappler',
                fr: 'InterMappler',
                de: 'InterMappler'
            },
            'Sistema de Mapeo Inteligente': {
                es: 'Sistema de Mapeo Inteligente',
                en: 'Intelligent Mapping System',
                fr: 'Système de Cartographie Intelligente',
                de: 'Intelligentes Kartierungssystem'
            },
            
            // Mensajes de autenticación
            'Usuario no encontrado': {
                es: 'Usuario no encontrado',
                en: 'User not found',
                fr: 'Utilisateur non trouvé',
                de: 'Benutzer nicht gefunden'
            },
            'Contraseña incorrecta': {
                es: 'Contraseña incorrecta',
                en: 'Incorrect password',
                fr: 'Mot de passe incorrect',
                de: 'Falsches Passwort'
            },
            'Login exitoso': {
                es: 'Login exitoso',
                en: 'Login successful',
                fr: 'Connexion réussie',
                de: 'Anmeldung erfolgreich'
            },
            
            // Roles del sistema
            'Ingeniero de Mapa': {
                es: 'Ingeniero de Mapa',
                en: 'Map Engineer',
                fr: 'Ingénieur Cartographe',
                de: 'Karteningenieur'
            },
            'Administrador': {
                es: 'Administrador',
                en: 'Administrator',
                fr: 'Administrateur',
                de: 'Administrator'
            },
            'Agente de Inteligencia': {
                es: 'Agente de Inteligencia',
                en: 'Intelligence Agent',
                fr: 'Agent de Renseignement',
                de: 'Geheimdienstagent'
            },
            'Personal Militar': {
                es: 'Personal Militar',
                en: 'Military Personnel',
                fr: 'Personnel Militaire',
                de: 'Militärpersonal'
            },
            'Agente de Policía': {
                es: 'Agente de Policía',
                en: 'Police Officer',
                fr: 'Agent de Police',
                de: 'Polizeibeamter'
            },
            'Especialista': {
                es: 'Especialista',
                en: 'Specialist',
                fr: 'Spécialiste',
                de: 'Spezialist'
            },
            'Usuario Público': {
                es: 'Usuario Público',
                en: 'Public User',
                fr: 'Utilisateur Public',
                de: 'Öffentlicher Benutzer'
            },
            
            // Estados y mensajes
            'activo': {
                es: 'activo',
                en: 'active',
                fr: 'actif',
                de: 'aktiv'
            },
            'inactivo': {
                es: 'inactivo',
                en: 'inactive',
                fr: 'inactif',
                de: 'inaktiv'
            },
            'protegido': {
                es: 'protegido',
                en: 'protected',
                fr: 'protégé',
                de: 'geschützt'
            },
            'Error interno del sistema': {
                es: 'Error interno del sistema',
                en: 'Internal system error',
                fr: 'Erreur interne du système',
                de: 'Interner Systemfehler'
            },
            
            // Términos de seguridad
            '3-capas-activa': {
                es: '3-capas-activa',
                en: '3-layers-active',
                fr: '3-couches-actives',
                de: '3-Schichten-aktiv'
            },
            'alto': {
                es: 'alto',
                en: 'high',
                fr: 'élevé',
                de: 'hoch'
            },
            'máxima': {
                es: 'máxima',
                en: 'maximum',
                fr: 'maximale',
                de: 'maximal'
            }
        };
    }

    translate(text, targetLanguage, sourceLanguage = 'auto') {
        if (!text) return text;
        
        // Validar idioma objetivo
        targetLanguage = this.validateLanguage(targetLanguage);
        
        // Si el texto ya está en el idioma objetivo, no traducir
        if (sourceLanguage !== 'auto' && sourceLanguage === targetLanguage) {
            return text;
        }
        
        // Buscar traducción en la base de datos
        const translation = this.translations[text];
        if (translation && translation[targetLanguage]) {
            return translation[targetLanguage];
        }
        
        // Si no hay traducción específica, intentar traducción automática
        if (targetLanguage !== this.defaultLanguage) {
            return this.autoTranslate(text, targetLanguage);
        }
        
        // Devolver texto original si no hay traducción
        return text;
    }

    translateObject(obj, targetLanguage, sourceLanguage = 'auto') {
        if (!obj || typeof obj !== 'object') return obj;
        
        targetLanguage = this.validateLanguage(targetLanguage);
        
        const translated = Array.isArray(obj) ? [] : {};
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                // No traducir keys específicas
                if (this.shouldSkipKey(key)) {
                    translated[key] = value;
                    continue;
                }
                
                if (typeof value === 'string') {
                    // Traducir strings
                    translated[key] = this.translate(value, targetLanguage, sourceLanguage);
                } else if (typeof value === 'object' && value !== null) {
                    // Recursividad para objetos anidados
                    translated[key] = this.translateObject(value, targetLanguage, sourceLanguage);
                } else {
                    // Mantener otros tipos de datos
                    translated[key] = value;
                }
            }
        }
        
        // Añadir metadata de traducción
        if (!translated._translation && typeof translated === 'object' && !Array.isArray(translated)) {
            translated._translation = {
                source_language: sourceLanguage === 'auto' ? this.detectLanguage(JSON.stringify(obj)).language : sourceLanguage,
                target_language: targetLanguage,
                auto_translated: true,
                timestamp: new Date().toISOString()
            };
        }
        
        return translated;
    }

    autoTranslate(text, targetLanguage) {
        // Simulación de traducción automática
        // En producción se integraría con Google Translate, DeepL, etc.
        
        const translationMap = {
            // Mapeo básico para demostración
            'hello': {
                es: 'hola',
                fr: 'bonjour',
                de: 'hallo'
            },
            'world': {
                es: 'mundo',
                fr: 'monde',
                de: 'welt'
            },
            'map': {
                es: 'mapa',
                fr: 'carte',
                de: 'karte'
            },
            'system': {
                es: 'sistema',
                fr: 'système',
                de: 'system'
            }
        };
        
        // Buscar palabras individuales
        const words = text.toLowerCase().split(' ');
        const translatedWords = words.map(word => {
            if (translationMap[word] && translationMap[word][targetLanguage]) {
                return translationMap[word][targetLanguage];
            }
            return word;
        });
        
        return translatedWords.join(' ');
    }

    detectLanguage(text) {
        // Detección simple de idioma basada en caracteres comunes
        const patterns = {
            en: /[a-z]/i,
            es: /[áéíóúñ]/i,
            fr: /[àâçéèêëîïôûùüÿ]/i,
            de: /[äöüß]/i,
            ru: /[а-я]/i,
            zh: /[\u4e00-\u9fff]/,
            ja: /[\u3040-\u309f\u30a0-\u30ff]/,
            ko: /[\uac00-\ud7af]/,
            ar: /[\u0600-\u06ff]/
        };
        
        let maxScore = 0;
        let detectedLang = this.defaultLanguage;
        
        for (const [lang, pattern] of Object.entries(patterns)) {
            const matches = (text.match(pattern) || []).length;
            if (matches > maxScore) {
                maxScore = matches;
                detectedLang = lang;
            }
        }
        
        return {
            language: detectedLang,
            confidence: maxScore / text.length || 0.1,
            iso_code: detectedLang
        };
    }

    validateLanguage(lang) {
        const validLanguages = this.languages.map(l => l.code);
        return validLanguages.includes(lang) ? lang : this.defaultLanguage;
    }

    getAvailableLanguages() {
        return this.languages;
    }

    getLanguageName(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.name : 'Unknown';
    }

    getNativeName(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.native_name : 'Unknown';
    }

    getRegion(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.region : 'Unknown';
    }

    shouldSkipKey(key) {
        // Keys que no deben traducirse
        const skipKeys = [
            'id', '_id', 'timestamp', 'createdAt', 'updatedAt',
            'email', 'username', 'password', 'token', 'sessionId',
            'ip', 'coordinates', 'url', 'path', 'method',
            'code', 'error_code', 'status_code', 'version',
            'hash', 'encrypted', 'signature', 'key'
        ];
        
        return skipKeys.includes(key) || 
               key.startsWith('_') || 
               /^[0-9]+$/.test(key);
    }

    countTranslatedItems(original, translated) {
        let count = 0;
        
        const countStrings = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    
                    if (typeof value === 'string' && !this.shouldSkipKey(key)) {
                        count++;
                    } else if (typeof value === 'object' && value !== null) {
                        countStrings(value);
                    }
                }
            }
        };
        
        countStrings(original);
        return count;
    }

    // Métodos para añadir traducciones dinámicamente
    addTranslation(key, translations) {
        if (!this.translations[key]) {
            this.translations[key] = {};
        }
        
        Object.assign(this.translations[key], translations);
        return true;
    }

    removeTranslation(key, language = null) {
        if (!language) {
            delete this.translations[key];
        } else if (this.translations[key]) {
            delete this.translations[key][language];
        }
        return true;
    }

    // Estadísticas de traducción
    getTranslationStats() {
        const totalKeys = Object.keys(this.translations).length;
        const languageCounts = {};
        
        for (const key in this.translations) {
            for (const lang in this.translations[key]) {
                languageCounts[lang] = (languageCounts[lang] || 0) + 1;
            }
        }
        
        return {
            total_translations: totalKeys,
            languages: languageCounts,
            coverage: Object.keys(languageCounts).length,
            default_language: this.defaultLanguage
        };
    }
}

// Singleton global
module.exports = new TranslationSystem();
`;
    
    fs.writeFileSync(translatorPath, translatorCode);
    console.log('✅ Sistema de traducción creado:', translatorPath);
}

// Cargar el sistema de traducción
const TranslationSystem = require('./base/utils/translator');

// Inicializar sistema
async function inicializarSistema() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 INTERMAPPLER - Sistema de Mapeo Inteligente');
    console.log('='.repeat(80));
    
    // Encriptar datos iniciales de admin
    try {
        const datosAdmin = {
            rol: "administrador",
            permisos: ["full_access", "security_management", "user_management"],
            configuracion: {
                tema: "dark",
                idioma: "es",
                seguridad: "maxima"
            }
        };
        
        cuentas[0].datosEncriptados = await encryptData(datosAdmin, 3);
        console.log('✅ Sistema de encriptación inicializado');
        console.log(`✅ Cuenta admin protegida con 3 capas`);
    } catch (error) {
        console.error('❌ Error al inicializar encriptación:', error.message);
    }
    
    // Mostrar información de traducción
    const translationStats = TranslationSystem.getTranslationStats();
    console.log('🌐 Sistema de traducción activado');
    console.log(`   Idiomas soportados: ${translationStats.coverage}`);
    console.log(`   Traducciones cargadas: ${translationStats.total_translations}`);
    
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log(`🌐 Interfaz: http://localhost:${PORT}/`);
    console.log(`🔐 Login: http://localhost:${PORT}/login`);
    console.log(`🛡️  Seguridad: 3 Capas activadas`);
    console.log(`💾 Cuentas: ${cuentas.length} registradas`);
    console.log('='.repeat(80));
    
    // Mostrar comandos útiles
    console.log('\n📝 Comandos útiles:');
    console.log('   curl -H "X-Language: en" http://localhost:3000/api/estado');
    console.log('   curl -H "X-Language: fr" http://localhost:3000/api/auth/roles');
    console.log('   curl -X POST http://localhost:3000/api/translate/text \\');
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"text": "Hello World", "target_language": "es"}\'');
}

// Iniciar servidor
const server = app.listen(PORT, async () => {
    await inicializarSistema();
});

// Manejo de cierre elegante
process.on('SIGTERM', () => {
    console.log('\n🔒 Cerrando InterMappler de forma segura...');
    
    const estadoCierre = {
        timestamp: new Date().toISOString(),
        estadisticas: serverStats,
        cuentas: cuentas.length,
        duracionSesion: process.uptime(),
        languages_used: serverStats.languagesUsed
    };
    
    fs.writeFileSync(
        path.join(__dirname, 'base', 'session_backup.json'),
        JSON.stringify(estadoCierre, null, 2)
    );
    
    server.close(() => {
        console.log('✅ InterMappler cerrado correctamente');
        process.exit(0);
    });
});

// Exportar para testing
module.exports = { app, server, TranslationSystem };