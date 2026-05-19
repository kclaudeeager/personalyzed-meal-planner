// =============================================================================
// Constants — Shared across the platform
// =============================================================================

/** Default currency for all cost calculations */
export const CURRENCY = 'RWF';

/** Default locale */
export const DEFAULT_LOCALE = 'rw-RW';

/** Budget thresholds in RWF per meal */
export const BUDGET_THRESHOLDS = {
  LOW: { min: 0, max: 2000 },
  MEDIUM: { min: 2000, max: 5000 },
  HIGH: { min: 5000, max: Infinity },
} as const;

/** Preparation time categories in minutes */
export const PREP_TIME_CATEGORIES = {
  QUICK: { min: 0, max: 15 },
  MODERATE: { min: 15, max: 45 },
  LENGTHY: { min: 45, max: Infinity },
} as const;

/** Maximum number of daily recommendations per meal type */
export const MAX_RECOMMENDATIONS_PER_MEAL_TYPE = 5;

/** Minimum rating value */
export const MIN_RATING = 1;

/** Maximum rating value */
export const MAX_RATING = 5;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** Rwandan cuisine tags */
export const RWANDAN_CUISINE_TAGS = [
  'isombe',
  'ubugali',
  'brochette',
  'igisafuria',
  'mizuzu',
  'akabenz',
  'sambaza',
  'ibirayi',
  'ibitoke',
  'amandazi',
  'umunyige',
  'urwagwa',
] as const;

/** Day name mapping (0=Sunday ... 6=Saturday) */
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Full day names */
export const DAY_NAMES_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

/** Default number of days for a meal plan */
export const MEAL_PLAN_DAYS = 7;

/** Meal plan week start day (1 = Monday) */
export const WEEK_START_DAY = 1;

/** Shopping list grouping categories */
export const SHOPPING_LIST_CATEGORIES = [
  'Produce',
  'Grains & Starches',
  'Protein',
  'Dairy',
  'Spices & Seasonings',
  'Oils & Fats',
  'Beverages',
  'Other',
] as const;

/** Recipe import user agent */
export const RECIPE_IMPORT_USER_AGENT =
  'Mozilla/5.0 (compatible; MealPlatformBot/1.0; +https://mealplatform.rw/bot)';
