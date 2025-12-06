# Configuração do Servidor SMTP para prescreva.me

Este documento detalha a configuração específica do servidor SMTP para o domínio **prescreva.me**.

## 🌐 Registros DNS na Cloudflare

Quando você executa `npm run setup` com o token da Cloudflare configurado, os seguintes registros DNS são criados automaticamente no domínio **prescreva.me**:

### Registros Criados

| Tipo | Nome | Conteúdo | Proxy | TTL |
|------|------|----------|-------|-----|
| A | `mail` | IP do servidor | Desligado | Auto |
| MX | `@` | `mail.prescreva.me` (prioridade 10) | Desligado | Auto |
| TXT | `@` | `v=spf1 ip4:IP_SERVIDOR a:mail.prescreva.me ~all` | Desligado | Auto |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@prescreva.me` | Desligado | Auto |

### Verificar Registros DNS

Após executar o setup, você pode verificar se os registros foram criados:

```bash
# Verificar registro A
nslookup mail.prescreva.me

# Verificar registro MX
nslookup -query=mx prescreva.me

# Verificar SPF
nslookup -query=txt prescreva.me

# Verificar DMARC
nslookup -query=txt _dmarc.prescreva.me
```

## 📧 Endpoints do Servidor SMTP

### Para Envio de Emails

```
Servidor: mail.prescreva.me
Portas: 2525 (recomendado no EasyPanel)
        25, 587, 465 (requer privilégios root)
Protocolo: SMTP
Autenticação: Obrigatória (PLAIN/LOGIN)
TLS/SSL: Disponível (STARTTLS)
```

### Credenciais

Configure no arquivo `.env`:

```env
SMTP_USERNAME=admin
SMTP_PASSWORD=sua_senha_segura
```

## 🔧 Configuração por Aplicação

### Node.js (nodemailer)

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.prescreva.me',
  port: 2525,
  secure: false,
  auth: {
    user: 'admin',
    pass: 'sua_senha'
  },
  tls: {
    rejectUnauthorized: false // Para desenvolvimento
  }
});

// Enviar email
await transporter.sendMail({
  from: '"Prescreva.me" <noreply@prescreva.me>',
  to: 'paciente@exemplo.com',
  subject: 'Sua Prescrição',
  html: '<h1>Sua prescrição está pronta!</h1>'
});
```

### Python (smtplib)

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

smtp_server = "mail.prescreva.me"
smtp_port = 2525
smtp_user = "admin"
smtp_pass = "sua_senha"

# Criar mensagem
msg = MIMEMultipart()
msg['From'] = "noreply@prescreva.me"
msg['To'] = "paciente@exemplo.com"
msg['Subject'] = "Sua Prescrição"

body = "<h1>Sua prescrição está pronta!</h1>"
msg.attach(MIMEText(body, 'html'))

# Enviar
with smtplib.SMTP(smtp_server, smtp_port) as server:
    server.login(smtp_user, smtp_pass)
    server.send_message(msg)
```

### PHP (PHPMailer)

```php
<?php
use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);

$mail->isSMTP();
$mail->Host = 'mail.prescreva.me';
$mail->Port = 2525;
$mail->SMTPAuth = true;
$mail->Username = 'admin';
$mail->Password = 'sua_senha';

$mail->setFrom('noreply@prescreva.me', 'Prescreva.me');
$mail->addAddress('paciente@exemplo.com');
$mail->Subject = 'Sua Prescrição';
$mail->Body = '<h1>Sua prescrição está pronta!</h1>';
$mail->isHTML(true);

$mail->send();
?>
```

### Ruby (Mail gem)

```ruby
require 'mail'

Mail.defaults do
  delivery_method :smtp, {
    address: 'mail.prescreva.me',
    port: 2525,
    user_name: 'admin',
    password: 'sua_senha',
    authentication: :plain,
    enable_starttls_auto: true
  }
end

Mail.deliver do
  from     'noreply@prescreva.me'
  to       'paciente@exemplo.com'
  subject  'Sua Prescrição'
  html_part do
    content_type 'text/html; charset=UTF-8'
    body '<h1>Sua prescrição está pronta!</h1>'
  end
end
```

## 🎯 Casos de Uso Específicos

### 1. Envio de Prescrições Médicas

```javascript
async function enviarPrescricao(dadosPaciente, prescricao) {
  const transporter = nodemailer.createTransport({
    host: 'mail.prescreva.me',
    port: 2525,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: '"Prescreva.me" <prescricoes@prescreva.me>',
    to: dadosPaciente.email,
    subject: `Prescrição - Dr. ${prescricao.medico}`,
    html: `
      <h2>Prescrição Médica</h2>
      <p><strong>Paciente:</strong> ${dadosPaciente.nome}</p>
      <p><strong>Médico:</strong> Dr. ${prescricao.medico}</p>
      <p><strong>CRM:</strong> ${prescricao.crm}</p>
      <hr>
      <div>${prescricao.conteudo}</div>
      <hr>
      <p><small>Este é um email automático do sistema Prescreva.me</small></p>
    `,
    attachments: prescricao.anexos
  });
}
```

### 2. Notificações de Sistema

```javascript
async function enviarNotificacao(tipo, dados) {
  const templates = {
    'nova_consulta': {
      subject: 'Nova Consulta Agendada',
      html: `<p>Você tem uma nova consulta agendada para ${dados.data}</p>`
    },
    'lembrete': {
      subject: 'Lembrete de Consulta',
      html: `<p>Lembrete: Sua consulta é amanhã às ${dados.hora}</p>`
    },
    'resultado_exame': {
      subject: 'Resultado de Exame Disponível',
      html: `<p>O resultado do seu exame já está disponível no sistema</p>`
    }
  };

  const template = templates[tipo];
  
  await transporter.sendMail({
    from: '"Prescreva.me" <notificacoes@prescreva.me>',
    to: dados.destinatario,
    subject: template.subject,
    html: template.html
  });
}
```

### 3. Recuperação de Senha

```javascript
async function enviarRecuperacaoSenha(usuario, token) {
  const linkRecuperacao = `https://prescreva.me/recuperar-senha?token=${token}`;
  
  await transporter.sendMail({
    from: '"Prescreva.me" <seguranca@prescreva.me>',
    to: usuario.email,
    subject: 'Recuperação de Senha - Prescreva.me',
    html: `
      <h2>Recuperação de Senha</h2>
      <p>Olá ${usuario.nome},</p>
      <p>Você solicitou a recuperação de senha.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <a href="${linkRecuperacao}">Recuperar Senha</a>
      <p><small>Este link expira em 1 hora.</small></p>
      <p><small>Se você não solicitou esta recuperação, ignore este email.</small></p>
    `
  });
}
```

## 🔐 Segurança

### Boas Práticas para prescreva.me

1. **Autenticação forte**
   ```env
   SMTP_PASSWORD=Senha$Complexa@2024!prescreva
   ```

2. **Monitoramento**
   - Configure alertas para falhas de autenticação
   - Monitore taxa de envio de emails
   - Verifique logs regularmente

3. **Rate Limiting** (implementar na aplicação)
   ```javascript
   const rateLimit = {
     maxEmails: 100,  // por hora
     porUsuario: 10   // por usuário por hora
   };
   ```

4. **Validação de Destinatários**
   ```javascript
   function validarEmail(email) {
     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return regex.test(email);
   }
   ```

## 📊 Monitoramento e Logs

### Verificar Emails Enviados

```bash
# Acessar servidor
ssh usuario@servidor

# Ver emails recebidos
ls -lh emails/

# Contar emails por dia
ls emails/ | grep $(date +%Y-%m-%d) | wc -l

# Ver último email
cat emails/$(ls -t emails/ | head -1) | jq '.'
```

### Estatísticas

Crie um script para gerar estatísticas:

```javascript
const fs = require('fs');
const path = require('path');

function gerarEstatisticas() {
  const emailsDir = path.join(__dirname, 'emails');
  const arquivos = fs.readdirSync(emailsDir);
  
  const stats = {
    total: arquivos.length,
    hoje: 0,
    ultimos7dias: 0,
    porRemetente: {}
  };
  
  const hoje = new Date().toISOString().split('T')[0];
  const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  arquivos.forEach(arquivo => {
    const conteudo = JSON.parse(
      fs.readFileSync(path.join(emailsDir, arquivo), 'utf-8')
    );
    
    const data = new Date(conteudo.timestamp);
    
    if (data.toISOString().startsWith(hoje)) {
      stats.hoje++;
    }
    
    if (data >= semanaAtras) {
      stats.ultimos7dias++;
    }
    
    const remetente = conteudo.from || 'desconhecido';
    stats.porRemetente[remetente] = (stats.porRemetente[remetente] || 0) + 1;
  });
  
  return stats;
}
```

## 🚨 Troubleshooting Específico

### Problema: Emails não chegam aos destinatários

**Possíveis causas:**
1. DNS não propagado
2. IP em blacklist
3. SPF/DMARC mal configurado

**Soluções:**
```bash
# Verificar DNS
dig mail.prescreva.me
dig prescreva.me MX
dig prescreva.me TXT

# Verificar blacklist
# Acesse: https://mxtoolbox.com/blacklists.aspx
# Digite: IP do servidor

# Reconfigurar DNS
npm run setup
```

### Problema: Taxa de rejeição alta

**Solução:**
1. Verificar SPF: `v=spf1 ip4:IP_SERVIDOR a:mail.prescreva.me ~all`
2. Adicionar DKIM (futuro)
3. Melhorar conteúdo dos emails (evitar spam)

## 📈 Próximos Passos

### Melhorias Recomendadas

1. **DKIM (DomainKeys Identified Mail)**
   - Assinar emails digitalmente
   - Melhorar deliverability

2. **SSL/TLS**
   - Certificado Let's Encrypt
   - Criptografar conexões

3. **Interface Web**
   - Visualizar emails recebidos
   - Estatísticas em tempo real

4. **Webhook**
   - Notificar aplicação quando email chegar
   - Integrar com sistema principal

---

✅ **Servidor SMTP configurado e pronto para produção em prescreva.me!**

