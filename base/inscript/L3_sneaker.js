// Capa L3: Sneaker Advisor - Sistema de Protección Activa Inteligente
// Interfaz con Python para análisis y protección en tiempo real

const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

class SneakerAdvisor {
    constructor() {
        this.nombre = "Sneaker Advisor v3.0";
        this.version = "3.14.159";
        
        // Configuración del sistema
        this.pythonPath = this.detectarPython();
        this.advisorScript = path.join(__dirname, 'advisor.py');
        this.moduloSneaker = path.join(__dirname, 'sneaker_module.py');
        
        // Estados del sistema
        this.estado = {
            pythonDisponible: false,
            advisorCargado: false,
            modoProteccion: 'standby',
            nivelAmenaza: 0,
            ultimaRevision: null,
            estadisticas: {}
        };
        
        // Configuración de seguridad
        this.config = {
            modoActivo: true,
            deteccionIntrusos: true,
            generacionFakeData: true,
            honeypotActivado: false,
            autoRespuesta: true,
            nivelParanoia: 1,
            tiempoRespuesta: 5000,
            maxIntentos: 3
        };
        
        // Historial de seguridad
        this.historialSeguridad = [];
        this.intentosSospechosos = new Map();
        
        // Inicializar sistema
        this.inicializarSistema();
    }

    // ========== INICIALIZACIÓN DEL SISTEMA ==========

    async inicializarSistema() {
        console.log('🛡️  L3 Sneaker Advisor inicializando...');
        
        // Verificar Python
        this.estado.pythonDisponible = await this.verificarPython();
        
        if (this.estado.pythonDisponible) {
            console.log('✅ Python disponible para Sneaker Advisor');
            
            // Verificar script advisor
            this.estado.advisorCargado = await this.verificarScriptAdvisor();
            
            if (this.estado.advisorCargado) {
                console.log('✅ Script advisor.py cargado correctamente');
                await this.cargarModuloSneaker();
                this.estado.modoProteccion = 'active';
            } else {
                console.log('⚠️  Script advisor.py no encontrado, usando modo fallback');
                this.estado.modoProteccion = 'fallback';
            }
        } else {
            console.log('⚠️  Python no disponible, usando modo JavaScript');
            this.estado.modoProteccion = 'javascript';
        }
        
        this.estado.ultimaRevision = new Date().toISOString();
        console.log(`🛡️  L3 Sneaker Advisor listo (Modo: ${this.estado.modoProteccion})`);
    }

    detectarPython() {
        // Detectar Python en el sistema
        const posiblesPaths = [
            'python3',
            'python',
            'python3.11',
            'python3.10',
            'python3.9',
            '/usr/bin/python3',
            '/usr/local/bin/python3',
            'C:\\Python39\\python.exe',
            'C:\\Python310\\python.exe'
        ];
        
        return process.env.PYTHON_PATH || posiblesPaths[0];
    }

    async verificarPython() {
        try {
            const resultado = await this.ejecutarComando([this.pythonPath, '--version']);
            console.log(`🐍 Versión Python: ${resultado.trim()}`);
            return true;
        } catch (error) {
            console.warn('❌ Python no disponible:', error.message);
            return false;
        }
    }

    async verificarScriptAdvisor() {
        try {
            const fs = require('fs');
            return fs.existsSync(this.advisorScript);
        } catch (error) {
            return false;
        }
    }

    async cargarModuloSneaker() {
        try {
            // Ejecutar script de inicialización
            const resultado = await this.ejecutarPython(['-c', `
import sys
sys.path.append('${__dirname}')
try:
    import sneaker_module
    print('SUCCESS:Sneaker module loaded')
except Exception as e:
    print('ERROR:' + str(e))
            `]);
            
            if (resultado.includes('SUCCESS')) {
                console.log('✅ Módulo sneaker cargado correctamente');
                return true;
            } else {
                console.warn('⚠️  Error cargando módulo sneaker:', resultado);
                return false;
            }
        } catch (error) {
            console.warn('⚠️  No se pudo cargar módulo sneaker:', error.message);
            return false;
        }
    }

    // ========== INTERFAZ CON PYTHON ==========

    async ejecutarComando(args, input = null) {
        return new Promise((resolve, reject) => {
            const proceso = spawn(args[0], args.slice(1));
            
            let stdout = '';
            let stderr = '';
            
            proceso.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            proceso.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            proceso.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`Command failed: ${stderr}`));
                }
            });
            
            if (input) {
                proceso.stdin.write(input);
                proceso.stdin.end();
            }
        });
    }

    async ejecutarPython(args, input = null) {
        return this.ejecutarComando([this.pythonPath, ...args], input);
    }

    // ========== PROTECCIÓN PRINCIPAL ==========

    async protegerConSneaker(data, metadata = {}) {
        const startTime = Date.now();
        console.log('🛡️  L3 Sneaker: Activando protección');
        
        try {
            let resultado;
            
            if (this.estado.modoProteccion === 'active' && this.estado.advisorCargado) {
                // Usar advisor.py para protección avanzada
                resultado = await this.protegerConAdvisor(data, metadata);
            } else {
                // Modo fallback en JavaScript
                resultado = await this.protegerConSneakerJS(data, metadata);
            }
            
            // Analizar amenazas
            const analisis = await this.analizarAmenazas(data, metadata);
            
            // Actualizar estadísticas
            this.actualizarEstadisticas('protecciones', 1);
            
            // Registrar en historial
            this.registrarEventoSeguridad({
                tipo: 'proteccion',
                resultado: 'exito',
                tiempo: Date.now() - startTime,
                nivelAmenaza: analisis.nivelAmenaza,
                timestamp: new Date().toISOString()
            });
            
            console.log(`✅ L3 Sneaker: Protección aplicada en ${Date.now() - startTime}ms`);
            
            return {
                protected_data: resultado,
                metadata: {
                    analisis,
                    modo: this.estado.modoProteccion,
                    timestamp: new Date().toISOString(),
                    checksum: this.generarChecksumSeguridad(resultado)
                },
                capa: 3,
                version: this.version
            };
            
        } catch (error) {
            console.error('❌ L3 Sneaker: Error en protección:', error.message);
            
            // Modo de emergencia
            return this.activarModoEmergencia(data, error);
        }
    }

    async protegerConAdvisor(data, metadata) {
        try {
            const input = JSON.stringify({
                action: 'protect',
                data: typeof data === 'string' ? data : JSON.stringify(data),
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                    system: os.platform(),
                    config: this.config
                }
            });
            
            const resultado = await this.ejecutarPython([this.advisorScript], input);
            
            try {
                return JSON.parse(resultado);
            } catch {
                return resultado;
            }
        } catch (error) {
            console.warn('⚠️  Advisor falló, usando fallback:', error.message);
            throw error;
        }
    }

    async protegerConSneakerJS(data, metadata) {
        console.log('🛡️  L3 Sneaker JS: Activando protección JavaScript');
        
        // Ofuscación avanzada en JS
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        
        // Paso 1: Cifrado XOR con clave dinámica
        const claveDinamica = this.generarClaveDinamica(metadata);
        let ofuscado = this.cifradoXORAvanzado(dataStr, claveDinamica);
        
        // Paso 2: Codificación base64 personalizada
        ofuscado = this.codificacionBase64Personalizada(ofuscado);
        
        // Paso 3: Inserción de datos de honeypot
        if (this.config.generacionFakeData) {
            ofuscado = this.insertarHoneypot(ofuscado);
        }
        
        // Paso 4: Compresión segura
        ofuscado = this.compresionSegura(ofuscado);
        
        // Paso 5: Añadir marcas de agua digitales
        ofuscado = this.añadirMarcasAgua(ofuscado);
        
        return {
            data: ofuscado,
            protection_mode: 'sneaker_js_advanced',
            timestamp: new Date().toISOString(),
            security_level: this.config.nivelParanoia,
            fake_data_included: this.config.generacionFakeData
        };
    }

    // ========== REVERSIÓN DE PROTECCIÓN ==========

    async revertirSneaker(protectedData) {
        const startTime = Date.now();
        console.log('🛡️  L3 Sneaker: Revertiendo protección');
        
        try {
            let resultado;
            
            if (protectedData.metadata && protectedData.metadata.modo === 'active') {
                // Revertir protección de advisor
                resultado = await this.revertirConAdvisor(protectedData);
            } else {
                // Revertir protección JS
                resultado = await this.revertirConSneakerJS(protectedData);
            }
            
            // Verificar integridad
            if (protectedData.metadata && protectedData.metadata.checksum) {
                const checksumCalculado = this.generarChecksumSeguridad(resultado);
                if (checksumCalculado !== protectedData.metadata.checksum) {
                    throw new Error('Checksum de seguridad inválido');
                }
            }
            
            this.actualizarEstadisticas('reversiones', 1);
            
            console.log(`✅ L3 Sneaker: Protección revertida en ${Date.now() - startTime}ms`);
            return resultado;
            
        } catch (error) {
            console.error('❌ L3 Sneaker: Error revertiendo protección:', error.message);
            throw error;
        }
    }

    async revertirConAdvisor(protectedData) {
        try {
            const input = JSON.stringify({
                action: 'revert',
                data: protectedData,
                timestamp: new Date().toISOString()
            });
            
            const resultado = await this.ejecutarPython([this.advisorScript], input);
            return JSON.parse(resultado);
        } catch (error) {
            console.warn('⚠️  Error revertiendo con advisor:', error.message);
            throw error;
        }
    }

    async revertirConSneakerJS(protectedData) {
        if (!protectedData.data || !protectedData.protection_mode) {
            throw new Error('Datos protegidos no válidos');
        }
        
        let data = protectedData.data;
        
        // Paso 5: Remover marcas de agua
        data = this.removerMarcasAgua(data);
        
        // Paso 4: Descomprimir
        data = this.descomprimirSegura(data);
        
        // Paso 3: Filtrar datos honeypot
        if (protectedData.fake_data_included) {
            data = this.filtrarHoneypot(data);
        }
        
        // Paso 2: Decodificar base64 personalizada
        data = this.decodificacionBase64Personalizada(data);
        
        // Paso 1: Descifrar XOR
        const claveDinamica = this.generarClaveDinamica(protectedData);
        data = this.descifradoXORAvanzado(data, claveDinamica);
        
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }

    // ========== MÉTODOS DE PROTECCIÓN JS AVANZADOS ==========

    generarClaveDinamica(metadata) {
        // Generar clave basada en múltiples factores
        const factores = [
            Date.now().toString(),
            process.pid.toString(),
            os.hostname(),
            metadata.timestamp || '',
            this.estado.ultimaRevision,
            crypto.randomBytes(16).toString('hex')
        ];
        
        const claveBase = factores.join('|');
        return crypto.createHash('sha512').update(claveBase).digest('hex');
    }

    cifradoXORAvanzado(data, clave) {
        let resultado = '';
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const claveChar = clave.charCodeAt(i % clave.length);
            
            // XOR con transformación no lineal
            const xorSimple = charCode ^ claveChar;
            
            // Aplicar rotación variable
            const rotacion = claveChar % 8;
            const rotado = ((xorSimple << rotacion) | (xorSimple >> (8 - rotacion))) & 0xFF;
            
            // Aplicar desplazamiento basado en posición
            const desplazamiento = (i * 7) % 256;
            const final = (rotado + desplazamiento) % 256;
            
            resultado += String.fromCharCode(final);
        }
        
        return resultado;
    }

    descifradoXORAvanzado(data, clave) {
        let resultado = '';
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const claveChar = clave.charCodeAt(i % clave.length);
            
            // Revertir desplazamiento
            const desplazamiento = (i * 7) % 256;
            const sinDesplazamiento = (charCode - desplazamiento + 256) % 256;
            
            // Revertir rotación
            const rotacion = claveChar % 8;
            const rotado = ((sinDesplazamiento >> rotacion) | (sinDesplazamiento << (8 - rotacion))) & 0xFF;
            
            // XOR final
            const original = rotado ^ claveChar;
            
            resultado += String.fromCharCode(original);
        }
        
        return resultado;
    }

    codificacionBase64Personalizada(data) {
        // Base64 personalizado con alfabeto mezclado
        const alfabetoPersonalizado = 'aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/=';
        const alfabetoStandard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        
        const base64Standard = Buffer.from(data).toString('base64');
        let personalizado = '';
        
        for (let i = 0; i < base64Standard.length; i++) {
            const char = base64Standard[i];
            const index = alfabetoStandard.indexOf(char);
            if (index !== -1) {
                personalizado += alfabetoPersonalizado[index];
            } else {
                personalizado += char;
            }
        }
        
        return personalizado;
    }

    decodificacionBase64Personalizada(data) {
        const alfabetoPersonalizado = 'aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/=';
        const alfabetoStandard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        
        let estandar = '';
        
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            const index = alfabetoPersonalizado.indexOf(char);
            if (index !== -1) {
                estandar += alfabetoStandard[index];
            } else {
                estandar += char;
            }
        }
        
        return Buffer.from(estandar, 'base64').toString();
    }

    insertarHoneypot(data) {
        // Insertar datos falsos estratégicamente
        const honeypots = [
            'SNEAKER_HONEYPOT_START:' + crypto.randomBytes(8).toString('hex') + ':FAKE_DATA',
            'TRAP:' + Date.now() + ':DECOY',
            'FAKE_CREDENTIALS:admin:' + crypto.randomBytes(12).toString('hex'),
            'DUMMY_TOKEN:' + Math.random().toString(36).substr(2, 24)
        ];
        
        let conHoneypot = data;
        const posiciones = [Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75)];
        
        for (let i = 0; i < Math.min(honeypots.length, posiciones.length); i++) {
            const pos = posiciones[i];
            conHoneypot = conHoneypot.slice(0, pos) + honeypots[i] + conHoneypot.slice(pos);
        }
        
        return conHoneypot;
    }

    filtrarHoneypot(data) {
        // Filtrar datos honeypot conocidos
        const patrones = [
            /SNEAKER_HONEYPOT_START:[^:]+:FAKE_DATA/,
            /TRAP:\d+:DECOY/,
            /FAKE_CREDENTIALS:[^:]+:[^:]+/,
            /DUMMY_TOKEN:[a-z0-9]+/
        ];
        
        let filtrado = data;
        patrones.forEach(patron => {
            filtrado = filtrado.replace(patron, '');
        });
        
        return filtrado;
    }

    compresionSegura(data) {
        // Compresión simple (en producción usaría zlib con encriptación)
        let comprimido = '';
        
        for (let i = 0; i < data.length; i += 2) {
            if (i + 1 < data.length) {
                const char1 = data.charCodeAt(i);
                const char2 = data.charCodeAt(i + 1);
                const combinado = ((char1 << 8) | char2) ^ 0xAA55;
                comprimido += String.fromCharCode(combinado & 0xFF);
                comprimido += String.fromCharCode((combinado >> 8) & 0xFF);
            } else {
                comprimido += data[i];
            }
        }
        
        return comprimido;
    }

    descomprimirSegura(data) {
        let descomprimido = '';
        
        for (let i = 0; i < data.length; i += 2) {
            if (i + 1 < data.length) {
                const byte1 = data.charCodeAt(i);
                const byte2 = data.charCodeAt(i + 1);
                const combinado = (byte2 << 8) | byte1;
                const original = combinado ^ 0xAA55;
                descomprimido += String.fromCharCode((original >> 8) & 0xFF);
                descomprimido += String.fromCharCode(original & 0xFF);
            } else {
                descomprimido += data[i];
            }
        }
        
        return descomprimido;
    }

    añadirMarcasAgua(data) {
        // Añadir marcas de agua digitales para detección de manipulación
        const marca = `SNK${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}END`;
        return marca + data + marca.split('').reverse().join('');
    }

    removerMarcasAgua(data) {
        // Remover marcas de agua
        const patron = /^SNK[a-z0-9]+[a-f0-9]{8}END/;
        const inicio = data.match(patron);
        
        if (inicio) {
            const marca = inicio[0];
            const marcaReversa = marca.split('').reverse().join('');
            data = data.substring(marca.length);
            
            if (data.endsWith(marcaReversa)) {
                data = data.substring(0, data.length - marcaReversa.length);
            }
        }
        
        return data;
    }

    // ========== ANÁLISIS DE AMENAZAS ==========

    async analizarAmenazas(data, metadata) {
        const analisis = {
            nivelAmenaza: 0,
            patronesSospechosos: [],
            recomendaciones: [],
            timestamp: new Date().toISOString()
        };
        
        // Análisis básico de datos
        if (typeof data === 'string') {
            // Buscar patrones de inyección
            const patronesPeligrosos = [
                /<script>/i,
                /union.*select/i,
                /drop.*table/i,
                /etc.*passwd/i,
                /\.\.\//,
                /javascript:/i,
                /onload=/i,
                /onerror=/i
            ];
            
            patronesPeligrosos.forEach((patron, index) => {
                if (patron.test(data)) {
                    analisis.nivelAmenaza += 10;
                    analisis.patronesSospechosos.push(`patron_${index}`);
                    analisis.recomendaciones.push('Posible intento de inyección detectado');
                }
            });
            
            // Verificar longitud sospechosa
            if (data.length > 100000) { // 100KB
                analisis.nivelAmenaza += 5;
                analisis.recomendaciones.push('Datos excesivamente grandes');
            }
        }
        
        // Análisis de metadata
        if (metadata) {
            if (metadata.ip) {
                // Verificar IP sospechosa (simplificado)
                const ipSospechosas = ['192.168.', '10.', '127.', '0.'];
                if (ipSospechosas.some(ip => metadata.ip.startsWith(ip))) {
                    analisis.nivelAmenaza += 3;
                }
            }
            
            if (metadata.userAgent) {
                const uaSospechosos = [/sqlmap/i, /nikto/i, /metasploit/i, /nmap/i];
                uaSospechosos.forEach(ua => {
                    if (ua.test(metadata.userAgent)) {
                        analisis.nivelAmenaza += 20;
                        analisis.recomendaciones.push('User-Agent de herramienta de hacking detectado');
                    }
                });
            }
        }
        
        // Limitar nivel de amenaza
        analisis.nivelAmenaza = Math.min(analisis.nivelAmenaza, 100);
        
        // Actualizar estado
        this.estado.nivelAmenaza = analisis.nivelAmenaza;
        
        return analisis;
    }

    // ========== MODO EMERGENCIA ==========

    activarModoEmergencia(data, error) {
        console.log('🚨 L3 Sneaker: Activando modo de emergencia');
        
        // Enviar alerta
        this.enviarAlertaEmergencia(error);
        
        // Generar respuesta de emergencia
        return {
            emergency_data: this.generarRespuestaEmergencia(data),
            metadata: {
                mode: 'emergency',
                error: error.message,
                timestamp: new Date().toISOString(),
                warning: 'SYSTEM IN EMERGENCY MODE'
            },
            capa: 3,
            version: this.version
        };
    }

    generarRespuestaEmergencia(data) {
        // Generar datos falsos convincentes para engañar atacantes
        return {
            status: 'success',
            message: 'Operation completed successfully',
            data: {
                encrypted: true,
                security_level: 'maximum',
                checksum: crypto.randomBytes(32).toString('hex'),
                fake_timestamp: new Date().toISOString(),
                fake_session: 'session_' + crypto.randomBytes(16).toString('hex'),
                fake_user: {
                    id: Math.floor(Math.random() * 10000),
                    role: 'admin',
                    permissions: ['full_access']
                }
            },
            sneaker_mode: 'active',
            honeypot_triggered: true
        };
    }

    async enviarAlertaEmergencia(error) {
        // Registrar alerta de emergencia
        this.registrarEventoSeguridad({
            tipo: 'emergencia',
            nivel: 'critico',
            error: error.message,
            timestamp: new Date().toISOString(),
            stack: error.stack
        });
        
        // Aquí se podría integrar con sistema de notificaciones
        console.log('🚨 ALERTA DE EMERGENCIA SNEAKER:', error.message);
    }

    // ========== UTILIDADES ==========

    generarChecksumSeguridad(data) {
        const hash = crypto.createHash('sha512');
        hash.update(typeof data === 'string' ? data : JSON.stringify(data));
        hash.update(this.estado.ultimaRevision);
        hash.update(this.version);
        return hash.digest('hex');
    }

    registrarEventoSeguridad(evento) {
        this.historialSeguridad.push(evento);
        
        // Mantener solo últimos 1000 eventos
        if (this.historialSeguridad.length > 1000) {
            this.historialSeguridad = this.historialSeguridad.slice(-1000);
        }
        
        // Contar intentos sospechosos por IP
        if (evento.ip) {
            const intentos = this.intentosSospechosos.get(evento.ip) || 0;
            this.intentosSospechosos.set(evento.ip, intentos + 1);
            
            // Bloquear IP si excede límite
            if (intentos + 1 >= this.config.maxIntentos) {
                console.log(`🚫 IP ${evento.ip} bloqueada por múltiples intentos sospechosos`);
            }
        }
    }

    actualizarEstadisticas(tipo, cantidad = 1) {
        if (!this.estado.estadisticas[tipo]) {
            this.estado.estadisticas[tipo] = 0;
        }
        this.estado.estadisticas[tipo] += cantidad;
    }

    // ========== API PÚBLICA ==========

    getEstado() {
        return {
            ...this.estado,
            config: this.config,
            historialCount: this.historialSeguridad.length,
            ipsBloqueadas: Array.from(this.intentosSospechosos.entries())
                .filter(([_, intentos]) => intentos >= this.config.maxIntentos)
                .map(([ip, _]) => ip)
        };
    }

    getEstadisticas() {
        return {
            operaciones: this.estado.estadisticas,
            modo: this.estado.modoProteccion,
            python: this.estado.pythonDisponible,
            advisor: this.estado.advisorCargado,
            nivelAmenaza: this.estado.nivelAmenaza,
            version: this.version,
            uptime: this.estado.ultimaRevision
        };
    }

    async ejecutarComandoAdvisor(comando, parametros = {}) {
        if (!this.estado.pythonDisponible || !this.estado.advisorCargado) {
            throw new Error('Advisor no disponible');
        }
        
        try {
            const input = JSON.stringify({
                action: 'command',
                command: comando,
                parameters: parametros,
                timestamp: new Date().toISOString()
            });
            
            const resultado = await this.ejecutarPython([this.advisorScript], input);
            return JSON.parse(resultado);
        } catch (error) {
            console.error('Error ejecutando comando advisor:', error);
            throw error;
        }
    }

    configurar(modo, valor) {
        if (this.config.hasOwnProperty(modo)) {
            this.config[modo] = valor;
            console.log(`⚙️  L3 Sneaker: Config ${modo} = ${valor}`);
            return { success: true, config: this.config };
        }
        return { success: false, error: 'Configuración no válida' };
    }

    reset() {
        console.log('🔄 L3 Sneaker: Reset completo');
        this.historialSeguridad = [];
        this.intentosSospechosos.clear();
        this.estado.nivelAmenaza = 0;
        this.estado.estadisticas = {};
        return { success: true, timestamp: new Date().toISOString() };
    }
}

// Exportar instancia singleton
const instanciaL3 = new SneakerAdvisor();
module.exports = instanciaL3;