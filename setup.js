require('dotenv').config();
const { getPublicIP } = require('./utils/ip-detector');
const CloudflareAPI = require('./utils/cloudflare');
const fs = require('fs');
const path = require('path');

/**
 * Script de configuração inicial do servidor SMTP
 */
async function setup() {
  console.log('🚀 Iniciando configuração do servidor SMTP...\n');

  try {
    // 1. Detectar IP público
    console.log('🔍 Detectando IP público do servidor...');
    const publicIP = await getPublicIP();
    console.log(`✅ IP público detectado: ${publicIP}\n`);

    // 2. Configurar DNS na Cloudflare
    const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
    const domain = process.env.DOMAIN || 'prescreva.me';
    const subdomain = process.env.SMTP_SUBDOMAIN || 'mail';

    if (!cloudflareToken) {
      console.warn('⚠️  CLOUDFLARE_API_TOKEN não configurado. Pulando configuração DNS.');
      console.log('   Configure a variável CLOUDFLARE_API_TOKEN para configurar DNS automaticamente.\n');
    } else {
      console.log(`🌐 Configurando DNS para ${domain}...`);
      const cloudflare = new CloudflareAPI(cloudflareToken, domain);
      
      await cloudflare.setupSMTPRecords(publicIP, subdomain);
      console.log('');
    }

    // 3. Criar arquivo .env se não existir
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, 'env.example');
    
    if (!fs.existsSync(envPath)) {
      console.log('📝 Criando arquivo .env...');
      
      let envContent = '';
      if (fs.existsSync(envExamplePath)) {
        envContent = fs.readFileSync(envExamplePath, 'utf-8');
      } else {
        envContent = `# Configuração do Servidor SMTP
PORT=2525
HOST=0.0.0.0

# Domínio e subdomínio
DOMAIN=prescreva.me
SMTP_SUBDOMAIN=mail

# Autenticação
ALLOW_INVALID_AUTH=false
ALLOW_INSECURE_AUTH=true
SMTP_USERNAME=admin
SMTP_PASSWORD=change_this_password

# Cloudflare (opcional para auto-configuração DNS)
CLOUDFLARE_API_TOKEN=

# IP público detectado
PUBLIC_IP=${publicIP}
`;
      }
      
      // Adicionar IP público ao .env
      if (!envContent.includes('PUBLIC_IP=')) {
        envContent += `\n# IP público detectado\nPUBLIC_IP=${publicIP}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Arquivo .env criado\n');
    } else {
      console.log('ℹ️  Arquivo .env já existe, não será sobrescrito\n');
    }

    // 4. Sumário da configuração
    console.log('═══════════════════════════════════════════════');
    console.log('✅ Configuração concluída com sucesso!');
    console.log('═══════════════════════════════════════════════');
    console.log(`\n📧 Informações do Servidor SMTP:`);
    console.log(`   IP: ${publicIP}`);
    console.log(`   Domínio: ${subdomain}.${domain}`);
    console.log(`   Portas disponíveis: 25, 587, 465, 2525`);
    console.log(`\n🔐 Próximos passos:`);
    console.log(`   1. Edite o arquivo .env com suas credenciais`);
    console.log(`   2. Configure a variável SMTP_PASSWORD`);
    console.log(`   3. Execute: npm start`);
    console.log(`\n📚 Documentação completa no README.md`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

// Executar setup
if (require.main === module) {
  setup();
}

module.exports = setup;

