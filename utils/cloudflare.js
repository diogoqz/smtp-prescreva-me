const axios = require('axios');

class CloudflareAPI {
  constructor(apiToken, domain) {
    this.apiToken = apiToken;
    this.domain = domain;
    this.baseURL = 'https://api.cloudflare.com/client/v4';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Obtém o Zone ID do domínio
   */
  async getZoneId() {
    try {
      const response = await this.client.get('/zones', {
        params: { name: this.domain }
      });

      if (response.data.success && response.data.result.length > 0) {
        return response.data.result[0].id;
      }

      throw new Error(`Domínio ${this.domain} não encontrado na Cloudflare`);
    } catch (error) {
      throw new Error(`Erro ao obter Zone ID: ${error.message}`);
    }
  }

  /**
   * Lista registros DNS
   */
  async listDNSRecords(zoneId, type = null, name = null) {
    try {
      const params = {};
      if (type) params.type = type;
      if (name) params.name = name;

      const response = await this.client.get(`/zones/${zoneId}/dns_records`, { params });
      
      if (response.data.success) {
        return response.data.result;
      }

      throw new Error('Erro ao listar registros DNS');
    } catch (error) {
      throw new Error(`Erro ao listar registros DNS: ${error.message}`);
    }
  }

  /**
   * Cria ou atualiza um registro DNS
   */
  async upsertDNSRecord(zoneId, type, name, content, options = {}) {
    try {
      // Verificar se o registro já existe
      const existingRecords = await this.listDNSRecords(zoneId, type, `${name}.${this.domain}`);
      
      const recordData = {
        type,
        name,
        content,
        ttl: options.ttl || 1, // 1 = auto
        proxied: options.proxied !== undefined ? options.proxied : false,
        ...options
      };

      if (existingRecords.length > 0) {
        // Atualizar registro existente
        const recordId = existingRecords[0].id;
        const response = await this.client.put(
          `/zones/${zoneId}/dns_records/${recordId}`,
          recordData
        );
        
        if (response.data.success) {
          console.log(`✅ Registro ${type} atualizado: ${name}.${this.domain} -> ${content}`);
          return response.data.result;
        }
      } else {
        // Criar novo registro
        const response = await this.client.post(
          `/zones/${zoneId}/dns_records`,
          recordData
        );
        
        if (response.data.success) {
          console.log(`✅ Registro ${type} criado: ${name}.${this.domain} -> ${content}`);
          return response.data.result;
        }
      }

      throw new Error('Erro ao criar/atualizar registro DNS');
    } catch (error) {
      throw new Error(`Erro ao upsert DNS: ${error.message}`);
    }
  }

  /**
   * Configura registros DNS para servidor SMTP
   */
  async setupSMTPRecords(ip, subdomain = 'mail') {
    try {
      const zoneId = await this.getZoneId();
      console.log(`📍 Zone ID: ${zoneId}`);

      // 1. Registro A para o subdomínio mail
      await this.upsertDNSRecord(zoneId, 'A', subdomain, ip, { proxied: false });

      // 2. Registro MX (Mail Exchange)
      await this.upsertDNSRecord(
        zoneId,
        'MX',
        '@',
        `${subdomain}.${this.domain}`,
        { priority: 10, proxied: false }
      );

      // 3. Registro SPF (Sender Policy Framework)
      const spfRecord = `v=spf1 ip4:${ip} a:${subdomain}.${this.domain} ~all`;
      await this.upsertDNSRecord(zoneId, 'TXT', '@', spfRecord, { proxied: false });

      // 4. Registro DMARC
      const dmarcRecord = 'v=DMARC1; p=quarantine; rua=mailto:dmarc@' + this.domain;
      await this.upsertDNSRecord(zoneId, 'TXT', '_dmarc', dmarcRecord, { proxied: false });

      console.log('\n✅ Configuração DNS concluída com sucesso!');
      console.log(`\n📧 Configuração SMTP:`);
      console.log(`   Servidor: ${subdomain}.${this.domain}`);
      console.log(`   IP: ${ip}`);
      console.log(`   Portas: 25, 587, 465, 2525`);
      
      return {
        hostname: `${subdomain}.${this.domain}`,
        ip,
        zoneId
      };
    } catch (error) {
      throw new Error(`Erro ao configurar DNS: ${error.message}`);
    }
  }
}

module.exports = CloudflareAPI;


