# Servidor SMTP - prescreva.me

Servidor SMTP completo com configuração automática de DNS via Cloudflare. Este servidor detecta automaticamente o IP público, configura registros DNS (A, MX, SPF, DMARC) e suporta múltiplas portas SMTP.

## 🚀 Características

- **Auto-configuração**: Detecta IP público automaticamente
- **DNS Automático**: Configura registros DNS na Cloudflare
- **Múltiplas Portas**: Suporta portas 25, 587, 465, 2525
- **Autenticação**: PLAIN e LOGIN
- **Armazenamento**: Salva emails em formato JSON
- **Domínio**: Configurado para prescreva.me
- **Pronto para EasyPanel**: Deploy simplificado

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração Inicial

### 1. Executar script de setup

```bash
npm run setup
```

Este script irá:
- Detectar o IP público do servidor
- Configurar DNS na Cloudflare (se token fornecido)
- Criar arquivo `.env` com configurações

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` criado:

```bash
# Portas do servidor SMTP
SMTP_PORTS=25,587,465,2525

# Domínio
DOMAIN=prescreva.me
SMTP_SUBDOMAIN=mail

# Credenciais (IMPORTANTE: altere a senha!)
SMTP_USERNAME=admin
SMTP_PASSWORD=sua_senha_segura_aqui

# Token Cloudflare (opcional, para auto-config DNS)
CLOUDFLARE_API_TOKEN=seu_token_aqui
```

### 3. Obter Token da Cloudflare (Opcional)

Para configuração automática de DNS:

1. Acesse https://dash.cloudflare.com/profile/api-tokens
2. Clique em "Create Token"
3. Use o template "Edit zone DNS"
4. Selecione o domínio `prescreva.me`
5. Copie o token e adicione ao `.env`

## 🏃 Executando

### Modo desenvolvimento (com nodemon)
```bash
npm run dev
```

### Modo produção
```bash
npm start
```

## 📧 Configurações do Servidor

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `SMTP_PORTS` | Portas SMTP (separadas por vírgula) | `25,587,465,2525` |
| `HOST` | Host do servidor | `0.0.0.0` |
| `DOMAIN` | Domínio principal | `prescreva.me` |
| `SMTP_SUBDOMAIN` | Subdomínio para SMTP | `mail` |
| `ALLOW_INVALID_AUTH` | Aceitar qualquer autenticação (dev) | `false` |
| `ALLOW_INSECURE_AUTH` | Permitir autenticação insegura | `true` |
| `SMTP_USERNAME` | Usuário para autenticação | `admin` |
| `SMTP_PASSWORD` | Senha para autenticação | - |
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare | - |

## 🌐 Registros DNS Criados

Quando você executa `npm run setup` com o token da Cloudflare, os seguintes registros são criados automaticamente:

1. **Registro A**: `mail.prescreva.me` → IP do servidor
2. **Registro MX**: `prescreva.me` → `mail.prescreva.me` (prioridade 10)
3. **Registro SPF**: TXT com política SPF
4. **Registro DMARC**: `_dmarc.prescreva.me` com política DMARC

## 📮 Como Usar

### Via Node.js (nodemailer)

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.prescreva.me',
  port: 587, // ou 25, 465, 2525
  secure: false,
  auth: {
    user: 'admin',
    pass: 'sua_senha'
  }
});

await transporter.sendMail({
  from: 'remetente@prescreva.me',
  to: 'destinatario@exemplo.com',
  subject: 'Teste',
  text: 'Mensagem de teste'
});
```

### Via curl

```bash
curl -v smtp://mail.prescreva.me:587 \
  --mail-from "remetente@prescreva.me" \
  --mail-rcpt "destinatario@exemplo.com" \
  --user "admin:sua_senha" \
  --upload-file email.txt
```

## 📁 Emails Recebidos

Os emails são salvos automaticamente em `emails/` no formato:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "from": "remetente@exemplo.com",
  "to": ["destinatario@prescreva.me"],
  "remoteAddress": "192.168.1.100",
  "hostname": "cliente.exemplo.com",
  "raw": "Conteúdo completo do email em formato RFC 2822"
}
```

## 🐳 Deploy no EasyPanel

### 1. Preparar repositório

```bash
git init
git add .
git commit -m "Servidor SMTP configurado"
git remote add origin seu-repositorio.git
git push -u origin main
```

### 2. Criar projeto no EasyPanel

1. Acesse seu EasyPanel
2. Crie um novo projeto
3. Selecione "Deploy from Git"
4. Conecte seu repositório

### 3. Configurar variáveis de ambiente

No EasyPanel, adicione as seguintes variáveis:

```
SMTP_PORTS=2525
HOST=0.0.0.0
DOMAIN=prescreva.me
SMTP_SUBDOMAIN=mail
ALLOW_INVALID_AUTH=false
SMTP_USERNAME=admin
SMTP_PASSWORD=senha_super_segura
CLOUDFLARE_API_TOKEN=seu_token_cloudflare
```

**Nota**: No EasyPanel, use apenas a porta `2525` (portas < 1024 requerem privilégios especiais)

### 4. Configurar portas

No EasyPanel, exponha a porta `2525` publicamente.

### 5. Deploy

O EasyPanel irá:
- Fazer build da imagem Docker
- Executar o container
- Executar o script de setup automaticamente (se configurado)

### 6. Executar setup (se necessário)

Após o deploy, você pode executar o setup manualmente via console do EasyPanel:

```bash
npm run setup
```

## 🔒 Segurança

### Para Produção

✅ **Recomendações:**
- Defina `ALLOW_INVALID_AUTH=false`
- Use senha forte em `SMTP_PASSWORD`
- Configure firewall para limitar acesso
- Considere usar apenas portas específicas
- Monitore logs regularmente

❌ **Não fazer:**
- Usar senha padrão
- Deixar `ALLOW_INVALID_AUTH=true` em produção
- Expor sem autenticação

## 🛠️ Troubleshooting

### Porta já em uso
```
❌ Porta 25 já está em uso
```
**Solução**: Remova a porta 25 da variável `SMTP_PORTS` ou pare o serviço que está usando a porta.

### Sem permissão para porta
```
❌ Sem permissão para usar porta 25
```
**Solução**: Portas < 1024 requerem privilégios root. Use `sudo` ou portas > 1024.

### DNS não configurado
```
⚠️ CLOUDFLARE_API_TOKEN não configurado
```
**Solução**: Adicione o token da Cloudflare ao `.env` ou configure o DNS manualmente.

## 📊 Estrutura do Projeto

```
.
├── server.js              # Servidor SMTP principal
├── setup.js               # Script de configuração inicial
├── package.json           # Dependências
├── Dockerfile            # Container Docker
├── utils/
│   ├── ip-detector.js    # Detecção de IP público
│   └── cloudflare.js     # API Cloudflare
├── emails/               # Emails recebidos (auto-criado)
├── .env                  # Configurações (criar a partir do .env.example)
└── README.md             # Documentação
```

## 🔄 Atualizações

Para atualizar o servidor:

```bash
git pull
npm install
npm run setup  # Re-executar configuração se necessário
npm start
```

## 📝 Licença

ISC

## 💡 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do servidor
2. Revise as configurações no `.env`
3. Execute `npm run setup` novamente
4. Verifique se as portas estão livres

---

Desenvolvido para **prescreva.me** 💊
