// Gestión de idiomas
class LanguageManager {
    constructor() {
        this.languageSelect = document.getElementById('languageSelect');
        this.currentLanguage = 'es';
        this.translations = {
            es: {
                title: "Iniciar Sesión",
                subtitle: "Accede a la plataforma de mapeo inteligente",
                email: "Correo Electrónico",
                password: "Contraseña",
                remember: "Recordar sesión",
                forgot: "¿Olvidaste tu contraseña?",
                login: "Acceder a Intermappler",
                or: "o continuar con",
                newUser: "¿Nuevo en Intermappler?",
                request: "Solicitar acceso",
                demo: "Prueba con: demo@intermappler.com / demo123",
                protected: "Protegido con encriptación AES-256 y autenticación 2FA",
                tagline: "Mapeo Inteligente Avanzado",
                platform: "Plataforma de Mapeo Inteligente",
                features: {
                    ai: "IA Geoespacial",
                    aiDesc: "Análisis predictivo con inteligencia artificial para mapeo avanzado",
                    layers: "Capas Inteligentes",
                    layersDesc: "Visualización multicapa con datos en tiempo real",
                    satellite: "Satélite en Vivo",
                    satelliteDesc: "Imágenes satelitales actualizadas y análisis detallado",
                    networks: "Redes Complejas",
                    networksDesc: "Mapeo de redes y conexiones con algoritmos optimizados"
                }
            },
            en: {
                title: "Login",
                subtitle: "Access the intelligent mapping platform",
                email: "Email Address",
                password: "Password",
                remember: "Remember me",
                forgot: "Forgot password?",
                login: "Access Intermappler",
                or: "or continue with",
                newUser: "New to Intermappler?",
                request: "Request access",
                demo: "Try: demo@intermappler.com / demo123",
                protected: "Protected with AES-256 encryption and 2FA authentication",
                tagline: "Advanced Intelligent Mapping",
                platform: "Intelligent Mapping Platform",
                features: {
                    ai: "Geospatial AI",
                    aiDesc: "Predictive analysis with artificial intelligence for advanced mapping",
                    layers: "Smart Layers",
                    layersDesc: "Multi-layer visualization with real-time data",
                    satellite: "Live Satellite",
                    satelliteDesc: "Updated satellite images and detailed analysis",
                    networks: "Complex Networks",
                    networksDesc: "Network mapping and connections with optimized algorithms"
                }
            },
            fr: {
                title: "Connexion",
                subtitle: "Accédez à la plateforme de cartographie intelligente",
                email: "Adresse Email",
                password: "Mot de passe",
                remember: "Se souvenir de moi",
                forgot: "Mot de passe oublié?",
                login: "Accéder à Intermappler",
                or: "ou continuer avec",
                newUser: "Nouveau sur Intermappler?",
                request: "Demander l'accès",
                demo: "Essayer: demo@intermappler.com / demo123",
                protected: "Protégé par chiffrement AES-256 et authentification 2FA",
                tagline: "Cartographie Intelligente Avancée",
                platform: "Plateforme de Cartographie Intelligente",
                features: {
                    ai: "IA Géospatiale",
                    aiDesc: "Analyse prédictive avec intelligence artificielle pour la cartographie avancée",
                    layers: "Couches Intelligentes",
                    layersDesc: "Visualisation multicouche avec données en temps réel",
                    satellite: "Satellite en Direct",
                    satelliteDesc: "Images satellitaires mises à jour et analyse détaillée",
                    networks: "Réseaux Complexes",
                    networksDesc: "Cartographie réseau et connexions avec algorithmes optimisés"
                }
            },
            de: {
                title: "Anmelden",
                subtitle: "Zugang zur intelligenten Mapping-Plattform",
                email: "E-Mail-Adresse",
                password: "Passwort",
                remember: "Angemeldet bleiben",
                forgot: "Passwort vergessen?",
                login: "Bei Intermappler anmelden",
                or: "oder fortfahren mit",
                newUser: "Neu bei Intermappler?",
                request: "Zugang anfordern",
                demo: "Testen: demo@intermappler.com / demo123",
                protected: "Geschützt mit AES-256-Verschlüsselung und 2FA-Authentifizierung",
                tagline: "Fortschrittliches Intelligentes Mapping",
                platform: "Intelligente Mapping-Plattform",
                features: {
                    ai: "Geospatiale KI",
                    aiDesc: "Prädiktive Analyse mit künstlicher Intelligenz für fortschrittliches Mapping",
                    layers: "Intelligente Ebenen",
                    layersDesc: "Mehrebenen-Visualisierung mit Echtzeitdaten",
                    satellite: "Live-Satellit",
                    satelliteDesc: "Aktualisierte Satellitenbilder und detaillierte Analyse",
                    networks: "Komplexe Netzwerke",
                    networksDesc: "Netzwerkkartierung und Verbindungen mit optimierten Algorithmen"
                }
            },
            pt: {
                title: "Iniciar Sessão",
                subtitle: "Aceda à plataforma de mapeamento inteligente",
                email: "Endereço de Email",
                password: "Palavra-passe",
                remember: "Lembrar-me",
                forgot: "Esqueceu a palavra-passe?",
                login: "Aceder ao Intermappler",
                or: "ou continuar com",
                newUser: "Novo no Intermappler?",
                request: "Solicitar acesso",
                demo: "Experimentar: demo@intermappler.com / demo123",
                protected: "Protegido com encriptação AES-256 e autenticação 2FA",
                tagline: "Mapeamento Inteligente Avançado",
                platform: "Plataforma de Mapeamento Inteligente",
                features: {
                    ai: "IA Geoespacial",
                    aiDesc: "Análise preditiva com inteligência artificial para mapeamento avançado",
                    layers: "Camadas Inteligentes",
                    layersDesc: "Visualização multicamada com dados em tempo real",
                    satellite: "Satélite ao Vivo",
                    satelliteDesc: "Imagens de satélite atualizadas e análise detalhada",
                    networks: "Redes Complexas",
                    networksDesc: "Mapeamento de redes e conexões com algoritmos otimizados"
                }
            }
        };
        
        this.init();
    }
    
    init() {
        // Cargar idioma guardado
        const savedLanguage = localStorage.getItem('language') || 'es';
        this.languageSelect.value = savedLanguage;
        this.setLanguage(savedLanguage);
        
        // Event listener para cambio de idioma
        this.languageSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            this.setLanguage(lang);
            localStorage.setItem('language', lang);
        });
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        const texts = this.translations[lang];
        
        // Actualizar textos estáticos
        document.querySelector('.form-header h2').textContent = texts.title;
        document.querySelector('.form-header p').textContent = texts.subtitle;
        document.querySelector('label[for="email"] span').textContent = texts.email;
        document.querySelector('label[for="password"] span').textContent = texts.password;
        document.querySelector('.checkbox-container').textContent = texts.remember;
        document.querySelector('.forgot-link').textContent = texts.forgot;
        document.querySelector('.login-btn span').textContent = texts.login;
        document.querySelector('.divider span').textContent = texts.or;
        document.querySelector('.form-footer p').textContent = texts.newUser;
        document.querySelector('.register-link').textContent = texts.request;
        document.querySelector('.demo-info span').textContent = texts.demo;
        document.querySelector('.security-notice span').textContent = texts.protected;
        document.querySelector('.tagline').textContent = texts.tagline;
        document.querySelector('.subtitle').textContent = texts.platform;
        
        // Actualizar características
        document.querySelectorAll('.feature-card')[0].querySelector('h3').textContent = texts.features.ai;
        document.querySelectorAll('.feature-card')[0].querySelector('p').textContent = texts.features.aiDesc;
        document.querySelectorAll('.feature-card')[1].querySelector('h3').textContent = texts.features.layers;
        document.querySelectorAll('.feature-card')[1].querySelector('p').textContent = texts.features.layersDesc;
        document.querySelectorAll('.feature-card')[2].querySelector('h3').textContent = texts.features.satellite;
        document.querySelectorAll('.feature-card')[2].querySelector('p').textContent = texts.features.satelliteDesc;
        document.querySelectorAll('.feature-card')[3].querySelector('h3').textContent = texts.features.networks;
        document.querySelectorAll('.feature-card')[3].querySelector('p').textContent = texts.features.networksDesc;
        
        // Actualizar atributos de accesibilidad
        document.documentElement.lang = lang;
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    translate(key, lang = this.currentLanguage) {
        const keys = key.split('.');
        let value = this.translations[lang];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Retornar la clave si no se encuentra la traducción
            }
        }
        return value;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
});