// =============================================================================
// API Types — Request/Response contracts for REST endpoints
// =============================================================================

import type {
  ActivityLevel,
  AgeRange,
  BudgetLevel,
  CookingSkill,
  FeedbackType,
  Gender,
} from './enums';
import type { Feedback, Meal, Recommendation, User } from './models';

// ---------------------------------------------------------------------------
// Generic API Response
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface UpdatePreferencesRequest {
  ageRange?: AgeRange;
  gender?: Gender;
  householdSize?: number;
  budgetLevel?: BudgetLevel;
  activityLevel?: ActivityLevel;
  cookingSkill?: CookingSkill;
  dietaryPreferences?: string[];
  allergies?: string[];
}

export type UserProfileResponse = ApiResponse<User>;

// ---------------------------------------------------------------------------
// Meals
// ---------------------------------------------------------------------------

export interface MealFilters {
  cuisineType?: string;
  complexity?: string;
  maxPreparationTime?: number;
  maxCost?: number;
  tags?: string[];
  search?: string;
}

export type MealListResponse = PaginatedResponse<Meal>;
export type MealDetailResponse = ApiResponse<
  Meal & {
    ingredients: Array<{
      name: string;
      quantity: number;
      unit: string;
      averageCost: number;
    }>;
    nutritionProfile: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    } | null;
    videos: Array<{
      url: string;
      source: string;
      title: string;
    }>;
  }
>;

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export interface DailyRecommendationsRequest {
  date?: string; // ISO date
}

export interface DailyRecommendationsResponse {
  success: boolean;
  data: {
    date: string;
    breakfast: RecommendedMeal[];
    lunch: RecommendedMeal[];
    dinner: RecommendedMeal[];
  };
}

export interface RecommendedMeal {
  recommendation: Recommendation;
  meal: Meal;
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export interface SubmitFeedbackRequest {
  mealId: string;
  rating: number;
  feedbackType: FeedbackType;
  comment?: string;
}

export type FeedbackResponse = ApiResponse<Feedback>;

// ---------------------------------------------------------------------------
// Health Metrics
// ---------------------------------------------------------------------------

export interface RecordHealthMetricRequest {
  metricType: string;
  value: number;
}
