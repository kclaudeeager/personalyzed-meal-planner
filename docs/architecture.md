# Architecture Overview

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                       Clients                            │
│  ┌────────────────┐  ┌────────────────┐                  │
│  │   Mobile App    │  │  Web Dashboard  │                  │
│  │   (Expo/RN)     │  │  (Next.js 15)   │                  │
│  └──────┬─────────┘  └───────┬─────────┘                  │
└─────────┼────────────────────┼───────────────────────────┘
          │                    │
          │      REST API      │
          ▼                    ▼
┌──────────────────────────────────────────────────────────┐
│                   API Layer (NestJS)                      │
│  ┌────────┐ ┌────────┐ ┌──────────────┐ ┌────────┐       │
│  │ Users  │ │ Meals  │ │Recommendations│ │Feedback│       │
│  └────┬───┘ └────┬───┘ └──────┬───────┘ └────┬───┘       │
│       │          │            │               │           │
│  ┌────┴────┐ ┌───┴─────┐ ┌───┴────────┐ ┌────┴──────┐   │
│  │MealPlans│ │Shopping │ │  OpenAI    │ │  Health   │   │
│  │         │ │ Lists   │ │  Parser    │ │           │   │
│  └────┬────┘ └────┬────┘ └─────┬──────┘ └───────────┘   │
│       │           │             │                         │
│       ▼           ▼             ▼                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  Prisma ORM                         │  │
│  └────────────────────┬───────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────┘
                        │
            ┌───────────┴────────────┐
            ▼                        ▼
  ┌──────────────────┐    ┌──────────────────┐
  │   PostgreSQL     │    │     Redis        │
  │   (Data Store)   │    │   (Cache)        │
  └──────────────────┘    └──────────────────┘
```

## Module Design

Each API module follows the NestJS feature-based architecture:

```
modules/
  users/             → User profile, preferences, health metrics
  meals/             → Meal catalog, ingredients, nutrition, videos, import, shopping lists
  recommendations/   → Rule-based and AI recommendation engine
  feedback/          → Meal ratings, reviews, engagement tracking
  meal-plans/        → Weekly meal planning, calendar entries
  shopping-lists/    → Consolidated ingredient lists from meal plans
  health/            → API and database health checks
```

## Recommendation Engine

The engine is a standalone package (`packages/recommendation-engine`) with no framework dependencies. It takes user context and meal candidates as input and returns scored recommendations.

### Scoring Formula (Phase 1)

```
totalScore = preferenceMatch     × 0.25
           + budgetCompatibility × 0.20
           + cookingTimeCompat   × 0.20
           + nutritionScore      × 0.15
           + historicalEngagement× 0.15
           + repetitionPenalty   × 0.05
```

### Evolution Path

| Phase | Approach | Status |
|-------|----------|--------|
| 1 | Rule-based scoring | ✅ Implemented |
| 2 | Collaborative filtering | 🔲 Planned |
| 3 | Vector embeddings | 🔲 Planned |
| 4 | LLM contextual recommendations | 🔲 Planned |
| 5 | Conversational AI assistant | 🔲 Planned |

## New Features v0.2.0

### Meal Planner Flow
1. User creates a weekly meal plan (Mon-Sun)
2. "AI Generate" fills the plan from top-scored recommendations
3. User can manually swap meals via the meal picker
4. Each day has Breakfast, Lunch, and Dinner slots

### Shopping List Flow
1. User selects a meal plan
2. System aggregates all ingredients across all meals
3. Quantities are scaled by household size
4. Total cost is calculated from ingredient average costs
5. User can check off items and export as text

### Recipe Import Flow
1. User pastes a URL from any recipe website
2. Backend fetches the page and extracts schema.org/JSON-LD Recipe data
3. Falls back to HTML title parsing if no structured data found
4. Creates a new meal entry in the catalog with extracted metadata

### OpenAI Integration
1. Image-to-Recipe: GPT-4o vision parses recipe photos
2. Video-to-Recipe: Whisper transcription + GPT parsing
3. Translation: Recipe translation to Kinyarwanda or other languages
4. All features require `OPENAI_API_KEY` in environment

## Data Flow

1. User registers → Clerk authenticates → User record created in PostgreSQL
2. User sets preferences → Stored on user profile
3. Daily recommendations requested → Engine scores all meals for user context
4. User creates meal plan → AI generates or manual entry
5. Shopping list generated → Ingredients consolidated and scaled
6. User views meal → Detail page with ingredients, nutrition, videos
7. User rates meal → Feedback stored → Engine learns for future recommendations
8. URL/Image imported → Recipe parsed and added to catalog
