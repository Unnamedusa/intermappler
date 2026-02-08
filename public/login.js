// Gestión del formulario de login para Intermappler
class LoginManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePassword = document.getElementById('togglePassword');
        this.loginBtn = this.loginForm.querySelector('.login-btn');
        this.originalBtnText = this.loginBtn.innerHTML;
        
        this.init();
    }
    
    init() {
        // Mostrar/ocultar contraseña
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Envío del formulario
        this.loginForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validación en tiempo real
        this.emailInput.addEventListener('input', () => this.validateEmail());
        this.passwordInput.addEventListener('input', () => this.validatePassword());
        
        // Setup demo credentials
        this.setupDemoCredentials();
        
        // Setup social login buttons
        this.setupSocialLogin();
        
        // Check if user is already logged in (demo)
        this.checkExistingSession();
    }
    
    togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        
        const icon = this.togglePassword.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.showError(this.emailInput, 'Por favor ingresa un email válido');
            return false;
        }
        
        this.clearError(this.emailInput);
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        
        if (password && password.length < 6) {
            this.showError(this.passwordInput, 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        this.clearError(this.passwordInput);
        return true;
    }
    
    showError(input, message) {
        this.clearError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--danger-color)';
        errorDiv.style.fontSize = '0.75rem';
        errorDiv.style.marginTop = '0.25rem';
        
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = 'var(--danger-color)';
    }
    
    clearError(input) {
        const errorDiv = input.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar campos
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        // Obtener datos del formulario
        const formData = {
            email: this.emailInput.value.trim(),
            password: this.passwordInput.value,
            remember: document.getElementById('rememberMe').checked
        };
        
        // Mostrar estado de carga
        this.setLoadingState(true);
        
        try {
            // Enviar petición al servidor
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Guardar token en localStorage si se recordó la sesión
                if (formData.remember) {
                    localStorage.setItem('intermappler-token', data.token);
                    localStorage.setItem('intermappler-user', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('intermappler-token', data.token);
                    sessionStorage.setItem('intermappler-user', JSON.stringify(data.user));
                }
                
                // Mostrar mensaje de éxito
                this.showSuccessMessage('¡Autenticación exitosa! Redirigiendo...');
                
                // Redirigir después de 1.5 segundos
                setTimeout(() => {
                    window.location.href = data.redirect || '/dashboard';
                }, 1500);
                
            } else {
                throw new Error(data.message || 'Error en la autenticación');
            }
            
        } catch (error) {
            this.setLoadingState(false);
            this.showErrorMessage(error.message || 'Error al conectar con el servidor');
        }
    }
    
    setLoadingState(isLoading) {
        if (isLoading) {
            this.loginBtn.innerHTML = `
                <div class="spinner"></div>
                <span>Autenticando...</span>
            `;
            this.loginBtn.disabled = true;
            
            // Agregar estilos para el spinner
            this.addSpinnerStyles();
        } else {
            this.loginBtn.innerHTML = this.originalBtnText;
            this.loginBtn.disabled = false;
        }
    }
    
    addSpinnerStyles() {
        if (!document.querySelector('#spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        successDiv.style.cssText = `
            background: var(--success-color);
            color: white;
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        // Agregar animación si no existe
        this.addSlideInAnimation();
        
        this.loginForm.parentNode.insertBefore(successDiv, this.loginForm.nextSibling);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }
    
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        errorDiv.style.cssText = `
            background: var(--danger-color);
            color: white;
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        this.addSlideInAnimation();
        
        this.loginForm.parentNode.insertBefore(errorDiv, this.loginForm.nextSibling);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    addSlideInAnimation() {
        if (!document.querySelector('#slideIn-styles')) {
            const style = document.createElement('style');
            style.id = 'slideIn-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    setupDemoCredentials() {
        // Verificar si hay credenciales demo guardadas
        const savedDemo = localStorage.getItem('intermappler-demo-used');
        if (savedDemo) {
            const demoData = JSON.parse(savedDemo);
            this.emailInput.value = demoData.email || '';
            document.getElementById('rememberMe').checked = demoData.remember || false;
        }
        
        // Autocompletar credenciales demo al hacer clic en el texto de demo
        const demoInfo = document.querySelector('.demo-info');
        if (demoInfo) {
            demoInfo.style.cursor = 'pointer';
            demoInfo.title = 'Haz clic para autocompletar credenciales demo';
            demoInfo.addEventListener('click', () => {
                this.emailInput.value = 'demo@intermappler.com';
                this.passwordInput.value = 'demo123';
                document.getElementById('rememberMe').checked = true;
                
                // Guardar preferencia
                localStorage.setItem('intermappler-demo-used', JSON.stringify({
                    email: 'demo@intermappler.com',
                    remember: true
                }));
                
                // Feedback visual
                const originalText = demoInfo.querySelector('span').textContent;
                demoInfo.querySelector('span').textContent = '¡Credenciales cargadas!';
                demoInfo.style.opacity = '0.8';
                
                setTimeout(() => {
                    demoInfo.querySelector('span').textContent = originalText;
                    demoInfo.style.opacity = '1';
                }, 2000);
            });
        }
    }
    
    setupSocialLogin() {
        const socialButtons = document.querySelectorAll('.social-btn');
        
        socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const provider = button.classList.contains('google') ? 'Google' :
                                button.classList.contains('github') ? 'GitHub' : 'Microsoft';
                
                this.showInfoMessage(`Inicio de sesión con ${provider} - Esta función está en desarrollo`);
                
                // Simular carga
                const originalText = button.querySelector('span').textContent;
                button.querySelector('span').textContent = 'Conectando...';
                button.disabled = true;
                
                setTimeout(() => {
                    button.querySelector('span').textContent = originalText;
                    button.disabled = false;
                    this.showInfoMessage(`El inicio de sesión con ${provider} estará disponible pronto`);
                }, 1500);
            });
        });
    }
    
    showInfoMessage(message) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-message';
        infoDiv.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        infoDiv.style.cssText = `
            background: var(--warning-color);
            color: white;
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        this.addSlideInAnimation();
        
        const loginCard = document.querySelector('.login-card');
        loginCard.appendChild(infoDiv);
        
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.remove();
            }
        }, 3000);
    }
    
    checkExistingSession() {
        // Verificar si hay sesión guardada
        const token = localStorage.getItem('intermappler-token') || 
                     sessionStorage.getItem('intermappler-token');
        
        if (token) {
            // Intentar validar la sesión
            fetch('/api/auth/status', {
                headers: {
                    'Authorization': token
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    // Mostrar indicador de sesión activa
                    this.showSessionIndicator(data.user);
                }
            })
            .catch(() => {
                // Limpiar sesión inválida
                localStorage.removeItem('intermappler-token');
                sessionStorage.removeItem('intermappler-token');
                localStorage.removeItem('intermappler-user');
                sessionStorage.removeItem('intermappler-user');
            });
        }
    }
    
    showSessionIndicator(user) {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-indicator';
        sessionDiv.innerHTML = `
            <i class="fas fa-user-check"></i>
            <span>Sesión activa de ${user.name}</span>
            <button class="session-continue">Continuar</button>
            <button class="session-logout">Salir</button>
        `;
        sessionDiv.style.cssText = `
            background: var(--surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease;
        `;
        
        const continueBtn = sessionDiv.querySelector('.session-continue');
        continueBtn.style.cssText = `
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 0.875rem;
        `;
        
        const logoutBtn = sessionDiv.querySelector('.session-logout');
        logoutBtn.style.cssText = `
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 0.875rem;
        `;
        
        continueBtn.addEventListener('click', () => {
            window.location.href = '/dashboard';
        });
        
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('intermappler-token');
            sessionStorage.removeItem('intermappler-token');
            localStorage.removeItem('intermappler-user');
            sessionStorage.removeItem('intermappler-user');
            sessionDiv.remove();
        });
        
        const loginCard = document.querySelector('.login-card');
        if (loginCard) {
            loginCard.insertBefore(sessionDiv, loginCard.firstChild);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
    
    // Configurar enlaces del footer
    const setupFooterLinks = () => {
        const footerLinks = document.querySelectorAll('.footer-links a');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const linkText = link.textContent;
                alert(`${linkText} - Esta sección está en desarrollo`);
            });
        });
    };
    
    setupFooterLinks();
    
    // Configurar enlace "Solicitar acceso"
    const registerLink = document.querySelector('.register-link');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Solicitud de acceso - Esta función está en desarrollo');
        });
    }
    
    // Configurar enlace "¿Olvidaste tu contraseña?"
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Recuperación de contraseña - Esta función está en desarrollo');
        });
    }
});