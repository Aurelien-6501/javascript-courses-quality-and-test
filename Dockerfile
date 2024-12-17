FROM node:22-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install && \
    npx playwright install

COPY . .

EXPOSE 3030

CMD ["npm", "start"]