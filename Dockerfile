FROM node:20-alpine

WORKDIR /server

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4000
CMD ["node", "server.js"]
