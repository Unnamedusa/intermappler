const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para archivos estáticos
app.use(express.static('public'));

// Middleware para parsear JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mi Web en Railway</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 800px;
          text-align: center;
        }
        
        h1 {
          color: #333;
          margin-bottom: 20px;
          font-size: 2.5rem;
        }
        
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 1.1rem;
        }
        
        .status {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        
        .status-info {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .status-item {
          flex: 1;
          min-width: 200px;
        }
        
        .badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9rem;
          margin: 10px 0;
        }
        
        .endpoints {
          text-align: left;
          margin-top: 30px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
        }
        
        code {
          background: #2d3748;
          color: #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        
        .footer {
          margin-top: 30px;
          color: #94a3b8;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 ¡Hola Railway!</h1>
        <p>Tu aplicación Node.js está funcionando correctamente en Railway.</p>
        
        <div class="badge">STATUS: ONLINE</div>
        
        <div class="status">
          <h3>Información del Servidor</h3>
          <div class="status-info">
            <div class="status-item">
              <strong>Entorno:</strong><br>
              <code>${process.env.NODE_ENV || 'development'}</code>
            </div>
            <div class="status-item">
              <strong>Puerto:</strong><br>
              <code>${PORT}</code>
            </div>
            <div class="status-item">
              <strong>Plataforma:</strong><br>
              <code>${process.platform}</code>
            </div>
          </div>
        </div>
        
        <div class="endpoints">
          <h3>📌 Endpoints disponibles:</h3>
          <ul>
            <li><code>GET /</code> - Esta página (HTML)</li>
            <li><code>GET /api/status</code> - Estado de la API (JSON)</li>
            <li><code>GET /api/time</code> - Hora del servidor (JSON)</li>
            <li><code>POST /api/echo</code> - Echo de datos (JSON)</li>
          </ul>
          <p style="margin-top: 10px;">
            <small>Coloca tus archivos estáticos en la carpeta <code>/public</code></small>
          </p>
        </div>
        
        <div class="footer">
          <p>✨ Desplegado automáticamente en Railway</p>
        </div>
      </div>
      
      <script>
        // Actualizar hora local
        function updateLocalTime() {
          const now = new Date();
          document.getElementById('localTime').textContent = 
            now.toLocaleTimeString('es-ES');
        }
        
        setInterval(updateLocalTime, 1000);
        updateLocalTime();
      </script>
    </body>
    </html>
  `);
});

// Ruta de estado de la API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform
  });
});

// Ruta para obtener la hora del servidor
app.get('/api/time', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: Date.now()
  });
});

// Ruta de echo para pruebas POST
app.post('/api/echo', (req, res) => {
  res.json({
    received: req.body,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Ruta de salud para Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
});