import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function buildOnChange() {
  console.log('🔄 Reconstruyendo assets...');
  try {
    await execAsync('node scripts/build-assets.js');
    console.log('✅ Assets actualizados');
  } catch (error) {
    console.error('❌ Error reconstruyendo:', error.message);
  }
}

// Observar cambios en los archivos frontend
const watcher = chokidar.watch([
  'web/login/**/*',
  'web/assets/**/*'
], {
  ignored: /(^|[/\\])\../, // ignorar archivos ocultos
  persistent: true
});

watcher
  .on('add', buildOnChange)
  .on('change', buildOnChange)
  .on('unlink', buildOnChange);

console.log('👀 Observando cambios en archivos frontend...');
console.log('Presiona Ctrl+C para detener');