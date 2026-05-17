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

---

# 2. Recommended Stack

## Frontend

### Mobile App
- React Native + Expo
- TypeScript
- Expo Router
- React Query
- Zustand (state management)
- NativeWind or Tailwind RN

### Web Dashboard
- Next.js 15
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui

---

## Backend

### API Layer
- NestJS
- TypeScript
- REST + GraphQL hybrid architecture
- Swagger/OpenAPI documentation

### Authentication
- Clerk
OR
- Auth0

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

### Future Evolution
- Collaborative filtering
- Vector embeddings
- LLM-powered contextual recommendations

### AI Services
- OpenAI API
- Local recommendation scoring services

---

## Infrastructure

### Hosting
- Railway (MVP)
OR
- Render

### Future Scale
- AWS
- Kubernetes

### Storage
- Cloudinary
OR
- AWS S3

### CI/CD
- GitHub Actions

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
  ai-engine/
  shared/
  config/

infra/
  docker/
  terraform/

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
- age
- gender
- household_size
- dietary_preferences
- allergies
- budget_range
- cooking_skill
- activity_level

---

## 4.2 Meal Module

Responsibilities:
- Meal metadata
- Ingredients
- Nutrition profiles
- Cooking instructions
- Video references

Key Fields:
- meal_name
- ingredients
- preparation_time
- estimated_cost
- calories
- tags
- cuisine_type
- complexity

---

## 4.3 Recommendation Engine

Responsibilities:
- Meal scoring
- User-context adaptation
- Feedback processing
- Recommendation ranking

Inputs:
- user preferences
- meal history
- budget
- time constraints
- activity data
- meal ratings

Outputs:
- breakfast recommendations
- lunch recommendations
- dinner recommendations

---

## 4.4 Feedback Module

Responsibilities:
- User meal ratings
- Skip tracking
- Engagement tracking
- Taste learning

Feedback Types:
- liked
- disliked
- too expensive
- too difficult
- too repetitive
- too time consuming

---

## 4.5 Video Content Module

Responsibilities:
- Store tutorial references
- Attach cooking videos to meals
- Creator management

Sources:
- YouTube
- TikTok
- Original content

---

# 5. Database Design (Initial)

## Users

```sql
users
- id
- email
- full_name
- age_range
- household_size
- budget_level
- activity_level
- created_at
```

---

## Meals

```sql
meals
- id
- title
- description
- preparation_time
- estimated_cost
- calories
- cuisine_type
- complexity
```

---

## Ingredients

```sql
ingredients
- id
- name
- local_availability
- average_cost
```

---

## Meal Ingredients

```sql
meal_ingredients
- meal_id
- ingredient_id
- quantity
```

---

## Recommendations

```sql
recommendations
- id
- user_id
- meal_id
- recommendation_score
- meal_type
- created_at
```

---

## Feedback

```sql
feedback
- id
- user_id
- meal_id
- rating
- feedback_type
- comment
```

---

# 6. Initial Recommendation Algorithm

## Phase 1 — Rule-Based Scoring

Example Logic:

```typescript
score =
  preferenceMatch +
  budgetCompatibility +
  cookingTimeCompatibility +
  nutritionScore +
  historicalEngagement
```

Rules:
- Reduce repeated meals
- Prefer affordable meals
- Prioritize liked meals
- Match user cooking skill

---

## Phase 2 — Behavioral Learning

Add:
- collaborative filtering
- recommendation weighting
- user similarity analysis

---

## Phase 3 — AI Personalization

Add:
- conversational assistant
- ingredient substitution
- adaptive weekly planning
- predictive recommendations

---

# 7. API Design

## REST Endpoints

### Auth
```http
POST /auth/register
POST /auth/login
```

### Users
```http
GET /users/me
PATCH /users/preferences
```

### Meals
```http
GET /meals
GET /meals/:id
```

### Recommendations
```http
GET /recommendations/daily
```

### Feedback
```http
POST /feedback
```

---

# 8. AI-Agent Friendly Engineering Rules

## Mandatory Standards

- TypeScript everywhere
- Strong typing
- Shared interfaces
- Small isolated modules
- OpenAPI documentation
- Clean architecture
- Feature-based structure

---

## Coding Conventions

### Naming
- camelCase for variables
- PascalCase for components
- kebab-case for folders

### Folder Strategy
Feature-based architecture:

```bash
modules/
  users/
  meals/
  recommendations/
  feedback/
```

---

## Documentation Requirements

Every module must include:
- README.md
- architecture notes
- API examples
- data contracts

---

# 9. Initial Development Phases

## Phase 1 — Foundation

Deliverables:
- monorepo setup
- authentication
- PostgreSQL schema
- Prisma setup
- API scaffolding
- mobile shell

Duration:
2 weeks

---

## Phase 2 — Meal System

Deliverables:
- meal CRUD
- ingredient system
- video attachment
- meal categorization

Duration:
2 weeks

---

## Phase 3 — Recommendation Engine

Deliverables:
- rule-based recommendation engine
- scoring system
- daily recommendations
- recommendation persistence

Duration:
3 weeks

---

## Phase 4 — Feedback Loop

Deliverables:
- meal feedback
- engagement tracking
- personalization improvements

Duration:
2 weeks

---

## Phase 5 — AI Features

Deliverables:
- conversational meal assistant
- smart substitutions
- adaptive planning

Duration:
ongoing

---

# 10. Immediate Next Steps

## Week 1 Priorities

1. Setup monorepo
2. Setup PostgreSQL
3. Setup NestJS API
4. Setup Prisma schema
5. Setup Expo mobile app
6. Define initial meal dataset
7. Build onboarding flow

---

# 11. Success Metrics

## Product Metrics
- daily active users
- recommendation acceptance rate
- repeat usage
- retention
- average meals viewed

## Recommendation Metrics
- recommendation click-through rate
- meal completion rate
- recommendation satisfaction score

---

# 12. Long-Term Vision

The long-term objective is to build a localized food intelligence platform for Africa capable of:

- contextual nutrition guidance
- adaptive meal planning
- grocery optimization
- health integration
- AI-assisted household food management

