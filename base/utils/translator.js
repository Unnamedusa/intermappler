// Sistema de Traducción para InterMappler - Versión Optimizada

const fs = require('fs');
const path = require('path');

class TranslationSystem {
    constructor() {
        this.defaultLanguage = 'es';
        this.autoDetect = true;
        this.translationCache = new Map();
        this.languages = this.loadLanguages();
        this.translations = this.loadTranslations();
        this.initializeCache();
    }

    loadLanguages() {
        return {
            es: { name: 'Español', native: 'Español', region: 'ES', rtl: false },
            en: { name: 'Inglés', native: 'English', region: 'US', rtl: false },
            fr: { name: 'Francés', native: 'Français', region: 'FR', rtl: false },
            de: { name: 'Alemán', native: 'Deutsch', region: 'DE', rtl: false },
            it: { name: 'Italiano', native: 'Italiano', region: 'IT', rtl: false },
            pt: { name: 'Portugués', native: 'Português', region: 'PT', rtl: false },
            ru: { name: 'Ruso', native: 'Русский', region: 'RU', rtl: false },
            zh: { name: 'Chino', native: '中文', region: 'CN', rtl: false },
            ja: { name: 'Japonés', native: '日本語', region: 'JP', rtl: false },
            ko: { name: 'Coreano', native: '한국어', region: 'KR', rtl: false },
            ar: { name: 'Árabe', native: 'العربية', region: 'SA', rtl: true },
            hi: { name: 'Hindi', native: 'हिन्दी', region: 'IN', rtl: false },
            he: { name: 'Hebreo', native: 'עברית', region: 'IL', rtl: true },
            fa: { name: 'Persa', native: 'فارسی', region: 'IR', rtl: true }
        };
    }

    loadTranslations() {
        // Cargar desde archivo si existe, sino usar las predeterminadas
        const filePath = path.join(__dirname, 'translations.json');
        
        if (fs.existsSync(filePath)) {
            try {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (error) {
                console.error('Error cargando traducciones:', error);
            }
        }
        
        // Traducciones básicas predeterminadas
        return {
            // Términos del sistema
            'InterMappler': { es: 'InterMappler', en: 'InterMappler', fr: 'InterMappler' },
            'Sistema de Mapeo Inteligente Global': { 
                es: 'Sistema de Mapeo Inteligente Global',
                en: 'Global Intelligent Mapping System',
                fr: 'Système de Cartographie Intelligente Global'
            },
            
            // Autenticación
            'Iniciar Sesión': { es: 'Iniciar Sesión', en: 'Login', fr: 'Connexion' },
            'Usuario': { es: 'Usuario', en: 'Username', fr: 'Utilisateur' },
            'Contraseña': { es: 'Contraseña', en: 'Password', fr: 'Mot de passe' },
            
            // Roles
            'Administrador': { es: 'Administrador', en: 'Administrator', fr: 'Administrateur' },
            'Especialista': { es: 'Especialista', en: 'Specialist', fr: 'Spécialiste' },
            
            // Mensajes de error
            'Usuario no encontrado': { es: 'Usuario no encontrado', en: 'User not found', fr: 'Utilisateur non trouvé' },
            'Contraseña incorrecta': { es: 'Contraseña incorrecta', en: 'Incorrect password', fr: 'Mot de passe incorrect' }
        };
    }

    initializeCache() {
        for (const [key, translations] of Object.entries(this.translations)) {
            for (const [lang, text] of Object.entries(translations)) {
                this.translationCache.set(`${key}_${lang}`, text);
            }
        }
    }

    translate(text, targetLang = 'es', sourceLang = null) {
        if (!text || typeof text !== 'string') return text;
        
        const target = this.validateLanguage(targetLang);
        if (sourceLang && sourceLang === target) return text;
        
        const cacheKey = `${text}_${target}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }
        
        const translation = this.translations[text];
        if (translation && translation[target]) {
            this.translationCache.set(cacheKey, translation[target]);
            return translation[target];
        }
        
        const autoTranslated = this.autoTranslate(text, target);
        this.translationCache.set(cacheKey, autoTranslated);
        return autoTranslated;
    }

    translateObject(obj, targetLang = 'es') {
        if (!obj || typeof obj !== 'object') return obj;
        
        const target = this.validateLanguage(targetLang);
        const translated = Array.isArray(obj) ? [] : {};
        
        for (const [key, value] of Object.entries(obj)) {
            if (this.shouldSkipKey(key)) {
                translated[key] = value;
                continue;
            }
            
            if (typeof value === 'string') {
                translated[key] = this.translate(value, target);
            } else if (value && typeof value === 'object') {
                translated[key] = this.translateObject(value, target);
            } else {
                translated[key] = value;
            }
        }
        
        if (!Array.isArray(translated)) {
            translated._translation = {
                target_language: target,
                timestamp: new Date().toISOString()
            };
        }
        
        return translated;
    }

    autoTranslate(text, targetLang) {
        // Diccionario básico para demostración
        const dict = {
            'hello': { es: 'hola', fr: 'bonjour', de: 'hallo' },
            'world': { es: 'mundo', fr: 'monde', de: 'welt' },
            'map': { es: 'mapa', fr: 'carte', de: 'karte' },
            'system': { es: 'sistema', fr: 'système', de: 'system' },
            'data': { es: 'datos', fr: 'données', de: 'daten' },
            'secure': { es: 'seguro', fr: 'sécurisé', de: 'sicher' },
            'access': { es: 'acceso', fr: 'accès', de: 'zugriff' }
        };
        
        const words = text.toLowerCase().split(' ');
        const translated = words.map(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            return dict[cleanWord] && dict[cleanWord][targetLang] 
                ? dict[cleanWord][targetLang] 
                : word;
        });
        
        return translated.join(' ');
    }

    detectLanguage(text) {
        if (!text) return { language: this.defaultLanguage, confidence: 0 };
        
        const patterns = {
            es: /[áéíóúñ]/gi,
            fr: /[àâçéèêëîïôûùüÿ]/gi,
            de: /[äöüß]/gi,
            ru: /[а-я]/gi,
            zh: /[\u4e00-\u9fff]/g,
            ja: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g,
            ko: /[\uac00-\ud7af]/g,
            ar: /[\u0600-\u06ff]/g
        };
        
        let maxScore = 0;
        let detected = this.defaultLanguage;
        
        for (const [lang, pattern] of Object.entries(patterns)) {
            const matches = (text.match(pattern) || []).length;
            if (matches > maxScore) {
                maxScore = matches;
                detected = lang;
            }
        }
        
        if (maxScore === 0) {
            const englishWords = ['the', 'and', 'you', 'that', 'have'];
            const englishCount = englishWords.filter(w => text.toLowerCase().includes(w)).length;
            detected = englishCount > 1 ? 'en' : this.defaultLanguage;
        }
        
        return {
            language: detected,
            confidence: Math.min((maxScore / text.length) * 100, 100) || 10
        };
    }

    validateLanguage(lang) {
        if (!lang) return this.defaultLanguage;
        const normalized = lang.toLowerCase().split('-')[0];
        return this.languages[normalized] ? normalized : this.defaultLanguage;
    }

    shouldSkipKey(key) {
        const skip = ['id', '_id', 'email', 'password', 'token', 'url', 'api', 'ip', 'coord'];
        return skip.includes(key) || 
               key.startsWith('_') || 
               /^\d+$/.test(key) ||
               key.includes('_id') ||
               key.includes('url');
    }

    addTranslation(key, translations) {
        this.translations[key] = { ...this.translations[key], ...translations };
        for (const [lang, text] of Object.entries(translations)) {
            this.translationCache.set(`${key}_${lang}`, text);
        }
        return true;
    }

    saveTranslations() {
        try {
            const filePath = path.join(__dirname, 'translations.json');
            fs.writeFileSync(filePath, JSON.stringify(this.translations, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error guardando traducciones:', error);
            return false;
        }
    }

    getStats() {
        return {
            total_keys: Object.keys(this.translations).length,
            supported_languages: Object.keys(this.languages).length,
            cache_size: this.translationCache.size,
            default_language: this.defaultLanguage
        };
    }
}

// Exportar instancia única
module.exports = new TranslationSystem();