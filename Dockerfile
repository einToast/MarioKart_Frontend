#Stage 1: Build
FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @ionic/cli

COPY . .

RUN ionic build --prod

#Stage 2: Run
FROM node:16-alpine

WORKDIR /app

COPY --from=build dist ./dist

RUN npm install -g serve

EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]
