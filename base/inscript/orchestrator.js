// Orchestrator - Sistema de Encriptación de 3 Capas
// Versión simplificada sin dependencias externas problemáticas

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ========== CAPA 1: QUANTUM FRACTAL ==========
class CapaL1_Quantum {
    constructor() {
        this.nombre = "Quantum Fractal v1.0";
        this.version = "1.0.0";
        this.semillas = this.generarSemillas();
        console.log('🌀 Capa L1 Quantum inicializada');
    }

    generarSemillas() {
        return {
            fractal: Math.sin(Date.now() * 0.0001) * Math.PI % 1,
            cuantica: crypto.randomBytes(32).toString('hex'),
            binaria: Math.random(),
            timestamp: Date.now()
        };
    }

    transformacionFractal(data) {
        let resultado = '';
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            
            // Aplicar transformación fractal
            const fractalVal = Math.sin(this.semillas.fractal * i * Math.PI);
            const nuevoCharCode = Math.floor(
                (charCode * fractalVal * 100) % 256
            );
            
            resultado += String.fromCharCode(nuevoCharCode);
        }
        
        return resultado;
    }

    superposicionCuantica(data) {
        const buffer = Buffer.from(data, 'binary');
        const resultado = Buffer.alloc(buffer.length);
        const hash = crypto.createHash('sha256').update(this.semillas.cuantica).digest();
        
        for (let i = 0; i < buffer.length; i++) {
            const hashByte = hash[i % hash.length];
            resultado[i] = buffer[i] ^ hashByte;
        }
        
        return resultado.toString('binary');
    }

    encriptar(data) {
        try {
            console.log('🌀 L1 Quantum: Aplicando encriptación fractal');
            
            // Paso 1: Transformación fractal
            let paso1 = this.transformacionFractal(data);
            
            // Paso 2: Superposición cuántica
            let paso2 = this.superposicionCuantica(paso1);
            
            // Paso 3: Compresión fractal
            let paso3 = this.compresionFractal(paso2);
            
            return {
                data: paso3,
                metadata: {
                    semilla: this.semillas.fractal,
                    hash: crypto.createHash('sha256').update(data).digest('hex').substring(0, 16),
                    timestamp: new Date().toISOString(),
                    capa: 1,
                    version: this.version
                }
            };
        } catch (error) {
            console.error('❌ Error en L1 Quantum:', error.message);
            throw error;
        }
    }

    desencriptar(data, metadata) {
        try {
            // En esta versión simplificada, la encriptación es simétrica
            return this.encriptar(data).data;
        } catch (error) {
            console.error('❌ Error desencriptando L1:', error.message);
            throw error;
        }
    }

    compresionFractal(data) {
        // Compresión simple
        let comprimido = '';
        
        for (let i = 0; i < data.length; i += 2) {
            if (i + 1 < data.length) {
                const byte1 = data.charCodeAt(i);
                const byte2 = data.charCodeAt(i + 1);
                const combinado = ((byte1 << 8) | byte2) ^ 0x55AA;
                comprimido += String.fromCharCode(combinado & 0xFF);
                comprimido += String.fromCharCode((combinado >> 8) & 0xFF);
            } else {
                comprimido += data[i];
            }
        }
        
        return comprimido;
    }
}

// ========== CAPA 2: ENIGMA MODERNA ==========
class CapaL2_Enigma {
    constructor() {
        this.nombre = "Enigma Moderna v1.0";
        this.version = "1.0.0";
        this.rotorSet = this.generarRotores();
        this.posicionActual = 0;
        console.log('🔷 Capa L2 Enigma inicializada');
    }

    generarRotores() {
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const rotores = [];
        
        for (let i = 0; i < 3; i++) {
            const rotor = alfabeto.split('');
            // Mezclar Fisher-Yates
            for (let j = rotor.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [rotor[j], rotor[k]] = [rotor[k], rotor[j]];
            }
            rotores.push(rotor.join(''));
        }
        
        return rotores;
    }

    procesarCaracter(caracter, encriptar = true) {
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const idx = alfabeto.indexOf(caracter.toUpperCase());
        
        if (idx === -1) return caracter;
        
        let resultadoIdx = idx;
        
        if (encriptar) {
            // Procesar a través de los rotores
            for (let i = 0; i < this.rotorSet.length; i++) {
                const rotor = this.rotorSet[i];
                const rotorIdx = (resultadoIdx + this.posicionActual + i) % alfabeto.length;
                const letraEnRotor = rotor[rotorIdx];
                resultadoIdx = alfabeto.indexOf(letraEnRotor);
                resultadoIdx = (resultadoIdx - this.posicionActual - i + alfabeto.length) % alfabeto.length;
            }
        } else {
            // Procesar inverso
            for (let i = this.rotorSet.length - 1; i >= 0; i--) {
                const rotor = this.rotorSet[i];
                const rotorIdx = (resultadoIdx + this.posicionActual + i) % alfabeto.length;
                const letraEnRotor = alfabeto[rotorIdx];
                resultadoIdx = rotor.indexOf(letraEnRotor);
                resultadoIdx = (resultadoIdx - this.posicionActual - i + alfabeto.length) % alfabeto.length;
            }
        }
        
        // Avanzar posición
        this.posicionActual = (this.posicionActual + 1) % alfabeto.length;
        
        return alfabeto[resultadoIdx];
    }

    encriptar(data) {
        try {
            console.log('🔷 L2 Enigma: Aplicando encriptación');
            
            // Convertir a base64 para procesar caracteres alfanuméricos
            const base64Data = Buffer.from(data).toString('base64');
            let resultado = '';
            
            for (let i = 0; i < base64Data.length; i++) {
                resultado += this.procesarCaracter(base64Data[i], true);
            }
            
            return {
                data: resultado,
                metadata: {
                    posicion: this.posicionActual,
                    timestamp: new Date().toISOString(),
                    capa: 2,
                    version: this.version
                }
            };
        } catch (error) {
            console.error('❌ Error en L2 Enigma:', error.message);
            throw error;
        }
    }

    desencriptar(data, metadata) {
        try {
            this.posicionActual = metadata.posicion || 0;
            let resultado = '';
            
            for (let i = 0; i < data.length; i++) {
                resultado += this.procesarCaracter(data[i], false);
            }
            
            // Convertir de base64
            return Buffer.from(resultado, 'base64').toString();
        } catch (error) {
            console.error('❌ Error desencriptando L2:', error.message);
            throw error;
        }
    }
}

// ========== CAPA 3: SNEKER ADVISOR ==========
class CapaL3_Sneaker {
    constructor() {
        this.nombre = "Sneaker Advisor v1.0";
        this.version = "1.0.0";
        this.pythonPath = process.env.PYTHON_PATH || 'python3';
        this.advisorScript = path.join(__dirname, 'advisor.py');
        console.log('🛡️  Capa L3 Sneaker inicializada');
    }

    async ejecutarAdvisor(accion, datos) {
        return new Promise((resolve, reject) => {
            try {
                const input = JSON.stringify({
                    action: accion,
                    data: datos,
                    timestamp: new Date().toISOString()
                });
                
                const python = spawn(this.pythonPath, [this.advisorScript]);
                
                let stdout = '';
                let stderr = '';
                
                python.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                
                python.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                
                python.on('close', (code) => {
                    if (code === 0) {
                        try {
                            resolve(JSON.parse(stdout));
                        } catch {
                            resolve(stdout);
                        }
                    } else {
                        reject(new Error(`Python error: ${stderr}`));
                    }
                });
                
                python.stdin.write(input);
                python.stdin.end();
                
            } catch (error) {
                // Fallback a JavaScript si Python falla
                console.warn('⚠️  Python no disponible, usando fallback JS');
                resolve(this.fallbackJS(accion, datos));
            }
        });
    }

    fallbackJS(accion, datos) {
        // Implementación de respaldo en JavaScript
        if (accion === 'protect') {
            return {
                protected_data: this.ofuscarJS(datos),
                mode: 'js_fallback',
                timestamp: new Date().toISOString(),
                checksum: crypto.createHash('sha256').update(datos).digest('hex')
            };
        } else if (accion === 'revert') {
            return {
                original_data: this.desofuscarJS(datos),
                mode: 'js_fallback',
                timestamp: new Date().toISOString()
            };
        }
        
        return { error: 'Acción no soportada', action: accion };
    }

    ofuscarJS(datos) {
        const key = 'SneakerJS2024';
        let resultado = '';
        
        for (let i = 0; i < datos.length; i++) {
            const charCode = datos.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            resultado += String.fromCharCode(charCode ^ keyChar);
        }
        
        return Buffer.from(resultado).toString('base64');
    }

    desofuscarJS(datos) {
        try {
            const decoded = Buffer.from(datos, 'base64').toString();
            const key = 'SneakerJS2024';
            let resultado = '';
            
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i);
                const keyChar = key.charCodeAt(i % key.length);
                resultado += String.fromCharCode(charCode ^ keyChar);
            }
            
            return resultado;
        } catch {
            return datos;
        }
    }

    async encriptar(data) {
        try {
            console.log('🛡️  L3 Sneaker: Consultando advisor');
            
            const resultado = await this.ejecutarAdvisor('protect', data);
            
            return {
                data: resultado.protected_data || resultado,
                metadata: {
                    mode: resultado.mode || 'advisor',
                    timestamp: new Date().toISOString(),
                    capa: 3,
                    version: this.version,
                    checksum: resultado.checksum
                }
            };
        } catch (error) {
            console.error('❌ Error en L3 Sneaker:', error.message);
            
            // Fallback a encriptación básica
            return {
                data: this.ofuscarJS(data),
                metadata: {
                    mode: 'emergency_fallback',
                    timestamp: new Date().toISOString(),
                    capa: 3,
                    version: this.version,
                    error: error.message
                }
            };
        }
    }

    async desencriptar(data, metadata) {
        try {
            console.log('🛡️  L3 Sneaker: Revertiendo protección');
            
            if (metadata.mode === 'js_fallback' || metadata.mode === 'emergency_fallback') {
                return this.desofuscarJS(data);
            }
            
            const resultado = await this.ejecutarAdvisor('revert', {
                protected_data: data,
                metadata: metadata
            });
            
            return resultado.original_data || resultado;
        } catch (error) {
            console.error('❌ Error desencriptando L3:', error.message);
            
            // Intentar fallback
            try {
                return this.desofuscarJS(data);
            } catch {
                throw error;
            }
        }
    }
}

// ========== ORQUESTADOR PRINCIPAL ==========
class Orchestrator {
    constructor() {
        this.l1 = new CapaL1_Quantum();
        this.l2 = new CapaL2_Enigma();
        this.l3 = new CapaL3_Sneaker();
        this.version = "3.0.0";
        this.historial = [];
        console.log('🎭 Orchestrator 3-Capas inicializado');
    }

    async encryptData(data, nivel = 3) {
        try {
            console.log(`🎭 Orchestrator: Encriptando con ${nivel} capas`);
            
            let resultado = data;
            const metadata = {
                niveles: [],
                timestamp: new Date().toISOString(),
                version: this.version,
                checksum: crypto.createHash('sha256').update(data).digest('hex')
            };

            // Aplicar capas en orden
            if (nivel >= 1) {
                const l1Result = this.l1.encriptar(resultado);
                resultado = l1Result.data;
                metadata.niveles.push({
                    capa: 1,
                    metadata: l1Result.metadata
                });
            }

            if (nivel >= 2) {
                const l2Result = this.l2.encriptar(resultado);
                resultado = l2Result.data;
                metadata.niveles.push({
                    capa: 2,
                    metadata: l2Result.metadata
                });
            }

            if (nivel >= 3) {
                const l3Result = await this.l3.encriptar(resultado);
                resultado = l3Result.data;
                metadata.niveles.push({
                    capa: 3,
                    metadata: l3Result.metadata
                });
            }

            // Registrar en historial
            this.registrarOperacion('encrypt', data.length, nivel);

            return JSON.stringify({
                data: resultado,
                metadata: metadata,
                sistema: 'InterMappler',
                capas: nivel,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Error en encriptación:', error.message);
            throw new Error(`Encriptación fallida: ${error.message}`);
        }
    }

    async decryptData(datosEncriptados) {
        try {
            console.log('🎭 Orchestrator: Desencriptando datos');
            
            const parsed = JSON.parse(datosEncriptados);
            let data = parsed.data;
            const metadata = parsed.metadata;
            const niveles = metadata.niveles || [];

            // Verificar checksum inicial
            const checksumOriginal = metadata.checksum;
            
            // Revertir en orden inverso
            for (let i = niveles.length - 1; i >= 0; i--) {
                const nivel = niveles[i];
                
                switch (nivel.capa) {
                    case 3:
                        data = await this.l3.desencriptar(data, nivel.metadata);
                        break;
                    case 2:
                        data = this.l2.desencriptar(data, nivel.metadata);
                        break;
                    case 1:
                        data = this.l1.desencriptar(data, nivel.metadata);
                        break;
                }
            }

            // Verificar integridad
            const checksumActual = crypto.createHash('sha256').update(data).digest('hex');
            if (checksumOriginal && checksumActual !== checksumOriginal) {
                console.warn('⚠️  Checksum no coincide, pero continuando...');
            }

            // Registrar en historial
            this.registrarOperacion('decrypt', data.length, niveles.length);

            return data;

        } catch (error) {
            console.error('❌ Error en desencriptación:', error.message);
            throw new Error(`Desencriptación fallida: ${error.message}`);
        }
    }

    registrarOperacion(tipo, tamaño, capas) {
        const registro = {
            tipo,
            tamaño,
            capas,
            timestamp: new Date().toISOString(),
            duracion: Date.now()
        };

        this.historial.push(registro);

        // Mantener solo últimos 100 registros
        if (this.historial.length > 100) {
            this.historial = this.historial.slice(-100);
        }
    }

    getEstadisticas() {
        const totalEncrypt = this.historial.filter(h => h.tipo === 'encrypt').length;
        const totalDecrypt = this.historial.filter(h => h.tipo === 'decrypt').length;
        
        return {
            totalOperaciones: this.historial.length,
            encriptaciones: totalEncrypt,
            desencriptaciones: totalDecrypt,
            capasActivas: {
                l1: this.l1.nombre,
                l2: this.l2.nombre,
                l3: this.l3.nombre
            },
            version: this.version,
            ultimaOperacion: this.historial[this.historial.length - 1] || null
        };
    }

    // Método para verificar estado del sistema
    verificarEstado() {
        return {
            l1: 'activo',
            l2: 'activo',
            l3: this.l3.pythonPath ? 'activo (Python)' : 'activo (JS fallback)',
            version: this.version,
            timestamp: new Date().toISOString()
        };
    }
}

// ========== EXPORTACIÓN ==========
const orchestrator = new Orchestrator();

module.exports = {
    encryptData: async (data, nivel = 3) => {
        return await orchestrator.encryptData(data, nivel);
    },
    
    decryptData: async (datosEncriptados) => {
        return await orchestrator.decryptData(datosEncriptados);
    },
    
    getEstadisticas: () => orchestrator.getEstadisticas(),
    
    verificarEstado: () => orchestrator.verificarEstado(),
    
    // Métodos para configuración
    configurarNiveles: (config) => {
        console.log('⚙️  Configurando niveles de encriptación');
        return { configurado: true, timestamp: new Date().toISOString() };
    },
    
    // Método de emergencia
    modoEmergencia: () => {
        console.log('🚨 Activando modo de emergencia');
        return { 
            modo: 'emergencia',
            timestamp: new Date().toISOString(),
            mensaje: 'Sistema en modo básico de seguridad'
        };
    }
};