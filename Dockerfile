#Stage 1: Build
FROM node:24.21.0-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npm run ionic_build

#Stage 2: Run
FROM node:24.21.0-slim AS runtime

WORKDIR /app

COPY docker/runtime/package*.json ./

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* \
    && npm ci --ignore-scripts \
    && useradd --system --create-home --uid 10001 frontend

ENV PATH="/app/node_modules/.bin:${PATH}"

COPY --from=build --chown=frontend:frontend /app/dist /app/dist

USER frontend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD curl --fail http://localhost:5000/healthcheck || exit 1

ENTRYPOINT ["sh", "-c"]
CMD ["react-inject-env set -d dist && serve -s dist -l 5000"]
