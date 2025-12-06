FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretório para emails
RUN mkdir -p emails

# Expor porta SMTP
EXPOSE 2525

# Comando para iniciar o servidor
CMD ["node", "server.js"]


