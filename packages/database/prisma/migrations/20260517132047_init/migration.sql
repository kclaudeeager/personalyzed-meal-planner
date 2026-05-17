-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "CuisineType" AS ENUM ('RWANDAN', 'EAST_AFRICAN', 'AFRICAN', 'INTERNATIONAL', 'FUSION');

-- CreateEnum
CREATE TYPE "Complexity" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "BudgetLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "CookingSkill" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('LIKED', 'DISLIKED', 'TOO_EXPENSIVE', 'TOO_DIFFICULT', 'TOO_REPETITIVE', 'TOO_TIME_CONSUMING');

-- CreateEnum
CREATE TYPE "VideoSource" AS ENUM ('YOUTUBE', 'TIKTOK', 'ORIGINAL');

-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('UNDER_18', 'AGE_18_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_55', 'OVER_55');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "LocalAvailability" AS ENUM ('COMMON', 'SEASONAL', 'RARE', 'IMPORTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ageRange" "AgeRange",
    "gender" "Gender",
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "budgetLevel" "BudgetLevel" NOT NULL DEFAULT 'MEDIUM',
    "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'MODERATE',
    "cookingSkill" "CookingSkill" NOT NULL DEFAULT 'INTERMEDIATE',
    "dietaryPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preparationTime" INTEGER NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "calories" INTEGER NOT NULL,
    "cuisineType" "CuisineType" NOT NULL DEFAULT 'RWANDAN',
    "complexity" "Complexity" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localAvailability" "LocalAvailability" NOT NULL DEFAULT 'COMMON',
    "averageCost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_ingredients" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "meal_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_profiles" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL,
    "vitamins" TEXT,

    CONSTRAINT "nutrition_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_references" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" "VideoSource" NOT NULL DEFAULT 'YOUTUBE',
    "title" TEXT NOT NULL,
    "creatorName" TEXT,

    CONSTRAINT "video_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "recommendationScore" DOUBLE PRECISION NOT NULL,
    "mealType" "MealType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedbackType" "FeedbackType" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferenceKey" TEXT NOT NULL,
    "preferenceValue" TEXT NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "meal_ingredients_mealId_ingredientId_key" ON "meal_ingredients"("mealId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_profiles_mealId_key" ON "nutrition_profiles"("mealId");

-- CreateIndex
CREATE INDEX "recommendations_userId_createdAt_idx" ON "recommendations"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "feedback_userId_mealId_idx" ON "feedback"("userId", "mealId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_preferenceKey_key" ON "user_preferences"("userId", "preferenceKey");

-- CreateIndex
CREATE INDEX "health_metrics_userId_metricType_idx" ON "health_metrics"("userId", "metricType");

-- AddForeignKey
ALTER TABLE "meal_ingredients" ADD CONSTRAINT "meal_ingredients_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_ingredients" ADD CONSTRAINT "meal_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_references" ADD CONSTRAINT "video_references_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_metrics" ADD CONSTRAINT "health_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
