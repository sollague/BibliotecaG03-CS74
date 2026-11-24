FROM node:20-alpine

# Instalar dependencias del sistema requeridas por Prisma
RUN apk add --no-cache openssl dumb-init bash

WORKDIR /app

# Copiar dependencias y schema de Prisma
COPY package.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

# Copiar código fuente
COPY src ./src/

# Copiar script de inicialización
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Crear directorio para subidas de archivos y ajustar permisos
RUN mkdir -p uploads/solicitudes && chown -R node:node uploads

USER node

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--", "docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
