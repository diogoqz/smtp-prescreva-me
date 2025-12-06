/**
 * Script para iniciar o servidor SMTP e o servidor Web simultaneamente
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidores...\n');

// Iniciar servidor SMTP
const smtpServer = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Aguardar 2 segundos antes de iniciar o servidor web
setTimeout(() => {
  // Iniciar servidor Web
  const webServer = spawn('node', ['web-server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  webServer.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor web:', error);
  });

  webServer.on('exit', (code) => {
    console.log(`🛑 Servidor web encerrado com código ${code}`);
    process.exit(code);
  });
}, 2000);

smtpServer.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor SMTP:', error);
});

smtpServer.on('exit', (code) => {
  console.log(`🛑 Servidor SMTP encerrado com código ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidores...');
  smtpServer.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidores...');
  smtpServer.kill('SIGINT');
  process.exit(0);
});

