# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS production
WORKDIR /app
COPY . .
RUN npm prune --omit=dev
EXPOSE 5000
CMD ["node", "server.js"]
