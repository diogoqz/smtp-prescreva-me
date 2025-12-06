# Deploy no EasyPanel - Guia Completo

Este guia explica passo a passo como fazer o deploy do servidor SMTP no EasyPanel.

## 📋 Pré-requisitos

1. Conta no EasyPanel
2. Repositório Git (GitHub, GitLab, etc.)
3. Token da API Cloudflare (opcional, mas recomendado)

## 🚀 Passos para Deploy

### 1. Preparar o Repositório

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Servidor SMTP prescreva.me"

# Adicionar repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/seu-usuario/smtp-server.git

# Fazer push
git push -u origin main
```

### 2. Criar Projeto no EasyPanel

1. Acesse seu painel do EasyPanel
2. Clique em **"Create New Project"**
3. Escolha **"Deploy from Git"**
4. Conecte seu repositório Git
5. Selecione o branch `main` (ou o branch que você está usando)

### 3. Configurar Build

O EasyPanel irá detectar automaticamente o `Dockerfile` e fazer o build.

Se preferir usar Node.js diretamente (sem Docker):
- Build Command: `npm install`
- Start Command: `npm start`

### 4. Configurar Variáveis de Ambiente

No painel do EasyPanel, adicione as seguintes variáveis de ambiente:

#### Variáveis Obrigatórias

```env
# Porta SMTP (use apenas 2525 no EasyPanel)
SMTP_PORTS=2525

# Host
HOST=0.0.0.0

# Domínio
DOMAIN=prescreva.me
SMTP_SUBDOMAIN=mail

# Autenticação
ALLOW_INVALID_AUTH=false
ALLOW_INSECURE_AUTH=true

# Credenciais (IMPORTANTE: use senha forte!)
SMTP_USERNAME=admin
SMTP_PASSWORD=sua_senha_super_segura_aqui
```

#### Variável Opcional (mas Recomendada)

```env
# Token Cloudflare para configuração automática de DNS
CLOUDFLARE_API_TOKEN=seu_token_cloudflare_aqui
```

**Como obter o Token Cloudflare:**
1. Acesse https://dash.cloudflare.com/profile/api-tokens
2. Clique em "Create Token"
3. Use o template "Edit zone DNS"
4. Selecione a zona `prescreva.me`
5. Permissões necessárias: `Zone.DNS` (Edit)
6. Copie o token gerado

### 5. Configurar Portas

No EasyPanel:

1. Vá para a aba **"Ports"** ou **"Network"**
2. Exponha a porta **2525** publicamente
3. Configure o protocolo como **TCP**

**Importante**: No EasyPanel, use apenas a porta `2525`. As portas 25, 587 e 465 requerem privilégios root e podem não funcionar em ambientes containerizados.

### 6. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build da imagem Docker
3. O container será iniciado automaticamente

### 7. Executar Setup (Primeira vez)

Após o primeiro deploy, execute o script de configuração:

1. Acesse o **console/terminal** do container no EasyPanel
2. Execute:

```bash
npm run setup
```

Este comando irá:
- Detectar o IP público do servidor
- Configurar DNS na Cloudflare (se o token foi fornecido)
- Exibir informações de configuração

**Saída esperada:**

```
🚀 Iniciando configuração do servidor SMTP...

🔍 Detectando IP público do servidor...
✅ IP público detectado: XXX.XXX.XXX.XXX

🌐 Configurando DNS para prescreva.me...
📍 Zone ID: xxxxxxxxxxxxxxxxx
✅ Registro A criado: mail.prescreva.me -> XXX.XXX.XXX.XXX
✅ Registro MX criado: @ -> mail.prescreva.me
✅ Registro TXT criado: @ -> v=spf1...
✅ Registro TXT criado: _dmarc -> v=DMARC1...

✅ Configuração DNS concluída com sucesso!

📧 Configuração SMTP:
   Servidor: mail.prescreva.me
   IP: XXX.XXX.XXX.XXX
   Portas: 2525
```

### 8. Verificar Funcionamento

Verifique os logs do container no EasyPanel. Você deve ver:

```
✅ Servidor SMTP iniciado em 0.0.0.0:2525
═══════════════════════════════════════════════
🚀 Servidor SMTP em execução
═══════════════════════════════════════════════
📍 Host: 0.0.0.0
🌐 Domínio: mail.prescreva.me
📮 Portas ativas: 2525
📁 Emails salvos em: /app/emails
🔐 Autenticação: Validada
═══════════════════════════════════════════════
```

## 🧪 Testar o Servidor

### Teste Local (do seu computador)

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.prescreva.me',  // ou o IP público
  port: 2525,
  secure: false,
  auth: {
    user: 'admin',
    pass: 'sua_senha'
  },
  tls: {
    rejectUnauthorized: false  // Para ambientes de desenvolvimento
  }
});

transporter.sendMail({
  from: 'teste@prescreva.me',
  to: 'destinatario@exemplo.com',
  subject: 'Teste SMTP',
  text: 'Email de teste do servidor SMTP'
}).then(info => {
  console.log('Email enviado:', info.messageId);
}).catch(error => {
  console.error('Erro ao enviar:', error);
});
```

### Teste via telnet

```bash
telnet mail.prescreva.me 2525
```

```
EHLO prescreva.me
AUTH LOGIN
[digite username em base64]
[digite password em base64]
MAIL FROM: <teste@prescreva.me>
RCPT TO: <destinatario@exemplo.com>
DATA
Subject: Teste

Corpo do email
.
QUIT
```

## 📊 Monitoramento

### Ver Logs

No EasyPanel, acesse a aba **"Logs"** para ver:
- Emails recebidos
- Tentativas de autenticação
- Erros e avisos

### Ver Emails Recebidos

1. Acesse o console do container
2. Liste os emails:

```bash
ls -la emails/
```

3. Ver conteúdo de um email:

```bash
cat emails/2024-01-01T12-00-00.000Z_sender_to_recipient.eml
```

## 🔄 Atualizações

Para atualizar o servidor:

1. Faça alterações no código
2. Commit e push para o repositório:

```bash
git add .
git commit -m "Atualização do servidor"
git push
```

3. No EasyPanel, clique em **"Redeploy"**
4. Se necessário, execute `npm run setup` novamente

## 🔧 Troubleshooting

### Servidor não inicia

**Problema**: Container fica reiniciando

**Solução**:
1. Verifique os logs no EasyPanel
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Verifique se a porta 2525 está disponível

### DNS não resolve

**Problema**: `mail.prescreva.me` não resolve

**Solução**:
1. Verifique se o token da Cloudflare está correto
2. Execute `npm run setup` no console do container
3. Aguarde propagação DNS (pode levar até 24h, mas geralmente é rápido)
4. Teste com `nslookup mail.prescreva.me`

### Erro de autenticação

**Problema**: Erro ao enviar email (credenciais inválidas)

**Solução**:
1. Confirme que `SMTP_USERNAME` e `SMTP_PASSWORD` estão corretos
2. Verifique se `ALLOW_INVALID_AUTH=false` em produção
3. Verifique os logs do servidor

### Porta bloqueada

**Problema**: Não consegue conectar na porta

**Solução**:
1. Confirme que a porta 2525 está exposta no EasyPanel
2. Verifique firewall do servidor
3. Teste com `telnet IP_DO_SERVIDOR 2525`

## 🔒 Segurança em Produção

✅ **Checklist de Segurança:**

- [ ] `ALLOW_INVALID_AUTH=false` configurado
- [ ] Senha forte em `SMTP_PASSWORD`
- [ ] DNS configurado corretamente (SPF, DMARC)
- [ ] Logs sendo monitorados
- [ ] Apenas portas necessárias expostas
- [ ] Backups dos emails configurados (se necessário)

## 📞 Suporte

Se precisar de ajuda:

1. Verifique os logs do EasyPanel
2. Execute `npm run setup` novamente
3. Revise este guia
4. Verifique as configurações DNS na Cloudflare

---

🎉 **Parabéns!** Seu servidor SMTP está rodando no EasyPanel e pronto para enviar/receber emails em nome de **prescreva.me**!

