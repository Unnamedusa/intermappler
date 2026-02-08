const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { encryptData, decryptData } = require('./base/incript/orchestrator');
const LoginSystem = require('./base/auth/login-system');
const SessionManager = require('./base/auth/session-manager');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// ========== SISTEMA DE TRADUCCIÓN ==========
// Primero crear/verificar el sistema de traducción antes de usarlo
const translationDir = path.join(__dirname, 'base', 'utils');
if (!fs.existsSync(translationDir)) {
    fs.mkdirSync(translationDir, { recursive: true });
}

// Crear el archivo translator.js si no existe
const translatorPath = path.join(translationDir, 'translator.js');
if (!fs.existsSync(translatorPath)) {
    const translatorCode = `// Sistema de Traducción Ultra-Simple para InterMappler
class TranslationSystem {
    constructor() {
        this.lang = 'es';
        this.translations = {
            'Iniciar Sesión': { es: 'Iniciar Sesión', en: 'Login', fr: 'Connexion', de: 'Anmelden' },
            'Usuario': { es: 'Usuario', en: 'User', fr: 'Utilisateur', de: 'Benutzer' },
            'Contraseña': { es: 'Contraseña', en: 'Password', fr: 'Mot de passe', de: 'Passwort' },
            'Acceso Público': { es: 'Acceso Público', en: 'Public Access', fr: 'Accès Public', de: 'Öffentlicher Zugang' },
            'Acceso Seguro': { es: 'Acceso Seguro', en: 'Secure Access', fr: 'Accès Sécurisé', de: 'Sicherer Zugang' },
            'Administrador': { es: 'Administrador', en: 'Administrator', fr: 'Administrateur', de: 'Administrator' },
            'Especialista': { es: 'Especialista', en: 'Specialist', fr: 'Spécialiste', de: 'Spezialist' },
            'Usuario no encontrado': { es: 'Usuario no encontrado', en: 'User not found', fr: 'Utilisateur non trouvé', de: 'Benutzer nicht gefunden' },
            'Contraseña incorrecta': { es: 'Contraseña incorrecta', en: 'Incorrect password', fr: 'Mot de passe incorrect', de: 'Falsches Passwort' },
            'Login exitoso': { es: 'Login exitoso', en: 'Login successful', fr: 'Connexion réussie', de: 'Anmeldung erfolgreich' },
            'activo': { es: 'activo', en: 'active', fr: 'actif', de: 'aktiv' },
            'inactivo': { es: 'inactivo', en: 'inactive', fr: 'inactif', de: 'inaktiv' },
            'protegido': { es: 'protegido', en: 'protected', fr: 'protégé', de: 'geschützt' },
            'Error interno del sistema': { es: 'Error interno del sistema', en: 'Internal system error', fr: 'Erreur interne du système', de: 'Interner Systemfehler' },
            '3-capas-activa': { es: '3-capas-activa', en: '3-layers-active', fr: '3-couches-actives', de: '3-Schichten-aktiv' },
            'alto': { es: 'alto', en: 'high', fr: 'élevé', de: 'hoch' },
            'máxima': { es: 'máxima', en: 'maximum', fr: 'maximale', de: 'maximal' },
            'Ingeniero de Mapa': { es: 'Ingeniero de Mapa', en: 'Map Engineer', fr: 'Ingénieur Cartographe', de: 'Karteningenieur' },
            'Agente de Inteligencia': { es: 'Agente de Inteligencia', en: 'Intelligence Agent', fr: 'Agent de Renseignement', de: 'Geheimdienstagent' },
            'Personal Militar': { es: 'Personal Militar', en: 'Military Personnel', fr: 'Personnel Militaire', de: 'Militärpersonal' },
            'Agente de Policía': { es: 'Agente de Policía', en: 'Police Officer', fr: 'Agent de Police', de: 'Polizeibeamter' },
            'Usuario Público': { es: 'Usuario Público', en: 'Public User', fr: 'Utilisateur Public', de: 'Öffentlicher Benutzer' },
            'Sistema de Mapeo Inteligente': { es: 'Sistema de Mapeo Inteligente', en: 'Intelligent Mapping System', fr: 'Système de Cartographie Intelligente', de: 'Intelligentes Kartierungssystem' }
        };
    }

    setLanguage(lang) {
        this.lang = ['es', 'en', 'fr', 'de', 'it', 'pt'].includes(lang) ? lang : 'es';
        return this;
    }

    translate(text, lang = this.lang) {
        if (!text) return '';
        
        if (this.translations[text] && this.translations[text][lang]) {
            return this.translations[text][lang];
        }
        
        return text;
    }

    translateObject(obj, lang = this.lang) {
        if (!obj || typeof obj !== 'object') return obj;
        
        const result = Array.isArray(obj) ? [] : {};
        
        for (const key in obj) {
            const value = obj[key];
            
            if (typeof value === 'string' && !this.shouldSkipKey(key)) {
                result[key] = this.translate(value, lang);
            } else if (value && typeof value === 'object') {
                result[key] = this.translateObject(value, lang);
            } else {
                result[key] = value;
            }
        }
        
        if (typeof result === 'object' && !Array.isArray(result)) {
            result._translation = {
                target_language: lang,
                timestamp: new Date().toISOString()
            };
        }
        
        return result;
    }

    detectLanguage(text) {
        const patterns = {
            es: /[áéíóúñ]/gi,
            fr: /[àâçéèêëîïôûùüÿ]/gi,
            de: /[äöüß]/gi,
            ru: /[а-я]/gi,
            zh: /[\u4e00-\u9fff]/g,
            ja: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g,
            ko: /[\uac00-\ud7af]/g,
            ar: /[\u0600-\u06ff]/g
        };
        
        let maxScore = 0;
        let detected = 'es';
        
        for (const [lang, pattern] of Object.entries(patterns)) {
            const matches = (text.match(pattern) || []).length;
            if (matches > maxScore) {
                maxScore = matches;
                detected = lang;
            }
        }
        
        return {
            language: detected,
            confidence: Math.min((maxScore / text.length) * 100, 100) || 10
        };
    }

    validateLanguage(lang) {
        if (!lang) return 'es';
        const normalized = String(lang).toLowerCase().split('-')[0];
        return ['es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar'].includes(normalized) 
            ? normalized 
            : 'es';
    }

    getAvailableLanguages() {
        return [
            { code: 'es', name: 'Español', native_name: 'Español' },
            { code: 'en', name: 'Inglés', native_name: 'English' },
            { code: 'fr', name: 'Francés', native_name: 'Français' },
            { code: 'de', name: 'Alemán', native_name: 'Deutsch' },
            { code: 'it', name: 'Italiano', native_name: 'Italiano' },
            { code: 'pt', name: 'Portugués', native_name: 'Português' },
            { code: 'ru', name: 'Ruso', native_name: 'Русский' },
            { code: 'zh', name: 'Chino', native_name: '中文' },
            { code: 'ja', name: 'Japonés', native_name: '日本語' },
            { code: 'ko', name: 'Coreano', native_name: '한국어' },
            { code: 'ar', name: 'Árabe', native_name: 'العربية' }
        ];
    }

    shouldSkipKey(key) {
        const skip = ['id', '_id', 'email', 'password', 'token', 'sessionId', 'url', 'ip', 'coordinates'];
        return skip.includes(key) || key.startsWith('_') || /^\\d+$/.test(key) || key.includes('_id') || key.includes('url');
    }

    countTranslatedItems(original) {
        let count = 0;
        const countStrings = (obj) => {
            for (const key in obj) {
                const value = obj[key];
                if (typeof value === 'string' && !this.shouldSkipKey(key)) {
                    count++;
                } else if (value && typeof value === 'object') {
                    countStrings(value);
                }
            }
        };
        if (original && typeof original === 'object') {
            countStrings(original);
        }
        return count;
    }

    addTranslation(key, translations) {
        this.translations[key] = { ...this.translations[key], ...translations };
        return true;
    }

    getTranslationStats() {
        return {
            total_keys: Object.keys(this.translations).length,
            supported_languages: 11,
            default_language: 'es'
        };
    }
}

module.exports = new TranslationSystem();`;
    
    fs.writeFileSync(translatorPath, translatorCode);
    console.log('✅ Sistema de traducción creado:', translatorPath);
}

// AHORA cargar el sistema de traducción
const TranslationSystem = require('./base/utils/translator');

// ========== MIDDLEWARE ==========

// Middleware CORS
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
    // Detectar idioma
    const languageSources = [
        req.headers['x-language'],
        req.query.lang,
        req.acceptsLanguages().shift()
    ];
    
    const detectedLang = languageSources.find(lang => lang) || 'es';
    req.language = TranslationSystem.validateLanguage(detectedLang);
    
    // Headers de respuesta
    res.setHeader('Content-Language', req.language);
    res.setHeader('X-Detected-Language', req.language);
    
    next();
});

// Middleware de traducción automática
app.use((req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        const shouldTranslate = req.headers['x-translate'] === 'true' || 
                               req.query.translate === 'true';
        
        if (shouldTranslate && data && typeof data === 'object') {
            data = TranslationSystem.translateObject(data, req.language);
            
            if (!data._translation) {
                data._translation = {
                    target_language: req.language,
                    timestamp: new Date().toISOString(),
                    auto_translated: true
                };
            }
        }
        
        return originalJson.call(this, data);
    };
    
    next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'web'), {
    setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    }
}));

// ========== SISTEMA DE CUENTAS ==========

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
    
    // Registrar idioma
    const lang = req.language;
    serverStats.languagesUsed[lang] = (serverStats.languagesUsed[lang] || 0) + 1;
    
    // Detectar patrones sospechosos
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    
    const patronesSospechosos = [
        /sqlmap/i, /nikto/i, /metasploit/i, /nmap/i,
        /union.*select/i, /drop.*table/i, /<script>/i, /etc.*passwd/i
    ];
    
    let esSospechoso = false;
    const url = req.url.toLowerCase();
    const bodyString = JSON.stringify(req.body || {}).toLowerCase();
    
    for (const patron of patronesSospechosos) {
        if (patron.test(url) || patron.test(bodyString) || patron.test(userAgent)) {
            esSospechoso = true;
            serverStats.intentosHackeo++;
            console.warn(`🚨 Intento sospechoso - IP: ${ip}, Idioma: ${lang}`);
            break;
        }
    }
    
    // Estadísticas
    serverStats.totalRequests++;
    const endpoint = req.path;
    serverStats.endpointsCalled[endpoint] = (serverStats.endpointsCalled[endpoint] || 0) + 1;
    
    // Interceptar respuesta
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        serverStats.averageResponseTime = 
            (serverStats.averageResponseTime * (serverStats.totalRequests - 1) + duration) / serverStats.totalRequests;
        
        // Headers de respuesta
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Request-ID', requestId);
        res.setHeader('X-Language-Served', lang);
        
        if (esSospechoso) {
            serverStats.hackersBloqueados++;
            const respuestaFalsa = {
                status: "success",
                message: "Acceso concedido",
                fake: true,
                sneakerMode: "active"
            };
            return originalSend.call(this, JSON.stringify(respuestaFalsa));
        }
        
        originalSend.call(this, data);
    };
    
    next();
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
    return {
        usuario: "admin",
        token: "fake_token_" + Math.random().toString(36).substr(2, 16),
        session_id: "fake_session_" + Math.random().toString(36).substr(2, 24),
        fake: true
    };
}

function activarModoSneaker(ip, userAgent) {
    console.log(`🛡️  Modo Sneaker activado para IP: ${ip}`);
    
    const logEntry = {
        timestamp: new Date().toISOString(),
        ip,
        userAgent,
        accion: "sneaker_activado"
    };
    
    const logDir = path.join(__dirname, 'base');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(
        path.join(logDir, 'security.log'),
        JSON.stringify(logEntry) + '\n'
    );
}

// ========== ENDPOINTS ==========

// Ruta principal
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
        
        if (!username || !password) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Usuario y contraseña requeridos', req.language),
                error_code: 'MISSING_CREDENTIALS'
            });
        }

        // Validar usuario
        const validUserTypes = SessionManager.ROLES ? Object.keys(SessionManager.ROLES) : [];
        if (userType && validUserTypes.length > 0 && !validUserTypes.includes(userType)) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Tipo de usuario inválido', req.language),
                error_code: 'INVALID_USER_TYPE'
            });
        }

        // Aquí iría la autenticación real
        // Por ahora simulamos un login exitoso para admin/admin
        let authResult;
        if (username === 'admin' && password === 'admin') {
            authResult = {
                success: true,
                message: TranslationSystem.translate('Login exitoso', language),
                token: 'demo_token_' + Math.random().toString(36).substr(2),
                session_id: 'session_' + Math.random().toString(36).substr(2),
                user: {
                    username: 'admin',
                    role: 'Administrador',
                    preferredLanguage: language
                }
            };
        } else {
            authResult = {
                success: false,
                error: TranslationSystem.translate('Credenciales incorrectas', language),
                error_code: 'INVALID_CREDENTIALS'
            };
        }

        res.json(authResult);

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            error: TranslationSystem.translate('Error interno del sistema', req.language),
            error_code: 'SERVER_ERROR'
        });
    }
});

// Validar sesión
app.get('/api/auth/validate', (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        
        if (!sessionId) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Session ID requerido', req.language),
                error_code: 'MISSING_SESSION_ID'
            });
        }

        // Simulación de validación
        const response = {
            valid: sessionId.includes('session_'), // Simulación simple
            user: {
                username: 'admin',
                role: 'Administrador'
            },
            permissions: ['read', 'write'],
            language: 'es'
        };
        
        res.json(response);
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error validando sesión', req.language),
            error_code: 'VALIDATION_ERROR'
        });
    }
});

// Estado del sistema
app.get('/api/estado', (req, res) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const response = {
        sistema: "InterMappler",
        version: "1.0.0",
        estado: "operativo",
        seguridad: {
            nivel: "3-capas",
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
        language: req.language
    };
    
    res.json(response);
});

// Encriptar datos
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
            message: error.message,
            error_code: 'ENCRYPTION_ERROR'
        });
    }
});

// Desencriptar datos
app.post('/api/desencriptar', async (req, res) => {
    try {
        const { datosEncriptados, clave } = req.body;
        
        if (!datosEncriptados || !clave) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Datos encriptados y clave requeridos', req.language),
                error_code: 'MISSING_PARAMS'
            });
        }
        
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
            message: TranslationSystem.translate('Datos desencriptados exitosamente', req.language)
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error en desencriptación', req.language),
            message: error.message,
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
        
        const existe = cuentas.some(c => c.usuario === usuario);
        if (existe) {
            return res.status(409).json({ 
                error: TranslationSystem.translate('Usuario ya existe', req.language),
                error_code: 'USER_EXISTS'
            });
        }
        
        const datosEncriptados = await encryptData(datos, 3);
        
        const nuevaCuenta = {
            id: cuentas.length + 1,
            usuario,
            datosEncriptados,
            metadata: {
                fechaCreacion: new Date().toISOString(),
                nivelSeguridad: "alto",
                capasActivadas: 3,
                language: language
            }
        };
        
        cuentas.push(nuevaCuenta);
        
        res.status(201).json({
            success: true,
            message: TranslationSystem.translate('Cuenta creada exitosamente', language),
            cuentaId: nuevaCuenta.id
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error al crear cuenta', req.language),
            message: error.message,
            error_code: 'ACCOUNT_CREATION_ERROR'
        });
    }
});

// Traducir texto
app.post('/api/translate/text', (req, res) => {
    try {
        const { text, target_language } = req.body;
        
        if (!text || !target_language) {
            return res.status(400).json({ 
                error: TranslationSystem.translate('Texto e idioma destino requeridos', req.language),
                error_code: 'MISSING_PARAMS'
            });
        }
        
        const translation = TranslationSystem.translate(text, target_language);
        
        res.json({
            success: true,
            original_text: text,
            translated_text: translation,
            target_language: target_language,
            confidence: 0.95,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: TranslationSystem.translate('Error en traducción', req.language),
            error_code: 'TRANSLATION_ERROR'
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
    
    res.json({
        success: true,
        languages: languages,
        total: languages.length,
        default_language: 'es',
        timestamp: new Date().toISOString(),
        current_language: req.language
    });
});

// Health check
app.get('/api/health', (req, res) => {
    const memoryUsage = process.memoryUsage();
    
    res.json({
        status: TranslationSystem.translate("healthy", req.language),
        sistema: "InterMappler",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        recursos: {
            memoria: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            uptime: process.uptime()
        },
        seguridad: TranslationSystem.translate("3-capas-activa", req.language),
        endpointsActivos: Object.keys(serverStats.endpointsCalled).length,
        language: req.language
    });
});

// Documentación de la API
app.get('/api/docs', (req, res) => {
    const docs = {
        name: TranslationSystem.translate('JSON Server API', req.language),
        version: "3.14",
        description: TranslationSystem.translate('Servidor JSON avanzado para Railway', req.language),
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        endpoints: [
            {
                method: 'GET',
                path: '/estado',
                description: TranslationSystem.translate('Estado del servidor y estadísticas', req.language)
            },
            {
                method: 'POST',
                path: '/auth/login',
                description: TranslationSystem.translate('Iniciar sesión en el sistema', req.language)
            },
            {
                method: 'POST',
                path: '/translate/text',
                description: TranslationSystem.translate('Traducir texto a otro idioma', req.language)
            }
        ],
        translation: {
            available: true,
            auto_detect: true,
            endpoint: '/api/translate'
        }
    };
    
    res.json(docs);
});

// Ruta 404 para API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: TranslationSystem.translate("Endpoint no encontrado", req.language),
        sistema: "InterMappler",
        requested: req.originalUrl,
        method: req.method,
        language: req.language,
        suggestion: TranslationSystem.translate("Visita /api/docs para documentación", req.language)
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
    
    res.status(500).json({
        error: TranslationSystem.translate("Error interno del sistema", req.language || 'es'),
        sistema: "InterMappler",
        timestamp: new Date().toISOString(),
        language: req.language || 'es',
        error_code: 'INTERNAL_SERVER_ERROR'
    });
});

// ========== INICIALIZACIÓN ==========

async function inicializarSistema() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 INTERMAPPLER - Sistema de Mapeo Inteligente');
    console.log('='.repeat(80));
    
    // Encriptar datos iniciales de admin
    try {
        const datosAdmin = {
            rol: "administrador",
            permisos: ["full_access", "security_management", "user_management"]
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
    console.log(`   Idiomas soportados: ${translationStats.supported_languages}`);
    console.log(`   Traducciones cargadas: ${translationStats.total_keys}`);
    
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log(`🌐 Interfaz: http://localhost:${PORT}/`);
    console.log(`🔐 Login: http://localhost:${PORT}/login`);
    console.log(`🛡️  Seguridad: 3 Capas activadas`);
    console.log(`💾 Cuentas: ${cuentas.length} registradas`);
    console.log('='.repeat(80));
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
        duracionSesion: process.uptime()
    };
    
    const baseDir = path.join(__dirname, 'base');
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(baseDir, 'session_backup.json'),
        JSON.stringify(estadoCierre, null, 2)
    );
    
    server.close(() => {
        console.log('✅ InterMappler cerrado correctamente');
        process.exit(0);
    });
});

// Exportar para testing
module.exports = { app, server, TranslationSystem };