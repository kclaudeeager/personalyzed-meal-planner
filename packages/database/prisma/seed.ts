import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Check if data already exists (idempotent)
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`  ✅ Database already has data (${existingUsers} user(s)) — skipping`);
    return;
  }

  // ── Ingredients ───────────────────────────────────────────────
  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { name: 'Irish Potatoes', localAvailability: 'COMMON', averageCost: 500 } }),
    prisma.ingredient.create({ data: { name: 'Sweet Potatoes', localAvailability: 'COMMON', averageCost: 400 } }),
    prisma.ingredient.create({ data: { name: 'Cassava', localAvailability: 'COMMON', averageCost: 300 } }),
    prisma.ingredient.create({ data: { name: 'Maize Flour', localAvailability: 'COMMON', averageCost: 600 } }),
    prisma.ingredient.create({ data: { name: 'Beans', localAvailability: 'COMMON', averageCost: 800 } }),
    prisma.ingredient.create({ data: { name: 'Peas', localAvailability: 'COMMON', averageCost: 700 } }),
    prisma.ingredient.create({ data: { name: 'Rice', localAvailability: 'COMMON', averageCost: 1000 } }),
    prisma.ingredient.create({ data: { name: 'Plantains', localAvailability: 'COMMON', averageCost: 500 } }),
    prisma.ingredient.create({ data: { name: 'Tomatoes', localAvailability: 'COMMON', averageCost: 300 } }),
    prisma.ingredient.create({ data: { name: 'Onions', localAvailability: 'COMMON', averageCost: 200 } }),
    prisma.ingredient.create({ data: { name: 'Cooking Oil', localAvailability: 'COMMON', averageCost: 1500 } }),
    prisma.ingredient.create({ data: { name: 'Salt', localAvailability: 'COMMON', averageCost: 100 } }),
    prisma.ingredient.create({ data: { name: 'Peanuts / Groundnuts', localAvailability: 'COMMON', averageCost: 1000 } }),
    prisma.ingredient.create({ data: { name: 'Amaranth (Dodo)', localAvailability: 'COMMON', averageCost: 300 } }),
    prisma.ingredient.create({ data: { name: 'Spinach', localAvailability: 'COMMON', averageCost: 400 } }),
    prisma.ingredient.create({ data: { name: 'Eggplant', localAvailability: 'COMMON', averageCost: 500 } }),
    prisma.ingredient.create({ data: { name: 'Cabbage', localAvailability: 'COMMON', averageCost: 400 } }),
    prisma.ingredient.create({ data: { name: 'Carrots', localAvailability: 'COMMON', averageCost: 300 } }),
    prisma.ingredient.create({ data: { name: 'Green Peppers', localAvailability: 'COMMON', averageCost: 500 } }),
    prisma.ingredient.create({ data: { name: 'Eggs', localAvailability: 'COMMON', averageCost: 200 } }),
    prisma.ingredient.create({ data: { name: 'Milk', localAvailability: 'COMMON', averageCost: 1200 } }),
    prisma.ingredient.create({ data: { name: 'Yogurt', localAvailability: 'COMMON', averageCost: 800 } }),
    prisma.ingredient.create({ data: { name: 'Beef', localAvailability: 'COMMON', averageCost: 3500 } }),
    prisma.ingredient.create({ data: { name: 'Chicken', localAvailability: 'COMMON', averageCost: 3000 } }),
    prisma.ingredient.create({ data: { name: 'Fish (Sambaza)', localAvailability: 'SEASONAL', averageCost: 2000 } }),
    prisma.ingredient.create({ data: { name: 'Goat Meat', localAvailability: 'COMMON', averageCost: 4000 } }),
    prisma.ingredient.create({ data: { name: 'Sorghum', localAvailability: 'COMMON', averageCost: 500 } }),
    prisma.ingredient.create({ data: { name: 'Avocado', localAvailability: 'COMMON', averageCost: 500 } }),
    prisma.ingredient.create({ data: { name: 'Bananas', localAvailability: 'COMMON', averageCost: 300 } }),
    prisma.ingredient.create({ data: { name: 'Mangoes', localAvailability: 'SEASONAL', averageCost: 500 } }),
    prisma.ingredient.create({ data: { name: 'Pineapple', localAvailability: 'SEASONAL', averageCost: 800 } }),
    prisma.ingredient.create({ data: { name: 'Garlic', localAvailability: 'COMMON', averageCost: 200 } }),
    prisma.ingredient.create({ data: { name: 'Ginger', localAvailability: 'COMMON', averageCost: 200 } }),
    prisma.ingredient.create({ data: { name: 'Cooking Bananas (Ibitoki)', localAvailability: 'COMMON', averageCost: 400 } }),
  ]);
  console.log(`  ✅ ${ingredients.length} ingredients created`);

  // Helper to find ingredient by name
  const ing = (name: string) => ingredients.find(i => i.name === name)!;

  // ── Meals ─────────────────────────────────────────────────────
  const meals = {
    breakfast1: await prisma.meal.create({
      data: {
        title: 'Ugali with Sukuma Wiki',
        description: 'Traditional maize flour porridge served with sautéed collard greens. A hearty breakfast staple across East Africa.',
        preparationTime: 20,
        estimatedCost: 800,
        calories: 420,
        cuisineType: 'RWANDAN',
        complexity: 'EASY',
        tags: ['breakfast', 'traditional', 'vegan-friendly', 'staple'],
      },
    }),
    breakfast2: await prisma.meal.create({
      data: {
        title: 'Millet Porridge (Uburo)',
        description: 'Warm and nourishing millet porridge made with milk and a touch of sugar. A traditional Rwandan breakfast that provides lasting energy.',
        preparationTime: 15,
        estimatedCost: 600,
        calories: 350,
        cuisineType: 'RWANDAN',
        complexity: 'EASY',
        tags: ['breakfast', 'traditional', 'porridge', 'nourishing'],
      },
    }),
    breakfast3: await prisma.meal.create({
      data: {
        title: 'Tea with Milk and Chapati',
        description: 'Rich Rwandan milk tea served with soft, layered chapati bread. A popular breakfast combination in Kigali households.',
        preparationTime: 30,
        estimatedCost: 700,
        calories: 380,
        cuisineType: 'RWANDAN',
        complexity: 'MEDIUM',
        tags: ['breakfast', 'tea', 'bread', 'popular'],
      },
    }),
    lunch1: await prisma.meal.create({
      data: {
        title: 'Ibihaza (Pumpkin Beans)',
        description: 'Mashed pumpkin mixed with boiled beans, sautéed with onions and tomatoes. A beloved Rwandan comfort food rich in fiber and vitamins.',
        preparationTime: 45,
        estimatedCost: 1200,
        calories: 520,
        cuisineType: 'RWANDAN',
        complexity: 'EASY',
        tags: ['lunch', 'traditional', 'vegan', 'comfort-food'],
      },
    }),
    lunch2: await prisma.meal.create({
      data: {
        title: 'Isombe with Rice',
        description: 'Cassava leaves pounded and cooked with eggplant, spinach, and ground peanuts, served over steamed rice. A classic Rwandan lunch.',
        preparationTime: 60,
        estimatedCost: 1500,
        calories: 580,
        cuisineType: 'RWANDAN',
        complexity: 'MEDIUM',
        tags: ['lunch', 'traditional', 'cassava-leaves', 'peanut'],
      },
    }),
    lunch3: await prisma.meal.create({
      data: {
        title: 'Brochettes with Plantains',
        description: 'Grilled skewers of marinated beef or goat meat served with fried plantains and a side of pili-pili sauce. A popular street food turned home lunch.',
        preparationTime: 50,
        estimatedCost: 2500,
        calories: 650,
        cuisineType: 'RWANDAN',
        complexity: 'MEDIUM',
        tags: ['lunch', 'grill', 'meat', 'street-food'],
      },
    }),
    dinner1: await prisma.meal.create({
      data: {
        title: 'Mizuzu (Fried Goat) with Chips',
        description: 'Crispy fried goat meat served with Rwandan-style french fries and a fresh tomato-onion salsa. A favorite weekend dinner.',
        preparationTime: 55,
        estimatedCost: 3500,
        calories: 720,
        cuisineType: 'RWANDAN',
        complexity: 'MEDIUM',
        tags: ['dinner', 'fried', 'goat', 'weekend'],
      },
    }),
    dinner2: await prisma.meal.create({
      data: {
        title: 'Fish in Coconut Sauce (Sambaza)',
        description: 'Lake Kivu sambaza (small fish) simmered in a rich coconut milk sauce with tomatoes, onions, and local spices. Served with steamed rice.',
        preparationTime: 40,
        estimatedCost: 3000,
        calories: 550,
        cuisineType: 'RWANDAN',
        complexity: 'MEDIUM',
        tags: ['dinner', 'fish', 'coconut', 'lake-kivu'],
      },
    }),
    dinner3: await prisma.meal.create({
      data: {
        title: 'Rwandan Chicken Stew',
        description: 'Slow-cooked chicken in a tomato and onion base with garlic, ginger, and local herbs. Served with boiled Irish potatoes and steamed amaranth.',
        preparationTime: 70,
        estimatedCost: 2800,
        calories: 620,
        cuisineType: 'RWANDAN',
        complexity: 'MEDIUM',
        tags: ['dinner', 'chicken', 'stew', 'family-meal'],
      },
    }),
    snack1: await prisma.meal.create({
      data: {
        title: 'Samosas with Chili Sauce',
        description: 'Crispy fried pastries filled with spiced ground beef and vegetables. Served with a tangy chili dipping sauce.',
        preparationTime: 35,
        estimatedCost: 1000,
        calories: 300,
        cuisineType: 'EAST_AFRICAN',
        complexity: 'HARD',
        tags: ['snack', 'fried', 'beef', 'appetizer'],
      },
    }),
    snack2: await prisma.meal.create({
      data: {
        title: 'Fresh Fruit Bowl',
        description: 'Seasonal Rwandan fruits — mango, pineapple, banana, and avocado — drizzled with local honey and lime.',
        preparationTime: 10,
        estimatedCost: 1200,
        calories: 250,
        cuisineType: 'RWANDAN',
        complexity: 'EASY',
        tags: ['snack', 'fruit', 'healthy', 'raw'],
      },
    }),
    snack3: await prisma.meal.create({
      data: {
        title: 'Mandazi (East African Donuts)',
        description: 'Lightly sweetened fried dough, slightly spiced with cardamom and coconut milk. A popular tea-time snack across Rwanda.',
        preparationTime: 40,
        estimatedCost: 500,
        calories: 280,
        cuisineType: 'EAST_AFRICAN',
        complexity: 'MEDIUM',
        tags: ['snack', 'fried', 'sweet', 'tea-time'],
      },
    }),
  };
  console.log(`  ✅ ${Object.keys(meals).length} meals created`);

  // ── Meal Ingredients ──────────────────────────────────────────
  await Promise.all([
    // Ugali with Sukuma Wiki
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast1.id, ingredientId: ing('Maize Flour').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast1.id, ingredientId: ing('Amaranth (Dodo)').id, quantity: 150, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast1.id, ingredientId: ing('Onions').id, quantity: 50, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast1.id, ingredientId: ing('Cooking Oil').id, quantity: 15, unit: 'ml' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast1.id, ingredientId: ing('Salt').id, quantity: 2, unit: 'g' } }),

    // Millet Porridge
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast2.id, ingredientId: ing('Sorghum').id, quantity: 150, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast2.id, ingredientId: ing('Milk').id, quantity: 250, unit: 'ml' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast2.id, ingredientId: ing('Bananas').id, quantity: 1, unit: 'piece' } }),

    // Tea with Chapati
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast3.id, ingredientId: ing('Milk').id, quantity: 200, unit: 'ml' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast3.id, ingredientId: ing('Maize Flour').id, quantity: 250, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.breakfast3.id, ingredientId: ing('Cooking Oil').id, quantity: 30, unit: 'ml' } }),

    // Ibihaza
    prisma.mealIngredient.create({ data: { mealId: meals.lunch1.id, ingredientId: ing('Beans').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch1.id, ingredientId: ing('Tomatoes').id, quantity: 100, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch1.id, ingredientId: ing('Onions').id, quantity: 50, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch1.id, ingredientId: ing('Cooking Oil').id, quantity: 20, unit: 'ml' } }),

    // Isombe with Rice
    prisma.mealIngredient.create({ data: { mealId: meals.lunch2.id, ingredientId: ing('Cassava').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch2.id, ingredientId: ing('Eggplant').id, quantity: 100, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch2.id, ingredientId: ing('Spinach').id, quantity: 100, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch2.id, ingredientId: ing('Peanuts / Groundnuts').id, quantity: 50, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch2.id, ingredientId: ing('Rice').id, quantity: 200, unit: 'g' } }),

    // Brochettes with Plantains
    prisma.mealIngredient.create({ data: { mealId: meals.lunch3.id, ingredientId: ing('Beef').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch3.id, ingredientId: ing('Plantains').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch3.id, ingredientId: ing('Cooking Oil').id, quantity: 30, unit: 'ml' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch3.id, ingredientId: ing('Tomatoes').id, quantity: 100, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.lunch3.id, ingredientId: ing('Onions').id, quantity: 50, unit: 'g' } }),

    // Mizuzu
    prisma.mealIngredient.create({ data: { mealId: meals.dinner1.id, ingredientId: ing('Goat Meat').id, quantity: 250, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner1.id, ingredientId: ing('Irish Potatoes').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner1.id, ingredientId: ing('Cooking Oil').id, quantity: 50, unit: 'ml' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner1.id, ingredientId: ing('Garlic').id, quantity: 5, unit: 'g' } }),

    // Fish in Coconut Sauce
    prisma.mealIngredient.create({ data: { mealId: meals.dinner2.id, ingredientId: ing('Fish (Sambaza)').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner2.id, ingredientId: ing('Rice').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner2.id, ingredientId: ing('Tomatoes').id, quantity: 100, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner2.id, ingredientId: ing('Onions').id, quantity: 50, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner2.id, ingredientId: ing('Cooking Oil').id, quantity: 20, unit: 'ml' } }),

    // Chicken Stew
    prisma.mealIngredient.create({ data: { mealId: meals.dinner3.id, ingredientId: ing('Chicken').id, quantity: 250, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner3.id, ingredientId: ing('Irish Potatoes').id, quantity: 200, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner3.id, ingredientId: ing('Tomatoes').id, quantity: 100, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner3.id, ingredientId: ing('Onions').id, quantity: 50, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner3.id, ingredientId: ing('Garlic').id, quantity: 5, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner3.id, ingredientId: ing('Ginger').id, quantity: 5, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.dinner3.id, ingredientId: ing('Amaranth (Dodo)').id, quantity: 100, unit: 'g' } }),

    // Samosas
    prisma.mealIngredient.create({ data: { mealId: meals.snack1.id, ingredientId: ing('Beef').id, quantity: 150, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.snack1.id, ingredientId: ing('Onions').id, quantity: 50, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.snack1.id, ingredientId: ing('Cooking Oil').id, quantity: 100, unit: 'ml' } }),

    // Fruit Bowl
    prisma.mealIngredient.create({ data: { mealId: meals.snack2.id, ingredientId: ing('Mangoes').id, quantity: 1, unit: 'piece' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.snack2.id, ingredientId: ing('Pineapple').id, quantity: 150, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.snack2.id, ingredientId: ing('Bananas').id, quantity: 1, unit: 'piece' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.snack2.id, ingredientId: ing('Avocado').id, quantity: 1, unit: 'piece' } }),

    // Mandazi
    prisma.mealIngredient.create({ data: { mealId: meals.snack3.id, ingredientId: ing('Maize Flour').id, quantity: 300, unit: 'g' } }),
    prisma.mealIngredient.create({ data: { mealId: meals.snack3.id, ingredientId: ing('Cooking Oil').id, quantity: 50, unit: 'ml' } }),
  ]);
  console.log('  ✅ Meal-ingredient relationships created');

  // ── Nutrition Profiles ────────────────────────────────────────
  await Promise.all([
    prisma.nutritionProfile.create({ data: { mealId: meals.breakfast1.id, protein: 10, carbs: 75, fat: 8, fiber: 6, vitamins: 'Vitamin A, C, K' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.breakfast2.id, protein: 8, carbs: 65, fat: 5, fiber: 4, vitamins: 'B vitamins, Iron' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.breakfast3.id, protein: 7, carbs: 55, fat: 12, fiber: 2 } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.lunch1.id, protein: 18, carbs: 80, fat: 10, fiber: 15, vitamins: 'Vitamin A, C, B6' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.lunch2.id, protein: 15, carbs: 85, fat: 14, fiber: 12, vitamins: 'Iron, Calcium, Vitamin C' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.lunch3.id, protein: 35, carbs: 60, fat: 22, fiber: 5, vitamins: 'B12, Iron, Zinc' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.dinner1.id, protein: 40, carbs: 55, fat: 30, fiber: 4, vitamins: 'B12, Iron' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.dinner2.id, protein: 28, carbs: 60, fat: 18, fiber: 3, vitamins: 'Omega-3, Vitamin D, Calcium' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.dinner3.id, protein: 32, carbs: 50, fat: 20, fiber: 8, vitamins: 'Vitamin A, B6, Iron' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.snack1.id, protein: 18, carbs: 25, fat: 15, fiber: 2, vitamins: 'B12' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.snack2.id, protein: 4, carbs: 55, fat: 10, fiber: 8, vitamins: 'Vitamin C, A, Potassium' } }),
    prisma.nutritionProfile.create({ data: { mealId: meals.snack3.id, protein: 5, carbs: 40, fat: 12, fiber: 1 } }),
  ]);
  console.log('  ✅ Nutrition profiles created');

  // ── Video References ──────────────────────────────────────────
  await Promise.all([
    prisma.videoReference.create({
      data: {
        mealId: meals.lunch3.id,
        url: 'https://www.youtube.com/watch?v=example-brochettes',
        source: 'YOUTUBE',
        title: 'How to Make Rwandan Brochettes',
        creatorName: 'Rwandan Cooking',
      },
    }),
    prisma.videoReference.create({
      data: {
        mealId: meals.dinner3.id,
        url: 'https://www.youtube.com/watch?v=example-chicken-stew',
        source: 'YOUTUBE',
        title: 'Traditional Rwandan Chicken Stew Recipe',
        creatorName: 'Kigali Kitchen',
      },
    }),
  ]);
  console.log('  ✅ Video references created');

  // ── Test User ─────────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      clerkId: 'test-user-clerk-1',
      email: 'test@rwandan-meals.com',
      fullName: 'Alice Mugisha',
      ageRange: 'AGE_26_35',
      gender: 'FEMALE',
      householdSize: 4,
      budgetLevel: 'MEDIUM',
      activityLevel: 'MODERATE',
      cookingSkill: 'INTERMEDIATE',
      dietaryPreferences: ['local', 'traditional'],
      allergies: [],
    },
  });
  console.log(`  ✅ Test user created: ${user.email}`);

  // ── Meal Plan for this week ────────────────────────────────────
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: user.id,
      weekStart: monday,
      weekEnd: sunday,
      name: 'Weekly Meal Plan',
    },
  });

  const mealMap: Record<string, { id: string; type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' }> = {};
  for (const [key, meal] of Object.entries(meals)) {
    const type = key.startsWith('breakfast') ? 'BREAKFAST' as const
      : key.startsWith('lunch') ? 'LUNCH' as const
      : key.startsWith('dinner') ? 'DINNER' as const
      : 'SNACK' as const;
    mealMap[key] = { id: meal.id, type };
  }

  const entries: Array<{ mealPlanId: string; mealId: string; mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; dayOfWeek: number; sortOrder: number }> = [];
  const days = [1, 2, 3, 4, 5, 6, 0];

  for (const day of days) {
    if (day >= 1 && day <= 5) {
      entries.push(
        { mealPlanId: mealPlan.id, mealId: mealMap.breakfast1.id, mealType: 'BREAKFAST', dayOfWeek: day, sortOrder: 0 },
        { mealPlanId: mealPlan.id, mealId: mealMap.lunch1.id, mealType: 'LUNCH', dayOfWeek: day, sortOrder: 0 },
        { mealPlanId: mealPlan.id, mealId: mealMap.dinner3.id, mealType: 'DINNER', dayOfWeek: day, sortOrder: 0 },
      );
    } else {
      entries.push(
        { mealPlanId: mealPlan.id, mealId: mealMap.breakfast3.id, mealType: 'BREAKFAST', dayOfWeek: day, sortOrder: 0 },
        { mealPlanId: mealPlan.id, mealId: mealMap.lunch3.id, mealType: 'LUNCH', dayOfWeek: day, sortOrder: 0 },
        { mealPlanId: mealPlan.id, mealId: mealMap.dinner1.id, mealType: 'DINNER', dayOfWeek: day, sortOrder: 0 },
        { mealPlanId: mealPlan.id, mealId: mealMap.snack1.id, mealType: 'SNACK', dayOfWeek: day, sortOrder: 1 },
      );
    }
  }

  await prisma.mealPlanEntry.createMany({ data: entries });
  console.log(`  ✅ Meal plan with ${entries.length} entries created (${monday.toDateString()} - ${sunday.toDateString()})`);

  // ── Recommendations ───────────────────────────────────────────
  await Promise.all(
    Object.values(mealMap).map(m =>
      prisma.recommendation.create({
        data: {
          userId: user.id,
          mealId: m.id,
          recommendationScore: Math.random() * 0.5 + 0.5,
          mealType: m.type,
        },
      })
    ),
  );
  console.log('  ✅ Recommendations generated');

  // ── Shopping List ─────────────────────────────────────────────
  const shoppingList = await prisma.shoppingList.create({
    data: {
      userId: user.id,
      name: 'Weekly Groceries',
      weekStart: monday,
      weekEnd: sunday,
    },
  });

  const listItems = [
    { ingredientName: 'Irish Potatoes', quantity: 2, unit: 'kg', estimatedCost: 1000 },
    { ingredientName: 'Rice', quantity: 1, unit: 'kg', estimatedCost: 1000 },
    { ingredientName: 'Beans', quantity: 500, unit: 'g', estimatedCost: 800 },
    { ingredientName: 'Chicken', quantity: 1, unit: 'whole', estimatedCost: 3000 },
    { ingredientName: 'Goat Meat', quantity: 500, unit: 'g', estimatedCost: 4000 },
    { ingredientName: 'Tomatoes', quantity: 500, unit: 'g', estimatedCost: 600 },
    { ingredientName: 'Onions', quantity: 500, unit: 'g', estimatedCost: 400 },
    { ingredientName: 'Cooking Oil', quantity: 1, unit: 'L', estimatedCost: 1500 },
    { ingredientName: 'Maize Flour', quantity: 2, unit: 'kg', estimatedCost: 1200 },
    { ingredientName: 'Amaranth (Dodo)', quantity: 300, unit: 'g', estimatedCost: 300 },
    { ingredientName: 'Milk', quantity: 1, unit: 'L', estimatedCost: 1200 },
    { ingredientName: 'Bananas', quantity: 6, unit: 'pieces', estimatedCost: 600 },
  ];

  for (const item of listItems) {
    const matchedIngredient = ingredients.find(i => i.name === item.ingredientName);
    await prisma.shoppingListItem.create({
      data: {
        shoppingListId: shoppingList.id,
        ingredientId: matchedIngredient?.id ?? null,
        ingredientName: item.ingredientName,
        quantity: item.quantity,
        unit: item.unit,
        estimatedCost: item.estimatedCost,
      },
    });
  }

  const totalCost = listItems.reduce((sum, i) => sum + i.estimatedCost, 0);
  await prisma.shoppingList.update({
    where: { id: shoppingList.id },
    data: { totalCost },
  });
  console.log(`  ✅ Shopping list with ${listItems.length} items created (total: ${totalCost} RWF)`);

  // ── Feedback samples ──────────────────────────────────────────
  const likedMeals = [meals.lunch1, meals.dinner3, meals.snack2];
  const dislikedMeals = [meals.breakfast1];
  await Promise.all([
    ...likedMeals.map(m =>
      prisma.feedback.create({
        data: {
          userId: user.id,
          mealId: m.id,
          rating: 4,
          feedbackType: 'LIKED',
          comment: 'Delicious and authentic!',
        },
      })
    ),
    prisma.feedback.create({
      data: {
        userId: user.id,
        mealId: dislikedMeals[0].id,
        rating: 2,
        feedbackType: 'TOO_REPETITIVE',
        comment: 'Would like more variety for breakfast.',
      },
    }),
  ]);
  console.log('  ✅ Sample feedback created');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
