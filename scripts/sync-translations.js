#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('🔄 Sincronizando traducciones...\n'));

async function syncTranslations() {
    try {
        const localesDir = path.join(__dirname, '..', 'locales');
        await fs.ensureDir(localesDir);
        
        // Verificar si ya hay archivos de traducción
        const files = await fs.readdir(localesDir);
        const translationFiles = files.filter(f => f.endsWith('.json') && f !== 'config.json');
        
        if (translationFiles.length > 0) {
            console.log(chalk.green(`✅ ${translationFiles.length} archivos de traducción encontrados`));
            
            // Crear índice actualizado
            await createTranslationIndex();
            
        } else {
            console.log(chalk.yellow('ℹ️  No se encontraron archivos de traducción'));
            console.log(chalk.cyan('💡 Ejecuta: npm run translate:extract primero'));
        }
        
        console.log(chalk.green('\n✅ Sincronización completada'));
        return true;
        
    } catch (error) {
        console.error(chalk.red('\n❌ Error sincronizando traducciones:'), error);
        return false;
    }
}

async function createTranslationIndex() {
    const localesDir = path.join(__dirname, '..', 'locales');
    const indexPath = path.join(localesDir, 'index.js');
    
    const indexContent = `// Índice de traducciones - Generado automáticamente
module.exports = {
    availableLanguages: ['es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'he', 'fa'],
    defaultLanguage: 'es',
    fallbackLanguage: 'en',
    
    getTranslations: async function(lang = 'es') {
        try {
            const path = require('path');
            const fs = require('fs').promises;
            
            const filePath = path.join(__dirname, \`\${lang}.json\`);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // Fallback a español
            try {
                const esPath = path.join(__dirname, 'es.json');
                const data = await fs.readFile(esPath, 'utf8');
                return JSON.parse(data);
            } catch (fallbackError) {
                return {};
            }
        }
    }
};`;
    
    await fs.writeFile(indexPath, indexContent);
    console.log(chalk.green('✅ index.js actualizado'));
}

if (require.main === module) {
    syncTranslations().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { syncTranslations };