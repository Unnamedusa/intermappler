const express = require('express');
const cors = require('cors');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Datos de ejemplo (simula una base de datos JSON)
let datos = [
  { id: 1, nombre: 'Ejemplo 1', activo: true },
  { id: 2, nombre: 'Ejemplo 2', activo: false },
  { id: 3, nombre: 'Ejemplo 3', activo: true }
];

// Ruta de inicio
app.get('/', (req, res) => {
  res.json({
    mensaje: '¡Servidor JSON funcionando!',
    endpoints: {
      todosLosDatos: '/api/datos',
      datoPorId: '/api/datos/:id',
      crearDato: 'POST /api/datos',
      actualizarDato: 'PUT /api/datos/:id',
      eliminarDato: 'DELETE /api/datos/:id',
      saludar: '/api/saludo',
      estado: '/api/estado'
    }
  });
});

// Obtener todos los datos
app.get('/api/datos', (req, res) => {
  res.json(datos);
});

// Obtener un dato por ID
app.get('/api/datos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const dato = datos.find(item => item.id === id);
  
  if (dato) {
    res.json(dato);
  } else {
    res.status(404).json({ error: 'Dato no encontrado' });
  }
});

// Crear nuevo dato
app.post('/api/datos', (req, res) => {
  const nuevoDato = {
    id: datos.length > 0 ? Math.max(...datos.map(d => d.id)) + 1 : 1,
    ...req.body,
    fechaCreacion: new Date().toISOString()
  };
  
  datos.push(nuevoDato);
  res.status(201).json(nuevoDato);
});

// Actualizar dato existente
app.put('/api/datos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = datos.findIndex(item => item.id === id);
  
  if (index !== -1) {
    datos[index] = { 
      ...datos[index], 
      ...req.body,
      fechaActualizacion: new Date().toISOString()
    };
    res.json(datos[index]);
  } else {
    res.status(404).json({ error: 'Dato no encontrado' });
  }
});

// Eliminar dato
app.delete('/api/datos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = datos.findIndex(item => item.id === id);
  
  if (index !== -1) {
    const eliminado = datos.splice(index, 1);
    res.json({ mensaje: 'Dato eliminado', dato: eliminado[0] });
  } else {
    res.status(404).json({ error: 'Dato no encontrado' });
  }
});

// Endpoint de saludo
app.get('/api/saludo', (req, res) => {
  const nombre = req.query.nombre || 'Visitante';
  res.json({ mensaje: `¡Hola ${nombre}! Bienvenido al servidor JSON.` });
});

// Endpoint de estado
app.get('/api/estado', (req, res) => {
  res.json({
    estado: 'activo',
    timestamp: new Date().toISOString(),
    datosTotales: datos.length,
    entorno: process.env.NODE_ENV || 'development'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    sugerencia: 'Visita / para ver todos los endpoints disponibles'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor JSON ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Puerto: ${PORT}`);
  console.log(`🕐 Iniciado: ${new Date().toLocaleString()}`);
});

// Manejo de errores global
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});