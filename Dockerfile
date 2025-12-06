FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p emails public

# Expor portas
EXPOSE 2525
EXPOSE 3000

# Comando para iniciar ambos os servidores
CMD ["node", "start.js"]


