/**
 * Script de teste para enviar email através do servidor SMTP
 * 
 * Uso: node test-email.js
 */

require('dotenv').config();

async function testEmail() {
  // Nota: nodemailer não está instalado por padrão
  // Este é um exemplo de como usar. Para testar, instale: npm install nodemailer
  
  try {
    const nodemailer = require('nodemailer');
    
    const config = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '2525'),
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME || 'admin',
        pass: process.env.SMTP_PASSWORD || 'password'
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    console.log('📧 Configuração SMTP:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Porta: ${config.port}`);
    console.log(`   Usuário: ${config.auth.user}`);
    console.log('');

    const transporter = nodemailer.createTransport(config);

    console.log('🔌 Testando conexão...');
    await transporter.verify();
    console.log('✅ Conexão bem-sucedida!\n');

    console.log('📨 Enviando email de teste...');
    const info = await transporter.sendMail({
      from: '"Servidor SMTP" <smtp@prescreva.me>',
      to: 'destinatario@exemplo.com',
      subject: 'Teste do Servidor SMTP - prescreva.me',
      text: 'Este é um email de teste enviado pelo servidor SMTP.\n\nServidor: mail.prescreva.me\nData: ' + new Date().toISOString(),
      html: `
        <h1>Teste do Servidor SMTP</h1>
        <p>Este é um email de teste enviado pelo servidor SMTP.</p>
        <hr>
        <p><strong>Servidor:</strong> mail.prescreva.me</p>
        <p><strong>Data:</strong> ${new Date().toISOString()}</p>
      `
    });

    console.log('✅ Email enviado com sucesso!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log('');
    console.log('📁 Verifique o arquivo salvo na pasta emails/');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ nodemailer não está instalado.');
      console.log('\n💡 Para usar este script de teste, instale o nodemailer:');
      console.log('   npm install nodemailer\n');
    } else {
      console.error('❌ Erro ao enviar email:', error.message);
      if (error.code) {
        console.error(`   Código: ${error.code}`);
      }
    }
    process.exit(1);
  }
}

// Executar teste
if (require.main === module) {
  testEmail();
}

module.exports = testEmail;

