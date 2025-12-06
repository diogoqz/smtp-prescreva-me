# 📧 TempMail - prescreva.me

Interface web moderna para gerenciar emails temporários descartáveis usando o servidor SMTP prescreva.me.

## ✨ Funcionalidades

- 🎨 **Interface moderna e responsiva**
- 📧 **Escolha seu próprio nome de email**
- 🔄 **Atualização em tempo real** (WebSocket)
- 📬 **Visualização de emails recebidos**
- 📋 **Copiar email com um clique**
- 🗑️ **Emails temporários e descartáveis**
- 🚀 **Zero configuração necessária**

## 🚀 Como Usar

### Opção 1: Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidores (SMTP + Web)
npm start

# Ou em modo desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

### Opção 2: Docker

```bash
# Com docker-compose
docker-compose up -d

# Ou com Docker puro
docker build -t tempmail-prescreva .
docker run -p 2525:2525 -p 3000:3000 tempmail-prescreva
```

Acesse: **http://localhost:3000**

### Opção 3: Deploy no EasyPanel

1. Configure as variáveis de ambiente no EasyPanel:

```env
SMTP_PORTS=2525
WEB_PORT=3000
DOMAIN=prescreva.me
SMTP_SUBDOMAIN=mail
SMTP_USERNAME=admin
SMTP_PASSWORD=sua_senha_segura
CLOUDFLARE_API_TOKEN=seu_token
```

2. Exponha as portas:
   - **2525** - SMTP
   - **3000** - Interface Web

3. Deploy e acesse pela URL do EasyPanel

## 🎯 Como Funciona

### 1. Criar Email Temporário

1. Acesse a interface web
2. Digite o nome desejado (ex: `meu-email`)
3. Clique em "Criar"
4. Seu email será: `meu-email@prescreva.me`

### 2. Receber Emails

- Os emails enviados para seu endereço aparecem automaticamente
- Atualização em tempo real via WebSocket
- Clique em qualquer email para ver detalhes

### 3. Ver Detalhes

- Assunto, remetente, destinatário
- Data/hora de recebimento
- Corpo completo da mensagem

## 📡 API REST

A aplicação expõe uma API REST para integração:

### Criar Inbox

```bash
POST /api/create-inbox
Content-Type: application/json

{
  "username": "meu-email"
}
```

### Listar Emails

```bash
GET /api/emails/meu-email@prescreva.me
```

### Ver Email Específico

```bash
GET /api/email/2024-01-01T12-00-00.000Z_sender_to_recipient.eml
```

### Deletar Email

```bash
DELETE /api/email/2024-01-01T12-00-00.000Z_sender_to_recipient.eml
```

### Estatísticas

```bash
GET /api/stats
```

## 🔌 WebSocket

Para receber notificações em tempo real:

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  // Inscrever para receber emails
  ws.send(JSON.stringify({
    type: 'subscribe',
    email: 'meu-email@prescreva.me'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'new-email') {
    console.log('Novo email:', data.email);
  }
};
```

## 🎨 Personalização

### Alterar Domínio

```env
DOMAIN=seudominio.com
SMTP_SUBDOMAIN=mail
```

### Alterar Portas

```env
SMTP_PORTS=2525
WEB_PORT=3000
```

## 📁 Estrutura do Projeto

```
.
├── server.js              # Servidor SMTP
├── web-server.js          # Servidor Web + API REST
├── start.js               # Inicia ambos os servidores
├── public/
│   ├── index.html         # Interface web
│   └── app.js             # JavaScript do frontend
├── emails/                # Emails recebidos (auto-criado)
└── utils/
    ├── cloudflare.js      # API Cloudflare
    └── ip-detector.js     # Detecção de IP
```

## 🔐 Segurança

### Produção

- Configure senha forte em `SMTP_PASSWORD`
- Use `ALLOW_INVALID_AUTH=false`
- Limite acesso via firewall/IP se possível
- Configure HTTPS no proxy reverso

### Desenvolvimento

```env
ALLOW_INVALID_AUTH=true
```

Aceita qualquer autenticação para testes locais.

## 🧪 Testar a Aplicação

### Enviar Email de Teste

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.prescreva.me',
  port: 2525,
  auth: {
    user: 'admin',
    pass: 'sua_senha'
  }
});

transporter.sendMail({
  from: 'teste@exemplo.com',
  to: 'meu-email@prescreva.me',  // Email criado no TempMail
  subject: 'Email de Teste',
  text: 'Este email aparecerá na interface!'
});
```

O email aparecerá automaticamente na interface web!

## 📊 Screenshots

### Criar Email
Interface limpa e intuitiva para escolher seu email temporário.

### Lista de Emails
Visualize todos os emails recebidos com remetente, assunto e preview.

### Detalhes do Email
Veja o conteúdo completo de qualquer email recebido.

## 🚀 Deploy no EasyPanel - Guia Completo

Veja `EASYPANEL-SETUP.md` para instruções detalhadas de deploy.

## 🆘 Troubleshooting

### Interface não carrega

- Verifique se a porta 3000 está disponível
- Veja logs: `docker-compose logs web`

### Emails não aparecem

- Verifique se o servidor SMTP está rodando (porta 2525)
- Confirme que o email foi enviado para `@prescreva.me`
- Veja logs do servidor SMTP

### WebSocket não conecta

- Verifique firewall/proxy
- Confirme que a porta 3000 está acessível
- Para HTTPS, use `wss://` em vez de `ws://`

## 📝 Scripts Disponíveis

```bash
npm start        # Iniciar ambos os servidores
npm run dev      # Modo desenvolvimento (nodemon)
npm run setup    # Configurar DNS automaticamente
npm run smtp     # Apenas servidor SMTP
npm run web      # Apenas servidor Web
```

## 🌟 Funcionalidades Futuras

- [ ] Anexos de email
- [ ] Filtros e busca
- [ ] Múltiplas inboxes
- [ ] Notificações push
- [ ] Dark mode
- [ ] API key para integração
- [ ] Tempo de expiração configurável

## 📄 Licença

ISC

---

**Desenvolvido para prescreva.me** 💊
**Interface TempMail moderna e funcional!** 🚀

