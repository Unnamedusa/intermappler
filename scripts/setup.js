// scripts/setup.js - Crea archivos faltantes automáticamente
const fs = require('fs');
const path = require('path');

console.log('🛠️  Configurando InterMappler...');

// Crear directorios necesarios
const directories = [
    'base/incript',
    'base/auth',
    'base/utils',
    'web',
    'web/login',
    'scripts',
    'logs',
    'config'
];

directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Directorio creado: ${dir}`);
    }
});

// Crear orchestrator.js básico
const orchestratorPath = path.join(__dirname, '..', 'base', 'incript', 'orchestrator.js');
if (!fs.existsSync(orchestratorPath)) {
    const orchestratorCode = `// orchestrator.js - Versión básica
const crypto = require('crypto');

console.log('🎭 Orchestrator cargado');

async function encryptData(data, nivel = 3) {
    console.log(\`🔐 Encriptando (nivel \${nivel})\`);
    return JSON.stringify({
        data: Buffer.from(JSON.stringify(data)).toString('base64'),
        nivel: nivel,
        timestamp: new Date().toISOString(),
        hash: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
    });
}

async function decryptData(encryptedData) {
    console.log('🔓 Desencriptando');
    try {
        const parsed = JSON.parse(encryptedData);
        const data = JSON.parse(Buffer.from(parsed.data, 'base64').toString());
        return data;
    } catch (error) {
        console.error('Error desencriptando:', error);
        return encryptedData;
    }
}

module.exports = { encryptData, decryptData };`;
    
    fs.writeFileSync(orchestratorPath, orchestratorCode);
    console.log('✅ orchestrator.js creado');
}

// Crear login-system.js básico
const loginSystemPath = path.join(__dirname, '..', 'base', 'auth', 'login-system.js');
if (!fs.existsSync(loginSystemPath)) {
    const loginSystemCode = `// login-system.js - Versión básica
class LoginSystem {
    constructor() {
        console.log('🔐 Sistema de login inicializado');
    }

    async authenticate(username, password) {
        if (username === 'admin' && password === 'admin') {
            return {
                success: true,
                token: 'demo_token_' + Math.random().toString(36).substr(2),
                user: { username: 'admin', role: 'Administrador' }
            };
        }
        return { success: false, error: 'Credenciales incorrectas' };
    }
}

module.exports = new LoginSystem();`;
    
    fs.writeFileSync(loginSystemPath, loginSystemCode);
    console.log('✅ login-system.js creado');
}

// Crear session-manager.js básico
const sessionManagerPath = path.join(__dirname, '..', 'base', 'auth', 'session-manager.js');
if (!fs.existsSync(sessionManagerPath)) {
    const sessionManagerCode = `// session-manager.js - Versión básica
class SessionManager {
    constructor() {
        this.ROLES = {
            'Administrador': { level: 10 },
            'Especialista': { level: 7 },
            'Usuario Público': { level: 1 }
        };
        console.log('👥 Gestor de sesiones inicializado');
    }
}

module.exports = new SessionManager();`;
    
    fs.writeFileSync(sessionManagerPath, sessionManagerCode);
    console.log('✅ session-manager.js creado');
}

// Crear translator.js básico
const translatorPath = path.join(__dirname, '..', 'base', 'utils', 'translator.js');
if (!fs.existsSync(translatorPath)) {
    const translatorCode = `// translator.js - Versión básica
class TranslationSystem {
    constructor() {
        this.lang = 'es';
        this.translations = {
            'Iniciar Sesión': { es: 'Iniciar Sesión', en: 'Login' },
            'Usuario': { es: 'Usuario', en: 'User' },
            'Contraseña': { es: 'Contraseña', en: 'Password' }
        };
    }

    translate(text, lang = 'es') {
        return this.translations[text]?.[lang] || text;
    }
}

module.exports = new TranslationSystem();`;
    
    fs.writeFileSync(translatorPath, translatorCode);
    console.log('✅ translator.js creado');
}

// Crear advisor.py básico
const advisorPath = path.join(__dirname, '..', 'base', 'incript', 'advisor.py');
if (!fs.existsSync(advisorPath)) {
    const advisorCode = `#!/usr/bin/env python3
"""
Sneaker Advisor - Versión básica
"""
import json
from datetime import datetime

def main():
    result = {
        "status": "success",
        "message": "Advisor funcionando",
        "timestamp": datetime.now().isoformat()
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()`;
    
    fs.writeFileSync(advisorPath, advisorCode);
    console.log('✅ advisor.py creado');
    
    // Hacer ejecutable
    fs.chmodSync(advisorPath, '755');
}

// Crear index.html básico
const indexPath = path.join(__dirname, '..', 'web', 'index.html');
if (!fs.existsSync(indexPath)) {
    const htmlCode = `<!DOCTYPE html>
<html>
<head>
    <title>InterMappler v3.0</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 20px; background: #f5f5f5; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 InterMappler v3.0</h1>
        <p>Sistema de Mapeo Inteligente Global</p>
        <div class="status">
            <h3>Estado del Sistema:</h3>
            <p id="status">Cargando...</p>
        </div>
        <a href="/login">Iniciar Sesión</a> | 
        <a href="/api/health">Health Check</a>
    </div>
    <script>
        fetch('/api/health')
            .then(r => r.json())
            .then(data => {
                document.getElementById('status').innerHTML = 
                    '✅ Sistema funcionando correctamente<br>' +
                    'Versión: ' + data.version + '<br>' +
                    'Estado: ' + data.status;
            });
    </script>
</body>
</html>`;
    
    fs.writeFileSync(indexPath, htmlCode);
    console.log('✅ index.html creado');
}

// Crear login.html básico
const loginPath = path.join(__dirname, '..', 'web', 'login', 'login.html');
if (!fs.existsSync(loginPath)) {
    const loginHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Login - InterMappler</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .login-box { max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>🔐 Iniciar Sesión</h2>
        <form id="loginForm">
            <input type="text" id="username" placeholder="Usuario" required>
            <input type="password" id="password" placeholder="Contraseña" required>
            <button type="submit">Acceder</button>
        </form>
        <p id="message"></p>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                document.getElementById('message').innerHTML = 
                    data.success ? '✅ ' + data.message : '❌ ' + data.error;
            } catch (error) {
                document.getElementById('message').innerHTML = '❌ Error de conexión';
            }
        });
    </script>
</body>
</html>`;
    
    fs.writeFileSync(loginPath, loginHtml);
    console.log('✅ login.html creado');
}

console.log('✅ Configuración completada!');
console.log('🚀 Ejecuta: npm start');