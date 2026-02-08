#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('🌍 Generando archivos de traducción...\n'));

async function generateTranslations() {
    try {
        // 1. Verificar si existe el directorio de locales
        const localesDir = path.join(__dirname, '..', 'locales');
        await fs.ensureDir(localesDir);
        
        // 2. Archivos de traducción base (simplificados para Railway)
        const translations = {
            'es.json': {
                app: {
                    name: "InterMappler",
                    version: "3.14.0"
                },
                auth: {
                    login: "Iniciar Sesión",
                    username: "Usuario",
                    password: "Contraseña"
                }
            },
            'en.json': {
                app: {
                    name: "InterMappler",
                    version: "3.14.0"
                },
                auth: {
                    login: "Login",
                    username: "Username",
                    password: "Password"
                }
            }
        };

        // 3. Crear archivos de traducción
        console.log(chalk.yellow('📝 Creando archivos de traducción...'));
        
        for (const [filename, content] of Object.entries(translations)) {
            const filePath = path.join(localesDir, filename);
            await fs.writeJson(filePath, content, { spaces: 2 });
            console.log(chalk.green(`✅ ${filename} creado`));
        }

        // 4. Mensaje final
        console.log(chalk.bold.green('\n🎉 ¡Traducciones generadas exitosamente!'));
        console.log(chalk.cyan('\n📊 Resumen:'));
        console.log(`   • Idiomas creados: ${Object.keys(translations).length}`);
        console.log(`   • Directorio: ${localesDir}`);
        
        return true;

    } catch (error) {
        console.error(chalk.red('\n❌ Error generando traducciones:'), error);
        return false;
    }
}

// Ejecutar
if (require.main === module) {
    generateTranslations().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { generateTranslations };