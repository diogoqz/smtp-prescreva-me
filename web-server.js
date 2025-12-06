require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const WEB_PORT = process.env.WEB_PORT || 3000;
const EMAILS_DIR = path.join(__dirname, 'emails');
const DOMAIN = process.env.DOMAIN || 'prescreva.me';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Criar diretório de emails se não existir
if (!fs.existsSync(EMAILS_DIR)) {
  fs.mkdirSync(EMAILS_DIR, { recursive: true });
}

/**
 * Parsear email RFC 2822
 */
function parseEmail(raw) {
  const lines = raw.split('\n');
  const headers = {};
  let body = '';
  let isBody = false;
  
  for (const line of lines) {
    if (isBody) {
      body += line + '\n';
    } else if (line.trim() === '') {
      isBody = true;
    } else {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const key = match[1].toLowerCase();
        headers[key] = match[2].trim();
      }
    }
  }
  
  return { headers, body: body.trim() };
}

/**
 * Obter todos os emails de um endereço
 */
function getEmailsForAddress(emailAddress) {
  try {
    // Verificar se diretório existe
    if (!fs.existsSync(EMAILS_DIR)) {
      console.log('📁 Diretório emails não existe ainda, criando...');
      fs.mkdirSync(EMAILS_DIR, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(EMAILS_DIR);
    const emails = [];
    
    for (const file of files) {
      if (!file.endsWith('.eml')) continue;
      
      try {
        const filepath = path.join(EMAILS_DIR, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        const data = JSON.parse(content);
        
        // Verificar se o email é para o endereço solicitado
        const isForThisAddress = data.to && data.to.some(addr => 
          addr.toLowerCase().includes(emailAddress.toLowerCase())
        );
        
        if (isForThisAddress) {
          const parsed = parseEmail(data.raw);
          emails.push({
            id: file,
            timestamp: data.timestamp,
            from: data.from || parsed.headers.from,
            to: data.to,
            subject: parsed.headers.subject || '(sem assunto)',
            body: parsed.body,
            raw: data.raw,
            remoteAddress: data.remoteAddress
          });
        }
      } catch (fileError) {
        console.error(`Erro ao processar arquivo ${file}:`, fileError.message);
        continue; // Pular este arquivo e continuar com os outros
      }
    }
    
    // Ordenar por data (mais recente primeiro)
    emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return emails;
  } catch (error) {
    console.error('Erro ao ler emails:', error);
    return [];
  }
}

/**
 * Obter estatísticas gerais
 */
function getStats() {
  try {
    // Verificar se diretório existe
    if (!fs.existsSync(EMAILS_DIR)) {
      return {
        totalEmails: 0,
        oldestEmail: null,
        newestEmail: null
      };
    }

    const files = fs.readdirSync(EMAILS_DIR);
    const emailFiles = files.filter(f => f.endsWith('.eml'));
    
    return {
      totalEmails: emailFiles.length,
      oldestEmail: emailFiles.length > 0 ? emailFiles[emailFiles.length - 1] : null,
      newestEmail: emailFiles.length > 0 ? emailFiles[0] : null
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalEmails: 0,
      oldestEmail: null,
      newestEmail: null
    };
  }
}

// ==================== ROTAS API ====================

/**
 * GET / - Página principal
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * POST /api/create-inbox
 * Criar uma inbox temporária
 */
app.post('/api/create-inbox', (req, res) => {
  const { username } = req.body;
  
  if (!username || !/^[a-z0-9._-]+$/i.test(username)) {
    return res.status(400).json({
      error: 'Nome de usuário inválido. Use apenas letras, números, pontos, hífens e underscores.'
    });
  }
  
  const email = `${username}@${DOMAIN}`;
  
  res.json({
    success: true,
    email,
    message: 'Inbox criada com sucesso! Aguardando emails...'
  });
});

/**
 * GET /api/emails/:email
 * Obter emails de um endereço
 */
app.get('/api/emails/:email', (req, res) => {
  try {
    const email = req.params.email;
    console.log(`📬 Buscando emails para: ${email}`);
    const emails = getEmailsForAddress(email);
    
    res.json({
      email,
      count: emails.length,
      emails
    });
  } catch (error) {
    console.error('❌ Erro na rota /api/emails:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar emails',
      message: error.message 
    });
  }
});

/**
 * GET /api/email/:id
 * Obter detalhes de um email específico
 */
app.get('/api/email/:id', (req, res) => {
  const emailId = req.params.id;
  const filepath = path.join(EMAILS_DIR, emailId);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Email não encontrado' });
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content);
    const parsed = parseEmail(data.raw);
    
    res.json({
      id: emailId,
      timestamp: data.timestamp,
      from: data.from || parsed.headers.from,
      to: data.to,
      subject: parsed.headers.subject || '(sem assunto)',
      headers: parsed.headers,
      body: parsed.body,
      raw: data.raw
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler email' });
  }
});

/**
 * DELETE /api/email/:id
 * Deletar um email
 */
app.delete('/api/email/:id', (req, res) => {
  const emailId = req.params.id;
  const filepath = path.join(EMAILS_DIR, emailId);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Email não encontrado' });
  }
  
  try {
    fs.unlinkSync(filepath);
    res.json({ success: true, message: 'Email deletado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar email' });
  }
});

/**
 * GET /api/stats
 * Estatísticas gerais
 */
app.get('/api/stats', (req, res) => {
  res.json(getStats());
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro ao processar requisição'
  });
});

// 404 - Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Iniciar servidor HTTP
const server = app.listen(WEB_PORT, '0.0.0.0', () => {
  console.log(`\n🌐 Servidor Web TempMail iniciado!`);
  console.log(`   URL: http://localhost:${WEB_PORT}`);
  console.log(`   Domínio: ${DOMAIN}`);
  console.log(`═══════════════════════════════════════════════\n`);
});

// WebSocket para atualizações em tempo real
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 Cliente WebSocket conectado');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'subscribe' && data.email) {
        ws.email = data.email;
        console.log(`📧 Cliente inscrito para: ${data.email}`);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Cliente WebSocket desconectado');
  });
});

// Monitorar novos emails
let lastEmailCount = 0;
setInterval(() => {
  try {
    // Verificar se diretório existe antes de ler
    if (!fs.existsSync(EMAILS_DIR)) {
      return;
    }

    const files = fs.readdirSync(EMAILS_DIR);
    const emailFiles = files.filter(f => f.endsWith('.eml'));
    
    if (emailFiles.length > lastEmailCount) {
      // Novo email detectado, notificar clientes WebSocket
      const newEmails = emailFiles.slice(lastEmailCount);
      
      newEmails.forEach(file => {
        const filepath = path.join(EMAILS_DIR, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        const data = JSON.parse(content);
        
        // Notificar clientes inscritos
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.email) {
            const isForThisClient = data.to && data.to.some(addr =>
              addr.toLowerCase().includes(client.email.toLowerCase())
            );
            
            if (isForThisClient) {
              const parsed = parseEmail(data.raw);
              client.send(JSON.stringify({
                type: 'new-email',
                email: {
                  id: file,
                  timestamp: data.timestamp,
                  from: data.from || parsed.headers.from,
                  subject: parsed.headers.subject || '(sem assunto)',
                  body: parsed.body
                }
              }));
            }
          }
        });
      });
      
      lastEmailCount = emailFiles.length;
    }
  } catch (error) {
    // Ignorar erros
  }
}, 2000); // Verificar a cada 2 segundos

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Encerrando servidor web...');
  server.close(() => {
    console.log('👋 Servidor web encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Encerrando servidor web...');
  server.close(() => {
    console.log('👋 Servidor web encerrado');
    process.exit(0);
  });
});

