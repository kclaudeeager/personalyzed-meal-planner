import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { apiClient } from '../src/lib/api-client';

interface MealBrief {
  id: string;
  title: string;
  description: string;
  preparationTime: number;
  estimatedCost: number;
  calories: number;
  complexity: string;
  tags: string[];
}

interface Recommendation {
  score: number;
  breakdown: {
    preferenceMatch: number;
    budgetCompatibility: number;
    cookingTimeCompatibility: number;
    nutritionScore: number;
    historicalEngagement: number;
    repetitionPenalty: number;
  };
  meal: MealBrief;
}

type MealType = 'breakfast' | 'lunch' | 'dinner';

export default function RecommendationsScreen() {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Record<MealType, Recommendation[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(false);

  async function generate() {
    if (!userId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const json = await apiClient<{ success: boolean; data: Record<MealType, Recommendation[]> }>(
        `/recommendations/daily/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRecommendations(json.data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generatePlan() {
    if (!userId) return;
    setLoading(true);
    try {
      const token = await getToken();
      const weekStart = getMonday(new Date()).toISOString().split('T')[0];
      await apiClient(
        `/meal-plans/generate/${userId}`,
        {
          method: 'POST',
          body: { weekStart },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setGeneratedPlan(true);
      Alert.alert('Success', 'Meal plan generated! Check your Home tab.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  const colorForScore = (s: number) => s >= 0.8 ? '#22c55e' : s >= 0.6 ? '#eab308' : '#ef4444';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Recommendations</Text>
      <Text style={styles.subtitle}>Personalized meal suggestions based on your preferences</Text>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={generate} disabled={loading || !userId}>
          {loading ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text style={styles.primaryButtonText}>Generate Recommendations</Text>
          )}
        </Pressable>
      </View>

      {recommendations && (
        <View style={styles.recsSection}>
          {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => (
            <View key={mealType}>
              <Text style={styles.mealTypeTitle}>
                {mealType === 'breakfast' ? '☀️ Breakfast' : mealType === 'lunch' ? '🌤️ Lunch' : '🌙 Dinner'}
              </Text>
              {recommendations[mealType]?.map((rec, i) => (
                <Pressable
                  key={i}
                  style={styles.recCard}
                  onPress={() => router.push(`/meal/${rec.meal.id}`)}
                >
                  <View style={styles.recHeader}>
                    <Text style={styles.recTitle} numberOfLines={1}>{rec.meal.title}</Text>
                    <View style={[styles.scoreBadge, { backgroundColor: `${colorForScore(rec.score)}20` }]}>
                      <Text style={[styles.scoreText, { color: colorForScore(rec.score) }]}>
                        {(rec.score * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recDesc} numberOfLines={2}>{rec.meal.description}</Text>
                  <View style={styles.recMeta}>
                    <Text style={styles.recMetaText}>⏱ {rec.meal.preparationTime} min</Text>
                    <Text style={styles.recMetaText}>🔥 {rec.meal.calories} cal</Text>
                    <Text style={styles.recMetaText}>{rec.meal.estimatedCost.toLocaleString()} RWF</Text>
                  </View>
                  <View style={styles.scoreBar}>
                    {(['preferenceMatch', 'budgetCompatibility', 'cookingTimeCompatibility', 'nutritionScore'] as const).map((key) => (
                      <View key={key} style={styles.scoreBarSegment}>
                        <View style={[styles.scoreBarFill, { width: `${(rec.breakdown?.[key] ?? 0) * 100}%`, backgroundColor: '#22c55e' }]} />
                      </View>
                    ))}
                  </View>
                </Pressable>
              ))}
            </View>
          ))}

          <Pressable style={styles.planButton} onPress={generatePlan} disabled={loading}>
            <Text style={styles.planButtonText}>Generate Weekly Plan from Recommendations</Text>
          </Pressable>

          {generatedPlan && (
            <Text style={styles.successText}>✅ Meal plan generated! Go to Home tab to view.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#f4f4f5', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#71717a', marginTop: 4, marginBottom: 20 },
  actions: { marginBottom: 20 },
  primaryButton: {
    backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#09090b' },
  recsSection: { gap: 16 },
  mealTypeTitle: { fontSize: 20, fontWeight: '700', color: '#f4f4f5', marginBottom: 8, marginTop: 8 },
  recCard: {
    borderRadius: 16, backgroundColor: '#18181b', padding: 16, borderWidth: 1, borderColor: '#27272a', marginBottom: 10,
  },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  recTitle: { fontSize: 16, fontWeight: '700', color: '#f4f4f5', flex: 1, marginRight: 8 },
  scoreBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  scoreText: { fontSize: 13, fontWeight: '700' },
  recDesc: { fontSize: 13, color: '#71717a', lineHeight: 18, marginBottom: 8 },
  recMeta: { flexDirection: 'row', gap: 12 },
  recMetaText: { fontSize: 12, color: '#a1a1aa' },
  scoreBar: { flexDirection: 'row', gap: 4, marginTop: 8 },
  scoreBarSegment: {
    flex: 1, height: 4, backgroundColor: '#27272a', borderRadius: 2, overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: 2 },
  planButton: {
    backgroundColor: '#18181b', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#22c55e', marginTop: 8,
  },
  planButtonText: { fontSize: 15, fontWeight: '600', color: '#22c55e' },
  successText: { fontSize: 14, color: '#22c55e', textAlign: 'center' },
});
