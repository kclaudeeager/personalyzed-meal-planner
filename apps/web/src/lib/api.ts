// =============================================================================
// API Client — Server-side data fetching from NestJS backend
// =============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const API_BASE = API_URL + '/api';
export const API_HOST = API_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    // Disable caching for dynamic data
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function getHealth() {
  return request<{ status: string; timestamp: string; services: { database: string } }>('/api/health');
}

// ---------------------------------------------------------------------------
// Meals
// ---------------------------------------------------------------------------

export async function getMeals(page = 1, limit = 20) {
  return request<{
    data: Array<{
      id: string;
      title: string;
      description: string;
      preparationTime: number;
      estimatedCost: number;
      calories: number;
      cuisineType: string;
      complexity: string;
      tags: string[];
      imageUrl: string | null;
      createdAt: string;
      _count: { feedback: number };
    }>;
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/api/meals?page=${page}&limit=${limit}`);
}

export async function getMeal(id: string) {
  return request<{
    id: string;
    title: string;
    description: string;
    preparationTime: number;
    estimatedCost: number;
    calories: number;
    cuisineType: string;
    complexity: string;
    tags: string[];
    imageUrl: string | null;
    createdAt: string;
    ingredients: unknown[];
    nutritionProfile: unknown | null;
    videos: unknown[];
    _count: { feedback: number; recommendations: number };
  }>(`/api/meals/${id}`);
}

export async function createMeal(data: {
  title: string;
  description: string;
  preparationTime: number;
  estimatedCost: number;
  calories: number;
  cuisineType?: string;
  complexity?: string;
  tags?: string[];
  imageUrl?: string;
}) {
  return request('/api/meals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers() {
  // No list endpoint yet — fetch by known IDs or use clerk lookup
  return request<{
    id: string;
    clerkId: string;
    email: string;
    fullName: string;
    ageRange: string | null;
    gender: string | null;
    householdSize: number;
    budgetLevel: string;
    activityLevel: string;
    cookingSkill: string;
    dietaryPreferences: string[];
    allergies: string[];
    createdAt: string;
  }[]>('/api/users');
}

export async function getUser(id: string) {
  return request(`/api/users/${id}`);
}

export async function createUser(data: {
  clerkId: string;
  email: string;
  fullName: string;
}) {
  return request('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export async function getFeedbackStats() {
  return request<{
    totalReviews: number;
    averageRating: number;
  }>('/api/feedback/stats');
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export async function getRecommendationStats() {
  return request<{
    totalGenerated: number;
    todayCount: number;
  }>('/api/recommendations/stats');
}

// ---------------------------------------------------------------------------
// Meal Plans
// ---------------------------------------------------------------------------

export async function getMealPlans(userId: string) {
  return request<{ success: boolean; data: unknown[] }>(`/api/meal-plans/user/${userId}`);
}

export async function createMealPlan(userId: string, weekStart: string, name?: string) {
  return request(`/api/meal-plans?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ weekStart, name }),
  });
}

// ---------------------------------------------------------------------------
// Shopping Lists
// ---------------------------------------------------------------------------

export async function getShoppingLists(userId: string) {
  return request<{ success: boolean; data: unknown[] }>(`/api/shopping-lists/user/${userId}`);
}

// ---------------------------------------------------------------------------
// Recipe Import
// ---------------------------------------------------------------------------

export async function importRecipe(url: string) {
  return request<{ success: boolean; data: unknown; message: string }>('/api/meals/import', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}
