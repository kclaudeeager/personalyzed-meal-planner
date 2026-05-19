# API Design

Base URL: `http://localhost:4000/api`

Swagger UI: `http://localhost:4000/api/docs`

## Modules

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with DB status |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (paginated) |
| POST | `/api/users` | Create user (after Clerk registration) |
| GET | `/api/users/:id` | Get user profile with preferences |
| GET | `/api/users/clerk/:clerkId` | Get user by Clerk ID |
| PATCH | `/api/users/:id/preferences` | Update user preferences |

### Meals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals` | List meals (filterable, paginated) |
| GET | `/api/meals/:id` | Get meal details with ingredients, nutrition, videos |
| POST | `/api/meals` | Create a new meal |
| POST | `/api/meals/import` | Import a recipe from a URL (schema.org parsing) |
| POST | `/api/meals/shopping-list` | Generate shopping list from a meal plan |

**Query Parameters for GET /api/meals:**

| Param | Type | Description |
|-------|------|-------------|
| `cuisineType` | enum | Filter by cuisine |
| `complexity` | enum | Filter by difficulty |
| `maxPreparationTime` | number | Max prep time in minutes |
| `maxCost` | number | Max cost in RWF |
| `search` | string | Search title/description |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations/daily/:userId` | Get daily recommendations (breakfast, lunch, dinner) |

### Feedback

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit meal feedback |
| GET | `/api/feedback/user/:userId` | Get user's feedback history |
| GET | `/api/feedback/meal/:mealId` | Get meal feedback with stats |

### Meal Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meal-plans?userId=x` | Create a weekly meal plan |
| GET | `/api/meal-plans/user/:userId` | Get all meal plans for a user |
| GET | `/api/meal-plans/:id` | Get meal plan by ID with entries |
| POST | `/api/meal-plans/entry` | Set a meal plan entry (create or update by day+type) |
| DELETE | `/api/meal-plans/entry/:entryId` | Remove a meal plan entry |
| POST | `/api/meal-plans/generate/:userId` | Generate meal plan from latest recommendations |

### Shopping Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shopping-lists/user/:userId` | Get all shopping lists for a user |
| GET | `/api/shopping-lists/:id` | Get shopping list with items |
| PATCH | `/api/shopping-lists/item/:itemId` | Toggle item checked state |
| GET | `/api/shopping-lists/:id/export` | Export as plain text |
| DELETE | `/api/shopping-lists/:id` | Delete a shopping list |

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```
