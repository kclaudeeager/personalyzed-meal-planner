import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { apiClient } from '../../src/lib/api-client';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  localAvailability: string;
  averageCost: number;
}

interface MealDetail {
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
  ingredients?: Array<{
    quantity: number;
    unit: string;
    ingredient: { id: string; name: string; localAvailability: string; averageCost: number };
  }>;
  nutritionProfile?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitamins: string;
  };
  images?: Array<{ id: string; url: string; isPrimary: boolean }>;
  videos?: Array<{ id: string; url: string; title: string; source: string }>;
}

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchMeal(); }, [id]);

  async function fetchMeal() {
    setLoading(true);
    try {
      const token = await getToken();
      const json = await apiClient<{ success: boolean; data: MealDetail }>(
        `/meals/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMeal(json.data);
    } catch {
      Alert.alert('Error', 'Failed to load meal details');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function submitFeedback() {
    if (!userId || rating === 0) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      await apiClient('/feedback', {
        method: 'POST',
        body: { userId, mealId: id, rating, comment: comment || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
      setRating(0);
      setComment('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!meal) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{meal.title}</Text>
      <View style={styles.badgeRow}>
        <View style={styles.cuisineBadge}><Text style={styles.cuisineText}>{meal.cuisineType}</Text></View>
        <View style={styles.complexityBadge}><Text style={styles.complexityText}>{meal.complexity}</Text></View>
      </View>

      <Text style={styles.description}>{meal.description}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaCard}>
          <Text style={styles.metaValue}>{meal.preparationTime}</Text>
          <Text style={styles.metaLabel}>Minutes</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaValue}>{meal.calories}</Text>
          <Text style={styles.metaLabel}>Calories</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaValue}>{meal.estimatedCost.toLocaleString()}</Text>
          <Text style={styles.metaLabel}>RWF</Text>
        </View>
      </View>

      {meal.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsRow}>
            {meal.tags.map((tag) => (
              <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
            ))}
          </View>
        </View>
      )}

      {meal.ingredients && meal.ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {meal.ingredients.map((item, i) => (
            <View key={i} style={styles.ingredientRow}>
              <Text style={styles.ingredientName}>{item.ingredient.name}</Text>
              <Text style={styles.ingredientAmount}>
                {item.quantity} {item.unit}
                {item.ingredient.localAvailability === 'SEASONAL' ? ' ⚠️ Seasonal' : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {meal.nutritionProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.nutritionProfile.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.nutritionProfile.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.nutritionProfile.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.nutritionProfile.fiber}g</Text>
              <Text style={styles.nutritionLabel}>Fiber</Text>
            </View>
          </View>
          {meal.nutritionProfile.vitamins && (
            <Text style={styles.vitamins}>{meal.nutritionProfile.vitamins}</Text>
          )}
        </View>
      )}

      {meal.videos && meal.videos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video Tutorials</Text>
          {meal.videos.map((v) => (
            <View key={v.id} style={styles.videoCard}>
              <Text style={styles.videoTitle}>{v.title}</Text>
              <Text style={styles.videoSource}>{v.source}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Feedback */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rate this Meal</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)}>
              <Text style={[styles.star, star <= rating && styles.starFilled]}>★</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder="Leave a comment (optional)"
          placeholderTextColor="#52525b"
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <Pressable
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={submitFeedback}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#f4f4f5', letterSpacing: -0.5, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  cuisineBadge: { backgroundColor: '#22c55e20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cuisineText: { fontSize: 12, color: '#22c55e', fontWeight: '600' },
  complexityBadge: { backgroundColor: '#27272a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  complexityText: { fontSize: 12, color: '#a1a1aa', fontWeight: '600' },
  description: { fontSize: 15, color: '#a1a1aa', lineHeight: 22, marginBottom: 20 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metaCard: {
    flex: 1, backgroundColor: '#18181b', borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#27272a',
  },
  metaValue: { fontSize: 18, fontWeight: '700', color: '#f4f4f5' },
  metaLabel: { fontSize: 11, color: '#71717a', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f4f4f5', marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#27272a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 13, color: '#22c55e' },
  ingredientRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#27272a',
  },
  ingredientName: { fontSize: 14, color: '#f4f4f5' },
  ingredientAmount: { fontSize: 14, color: '#71717a' },
  nutritionGrid: { flexDirection: 'row', gap: 12 },
  nutritionItem: {
    flex: 1, backgroundColor: '#18181b', borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#27272a',
  },
  nutritionValue: { fontSize: 16, fontWeight: '700', color: '#22c55e' },
  nutritionLabel: { fontSize: 11, color: '#71717a', marginTop: 2 },
  vitamins: { fontSize: 13, color: '#71717a', marginTop: 8, fontStyle: 'italic' },
  videoCard: {
    backgroundColor: '#18181b', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#27272a',
  },
  videoTitle: { fontSize: 14, fontWeight: '600', color: '#f4f4f5' },
  videoSource: { fontSize: 12, color: '#71717a', marginTop: 4 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  star: { fontSize: 32, color: '#3f3f46' },
  starFilled: { color: '#eab308' },
  commentInput: {
    backgroundColor: '#18181b', borderRadius: 12, borderWidth: 1, borderColor: '#27272a',
    padding: 12, fontSize: 14, color: '#f4f4f5', minHeight: 80, textAlignVertical: 'top', marginBottom: 12,
  },
  submitButton: { backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { fontSize: 15, fontWeight: '700', color: '#09090b' },
});
