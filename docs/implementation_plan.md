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

## Phase 5 — Enhanced Meal Creation (v0.3.0)

### Database Changes (`packages/database/prisma/schema.prisma`)

- [ ] **Meal model additions:**
  - `mealTypes` → `MealType[]` — multi-select: Breakfast, Lunch, Dinner
  - `accompaniments` → `String?` — describes what goes with the meal (e.g. "Serve with rice, plantains, or salad")
  - `notes` → `String?` — optional creator notes
  - `createdById` → `String?` with relation to `User` (tracks the meal creator)

- [ ] **New model: `RecipeStep`**
  ```prisma
  model RecipeStep {
    id          String @id @default(cuid())
    mealId      String
    stepNumber  Int
    instruction String
    meal        Meal   @relation(fields: [mealId], references: [id], onDelete: Cascade)
    @@map("recipe_steps")
  }
  ```

### API Changes

- [ ] **New Endpoint:** `GET /ingredients/search?q=term`
  - Case-insensitive partial match on ingredient name
  - Returns `{ id, name, localAvailability, averageCost }[]`
  - Powers the autocomplete search-as-you-type in the UI

- [ ] **Updated Endpoint:** `POST /api/meals` (CreateMealDto enriched)
  - Add fields: `mealTypes: MealType[]`, `steps: { instruction: string }[]`, `notes: string?`, `accompaniments: string?`, `ingredients: { name: string, quantity: number, unit: string }[]`
  - On create, upsert ingredients: search by name → use existing OR create new → link via MealIngredient
  - Create RecipeStep records in order
  - Store `createdById` from auth context

- [ ] **Updated Endpoint:** `GET /api/meals/:id`
  - Include `recipeSteps` (ordered by stepNumber), `mealTypes`, `accompaniments`, `notes`, `createdBy` user info

- [ ] **Updated Endpoint:** `PATCH /api/meals/:id`
  - Support updating `mealTypes`, `steps`, `notes`, `accompaniments`, `ingredients`

### Module: Ingredients Search (`apps/api/src/modules/ingredients/`)

- [ ] Create `IngredientsModule`, `IngredientsController`, `IngredientsService`
- [ ] `GET /ingredients/search?q=term` — search existing ingredients
- [ ] `POST /ingredients` — create a new ingredient (used by auto-register flow)
- [ ] Register module in `app.module.ts`

### Web UI: Enhanced Meal Creation (`apps/web/src/app/meals/page.tsx`)

- [ ] **Section 1 — Basic Info:**
  - Meal Name (text input)
  - Description (textarea)
  - Meal Times (multi-select checkboxes: ☐ Breakfast ☐ Lunch ☐ Dinner)
  - Prep Time, Cost, Calories, Complexity (existing)

- [ ] **Section 2 — Ingredients & Accompaniments:**
  - Dynamic ingredient rows with:
    - Autocomplete/search field → queries `GET /ingredients/search?q=...`
    - Dropdown showing existing matches
    - "Add new: [typed name]" option when no match found
    - Quantity + unit fields per ingredient
  - Add/remove ingredient row buttons
  - Accompaniments textarea (e.g. "Serve with rice, plantains, or salad")

- [ ] **Section 3 — Steps (Arrow Format):**
  - Numbered list rendered as: `Step 1 → Step 2 → Step 3`
  - Each step: text input for instruction
  - Buttons: Add Step (appends), Remove Step (last), Reorder (move up/down arrows)

- [ ] **Section 4 — Notes:**
  - Textarea for creator notes

- [ ] **Sections 5-6 — Images & Videos (existing, unchanged)**

### Web UI: Meal Detail Page (`apps/web/src/app/meals/[id]/page.tsx`)

- [ ] Display `mealTypes` as badges (Breakfast/Lunch/Dinner)
- [ ] Display `accompaniments` section
- [ ] Display steps in arrow format: `1. Chop onions → 2. Sauté until golden → 3. Add tomatoes...`
- [ ] Display `notes` section if present
- [ ] Show creator name if `createdBy` exists

### Web UI: Edit Meal Page (`apps/web/src/app/meals/[id]/edit/page.tsx`)

- [ ] Add meal types multi-select
- [ ] Add ingredients editing with search/auto-register
- [ ] Add steps editing with reordering
- [ ] Add accompaniments field
- [ ] Add notes field

## Phase 6 — Virtual Calendar & Smart Suggestions (v0.3.0)

### API: Smart Suggestions (`apps/api/src/modules/meal-plans/meal-plans.service.ts`)

- [ ] **New Endpoint:** `GET /meal-plans/suggestions/:userId?weekStart=2026-05-18`
  - Analyzes current week's plan for missing meal slots
  - Suggests meals based on:
    - Variety: avoid repeating the same meal within the week
    - Missing types: prefer meals matching unfilled meal types
    - Ingredient overlap: suggest meals sharing ingredients with already-planned meals (reduces shopping cost)
  - Returns `{ dayOfWeek, mealType, suggestions: Meal[] }[]`

### Web UI: Enhanced Meal Planner (`apps/web/src/app/meal-planner/page.tsx`)

- [ ] **Smart suggestion panel:**
  - When a meal slot is empty, show a "Suggest" button
  - Clicking loads suggestions from `GET /meal-plans/suggestions`
  - Shows suggested meals with reason label (e.g. "Shares ingredients with Tuesday dinner", "Variety pick")

- [ ] **Visual indicators:**
  - Green tint: planned meals
  - Amber tint: AI-suggested slots
  - Red/gray: empty slots
  - Completion bar: "12/21 meals planned this week"

- [ ] **Week summary sidebar:**
  - Nutritional overview for the week (total calories, cost)
  - Missing meal types count

## Phase 7 — Meal Creator Account (v0.3.0)

- [ ] Seed the database with a meal creator user record
  - Create via API or add to seed script
  - Known Clerk ID + email for the creator
- [ ] The meal creator can now log in and start creating enhanced meals with all the new fields

## Verification (Phase 5–7)

### Automated Tests
1. `pnpm db:push` — Schema changes apply cleanly
2. `pnpm build` — All packages and apps build successfully
3. `pnpm lint` — No linting errors
4. `pnpm --filter api dev` — API starts, new endpoints respond 200
5. `pnpm --filter web dev` — Web dashboard shows enhanced form

### Manual Verification
- Create a meal with all new features (name, meal types, ingredients with search, steps with arrows, accompaniments, notes)
- Verify ingredients auto-register when typing a new name
- Verify steps display in arrow format on the meal detail page
- Open meal planner → see suggestion button on empty slots
- Generate suggestions → verify they appear with context labels
- Toggle between weeks → verify suggestions recalculate
