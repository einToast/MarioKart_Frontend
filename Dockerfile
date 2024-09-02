FROM node:16-alpine

WORKDIR /app

COPY dist ./dist

RUN npm install -g serve

EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]
