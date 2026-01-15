FROM node:20-alpine

RUN apk add --no-cache redis supervisor

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate


COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm build


COPY supervisord.conf /etc/supervisord.conf

ENV NODE_ENV=production
ENV PORT=8080
ENV REDIS_URL=redis://127.0.0.1:6379

EXPOSE 8080 

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
