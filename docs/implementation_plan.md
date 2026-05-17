# Scaffold the Adaptive Meal Planning Platform

Set up the full Turborepo monorepo as defined in the blueprint and AGENT.md, covering Phase 1 (Foundation) deliverables.

## User Review Required

> [!IMPORTANT]
> **Stack Choices**: The blueprint lists some alternatives (e.g. Clerk vs Auth0, Railway vs Render, Cloudinary vs S3). For scaffolding I'll use **Clerk** for auth and **Cloudinary** for storage as these are the simpler/quicker options for MVP. Let me know if you prefer the alternatives.

> [!IMPORTANT]
> **Mobile App**: The AGENT.md specifies React Native + Expo with Expo Router. I'll scaffold the mobile app shell but won't implement deep features yet — just the navigation skeleton and onboarding screens placeholder.

> [!WARNING]
> **Database**: The plan scaffolds Prisma with PostgreSQL. You'll need a running PostgreSQL instance to run migrations. I'll include Docker Compose for local dev so this is zero-friction.

## Open Questions

1. **Auth provider**: Clerk or Auth0? (I'll default to **Clerk** unless you say otherwise)
2. **GraphQL**: The blueprint mentions REST + GraphQL hybrid. Should I scaffold GraphQL alongside REST from the start, or start REST-only and add GraphQL later?
3. **shadcn/ui + Tailwind version**: The web dashboard calls for shadcn/ui + Tailwind CSS. Should I use **Tailwind v4** (latest) or **Tailwind v3** for broader compatibility?
4. **Package manager**: npm, pnpm, or yarn? (I'll default to **pnpm** as it's the Turborepo standard)

## Proposed Changes

### 1. Root — Turborepo Monorepo Setup

#### [NEW] Root config files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace config (pnpm workspaces) |
| `pnpm-workspace.yaml` | Workspace definitions |
| `turbo.json` | Turborepo pipeline config (build, dev, lint, test) |
| `tsconfig.base.json` | Shared TypeScript base config |
| `.gitignore` | Standard Node/TS/Docker ignores |
| `.env.example` | Environment variable template |
| `.eslintrc.js` | Root ESLint config |
| `.prettierrc` | Prettier config |

---

### 2. `apps/api` — NestJS Backend

#### [NEW] NestJS application scaffolded with:

- **Feature-based module structure**:
  ```
  apps/api/src/
    modules/
      users/        — controller, service, dto, entity
      meals/        — controller, service, dto, entity
      recommendations/ — controller, service, dto, entity
      feedback/     — controller, service, dto, entity
    common/         — guards, decorators, filters, pipes
    config/         — environment config, validation
    prisma/         — Prisma service
    main.ts
    app.module.ts
  ```
- Swagger/OpenAPI auto-generation enabled
- REST endpoints as defined in AGENT.md Section 7
- Prisma integration
- Health check endpoint
- CORS configured for local dev

---

### 3. `packages/database` — Prisma Schema & Migrations

#### [NEW] Prisma package with full schema:

```prisma
model User {
  id, email, fullName, ageRange, householdSize,
  budgetLevel, activityLevel, dietaryPreferences,
  allergies, cookingSkill, gender, clerkId,
  createdAt, updatedAt
}

model Meal {
  id, title, description, preparationTime,
  estimatedCost, calories, cuisineType,
  complexity, tags, imageUrl, createdAt
}

model Ingredient {
  id, name, localAvailability, averageCost
}

model MealIngredient {
  mealId, ingredientId, quantity, unit
}

model Recommendation {
  id, userId, mealId, recommendationScore,
  mealType (BREAKFAST/LUNCH/DINNER), createdAt
}

model Feedback {
  id, userId, mealId, rating, feedbackType,
  comment, createdAt
}

model NutritionProfile {
  id, mealId, protein, carbs, fat, fiber, vitamins
}

model VideoReference {
  id, mealId, url, source (YOUTUBE/TIKTOK/ORIGINAL),
  title, creatorName
}

model UserPreference {
  id, userId, preferenceKey, preferenceValue
}

model HealthMetric {
  id, userId, metricType, value, recordedAt
}
```

---

### 4. `apps/web` — Next.js Web Dashboard

#### [NEW] Next.js 15 app with App Router:

- Tailwind CSS + shadcn/ui component library
- Basic layout with sidebar navigation
- Placeholder pages: Dashboard, Meals, Users, Recommendations, Settings
- Auth integration placeholder (Clerk provider)
- Dark mode support

---

### 5. `apps/mobile` — Expo Mobile App

#### [NEW] Expo app with Expo Router:

- TypeScript configuration
- Basic tab navigation (Home, Discover, Profile)
- Onboarding flow placeholder screens
- Zustand store skeleton
- React Query setup

---

### 6. `packages/types` — Shared TypeScript Types

#### [NEW] Shared type definitions:

- User, Meal, Ingredient, Recommendation, Feedback interfaces
- API request/response types
- Enum definitions (MealType, FeedbackType, CuisineType, etc.)

---

### 7. `packages/recommendation-engine` — Scoring Engine

#### [NEW] Rule-based recommendation engine skeleton:

```typescript
score = preferenceMatch + budgetCompatibility 
      + cookingTimeCompatibility + nutritionScore 
      + historicalEngagement
```

- Scoring functions with typed inputs/outputs
- Unit test stubs

---

### 8. `packages/shared` — Shared Utilities

#### [NEW] Common utilities:

- Date/time helpers
- Validation helpers
- Constants (budget levels, activity levels, etc.)

---

### 9. `packages/config` — Shared Configuration

#### [NEW] Environment and config utilities:

- Env variable validation (using zod)
- Shared config schemas

---

### 10. `infra/docker` — Docker Setup

#### [NEW] Docker Compose for local development:

- PostgreSQL service
- Redis service
- API service (optional, for containerized dev)

---

### 11. `docs/` — Documentation

#### [NEW] Initial documentation:

| File | Content |
|------|---------|
| `docs/README.md` | Project overview, getting started guide |
| `docs/architecture.md` | System architecture overview |
| `docs/api-design.md` | API endpoints reference |
| Module READMEs | Per-module documentation (users, meals, etc.) |

---

## Verification Plan

### Automated Tests
1. `pnpm install` — All dependencies resolve correctly
2. `pnpm build` — All packages and apps build successfully via Turborepo
3. `pnpm lint` — No linting errors
4. `docker compose up -d` — PostgreSQL and Redis start correctly
5. `pnpm --filter api prisma:generate` — Prisma client generates
6. `pnpm --filter api dev` — API starts and health check responds 200
7. `pnpm --filter web dev` — Web dashboard starts on localhost
8. Verify Swagger UI is accessible at `/api/docs`

### Manual Verification
- Browse the web dashboard shell in the browser
- Confirm the monorepo structure matches the blueprint
