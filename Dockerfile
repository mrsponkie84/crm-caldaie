# Multi-stage build per ridurre dimensioni immagine finale

# Stage 1: Build frontend
FROM node:20-slim AS frontend-build
ARG CACHEBUST=2
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN echo "Cache bust: $CACHEBUST" && npm run build

# Stage 2: Build backend
FROM node:20-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run prisma:generate
RUN npm run build

# Stage 3: Production
FROM node:20-slim
WORKDIR /app

# Installa OpenSSL per Prisma
RUN apt-get update -y && apt-get install -y openssl

# Installa solo dipendenze di produzione backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copia Prisma schema e genera client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copia build backend
COPY --from=backend-build /app/backend/dist ./dist

# Copia build frontend
COPY --from=frontend-build /app/frontend/dist ./public

# Crea directory uploads
RUN mkdir -p uploads

# Espone porta
EXPOSE 3000

# Variabili ambiente
ENV NODE_ENV=production

# Avvia applicazione
CMD npx prisma db push --accept-data-loss && node dist/index.js
