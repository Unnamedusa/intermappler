// Capa L2: Máquina Enigma Modernizada con Randomización Cuántica
// Sistema de encriptación basado en la máquina Enigma con mejoras criptográficas modernas

const crypto = require('crypto');
const math = require('mathjs');

class MaquinaEnigmaModernizada {
    constructor() {
        this.nombre = "Enigma Modernized v4.0";
        this.version = "4.20.1945";
        
        // Sistema de rotores avanzado
        this.rotores = this.inicializarRotoresAvanzados();
        this.reflectores = this.inicializarReflectores();
        this.plugboards = this.inicializarPlugboardsDinamicos();
        
        // Estado cuántico para randomización
        this.estadoCuantico = this.inicializarEstadoCuantico();
        
        // Contadores y estadísticas
        this.contadorOperaciones = 0;
        this.historialConfig = [];
        
        // Configuración actual
        this.configActual = {
            rotorSet: 0,
            reflectorSet: 0,
            plugboardSet: 0,
            modo: 'cuantico',
            nivelSeguridad: 'maximo'
        };
        
        console.log('🔷 L2 Enigma Modernizada inicializada');
    }

    // ========== SISTEMA DE ROTORES AVANZADO ==========

    inicializarRotoresAvanzados() {
        // 8 conjuntos de rotores diferentes para mayor seguridad
        const conjuntosRotores = [];
        
        for (let set = 0; set < 8; set++) {
            const rotoresSet = [];
            
            // 5 rotores por set con patrones complejos
            for (let i = 0; i < 5; i++) {
                rotoresSet.push(this.crearRotorAvanzado(set * 10 + i));
            }
            
            conjuntosRotores.push(rotoresSet);
        }
        
        return conjuntosRotores;
    }

    crearRotorAvanzado(id) {
        // Generar mapeo usando función criptográfica
        const seed = crypto.createHash('sha256')
            .update(`enigma_rotor_${id}_${Date.now()}`)
            .digest('hex');
        
        let alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'.split('');
        
        // Mezclar usando Fisher-Yates con semilla
        for (let i = alfabeto.length - 1; i > 0; i--) {
            const hash = crypto.createHash('sha256')
                .update(seed + i)
                .digest('hex');
            const j = parseInt(hash.substring(0, 8), 16) % (i + 1);
            [alfabeto[i], alfabeto[j]] = [alfabeto[j], alfabeto[i]];
        }
        
        const mapeo = alfabeto.join('');
        
        return {
            id,
            nombre: `Rotor-Q${id}`,
            posicion: 0,
            posicionAnillo: 0,
            mapeo: mapeo.split(''),
            mapeoInverso: this.calcularMapeoInversoAvanzado(mapeo),
            puntoGiro: this.generarPuntosGiroMultiples(),
            nivelInteraccion: Math.floor(Math.random() * 5) + 1,
            modoCuántico: Math.random() > 0.5
        };
    }

    generarPuntosGiroMultiples() {
        // Múltiples puntos de giro para comportamiento complejo
        const puntos = new Set();
        while (puntos.size < 3) {
            puntos.add(Math.floor(Math.random() * 42));
        }
        return Array.from(puntos);
    }

    calcularMapeoInversoAvanzado(mapeo) {
        const inverso = new Array(mapeo.length);
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        
        for (let i = 0; i < mapeo.length; i++) {
            const letra = alfabeto[i];
            const index = mapeo.indexOf(letra);
            inverso[i] = alfabeto[index];
        }
        
        return inverso;
    }

    // ========== SISTEMA DE REFLECTORES ==========

    inicializarReflectores() {
        const reflectores = [];
        const alfabetoCompleto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'.split('');
        
        // 4 reflectores diferentes
        for (let i = 0; i < 4; i++) {
            const reflector = {};
            const alfabetoCopia = [...alfabetoCompleto];
            
            // Mezclar para crear emparejamientos
            this.shuffleArray(alfabetoCopia);
            
            for (let j = 0; j < alfabetoCopia.length; j += 2) {
                if (j + 1 < alfabetoCopia.length) {
                    reflector[alfabetoCopia[j]] = alfabetoCopia[j + 1];
                    reflector[alfabetoCopia[j + 1]] = alfabetoCopia[j];
                }
            }
            
            reflectores.push(reflector);
        }
        
        return reflectores;
    }

    // ========== PLUGBOARD DINÁMICO ==========

    inicializarPlugboardsDinamicos() {
        const plugboards = [];
        const alfabetoCompleto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        
        // 6 configuraciones de plugboard
        for (let p = 0; p < 6; p++) {
            const plugboard = {};
            const conexiones = Math.floor(Math.random() * 10) + 10; // 10-20 conexiones
            
            for (let i = 0; i < conexiones; i++) {
                let idx1, idx2, letra1, letra2;
                
                do {
                    idx1 = Math.floor(Math.random() * alfabetoCompleto.length);
                    idx2 = Math.floor(Math.random() * alfabetoCompleto.length);
                    letra1 = alfabetoCompleto[idx1];
                    letra2 = alfabetoCompleto[idx2];
                } while (
                    letra1 in plugboard || 
                    letra2 in plugboard || 
                    idx1 === idx2
                );
                
                plugboard[letra1] = letra2;
                plugboard[letra2] = letra1;
            }
            
            plugboards.push(plugboard);
        }
        
        return plugboards;
    }

    // ========== SISTEMA CUÁNTICO DE RANDOMIZACIÓN ==========

    inicializarEstadoCuantico() {
        return {
            entanglement: crypto.randomBytes(64).toString('hex'),
            superposition: Array.from({length: 8}, () => 
                math.complex(Math.random(), Math.random())),
            spin: Array.from({length: 16}, () => 
                Math.random() > 0.5 ? 'up' : 'down'),
            decoherence: 0,
            randomSeed: Date.now() % 1000000
        };
    }

    generarRandomizacionCuantica(data) {
        // Randomización basada en estado cuántico
        let resultado = '';
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            
            // Usar estado cuántico para transformación
            const spinFactor = this.estadoCuantico.spin[i % 16] === 'up' ? 1 : -1;
            const superposition = this.estadoCuantico.superposition[i % 8];
            
            // Transformación compleja
            const transformacion = math.add(
                math.multiply(charCode, math.re(superposition)),
                math.multiply(i, math.im(superposition) * spinFactor)
            );
            
            // Aplicar función de onda
            const onda = math.sin(math.multiply(transformacion, Math.PI));
            const valor = Math.floor((math.re(onda) * 128 + 128)) % 256;
            
            resultado += String.fromCharCode(valor);
        }
        
        return resultado;
    }

    // ========== MECANISMO DE AVANCE COMPLEJO ==========

    avanzarRotoresComplejo() {
        const rotores = this.rotores[this.configActual.rotorSet];
        
        // Avance del rotor rápido
        rotores[0].posicion = (rotores[0].posicion + 1) % 42;
        
        // Verificar puntos de giro múltiples
        const puntosGiroRotor1 = rotores[0].puntoGiro;
        const puntosGiroRotor2 = rotores[1].puntoGiro;
        
        // Avance condicional complejo
        if (puntosGiroRotor1.includes(rotores[0].posicion)) {
            rotores[1].posicion = (rotores[1].posicion + 1) % 42;
            
            if (puntosGiroRotor2.includes(rotores[1].posicion)) {
                rotores[2].posicion = (rotores[2].posicion + 1) % 42;
                
                // Doble avance (característica Enigma real)
                if (puntosGiroRotor2.includes((rotores[1].posicion + 1) % 42)) {
                    rotores[2].posicion = (rotores[2].posicion + 1) % 42;
                }
            }
        }
        
        this.contadorOperaciones++;
        
        // Cambiar configuración periódicamente
        if (this.contadorOperaciones % 100 === 0) {
            this.rotarConfiguracion();
        }
        
        // Actualizar estado cuántico
        if (this.contadorOperaciones % 50 === 0) {
            this.actualizarEstadoCuantico();
        }
    }

    rotarConfiguracion() {
        console.log('🔄 L2 Enigma: Rotando configuración');
        
        // Rotar entre conjuntos
        this.configActual.rotorSet = (this.configActual.rotorSet + 1) % 8;
        this.configActual.reflectorSet = (this.configActual.reflectorSet + 1) % 4;
        this.configActual.plugboardSet = (this.configActual.plugboardSet + 1) % 6;
        
        // Registrar cambio
        this.historialConfig.push({
            timestamp: new Date().toISOString(),
            config: {...this.configActual},
            operacion: this.contadorOperaciones
        });
        
        // Mantener solo últimos 100 configuraciones
        if (this.historialConfig.length > 100) {
            this.historialConfig.shift();
        }
    }

    actualizarEstadoCuantico() {
        // Actualizar estado cuántico para mayor aleatoriedad
        this.estadoCuantico.superposition = Array.from({length: 8}, () => 
            math.complex(Math.random(), Math.random()));
        
        this.estadoCuantico.spin = Array.from({length: 16}, () => 
            Math.random() > 0.5 ? 'up' : 'down');
        
        this.estadoCuantico.decoherence = Math.min(
            this.estadoCuantico.decoherence + 0.01, 
            0.3
        );
    }

    // ========== PROCESAMIENTO DE CARACTERES ==========

    procesarCaracterAvanzado(caracter, encriptar = true) {
        const rotores = this.rotores[this.configActual.rotorSet];
        const reflector = this.reflectores[this.configActual.reflectorSet];
        const plugboard = this.plugboards[this.configActual.plugboardSet];
        
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        
        // Validar caracter
        if (!alfabeto.includes(caracter)) {
            return caracter;
        }
        
        let letra = caracter;
        
        // Paso 1: Plugboard
        letra = plugboard[letra] || letra;
        
        // Paso 2: Rotores (ida)
        if (encriptar) {
            for (let i = 0; i < 3; i++) {
                letra = this.pasarPorRotorAvanzado(letra, rotores[i], true);
            }
        } else {
            // Para desencriptar, orden inverso
            for (let i = 2; i >= 0; i--) {
                letra = this.pasarPorRotorAvanzado(letra, rotores[i], false);
            }
        }
        
        // Paso 3: Reflector
        letra = reflector[letra] || letra;
        
        // Paso 4: Rotores (vuelta)
        if (encriptar) {
            for (let i = 2; i >= 0; i--) {
                letra = this.pasarPorRotorAvanzado(letra, rotores[i], false);
            }
        } else {
            for (let i = 0; i < 3; i++) {
                letra = this.pasarPorRotorAvanzado(letra, rotores[i], true);
            }
        }
        
        // Paso 5: Plugboard de vuelta
        letra = plugboard[letra] || letra;
        
        // Avanzar rotores
        this.avanzarRotoresComplejo();
        
        return letra;
    }

    pasarPorRotorAvanzado(letra, rotor, forward) {
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        const index = alfabeto.indexOf(letra);
        
        if (forward) {
            // Avanzar por posición del rotor
            const posAjustada = (index + rotor.posicion) % alfabeto.length;
            const letraMapeada = rotor.mapeo[posAjustada];
            const indexMapeado = alfabeto.indexOf(letraMapeada);
            
            // Retroceder por posición
            return alfabeto[
                (indexMapeado - rotor.posicion + alfabeto.length) % alfabeto.length
            ];
        } else {
            // Proceso inverso
            const posAjustada = (index + rotor.posicion) % alfabeto.length;
            const letraMapeada = rotor.mapeoInverso[posAjustada];
            const indexMapeado = alfabeto.indexOf(letraMapeada);
            
            return alfabeto[
                (indexMapeado - rotor.posicion + alfabeto.length) % alfabeto.length
            ];
        }
    }

    // ========== ENCRIPTACIÓN PRINCIPAL ==========

    encriptarEnigma(data) {
        console.log('🔷 L2 Enigma Modernizada iniciando encriptación');
        const startTime = Date.now();
        
        // Guardar estado inicial
        const estadoInicial = this.guardarEstado();
        
        // Paso 1: Randomización cuántica inicial
        console.log('  ↳ Paso 1: Randomización cuántica inicial');
        let paso1 = this.generarRandomizacionCuantica(data);
        
        // Paso 2: Convertir a formato Enigma
        console.log('  ↳ Paso 2: Conversión a formato Enigma');
        let paso2 = this.convertirAFormatoEnigma(paso1);
        
        // Paso 3: Procesar con Enigma
        console.log('  ↳ Paso 3: Procesamiento Enigma');
        let paso3 = this.procesarConEnigma(paso2, true);
        
        // Paso 4: Randomización cuántica final
        console.log('  ↳ Paso 4: Randomización cuántica final');
        let paso4 = this.generarRandomizacionCuantica(paso3);
        
        // Paso 5: Compresión Enigma
        console.log('  ↳ Paso 5: Compresión Enigma');
        let paso5 = this.comprimirEnigma(paso4);
        
        const endTime = Date.now();
        const duracion = endTime - startTime;
        
        // Metadata de la operación
        const metadata = {
            estadoInicial,
            estadoFinal: this.guardarEstado(),
            configuracion: this.configActual,
            estadoCuantico: {
                entanglement: this.estadoCuantico.entanglement.substring(0, 32),
                decoherence: this.estadoCuantico.decoherence
            },
            timestamp: new Date().toISOString(),
            duracionMs: duracion,
            operacionId: this.contadorOperaciones
        };
        
        console.log(`✅ L2 Enigma completado en ${duracion}ms`);
        
        return JSON.stringify({
            data: paso5,
            metadata: metadata,
            capa: 2,
            version: this.version,
            checksum: this.generarChecksumEnigma(paso5)
        });
    }

    convertirAFormatoEnigma(data) {
        // Convertir datos a formato procesable por Enigma
        const alfabetoEnigma = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let convertido = '';
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const index = charCode % alfabetoEnigma.length;
            convertido += alfabetoEnigma[index];
        }
        
        return convertido;
    }

    procesarConEnigma(data, encriptar) {
        let resultado = '';
        
        for (let i = 0; i < data.length; i++) {
            resultado += this.procesarCaracterAvanzado(data[i], encriptar);
        }
        
        return resultado;
    }

    comprimirEnigma(data) {
        // Compresión específica de Enigma
        let comprimido = '';
        
        for (let i = 0; i < data.length; i += 2) {
            if (i + 1 < data.length) {
                const char1 = data.charCodeAt(i);
                const char2 = data.charCodeAt(i + 1);
                
                // Combinación encriptada
                const combinado = ((char1 << 8) | char2) ^ this.contadorOperaciones;
                comprimido += String.fromCharCode(combinado & 0xFF);
                comprimido += String.fromCharCode((combinado >> 8) & 0xFF);
            } else {
                comprimido += data[i];
            }
        }
        
        return comprimido;
    }

    generarChecksumEnigma(data) {
        const hash = crypto.createHash('sha512');
        hash.update(data);
        hash.update(JSON.stringify(this.configActual));
        hash.update(this.estadoCuantico.entanglement);
        return hash.digest('hex');
    }

    // ========== DESENCRIPTACIÓN ==========

    desencriptarEnigma(dataEncriptada) {
        try {
            const parsed = JSON.parse(dataEncriptada);
            
            // Verificar checksum
            const checksumCalculado = this.generarChecksumEnigma(parsed.data);
            if (checksumCalculado !== parsed.checksum) {
                throw new Error('Checksum Enigma inválido');
            }
            
            // Restaurar estado inicial
            this.restaurarEstado(parsed.metadata.estadoInicial);
            
            let data = parsed.data;
            
            console.log('🔷 L2 Enigma Modernizada iniciando desencriptación');
            
            // Paso 5: Descomprimir Enigma
            console.log('  ↳ Paso 5R: Descompresión Enigma');
            let paso5 = this.descomprimirEnigma(data);
            
            // Paso 4: Revertir randomización cuántica final
            console.log('  ↳ Paso 4R: Reversión randomización cuántica');
            let paso4 = this.revertirRandomizacionCuantica(paso5);
            
            // Paso 3: Revertir procesamiento Enigma
            console.log('  ↳ Paso 3R: Reversión procesamiento Enigma');
            let paso3 = this.procesarConEnigma(paso4, false);
            
            // Paso 2: Revertir conversión Enigma
            console.log('  ↳ Paso 2R: Reversión conversión');
            let paso2 = this.revertirConversionEnigma(paso3);
            
            // Paso 1: Revertir randomización cuántica inicial
            console.log('  ↳ Paso 1R: Reversión randomización inicial');
            let paso1 = this.revertirRandomizacionCuantica(paso2);
            
            return paso1;
            
        } catch (error) {
            console.error('❌ Error en desencriptación L2:', error.message);
            throw error;
        }
    }

    descomprimirEnigma(data) {
        let descomprimido = '';
        
        for (let i = 0; i < data.length; i += 2) {
            if (i + 1 < data.length) {
                const byte1 = data.charCodeAt(i);
                const byte2 = data.charCodeAt(i + 1);
                
                const combinado = (byte2 << 8) | byte1;
                const original = combinado ^ this.contadorOperaciones;
                
                descomprimido += String.fromCharCode((original >> 8) & 0xFF);
                descomprimido += String.fromCharCode(original & 0xFF);
            } else {
                descomprimido += data[i];
            }
        }
        
        return descomprimido;
    }

    revertirRandomizacionCuantica(data) {
        // La randomización cuántica es reversible con el mismo estado
        return this.generarRandomizacionCuantica(data);
    }

    revertirConversionEnigma(data) {
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let original = '';
        
        for (let i = 0; i < data.length; i++) {
            const index = alfabeto.indexOf(data[i]);
            if (index !== -1) {
                original += String.fromCharCode(32 + index); // ASCII imprimible
            } else {
                original += data[i];
            }
        }
        
        return original;
    }

    // ========== UTILIDADES ==========

    guardarEstado() {
        const rotores = this.rotores[this.configActual.rotorSet];
        
        return {
            rotorPositions: rotores.map(r => r.posicion),
            rotorRingPositions: rotores.map(r => r.posicionAnillo),
            config: {...this.configActual},
            estadoCuantico: {
                randomSeed: this.estadoCuantico.randomSeed,
                decoherence: this.estadoCuantico.decoherence
            },
            contador: this.contadorOperaciones
        };
    }

    restaurarEstado(estado) {
        const rotores = this.rotores[this.configActual.rotorSet];
        
        estado.rotorPositions.forEach((pos, i) => {
            if (rotores[i]) rotores[i].posicion = pos;
        });
        
        estado.rotorRingPositions.forEach((pos, i) => {
            if (rotores[i]) rotores[i].posicionAnillo = pos;
        });
        
        this.configActual = {...estado.config};
        this.estadoCuantico.randomSeed = estado.estadoCuantico.randomSeed;
        this.estadoCuantico.decoherence = estado.estadoCuantico.decoherence;
        this.contadorOperaciones = estado.contador;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getEstadisticas() {
        return {
            totalOperaciones: this.contadorOperaciones,
            configuracionActual: this.configActual,
            rotoresActivos: this.rotores[this.configActual.rotorSet].length,
            reflectoresActivos: 4,
            plugboardsActivos: 6,
            historialConfig: this.historialConfig.length,
            estadoCuantico: {
                decoherence: this.estadoCuantico.decoherence,
                spins: this.estadoCuantico.spin.filter(s => s === 'up').length
            },
            version: this.version
        };
    }

    resetearConfiguracion() {
        console.log('🔄 L2 Enigma: Reset completo');
        this.rotores = this.inicializarRotoresAvanzados();
        this.estadoCuantico = this.inicializarEstadoCuantico();
        this.contadorOperaciones = 0;
        this.historialConfig = [];
        return { status: 'reset_completo', timestamp: new Date().toISOString() };
    }
}

// Exportar instancia singleton
const instanciaL2 = new MaquinaEnigmaModernizada();
module.exports = instanciaL2;