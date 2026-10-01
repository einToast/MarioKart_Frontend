#Stage 1: Build
FROM node:24.21.0-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npx ionic build --prod

#Stage 2: Run
FROM node:24.21.0-slim AS runtime

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* \
    && npm install -g --ignore-scripts serve \
    && npm install --ignore-scripts react-inject-env \
    && useradd --system --create-home --uid 10001 frontend

COPY --from=build --chown=frontend:frontend /app/dist /app/dist

USER frontend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD curl --fail http://localhost:5000/healthcheck || exit 1

ENTRYPOINT ["sh", "-c"]
CMD ["npx react-inject-env set -d dist && serve -s dist -l 5000"]
