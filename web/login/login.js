// Sistema de Login Frontend para InterMappler

class LoginSystem {
    constructor() {
        this.apiBase = '/api';
        this.currentPanel = 'login';
        this.isAuthenticating = false;
        this.currentLanguage = 'es';
        this.languageSelector = null;
        this.init();
    }

    init() {
        this.initParticles();
        this.initLanguageSystem();
        this.bindEvents();
        this.initRoleHierarchy();
        this.updatePasswordStrength();
        this.showDemoHint();
    }

    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('login-particles', {
                particles: {
                    number: { value: 60, density: { enable: true, value_area: 800 } },
                    color: { value: "#00f3ff" },
                    shape: { type: "circle" },
                    opacity: { value: 0.3, random: true },
                    size: { value: 2, random: true },
                    line_linked: {
                        enable: true,
                        distance: 120,
                        color: "#00f3ff",
                        opacity: 0.1,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "repulse" },
                        onclick: { enable: true, mode: "push" }
                    }
                },
                retina_detect: true
            });
        }
    }

    initLanguageSystem() {
        // Detectar idioma del navegador
        const browserLang = navigator.language.split('-')[0];
        const savedLang = localStorage.getItem('intermappler_language');
        
        this.currentLanguage = savedLang || browserLang || 'es';
        
        // Crear selector de idioma
        this.createLanguageSelector();
        
        // Aplicar idioma actual
        this.applyLanguage(this.currentLanguage);
    }

    createLanguageSelector() {
        const header = document.querySelector('.login-header');
        if (!header) return;
        
        // Crear contenedor del selector
        const langContainer = document.createElement('div');
        langContainer.className = 'language-selector';
        langContainer.innerHTML = `
            <button class="lang-btn" id="lang-toggle">
                <i class="fas fa-globe"></i>
                <span class="lang-code">${this.currentLanguage.toUpperCase()}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="lang-dropdown" id="lang-dropdown">
                <!-- Se llenará dinámicamente -->
            </div>
        `;
        
        // Insertar después del logo
        const logoWrapper = document.querySelector('.logo-wrapper');
        if (logoWrapper) {
            logoWrapper.parentNode.insertBefore(langContainer, logoWrapper.nextSibling);
        }
        
        // Cargar idiomas
        this.loadLanguages();
        
        // Event listeners
        document.getElementById('lang-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLanguageDropdown();
        });
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', () => {
            this.hideLanguageDropdown();
        });
    }

    async loadLanguages() {
        try {
            const response = await fetch('/api/translate/languages');
            const data = await response.json();
            
            if (data.success) {
                this.renderLanguageDropdown(data.languages);
            }
        } catch (error) {
            console.error('Error cargando idiomas:', error);
            // Usar lista por defecto
            this.renderLanguageDropdown([
                { code: 'es', name: 'Español', native_name: 'Español' },
                { code: 'en', name: 'Inglés', native_name: 'English' },
                { code: 'fr', name: 'Francés', native_name: 'Français' },
                { code: 'de', name: 'Alemán', native_name: 'Deutsch' },
                { code: 'it', name: 'Italiano', native_name: 'Italiano' },
                { code: 'pt', name: 'Portugués', native_name: 'Português' }
            ]);
        }
    }

    renderLanguageDropdown(languages) {
        const dropdown = document.getElementById('lang-dropdown');
        if (!dropdown) return;
        
        let html = '';
        languages.forEach(lang => {
            const isActive = lang.code === this.currentLanguage;
            html += `
                <button class="lang-option ${isActive ? 'active' : ''}" 
                        data-lang="${lang.code}"
                        title="${lang.native_name}">
                    <span class="lang-flag">${this.getFlagEmoji(lang.code)}</span>
                    <span class="lang-name">${lang.name}</span>
                    <span class="lang-native">${lang.native_name}</span>
                    ${isActive ? '<i class="fas fa-check"></i>' : ''}
                </button>
            `;
        });
        
        dropdown.innerHTML = html;
        
        // Event listeners para opciones
        dropdown.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const langCode = e.currentTarget.dataset.lang;
                this.changeLanguage(langCode);
            });
        });
    }

    getFlagEmoji(langCode) {
        const flagMap = {
            'es': '🇪🇸',
            'en': '🇺🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'it': '🇮🇹',
            'pt': '🇵🇹',
            'ru': '🇷🇺',
            'zh': '🇨🇳',
            'ja': '🇯🇵',
            'ko': '🇰🇷',
            'ar': '🇸🇦',
            'hi': '🇮🇳'
        };
        return flagMap[langCode] || '🌐';
    }

    toggleLanguageDropdown() {
        const dropdown = document.getElementById('lang-dropdown');
        dropdown.classList.toggle('show');
    }

    hideLanguageDropdown() {
        const dropdown = document.getElementById('lang-dropdown');
        dropdown.classList.remove('show');
    }

    async changeLanguage(langCode) {
        this.currentLanguage = langCode;
        
        // Guardar preferencia
        localStorage.setItem('intermappler_language', langCode);
        
        // Actualizar UI
        this.updateLanguageUI();
        
        // Aplicar traducciones
        await this.applyLanguage(langCode);
        
        // Cerrar dropdown
        this.hideLanguageDropdown();
        
        // Mostrar confirmación
        this.showNotification(`Idioma cambiado a ${this.getLanguageName(langCode)}`, 'success');
    }

    updateLanguageUI() {
        // Actualizar botón de idioma
        const langCodeElement = document.querySelector('.lang-code');
        const langToggle = document.getElementById('lang-toggle');
        
        if (langCodeElement) {
            langCodeElement.textContent = this.currentLanguage.toUpperCase();
        }
        
        // Actualizar opción activa en dropdown
        document.querySelectorAll('.lang-option').forEach(option => {
            const isActive = option.dataset.lang === this.currentLanguage;
            option.classList.toggle('active', isActive);
            
            // Actualizar checkmark
            const checkmark = option.querySelector('.fa-check');
            if (checkmark) {
                checkmark.style.display = isActive ? 'inline-block' : 'none';
            } else if (isActive) {
                option.innerHTML += '<i class="fas fa-check"></i>';
            }
        });
        
        // Añadir animación
        if (langToggle) {
            langToggle.classList.add('lang-changed');
            setTimeout(() => {
                langToggle.classList.remove('lang-changed');
            }, 300);
        }
    }

    async applyLanguage(langCode) {
        // Actualizar textos de la interfaz
        await this.translateInterface(langCode);
        
        // Actualizar placeholders y labels
        this.translateFormElements(langCode);
        
        // Añadir header para futuras peticiones
        this.setLanguageHeader(langCode);
        
        // Actualizar dirección del texto si es necesario
        this.updateTextDirection(langCode);
    }

    async translateInterface(langCode) {
        // Elementos a traducir
        const elementsToTranslate = [
            { selector: '.system-subtitle .typing-text', key: 'Sistema de Mapeo Inteligente Global' },
            { selector: '.mode-btn[data-mode="login"] span', key: 'Iniciar Sesión' },
            { selector: '.mode-btn[data-mode="public"] span', key: 'Acceso Público' },
            { selector: '.mode-btn[data-mode="info"] span', key: 'Información' },
            { selector: '.panel-header h2', key: 'Acceso Seguro' },
            { selector: '.access-description', key: 'Mapa en tiempo real con información de emergencia para salvar vidas' },
            { selector: '.role-selector label', key: 'Tipo de Usuario' },
            { selector: '.subrole-selector label', key: 'Especialización' },
            { selector: '.input-group label[for="username"]', key: 'Usuario' },
            { selector: '.input-group label[for="password"]', key: 'Contraseña' },
            { selector: '.login-options span', key: 'Recordar esta sesión (30 min)' },
            { selector: '#forgot-password', key: '¿Problemas para acceder?' },
            { selector: '.btn-text', key: 'Iniciar Sesión Segura' },
            { selector: '.public-access-btn span', key: 'Acceder al Mapa Público' },
            { selector: '.public-note', key: 'El acceso público no requiere registro. Los datos son limitados para protección de la privacidad.' },
            { selector: '.feature-card h3', key: 'Alertas de Emergencia' },
            { selector: '.feature-card:nth-child(1) p', key: 'Información en tiempo real sobre desastres naturales' },
            { selector: '.feature-card:nth-child(2) h3', key: 'Pronóstico Meteorológico' },
            { selector: '.feature-card:nth-child(2) p', key: 'Datos climáticos actualizados cada 15 minutos' },
            { selector: '.feature-card:nth-child(3) h3', key: 'Servicios de Emergencia' },
            { selector: '.feature-card:nth-child(3) p', key: 'Localización de hospitales y centros de ayuda' },
            { selector: '.info-panel .system-description h3', key: 'Sistema de Mapeo Inteligente' },
            { selector: '.info-panel .system-description p', key: 'InterMappler es una plataforma avanzada de mapeo en tiempo real que proporciona diferentes niveles de acceso según el rol del usuario, desde información pública de emergencia hasta datos estratégicos clasificados.' },
            { selector: '.info-panel .roles-hierarchy h4', key: 'Jerarquía de Roles' },
            { selector: '.info-panel .security-features h4', key: 'Características de Seguridad' },
            { selector: '.login-footer .footer-section:nth-child(1) h4', key: 'Seguridad' },
            { selector: '.login-footer .footer-section:nth-child(1) p', key: 'Todas las conexiones están encriptadas con SSL/TLS 1.3' },
            { selector: '.login-footer .footer-section:nth-child(2) h4', key: 'Disponibilidad' },
            { selector: '.login-footer .footer-section:nth-child(2) p', key: 'Sistema operativo 24/7 con 99.9% uptime' },
            { selector: '.login-footer .footer-section:nth-child(3) h4', key: 'Soporte' },
            { selector: '.login-footer .footer-section:nth-child(3) p', key: 'Contacto: support@intermappler.org' }
        ];
        
        // Traducir cada elemento
        for (const element of elementsToTranslate) {
            const el = document.querySelector(element.selector);
            if (el) {
                try {
                    const translated = await this.translateText(element.key, langCode);
                    if (translated && translated !== element.key) {
                        el.textContent = translated;
                        el.setAttribute('data-translated', 'true');
                    }
                } catch (error) {
                    console.warn(`Error traduciendo ${element.key}:`, error);
                }
            }
        }
        
        // Traducir opciones de select
        await this.translateSelectOptions('#user-type', [
            '-- Seleccione su rol --',
            'Ingeniero de Mapa',
            'Administrador',
            'Inteligencia',
            'Militar',
            'Policía',
            'Especialista'
        ], langCode);
        
        await this.translateSelectOptions('#subrole', [
            '-- Seleccione especialización --',
            'Periodista',
            'Astrólogo',
            'Astrónomo',
            'Meteorólogo',
            'Geólogo',
            'Sociólogo'
        ], langCode);
    }

    translateFormElements(langCode) {
        // Traducir placeholders
        const placeholders = {
            '#username': 'Ingrese su usuario',
            '#password': 'Ingrese su contraseña',
            '#recovery-email': 'Email registrado',
            '#data-id': 'ID del dato',
            '#delete-id': 'ID a eliminar',
            '#nombre': 'Tu nombre'
        };
        
        for (const selector in placeholders) {
            const input = document.querySelector(selector);
            if (input) {
                this.translateText(placeholders[selector], langCode)
                    .then(translated => {
                        if (translated && translated !== placeholders[selector]) {
                            input.placeholder = translated;
                            input.setAttribute('data-translated', 'true');
                        }
                    })
                    .catch(error => console.warn('Error traduciendo placeholder:', error));
            }
        }
    }

    async translateSelectOptions(selector, originalOptions, langCode) {
        const select = document.querySelector(selector);
        if (!select || langCode === 'es') return;
        
        // Traducir cada opción
        for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i];
            const originalText = originalOptions[i] || option.textContent;
            
            if (originalText && !originalText.includes('--')) {
                try {
                    const translated = await this.translateText(originalText.replace(/[👑🛡️🕵️‍♂️🎖️👮‍♀️🎓🌍📰🔮🌌⛈️⛰️👥]/g, '').trim(), langCode);
                    if (translated && translated !== originalText) {
                        // Mantener el emoji y añadir texto traducido
                        const emoji = option.textContent.match(/[👑🛡️🕵️‍♂️🎖️👮‍♀️🎓🌍📰🔮🌌⛈️⛰️👥]/)?.[0] || '';
                        option.textContent = emoji + ' ' + translated;
                        option.setAttribute('data-translated', 'true');
                    }
                } catch (error) {
                    console.warn('Error traduciendo opción de select:', error);
                }
            }
        }
    }

    updateTextDirection(langCode) {
        // Idiomas de derecha a izquierda
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        const isRTL = rtlLanguages.includes(langCode);
        
        document.body.dir = isRTL ? 'rtl' : 'ltr';
        document.body.style.textAlign = isRTL ? 'right' : 'left';
        
        // Ajustar estilos para RTL
        if (isRTL) {
            document.querySelectorAll('.input-with-icon input').forEach(input => {
                input.style.paddingLeft = '3rem';
                input.style.paddingRight = '1.2rem';
                input.style.textAlign = 'right';
            });
            
            document.querySelectorAll('.toggle-password').forEach(btn => {
                btn.style.left = '1rem';
                btn.style.right = 'auto';
            });
            
            document.querySelectorAll('.lang-btn, .lang-option').forEach(el => {
                el.style.flexDirection = 'row-reverse';
            });
        }
    }

    setLanguageHeader(langCode) {
        // Guardar en variable global para usar en fetch
        window.intermapplerLanguage = langCode;
        
        // Interceptar fetch para añadir header
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (!options.headers) options.headers = {};
            options.headers['X-Language'] = langCode;
            options.headers['X-Translate'] = 'true';
            return originalFetch(url, options);
        };
    }

    bindEvents() {
        // Selector de modo
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchPanel(mode);
            });
        });

        // Selector de rol
        const roleSelect = document.getElementById('user-type');
        const subroleContainer = document.getElementById('subrole-container');
        
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                const isSpecialist = e.target.value === 'SPECIALIST';
                if (subroleContainer) {
                    subroleContainer.style.display = isSpecialist ? 'block' : 'none';
                }
                
                if (isSpecialist) {
                    document.getElementById('subrole').required = true;
                } else {
                    document.getElementById('subrole').required = false;
                }
            });
        }

        // Toggle password visibility
        const togglePassword = document.querySelector('.toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', (e) => {
                const passwordInput = document.getElementById('password');
                const icon = e.currentTarget.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }

        // Form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Acceso público
        const publicAccessBtn = document.getElementById('enter-public');
        if (publicAccessBtn) {
            publicAccessBtn.addEventListener('click', () => {
                this.enterPublicMode();
            });
        }

        // Recuperación de contraseña
        const forgotPassword = document.getElementById('forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRecoveryModal();
            });
        }

        // Cerrar modal
        const closeRecovery = document.getElementById('close-recovery');
        if (closeRecovery) {
            closeRecovery.addEventListener('click', () => {
                this.hideRecoveryModal();
            });
        }

        // Formulario de recuperación
        const recoveryForm = document.getElementById('recovery-form');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordRecovery();
            });
        }

        // Verificación de contraseña en tiempo real
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    switchPanel(panelName) {
        // Actualizar botones activos
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === panelName) {
                btn.classList.add('active');
            }
        });

        // Cambiar paneles
        document.querySelectorAll('.login-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${panelName}-panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            this.currentPanel = panelName;
        }

        // Efectos especiales
        this.playPanelTransition();
    }

    async handleLogin() {
        if (this.isAuthenticating) return;
        
        const form = document.getElementById('login-form');
        if (!form) return;
        
        const formData = new FormData(form);
        
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password'),
            userType: formData.get('userType'),
            subrole: formData.get('userType') === 'SPECIALIST' ? formData.get('subrole') : null,
            language: this.currentLanguage
        };

        // Validaciones básicas
        if (!this.validateLoginData(loginData)) {
            return;
        }

        // Iniciar autenticación
        this.startAuthenticationProcess();

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Language': this.currentLanguage,
                    'X-Translate': 'true'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                await this.completeAuthentication(data);
            } else {
                throw new Error(data.error || 'Error de autenticación');
            }

        } catch (error) {
            this.handleAuthenticationError(error.message);
        } finally {
            this.endAuthenticationProcess();
        }
    }

    validateLoginData(data) {
        // Validación de username
        if (!data.username || data.username.trim().length < 3) {
            this.showError(this.translateTextSync('Usuario inválido. Mínimo 3 caracteres.', this.currentLanguage));
            return false;
        }

        // Validación de password
        if (!data.password || data.password.length < 8) {
            this.showError(this.translateTextSync('Contraseña inválida. Mínimo 8 caracteres.', this.currentLanguage));
            return false;
        }

        // Validación de rol
        if (!data.userType) {
            this.showError(this.translateTextSync('Por favor, seleccione un tipo de usuario.', this.currentLanguage));
            return false;
        }

        // Validación de subrol para especialistas
        if (data.userType === 'SPECIALIST' && !data.subrole) {
            this.showError(this.translateTextSync('Por favor, seleccione una especialización.', this.currentLanguage));
            return false;
        }

        return true;
    }

    startAuthenticationProcess() {
        this.isAuthenticating = true;
        
        const loginBtn = document.getElementById('submit-login');
        const verificationSteps = document.querySelector('.security-verification');
        
        if (loginBtn) {
            // Mostrar loader
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
        }
        
        if (verificationSteps) {
            // Mostrar pasos de verificación
            verificationSteps.style.display = 'block';
            
            // Animación paso a paso
            const steps = document.querySelectorAll('.verification-step');
            steps.forEach((step, index) => {
                setTimeout(() => {
                    step.classList.add('active');
                }, index * 800);
            });
        }
    }

    async completeAuthentication(authData) {
        // Almacenar datos de sesión
        localStorage.setItem('intermappler_session', JSON.stringify({
            sessionId: authData.sessionId,
            authToken: authData.authToken,
            user: authData.user,
            permissions: authData.permissions,
            loginTime: authData.loginTime,
            expiresIn: authData.expiresIn,
            language: this.currentLanguage
        }));

        // Guardar idioma preferido
        localStorage.setItem('intermappler_language', this.currentLanguage);

        // Mostrar éxito
        this.showSuccess(this.translateTextSync('Autenticación exitosa', this.currentLanguage));

        // Redirigir al dashboard según rol
        setTimeout(() => {
            this.redirectToDashboard(authData.user.role.id);
        }, 1500);
    }

    handleAuthenticationError(errorMessage) {
        this.showError(errorMessage);
        
        // Efecto de error
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.classList.add('error-shake');
            setTimeout(() => {
                loginForm.classList.remove('error-shake');
            }, 500);
        }
    }

    endAuthenticationProcess() {
        this.isAuthenticating = false;
        
        const loginBtn = document.getElementById('submit-login');
        const verificationSteps = document.querySelector('.security-verification');
        const steps = document.querySelectorAll('.verification-step');
        
        if (loginBtn) {
            // Restaurar botón
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
        
        if (verificationSteps) {
            // Ocultar verificación
            verificationSteps.style.display = 'none';
            steps.forEach(step => step.classList.remove('active'));
        }
    }

    redirectToDashboard(roleId) {
        const roleDashboards = {
            'MAP_ENGINEER': '/dashboard/engineer',
            'ADMINISTRATOR': '/dashboard/admin',
            'INTELLIGENCE': '/dashboard/intelligence',
            'MILITARY': '/dashboard/military',
            'POLICE': '/dashboard/police',
            'SPECIALIST': '/dashboard/specialist',
            'PUBLIC': '/dashboard/public'
        };

        const dashboardPath = roleDashboards[roleId] || '/dashboard';
        
        // Añadir parámetro de idioma
        const langParam = this.currentLanguage !== 'es' ? `?lang=${this.currentLanguage}` : '';
        window.location.href = dashboardPath + langParam;
    }

    enterPublicMode() {
        // Almacenar modo público
        localStorage.setItem('intermappler_access_mode', 'public');
        localStorage.setItem('intermappler_language', this.currentLanguage);
        
        // Redirigir al mapa público con idioma
        const langParam = this.currentLanguage !== 'es' ? `?lang=${this.currentLanguage}` : '';
        window.location.href = '/map/public' + langParam;
    }

    showRecoveryModal() {
        const modal = document.getElementById('recovery-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Traducir título del modal
            const modalTitle = modal.querySelector('h3');
            if (modalTitle) {
                this.translateText('Recuperación de Acceso', this.currentLanguage)
                    .then(translated => {
                        if (translated) {
                            const icon = modalTitle.querySelector('i');
                            modalTitle.innerHTML = icon ? `${icon.outerHTML} ${translated}` : translated;
                        }
                    });
            }
        }
    }

    hideRecoveryModal() {
        const modal = document.getElementById('recovery-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async handlePasswordRecovery() {
        const emailInput = document.getElementById('recovery-email');
        if (!emailInput) return;
        
        const email = emailInput.value;
        
        if (!this.validateEmail(email)) {
            this.showError(this.translateTextSync('Email inválido', this.currentLanguage));
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/auth/recover`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Language': this.currentLanguage
                },
                body: JSON.stringify({ 
                    email,
                    language: this.currentLanguage 
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess(data.message || this.translateTextSync('Instrucciones enviadas al email', this.currentLanguage));
                this.hideRecoveryModal();
                emailInput.value = '';
            } else {
                throw new Error(data.error || this.translateTextSync('Error al procesar la solicitud', this.currentLanguage));
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    updatePasswordStrength(password = '') {
        const strengthBar = document.querySelector('.strength-bar');
        if (!strengthBar) return;
        
        let strength = 0;
        let color = '#ff4757'; // Rojo por defecto

        // Criterios de fortaleza
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        // Actualizar color
        if (strength >= 75) {
            color = '#00ff9d'; // Verde
        } else if (strength >= 50) {
            color = '#ffd300'; // Amarillo
        } else if (strength >= 25) {
            color = '#ffa500'; // Naranja
        }

        // Actualizar barra
        strengthBar.style.width = `${strength}%`;
        strengthBar.style.backgroundColor = color;
        
        // Actualizar texto descriptivo si existe
        const strengthText = document.querySelector('.password-strength-text');
        if (strengthText) {
            let text = '';
            if (strength >= 75) text = this.translateTextSync('Fuerte', this.currentLanguage);
            else if (strength >= 50) text = this.translateTextSync('Moderada', this.currentLanguage);
            else if (strength >= 25) text = this.translateTextSync('Débil', this.currentLanguage);
            else text = this.translateTextSync('Muy débil', this.currentLanguage);
            
            strengthText.textContent = text;
        }
    }

    initRoleHierarchy() {
        const hierarchyContainer = document.querySelector('.hierarchy-visualization');
        if (!hierarchyContainer) return;
        
        // Datos de jerarquía
        const hierarchy = [
            { level: 100, name: 'Ingeniero de Mapa', color: '#FF6B35' },
            { level: 90, name: 'Administrador', color: '#4ECDC4' },
            { level: 80, name: 'Inteligencia', color: '#1A535C' },
            { level: 70, name: 'Militar', color: '#45B7D1' },
            { level: 60, name: 'Policía', color: '#96CEB4' },
            { level: 50, name: 'Especialista', color: '#FFEAA7' },
            { level: 10, name: 'Público', color: '#95E1D3' }
        ];

        // Crear visualización
        let html = '<div class="hierarchy-tree">';
        hierarchy.forEach(role => {
            html += `
                <div class="hierarchy-level" style="border-color: ${role.color}">
                    <div class="level-badge" style="background: ${role.color}">
                        ${this.translateTextSync('Lvl', this.currentLanguage)} ${role.level}
                    </div>
                    <div class="role-name">${this.translateTextSync(role.name, this.currentLanguage)}</div>
                </div>
            `;
        });
        html += '</div>';

        hierarchyContainer.innerHTML = html;
    }

    showDemoHint() {
        // Mostrar usuarios demo disponibles
        const demoUsers = [
            'engineer_alpha',
            'admin_nova', 
            'intel_shadow',
            'mil_command',
            'police_guard',
            'reporter_news',
            'astro_sky',
            'weather_pro'
        ];

        const hintElement = document.querySelector('.demo-users-hint span');
        if (hintElement) {
            const hintText = this.translateTextSync('Demo', this.currentLanguage) + ': ' + 
                           demoUsers.slice(0, 3).join(', ') + '...';
            hintElement.textContent = hintText;
        }
    }

    // Métodos de utilidad
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;

        // Estilos de notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'rgba(255, 71, 87, 0.9)' : 'rgba(0, 255, 157, 0.9)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    playPanelTransition() {
        const panel = document.getElementById(`${this.currentPanel}-panel`);
        if (panel) {
            panel.style.animation = 'none';
            setTimeout(() => {
                panel.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
    }

    async translateText(text, targetLang) {
        if (!text || targetLang === 'es') return text;
        
        try {
            const response = await fetch('/api/translate/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Language': targetLang
                },
                body: JSON.stringify({
                    text: text,
                    target_language: targetLang,
                    source_language: 'auto'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.translated_text;
            }
        } catch (error) {
            console.error('Error en traducción:', error);
        }
        
        return text;
    }

    translateTextSync(text, targetLang) {
        // Traducciones sincrónicas básicas para errores
        const translations = {
            'es': {
                'Usuario inválido. Mínimo 3 caracteres.': 'Usuario inválido. Mínimo 3 caracteres.',
                'Contraseña inválida. Mínimo 8 caracteres.': 'Contraseña inválida. Mínimo 8 caracteres.',
                'Por favor, seleccione un tipo de usuario.': 'Por favor, seleccione un tipo de usuario.',
                'Por favor, seleccione una especialización.': 'Por favor, seleccione una especialización.',
                'Email inválido': 'Email inválido',
                'Autenticación exitosa': 'Autenticación exitosa',
                'Fuerte': 'Fuerte',
                'Moderada': 'Moderada',
                'Débil': 'Débil',
                'Muy débil': 'Muy débil',
                'Lvl': 'Nvl'
            },
            'en': {
                'Usuario inválido. Mínimo 3 caracteres.': 'Invalid username. Minimum 3 characters.',
                'Contraseña inválida. Mínimo 8 caracteres.': 'Invalid password. Minimum 8 characters.',
                'Por favor, seleccione un tipo de usuario.': 'Please select a user type.',
                'Por favor, seleccione una especialización.': 'Please select a specialization.',
                'Email inválido': 'Invalid email',
                'Autenticación exitosa': 'Authentication successful',
                'Fuerte': 'Strong',
                'Moderada': 'Moderate',
                'Débil': 'Weak',
                'Muy débil': 'Very weak',
                'Lvl': 'Lvl'
            }
        };
        
        return translations[targetLang]?.[text] || text;
    }

    getLanguageName(langCode) {
        const names = {
            'es': 'Español',
            'en': 'English',
            'fr': 'Français',
            'de': 'Deutsch',
            'it': 'Italiano',
            'pt': 'Português',
            'ru': 'Русский',
            'zh': '中文',
            'ja': '日本語',
            'ko': '한국어',
            'ar': 'العربية',
            'hi': 'हिन्दी'
        };
        return names[langCode] || langCode;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
    
    // Añadir animación de entrada
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Añadir estilos CSS para animaciones adicionales
const additionalStyles = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes error-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-shake {
    animation: error-shake 0.5s ease;
}

.hierarchy-tree {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.hierarchy-level {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border: 2px solid;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
}

.level-badge {
    padding: 5px 10px;
    border-radius: 4px;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.8rem;
    margin-right: 15px;
    color: white;
}

.role-name {
    font-family: 'Exo 2', sans-serif;
    font-weight: 500;
}

/* Estilos para el selector de idioma */
.language-selector {
    position: absolute;
    top: 2rem;
    right: 2rem;
    z-index: 100;
}

@media (max-width: 768px) {
    .language-selector {
        position: relative;
        top: 0;
        right: 0;
        margin: 1rem auto;
        display: flex;
        justify-content: center;
    }
}

.lang-btn {
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-family: var(--font-text);
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 120px;
    justify-content: space-between;
}

.lang-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--cyber-blue);
}

.lang-btn.lang-changed {
    animation: langChange 0.3s ease;
}

@keyframes langChange {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.lang-code {
    font-family: var(--font-primary);
    font-weight: 700;
    color: var(--cyber-blue);
}

.lang-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    min-width: 200px;
    max-height: 300px;
    overflow-y: auto;
    display: none;
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.lang-dropdown.show {
    display: block;
    animation: fadeIn 0.3s ease;
}

.lang-option {
    width: 100%;
    padding: 1rem;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.lang-option:last-child {
    border-bottom: none;
}

.lang-option:hover {
    background: rgba(0, 243, 255, 0.1);
}

.lang-option.active {
    background: rgba(0, 243, 255, 0.2);
    border-left: 3px solid var(--cyber-blue);
}

.lang-flag {
    font-size: 1.2rem;
    min-width: 24px;
}

.lang-name {
    flex: 1;
    font-weight: 500;
}

.lang-native {
    font-size: 0.85rem;
    color: var(--text-secondary);
    opacity: 0.8;
}

.lang-option .fa-check {
    color: var(--cyber-blue);
    font-size: 0.9rem;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.lang-option.active .fa-check {
    opacity: 1;
}

/* Estilos para modo RTL */
[dir="rtl"] {
    text-align: right;
    direction: rtl;
}

[dir="rtl"] .lang-btn {
    flex-direction: row-reverse;
}

[dir="rtl"] .lang-option {
    text-align: right;
    flex-direction: row-reverse;
}

[dir="rtl"] .lang-option.active {
    border-left: none;
    border-right: 3px solid var(--cyber-blue);
}

[dir="rtl"] .input-with-icon input {
    padding-left: 3rem;
    padding-right: 1.2rem;
    text-align: right;
}

[dir="rtl"] .toggle-password {
    left: 1rem;
    right: auto;
}

/* Estilos para elementos traducidos */
[data-translated="true"] {
    position: relative;
}

.password-strength-text {
    font-size: 0.8rem;
    margin-top: 0.3rem;
    color: var(--text-secondary);
}
`;

// Insertar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);