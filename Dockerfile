# Step 1: Use the Docker DinD image as the base image (includes Docker and Docker Compose)
FROM docker:27.1.2-dind

# Step 2: Install Node.js 20 from the Alpine package repositories
# We'll use the Edge community repo to install Node.js 20, as it may not be in the default repositories yet.
RUN apk add --no-cache curl && \
    echo "https://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    apk add --no-cache nodejs npm

# Step 3: Verify installations
RUN docker --version && \
    docker-compose --version && \
    node --version

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g prisma

RUN npx prisma generate

RUN npm run build