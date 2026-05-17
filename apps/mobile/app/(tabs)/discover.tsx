import { View, Text, StyleSheet } from 'react-native';

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Meals</Text>
      <Text style={styles.subtitle}>
        Browse the full Rwandan meal catalog, filter by cuisine type, complexity, and budget.
      </Text>
      <View style={styles.placeholder}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.placeholderText}>Meal catalog coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f4f4f5',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 8,
    lineHeight: 20,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#3f3f46',
    fontWeight: '500',
  },
});
