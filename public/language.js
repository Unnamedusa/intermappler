// Gestión de idiomas para Intermappler
class LanguageManager {
    constructor() {
        this.languageSelect = document.getElementById('languageSelect');
        this.currentLanguage = 'es';
        this.translations = this.getTranslations();
        
        this.init();
    }
    
    getTranslations() {
        return {
            es: {
                // Header
                tagline: "Mapeo Inteligente Avanzado",
                themeDark: "Modo Oscuro",
                themeLight: "Modo Claro",
                
                // Platform info
                platformTitle: "Plataforma de Mapeo Inteligente",
                featureAI: "IA Geoespacial",
                featureAIDesc: "Análisis predictivo con inteligencia artificial para mapeo avanzado",
                featureLayers: "Capas Inteligentes",
                featureLayersDesc: "Visualización multicapa con datos en tiempo real",
                featureSatellite: "Satélite en Vivo",
                featureSatelliteDesc: "Imágenes satelitales actualizadas y análisis detallado",
                featureNetworks: "Redes Complejas",
                featureNetworksDesc: "Mapeo de redes y conexiones con algoritmos optimizados",
                statMapped: "Puntos Mapeados",
                statLayers: "Capas Activas",
                statAccuracy: "Precisión IA",
                
                // Login form
                loginTitle: "Iniciar Sesión",
                loginSubtitle: "Accede a la plataforma de mapeo inteligente",
                emailLabel: "Correo Electrónico",
                emailPlaceholder: "usuario@intermappler.com",
                passwordLabel: "Contraseña",
                passwordPlaceholder: "••••••••",
                rememberMe: "Recordar sesión",
                forgotPassword: "¿Olvidaste tu contraseña?",
                loginButton: "Acceder a Intermappler",
                orContinue: "o continuar con",
                newUser: "¿Nuevo en Intermappler?",
                requestAccess: "Solicitar acceso",
                demoCredentials: "Prueba con: demo@intermappler.com / demo123",
                securityNotice: "Protegido con encriptación AES-256 y autenticación 2FA",
                
                // Footer
                terms: "Términos de Servicio",
                privacy: "Política de Privacidad",
                docs: "Documentación",
                api: "API",
                support: "Soporte",
                copyright: "© 2024 Intermappler Technologies. Plataforma de Mapeo Inteligente v3.2.1",
                systemStatus: "Sistema Operativo"
            },
            en: {
                tagline: "Advanced Intelligent Mapping",
                themeDark: "Dark Mode",
                themeLight: "Light Mode",
                platformTitle: "Intelligent Mapping Platform",
                featureAI: "Geospatial AI",
                featureAIDesc: "Predictive analysis with artificial intelligence for advanced mapping",
                featureLayers: "Smart Layers",
                featureLayersDesc: "Multi-layer visualization with real-time data",
                featureSatellite: "Live Satellite",
                featureSatelliteDesc: "Updated satellite images and detailed analysis",
                featureNetworks: "Complex Networks",
                featureNetworksDesc: "Network mapping and connections with optimized algorithms",
                statMapped: "Points Mapped",
                statLayers: "Active Layers",
                statAccuracy: "AI Accuracy",
                loginTitle: "Login",
                loginSubtitle: "Access the intelligent mapping platform",
                emailLabel: "Email Address",
                emailPlaceholder: "user@intermappler.com",
                passwordLabel: "Password",
                passwordPlaceholder: "••••••••",
                rememberMe: "Remember me",
                forgotPassword: "Forgot password?",
                loginButton: "Access Intermappler",
                orContinue: "or continue with",
                newUser: "New to Intermappler?",
                requestAccess: "Request access",
                demoCredentials: "Try: demo@intermappler.com / demo123",
                securityNotice: "Protected with AES-256 encryption and 2FA authentication",
                terms: "Terms of Service",
                privacy: "Privacy Policy",
                docs: "Documentation",
                api: "API",
                support: "Support",
                copyright: "© 2024 Intermappler Technologies. Intelligent Mapping Platform v3.2.1",
                systemStatus: "System Operational"
            },
            fr: {
                tagline: "Cartographie Intelligente Avancée",
                themeDark: "Mode Sombre",
                themeLight: "Mode Clair",
                platformTitle: "Plateforme de Cartographie Intelligente",
                featureAI: "IA Géospatiale",
                featureAIDesc: "Analyse prédictive avec intelligence artificielle pour cartographie avancée",
                featureLayers: "Couches Intelligentes",
                featureLayersDesc: "Visualisation multicouche avec données en temps réel",
                featureSatellite: "Satellite en Direct",
                featureSatelliteDesc: "Images satellitaires mises à jour et analyse détaillée",
                featureNetworks: "Réseaux Complexes",
                featureNetworksDesc: "Cartographie réseau et connexions avec algorithmes optimisés",
                statMapped: "Points Cartographiés",
                statLayers: "Couches Actives",
                statAccuracy: "Précision IA",
                loginTitle: "Connexion",
                loginSubtitle: "Accédez à la plateforme de cartographie intelligente",
                emailLabel: "Adresse Email",
                emailPlaceholder: "utilisateur@intermappler.com",
                passwordLabel: "Mot de Passe",
                passwordPlaceholder: "••••••••",
                rememberMe: "Se souvenir de moi",
                forgotPassword: "Mot de passe oublié?",
                loginButton: "Accéder à Intermappler",
                orContinue: "ou continuer avec",
                newUser: "Nouveau sur Intermappler?",
                requestAccess: "Demander l'accès",
                demoCredentials: "Essayer: demo@intermappler.com / demo123",
                securityNotice: "Protégé par chiffrement AES-256 et authentification 2FA",
                terms: "Conditions d'Utilisation",
                privacy: "Politique de Confidentialité",
                docs: "Documentation",
                api: "API",
                support: "Support",
                copyright: "© 2024 Intermappler Technologies. Plateforme de Cartographie Intelligente v3.2.1",
                systemStatus: "Système Opérationnel"
            },
            de: {
                tagline: "Fortschrittliches Intelligentes Mapping",
                themeDark: "Dunkler Modus",
                themeLight: "Heller Modus",
                platformTitle: "Intelligente Mapping-Plattform",
                featureAI: "Geospatiale KI",
                featureAIDesc: "Prädiktive Analyse mit künstlicher Intelligenz für fortschrittliches Mapping",
                featureLayers: "Intelligente Ebenen",
                featureLayersDesc: "Mehrebenen-Visualisierung mit Echtzeitdaten",
                featureSatellite: "Live-Satellit",
                featureSatelliteDesc: "Aktualisierte Satellitenbilder und detaillierte Analyse",
                featureNetworks: "Komplexe Netzwerke",
                featureNetworksDesc: "Netzwerkkartierung und Verbindungen mit optimierten Algorithmen",
                statMapped: "Kartierte Punkte",
                statLayers: "Aktive Ebenen",
                statAccuracy: "KI-Genauigkeit",
                loginTitle: "Anmelden",
                loginSubtitle: "Zugang zur intelligenten Mapping-Plattform",
                emailLabel: "E-Mail-Adresse",
                emailPlaceholder: "benutzer@intermappler.com",
                passwordLabel: "Passwort",
                passwordPlaceholder: "••••••••",
                rememberMe: "Angemeldet bleiben",
                forgotPassword: "Passwort vergessen?",
                loginButton: "Bei Intermappler anmelden",
                orContinue: "oder fortfahren mit",
                newUser: "Neu bei Intermappler?",
                requestAccess: "Zugang anfordern",
                demoCredentials: "Testen: demo@intermappler.com / demo123",
                securityNotice: "Geschützt mit AES-256-Verschlüsselung und 2FA-Authentifizierung",
                terms: "Nutzungsbedingungen",
                privacy: "Datenschutzerklärung",
                docs: "Dokumentation",
                api: "API",
                support: "Support",
                copyright: "© 2024 Intermappler Technologies. Intelligente Mapping-Plattform v3.2.1",
                systemStatus: "System Betriebsbereit"
            },
            pt: {
                tagline: "Mapeamento Inteligente Avançado",
                themeDark: "Modo Escuro",
                themeLight: "Modo Claro",
                platformTitle: "Plataforma de Mapeamento Inteligente",
                featureAI: "IA Geoespacial",
                featureAIDesc: "Análise preditiva com inteligência artificial para mapeamento avançado",
                featureLayers: "Camadas Inteligentes",
                featureLayersDesc: "Visualização multicamada com dados em tempo real",
                featureSatellite: "Satélite ao Vivo",
                featureSatelliteDesc: "Imagens de satélite atualizadas e análise detalhada",
                featureNetworks: "Redes Complexas",
                featureNetworksDesc: "Mapeamento de redes e conexões com algoritmos otimizados",
                statMapped: "Pontos Mapeados",
                statLayers: "Camadas Ativas",
                statAccuracy: "Precisão IA",
                loginTitle: "Iniciar Sessão",
                loginSubtitle: "Aceda à plataforma de mapeamento inteligente",
                emailLabel: "Endereço de Email",
                emailPlaceholder: "utilizador@intermappler.com",
                passwordLabel: "Palavra-passe",
                passwordPlaceholder: "••••••••",
                rememberMe: "Lembrar-me",
                forgotPassword: "Esqueceu a palavra-passe?",
                loginButton: "Aceder ao Intermappler",
                orContinue: "ou continuar com",
                newUser: "Novo no Intermappler?",
                requestAccess: "Solicitar acesso",
                demoCredentials: "Experimentar: demo@intermappler.com / demo123",
                securityNotice: "Protegido com encriptação AES-256 e autenticação 2FA",
                terms: "Termos de Serviço",
                privacy: "Política de Privacidade",
                docs: "Documentação",
                api: "API",
                support: "Suporte",
                copyright: "© 2024 Intermappler Technologies. Plataforma de Mapeamento Inteligente v3.2.1",
                systemStatus: "Sistema Operacional"
            }
        };
    }
    
    init() {
        // Cargar idioma guardado
        const savedLanguage = localStorage.getItem('intermappler-language') || 'es';
        this.languageSelect.value = savedLanguage;
        this.setLanguage(savedLanguage);
        
        // Event listener para cambio de idioma
        this.languageSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            this.setLanguage(lang);
            localStorage.setItem('intermappler-language', lang);
            
            // Notificar cambio de idioma
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));
        });
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        const texts = this.translations[lang];
        
        if (!texts) return;
        
        // Actualizar todos los textos
        this.updateTexts(texts);
        
        // Actualizar atributos de accesibilidad
        document.documentElement.lang = lang;
    }
    
    updateTexts(texts) {
        // Header
        document.querySelector('.tagline').textContent = texts.tagline;
        document.querySelector('.theme-text').textContent = 
            document.documentElement.getAttribute('data-theme') === 'light' 
                ? texts.themeDark 
                : texts.themeLight;
        
        // Platform info
        document.querySelector('.subtitle').textContent = texts.platformTitle;
        
        // Features
        const features = document.querySelectorAll('.feature-card');
        if (features.length >= 4) {
            features[0].querySelector('h3').textContent = texts.featureAI;
            features[0].querySelector('p').textContent = texts.featureAIDesc;
            features[1].querySelector('h3').textContent = texts.featureLayers;
            features[1].querySelector('p').textContent = texts.featureLayersDesc;
            features[2].querySelector('h3').textContent = texts.featureSatellite;
            features[2].querySelector('p').textContent = texts.featureSatelliteDesc;
            features[3].querySelector('h3').textContent = texts.featureNetworks;
            features[3].querySelector('p').textContent = texts.featureNetworksDesc;
        }
        
        // Stats
        const stats = document.querySelectorAll('.stat-label');
        if (stats.length >= 3) {
            stats[0].textContent = texts.statMapped;
            stats[1].textContent = texts.statLayers;
            stats[2].textContent = texts.statAccuracy;
        }
        
        // Login form
        document.querySelector('.form-header h2').textContent = texts.loginTitle;
        document.querySelector('.form-header p').textContent = texts.loginSubtitle;
        
        const emailLabel = document.querySelector('label[for="email"] span');
        if (emailLabel) emailLabel.textContent = texts.emailLabel;
        
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.placeholder = texts.emailPlaceholder;
        
        const passwordLabel = document.querySelector('label[for="password"] span');
        if (passwordLabel) passwordLabel.textContent = texts.passwordLabel;
        
        const passwordInput = document.getElementById('password');
        if (passwordInput) passwordInput.placeholder = texts.passwordPlaceholder;
        
        const rememberMe = document.querySelector('.checkbox-container');
        if (rememberMe) {
            rememberMe.childNodes.forEach(node => {
                if (node.nodeType === 3 && node.textContent.trim() === 'Recordar sesión') {
                    node.textContent = texts.rememberMe;
                }
            });
        }
        
        const forgotLink = document.querySelector('.forgot-link');
        if (forgotLink) forgotLink.textContent = texts.forgotPassword;
        
        const loginBtn = document.querySelector('.login-btn span');
        if (loginBtn) loginBtn.textContent = texts.loginButton;
        
        const divider = document.querySelector('.divider span');
        if (divider) divider.textContent = texts.orContinue;
        
        const newUser = document.querySelector('.form-footer p');
        if (newUser && newUser.textContent.includes('¿Nuevo en Intermappler?')) {
            newUser.innerHTML = newUser.innerHTML.replace('¿Nuevo en Intermappler?', texts.newUser);
        }
        
        const registerLink = document.querySelector('.register-link');
        if (registerLink) registerLink.textContent = texts.requestAccess;
        
        const demoInfo = document.querySelector('.demo-info span');
        if (demoInfo) demoInfo.textContent = texts.demoCredentials;
        
        const securityNotice = document.querySelector('.security-notice span');
        if (securityNotice) securityNotice.textContent = texts.securityNotice;
        
        // Footer
        const footerLinks = document.querySelectorAll('.footer-links a');
        if (footerLinks.length >= 5) {
            footerLinks[0].textContent = texts.terms;
            footerLinks[1].textContent = texts.privacy;
            footerLinks[2].textContent = texts.docs;
            footerLinks[3].textContent = texts.api;
            footerLinks[4].textContent = texts.support;
        }
        
        const copyright = document.querySelector('.copyright');
        if (copyright) copyright.textContent = texts.copyright;
        
        const systemStatus = document.querySelector('.status-indicator span:last-child');
        if (systemStatus) systemStatus.textContent = texts.systemStatus;
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    translate(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key;
            }
        }
        return value;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
    
    // Actualizar texto del tema cuando cambia el idioma
    document.addEventListener('languageChanged', () => {
        const themeManager = window.themeManager;
        if (themeManager) {
            themeManager.updateButtonText();
        }
    });
});