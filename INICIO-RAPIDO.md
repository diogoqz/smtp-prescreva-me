# 🚀 Início Rápido - Servidor SMTP prescreva.me

Guia de 5 minutos para ter seu servidor SMTP rodando!

## ⚡ Setup Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Ambiente

Copie o arquivo de exemplo e edite:

```bash
cp env.example .env
nano .env  # ou vim, code, etc.
```

**Configurações mínimas necessárias:**

```env
SMTP_PORTS=2525
DOMAIN=prescreva.me
SMTP_USERNAME=admin
SMTP_PASSWORD=SUA_SENHA_AQUI
CLOUDFLARE_API_TOKEN=SEU_TOKEN_AQUI
```

### 3. Executar Setup

```bash
npm run setup
```

Isso irá:
- ✅ Detectar IP público
- ✅ Configurar DNS na Cloudflare
- ✅ Validar configuração

### 4. Iniciar Servidor

```bash
npm run dev  # modo desenvolvimento com nodemon
```

ou

```bash
npm start    # modo produção
```

## 🐳 Com Docker

### Build e Run

```bash
docker-compose up -d
```

### Ver Logs

```bash
docker-compose logs -f
```

## 🧪 Testar

### Teste Rápido com Telnet

```bash
telnet localhost 2525
```

Depois digite:
```
EHLO prescreva.me
QUIT
```

### Teste com Script

```bash
# Instalar nodemailer primeiro
npm install nodemailer

# Executar teste
node test-email.js
```

## 📦 Deploy no EasyPanel

### Preparar

```bash
git init
git add .
git commit -m "Servidor SMTP prescreva.me"
git remote add origin SEU_REPOSITORIO
git push -u origin main
```

### No EasyPanel

1. **Create Project** → **Deploy from Git**
2. Adicionar variáveis de ambiente (veja `.env`)
3. Expor porta **2525**
4. **Deploy**
5. Executar no console: `npm run setup`

## 📋 Checklist Pré-Deploy

- [ ] Senha forte configurada
- [ ] Token Cloudflare obtido
- [ ] Repositório Git criado
- [ ] Variáveis de ambiente configuradas
- [ ] Porta 2525 disponível

## 🎯 Próximos Passos

Após configuração básica:

1. **Configurar DNS Manualmente** (se não usou Cloudflare automático)
   - Registro A: `mail.prescreva.me` → seu IP
   - Registro MX: `prescreva.me` → `mail.prescreva.me`

2. **Testar Envio de Email**
   - Use o script `test-email.js`
   - Ou integre com sua aplicação

3. **Monitorar**
   - Ver logs: `docker-compose logs -f` ou logs do EasyPanel
   - Ver emails: `ls -la emails/`

## 📚 Documentação Completa

- **README.md** - Documentação completa
- **DEPLOY-EASYPANEL.md** - Guia detalhado de deploy
- **CONFIGURACAO-PRESCREVA-ME.md** - Configuração específica do domínio

## 🆘 Problemas Comuns

### Porta em uso
```bash
# Linux/Mac
sudo lsof -i :2525
kill -9 PID

# Windows
netstat -ano | findstr :2525
taskkill /PID PID /F
```

### DNS não resolve
```bash
# Aguardar propagação (pode demorar)
nslookup mail.prescreva.me

# Forçar re-setup
npm run setup
```

### Erro de autenticação
- Verifique `.env`
- Confirme `ALLOW_INVALID_AUTH=false`
- Use as credenciais corretas

## 💡 Dicas

1. **Desenvolvimento Local**
   ```env
   SMTP_PORTS=2525
   ALLOW_INVALID_AUTH=true
   ```

2. **Produção**
   ```env
   SMTP_PORTS=2525
   ALLOW_INVALID_AUTH=false
   SMTP_PASSWORD=senha_forte_aqui
   ```

3. **Testar DNS**
   ```bash
   dig mail.prescreva.me
   dig prescreva.me MX
   ```

---

**Pronto!** Seu servidor SMTP está configurado e rodando! 🎉

Para mais detalhes, consulte **README.md** e **DEPLOY-EASYPANEL.md**.

