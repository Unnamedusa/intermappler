// Gestión del formulario de login
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
        
        // Demo credentials autofill
        this.setupDemoCredentials();
    }
    
    togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        
        const icon = this.togglePassword.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
    
    validateEmail() {
        const email = this.emailInput.value;
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
            email: this.emailInput.value,
            password: this.passwordInput.value,
            remember: document.getElementById('rememberMe').checked,
            timestamp: new Date().toISOString()
        };
        
        // Mostrar estado de carga
        this.setLoadingState(true);
        
        try {
            // Aquí iría la llamada real a la API
            // Por ahora simulamos una respuesta después de 1.5 segundos
            await this.simulateLogin(formData);
            
            // Login exitoso - redirigir al dashboard
            this.showSuccessMessage();
            
            // Simular redirección
            setTimeout(() => {
                // window.location.href = '/dashboard.html';
                alert('¡Login exitoso! Redirigiendo al dashboard de Intermappler...');
                this.setLoadingState(false);
            }, 1500);
            
        } catch (error) {
            this.setLoadingState(false);
            this.showErrorMessage(error.message || 'Error en el login');
        }
    }
    
    simulateLogin(credentials) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Credenciales de demo
                const demoCredentials = {
                    email: 'demo@intermappler.com',
                    password: 'demo123'
                };
                
                if (credentials.email === demoCredentials.email && 
                    credentials.password === demoCredentials.password) {
                    resolve({
                        success: true,
                        token: 'demo-token-123456',
                        user: {
                            id: 1,
                            name: 'Usuario Demo',
                            email: credentials.email,
                            role: 'admin',
                            avatar: null
                        }
                    });
                } else {
                    reject(new Error('Credenciales incorrectas. Usa demo@intermappler.com / demo123'));
                }
            }, 1500);
        });
    }
    
    setLoadingState(isLoading) {
        if (isLoading) {
            this.loginBtn.innerHTML = `
                <div class="spinner"></div>
                <span>Autenticando...</span>
            `;
            this.loginBtn.disabled = true;
            
            // Agregar estilos para el spinner
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
        } else {
            this.loginBtn.innerHTML = this.originalBtnText;
            this.loginBtn.disabled = false;
        }
    }
    
    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>¡Autenticación exitosa! Redirigiendo...</span>
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
        
        // Agregar animación
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
        
        this.loginForm.parentNode.insertBefore(successDiv, this.loginForm.nextSibling);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            successDiv.remove();
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
        
        this.loginForm.parentNode.insertBefore(errorDiv, this.loginForm.nextSibling);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    setupDemoCredentials() {
        // Botón para autocompletar credenciales de demo
        const demoBtn = document.createElement('button');
        demoBtn.type = 'button';
        demoBtn.className = 'demo-btn';
        demoBtn.innerHTML = '<i class="fas fa-magic"></i><span>Rellenar Demo</span>';
        demoBtn.style.cssText = `
            background: var(--surface-alt);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.5rem 0;
            transition: all 0.2s ease;
        `;
        
        demoBtn.addEventListener('mouseenter', () => {
            demoBtn.style.background = 'var(--surface)';
            demoBtn.style.borderColor = 'var(--primary-color)';
        });
        
        demoBtn.addEventListener('mouseleave', () => {
            demoBtn.style.background = 'var(--surface-alt)';
            demoBtn.style.borderColor = 'var(--border-color)';
        });
        
        demoBtn.addEventListener('click', () => {
            this.emailInput.value = 'demo@intermappler.com';
            this.passwordInput.value = 'demo123';
            document.getElementById('rememberMe').checked = true;
            
            // Validar automáticamente
            this.validateEmail();
            this.validatePassword();
            
            // Feedback visual
            demoBtn.innerHTML = '<i class="fas fa-check"></i><span>¡Demo cargada!</span>';
            demoBtn.style.background = 'var(--success-color)';
            demoBtn.style.color = 'white';
            demoBtn.style.borderColor = 'var(--success-color)';
            
            setTimeout(() => {
                demoBtn.innerHTML = '<i class="fas fa-magic"></i><span>Rellenar Demo</span>';
                demoBtn.style.background = 'var(--surface-alt)';
                demoBtn.style.color = 'var(--text-primary)';
                demoBtn.style.borderColor = 'var(--border-color)';
            }, 2000);
        });
        
        // Insertar botón después del formulario
        this.loginForm.appendChild(demoBtn);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
    
    // Escuchar cambios de idioma para actualizar textos dinámicos
    document.addEventListener('languageChanged', (e) => {
        // Aquí puedes actualizar textos dinámicos si los hay
        console.log(`Idioma cambiado a: ${e.detail.language}`);
    });
});