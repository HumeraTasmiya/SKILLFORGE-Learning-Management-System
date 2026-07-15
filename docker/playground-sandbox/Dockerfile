FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash openjdk-17-jdk-headless python3 sqlite3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js ./

RUN useradd --create-home --shell /usr/sbin/nologin sandbox \
  && mkdir -p /tmp/skillforge-runs \
  && chown -R sandbox:sandbox /app /tmp/skillforge-runs

USER sandbox
ENV NODE_ENV=production
EXPOSE 7070

CMD ["npm", "start"]
