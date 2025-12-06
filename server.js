require('dotenv').config();
const SMTPServer = require('smtp-server').SMTPServer;
const fs = require('fs');
const path = require('path');

// Configurações do servidor
const PORTS = process.env.SMTP_PORTS 
  ? process.env.SMTP_PORTS.split(',').map(p => parseInt(p.trim()))
  : [25, 587, 465, 2525];
const HOST = process.env.HOST || '0.0.0.0';
const ALLOW_INVALID_AUTH = process.env.ALLOW_INVALID_AUTH === 'true';
const ALLOW_INSECURE_AUTH = process.env.ALLOW_INSECURE_AUTH === 'true';
const DOMAIN = process.env.DOMAIN || 'prescreva.me';
const SMTP_SUBDOMAIN = process.env.SMTP_SUBDOMAIN || 'mail';

// Diretório para armazenar emails recebidos
const EMAILS_DIR = path.join(__dirname, 'emails');

// Criar diretório se não existir
if (!fs.existsSync(EMAILS_DIR)) {
  fs.mkdirSync(EMAILS_DIR, { recursive: true });
}

// Função para salvar email recebido
function saveEmail(envelope, message) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const from = envelope.from || 'unknown';
    const to = (envelope.to && envelope.to[0]) || 'unknown';
    const filename = `${timestamp}_${from}_to_${to}.eml`;
    const filepath = path.join(EMAILS_DIR, filename);

    const chunks = [];
    message.on('data', chunk => chunks.push(chunk));
    message.on('end', () => {
      const emailContent = Buffer.concat(chunks);
      const emailData = {
        timestamp: new Date().toISOString(),
        from: envelope.from,
        to: envelope.to,
        remoteAddress: envelope.remoteAddress,
        hostname: envelope.hostNameAppearsAs,
        raw: emailContent.toString('utf-8')
      };
      
      fs.writeFile(filepath, JSON.stringify(emailData, null, 2), (err) => {
        if (err) {
          console.error('❌ Erro ao salvar email:', err);
          reject(err);
        } else {
          console.log(`📧 Email salvo: ${filename}`);
          resolve();
        }
      });
    });
    message.on('error', reject);
  });
}

// Configuração base do servidor SMTP
const serverConfig = {
  // Nome do servidor
  name: `${SMTP_SUBDOMAIN}.${DOMAIN}`,
  
  // Banner
  banner: `Bem-vindo ao ${SMTP_SUBDOMAIN}.${DOMAIN} SMTP Server`,
  
  // Métodos de autenticação
  authMethods: ['PLAIN', 'LOGIN'],
  
  // Opções de autenticação
  onAuth(auth, session, callback) {
    if (ALLOW_INVALID_AUTH) {
      // Aceitar qualquer autenticação para desenvolvimento
      console.log(`🔓 Autenticação aceita (dev mode): ${auth.username}`);
      return callback(null, { user: auth.username || 'user' });
    }
    
    // Verificar credenciais
    const username = process.env.SMTP_USERNAME || 'admin';
    const password = process.env.SMTP_PASSWORD || 'password';
    
    if (auth.username === username && auth.password === password) {
      console.log(`✅ Autenticação bem-sucedida: ${auth.username}`);
      callback(null, { user: auth.username });
    } else {
      console.log(`❌ Autenticação falhou: ${auth.username}`);
      callback(new Error('Credenciais inválidas'));
    }
  },
  
  // Processar mensagem recebida
  onData(stream, session, callback) {
    console.log(`📨 Recebendo email de ${session.envelope.from} para ${session.envelope.to}`);
    saveEmail(session.envelope, stream)
      .then(() => {
        callback();
      })
      .catch((err) => {
        callback(err);
      });
  },
  
  // Verificar remetente
  onMailFrom(address, session, callback) {
    console.log(`📤 MAIL FROM: ${address.address}`);
    callback();
  },
  
  // Verificar destinatário
  onRcptTo(address, session, callback) {
    console.log(`📥 RCPT TO: ${address.address}`);
    // Aceitar qualquer destinatário
    callback();
  },
  
  // Permitir autenticação insegura (para desenvolvimento)
  allowInsecureAuth: ALLOW_INSECURE_AUTH,
  
  // Desabilitar STARTTLS (pode ser habilitado com certificados)
  disabledCommands: process.env.DISABLE_STARTTLS === 'true' ? ['STARTTLS'] : [],
  
  // Logger
  logger: process.env.NODE_ENV === 'development',
  
  // Tamanho máximo da mensagem (10MB)
  size: 10 * 1024 * 1024,
  
  // Timeout de conexão
  closeTimeout: 30000,
};

// Array para armazenar servidores criados
const servers = [];

// Criar servidor para cada porta
PORTS.forEach(port => {
  try {
    const server = new SMTPServer(serverConfig);
    
    // Tratamento de erros
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${port} já está em uso`);
      } else if (err.code === 'EACCES') {
        console.error(`❌ Sem permissão para usar porta ${port} (portas < 1024 requerem privilégios root)`);
      } else {
        console.error(`❌ Erro no servidor SMTP (porta ${port}):`, err.message);
      }
    });
    
    // Iniciar servidor
    server.listen(port, HOST, () => {
      console.log(`✅ Servidor SMTP iniciado em ${HOST}:${port}`);
    });
    
    servers.push({ server, port });
  } catch (error) {
    console.error(`❌ Erro ao criar servidor na porta ${port}:`, error.message);
  }
});

// Mensagem inicial
if (servers.length > 0) {
  console.log('\n═══════════════════════════════════════════════');
  console.log('🚀 Servidor SMTP em execução');
  console.log('═══════════════════════════════════════════════');
  console.log(`📍 Host: ${HOST}`);
  console.log(`🌐 Domínio: ${SMTP_SUBDOMAIN}.${DOMAIN}`);
  console.log(`📮 Portas ativas: ${servers.map(s => s.port).join(', ')}`);
  console.log(`📁 Emails salvos em: ${EMAILS_DIR}`);
  console.log(`🔐 Autenticação: ${ALLOW_INVALID_AUTH ? 'Modo desenvolvimento (aceita todas)' : 'Validada'}`);
  console.log('═══════════════════════════════════════════════\n');
} else {
  console.error('\n❌ Nenhum servidor SMTP foi iniciado. Verifique as configurações.\n');
  process.exit(1);
}

// Graceful shutdown
function shutdown() {
  console.log('\n🛑 Encerrando servidores SMTP...');
  
  let closed = 0;
  servers.forEach(({ server, port }) => {
    server.close(() => {
      console.log(`✅ Servidor na porta ${port} encerrado`);
      closed++;
      
      if (closed === servers.length) {
        console.log('👋 Todos os servidores encerrados com sucesso\n');
        process.exit(0);
      }
    });
  });
  
  // Forçar saída após 10 segundos
  setTimeout(() => {
    console.log('⚠️  Forçando encerramento...');
    process.exit(0);
  }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
