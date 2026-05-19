import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { apiClient } from '../../src/lib/api-client';
import { useUserStore } from '../../src/store/user-store';

const API = 'http://localhost:4000/api';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
const MEAL_LABELS: Record<string, string> = { BREAKFAST: '☀️', LUNCH: '🌤️', DINNER: '🌙' };

interface Meal {
  id: string;
  title: string;
  preparationTime: number;
  estimatedCost: number;
  calories: number;
}

interface MealPlanEntry {
  id: string;
  mealId: string;
  mealType: string;
  dayOfWeek: number;
  meal: Meal;
}

interface MealPlan {
  id: string;
  weekStart: string;
  name: string;
  entries: MealPlanEntry[];
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function HomeScreen() {
  const userId = useUserStore((s) => s.userId);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const weekStart = getMonday(today);

  useEffect(() => {
    if (userId) {
      fetchPlans();
    } else {
      setLoading(false);
    }
  }, [userId]);

  async function fetchPlans() {
    setLoading(true);
    try {
      const json = await apiClient<{ success: boolean; data: MealPlan[] }>(
        `/meal-plans/user/${userId}`,
      );
      setPlans(json.data ?? []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  const currentPlan = plans.find((p) => {
    const ws = new Date(p.weekStart);
    return formatDate(ws) === formatDate(weekStart);
  });

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function getEntriesForDay(day: number) {
    if (!currentPlan) return [];
    const dayEntries = currentPlan.entries.filter((e) => e.dayOfWeek === day);
    return MEAL_TYPES.map((type) => dayEntries.find((e) => e.mealType === type));
  }

  const timeOfDay = today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good {timeOfDay} 👋</Text>
        <Text style={styles.title}>This Week's Plan</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : !userId ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Welcome to Adaptive Meals</Text>
          <Text style={styles.emptyText}>
            Complete onboarding to get personalized meal recommendations
          </Text>
        </View>
      ) : currentPlan ? (
        <View style={styles.planContainer}>
          {/* Week Calendar Grid */}
          <View style={styles.calendarGrid}>
            {weekDates.map((date, dayIndex) => {
              const entries = getEntriesForDay(dayIndex);
              const isToday = formatDate(date) === formatDate(today);
              return (
                <View
                  key={dayIndex}
                  style={[styles.dayColumn, isToday && styles.todayColumn]}
                >
                  <Text style={[styles.dayName, isToday && styles.todayText]}>
                    {DAYS[dayIndex]}
                  </Text>
                  <Text style={[styles.dayNumber, isToday && styles.todayText]}>
                    {date.getDate()}
                  </Text>
                  {entries.map((entry, idx) =>
                    entry ? (
                      <View key={idx} style={styles.mealChip}>
                        <Text style={styles.mealChipIcon}>
                          {MEAL_LABELS[entry.mealType] ?? '🍽️'}
                        </Text>
                        <Text style={styles.mealChipText} numberOfLines={1}>
                          {entry.meal.title}
                        </Text>
                      </View>
                    ) : null
                  )}
                </View>
              );
            })}
          </View>

          {/* Today's Details */}
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            {MEAL_TYPES.map((type) => {
              const entries = currentPlan.entries.filter(
                (e) => e.dayOfWeek === today.getDay() && e.mealType === type,
              );
              const entry = entries[0];
              return (
                <View key={type} style={styles.mealCard}>
                  <View style={styles.mealCardHeader}>
                    <Text style={styles.mealTypeLabel}>
                      {type === 'BREAKFAST' ? 'Breakfast' : type === 'LUNCH' ? 'Lunch' : 'Dinner'}
                    </Text>
                  </View>
                  {entry ? (
                    <>
                      <Text style={styles.mealTitle}>{entry.meal.title}</Text>
                      <View style={styles.mealMeta}>
                        <Text style={styles.mealMetaText}>
                          {entry.meal.calories} cal
                        </Text>
                        <Text style={styles.mealMetaText}>
                          {entry.meal.preparationTime} min
                        </Text>
                        <Text style={styles.mealMetaText}>
                          {entry.meal.estimatedCost.toLocaleString()} RWF
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.mealPlaceholder}>No meal planned</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Meal Plan This Week</Text>
          <Text style={styles.emptyText}>
            Generate recommendations and create a meal plan from the dashboard
          </Text>
          <Pressable style={styles.primaryButton} onPress={fetchPlans}>
            <Text style={styles.primaryButtonText}>Refresh</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f4f4f5',
    letterSpacing: -0.5,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    borderRadius: 20,
    backgroundColor: '#18181b',
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#09090b',
  },
  planContainer: {
    gap: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: '#18181b',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  dayColumn: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#27272a',
  },
  todayColumn: {
    backgroundColor: '#22c55e10',
  },
  dayName: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 6,
  },
  todayText: {
    color: '#22c55e',
  },
  mealChip: {
    width: '100%',
    backgroundColor: '#27272a',
    borderRadius: 6,
    padding: 3,
    marginBottom: 3,
    alignItems: 'center',
  },
  mealChipIcon: {
    fontSize: 10,
  },
  mealChipText: {
    fontSize: 7,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  todaySection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 4,
  },
  mealCard: {
    borderRadius: 16,
    backgroundColor: '#18181b',
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  mealCardHeader: {
    marginBottom: 8,
  },
  mealTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f4f4f5',
    marginBottom: 8,
  },
  mealMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  mealMetaText: {
    fontSize: 12,
    color: '#71717a',
  },
  mealPlaceholder: {
    fontSize: 14,
    color: '#52525b',
    fontStyle: 'italic',
  },
});
