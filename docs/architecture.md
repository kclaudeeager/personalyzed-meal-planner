# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Clients                           │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  Mobile App   │  │  Web Dashboard│                │
│  │  (Expo/RN)    │  │  (Next.js 15) │                │
│  └──────┬───────┘  └──────┬───────┘                 │
└─────────┼──────────────────┼────────────────────────┘
          │                  │
          │    REST API      │
          ▼                  ▼
┌─────────────────────────────────────────────────────┐
│                  API Layer (NestJS)                   │
│  ┌────────┐ ┌────────┐ ┌──────────────┐ ┌────────┐ │
│  │ Users  │ │ Meals  │ │Recommendations│ │Feedback│ │
│  └────┬───┘ └────┬───┘ └──────┬───────┘ └────┬───┘ │
│       │          │            │               │      │
│       ▼          ▼            ▼               ▼      │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Prisma ORM                          │ │
│  └──────────────────┬──────────────────────────────┘ │
└─────────────────────┼────────────────────────────────┘
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
  users/
    users.module.ts       → Module definition
    users.controller.ts   → REST endpoint handlers
    users.service.ts      → Business logic
    users.dto.ts          → Request validation (class-validator)
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

## Data Flow

1. User registers → Clerk authenticates → User record created in PostgreSQL
2. User sets preferences → Stored on user profile
3. Daily recommendations requested → Engine scores all meals for user context
4. User views meal → Detail page with ingredients, nutrition, videos
5. User rates meal → Feedback stored → Engine learns for future recommendations
