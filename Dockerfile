#Stage 1: Build
FROM node:24.7.0-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

RUN npm install -g --ignore-scripts @ionic/cli

COPY . .

RUN ionic build --prod

#Stage 2: Run
FROM node:24.7.0-slim

WORKDIR /app

COPY --from=build /app/dist /app/dist

RUN npm install -g --ignore-scripts serve

RUN npm install --ignore-scripts react-inject-env

EXPOSE 5000

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD curl --fail http://localhost:5000/healthcheck || exit 1

ENTRYPOINT ["sh", "-c"]
CMD ["npx react-inject-env set -d dist && serve -s dist -l 5000"]
