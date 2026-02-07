// Interfaz Node.js para la capa Sneaker Python

const { spawn } = require('child_process');
const path = require('path');

class SneakerNodeInterface {
    constructor() {
        this.pythonPath = process.env.PYTHON_PATH || 'python3';
        this.sneakerScript = path.join(__dirname, 'sneaker.py');
        this.isPythonAvailable = this.checkPython();
    }

    async checkPython() {
        try {
            const result = await this.executePython(['--version']);
            console.log(`🐍 Python disponible: ${result}`);
            return true;
        } catch (error) {
            console.warn('⚠️  Python no disponible. Capa Sneaker limitada.');
            return false;
        }
    }

    executePython(args, input = null) {
        return new Promise((resolve, reject) => {
            const python = spawn(this.pythonPath, args);
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
                    resolve(stdout.trim());
                } else {
                    reject(new Error(`Python error: ${stderr}`));
                }
            });

            if (input) {
                python.stdin.write(input);
                python.stdin.end();
            }
        });
    }

    async protegerConSneaker(data) {
        if (!this.isPythonAvailable) {
            // Fallback a JavaScript si Python no está disponible
            return this.protegerConSneakerJS(data);
        }

        try {
            const input = JSON.stringify({ data, action: 'protect' });
            const result = await this.executePython([this.sneakerScript], input);
            
            return JSON.parse(result);
        } catch (error) {
            console.error('Error en Sneaker Python:', error.message);
            return this.protegerConSneakerJS(data);
        }
    }

    async revertirSneaker(protectedData) {
        if (!this.isPythonAvailable) {
            return this.revertirSneakerJS(protectedData);
        }

        try {
            const input = JSON.stringify({ 
                data: protectedData, 
                action: 'revert' 
            });
            
            const result = await this.executePython([this.sneakerScript], input);
            
            return JSON.parse(result);
        } catch (error) {
            console.error('Error revertiendo Sneaker:', error.message);
            return this.revertirSneakerJS(protectedData);
        }
    }

    // Implementación de respaldo en JavaScript
    protegerConSneakerJS(data) {
        console.log('🛡️  SNEKER JS: Activando protección (modo JavaScript)');
        
        // Versión simplificada en JavaScript
        return {
            protected_data: this.obfuscateJS(data),
            mode: 'sneaker_js',
            fake_response: this.generateFakeResponseJS(),
            timestamp: new Date().toISOString()
        };
    }

    revertirSneakerJS(protectedData) {
        if (protectedData.mode === 'sneaker_js') {
            return this.deobfuscateJS(protectedData.protected_data);
        }
        return protectedData;
    }

    obfuscateJS(data) {
        // Ofuscación simple en JS
        const dataStr = JSON.stringify(data);
        const key = 'sneaker_js_key';
        let obfuscated = '';
        
        for (let i = 0; i < dataStr.length; i++) {
            obfuscated += String.fromCharCode(
                dataStr.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        
        return obfuscated;
    }

    deobfuscateJS(obfuscated) {
        // Desofuscación
        const key = 'sneaker_js_key';
        let dataStr = '';
        
        for (let i = 0; i < obfuscated.length; i++) {
            dataStr += String.fromCharCode(
                obfuscated.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        
        try {
            return JSON.parse(dataStr);
        } catch {
            return dataStr;
        }
    }

    generateFakeResponseJS() {
        return {
            status: 'success',
            message: 'Access granted (fake)',
            token: 'fake_token_' + Math.random().toString(36).substr(2),
            data: {
                fake: true,
                sneaker_mode: 'active',
                warning: 'This is simulated data'
            }
        };
    }

    // Método para iniciar honeypot
    async iniciarHoneypot() {
        if (!this.isPythonAvailable) return false;

        try {
            const honeypotScript = path.join(__dirname, 'honeypot.py');
            const result = await this.executePython([honeypotScript, 'start']);
            
            console.log('🍯 Honeypot iniciado:', result);
            return true;
        } catch (error) {
            console.error('Error iniciando honeypot:', error);
            return false;
        }
    }

    // Método para obtener estadísticas
    async obtenerEstadisticas() {
        if (!this.isPythonAvailable) {
            return {
                python: 'no disponible',
                mode: 'javascript',
                capabilities: 'limitadas'
            };
        }

        try {
            const statsScript = path.join(__dirname, 'detector.py');
            const result = await this.executePython([statsScript, 'stats']);
            
            return JSON.parse(result);
        } catch (error) {
            return {
                python: 'error',
                error: error.message
            };
        }
    }
}

module.exports = new SneakerNodeInterface();