const axios = require('axios');

/**
 * Detecta o IP público do servidor
 */
async function getPublicIP() {
  const services = [
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json',
    'https://ifconfig.me/ip',
    'https://icanhazip.com'
  ];

  for (const service of services) {
    try {
      const response = await axios.get(service, { timeout: 5000 });
      
      if (typeof response.data === 'object' && response.data.ip) {
        return response.data.ip.trim();
      } else if (typeof response.data === 'string') {
        return response.data.trim();
      }
    } catch (error) {
      console.warn(`Falha ao obter IP de ${service}:`, error.message);
      continue;
    }
  }

  throw new Error('Não foi possível detectar o IP público do servidor');
}

/**
 * Verifica se um IP é válido
 */
function isValidIP(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

module.exports = {
  getPublicIP,
  isValidIP
};


