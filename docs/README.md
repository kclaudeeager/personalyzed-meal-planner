# Adaptive Meal Planning Platform

AI-powered personalized meal planning for Rwandan households. Built with a modular monorepo architecture for rapid iteration and AI-agent-friendly development.

## 🏗️ Architecture

```
apps/
  api/           → NestJS REST API (port 4000)
  web/           → Next.js 15 admin dashboard (port 3000)
  mobile/        → Expo React Native app

packages/
  types/         → Shared TypeScript interfaces & enums
  database/      → Prisma schema & client
  shared/        → Common utilities & constants
  config/        → Zod-validated environment config
  recommendation-engine/ → Rule-based meal scoring
  ui/            → Shared UI components (placeholder)

infra/
  docker/        → Docker Compose (PostgreSQL + Redis)
```

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker (for PostgreSQL & Redis)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start databases
docker compose -f infra/docker/docker-compose.yml up -d

# 4. Generate Prisma client
pnpm db:generate

# 5. Push schema to database
pnpm db:push

# 6. Start development servers
pnpm dev
```

### Individual Apps

```bash
pnpm dev:api     # Start API only (http://localhost:4000)
pnpm dev:web     # Start web dashboard only (http://localhost:3000)
```

### API Documentation

Swagger UI is available at: `http://localhost:4000/api/docs`

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Web | Next.js 15 + Tailwind v4 |
| API | NestJS + Swagger |
| Database | PostgreSQL + Prisma |
| Cache | Redis |
| Auth | Clerk |
| AI | OpenAI API + Rule-based engine |
| Monorepo | Turborepo + pnpm |

## 🗃️ Key Commands

| Command | Description |
|---------|------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps & packages |
| `pnpm lint` | Lint all workspaces |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema changes to DB |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio GUI |
| `pnpm clean` | Remove all build artifacts |

## 📖 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Design](./docs/api-design.md)
- [Blueprint](./adaptive_meal_platform_blueprint.docx.md)
- [Technical Plan](./AGENT.md)
