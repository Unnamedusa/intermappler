// security-check.js - Verifica la configuración de seguridad
const https = require('https');
const os = require('os');

console.log('🔐 Verificación de Seguridad - INTERMAPPLER v8.0\n');

// Obtener IPs de la máquina
const networkInterfaces = os.networkInterfaces();
let localIPs = [];

Object.keys(networkInterfaces).forEach(interfaceName => {
  networkInterfaces[interfaceName].forEach(interface => {
    if (interface.family === 'IPv4' && !interface.internal) {
      localIPs.push(interface.address);
    }
  });
});

console.log('📡 IPs locales detectadas:');
localIPs.forEach(ip => console.log(`  • ${ip}`));

// Obtener IP pública
console.log('\n🌍 Obteniendo IP pública...');
https.get('https://api.ipify.org?format=json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => data += chunk);
  resp.on('end', () => {
    try {
      const publicIP = JSON.parse(data).ip;
      console.log(`✅ IP pública: ${publicIP}`);
      
      console.log('\n📋 Configuración recomendada:');
      console.log(`\n1. En server.js, cambia:`);
      console.log(`   const YOUR_IP_ADDRESS = 'TU_IP_PUBLICA_AQUI';`);
      console.log(`   Por:`);
      console.log(`   const YOUR_IP_ADDRESS = '${publicIP}';`);
      
      console.log(`\n2. Agrega tus IPs locales si las necesitas:`);
      localIPs.forEach(ip => {
        console.log(`   ALLOWED_IPS.add('${ip}');`);
      });
      
      console.log(`\n3. Para acceder:`);
      console.log(`   Local:    http://localhost:3000`);
      console.log(`   Por IP:   http://${publicIP}:3000`);
      console.log(`   Estado:   http://localhost:3000/status`);
      
      console.log(`\n⚠️  IMPORTANTE:`);
      console.log(`   - Si tu IP pública cambia (IP dinámica), actualízala en server.js`);
      console.log(`   - Usa servicios como No-IP si necesitas IP fija`);
      console.log(`   - Para desarrollo local, mantén localhost en ALLOWED_IPS`);
      
    } catch (error) {
      console.log('❌ No se pudo obtener IP pública');
    }
  });
}).on('error', () => {
  console.log('❌ Error de conexión al obtener IP pública');
});

console.log('\n🔧 Comandos útiles:');
console.log('   npm run myip        - Ver tu IP pública actual');
console.log('   npm run setup       - Configurar automáticamente');
console.log('   npm start           - Iniciar servidor');
console.log('   npm run dev         - Modo desarrollo');