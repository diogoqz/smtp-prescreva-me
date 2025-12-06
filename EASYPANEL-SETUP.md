# ⚡ Setup Rápido no EasyPanel

Repositório: **https://github.com/diogoqz/smtp-prescreva-me**

## 🚀 Passos para Deploy

### 1. Acessar EasyPanel

Faça login no seu painel do EasyPanel.

### 2. Criar Novo Projeto

1. Clique em **"Create New Project"**
2. Escolha **"Deploy from Git"**
3. Cole a URL do repositório:
   ```
   https://github.com/diogoqz/smtp-prescreva-me
   ```
4. Selecione o branch: **main**

### 3. Configurar Variáveis de Ambiente

No EasyPanel, adicione estas variáveis de ambiente:

```env
SMTP_PORTS=2525
HOST=0.0.0.0
DOMAIN=prescreva.me
SMTP_SUBDOMAIN=mail
ALLOW_INVALID_AUTH=false
ALLOW_INSECURE_AUTH=true
SMTP_USERNAME=admin
SMTP_PASSWORD=SuaSenhaSegura123!
CLOUDFLARE_API_TOKEN=1pX_spMjhtGxgyj1tbbrL3o_uUDhWJBUyBsKKGLX
NODE_ENV=production
```

**IMPORTANTE**: 
- Altere `SMTP_PASSWORD` para uma senha forte!
- O token Cloudflare já está incluído

### 4. Configurar Porta

No EasyPanel:
1. Vá para **"Network"** ou **"Ports"**
2. Exponha a porta **2525**
3. Protocolo: **TCP**

### 5. Deploy

Clique em **"Deploy"** e aguarde o build completar.

### 6. Executar Setup (Primeira Vez)

Após o deploy, acesse o **Console/Terminal** do container no EasyPanel e execute:

```bash
npm run setup
```

Isso irá verificar o IP público e reconfigurar o DNS se necessário.

## ✅ Verificar Funcionamento

Nos logs do EasyPanel, você deve ver:

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

Use o seguinte código Node.js para testar:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.prescreva.me',
  port: 2525,
  auth: {
    user: 'admin',
    pass: 'SuaSenhaSegura123!'
  }
});

transporter.sendMail({
  from: 'sistema@prescreva.me',
  to: 'destinatario@exemplo.com',
  subject: 'Teste SMTP',
  text: 'Email de teste do servidor SMTP!'
}).then(() => {
  console.log('✅ Email enviado!');
}).catch(console.error);
```

## 📊 DNS Já Configurado

Os seguintes registros DNS já foram criados na Cloudflare:

- **A**: mail.prescreva.me → 192.223.105.171
- **MX**: prescreva.me → mail.prescreva.me
- **SPF**: v=spf1 ip4:192.223.105.171 a:mail.prescreva.me ~all
- **DMARC**: v=DMARC1; p=quarantine; rua=mailto:dmarc@prescreva.me

Quando fizer o deploy no EasyPanel, execute `npm run setup` para atualizar o IP se necessário.

## 🔧 Troubleshooting

### Servidor não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que a porta 2525 está exposta

### Erro de autenticação
- Confirme que a senha em `SMTP_PASSWORD` está correta
- Verifique se `ALLOW_INVALID_AUTH=false`

### DNS não resolve
- Execute `npm run setup` no console do container
- Aguarde alguns minutos para propagação

## 📞 Suporte

Documentação completa disponível no repositório:
- **README.md** - Documentação geral
- **DEPLOY-EASYPANEL.md** - Guia detalhado
- **CONFIGURACAO-PRESCREVA-ME.md** - Configurações específicas

---

🎉 **Pronto para deploy!** Basta seguir os passos acima no EasyPanel.

