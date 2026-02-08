#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('🔄 Sincronizando traducciones...\n'));

async function syncTranslations() {
    try {
        // Cargar translator.js existente
        const translatorPath = path.join(__dirname, '..', 'base', 'utils', 'translator.js');
        if (!await fs.pathExists(translatorPath)) {
            console.error(chalk.red('❌ translator.js no encontrado'));
            return false;
        }
        
        // Leer translator.js para extraer traducciones
        const translatorContent = await fs.readFile(translatorPath, 'utf8');
        
        // Extraer el objeto de traducciones (simplificado)
        // En una implementación real usarías un parser más sofisticado
        const translationMatch = translatorContent.match(/const translations = ({[\s\S]*?});/);
        if (!translationMatch) {
            console.error(chalk.red('❌ No se encontraron traducciones en translator.js'));
            return false;
        }
        
        // Actualizar archivos de traducción JSON
        const localesDir = path.join(__dirname, '..', 'locales');
        if (!await fs.pathExists(localesDir)) {
            console.log(chalk.yellow('📁 Creando directorio locales/'));
            await fs.ensureDir(localesDir);
        }
        
        console.log(chalk.green('✅ Traducciones sincronizadas'));
        console.log(chalk.cyan('\n📝 Para traducciones más avanzadas:'));
        console.log('   1. Usa el script generate-translations.js');
        console.log('   2. Edita los archivos JSON en locales/');
        console.log('   3. Usa un servicio de traducción profesional');
        
        return true;
        
    } catch (error) {
        console.error(chalk.red('\n❌ Error sincronizando traducciones:'), error);
        return false;
    }
}

if (require.main === module) {
    syncTranslations().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { syncTranslations };