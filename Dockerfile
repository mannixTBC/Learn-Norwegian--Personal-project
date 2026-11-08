FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm ci --prefix backend --omit=dev --no-audit --no-fund && npm cache clean --force
COPY backend ./backend
COPY src ./src
RUN mkdir -p node_modules/.cache && chown node:node node_modules/.cache
USER node
CMD ["node", "backend/server.js"]
