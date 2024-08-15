FROM node:16-alpine
LABEL authors="fsr"

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g @ionic/cli
RUN npm install -g serve

#RUN npm run build
RUN ionic build --prod

WORKDIR /app/build

EXPOSE 8080

CMD ["serve", "-s", ".", "-l", "8080"]
