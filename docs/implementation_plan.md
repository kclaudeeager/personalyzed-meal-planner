# Implementation Plan — Adaptive Meal Planning Platform

Set up the full Turborepo monorepo as defined in the blueprint and AGENT.md.

## Phase 1 — Foundation (Complete)

- [x] Root monorepo setup (Turborepo + pnpm)
- [x] API NestJS scaffolding (modules: users, meals, recommendations, feedback, health)
- [x] Prisma schema with 11 models + initial migration
- [x] Web dashboard (Next.js 15, Tailwind v4, 6 pages)
- [x] Mobile app (Expo, 3 tabs, onboarding)
- [x] Shared types, constants, helpers, config
- [x] Rule-based recommendation engine
- [x] Docker Compose (PostgreSQL + Redis)

## Phase 2 — Meal Planner & Shopping List (v0.2.0)

- [x] Prisma schema: MealPlan, MealPlanEntry, ShoppingList, ShoppingListItem
- [x] Types: New model interfaces and API contracts
- [x] API: Meal Plans module (CRUD + AI generate)
- [x] API: Shopping Lists module (CRUD + toggle + export)
- [x] API: Shopping list generation from meal plan (ingredient consolidation + household scaling)
- [x] Web: Meal Planner page (7-day calendar grid, meal picker modal, week navigation)
- [x] Web: Shopping List page (generate, check-off, export)
- [x] Web: Dashboard quick actions for planner and shopping list
- [x] Web: Sidebar navigation with new items

## Phase 3 — Recipe Import & AI (v0.2.0)

- [x] API: URL recipe import with schema.org/JSON-LD parsing
- [x] API: OpenAI recipe parser service (image-to-recipe, video-to-recipe, translation)
- [x] Web: URL import UI in Meals page
- [x] API: Users findAll endpoint

## Phase 4 — Mobile Enhancements (v0.2.0)

- [x] Mobile: Weekly meal plan calendar view on home screen
- [x] Mobile: Today's meals detail section

## Verification

### Automated Tests
1. `pnpm install` — All dependencies resolve correctly
2. `pnpm build` — All packages and apps build successfully via Turborepo
3. `pnpm lint` — No linting errors
4. `docker compose up -d` — PostgreSQL and Redis start correctly
5. `pnpm --filter api prisma:generate` — Prisma client generates
6. `pnpm db:push` — Push schema changes including new models
7. `pnpm --filter api dev` — API starts and health check responds 200
8. `pnpm --filter web dev` — Web dashboard starts on localhost

### Manual Verification
- Browse meal planner at `/meal-planner`
- Browse shopping list at `/shopping-list`
- Test URL import in Meals page
- Test mobile app weekly plan view
- Verify Swagger UI at `/api/docs` includes new tags
