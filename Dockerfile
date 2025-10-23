# Multi-stage build per ridurre dimensioni immagine finale

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run prisma:generate
RUN npm run build

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app

# Installa solo dipendenze di produzione backend
COPY backend/package*.json ./
RUN npm ci --only=production

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
ENV PORT=3000

# Avvia applicazione
CMD ["node", "dist/index.js"]
