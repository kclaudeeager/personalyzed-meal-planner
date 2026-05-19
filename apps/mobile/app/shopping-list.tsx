import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { apiClient } from '../src/lib/api-client';

interface ShoppingItem {
  id: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  isChecked: boolean;
  ingredient: { id: string; name: string; localAvailability: string; averageCost: number };
}

interface ShoppingList {
  id: string;
  name: string;
  weekStart: string;
  totalCost: number;
  items: ShoppingItem[];
}

export default function ShoppingListScreen() {
  const { getToken, userId } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<string | null>(null);

  useEffect(() => { if (userId) fetchLists(); else setLoading(false); }, [userId]);

  async function fetchLists() {
    setLoading(true);
    try {
      const token = await getToken();
      const json = await apiClient<{ success: boolean; data: ShoppingList[] }>(
        `/shopping-lists/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLists(json.data ?? []);
    } catch { setLists([]); }
    finally { setLoading(false); }
  }

  async function toggleItem(itemId: string, isChecked: boolean) {
    try {
      const token = await getToken();
      await apiClient(`/shopping-lists/item/${itemId}`, {
        method: 'PATCH',
        body: { isChecked },
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLists();
    } catch { Alert.alert('Error', 'Failed to update item'); }
  }

  const list = lists.find(l => l.id === activeList) || lists[0];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (lists.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>No Shopping Lists</Text>
          <Text style={styles.emptyText}>Generate a meal plan first to create a shopping list</Text>
        </View>
      </View>
    );
  }

  const checkedCount = list?.items.filter(i => i.isChecked).length ?? 0;
  const totalCount = list?.items.length ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        {list && (
          <Text style={styles.progress}>{checkedCount}/{totalCount} items checked</Text>
        )}
      </View>

      {lists.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listSelector}>
          {lists.map(l => (
            <Pressable
              key={l.id}
              style={[styles.listChip, activeList === l.id && styles.listChipActive]}
              onPress={() => setActiveList(l.id)}
            >
              <Text style={[styles.listChipText, activeList === l.id && styles.listChipTextActive]}>
                {l.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {list && (
        <>
          <View style={styles.costBanner}>
            <Text style={styles.costLabel}>Total Estimated Cost</Text>
            <Text style={styles.costValue}>{list.totalCost.toLocaleString()} RWF</Text>
          </View>

          {list.items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.itemRow}
              onPress={() => toggleItem(item.id, !item.isChecked)}
            >
              <View style={[styles.checkbox, item.isChecked && styles.checkboxChecked]}>
                {item.isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.isChecked && styles.itemChecked]}>
                  {item.ingredient.name}
                </Text>
                <Text style={styles.itemDetail}>
                  {item.quantity} {item.unit} · {item.estimatedCost.toLocaleString()} RWF
                </Text>
              </View>
              {item.ingredient.localAvailability === 'SEASONAL' && (
                <Text style={styles.seasonalTag}>Seasonal</Text>
              )}
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#f4f4f5', letterSpacing: -0.5 },
  progress: { fontSize: 13, color: '#71717a' },
  listSelector: { marginBottom: 12 },
  listChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', marginRight: 8 },
  listChipActive: { borderColor: '#22c55e' },
  listChipText: { fontSize: 13, color: '#71717a' },
  listChipTextActive: { color: '#22c55e' },
  costBanner: {
    backgroundColor: '#22c55e15', borderRadius: 12, padding: 14, marginBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#22c55e30',
  },
  costLabel: { fontSize: 14, color: '#a1a1aa' },
  costValue: { fontSize: 18, fontWeight: '700', color: '#22c55e' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12, backgroundColor: '#18181b', marginBottom: 8, borderWidth: 1, borderColor: '#27272a',
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#52525b',
    marginRight: 12, justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkmark: { fontSize: 14, fontWeight: '700', color: '#09090b' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#f4f4f5' },
  itemChecked: { textDecorationLine: 'line-through', color: '#52525b' },
  itemDetail: { fontSize: 12, color: '#71717a', marginTop: 2 },
  seasonalTag: { fontSize: 10, color: '#eab308', backgroundColor: '#eab30820', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#f4f4f5', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#52525b', textAlign: 'center' },
});
