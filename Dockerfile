#Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

RUN npm install -g @ionic/cli --ignore-scripts

COPY . .

RUN ionic build --prod

#Stage 2: Run
FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/dist /app/dist

RUN npm install -g serve --ignore-scripts

RUN npm install react-inject-env --ignore-scripts

EXPOSE 5000

ENTRYPOINT ["sh", "-c"]
CMD ["npx react-inject-env set -d dist && serve -s dist -l 5000"]
