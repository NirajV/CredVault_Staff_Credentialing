FROM node:18-alpine

# Install curl for healthcheck probing
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies first (layer cache — only re-runs if package.json changes)
COPY package*.json ./
RUN npm install

# Copy source (overridden by volume mount in dev)
COPY . .

# Never copy .env — environment is injected by Docker Compose
EXPOSE 3220

# Hot-reload in dev via node --watch
CMD ["npm", "run", "dev"]
