FROM node:18-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source (overridden by volume mount in dev)
COPY . .

EXPOSE 5173

# --host exposes Vite on 0.0.0.0 so Docker port mapping works
CMD ["npm", "run", "dev", "--", "--host"]
