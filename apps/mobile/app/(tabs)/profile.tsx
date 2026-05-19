import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace('/sign-in');
  }

  function confirmSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
    ]);
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? 'No email';
  const fullName = user?.fullName ?? email.split('@')[0] ?? 'User';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your preferences, health goals, and settings</Text>

      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{fullName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>
      </View>

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

      <View style={styles.linksSection}>
        <Pressable style={styles.linkRow} onPress={() => router.push('/shopping-list')}>
          <Text style={styles.linkIcon}>🛒</Text>
          <Text style={styles.linkText}>Shopping List</Text>
          <Text style={styles.linkArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => router.push('/feedback')}>
          <Text style={styles.linkIcon}>💬</Text>
          <Text style={styles.linkText}>Your Feedback</Text>
          <Text style={styles.linkArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => router.push('/recommendations')}>
          <Text style={styles.linkIcon}>✨</Text>
          <Text style={styles.linkText}>Recommendations</Text>
          <Text style={styles.linkArrow}>→</Text>
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={confirmSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
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
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#09090b',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f4f4f5',
  },
  userEmail: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
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
  linksSection: { gap: 8, marginBottom: 16 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#27272a',
  },
  linkIcon: { fontSize: 18, marginRight: 10 },
  linkText: { fontSize: 15, color: '#f4f4f5', fontWeight: '500', flex: 1 },
  linkArrow: { fontSize: 16, color: '#52525b' },
  signOutButton: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef444430',
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
});
