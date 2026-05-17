# API Design

Base URL: `http://localhost:4000/api`

Swagger UI: `http://localhost:4000/api/docs`

## Endpoints

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with DB status |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create user (after Clerk registration) |
| GET | `/api/users/:id` | Get user profile with preferences |
| GET | `/api/users/clerk/:clerkId` | Get user by Clerk ID |
| PATCH | `/api/users/:id/preferences` | Update user preferences |

### Meals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals` | List meals (filterable) |
| GET | `/api/meals/:id` | Get meal details with ingredients, nutrition, videos |
| POST | `/api/meals` | Create a new meal |

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
| GET | `/api/recommendations/daily/:userId` | Get daily recommendations |

### Feedback

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit meal feedback |
| GET | `/api/feedback/user/:userId` | Get user's feedback history |
| GET | `/api/feedback/meal/:mealId` | Get meal feedback with stats |

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
