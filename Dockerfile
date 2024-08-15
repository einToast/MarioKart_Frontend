FROM node:16-alpine
LABEL authors="fsr"

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g serve
RUN npm run build

WORKDIR /app/build

EXPOSE 5000

CMD ["serve", "-s", ".", "-l", "8080"]
