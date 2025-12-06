# 🚀 Deploy AGORA no EasyPanel

## 📦 Repositório Pronto

**URL**: `https://github.com/diogoqz/smtp-prescreva-me`

## ⚡ Passos Rápidos

### 1. Criar Projeto no EasyPanel

1. Acesse seu EasyPanel
2. **Create New Project** → **Deploy from Git**
3. Cole: `https://github.com/diogoqz/smtp-prescreva-me`
4. Branch: `main`

### 2. Adicionar Variáveis de Ambiente

Copie e cole no EasyPanel:

```
SMTP_PORTS=2525
WEB_PORT=3000
DOMAIN=prescreva.me
SMTP_SUBDOMAIN=mail
ALLOW_INVALID_AUTH=false
ALLOW_INSECURE_AUTH=true
SMTP_USERNAME=admin
SMTP_PASSWORD=Prescreva@2024!Strong
CLOUDFLARE_API_TOKEN=1pX_spMjhtGxgyj1tbbrL3o_uUDhWJBUyBsKKGLX
NODE_ENV=production
```

**⚠️ IMPORTANTE**: Altere `SMTP_PASSWORD` para uma senha mais forte se quiser!

### 3. Expor Portas

Configure estas portas no EasyPanel:

- **2525** → TCP (SMTP Server)
- **3000** → HTTP (Interface Web TempMail)

### 4. Deploy

Clique em **Deploy** e aguarde!

## ✅ Após o Deploy

### Acessar Interface TempMail

```
http://seu-app.easypanel.host:3000
```

Ou o domínio que o EasyPanel forneceu.

### O que você verá:

1. **Página linda** com gradiente roxo/azul
2. Campo para **criar seu email** temporário
3. Interface para **ver emails** recebidos em tempo real
4. **Notificações** quando novos emails chegarem

## 🧪 Testar

### 1. Criar Email Temporário

1. Acesse a interface web
2. Digite: `teste123`
3. Clique em **Criar**
4. Você terá: `teste123@prescreva.me`

### 2. Enviar Email de Teste

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.prescreva.me',  // ou IP do EasyPanel
  port: 2525,
  auth: {
    user: 'admin',
    pass: 'Prescreva@2024!Strong'  // a senha que você configurou
  }
});

transporter.sendMail({
  from: 'remetente@exemplo.com',
  to: 'teste123@prescreva.me',  // o email que você criou
  subject: 'Teste do Sistema!',
  text: 'Este email aparecerá na interface web!'
}).then(() => console.log('✅ Email enviado!'));
```

### 3. Ver na Interface

O email aparecerá **automaticamente** na tela! 🎉

## 📊 Logs Esperados

No EasyPanel, você deve ver:

```
🚀 Iniciando servidores...

✅ Servidor SMTP iniciado em 0.0.0.0:2525
═══════════════════════════════════════════════
🚀 Servidor SMTP em execução
═══════════════════════════════════════════════
📍 Bind: 0.0.0.0 (todas as interfaces)
🌐 Domínio: mail.prescreva.me
📮 Portas ativas: 2525
📁 Emails salvos em: /app/emails
🔐 Autenticação: Validada
🔗 IP Público: 68.168.218.184
═══════════════════════════════════════════════

🌐 Servidor Web TempMail iniciado!
   URL: http://localhost:3000
   Domínio: prescreva.me
═══════════════════════════════════════════════
```

## 🎯 O Que Você Tem Agora

### ✅ Servidor SMTP
- Recebe emails em `@prescreva.me`
- Autenticação obrigatória
- Salva emails em JSON
- Múltiplas portas disponíveis

### ✅ Interface Web TempMail
- **Criar emails** com nome personalizado
- **Ver emails** em tempo real
- **WebSocket** para atualizações automáticas
- **Interface linda** e responsiva
- **Copiar email** com um clique

### ✅ DNS Configurado
- `mail.prescreva.me` → IP do servidor
- Registros MX, SPF, DMARC configurados

## 🔧 Se Algo Der Errado

### Erro no Deploy

1. Verifique se todas as variáveis estão configuradas
2. Confirme que as portas 2525 e 3000 estão expostas
3. Veja os logs no EasyPanel

### Interface não carrega

1. Confirme que a porta 3000 está exposta como HTTP
2. Tente acessar pelo IP diretamente
3. Verifique logs no EasyPanel

### SMTP não recebe

1. Confirme que a porta 2525 está exposta como TCP
2. Teste com: `telnet mail.prescreva.me 2525`
3. Verifique variável `SMTP_PASSWORD`

## 📞 Configurações Prontas

Tudo já está configurado:

- ✅ Dockerfile otimizado
- ✅ docker-compose.yml pronto
- ✅ Auto-start de ambos servidores
- ✅ DNS já configurado na Cloudflare
- ✅ Código testado e funcionando

**Só falta fazer o deploy no EasyPanel!** 🚀

---

## 🎉 Resumo

1. **Importar** do GitHub
2. **Configurar** variáveis
3. **Expor** portas 2525 e 3000
4. **Deploy**
5. **Acessar** interface na porta 3000
6. **Usar** seu TempMail!

**URL do Repositório**: https://github.com/diogoqz/smtp-prescreva-me

---

**TUDO PRONTO PARA DEPLOY!** ✅

