// Sistema de Gestión de Sesiones - 7 Tipos Jerárquicos

class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.activeUsers = new Map();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.cleanupInterval = 5 * 60 * 1000; // 5 minutos
        
        // Iniciar limpieza periódica
        setInterval(() => this.cleanupSessions(), this.cleanupInterval);
        
        // Usuarios demo por defecto (en producción vendrían de BD)
        this.initializeDemoUsers();
    }

    // Definición de los 7 tipos de sesión
    static ROLES = {
        // 1. Ingeniero de Mapa (Nivel Superior)
        MAP_ENGINEER: {
            id: 1,
            name: 'Ingeniero de Mapa',
            level: 100,
            description: 'Acceso completo al sistema, gestión de mapas y supervisión',
            permissions: [
                'full_system_access',
                'map_creation',
                'map_editing',
                'user_management',
                'data_analysis',
                'system_configuration',
                'security_override'
            ],
            color: '#FF6B35', // Naranja intenso
            icon: 'fas fa-cogs'
        },

        // 2. Administrador/Moderador
        ADMINISTRATOR: {
            id: 2,
            name: 'Administrador',
            level: 90,
            description: 'Gestión de usuarios y contenido, moderación del sistema',
            permissions: [
                'user_management',
                'content_moderation',
                'system_monitoring',
                'reports_access',
                'basic_configuration'
            ],
            color: '#4ECDC4', // Turquesa
            icon: 'fas fa-user-shield'
        },

        // 3. Inteligencia (CIA/FBI/MI6 equivalente)
        INTELLIGENCE: {
            id: 3,
            name: 'Agente de Inteligencia',
            level: 80,
            description: 'Acceso a datos clasificados y análisis avanzado',
            permissions: [
                'classified_data_access',
                'advanced_analysis',
                'real_time_monitoring',
                'threat_detection',
                'secure_communications'
            ],
            color: '#1A535C', // Azul oscuro
            icon: 'fas fa-user-secret'
        },

        // 4. Militar
        MILITARY: {
            id: 4,
            name: 'Personal Militar',
            level: 70,
            description: 'Acceso a datos estratégicos y operativos',
            permissions: [
                'strategic_data',
                'operation_planning',
                'resource_tracking',
                'secure_messaging'
            ],
            color: '#45B7D1', // Azul militar
            icon: 'fas fa-fighter-jet'
        },

        // 5. Policía/Seguridad
        POLICE: {
            id: 5,
            name: 'Agente de Policía',
            level: 60,
            description: 'Acceso a datos de seguridad pública',
            permissions: [
                'public_safety_data',
                'incident_tracking',
                'patrol_management',
                'emergency_response'
            ],
            color: '#96CEB4', // Verde policía
            icon: 'fas fa-shield-alt'
        },

        // 6. Roles Comunes Especializados (sin jerarquía entre ellos)
        SPECIALIST_COMMON: {
            id: 6,
            name: 'Especialista',
            level: 50,
            description: 'Roles especializados en análisis de datos',
            subroles: {
                PERIODISTA: {
                    name: 'Periodista',
                    permissions: ['news_access', 'event_tracking', 'report_creation'],
                    icon: 'fas fa-newspaper',
                    color: '#FFEAA7'
                },
                ASTROLOGO: {
                    name: 'Astrólogo',
                    permissions: ['astrological_data', 'pattern_analysis'],
                    icon: 'fas fa-star',
                    color: '#DDA0DD'
                },
                ASTRONOMO: {
                    name: 'Astrónomo',
                    permissions: ['astronomical_data', 'celestial_tracking'],
                    icon: 'fas fa-moon',
                    color: '#87CEEB'
                },
                METEOROLOGO: {
                    name: 'Meteorólogo',
                    permissions: ['weather_data', 'climate_analysis', 'forecasting'],
                    icon: 'fas fa-cloud-sun',
                    color: '#4682B4'
                },
                GEOLOGO: {
                    name: 'Geólogo',
                    permissions: ['geological_data', 'seismic_monitoring'],
                    icon: 'fas fa-mountain',
                    color: '#8B4513'
                },
                SOCIOLOGO: {
                    name: 'Sociólogo',
                    permissions: ['social_data', 'demographic_analysis'],
                    icon: 'fas fa-users',
                    color: '#9370DB'
                }
            }
        },

        // 7. Usuario Común (sin login específico)
        COMMON_USER: {
            id: 7,
            name: 'Usuario Público',
            level: 10,
            description: 'Acceso limitado a datos públicos para salvar vidas',
            permissions: [
                'public_map_access',
                'emergency_alerts',
                'basic_weather',
                'traffic_info'
            ],
            color: '#95E1D3', // Verde claro
            icon: 'fas fa-user'
        }
    };

    initializeDemoUsers() {
        this.demoUsers = [
            {
                username: 'engineer_alpha',
                password: 'MapMaster2024!', // En producción: hash
                role: SessionManager.ROLES.MAP_ENGINEER,
                fullName: 'Alexandra Chen',
                email: 'alex.chen@intermappler.org',
                organization: 'InterMappler Core Team',
                specialization: 'Spatial Data Engineering',
                avatar: '🧑‍💻'
            },
            {
                username: 'admin_nova',
                password: 'AdminSecure123!',
                role: SessionManager.ROLES.ADMINISTRATOR,
                fullName: 'Marcus Nova',
                email: 'm.nova@intermappler.org',
                organization: 'System Administration',
                specialization: 'Security & Operations',
                avatar: '👨‍💼'
            },
            {
                username: 'intel_shadow',
                password: 'ShadowOps99!',
                role: SessionManager.ROLES.INTELLIGENCE,
                fullName: 'Samantha Reyes',
                email: 's.reyes@secure.intel',
                organization: 'Global Intelligence Unit',
                specialization: 'Threat Analysis',
                avatar: '🕵️‍♀️'
            },
            {
                username: 'mil_command',
                password: 'TacticalCmd77!',
                role: SessionManager.ROLES.MILITARY,
                fullName: 'James O\'Connor',
                email: 'j.oconnor@defense.gov',
                organization: 'Strategic Command',
                specialization: 'Operational Planning',
                avatar: '🎖️'
            },
            {
                username: 'police_guard',
                password: 'BlueLine2024!',
                role: SessionManager.ROLES.POLICE,
                fullName: 'Maria Rodriguez',
                email: 'm.rodriguez@police.gov',
                organization: 'Metropolitan Police',
                specialization: 'Public Safety',
                avatar: '👮‍♀️'
            },
            {
                username: 'reporter_news',
                password: 'TruthSeeker88!',
                role: SessionManager.ROLES.SPECIALIST_COMMON,
                subrole: 'PERIODISTA',
                fullName: 'David Park',
                email: 'd.park@globalnews.org',
                organization: 'Global News Network',
                specialization: 'Crisis Reporting',
                avatar: '📰'
            },
            {
                username: 'astro_sky',
                password: 'StarGazer66!',
                role: SessionManager.ROLES.SPECIALIST_COMMON,
                subrole: 'ASTRONOMO',
                fullName: 'Dr. Elena Vasquez',
                email: 'e.vasquez@observatory.edu',
                organization: 'International Observatory',
                specialization: 'Celestial Tracking',
                avatar: '🔭'
            },
            {
                username: 'weather_pro',
                password: 'StormChaser44!',
                role: SessionManager.ROLES.SPECIALIST_COMMON,
                subrole: 'METEOROLOGO',
                fullName: 'Robert Storm',
                email: 'r.storm@weather.gov',
                organization: 'National Weather Service',
                specialization: 'Extreme Weather',
                avatar: '⛈️'
            }
        ];

        // Hashear contraseñas (en producción sería más seguro)
        this.demoUsers.forEach(user => {
            user.passwordHash = this.hashPassword(user.password);
            delete user.password;
        });
    }

    async login(username, password, subrole = null) {
        // Validar credenciales
        const user = this.demoUsers.find(u => u.username === username);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar contraseña (en producción: bcrypt)
        const inputHash = this.hashPassword(password);
        if (inputHash !== user.passwordHash) {
            throw new Error('Contraseña incorrecta');
        }

        // Para roles especializados, verificar subrol
        if (user.role.id === SessionManager.ROLES.SPECIALIST_COMMON.id) {
            if (!subrole || !user.subrole || user.subrole !== subrole) {
                throw new Error('Subrol no especificado o incorrecto');
            }
        }

        // Crear sesión
        const sessionId = this.generateSessionId();
        const session = {
            sessionId,
            user: {
                ...user,
                passwordHash: undefined // No almacenar hash en sesión
            },
            loginTime: new Date(),
            lastActivity: new Date(),
            ipAddress: null, // Se asignará desde el request
            userAgent: null,
            permissions: this.getUserPermissions(user, subrole),
            status: 'active'
        };

        // Almacenar sesión
        this.sessions.set(sessionId, session);
        this.activeUsers.set(username, sessionId);

        // Registrar login
        this.logSecurityEvent('login_success', {
            username,
            role: user.role.name,
            subrole: subrole || 'N/A',
            sessionId,
            timestamp: new Date().toISOString()
        });

        return session;
    }

    logout(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.activeUsers.delete(session.user.username);
            this.sessions.delete(sessionId);
            
            this.logSecurityEvent('logout', {
                username: session.user.username,
                sessionId,
                duration: Date.now() - session.loginTime.getTime()
            });
            
            return true;
        }
        return false;
    }

    validateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        
        if (!session) {
            return { valid: false, reason: 'Sesión no encontrada' };
        }

        // Verificar tiempo de inactividad
        const inactiveTime = Date.now() - session.lastActivity.getTime();
        if (inactiveTime > this.sessionTimeout) {
            this.sessions.delete(sessionId);
            this.activeUsers.delete(session.user.username);
            
            this.logSecurityEvent('session_timeout', {
                username: session.user.username,
                sessionId,
                inactiveTime
            });
            
            return { valid: false, reason: 'Sesión expirada' };
        }

        // Actualizar última actividad
        session.lastActivity = new Date();
        this.sessions.set(sessionId, session);

        return {
            valid: true,
            session: this.sanitizeSessionData(session)
        };
    }

    getUserPermissions(user, subrole = null) {
        let permissions = [...user.role.permissions];
        
        // Añadir permisos específicos de subrol para especialistas
        if (user.role.id === SessionManager.ROLES.SPECIALIST_COMMON.id && subrole) {
            const subroleData = SessionManager.ROLES.SPECIALIST_COMMON.subroles[subrole];
            if (subroleData) {
                permissions = permissions.concat(subroleData.permissions);
            }
        }

        // Permisos jerárquicos: roles superiores heredan permisos inferiores
        const lowerRoles = Object.values(SessionManager.ROLES)
            .filter(role => role.level < user.role.level && role.level > 0);
        
        lowerRoles.forEach(role => {
            if (role.permissions) {
                permissions = permissions.concat(role.permissions);
            }
        });

        // Eliminar duplicados
        return [...new Set(permissions)];
    }

    sanitizeSessionData(session) {
        // Remover datos sensibles antes de enviar al cliente
        const sanitized = { ...session };
        delete sanitized.user.passwordHash;
        delete sanitized.ipAddress;
        delete sanitized.userAgent;
        
        return sanitized;
    }

    getRoleHierarchy() {
        return Object.values(SessionManager.ROLES)
            .filter(role => role.level > 0)
            .sort((a, b) => b.level - a.level)
            .map(role => ({
                id: role.id,
                name: role.name,
                level: role.level,
                description: role.description,
                color: role.color,
                icon: role.icon,
                subroles: role.subroles ? Object.keys(role.subroles) : null
            }));
    }

    getActiveSessions() {
        const active = [];
        for (const [sessionId, session] of this.sessions) {
            active.push({
                sessionId: sessionId.substring(0, 8) + '...',
                username: session.user.username,
                role: session.user.role.name,
                loginTime: session.loginTime,
                lastActivity: session.lastActivity,
                status: session.status
            });
        }
        return active;
    }

    // Métodos de utilidad
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    hashPassword(password) {
        // En producción usar bcrypt o similar
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(password + process.env.PASSWORD_SALT || 'InterMapplerSalt2024')
            .digest('hex');
    }

    logSecurityEvent(eventType, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: eventType,
            ...data
        };

        // En producción: guardar en base de datos o archivo
        console.log('🔐 SECURITY LOG:', logEntry);

        // Guardar en archivo
        const fs = require('fs');
        const path = require('path');
        const logFile = path.join(__dirname, '..', 'security-logs.json');
        
        try {
            let logs = [];
            if (fs.existsSync(logFile)) {
                logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
            }
            logs.push(logEntry);
            fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Error escribiendo log:', error);
        }
    }

    cleanupSessions() {
        const now = Date.now();
        let cleaned = 0;

        for (const [sessionId, session] of this.sessions) {
            const inactiveTime = now - session.lastActivity.getTime();
            if (inactiveTime > this.sessionTimeout) {
                this.sessions.delete(sessionId);
                this.activeUsers.delete(session.user.username);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Limpiadas ${cleaned} sesiones inactivas`);
        }
    }

    // Métodos para estadísticas
    getSessionStats() {
        return {
            totalSessions: this.sessions.size,
            activeUsers: this.activeUsers.size,
            rolesBreakdown: this.getRolesBreakdown(),
            averageSessionTime: this.calculateAverageSessionTime(),
            loginAttempts: this.getLoginAttemptsStats()
        };
    }

    getRolesBreakdown() {
        const breakdown = {};
        for (const session of this.sessions.values()) {
            const roleName = session.user.role.name;
            breakdown[roleName] = (breakdown[roleName] || 0) + 1;
        }
        return breakdown;
    }

    calculateAverageSessionTime() {
        if (this.sessions.size === 0) return 0;
        
        let totalTime = 0;
        for (const session of this.sessions.values()) {
            totalTime += Date.now() - session.loginTime.getTime();
        }
        
        return Math.round(totalTime / this.sessions.size / 60000); // en minutos
    }

    getLoginAttemptsStats() {
        // En producción se registrarían los intentos
        return {
            successful: this.sessions.size,
            failed: 0, // Se actualizaría con sistema de tracking
            suspicious: 0
        };
    }
}

// Singleton global
module.exports = new SessionManager();