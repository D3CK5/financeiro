import { defineConfig } from 'vite';
import os from 'os';

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

export default defineConfig({
  server: {
    host: '0.0.0.0', // Escuta em todos os IPs
    port: 3000,      // Porta padrão
    strictPort: true, // Usar apenas esta porta
    open: true,      // Abrir automaticamente no navegador
    cors: true,      // Habilitar CORS
    
    // Configuração personalizada para abrir no IP local
    onListening() {
      const localIP = getLocalIPAddress();
      console.log(`
🌐 Servidor disponível em:
   - Local:      http://localhost:3000
   - Rede Local: http://${localIP}:3000
`);
    }
  }
});
