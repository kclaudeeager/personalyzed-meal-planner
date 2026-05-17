import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.title}>Welcome to{'\n'}Adaptive Meals</Text>
        <Text style={styles.subtitle}>
          Personalized meal recommendations tailored to your preferences, budget, and lifestyle.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
        <Text style={styles.footerNote}>
          We&apos;ll ask a few questions to personalize your experience
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f4f4f5',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#09090b',
  },
  footerNote: {
    fontSize: 12,
    color: '#52525b',
    marginTop: 16,
    textAlign: 'center',
  },
});
