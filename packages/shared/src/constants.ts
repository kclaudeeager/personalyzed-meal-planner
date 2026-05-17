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
  'ikinyiga',
  'urwagwa',
] as const;
