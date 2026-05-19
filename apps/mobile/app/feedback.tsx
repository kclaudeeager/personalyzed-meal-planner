import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { apiClient } from '../src/lib/api-client';

interface Feedback {
  id: string;
  rating: number;
  feedbackType: string;
  comment: string | null;
  createdAt: string;
  meal: { id: string; title: string };
}

export default function FeedbackScreen() {
  const { getToken, userId } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (userId) fetchFeedbacks(); else setLoading(false); }, [userId]);

  async function fetchFeedbacks() {
    setLoading(true);
    try {
      const token = await getToken();
      const json = await apiClient<{ success: boolean; data: Feedback[] }>(
        `/feedback/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFeedbacks(json.data ?? []);
    } catch { setFeedbacks([]); }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Feedback</Text>
      <Text style={styles.subtitle}>Meals you've rated and reviewed</Text>

      {feedbacks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No Feedback Yet</Text>
          <Text style={styles.emptyText}>Tap on a meal to rate and review it</Text>
        </View>
      ) : (
        feedbacks.map((fb) => (
          <View key={fb.id} style={styles.card}>
            <Text style={styles.mealTitle}>{fb.meal.title}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={[styles.star, star <= fb.rating && styles.starFilled]}>★</Text>
              ))}
              <Text style={styles.typeBadge}>{fb.feedbackType}</Text>
            </View>
            {fb.comment && <Text style={styles.comment}>"{fb.comment}"</Text>}
            <Text style={styles.date}>{new Date(fb.createdAt).toLocaleDateString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#f4f4f5', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#71717a', marginTop: 4, marginBottom: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#f4f4f5', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#52525b', textAlign: 'center' },
  card: {
    borderRadius: 16, backgroundColor: '#18181b', padding: 16, borderWidth: 1, borderColor: '#27272a', marginBottom: 10,
  },
  mealTitle: { fontSize: 16, fontWeight: '700', color: '#f4f4f5', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  star: { fontSize: 18, color: '#3f3f46' },
  starFilled: { color: '#eab308' },
  typeBadge: { fontSize: 11, color: '#a1a1aa', backgroundColor: '#27272a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  comment: { fontSize: 14, color: '#a1a1aa', fontStyle: 'italic', marginBottom: 4 },
  date: { fontSize: 12, color: '#52525b' },
});
