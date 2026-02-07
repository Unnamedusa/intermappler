// Sistema de Login Frontend para InterMappler

class LoginSystem {
    constructor() {
        this.apiBase = '/api';
        this.currentPanel = 'login';
        this.isAuthenticating = false;
        this.init();
    }

    init() {
        this.initParticles();
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
        
        roleSelect.addEventListener('change', (e) => {
            const isSpecialist = e.target.value === 'SPECIALIST';
            subroleContainer.style.display = isSpecialist ? 'block' : 'none';
            
            if (isSpecialist) {
                document.getElementById('subrole').required = true;
            } else {
                document.getElementById('subrole').required = false;
            }
        });

        // Toggle password visibility
        document.querySelector('.toggle-password').addEventListener('click', (e) => {
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

        // Form submission
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Acceso público
        document.getElementById('enter-public').addEventListener('click', () => {
            this.enterPublicMode();
        });

        // Recuperación de contraseña
        document.getElementById('forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRecoveryModal();
        });

        // Cerrar modal
        document.getElementById('close-recovery').addEventListener('click', () => {
            this.hideRecoveryModal();
        });

        // Formulario de recuperación
        document.getElementById('recovery-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordRecovery();
        });

        // Verificación de contraseña en tiempo real
        document.getElementById('password').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });
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
        
        document.getElementById(`${panelName}-panel`).classList.add('active');
        this.currentPanel = panelName;

        // Efectos especiales
        this.playPanelTransition();
    }

    async handleLogin() {
        if (this.isAuthenticating) return;
        
        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password'),
            userType: formData.get('userType'),
            subrole: formData.get('userType') === 'SPECIALIST' ? formData.get('subrole') : null
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
            this.showError('Usuario inválido. Mínimo 3 caracteres.');
            return false;
        }

        // Validación de password
        if (!data.password || data.password.length < 8) {
            this.showError('Contraseña inválida. Mínimo 8 caracteres.');
            return false;
        }

        // Validación de rol
        if (!data.userType) {
            this.showError('Por favor, seleccione un tipo de usuario.');
            return false;
        }

        // Validación de subrol para especialistas
        if (data.userType === 'SPECIALIST' && !data.subrole) {
            this.showError('Por favor, seleccione una especialización.');
            return false;
        }

        return true;
    }

    startAuthenticationProcess() {
        this.isAuthenticating = true;
        
        const loginBtn = document.getElementById('submit-login');
        const verificationSteps = document.querySelector('.security-verification');
        
        // Mostrar loader
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        
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

    async completeAuthentication(authData) {
        // Almacenar datos de sesión
        localStorage.setItem('intermappler_session', JSON.stringify({
            sessionId: authData.sessionId,
            authToken: authData.authToken,
            user: authData.user,
            permissions: authData.permissions,
            loginTime: authData.loginTime,
            expiresIn: authData.expiresIn
        }));

        // Mostrar éxito
        this.showSuccess('Autenticación exitosa');

        // Redirigir al dashboard según rol
        setTimeout(() => {
            this.redirectToDashboard(authData.user.role.id);
        }, 1500);
    }

    handleAuthenticationError(errorMessage) {
        this.showError(errorMessage);
        
        // Efecto de error
        const loginForm = document.getElementById('login-form');
        loginForm.classList.add('error-shake');
        setTimeout(() => {
            loginForm.classList.remove('error-shake');
        }, 500);
    }

    endAuthenticationProcess() {
        this.isAuthenticating = false;
        
        const loginBtn = document.getElementById('submit-login');
        const verificationSteps = document.querySelector('.security-verification');
        const steps = document.querySelectorAll('.verification-step');
        
        // Restaurar botón
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        
        // Ocultar verificación
        verificationSteps.style.display = 'none';
        steps.forEach(step => step.classList.remove('active'));
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
        // Almacenar modo público
        localStorage.setItem('intermappler_access_mode', 'public');
        
        // Redirigir al mapa público
        window.location.href = '/map/public';
    }

    showRecoveryModal() {
        document.getElementById('recovery-modal').style.display = 'flex';
    }

    hideRecoveryModal() {
        document.getElementById('recovery-modal').style.display = 'none';
    }

    async handlePasswordRecovery() {
        const email = document.getElementById('recovery-email').value;
        
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

            if (response.ok) {
                this.showSuccess('Instrucciones enviadas al email');
                this.hideRecoveryModal();
            } else {
                throw new Error('Error al procesar la solicitud');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    updatePasswordStrength(password = '') {
        const strengthBar = document.querySelector('.strength-bar');
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
    }

    initRoleHierarchy() {
        const hierarchyContainer = document.querySelector('.hierarchy-visualization');
        
        // Datos de jerarquía (simulados - en producción vendrían del servidor)
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
                        Lvl ${role.level}
                    </div>
                    <div class="role-name">${role.name}</div>
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
            hintElement.textContent = `Demo: ${demoUsers.slice(0, 3).join(', ')}...`;
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
        panel.style.animation = 'none';
        setTimeout(() => {
            panel.style.animation = 'fadeIn 0.5s ease';
        }, 10);
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
`;

// Insertar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);