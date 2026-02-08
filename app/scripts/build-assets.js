import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildAssets() {
  const srcDir = path.join(__dirname, '../web');
  const destDir = path.join(__dirname, '../public');
  
  // Crear directorio público si no existe
  await fs.mkdir(destDir, { recursive: true });
  
  // Copiar archivos estáticos
  const assetsToCopy = [
    { src: 'login/index.html', dest: 'index.html' },
    { src: 'login/login.js', dest: 'js/login.min.js' },
    { src: 'login/styles.css', dest: 'css/styles.min.css' },
    { src: 'assets/css/global.css', dest: 'css/global.min.css' },
    { src: 'assets/favicon.ico', dest: 'favicon.ico' }
  ];
  
  for (const asset of assetsToCopy) {
    const srcPath = path.join(srcDir, asset.src);
    const destPath = path.join(destDir, asset.dest);
    
    // Crear directorio destino si no existe
    const destDirPath = path.dirname(destPath);
    await fs.mkdir(destDirPath, { recursive: true });
    
    try {
      const content = await fs.readFile(srcPath, 'utf8');
      await fs.writeFile(destPath, content);
      console.log(`✓ Copiado: ${asset.src} -> ${asset.dest}`);
    } catch (error) {
      console.error(`✗ Error copiando ${asset.src}:`, error.message);
    }
  }
  
  // Crear archivo de configuración
  const config = {
    version: '3.14.0',
    buildDate: new Date().toISOString(),
    features: {
      particles: true,
      gradient: true,
      animations: true,
      darkMode: true
    }
  };
  
  await fs.writeFile(
    path.join(destDir, 'config.json'),
    JSON.stringify(config, null, 2)
  );
  
  console.log('✅ Assets construidos correctamente');
}

buildAssets().catch(console.error);