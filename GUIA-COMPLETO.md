# 📧 Guia Completo - TempMail + SMTP prescreva.me

Sistema completo de email temporário com servidor SMTP e interface web moderna.

## 🎯 O que foi Criado

### 1. **Servidor SMTP** (`server.js`)
- Servidor SMTP completo
- Múltiplas portas (25, 587, 465, 2525)
- Autenticação PLAIN/LOGIN
- Salva emails em JSON
- Auto-configuração

### 2. **Interface Web TempMail** (`web-server.js` + `public/`)
- Criar emails temporários com nome personalizado
- Visualizar emails recebidos em tempo real
- WebSocket para atualizações automáticas
- Interface moderna e responsiva
- API REST completa

### 3. **Auto-Configuração DNS** (`setup.js`)
- Detecta IP público automaticamente
- Configura DNS na Cloudflare
- Registros A, MX, SPF, DMARC

## 🚀 Como Usar Localmente

### Passo 1: Instalar

```bash
cd /Users/diogopereira/Desktop/sandbox
npm install
```

### Passo 2: Iniciar

```bash
npm start
```

Isso inicia:
- ✅ Servidor SMTP na porta **2525**
- ✅ Interface Web na porta **3000**

### Passo 3: Acessar

Abra no navegador: **http://localhost:3000**

## 🌐 Como Usar a Interface Web

### 1. Criar Email Temporário

1. Acesse `http://localhost:3000`
2. Digite um nome (ex: `meu-teste`)
3. Clique em **"Criar"**
4. Seu email será: `meu-teste@prescreva.me`

### 2. Enviar Email de Teste

Abra outro terminal e teste:

```javascript
// test-send.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 2525,
  auth: {
    user: 'admin',
    pass: 'change_this_password_NOW'  // senha do .env
  }
});

transporter.sendMail({
  from: 'teste@exemplo.com',
  to: 'meu-teste@prescreva.me',  // o email que você criou
  subject: 'Meu Primeiro Email!',
  text: 'Este email aparecerá na interface!'
}).then(() => {
  console.log('✅ Email enviado!');
});
```

Execute:
```bash
node test-send.js
```

### 3. Ver o Email

O email aparecerá **automaticamente** na interface web!
- Você verá uma notificação
- O email estará na lista
- Clique para ver detalhes completos

## 🐳 Como Usar com Docker

### Docker Compose (Recomendado)

```bash
docker-compose up -d
```

Acesse:
- Interface Web: `http://localhost:3000`
- Servidor SMTP: `localhost:2525`

### Docker Build Manual

```bash
docker build -t tempmail-prescreva .
docker run -p 2525:2525 -p 3000:3000 tempmail-prescreva
```

## 🚀 Deploy no EasyPanel

### Passo 1: Importar do GitHub

URL: `https://github.com/diogoqz/smtp-prescreva-me`

### Passo 2: Configurar Variáveis

```env
SMTP_PORTS=2525
WEB_PORT=3000
DOMAIN=prescreva.me
SMTP_SUBDOMAIN=mail
SMTP_USERNAME=admin
SMTP_PASSWORD=SuaSenhaForte123!
CLOUDFLARE_API_TOKEN=1pX_spMjhtGxgyj1tbbrL3o_uUDhWJBUyBsKKGLX
ALLOW_INVALID_AUTH=false
```

### Passo 3: Expor Portas

- **2525** - SMTP (TCP)
- **3000** - Web (HTTP)

### Passo 4: Deploy e Acessar

Acesse pelo domínio do EasyPanel na porta 3000!

## 📡 Usar a API

### Criar Inbox

```bash
curl -X POST http://localhost:3000/api/create-inbox \
  -H "Content-Type: application/json" \
  -d '{"username": "meu-email"}'
```

### Listar Emails

```bash
curl http://localhost:3000/api/emails/meu-email@prescreva.me
```

### Ver Email

```bash
curl http://localhost:3000/api/email/ID_DO_EMAIL.eml
```

## 🔌 Integração com Sua Aplicação

### Node.js

```javascript
// Criar inbox
const response = await fetch('http://localhost:3000/api/create-inbox', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'usuario123' })
});

const { email } = await response.json();
console.log('Email criado:', email);

// Verificar emails recebidos
const emails = await fetch(`http://localhost:3000/api/emails/${email}`);
const data = await emails.json();
console.log('Emails recebidos:', data.emails);
```

### Python

```python
import requests

# Criar inbox
response = requests.post('http://localhost:3000/api/create-inbox', 
    json={'username': 'usuario123'})
email = response.json()['email']
print(f'Email criado: {email}')

# Verificar emails
response = requests.get(f'http://localhost:3000/api/emails/{email}')
emails = response.json()['emails']
print(f'Total de emails: {len(emails)}')
```

## 🎨 Funcionalidades da Interface

### ✅ Criadas

- [x] Criar email temporário personalizado
- [x] Visualizar lista de emails recebidos
- [x] Ver detalhes de cada email
- [x] Copiar email para clipboard
- [x] Atualização em tempo real (WebSocket)
- [x] Interface responsiva
- [x] Notificações

### 💡 Futuras

- [ ] Anexos de email
- [ ] Busca e filtros
- [ ] Dark mode
- [ ] Múltiplas inboxes simultâneas
- [ ] Tempo de expiração
- [ ] Exportar emails

## 📂 Estrutura de Arquivos

```
sandbox/
├── server.js              # Servidor SMTP
├── web-server.js          # Servidor Web + API
├── start.js               # Inicia ambos os servidores
├── setup.js               # Config DNS automática
├── public/
│   ├── index.html         # Interface TempMail
│   └── app.js             # JavaScript frontend
├── emails/                # Emails recebidos (criado automaticamente)
├── utils/
│   ├── cloudflare.js      # API Cloudflare
│   └── ip-detector.js     # Detecção de IP
└── README-TEMPMAIL.md     # Documentação TempMail
```

## 🔧 Configurações Disponíveis

### Variáveis de Ambiente

```env
# Servidor SMTP
SMTP_PORTS=2525                          # Portas do SMTP
DOMAIN=prescreva.me                      # Domínio principal
SMTP_SUBDOMAIN=mail                      # Subdomínio SMTP
SMTP_USERNAME=admin                      # Usuário autenticação
SMTP_PASSWORD=senha_segura               # Senha autenticação

# Servidor Web
WEB_PORT=3000                            # Porta interface web

# Cloudflare (opcional)
CLOUDFLARE_API_TOKEN=seu_token           # Auto-config DNS

# Modo
ALLOW_INVALID_AUTH=false                 # true = dev, false = prod
NODE_ENV=production                      # development ou production
```

## 🧪 Testar Tudo

### Teste Completo

```bash
# 1. Iniciar servidores
npm start

# 2. Em outro terminal, criar email via API
curl -X POST http://localhost:3000/api/create-inbox \
  -H "Content-Type: application/json" \
  -d '{"username": "teste123"}'

# 3. Enviar email para teste123@prescreva.me
node test-email.js

# 4. Verificar via API
curl http://localhost:3000/api/emails/teste123@prescreva.me

# 5. Ou ver na interface: http://localhost:3000
```

## 📊 Estatísticas e Monitoramento

### Ver Estatísticas

```bash
curl http://localhost:3000/api/stats
```

### Ver Logs

```bash
# Docker
docker-compose logs -f

# Local
# Os logs aparecem no terminal onde você executou npm start
```

### Ver Emails Salvos

```bash
ls -lh emails/
cat emails/NOME_DO_ARQUIVO.eml | jq '.'
```

## 🔒 Segurança

### Desenvolvimento (Local)

```env
ALLOW_INVALID_AUTH=true
SMTP_PASSWORD=qualquer_senha
```

### Produção (EasyPanel)

```env
ALLOW_INVALID_AUTH=false
SMTP_PASSWORD=Senha$Super*Forte@2024!
```

## 🆘 Problemas Comuns

### Interface não carrega

```bash
# Verificar se porta 3000 está disponível
lsof -i :3000

# Ou use outra porta
WEB_PORT=8080 npm start
```

### SMTP não recebe emails

```bash
# Verificar se porta 2525 está disponível
lsof -i :2525

# Verificar logs do servidor
# Os logs aparecem no terminal
```

### WebSocket não conecta

- Verifique firewall
- Em produção, pode precisar de proxy reverso
- Configure wss:// para HTTPS

## 📚 Documentação

- **README.md** - Documentação servidor SMTP
- **README-TEMPMAIL.md** - Documentação interface TempMail
- **EASYPANEL-SETUP.md** - Deploy no EasyPanel
- **CONFIGURACAO-PRESCREVA-ME.md** - Configurações do domínio
- **INICIO-RAPIDO.md** - Guia rápido

## 🎉 Resumo

Você agora tem:

1. ✅ Servidor SMTP completo
2. ✅ Interface web TempMail moderna
3. ✅ API REST para integração
4. ✅ WebSocket para tempo real
5. ✅ Auto-configuração DNS
6. ✅ Pronto para deploy no EasyPanel

**Repositório**: https://github.com/diogoqz/smtp-prescreva-me

**Domínio**: prescreva.me

**Interface Local**: http://localhost:3000

---

🚀 **Tudo pronto para uso!** 🎉

