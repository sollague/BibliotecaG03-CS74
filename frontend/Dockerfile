# Etapa Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# Etapa de Desarrollo (utilizada por docker-compose.override.yml)
FROM base AS dev
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Etapa de Compilación para Producción
FROM base AS builder
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Etapa de Producción (Nginx)
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
