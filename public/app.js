// Estado da aplicação
let currentEmail = null;
let ws = null;
let refreshInterval = null;

// Conectar WebSocket
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('✅ WebSocket conectado');
    if (currentEmail) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        email: currentEmail
      }));
    }
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new-email') {
        showNotification('📬 Novo email recebido!');
        loadEmails(currentEmail);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  };
  
  ws.onclose = () => {
    console.log('❌ WebSocket desconectado. Reconectando...');
    setTimeout(connectWebSocket, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('Erro WebSocket:', error);
  };
}

// Criar inbox
async function createInbox() {
  const username = document.getElementById('username').value.trim();
  
  if (!username) {
    showNotification('❌ Digite um nome de usuário', 'error');
    return;
  }
  
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    showNotification('❌ Use apenas letras, números, pontos, hífens e underscores', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/create-inbox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentEmail = data.email;
      document.getElementById('currentEmail').textContent = currentEmail;
      document.getElementById('currentInbox').classList.add('active');
      document.getElementById('emailsSection').classList.add('active');
      
      showNotification('✅ Email criado com sucesso!');
      
      // Inscrever no WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'subscribe',
          email: currentEmail
        }));
      }
      
      // Carregar emails existentes
      loadEmails(currentEmail);
      
      // Atualizar a cada 5 segundos
      if (refreshInterval) clearInterval(refreshInterval);
      refreshInterval = setInterval(() => loadEmails(currentEmail), 5000);
    } else {
      showNotification('❌ ' + (data.error || 'Erro ao criar inbox'), 'error');
    }
  } catch (error) {
    showNotification('❌ Erro ao conectar com o servidor', 'error');
    console.error(error);
  }
}

// Carregar emails
async function loadEmails(email) {
  try {
    const response = await fetch(`/api/emails/${encodeURIComponent(email)}`);
    const data = await response.json();
    
    const emailCount = document.getElementById('emailCount');
    const emailList = document.getElementById('emailList');
    
    emailCount.textContent = data.count;
    
    if (data.count === 0) {
      emailList.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3>Aguardando emails...</h3>
          <p>Os emails enviados para <strong>${email}</strong> aparecerão aqui</p>
        </div>
      `;
    } else {
      emailList.innerHTML = `
        <div class="email-list">
          ${data.emails.map(email => `
            <div class="email-item" onclick="viewEmail('${email.id}')">
              <div class="email-item-header">
                <div class="email-from">${escapeHtml(email.from || 'Desconhecido')}</div>
                <div class="email-time">${formatDate(email.timestamp)}</div>
              </div>
              <div class="email-subject">${escapeHtml(email.subject)}</div>
              <div class="email-preview">${escapeHtml(email.body.substring(0, 100))}...</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (error) {
    console.error('Erro ao carregar emails:', error);
  }
}

// Ver detalhes do email
async function viewEmail(emailId) {
  try {
    const response = await fetch(`/api/email/${encodeURIComponent(emailId)}`);
    const email = await response.json();
    
    document.getElementById('detailSubject').textContent = email.subject;
    document.getElementById('detailFrom').textContent = email.from || 'Desconhecido';
    document.getElementById('detailTo').textContent = Array.isArray(email.to) ? email.to.join(', ') : email.to;
    document.getElementById('detailTime').textContent = formatDate(email.timestamp);
    document.getElementById('detailBody').textContent = email.body;
    
    document.getElementById('emailDetail').classList.add('active');
  } catch (error) {
    showNotification('❌ Erro ao carregar email', 'error');
    console.error(error);
  }
}

// Fechar detalhes do email
function closeEmailDetail() {
  document.getElementById('emailDetail').classList.remove('active');
}

// Copiar email
function copyEmail() {
  const email = document.getElementById('currentEmail').textContent;
  
  navigator.clipboard.writeText(email).then(() => {
    showNotification('✅ Email copiado para área de transferência!');
  }).catch(() => {
    // Fallback para navegadores antigos
    const textarea = document.createElement('textarea');
    textarea.value = email;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('✅ Email copiado para área de transferência!');
  });
}

// Mostrar notificação
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.background = type === 'success' ? '#4CAF50' : '#f44336';
  notification.classList.add('active');
  
  setTimeout(() => {
    notification.classList.remove('active');
  }, 3000);
}

// Formatar data
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Menos de 1 minuto
  if (diff < 60000) {
    return 'Agora mesmo';
  }
  
  // Menos de 1 hora
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  }
  
  // Menos de 24 horas
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  }
  
  // Mais de 24 horas
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Escapar HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Permitir Enter para criar inbox
document.getElementById('username').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    createInbox();
  }
});

// Fechar modal ao clicar fora
document.getElementById('emailDetail').addEventListener('click', (e) => {
  if (e.target.id === 'emailDetail') {
    closeEmailDetail();
  }
});

// Conectar WebSocket ao carregar
connectWebSocket();

console.log('🚀 TempMail carregado e pronto!');

