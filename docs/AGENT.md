# AGENT.md
# Adaptive Meal Planning Platform — Initial Technical Implementation Plan

## Project Overview

This document defines the initial technical implementation strategy for the Adaptive Meal Planning Platform focused on localized, AI-assisted meal recommendations for Rwandan users.

The goal is to create an AI-agent-friendly architecture that allows rapid iteration, modular development, scalable infrastructure, and easy collaboration between human engineers and autonomous coding agents.

---

# 1. Technical Objectives

The platform must:

- Deliver personalized meal recommendations
- Support localized meal intelligence
- Learn from user feedback and behavior
- Support health and nutrition goals
- Scale across African markets
- Enable AI-assisted software development workflows
- Provide weekly meal planning with AI-generated suggestions
- Generate shopping lists from meal plans with cost estimation
- Import recipes from URLs and images

---

# 2. Recommended Stack

## Frontend

### Mobile App
- React Native + Expo
- TypeScript
- Expo Router
- React Query
- Zustand (state management)

### Web Dashboard
- Next.js 15
- TypeScript
- App Router
- Tailwind CSS

---

## Backend

### API Layer
- NestJS
- TypeScript
- REST API
- Swagger/OpenAPI documentation

### Authentication
- Clerk

### Database
- PostgreSQL

### ORM
- Prisma

### Caching
- Redis

---

## AI & Recommendation Layer

### Initial Engine
- Rule-based recommendation engine

### AI Services
- OpenAI API (GPT-4o for image/video parsing, recipe translation)

---

## Infrastructure
- Railway (MVP) or Render
- Docker Compose for local dev
- GitHub Actions for CI/CD

---

# 3. Monorepo Structure

Use Turborepo.

```bash
apps/
  mobile/
  web/
  api/

packages/
  ui/
  types/
  recommendation-engine/
  shared/
  config/

infra/
  docker/

docs/
```

---

# 4. Core System Modules

## 4.1 User Module

Responsibilities:
- Authentication
- User profile
- Preferences
- Health goals
- Household context

Key Fields:
- age, gender, household_size
- dietary_preferences, allergies
- budget_range, cooking_skill, activity_level

---

## 4.2 Meal Module

Responsibilities:
- Meal metadata
- Ingredients
- Nutrition profiles
- Cooking instructions
- Video references
- URL recipe import (schema.org/JSON-LD parsing)
- OpenAI image/video recipe parsing

Key Fields:
- meal_name, ingredients, preparation_time
- estimated_cost, calories, tags
- cuisine_type, complexity

---

## 4.3 Recommendation Engine

Responsibilities:
- Meal scoring
- User-context adaptation
- Feedback processing
- Recommendation ranking

Inputs:
- user preferences, meal history, budget
- time constraints, meal ratings

Outputs:
- breakfast, lunch, dinner recommendations

---

## 4.4 Meal Planner Module

Responsibilities:
- Weekly meal plan creation
- Calendar-based entry management
- AI generation from recommendations
- Manual entry/slot assignment

Key Data:
- meal_plan (weekStart, weekEnd, userId)
- meal_plan_entry (mealId, mealType, dayOfWeek, mealPlanId)

---

## 4.5 Shopping List Module

Responsibilities:
- Ingredient consolidation from meal plans
- Quantity scaling by household size
- Total cost calculation
- Item check-off tracking
- Text export

Key Data:
- shopping_list (userId, totalCost, weekStart, weekEnd)
- shopping_list_item (ingredientName, quantity, unit, estimatedCost, isChecked)

---

## 4.6 Feedback Module

Responsibilities:
- User meal ratings
- Skip tracking
- Engagement tracking
- Taste learning

Feedback Types:
- liked, disliked, too_expensive, too_difficult, too_repetitive, too_time_consuming

---

# 5. Database Design

## Users
```sql
users
- id, clerkId, email, full_name
- age_range, gender, household_size
- budget_level, activity_level, cooking_skill
- dietary_preferences[], allergies[]
- created_at, updated_at
```

## Meals
```sql
meals
- id, title, description, preparation_time
- estimated_cost, calories, cuisine_type
- complexity, tags[], image_url
- created_at, updated_at
```

## Meal Plans
```sql
meal_plans
- id, user_id, week_start, week_end, name
- created_at, updated_at

meal_plan_entries
- id, meal_plan_id, meal_id
- meal_type (BREAKFAST/LUNCH/DINNER)
- day_of_week (0-6), sort_order
```

## Shopping Lists
```sql
shopping_lists
- id, user_id, name, total_cost
- week_start, week_end
- created_at, updated_at

shopping_list_items
- id, shopping_list_id
- ingredient_id (nullable), ingredient_name
- quantity, unit, estimated_cost, is_checked
```

## Ingredients / Nutrition / Videos
```sql
ingredients - id, name, local_availability, average_cost
meal_ingredients - meal_id, ingredient_id, quantity, unit
nutrition_profiles - id, meal_id, protein, carbs, fat, fiber, vitamins
video_references - id, meal_id, url, source, title, creator_name
```

## Recommendations / Feedback
```sql
recommendations - id, user_id, meal_id, recommendation_score, meal_type, created_at
feedback - id, user_id, meal_id, rating, feedback_type, comment, created_at
```

---

# 6. API Endpoints

## Core
```
GET    /api/health              Health check
GET    /api/users               List users
POST   /api/users               Create user
GET    /api/users/:id           Get user
PATCH  /api/users/:id/preferences  Update preferences

GET    /api/meals               List meals (filterable)
GET    /api/meals/:id           Get meal detail
POST   /api/meals               Create meal
POST   /api/meals/import        Import recipe from URL
POST   /api/meals/shopping-list Generate shopping list

GET    /api/recommendations/daily/:userId  Daily recs
POST   /api/feedback            Submit feedback

POST   /api/meal-plans          Create meal plan
GET    /api/meal-plans/user/:userId    User's plans
POST   /api/meal-plans/entry    Set entry
POST   /api/meal-plans/generate/:userId AI generate plan

GET    /api/shopping-lists/user/:userId  User's lists
PATCH  /api/shopping-lists/item/:itemId  Toggle item
GET    /api/shopping-lists/:id/export    Export as text
```

---

# 7. AI Features Inspired by Mealie

## URL Recipe Import
- Parses schema.org/JSON-LD Recipe data from webpage
- Extracts title, description, prep time, calories, cuisine type, tags
- Creates a new meal in the catalog
- Fallback to HTML title parsing

## OpenAI Image-to-Recipe
- GPT-4o vision API parses recipe from photo
- Returns structured JSON with title, ingredients, instructions
- Configurable via OPENAI_API_KEY env var

## OpenAI Video-to-Recipe
- Whisper transcription via GPT-4o audio
- Parses transcribed cooking video into recipe format

## Recipe Translation
- Translates recipes to Kinyarwanda or other languages
- Preserves structure and measurements

---

# 8. Evolution Path

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation: monorepo, auth, DB schema, API scaffolding, mobile shell | ✅ |
| 2 | Meal System: CRUD, ingredients, videos, URL import | ✅ |
| 3 | Recommendation Engine: rule-based scoring, daily recs | ✅ |
| 4 | **Meal Planner + Shopping List**: weekly plans, consolidated lists | ✅ New |
| 5 | **AI Features**: OpenAI image/video parsing, translation | ✅ Service Ready |
| 6 | Feedback Loop: behavioral learning, personalization | 🔲 |
| 7 | Advanced AI: collaborative filtering, vector embeddings | 🔲 |
| 8 | Conversational AI Assistant | 🔲 |

---

# 9. Inspiration from Mealie

Key features adapted from [Mealie](https://github.com/mealie-recipes/mealie) (12k+ stars):

1. **URL Recipe Import** — Schema.org/JSON-LD scraping adapted from Mealie's recipe scraper
2. **Shopping List Generation** — Consolidated ingredient lists from meal plans (scaled by household)
3. **Weekly Meal Calendar** — Day-by-day meal type slots (Breakfast/Lunch/Dinner)
4. **OpenAI Integration** — Image-to-recipe and video-to-recipe parsing
5. **Data Management** — Bulk operations and export capabilities

These features were adapted to fit our TypeScript/NestJS stack and AI-personalization focus, rather than Mealie's Python/Vue recipe-management approach.
