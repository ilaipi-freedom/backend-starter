FROM node:22-alpine3.20 AS base

WORKDIR /app

FROM base AS builder

RUN apk add tzdata

FROM base AS prod

COPY package*.json ./

RUN npm install --omit=dev
RUN npm i pino-pretty
RUN rm -fr /app/node_modules/.prisma

FROM base AS dev

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

FROM dev AS build
COPY . ./
RUN npx prisma generate --schema ./prisma/
RUN npm run build:obfuscate

FROM base AS release

COPY --from=builder /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo "Asia/Shanghai" > /etc/timezone
COPY --from=prod /app/node_modules /app/node_modules/
COPY --from=build /app/src/generated/prisma/ /app/dist/generated/prisma/
COPY package.json ./
COPY prisma ./prisma/
COPY --from=build /app/dist_obfuscated /app/dist/

ENTRYPOINT ["node"]

CMD ["dist/main.js"]
