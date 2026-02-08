// Sistema de Login Frontend para InterMappler - Versión Minimalista

class LoginSystem {
    constructor() {
        this.apiBase = '/api';
        this.currentPanel = 'login';
        this.isAuthenticating = false;
        this.currentLanguage = 'es';
        this.init();
    }

    init() {
        this.initParticles();
        this.initLanguageSystem();
        this.bindEvents();
        this.updatePasswordStrength();
        this.createHierarchy();
    }

    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-overlay', {
                particles: {
                    number: { value: 40, density: { enable: true, value_area: 800 } },
                    color: { value: "#2563eb" },
                    shape: { type: "circle" },
                    opacity: { value: 0.1, random: true },
                    size: { value: 2, random: true },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: "#2563eb",
                        opacity: 0.1,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 0.5,
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
                        onhover: { enable: true, mode: "repulse" }
                    }
                },
                retina_detect: true
            });
        }
    }

    initLanguageSystem() {
        const browserLang = navigator.language.split('-')[0];
        const savedLang = localStorage.getItem('intermappler_language');
        this.currentLanguage = savedLang || browserLang || 'es';
        this.updateLanguageUI();
    }

    bindEvents() {
        // Tabs
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchPanel(mode);
            });
        });

        // Rol selector
        const roleSelect = document.getElementById('user-type');
        const subroleContainer = document.getElementById('subrole-container');
        
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                const isSpecialist = e.target.value === 'SPECIALIST';
                if (subroleContainer) {
                    subroleContainer.style.display = isSpecialist ? 'block' : 'none';
                }
            });
        }

        // Password toggle
        const togglePassword = document.querySelector('.toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', (e) => {
                const passwordInput = document.getElementById('password');
                const icon = e.currentTarget.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
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

        // Public access
        const publicAccessBtn = document.getElementById('enter-public');
        if (publicAccessBtn) {
            publicAccessBtn.addEventListener('click', () => {
                this.enterPublicMode();
            });
        }

        // Password recovery
        const forgotPassword = document.getElementById('forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRecoveryModal();
            });
        }

        // Close modal
        const closeRecovery = document.getElementById('close-recovery');
        if (closeRecovery) {
            closeRecovery.addEventListener('click', () => {
                this.hideRecoveryModal();
            });
        }

        // Recovery form
        const recoveryForm = document.getElementById('recovery-form');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordRecovery();
            });
        }

        // Password strength
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }

        // Language selector
        const langBtn = document.querySelector('.lang-btn');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                this.toggleLanguageDropdown();
            });
        }
    }

    switchPanel(panelName) {
        // Update active tab
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.mode === panelName) {
                tab.classList.add('active');
            }
        });

        // Switch panels
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${panelName}-panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            this.currentPanel = panelName;
        }

        // Animation
        targetPanel.style.animation = 'none';
        setTimeout(() => {
            targetPanel.style.animation = 'fadeIn 0.3s ease';
        }, 10);
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
            subrole: formData.get('userType') === 'SPECIALIST' ? formData.get('subrole') : null
        };

        // Validation
        if (!this.validateLoginData(loginData)) {
            return;
        }

        // Start authentication
        this.startAuthentication();

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                await this.completeAuthentication(data);
            } else {
                throw new Error(data.error || 'Authentication failed');
            }

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.endAuthentication();
        }
    }

    validateLoginData(data) {
        if (!data.username || data.username.trim().length < 3) {
            this.showError('Usuario inválido. Mínimo 3 caracteres.');
            return false;
        }

        if (!data.password || data.password.length < 8) {
            this.showError('Contraseña inválida. Mínimo 8 caracteres.');
            return false;
        }

        if (!data.userType) {
            this.showError('Por favor, seleccione un tipo de usuario.');
            return false;
        }

        if (data.userType === 'SPECIALIST' && !data.subrole) {
            this.showError('Por favor, seleccione una especialización.');
            return false;
        }

        return true;
    }

    startAuthentication() {
        this.isAuthenticating = true;
        const loginBtn = document.getElementById('submit-login');
        
        if (loginBtn) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
        }
    }

    async completeAuthentication(authData) {
        localStorage.setItem('intermappler_session', JSON.stringify({
            sessionId: authData.sessionId,
            authToken: authData.authToken,
            user: authData.user,
            permissions: authData.permissions,
            loginTime: Date.now()
        }));

        this.showSuccess('Autenticación exitosa');

        // Redirect based on role
        setTimeout(() => {
            this.redirectToDashboard(authData.user.role.id);
        }, 1500);
    }

    endAuthentication() {
        this.isAuthenticating = false;
        const loginBtn = document.getElementById('submit-login');
        
        if (loginBtn) {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
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
        window.location.href = dashboardPath;
    }

    enterPublicMode() {
        localStorage.setItem('intermappler_access_mode', 'public');
        window.location.href = '/map/public';
    }

    showRecoveryModal() {
        const modal = document.getElementById('recovery-modal');
        if (modal) {
            modal.style.display = 'flex';
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
            this.showError('Email inválido');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/auth/recover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Instrucciones enviadas al email');
                this.hideRecoveryModal();
                emailInput.value = '';
            } else {
                throw new Error(data.error || 'Error al procesar la solicitud');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    updatePasswordStrength(password = '') {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let color = '#ef4444';
        let text = 'Muy débil';

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        if (strength >= 75) {
            color = '#10b981';
            text = 'Fuerte';
        } else if (strength >= 50) {
            color = '#f59e0b';
            text = 'Moderada';
        } else if (strength >= 25) {
            color = '#f97316';
            text = 'Débil';
        }

        strengthBar.style.width = `${strength}%`;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
    }

    createHierarchy() {
        const hierarchyContainer = document.querySelector('.hierarchy-visual');
        if (!hierarchyContainer) return;
        
        const hierarchy = [
            { level: 100, name: 'Ingeniero de Mapa', color: '#2563eb' },
            { level: 90, name: 'Administrador', color: '#8b5cf6' },
            { level: 80, name: 'Inteligencia', color: '#3b82f6' },
            { level: 70, name: 'Militar', color: '#0ea5e9' },
            { level: 60, name: 'Policía', color: '#06b6d4' },
            { level: 50, name: 'Especialista', color: '#10b981' },
            { level: 10, name: 'Público', color: '#64748b' }
        ];

        let html = '';
        hierarchy.forEach(role => {
            html += `
                <div class="hierarchy-item" style="border-left-color: ${role.color}">
                    <div class="level-badge">N${role.level}</div>
                    <div class="role-name">${role.name}</div>
                </div>
            `;
        });

        hierarchyContainer.innerHTML = html;
    }

    // Utility methods
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
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#ef4444' : '#10b981',
            color: 'white',
            padding: 'var(--space-md) var(--space-lg)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease',
            maxWidth: '400px',
            wordWrap: 'break-word',
            boxShadow: 'var(--shadow-lg)'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    updateLanguageUI() {
        const langCodeElement = document.querySelector('.lang-code');
        if (langCodeElement) {
            langCodeElement.textContent = this.currentLanguage.toUpperCase();
        }
    }

    toggleLanguageDropdown() {
        console.log('Language selector clicked - implement dropdown');
        // Implement language dropdown functionality
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
    
    // Fade in animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add notification styles
const notificationStyles = `
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

.hierarchy-item {
    display: flex;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    border-left: 3px solid;
    margin-bottom: var(--space-sm);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-md);
}

.hierarchy-item:last-child {
    margin-bottom: 0;
}

.hierarchy-item .level-badge {
    background: currentColor;
    color: white;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: var(--space-md);
    min-width: 40px;
    text-align: center;
}

.hierarchy-item .role-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--surface-700);
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);