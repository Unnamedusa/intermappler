const https = require('https');

console.log('🔍 Detecting your public IP address...\n');

// Método 1: Usar ipify
https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const ip = JSON.parse(data).ip;
      console.log('✅ Your public IP address is:', ip);
      console.log('\n📝 Add this to your .env file:');
      console.log(`ALLOWED_IPS=${ip}`);
      console.log('\n🌐 You can access from:');
      console.log(`   http://localhost:3000`);
      console.log(`   http://${ip}:3000`);
    } catch (e) {
      console.log('❌ Could not detect IP via ipify');
    }
  });
}).on('error', () => {
  console.log('❌ Could not detect IP (network error)');
});

// Método alternativo
setTimeout(() => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  console.log('\n🔧 Local network IPs:');
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   • ${name}: ${net.address}`);
      }
    }
  }
}, 1000);