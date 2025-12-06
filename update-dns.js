require('dotenv').config();
const CloudflareAPI = require('./utils/cloudflare');

/**
 * Script para atualizar DNS com IP específico
 * Uso: node update-dns.js <IP>
 */
async function updateDNS() {
  const newIP = process.argv[2];
  
  if (!newIP) {
    console.error('❌ Uso: node update-dns.js <IP_DO_SERVIDOR>');
    console.log('\nExemplo:');
    console.log('  node update-dns.js 68.168.218.184');
    process.exit(1);
  }

  const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
  const domain = process.env.DOMAIN || 'prescreva.me';
  const subdomain = process.env.SMTP_SUBDOMAIN || 'mail';

  if (!cloudflareToken) {
    console.error('❌ CLOUDFLARE_API_TOKEN não encontrado no .env');
    process.exit(1);
  }

  try {
    console.log('🌐 Atualizando DNS na Cloudflare...');
    console.log(`   IP: ${newIP}`);
    console.log(`   Domínio: ${subdomain}.${domain}\n`);

    const cloudflare = new CloudflareAPI(cloudflareToken, domain);
    await cloudflare.setupSMTPRecords(newIP, subdomain);

    console.log('\n✅ DNS atualizado com sucesso!');
    console.log('\n⏰ Aguarde alguns minutos para propagação do DNS.');
    console.log(`\n🧪 Teste a conexão:`);
    console.log(`   curl -v smtp://mail.prescreva.me:2525`);
    console.log(`   telnet mail.prescreva.me 2525`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar DNS:', error.message);
    process.exit(1);
  }
}

updateDNS();

