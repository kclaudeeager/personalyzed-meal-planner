FROM node:20-alpine

WORKDIR /app

# Copy entire workspace with node_modules and built .next folder
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

WORKDIR /app/apps/web
CMD ["npx", "next", "start"]
