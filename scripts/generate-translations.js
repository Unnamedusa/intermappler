#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue.bold('🔨 Construyendo InterMappler v3.14.0...\n'));

async function buildProject() {
    try {
        // 1. Verificar estructura de directorios
        console.log(chalk.yellow('📁 Verificando estructura de directorios...'));
        const requiredDirs = [
            'base',
            'base/incript',
            'base/auth',
            'base/utils',
            'web',
            'web/login',
            'web/assets',
            'web/assets/css',
            'web/assets/js',
            'public',
            'public/css',
            'public/js',
            'public/images',
            'locales',
            'logs',
            'uploads',
            'temp',
            'scripts'
        ];
        
        for (const dir of requiredDirs) {
            await fs.ensureDir(path.join(__dirname, '..', dir));
        }
        
        // 2. Verificar archivos esenciales
        console.log(chalk.yellow('📄 Verificando archivos esenciales...'));
        const essentialFiles = [
            'base/incript/orchestrator.js',
            'base/auth/login-system.js',
            'base/auth/session-manager.js',
            'base/utils/translator.js',
            'server.js',
            'package.json',
            '.env'
        ];
        
        for (const file of essentialFiles) {
            const filePath = path.join(__dirname, '..', file);
            if (!await fs.pathExists(filePath)) {
                console.warn(chalk.yellow(`⚠️  Archivo no encontrado: ${file}`));
            }
        }
        
        // 3. Generar traducciones
        console.log(chalk.yellow('🌍 Generando archivos de traducción...'));
        try {
            execSync('node scripts/generate-translations.js', { stdio: 'inherit' });
        } catch (error) {
            console.warn(chalk.yellow('⚠️  No se pudo generar traducciones, continuando...'));
        }
        
        // 4. Construir assets frontend
        console.log(chalk.yellow('🎨 Construyendo assets frontend...'));
        try {
            // Copiar archivos frontend a public/
            const webDir = path.join(__dirname, '..', 'web');
            const publicDir = path.join(__dirname, '..', 'public');
            
            if (await fs.pathExists(webDir)) {
                await fs.copy(webDir, publicDir, {
                    overwrite: true,
                    filter: (src) => {
                        // Excluir node_modules y otros
                        const excluded = ['node_modules', '.git', '.DS_Store', 'Thumbs.db'];
                        return !excluded.some(pattern => src.includes(pattern));
                    }
                });
                console.log(chalk.green('✅ Assets frontend copiados a public/'));
            }
        } catch (error) {
            console.warn(chalk.yellow('⚠️  Error copiando assets frontend:', error.message));
        }
        
        // 5. Verificar configuración de entorno
        console.log(chalk.yellow('⚙️  Verificando configuración de entorno...'));
        const envPath = path.join(__dirname, '..', '.env');
        if (!await fs.pathExists(envPath)) {
            console.log(chalk.yellow('📝 Creando archivo .env de ejemplo...'));
            const envExample = `# ========================================
# INTERMAPPLER v3.14.0 - CONFIGURACIÓN
# ========================================

# 🎯 ENTORNO
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info

# 🔐 SEGURIDAD
SESSION_SECRET=${require('crypto').randomBytes(32).toString('hex')}
JWT_SECRET=${require('crypto').randomBytes(32).toString('hex')}
ENCRYPTION_KEY=${require('crypto').randomBytes(32).toString('hex')}
SALT_ROUNDS=12

# 🌍 IDIOMAS
SUPPORTED_LANGUAGES=es,en,fr,de,it,pt,ru,zh,ja,ko,ar,hi,he,fa
DEFAULT_LANGUAGE=es
TRANSLATION_ENABLED=true
AUTO_TRANSLATE=true

# 🎨 INTERFAZ
UI_THEME=dark
UI_ANIMATIONS=true
UI_PARTICLES=true

# 📁 ARCHIVOS
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads/
TEMP_DIR=temp/

# 🔧 OPTIMIZACIONES
CACHE_ENABLED=true
COMPRESSION_ENABLED=true
MINIFY_ASSETS=true
`;
            await fs.writeFile(envPath, envExample);
            console.log(chalk.green('✅ Archivo .env de ejemplo creado'));
        }
        
        // 6. Crear archivo de información de build
        console.log(chalk.yellow('📦 Creando información de build...'));
        const buildInfo = {
            version: '3.14.0',
            build_date: new Date().toISOString(),
            node_version: process.version,
            platform: process.platform,
            architecture: process.arch,
            features: {
                encryption: true,
                translation: true,
                authentication: true,
                session_management: true,
                real_time: true
            },
            directories: requiredDirs,
            locales: (await fs.readdir(path.join(__dirname, '..', 'locales'))).filter(f => 
                fs.statSync(path.join(__dirname, '..', 'locales', f)).isDirectory()
            )
        };
        
        await fs.writeJson(
            path.join(__dirname, '..', 'build-info.json'),
            buildInfo,
            { spaces: 2 }
        );
        
        // 7. Mensaje final
        console.log(chalk.bold.green('\n🎉 ¡Build completado exitosamente!'));
        console.log(chalk.cyan('\n📊 Información del build:'));
        console.log(`   • Versión: ${buildInfo.version}`);
        console.log(`   • Fecha: ${new Date().toLocaleString()}`);
        console.log(`   • Node: ${buildInfo.node_version}`);
        console.log(`   • Idiomas: ${buildInfo.locales.length}`);
        console.log(`   • Características: ${Object.keys(buildInfo.features).length}`);
        
        console.log(chalk.cyan('\n🚀 Para iniciar el servidor:'));
        console.log('   npm start');
        console.log('\n🌍 El servidor estará disponible en:');
        console.log('   http://localhost:3000');
        
        return true;
        
    } catch (error) {
        console.error(chalk.red('\n❌ Error durante el build:'), error);
        return false;
    }
}

// Ejecutar
if (require.main === module) {
    buildProject().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { buildProject };