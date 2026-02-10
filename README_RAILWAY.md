# Despliegue en Railway - InterMappler Ultimate

## 🚀 Cambios Realizados

### 1. Corrección del Health Check
- **Problema**: El endpoint `/health` estaba siendo bloqueado por el rate limiter
- **Solución**: 
  - Movido el endpoint `/health` ANTES de los middlewares de rate limiting
  - Agregada excepción en el rate limiter para saltar el path `/health`
  - Aumentado el timeout del healthcheck de 30s a 60s

### 2. Configuración del Servidor
- El servidor ahora escucha en `0.0.0.0` (todas las interfaces)
- Puerto configurado desde variable de entorno `PORT` (Railway lo asigna automáticamente)

### 3. Variables de Entorno Necesarias

En Railway, configura las siguientes variables de entorno:

```
NODE_ENV=production
ALLOWED_ORIGINS=*
```

Opcional (si necesitas CORS específico):
```
ALLOWED_ORIGINS=https://tu-dominio.railway.app,https://otro-dominio.com
```

## 📋 Pasos para Desplegar

### Opción 1: Desde GitHub
1. Sube este proyecto a un repositorio de GitHub
2. En Railway, crea un nuevo proyecto
3. Conecta tu repositorio de GitHub
4. Railway detectará automáticamente el `railway.json`
5. El despliegue comenzará automáticamente

### Opción 2: Railway CLI
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up
```

## 🔍 Verificación del Health Check

Una vez desplegado, verifica que el health check funciona:

```bash
curl https://tu-app.railway.app/health
```

Deberías recibir:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2026-02-10T...",
  "uptime": 123.456
}
```

## 🛠️ Troubleshooting

### El healthcheck sigue fallando
1. Verifica los logs en Railway Dashboard
2. Asegúrate de que la variable `PORT` no esté configurada manualmente
3. Verifica que no hay errores en las dependencias

### Errores de CORS
1. Configura `ALLOWED_ORIGINS` con los dominios correctos
2. O usa `*` para permitir todos los orígenes (solo desarrollo)

### Rate Limiting
Si necesitas ajustar los límites:
- Edita los valores en `server.js` líneas 46-58
- El `/health` endpoint está excluido del rate limiting

## 📊 Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de CPU y memoria
- Estado del healthcheck
- Historial de deploys

## 🔐 Seguridad

El proyecto incluye:
- Helmet.js para headers de seguridad
- Rate limiting para prevenir abuso
- CORS configurable
- Sanitización contra XSS y NoSQL injection
- HPP para prevenir parameter pollution

## 📝 Notas Adicionales

- El healthcheck ahora tiene 60 segundos de timeout
- El servidor reiniciará automáticamente en caso de fallo (hasta 3 intentos)
- Los archivos estáticos se sirven desde `/public`
- La API está disponible en `/api/maps`
