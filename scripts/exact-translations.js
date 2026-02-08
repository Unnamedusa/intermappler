#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('🔍 Extrayendo textos para traducción...\n'));

async function extractTranslations() {
    try {
        // Directorios a escanear (solo directorios existentes)
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
            } else {
                console.log(chalk.yellow(`⚠️  Directorio no encontrado: ${dir}`));
            }
        }
        
        // Si no se encontraron textos, usar unos básicos
        if (texts.size === 0) {
            console.log(chalk.yellow('ℹ️  No se encontraron textos, usando textos básicos...'));
            const basicTexts = [
                "InterMappler",
                "Sistema de Mapeo Inteligente Global",
                "Iniciar Sesión",
                "Usuario",
                "Contraseña",
                "Acceso Público",
                "Información",
                "Acceso Seguro",
                "Tipo de Usuario",
                "Especialización",
                "Recordar esta sesión (30 min)",
                "¿Problemas para acceder?",
                "Iniciar Sesión Segura",
                "Acceder al Mapa Público"
            ];
            basicTexts.forEach(text => texts.add(text));
        }
        
        // Guardar textos extraídos
        const outputPath = path.join(__dirname, '..', 'locales', 'extracted-texts.json');
        await fs.ensureDir(path.dirname(outputPath));
        
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
            } else if (stat.isFile() && /\.(js|html)$/.test(item)) {
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
        
        // Buscar strings para traducir
        const stringPattern = /['"`]([^'"`\n]{3,}?)['"`]/g;
        let match;
        
        while ((match = stringPattern.exec(content)) !== null) {
            const text = match[1];
            // Filtrar textos
            if (text.length > 2 && 
                !text.match(/^[0-9.,]+$/) && 
                !text.match(/^[A-Z_]+$/) &&
                !text.includes('http') &&
                !text.includes('.js') &&
                !text.includes('.css')) {
                texts.add(text);
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