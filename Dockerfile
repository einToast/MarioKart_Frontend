FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @ionic/cli

COPY . .

RUN ionic build --prod

RUN npm install -g serve

EXPOSE 5000

CMD ["serve", "-s", "www", "-l", "5000"]
