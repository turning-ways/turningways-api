FROM node:alpine3.18

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY ./ ./

ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
