// Sistema de Traducción para InterMappler — Unificado y estable (CommonJS)

const fs = require('fs');
const path = require('path');

/* =========================
   CONFIGURACIÓN DE IDIOMAS
   ========================= */
const LANGUAGES = {
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

/* =========================
   TRADUCCIONES BASE
   ========================= */
const DEFAULT_TRANSLATIONS = {
  'InterMappler': { es: 'InterMappler', en: 'InterMappler', fr: 'InterMappler' },
  'Sistema de Mapeo Inteligente Global': {
    es: 'Sistema de Mapeo Inteligente Global',
    en: 'Global Intelligent Mapping System',
    fr: 'Système de Cartographie Intelligente Global'
  },
  'Iniciar Sesión': { es: 'Iniciar Sesión', en: 'Login', fr: 'Connexion' },
  'Usuario': { es: 'Usuario', en: 'Username', fr: 'Utilisateur' },
  'Contraseña': { es: 'Contraseña', en: 'Password', fr: 'Mot de passe' },
  'Administrador': { es: 'Administrador', en: 'Administrator', fr: 'Administrateur' },
  'Especialista': { es: 'Especialista', en: 'Specialist', fr: 'Spécialiste' },
  'Usuario no encontrado': { es: 'Usuario no encontrado', en: 'User not found', fr: 'Utilisateur non trouvé' },
  'Contraseña incorrecta': { es: 'Contraseña incorrecta', en: 'Incorrect password', fr: 'Mot de passe incorrect' }
};

/* =========================
   AUTO-TRADUCCIÓN BÁSICA
   ========================= */
function autoTranslate(text, targetLang) {
  const dict = {
    hello: { es: 'hola', fr: 'bonjour', de: 'hallo' },
    world: { es: 'mundo', fr: 'monde', de: 'welt' },
    map: { es: 'mapa', fr: 'carte', de: 'karte' },
    system: { es: 'sistema', fr: 'système', de: 'system' },
    data: { es: 'datos', fr: 'données', de: 'daten' },
    secure: { es: 'seguro', fr: 'sécurisé', de: 'sicher' },
    access: { es: 'acceso', fr: 'accès', de: 'zugriff' }
  };

  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      const clean = word.replace(/[^\w]/g, '');
      return dict[clean]?.[targetLang] || word;
    })
    .join(' ');
}

/* =========================
   DETECCIÓN DE IDIOMA
   ========================= */
function detectLanguage(text, defaultLanguage) {
  if (!text) return { language: defaultLanguage, confidence: 0 };

  const patterns = {
    es: /[áéíóúñ]/gi,
    fr: /[àâçéèêëîïôûùüÿ]/gi,
    de: /[äöüß]/gi,
    ru: /[а-я]/gi,
    zh: /[\u4e00-\u9fff]/g,
    ja: /[\u3040-\u30ff]/g,
    ko: /[\uac00-\ud7af]/g,
    ar: /[\u0600-\u06ff]/g
  };

  let max = 0;
  let detected = defaultLanguage;

  for (const [lang, regex] of Object.entries(patterns)) {
    const count = (text.match(regex) || []).length;
    if (count > max) {
      max = count;
      detected = lang;
    }
  }

  return {
    language: detected,
    confidence: Math.min((max / text.length) * 100, 100) || 10
  };
}

/* =========================
   CLASE PRINCIPAL
   ========================= */
class TranslationSystem {
  constructor() {
    this.defaultLanguage = 'es';
    this.languages = LANGUAGES;
    this.translations = this.loadTranslations();
    this.cache = new Map();
    this.initializeCache();
  }

  loadTranslations() {
    const file = path.join(__dirname, 'translations.json');
    if (fs.existsSync(file)) {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        return DEFAULT_TRANSLATIONS;
      }
    }
    return DEFAULT_TRANSLATIONS;
  }

  initializeCache() {
    for (const [key, langs] of Object.entries(this.translations)) {
      for (const [lang, value] of Object.entries(langs)) {
        this.cache.set(`${key}_${lang}`, value);
      }
    }
  }

  validateLanguage(lang) {
    if (!lang) return this.defaultLanguage;
    const norm = lang.toLowerCase().split('-')[0];
    return this.languages[norm] ? norm : this.defaultLanguage;
  }

  translate(text, targetLang = 'es') {
    if (!text || typeof text !== 'string') return text;

    const lang = this.validateLanguage(targetLang);
    const cacheKey = `${text}_${lang}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const entry = this.translations[text];
    if (entry && entry[lang]) {
      this.cache.set(cacheKey, entry[lang]);
      return entry[lang];
    }

    const auto = autoTranslate(text, lang);
    this.cache.set(cacheKey, auto);
    return auto;
  }

  translateObject(obj, targetLang = 'es') {
    if (!obj || typeof obj !== 'object') return obj;

    const lang = this.validateLanguage(targetLang);
    const result = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (this.shouldSkipKey(key)) {
        result[key] = value;
      } else if (typeof value === 'string') {
        result[key] = this.translate(value, lang);
      } else if (typeof value === 'object') {
        result[key] = this.translateObject(value, lang);
      } else {
        result[key] = value;
      }
    }

    if (!Array.isArray(result)) {
      result._translation = {
        target_language: lang,
        timestamp: new Date().toISOString()
      };
    }

    return result;
  }

  shouldSkipKey(key) {
    return (
      ['id', '_id', 'email', 'password', 'token', 'url', 'ip'].includes(key) ||
      key.startsWith('_') ||
      /^\d+$/.test(key)
    );
  }

  detect(text) {
    return detectLanguage(text, this.defaultLanguage);
  }

  stats() {
    return {
      keys: Object.keys(this.translations).length,
      languages: Object.keys(this.languages).length,
      cache_size: this.cache.size
    };
  }
}

/* =========================
   EXPORT: SINGLETON
   ========================= */
module.exports = new TranslationSystem();
