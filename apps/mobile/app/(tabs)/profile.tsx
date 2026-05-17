import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your preferences, health goals, and settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Budget Level</Text>
          <Text style={styles.value}>Medium</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cooking Skill</Text>
          <Text style={styles.value}>Intermediate</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Household Size</Text>
          <Text style={styles.value}>—</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Goals</Text>
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>Set up your health goals to get better recommendations</Text>
        </View>
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
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#18181b',
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  label: {
    fontSize: 14,
    color: '#71717a',
  },
  value: {
    fontSize: 14,
    color: '#f4f4f5',
    fontWeight: '500',
  },
  placeholderBox: {
    borderRadius: 12,
    backgroundColor: '#27272a',
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 13,
    color: '#52525b',
    textAlign: 'center',
  },
});
