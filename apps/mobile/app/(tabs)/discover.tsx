import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { apiClient } from '../../src/lib/api-client';

interface Meal {
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
}

const CUISINES = ['RWANDAN', 'EAST_AFRICAN', 'WESTERN', 'ETHIOPIAN'] as const;
const COMPLEXITIES = ['EASY', 'MEDIUM', 'ADVANCED'] as const;

export default function DiscoverScreen() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<string>('');
  const [complexityFilter, setComplexityFilter] = useState<string>('');
  const [maxCost, setMaxCost] = useState('');

  useEffect(() => { fetchMeals(); }, []);

  async function fetchMeals(filters?: string) {
    setLoading(true);
    try {
      const token = await getToken();
      const params = filters || buildParams();
      const json = await apiClient<{ success: boolean; data: Meal[] }>(
        `/meals${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMeals(json.data ?? []);
    } catch {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  function buildParams() {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (cuisineFilter) p.set('cuisineType', cuisineFilter);
    if (complexityFilter) p.set('complexity', complexityFilter);
    if (maxCost) p.set('maxCost', maxCost);
    const qs = p.toString();
    return qs ? `?${qs}` : '';
  }

  function handleFilter() {
    fetchMeals(buildParams());
  }

  const costLabel = (cost: number) =>
    cost <= 1000 ? '$' : cost <= 3000 ? '$$' : '$$$';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Meals</Text>
      <Text style={styles.subtitle}>Browse the Rwandan meal catalog</Text>

      {/* Search & Filters */}
      <View style={styles.filterBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search meals..."
          placeholderTextColor="#52525b"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleFilter}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Pressable
            style={[styles.chip, !cuisineFilter && styles.chipActive]}
            onPress={() => { setCuisineFilter(''); handleFilter(); }}
          >
            <Text style={[styles.chipText, !cuisineFilter && styles.chipTextActive]}>All</Text>
          </Pressable>
          {CUISINES.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, cuisineFilter === c && styles.chipActive]}
              onPress={() => { setCuisineFilter(c); handleFilter(); }}
            >
              <Text style={[styles.chipText, cuisineFilter === c && styles.chipTextActive]}>
                {c === 'RWANDAN' ? 'Rwandan' : c === 'EAST_AFRICAN' ? 'E. African' : c === 'ETHIOPIAN' ? 'Ethiopian' : 'Western'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Pressable
            style={[styles.chip, !complexityFilter && styles.chipActive]}
            onPress={() => { setComplexityFilter(''); handleFilter(); }}
          >
            <Text style={[styles.chipText, !complexityFilter && styles.chipTextActive]}>Any</Text>
          </Pressable>
          {COMPLEXITIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, complexityFilter === c && styles.chipActive]}
              onPress={() => { setComplexityFilter(c); handleFilter(); }}
            >
              <Text style={[styles.chipText, complexityFilter === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No meals found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.mealGrid}>
          {meals.map((meal) => (
            <Pressable
              key={meal.id}
              style={styles.mealCard}
              onPress={() => router.push(`/meal/${meal.id}`)}
            >
              <View style={styles.mealCardHeader}>
                <Text style={styles.mealTitle} numberOfLines={1}>{meal.title}</Text>
                <View style={styles.badgeRow}>
                  {meal.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={styles.mealDesc} numberOfLines={2}>{meal.description}</Text>
              <View style={styles.mealMeta}>
                <Text style={styles.metaItem}>⏱ {meal.preparationTime} min</Text>
                <Text style={styles.metaItem}>🔥 {meal.calories} cal</Text>
                <Text style={styles.metaItem}>{costLabel(meal.estimatedCost)} {meal.estimatedCost.toLocaleString()} RWF</Text>
              </View>
              <View style={styles.mealFooter}>
                <Text style={styles.complexityBadge}>{meal.complexity}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#f4f4f5', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#71717a', marginTop: 4, marginBottom: 16 },
  filterBar: { marginBottom: 12 },
  searchInput: {
    backgroundColor: '#18181b', borderRadius: 12, borderWidth: 1, borderColor: '#27272a',
    padding: 12, fontSize: 15, color: '#f4f4f5', marginBottom: 8,
  },
  filterRow: { marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#18181b',
    borderWidth: 1, borderColor: '#27272a', marginRight: 8,
  },
  chipActive: { borderColor: '#22c55e', backgroundColor: '#22c55e15' },
  chipText: { fontSize: 13, color: '#71717a' },
  chipTextActive: { color: '#22c55e' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#52525b' },
  mealGrid: { paddingBottom: 40, gap: 12 },
  mealCard: {
    borderRadius: 16, backgroundColor: '#18181b', padding: 16, borderWidth: 1, borderColor: '#27272a',
  },
  mealCardHeader: { marginBottom: 8 },
  mealTitle: { fontSize: 17, fontWeight: '700', color: '#f4f4f5', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  tagBadge: { backgroundColor: '#27272a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, color: '#22c55e' },
  mealDesc: { fontSize: 13, color: '#71717a', lineHeight: 18, marginBottom: 8 },
  mealMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  metaItem: { fontSize: 12, color: '#a1a1aa' },
  mealFooter: { flexDirection: 'row' },
  complexityBadge: {
    fontSize: 11, color: '#a1a1aa', backgroundColor: '#27272a', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2, textTransform: 'uppercase',
  },
});
