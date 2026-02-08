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
        
        // 2. Archivos de traducción base
        const translations = {
            'es.json': {
                app: {
                    name: "InterMappler",
                    version: "3.14.0",
                    description: "Sistema de mapeo y traducción inteligente"
                },
                common: {
                    loading: "Cargando...",
                    success: "¡Éxito!",
                    error: "Error",
                    save: "Guardar",
                    cancel: "Cancelar",
                    delete: "Eliminar",
                    edit: "Editar",
                    search: "Buscar",
                    filter: "Filtrar"
                },
                navigation: {
                    home: "Inicio",
                    dashboard: "Panel",
                    maps: "Mapas",
                    translations: "Traducciones",
                    settings: "Configuración",
                    profile: "Perfil",
                    logout: "Cerrar sesión"
                },
                auth: {
                    login: "Iniciar sesión",
                    register: "Registrarse",
                    username: "Usuario",
                    password: "Contraseña",
                    email: "Correo electrónico",
                    forgot_password: "¿Olvidaste tu contraseña?",
                    remember_me: "Recordarme"
                },
                errors: {
                    not_found: "No encontrado",
                    unauthorized: "No autorizado",
                    server_error: "Error del servidor",
                    network_error: "Error de red",
                    validation_error: "Error de validación"
                }
            },
            'en.json': {
                app: {
                    name: "InterMappler",
                    version: "3.14.0",
                    description: "Intelligent mapping and translation system"
                },
                common: {
                    loading: "Loading...",
                    success: "Success!",
                    error: "Error",
                    save: "Save",
                    cancel: "Cancel",
                    delete: "Delete",
                    edit: "Edit",
                    search: "Search",
                    filter: "Filter"
                },
                navigation: {
                    home: "Home",
                    dashboard: "Dashboard",
                    maps: "Maps",
                    translations: "Translations",
                    settings: "Settings",
                    profile: "Profile",
                    logout: "Logout"
                },
                auth: {
                    login: "Login",
                    register: "Register",
                    username: "Username",
                    password: "Password",
                    email: "Email",
                    forgot_password: "Forgot password?",
                    remember_me: "Remember me"
                },
                errors: {
                    not_found: "Not found",
                    unauthorized: "Unauthorized",
                    server_error: "Server error",
                    network_error: "Network error",
                    validation_error: "Validation error"
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

        // 4. Crear archivo de configuración de idiomas
        const languagesConfig = {
            supported: ['es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'he', 'fa'],
            default: 'es',
            fallback: 'en',
            auto_detect: true,
            load_path: './locales/',
            file_format: 'json',
            names: {
                es: 'Español',
                en: 'English',
                fr: 'Français',
                de: 'Deutsch',
                it: 'Italiano',
                pt: 'Português',
                ru: 'Русский',
                zh: '中文',
                ja: '日本語',
                ko: '한국어',
                ar: 'العربية',
                hi: 'हिन्दी',
                he: 'עברית',
                fa: 'فارسی'
            }
        };

        const configPath = path.join(localesDir, 'config.json');
        await fs.writeJson(configPath, languagesConfig, { spaces: 2 });
        console.log(chalk.green('✅ config.json creado'));

        // 5. Crear archivo de índice
        const indexContent = `// Índice de traducciones - Generado automáticamente
const fs = require('fs-extra');
const path = require('path');

class TranslationManager {
    constructor() {
        this.translations = {};
        this.config = {};
        this.currentLanguage = 'es';
        this.initialized = false;
    }

    async init() {
        try {
            const configPath = path.join(__dirname, 'config.json');
            this.config = await fs.readJson(configPath);
            
            for (const lang of this.config.supported) {
                const langPath = path.join(__dirname, \`\${lang}.json\`);
                if (await fs.pathExists(langPath)) {
                    this.translations[lang] = await fs.readJson(langPath);
                }
            }
            
            this.initialized = true;
            console.log(\`🌍 TranslationManager inicializado con \${Object.keys(this.translations).length} idiomas\`);
        } catch (error) {
            console.error('❌ Error inicializando TranslationManager:', error);
            throw error;
        }
    }

    setLanguage(lang) {
        if (this.config.supported.includes(lang)) {
            this.currentLanguage = lang;
            return true;
        }
        return false;
    }

    get(key, lang = null) {
        const targetLang = lang || this.currentLanguage;
        
        if (!this.translations[targetLang]) {
            // Fallback al idioma por defecto
            return this.get(key, this.config.fallback);
        }

        const keys = key.split('.');
        let value = this.translations[targetLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback al inglés si no se encuentra
                if (targetLang !== 'en') {
                    return this.get(key, 'en');
                }
                return \`[\${key}]\`;
            }
        }
        
        return value;
    }

    format(key, params = {}, lang = null) {
        let text = this.get(key, lang);
        
        Object.entries(params).forEach(([param, value]) => {
            text = text.replace(new RegExp(\`{\${param}}\`, 'g'), value);
        });
        
        return text;
    }

    getAvailableLanguages() {
        return this.config.supported.map(lang => ({
            code: lang,
            name: this.config.names[lang] || lang,
            isCurrent: lang === this.currentLanguage
        }));
    }
}

module.exports = new TranslationManager();`;

        const indexPath = path.join(localesDir, 'index.js');
        await fs.writeFile(indexPath, indexContent);
        console.log(chalk.green('✅ index.js creado'));

        // 6. Mensaje final
        console.log(chalk.bold.green('\n🎉 ¡Traducciones generadas exitosamente!'));
        console.log(chalk.cyan('\n📊 Resumen:'));
        console.log(`   • Idiomas creados: ${Object.keys(translations).length}`);
        console.log(`   • Idiomas soportados: ${languagesConfig.supported.length}`);
        console.log(`   • Idioma por defecto: ${languagesConfig.default}`);
        console.log(`   • Directorio: ${localesDir}`);
        
        console.log(chalk.cyan('\n📁 Archivos creados:'));
        Object.keys(translations).forEach(file => {
            console.log(`   • ${file}`);
        });
        console.log('   • config.json');
        console.log('   • index.js');

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