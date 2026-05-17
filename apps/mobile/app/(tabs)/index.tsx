import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning 👋</Text>
        <Text style={styles.title}>Today&apos;s Recommendations</Text>
      </View>

      {/* Meal Cards Placeholder */}
      {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => (
        <View key={mealType} style={styles.card}>
          <Text style={styles.cardLabel}>{mealType}</Text>
          <View style={styles.cardPlaceholder}>
            <Text style={styles.placeholderText}>
              Personalized {mealType.toLowerCase()} recommendations will appear here
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
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
  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#18181b',
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardPlaceholder: {
    height: 100,
    borderRadius: 12,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 13,
    color: '#52525b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
