#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('🔍 Extrayendo textos para traducción...\n'));

async function extractTranslations() {
    try {
        // Directorios a escanear
        const scanDirs = [
            'web/login',
            'base/auth',
            'base/utils'
        ];
        
        const texts = new Set();
        
        // Escanear archivos
        for (const dir of scanDirs) {
            const fullPath = path.join(__dirname, '..', dir);
            if (await fs.pathExists(fullPath)) {
                await scanDirectory(fullPath, texts);
            }
        }
        
        // Guardar textos extraídos
        const outputPath = path.join(__dirname, '..', 'locales', 'extracted-texts.json');
        const extracted = {
            timestamp: new Date().toISOString(),
            total_texts: texts.size,
            texts: Array.from(texts).sort()
        };
        
        await fs.writeJson(outputPath, extracted, { spaces: 2 });
        
        console.log(chalk.green(`✅ Extraídos ${texts.size} textos para traducción`));
        console.log(chalk.cyan(`📁 Guardado en: ${outputPath}`));
        
        return true;
        
    } catch (error) {
        console.error(chalk.red('\n❌ Error extrayendo traducciones:'), error);
        return false;
    }
}

async function scanDirectory(dirPath, texts) {
    try {
        const items = await fs.readdir(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = await fs.stat(fullPath);
            
            if (stat.isDirectory() && item !== 'node_modules') {
                await scanDirectory(fullPath, texts);
            } else if (stat.isFile() && /\.(js|jsx|ts|tsx|html)$/.test(item)) {
                await scanFile(fullPath, texts);
            }
        }
    } catch (error) {
        console.warn(chalk.yellow(`⚠️  Error escaneando ${dirPath}:`, error.message));
    }
}

async function scanFile(filePath, texts) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Buscar strings para traducir (patrones simples)
        const patterns = [
            /['"]([^'"\n]+?)['"]/g,  // Strings entre comillas
            /translation\s*[:=]\s*['"]([^'"\n]+?)['"]/g, // Asignaciones de traducción
            /translate\(['"]([^'"\n]+?)['"]/g, // Llamadas a translate()
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const text = match[1];
                // Filtrar textos muy cortos o que parezcan código
                if (text.length > 2 && 
                    !text.match(/^[0-9.,]+$/) && 
                    !text.match(/^[A-Z_]+$/)) {
                    texts.add(text);
                }
            }
        }
        
    } catch (error) {
        console.warn(chalk.yellow(`⚠️  Error escaneando ${filePath}:`, error.message));
    }
}

if (require.main === module) {
    extractTranslations().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { extractTranslations };