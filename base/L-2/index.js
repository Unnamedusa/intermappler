// Capa 2: Máquina Enigma modernizada con randomización

class MaquinaEnigmaModernizada {
    constructor() {
        this.rotores = this.inicializarRotores();
        this.reflector = this.inicializarReflector();
        this.plugboard = this.inicializarPlugboard();
        this.contadorRandomizacion = 0;
    }

    inicializarRotores() {
        // 5 rotores modernos con patrones complejos
        return [
            this.crearRotor('I', 'EKMFLGDQVZNTOWYHXUSPAIBRCJ'),
            this.crearRotor('II', 'AJDKSIRUXBLHWTMCQGZNPYFVOE'),
            this.crearRotor('III', 'BDFHJLCPRTXVZNYEIWGAKMUSQO'),
            this.crearRotor('IV', 'ESOVPZJAYQUIRHXLNFTGKDCMWB'),
            this.crearRotor('V', 'VZBRGITYUPSDNHLXAWMJQOFECK')
        ];
    }

    crearRotor(nombre, mapeo) {
        return {
            nombre,
            posicion: 0,
            mapeo: mapeo.split(''),
            mapeoInverso: this.calcularMapeoInverso(mapeo),
            puntoGiro: Math.floor(Math.random() * 26)
        };
    }

    calcularMapeoInverso(mapeo) {
        const inverso = new Array(26);
        for (let i = 0; i < 26; i++) {
            const letra = String.fromCharCode(65 + i);
            const index = mapeo.indexOf(letra);
            inverso[i] = String.fromCharCode(65 + index);
        }
        return inverso;
    }

    inicializarReflector() {
        // Reflector moderno (UKW-D)
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const reflector = {};
        
        for (let i = 0; i < 26; i += 2) {
            reflector[alfabeto[i]] = alfabeto[i + 1];
            reflector[alfabeto[i + 1]] = alfabeto[i];
        }
        
        return reflector;
    }

    inicializarPlugboard() {
        // Plugboard con 10 conexiones aleatorias
        const plugboard = {};
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        
        for (let i = 0; i < 10; i++) {
            let idx1, idx2;
            do {
                idx1 = Math.floor(Math.random() * 26);
                idx2 = Math.floor(Math.random() * 26);
            } while (letras[idx1] in plugboard || letras[idx2] in plugboard);
            
            plugboard[letras[idx1]] = letras[idx2];
            plugboard[letras[idx2]] = letras[idx1];
        }
        
        return plugboard;
    }

    avanzarRotores() {
        // Avance complejo de rotores
        this.rotores[0].posicion = (this.rotores[0].posicion + 1) % 26;
        
        if (this.rotores[0].posicion === this.rotores[0].puntoGiro) {
            this.rotores[1].posicion = (this.rotores[1].posicion + 1) % 26;
        }
        
        if (this.rotores[1].posicion === this.rotores[1].puntoGiro) {
            this.rotores[2].posicion = (this.rotores[2].posicion + 1) % 26;
        }
        
        this.contadorRandomizacion++;
        
        // Cada 100 caracteres, randomizar configuración
        if (this.contadorRandomizacion % 100 === 0) {
            this.randomizarConfiguracion();
        }
    }

    randomizarConfiguracion() {
        console.log('🔄 Randomizando configuración Enigma');
        
        // Cambiar orden de rotores
        this.shuffleArray(this.rotores);
        
        // Cambiar posiciones iniciales
        this.rotores.forEach(rotor => {
            rotor.posicion = Math.floor(Math.random() * 26);
        });
        
        // Reconfigurar plugboard
        this.plugboard = this.inicializarPlugboard();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    procesarCaracter(caracter, encriptar = true) {
        let codigo = caracter.charCodeAt(0);
        
        // Solo procesar caracteres imprimibles
        if (codigo < 32 || codigo > 126) {
            return caracter;
        }
        
        // Convertir a letra Enigma (A-Z para rotores)
        const offset = 65;
        let letraIndex = (codigo - 32) % 26;
        let letra = String.fromCharCode(offset + letraIndex);
        
        // Paso 1: Plugboard
        letra = this.plugboard[letra] || letra;
        
        // Paso 2: Pasar por rotores (ida)
        for (let i = 0; i < 3; i++) {
            const rotor = this.rotores[i];
            letra = this.pasarPorRotor(letra, rotor, encriptar);
        }
        
        // Paso 3: Reflector
        letra = this.reflector[letra] || letra;
        
        // Paso 4: Pasar por rotores (vuelta)
        for (let i = 2; i >= 0; i--) {
            const rotor = this.rotores[i];
            letra = this.pasarPorRotor(letra, rotor, !encriptar);
        }
        
        // Paso 5: Plugboard de vuelta
        letra = this.plugboard[letra] || letra;
        
        // Avanzar rotores
        this.avanzarRotores();
        
        // Convertir de vuelta a caracter original
        const nuevaLetraIndex = letra.charCodeAt(0) - offset;
        const nuevoCodigo = 32 + nuevaLetraIndex;
        
        return String.fromCharCode(nuevoCodigo);
    }

    pasarPorRotor(letra, rotor, forward) {
        const offset = 65;
        let index = letra.charCodeAt(0) - offset;
        
        if (forward) {
            // Ajustar por posición del rotor
            index = (index + rotor.posicion) % 26;
            // Mapear
            const letraMapeada = rotor.mapeo[index];
            // Ajustar de vuelta
            const indexMapeado = letraMapeada.charCodeAt(0) - offset;
            return String.fromCharCode(offset + ((indexMapeado - rotor.posicion + 26) % 26));
        } else {
            // Inverso
            index = (index + rotor.posicion) % 26;
            const letraMapeada = rotor.mapeoInverso[index];
            const indexMapeado = letraMapeada.charCodeAt(0) - offset;
            return String.fromCharCode(offset + ((indexMapeado - rotor.posicion + 26) % 26));
        }
    }

    aplicarRandomizacionBruta(data) {
        // Randomización "a lo bruto" de dígitos
        let randomizado = '';
        const randomSeed = Date.now() % 1000;
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            
            // Algoritmo de randomización complejo
            const randomFactor = Math.sin(randomSeed * i * 0.01) * 1000;
            const offset = Math.abs(Math.floor(randomFactor)) % 64;
            
            let nuevoCharCode;
            if (i % 3 === 0) {
                // XOR con patrón complejo
                nuevoCharCode = charCode ^ offset;
            } else if (i % 3 === 1) {
                // Suma modular
                nuevoCharCode = (charCode + offset) % 256;
            } else {
                // Rotación
                nuevoCharCode = ((charCode << 2) | (charCode >> 6)) & 0xFF;
            }
            
            randomizado += String.fromCharCode(nuevoCharCode);
        }
        
        return randomizado;
    }

    revertirRandomizacionBruta(data, semilla) {
        // Reversa de la randomización (debe ser determinística)
        let original = '';
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const randomFactor = Math.sin(semilla * i * 0.01) * 1000;
            const offset = Math.abs(Math.floor(randomFactor)) % 64;
            
            let nuevoCharCode;
            if (i % 3 === 0) {
                // XOR es reversible
                nuevoCharCode = charCode ^ offset;
            } else if (i % 3 === 1) {
                // Resta modular
                nuevoCharCode = (charCode - offset + 256) % 256;
            } else {
                // Rotación inversa
                nuevoCharCode = ((charCode >> 2) | (charCode << 6)) & 0xFF;
            }
            
            original += String.fromCharCode(nuevoCharCode);
        }
        
        return original;
    }

    encriptarEnigma(data) {
        console.log('🔶 Aplicando Capa 2: Enigma Modernizada');
        
        // Paso 1: Randomización bruta inicial
        const semillaRandom = Date.now();
        let paso1 = this.aplicarRandomizacionBruta(data);
        
        // Paso 2: Procesar con máquina Enigma
        let paso2 = '';
        for (let i = 0; i < paso1.length; i++) {
            paso2 += this.procesarCaracter(paso1[i], true);
        }
        
        // Paso 3: Randomización final
        let paso3 = this.aplicarRandomizacionBruta(paso2);
        
        // Guardar estado para desencriptación
        const estado = {
            rotores: this.rotores.map(r => ({ nombre: r.nombre, posicion: r.posicion })),
            plugboard: this.plugboard,
            semillaRandom,
            contador: this.contadorRandomizacion
        };
        
        return JSON.stringify({
            data: paso3,
            estado: estado,
            capa: 2,
            version: '2.0'
        });
    }

    desencriptarEnigma(dataEncriptada) {
        const parsed = JSON.parse(dataEncriptada);
        let data = parsed.data;
        const estado = parsed.estado;
        
        // Restaurar estado
        this.rotores.forEach((rotor, i) => {
            rotor.posicion = estado.rotores[i].posicion;
        });
        this.plugboard = estado.plugboard;
        this.contadorRandomizacion = estado.contador;
        
        // Revertir en orden inverso
        
        // Paso 3: Revertir randomización final
        let paso3 = this.revertirRandomizacionBruta(data, estado.semillaRandom);
        
        // Paso 2: Revertir Enigma
        let paso2 = '';
        for (let i = 0; i < paso3.length; i++) {
            paso2 += this.procesarCaracter(paso3[i], false);
        }
        
        // Paso 1: Revertir randomización inicial
        let paso1 = this.revertirRandomizacionBruta(paso2, estado.semillaRandom);
        
        return paso1;
    }
}

module.exports = new MaquinaEnigmaModernizada();