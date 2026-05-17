FROM node:20-alpine

WORKDIR /app

# Copy entire workspace with node_modules and built dist folders
COPY . .

# Regenerate Prisma client for Alpine Linux
RUN cd packages/database && npx prisma generate

ENV NODE_ENV=production
EXPOSE 4000

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
