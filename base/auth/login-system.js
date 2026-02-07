// Sistema de Login y Autenticación

const SessionManager = require('./session-manager');
const RoleHierarchy = require('./role-hierarchy');
const { encryptData } = require('../incript/orchestrator');

class LoginSystem {
    constructor() {
        this.sessionManager = SessionManager;
        this.roleHierarchy = RoleHierarchy;
        this.failedAttempts = new Map();
        this.maxAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutos
        this.loginHistory = [];
    }

    async authenticate(username, password, subrole = null, ipAddress = null, userAgent = null) {
        // Verificar si el usuario está bloqueado
        if (this.isUserLocked(username)) {
            throw new Error('Cuenta temporalmente bloqueada. Intente más tarde.');
        }

        try {
            // Intentar login
            const session = await this.sessionManager.login(username, password, subrole);
            
            // Añadir información de conexión
            session.ipAddress = ipAddress;
            session.userAgent = userAgent;
            this.sessionManager.sessions.set(session.sessionId, session);

            // Reiniciar contador de intentos fallidos
            this.failedAttempts.delete(username);

            // Registrar en historial
            this.logLoginHistory({
                username,
                status: 'success',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                role: session.user.role.name,
                subrole: subrole || 'N/A'
            });

            // Generar token seguro
            const authToken = await this.generateAuthToken(session);

            return {
                success: true,
                sessionId: session.sessionId,
                authToken,
                user: this.sanitizeUserData(session.user),
                permissions: session.permissions,
                expiresIn: this.sessionManager.sessionTimeout,
                loginTime: session.loginTime
            };

        } catch (error) {
            // Registrar intento fallido
            this.recordFailedAttempt(username, ipAddress);

            // Registrar en historial
            this.logLoginHistory({
                username,
                status: 'failed',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                error: error.message
            });

            throw error;
        }
    }

    async logout(sessionId) {
        return this.sessionManager.logout(sessionId);
    }

    validateToken(token, sessionId) {
        try {
            // Validar sesión
            const validation = this.sessionManager.validateSession(sessionId);
            
            if (!validation.valid) {
                return {
                    valid: false,
                    reason: validation.reason,
                    shouldLogout: true
                };
            }

            // Aquí podrías validar el token JWT si lo usas
            // Por ahora, validamos solo la sesión

            return {
                valid: true,
                session: validation.session,
                permissions: validation.session.permissions
            };

        } catch (error) {
            return {
                valid: false,
                reason: error.message,
                shouldLogout: true
            };
        }
    }

    async generateAuthToken(session) {
        // En producción usaríamos JWT o similar
        // Por ahora, creamos un token simple encriptado
        
        const tokenData = {
            sessionId: session.sessionId,
            userId: session.user.username,
            role: session.user.role.id,
            subrole: session.user.subrole || null,
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.sessionManager.sessionTimeout).toISOString()
        };

        // Encriptar token con nuestras 3 capas
        const encryptedToken = await encryptData(tokenData, 2); // Usamos nivel 2 para tokens
        
        return encryptedToken;
    }

    // Gestión de intentos fallidos
    recordFailedAttempt(username, ipAddress) {
        const attempts = this.failedAttempts.get(username) || {
            count: 0,
            firstAttempt: Date.now(),
            lastAttempt: Date.now(),
            ipAddresses: new Set()
        };

        attempts.count++;
        attempts.lastAttempt = Date.now();
        attempts.ipAddresses.add(ipAddress);
        
        this.failedAttempts.set(username, attempts);

        // Bloquear si excede límite
        if (attempts.count >= this.maxAttempts) {
            this.lockUser(username);
            
            // Notificar seguridad
            this.notifySecurityTeam({
                event: 'account_lockout',
                username,
                attempts: attempts.count,
                ipAddresses: Array.from(attempts.ipAddresses),
                timestamp: new Date().toISOString()
            });
        }
    }

    isUserLocked(username) {
        const attempts = this.failedAttempts.get(username);
        
        if (!attempts || attempts.count < this.maxAttempts) {
            return false;
        }

        // Verificar si ya pasó el tiempo de bloqueo
        const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
        return timeSinceLastAttempt < this.lockoutTime;
    }

    lockUser(username) {
        const attempts = this.failedAttempts.get(username) || { count: 0 };
        attempts.lockedUntil = Date.now() + this.lockoutTime;
        this.failedAttempts.set(username, attempts);
    }

    unlockUser(username) {
        this.failedAttempts.delete(username);
    }

    // Historial de login
    logLoginHistory(entry) {
        this.loginHistory.push(entry);
        
        // Mantener solo últimos 1000 registros
        if (this.loginHistory.length > 1000) {
            this.loginHistory = this.loginHistory.slice(-1000);
        }

        // Guardar en archivo (en producción sería BD)
        this.saveLoginHistory();
    }

    saveLoginHistory() {
        const fs = require('fs');
        const path = require('path');
        const historyFile = path.join(__dirname, '..', 'login-history.json');

        try {
            fs.writeFileSync(
                historyFile,
                JSON.stringify(this.loginHistory, null, 2)
            );
        } catch (error) {
            console.error('Error guardando historial de login:', error);
        }
    }

    getLoginHistory(username = null, limit = 50) {
        let history = this.loginHistory;
        
        if (username) {
            history = history.filter(entry => entry.username === username);
        }
        
        return history.slice(-limit).reverse();
    }

    // Métodos de utilidad
    sanitizeUserData(user) {
        return {
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            organization: user.organization,
            specialization: user.specialization,
            avatar: user.avatar,
            role: {
                id: user.role.id,
                name: user.role.name,
                level: user.role.level,
                color: this.roleHierarchy.getRoleColor(user.role.id),
                icon: this.roleHierarchy.getRoleIcon(user.role.id)
            },
            subrole: user.subrole ? {
                name: user.subrole,
                icon: this.roleHierarchy.getSubroleIcon(user.subrole)
            } : null
        };
    }

    notifySecurityTeam(data) {
        // En producción: enviar notificación a equipo de seguridad
        console.log('🚨 NOTIFICACIÓN DE SEGURIDAD:', data);
        
        const fs = require('fs');
        const path = require('path');
        const securityFile = path.join(__dirname, '..', 'security-alerts.json');
        
        try {
            let alerts = [];
            if (fs.existsSync(securityFile)) {
                alerts = JSON.parse(fs.readFileSync(securityFile, 'utf8'));
            }
            
            alerts.push({
                ...data,
                notifiedAt: new Date().toISOString()
            });
            
            fs.writeFileSync(securityFile, JSON.stringify(alerts, null, 2));
        } catch (error) {
            console.error('Error guardando alerta de seguridad:', error);
        }
    }

    // Métodos para estadísticas
    getLoginStats() {
        const last24h = this.loginHistory.filter(entry => 
            Date.now() - new Date(entry.timestamp).getTime() < 24 * 60 * 60 * 1000
        );

        const successful = last24h.filter(entry => entry.status === 'success').length;
        const failed = last24h.filter(entry => entry.status === 'failed').length;
        
        return {
            last24h: {
                successful,
                failed,
                successRate: successful + failed > 0 ? (successful / (successful + failed) * 100).toFixed(1) : 0
            },
            totalSessions: this.sessionManager.sessions.size,
            lockedAccounts: Array.from(this.failedAttempts.keys()).filter(username => 
                this.isUserLocked(username)
            ).length,
            uniqueIPs: new Set(this.loginHistory.map(entry => entry.ipAddress)).size
        };
    }

    // Métodos para recuperación de cuenta
    async initiatePasswordReset(email) {
        // En producción: enviar email con token de recuperación
        const token = this.generateResetToken(email);
        
        // Guardar token temporalmente (en producción: base de datos)
        const resetTokens = this.loadResetTokens();
        resetTokens[email] = {
            token,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutos
            createdAt: new Date().toISOString()
        };
        
        this.saveResetTokens(resetTokens);
        
        // Simular envío de email
        console.log(`📧 Email de recuperación enviado a ${email}`);
        console.log(`🔑 Token: ${token} (NO usar en producción)`);
        
        return { success: true, message: 'Instrucciones enviadas al email' };
    }

    generateResetToken(email) {
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(email + Date.now() + process.env.RESET_SALT || 'ResetSalt2024')
            .digest('hex')
            .substring(0, 32);
    }

    loadResetTokens() {
        const fs = require('fs');
        const path = require('path');
        const tokensFile = path.join(__dirname, '..', 'reset-tokens.json');
        
        try {
            if (fs.existsSync(tokensFile)) {
                return JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
            }
        } catch (error) {
            console.error('Error cargando tokens de reset:', error);
        }
        
        return {};
    }

    saveResetTokens(tokens) {
        const fs = require('fs');
        const path = require('path');
        const tokensFile = path.join(__dirname, '..', 'reset-tokens.json');
        
        try {
            fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
        } catch (error) {
            console.error('Error guardando tokens de reset:', error);
        }
    }
}

module.exports = new LoginSystem();