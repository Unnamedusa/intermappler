// Variables globales
const API_BASE_URL = window.location.origin;
let particlesInstance = null;
let requestCount = 0;
let startTime = Date.now();
let charts = {};
let terminalHistory = [];
let terminalIndex = -1;

// Inicialización completa
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 HELLO WORLD!!! API Dashboard Initializing...');
    
    // Inicializar efectos visuales
    initParticles();
    initNeonEffects();
    initTerminal();
    
    // Inicializar funcionalidades
    initMenu();
    initCharts();
    initSystemInfo();
    
    // Cargar datos iniciales
    await checkServerStatus();
    await loadInitialData();
    startLiveUpdates();
    
    // Mostrar tiempo de inicialización
    const initTime = new Date().toLocaleTimeString();
    document.getElementById('init-time').textContent = initTime;
    
    // Añadir primer mensaje al feed
    addToFeed('System initialized successfully');
    addToFeed(`Connected to: ${API_BASE_URL}`);
    
    console.log('✅ Dashboard ready!');
});

// ========== EFECTOS VISUALES ==========

// Inicializar partículas
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#00f3ff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00f3ff",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
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

// Efectos neón
function initNeonEffects() {
    const letters = document.querySelectorAll('.letter');
    letters.forEach((letter, index) => {
        letter.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Efecto de escaneo en el título
    const title = document.getElementById('main-title');
    title.addEventListener('mouseenter', () => {
        title.style.textShadow = '0 0 20px #ff00ff, 0 0 30px #ff00ff, 0 0 40px #ff00ff';
    });
    
    title.addEventListener('mouseleave', () => {
        title.style.textShadow = '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 30px #00f3ff';
    });
}

// ========== SISTEMA DE MENÚ ==========

function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover activo de todos
            menuItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Activar el seleccionado
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Efecto de sonido (simulado)
            playMenuSound();
            
            // Añadir al feed
            addToFeed(`Switched to ${item.querySelector('span').textContent}`);
        });
    });
}

// ========== SISTEMA DE INFORMACIÓN ==========

async function initSystemInfo() {
    updateClock();
    setInterval(updateClock, 1000);
    
    updateUptime();
    setInterval(updateUptime, 1000);
    
    updateCPUUsage();
    setInterval(updateCPUUsage, 5000);
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('system-clock').textContent = timeString;
}

function updateUptime() {
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('server-uptime').textContent = uptimeString;
}

function updateCPUUsage() {
    // Simulación de uso de CPU
    const usage = Math.floor(Math.random() * 40) + 10;
    document.getElementById('cpu-load').textContent = `${usage}%`;
}

// ========== MONITOREO DEL SERVIDOR ==========

async function checkServerStatus() {
    try {
        const start = Date.now();
        const response = await fetch(`${API_BASE_URL}/api/estado`);
        const end = Date.now();
        const responseTime = end - start;
        
        if (response.ok) {
            const data = await response.json();
            
            document.getElementById('api-status').textContent = 'ONLINE';
            document.getElementById('api-status').className = 'status-value active';
            document.getElementById('env-info').textContent = data.entorno.toUpperCase();
            document.getElementById('server-port').textContent = data.port || '3000';
            document.getElementById('server-host').textContent = window.location.hostname;
            
            updateChartData('responseTime', responseTime);
            updateRequestCount();
            
            return true;
        }
    } catch (error) {
        document.getElementById('api-status').textContent = 'OFFLINE';
        document.getElementById('api-status').className = 'status-value';
        document.getElementById('env-info').textContent = 'ERROR';
        
        addToFeed('Server connection failed', 'error');
        return false;
    }
}

// ========== SISTEMA DE DATOS ==========

async function loadInitialData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/datos`);
        if (response.ok) {
            const data = await response.json();
            updateDataTable(data);
            addToFeed(`Loaded ${data.length} records from database`);
            return data;
        }
    } catch (error) {
        console.error('Error loading data:', error);
        addToFeed('Failed to load data', 'error');
        return [];
    }
}

function updateDataTable(data) {
    const tableBody = document.getElementById('data-table');
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nombre || 'Unnamed'}</td>
            <td><span class="status-badge ${item.activo ? 'active' : 'inactive'}">${item.activo ? 'ACTIVE' : 'INACTIVE'}</span></td>
            <td>${formatDate(item.fechaCreacion)}</td>
            <td>
                <button class="cyber-btn small" onclick="viewData(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="cyber-btn small warning" onclick="editData(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="cyber-btn small danger" onclick="deleteData(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ========== SISTEMA DE GRÁFICOS ==========

function initCharts() {
    // Gráfico de requests
    const requestsCtx = document.getElementById('requestsChart').getContext('2d');
    charts.requests = new Chart(requestsCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 20}, (_, i) => i + 1),
            datasets: [{
                label: 'Requests per Second',
                data: Array(20).fill(0),
                borderColor: '#00f3ff',
                backgroundColor: 'rgba(0, 243, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#00f3ff' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#00f3ff' }
                }
            }
        }
    });
    
    // Gráfico de tiempos de respuesta
    const responseCtx = document.getElementById('responseTimeChart').getContext('2d');
    charts.responseTime = new Chart(responseCtx, {
        type: 'bar',
        data: {
            labels: ['<50ms', '50-100ms', '100-200ms', '200-500ms', '>500ms'],
            datasets: [{
                label: 'Response Times',
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    '#00ff9d',
                    '#00f3ff',
                    '#ffd300',
                    '#ff6b00',
                    '#ff00ff'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#00f3ff' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#00f3ff' }
                }
            }
        }
    });
}

function updateChartData(chartName, value) {
    if (charts[chartName]) {
        const chart = charts[chartName];
        
        if (chartName === 'requests') {
            chart.data.datasets[0].data.push(value);
            if (chart.data.datasets[0].data.length > 20) {
                chart.data.datasets[0].data.shift();
            }
        }
        
        chart.update();
    }
}

// ========== SISTEMA DE FEED ==========

function addToFeed(message, type = 'info') {
    const feed = document.getElementById('data-feed');
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    
    const feedItem = document.createElement('div');
    feedItem.className = `feed-item ${type}`;
    
    let icon = '📝';
    if (type === 'error') icon = '❌';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    
    feedItem.innerHTML = `
        <span class="feed-time">[${timeString}]</span>
        <span class="feed-icon">${icon}</span>
        <span class="feed-message">${message}</span>
    `;
    
    feed.prepend(feedItem);
    
    // Limitar a 50 mensajes
    if (feed.children.length > 50) {
        feed.removeChild(feed.lastChild);
    }
}

// ========== API EXPLORER ==========

async function sendCustomRequest() {
    const method = document.querySelector('.method-btn.active').getAttribute('data-method');
    const endpoint = document.getElementById('endpoint-path').value;
    const body = document.getElementById('request-body').value;
    
    const startTime = Date.now();
    
    addToFeed(`Sending ${method} request to /api/${endpoint}`);
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
        try {
            options.body = JSON.stringify(JSON.parse(body));
        } catch (e) {
            addToFeed('Invalid JSON in request body', 'error');
            return;
        }
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, options);
        const responseTime = Date.now() - startTime;
        const data = await response.json();
        
        // Actualizar UI
        document.getElementById('response-status').textContent = `${response.status} ${response.statusText}`;
        document.getElementById('response-status').style.backgroundColor = 
            response.ok ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 0, 255, 0.2)';
        
        document.getElementById('response-time').textContent = `${responseTime}ms`;
        document.getElementById('response-content').textContent = JSON.stringify(data, null, 2);
        
        // Actualizar estadísticas
        updateRequestCount();
        updateChartData('requests', 1);
        updateResponseTimeStats(responseTime);
        
        addToFeed(`${method} /api/${endpoint} - ${response.status} (${responseTime}ms)`);
        
    } catch (error) {
        addToFeed(`Request failed: ${error.message}`, 'error');
        document.getElementById('response-status').textContent = 'ERROR';
        document.getElementById('response-content').textContent = error.toString();
    }
}

function updateRequestCount() {
    requestCount++;
    document.getElementById('request-count').textContent = requestCount;
    document.getElementById('total-requests').textContent = requestCount;
}

function updateResponseTimeStats(responseTime) {
    const avgEl = document.getElementById('avg-response');
    const currentAvg = parseFloat(avgEl.textContent) || 0;
    const newAvg = Math.round((currentAvg + responseTime) / 2);
    avgEl.textContent = `${newAvg}ms`;
}

// ========== TERMINAL ==========

function initTerminal() {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            if (command) {
                executeTerminalCommand(command);
                terminalHistory.push(command);
                terminalIndex = terminalHistory.length;
                terminalInput.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            if (terminalHistory.length > 0) {
                terminalIndex = Math.max(terminalIndex - 1, 0);
                terminalInput.value = terminalHistory[terminalIndex] || '';
            }
        } else if (e.key === 'ArrowDown') {
            if (terminalHistory.length > 0) {
                terminalIndex = Math.min(terminalIndex + 1, terminalHistory.length);
                terminalInput.value = terminalHistory[terminalIndex] || '';
            }
        }
    });
    
    // Comandos iniciales
    addTerminalLine('Type "help" for available commands');
    addTerminalLine('System ready');
}

function executeTerminalCommand(command) {
    addTerminalLine(`$ ${command}`);
    
    const cmd = command.toLowerCase().split(' ')[0];
    const args = command.split(' ').slice(1);
    
    switch(cmd) {
        case 'help':
            showTerminalHelp();
            break;
        case 'status':
            checkServerStatus().then(status => {
                addTerminalLine(status ? 'Server: ONLINE' : 'Server: OFFLINE');
            });
            break;
        case 'clear':
            clearTerminal();
            break;
        case 'ls':
        case 'dir':
            addTerminalLine('api/');
            addTerminalLine('data/');
            addTerminalLine('logs/');
            addTerminalLine('system/');
            break;
        case 'time':
            addTerminalLine(`System time: ${new Date().toLocaleString()}`);
            addTerminalLine(`Uptime: ${document.getElementById('server-uptime').textContent}`);
            break;
        case 'echo':
            addTerminalLine(args.join(' '));
            break;
        case 'api':
            if (args[0] === 'test') {
                testAllEndpoints();
                addTerminalLine('Testing all API endpoints...');
            }
            break;
        default:
            addTerminalLine(`Command not found: ${cmd}`);
            addTerminalLine('Type "help" for available commands');
    }
}

function showTerminalHelp() {
    addTerminalLine('Available commands:');
    addTerminalLine('  help          - Show this help message');
    addTerminalLine('  status        - Check server status');
    addTerminalLine('  clear         - Clear terminal');
    addTerminalLine('  ls/dir        - List directories');
    addTerminalLine('  time          - Show system time and uptime');
    addTerminalLine('  echo [text]   - Echo text');
    addTerminalLine('  api test      - Test all API endpoints');
}

function addTerminalLine(text) {
    const output = document.getElementById('terminal-output');
    const line = document.createElement('div');
    line.className = 'term-line';
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearTerminal() {
    document.getElementById('terminal-output').innerHTML = '';
    addTerminalLine('Terminal cleared');
    addTerminalLine('Type "help" for available commands');
}

function copyTerminal() {
    const text = document.getElementById('terminal-output').textContent;
    navigator.clipboard.writeText(text).then(() => {
        addTerminalLine('Terminal content copied to clipboard');
    });
}

// ========== FUNCIONES DE ACCIÓN ==========

async function testAllEndpoints() {
    addToFeed('Starting comprehensive API tests...');
    
    const endpoints = [
        { method: 'GET', path: '/datos' },
        { method: 'GET', path: '/estado' },
        { method: 'GET', path: '/saludo' }
    ];
    
    for (const endpoint of endpoints) {
        await new Promise(resolve => setTimeout(resolve, 500));
        document.getElementById('endpoint-path').value = endpoint.path.replace('/', '');
        await sendCustomRequest();
    }
    
    addToFeed('API testing completed', 'success');
}

function refreshData() {
    addToFeed('Refreshing data...');
    loadInitialData();
    checkServerStatus();
}

function clearLogs() {
    document.getElementById('data-feed').innerHTML = '';
    addToFeed('Logs cleared');
}

function restartSimulation() {
    if (confirm('Are you sure you want to restart the simulation?')) {
        addToFeed('Restarting system simulation...', 'warning');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

function createDataModal() {
    // Implementar modal de creación de datos
    addToFeed('Opening data creation modal...');
}

function exportData() {
    addToFeed('Exporting data...');
    // Implementar exportación
}

function clearAllData() {
    if (confirm('WARNING: This will delete all data. Are you sure?')) {
        addToFeed('Clearing all data...', 'warning');
        // Implementar limpieza
    }
}

// ========== FUNCIONES UTILITARIAS ==========

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function playMenuSound() {
    // Efecto de sonido simple
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function startLiveUpdates() {
    // Actualizaciones en tiempo real
    setInterval(async () => {
        await checkServerStatus();
        if (Math.random() > 0.7) {
            updateCPUUsage();
        }
    }, 10000);
    
    // Simular actividad
    setInterval(() => {
        if (Math.random() > 0.5) {
            const activities = [
                'Background sync completed',
                'Memory optimized',
                'Cache updated',
                'Security check passed'
            ];
            addToFeed(activities[Math.floor(Math.random() * activities.length)]);
        }
    }, 15000);
}

// ========== FUNCIONES DE DATOS ==========

async function viewData(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/datos/${id}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('response-content').textContent = JSON.stringify(data, null, 2);
            addToFeed(`Viewing data ID: ${id}`);
        }
    } catch (error) {
        addToFeed(`Failed to view data ${id}`, 'error');
    }
}

async function editData(id) {
    addToFeed(`Editing data ID: ${id}`);
    // Implementar edición
}

async function deleteData(id) {
    if (confirm(`Delete data ID: ${id}?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/datos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                addToFeed(`Deleted data ID: ${id}`, 'success');
                loadInitialData();
            }
        } catch (error) {
            addToFeed(`Failed to delete data ${id}`, 'error');
        }
    }
}

// Inicializar cuando la página cargue
window.onload = function() {
    document.body.classList.add('loaded');
};