const path = require('path');
const { execSync } = require('child_process');

// Importar capas (se implementarán después)
const capa1 = require('./capa1_quantum');
const capa2 = require('./capa2_enigma');
const capa3 = require('./capa3_sneaker');

class EncriptadorInterMappler {
    constructor() {
        this.nivelSeguridad = 3;
        this.capasActivadas = {
            capa1: true,
            capa2: true,
            capa3: true
        };
        this.historial = [];
    }

    async encrypt(data, nivel = 3) {
        try {
            let datosProcesados = JSON.stringify(data);
            const timestamp = Date.now();
            
            // CAPA 1: Quantum + Fractal + Binario
            if (nivel >= 1 && this.capasActivadas.capa1) {
                datosProcesados = capa1.encriptarQuantumFractal(datosProcesados);
                this.registrarAccion('capa1', 'encriptacion', timestamp);
            }
            
            // CAPA 2: Enigma Modernizado
            if (nivel >= 2 && this.capasActivadas.capa2) {
                datosProcesados = capa2.encriptarEnigma(datosProcesados);
                this.registrarAccion('capa2', 'encriptacion', timestamp);
            }
            
            // CAPA 3: Sneaker Python (protección activa)
            if (nivel >= 3 && this.capasActivadas.capa3) {
                datosProcesados = await capa3.protegerConSneaker(datosProcesados);
                this.registrarAccion('capa3', 'proteccion', timestamp);
            }
            
            return {
                datosEncriptados: datosProcesados,
                metadata: {
                    nivel,
                    timestamp,
                    capasUsadas: nivel,
                    hash: this.generarHashSeguro(datosProcesados)
                }
            };
        } catch (error) {
            throw new Error(`Error en encriptación: ${error.message}`);
        }
    }

    async decrypt(datosEncriptados, metadata) {
        try {
            let datosProcesados = datosEncriptados;
            const timestamp = Date.now();
            
            // Verificar integridad
            if (metadata && metadata.hash) {
                const hashActual = this.generarHashSeguro(datosEncriptados);
                if (hashActual !== metadata.hash) {
                    throw new Error('Integridad de datos comprometida');
                }
            }
            
            // CAPA 3: Revertir Sneaker
            if (metadata.nivel >= 3 && this.capasActivadas.capa3) {
                datosProcesados = await capa3.revertirSneaker(datosProcesados);
                this.registrarAccion('capa3', 'reversion', timestamp);
            }
            
            // CAPA 2: Revertir Enigma
            if (metadata.nivel >= 2 && this.capasActivadas.capa2) {
                datosProcesados = capa2.desencriptarEnigma(datosProcesados);
                this.registrarAccion('capa2', 'desencriptacion', timestamp);
            }
            
            // CAPA 1: Revertir Quantum
            if (metadata.nivel >= 1 && this.capasActivadas.capa1) {
                datosProcesados = capa1.desencriptarQuantumFractal(datosProcesados);
                this.registrarAccion('capa1', 'desencriptacion', timestamp);
            }
            
            return JSON.parse(datosProcesados);
        } catch (error) {
            throw new Error(`Error en desencriptación: ${error.message}`);
        }
    }

    generarHashSeguro(data) {
        // Implementación de hash seguro
        const crypto = require('crypto');
        return crypto
            .createHash('sha512')
            .update(data + process.env.HASH_SALT || 'InterMapplerSalt')
            .digest('hex');
    }

    registrarAccion(capa, accion, timestamp) {
        this.historial.push({
            capa,
            accion,
            timestamp,
            tiempo: Date.now() - timestamp
        });
        
        // Mantener solo últimos 100 registros
        if (this.historial.length > 100) {
            this.historial.shift();
        }
    }

    getEstadisticas() {
        return {
            totalEncriptaciones: this.historial.filter(h => h.accion.includes('encript')).length,
            totalDesencriptaciones: this.historial.filter(h => h.accion.includes('desencript')).length,
            tiempoPromedio: this.calcularTiempoPromedio(),
            capasActivadas: this.capasActivadas,
            historialReciente: this.historial.slice(-10)
        };
    }

    calcularTiempoPromedio() {
        if (this.historial.length === 0) return 0;
        const total = this.historial.reduce((sum, h) => sum + h.tiempo, 0);
        return total / this.historial.length;
    }

    // Método para activar/desactivar capas
    configurarCapas(config) {
        Object.keys(config).forEach(capa => {
            if (this.capasActivadas.hasOwnProperty(capa)) {
                this.capasActivadas[capa] = config[capa];
            }
        });
        return this.capasActivadas;
    }
}

// Instancia global del encriptador
const encriptador = new EncriptadorInterMappler();

// Funciones de exportación
module.exports = {
    encryptData: async (data, nivel = 3) => {
        const resultado = await encriptador.encrypt(data, nivel);
        return JSON.stringify(resultado);
    },
    
    decryptData: async (datosEncriptadosStr) => {
        const parsed = JSON.parse(datosEncriptadosStr);
        return await encriptador.decrypt(parsed.datosEncriptados, parsed.metadata);
    },
    
    getEstadisticas: () => encriptador.getEstadisticas(),
    
    configurarSistema: (config) => encriptador.configurarCapas(config),
    
    // Función especial para modo de emergencia
    activarModoParanoia: () => {
        console.log('🔴 MODO PARANOIA ACTIVADO');
        // Aumentar seguridad al máximo
        encriptador.nivelSeguridad = 5;
        encriptador.capasActivadas = {
            capa1: true,
            capa2: true,
            capa3: true
        };
        // Activar medidas adicionales
        return { modo: 'paranoia', timestamp: Date.now() };
    }
};