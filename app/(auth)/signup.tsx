import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { COLORS, GRADIENTS } from '@/constants/theme';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Please fill in all fields (password must be at least 6 characters)');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/(onboarding)/survey');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[...GRADIENTS.hero]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.hero}>
              <Text style={styles.logo}>Join Wonder</Text>
              <Text style={styles.tagline}>
                Create your account and tell us what you love — we'll tailor every plan to your tastes.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.formTitle}>Create account</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Input
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                autoComplete="name"
              />
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <Input
                placeholder="Password (6+ characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
              <Button title="Continue to Survey" onPress={handleSignup} loading={loading} />
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <Text style={styles.link}>Sign in</Text>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  hero: { marginBottom: 32 },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 10,
    lineHeight: 22,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  error: {
    color: COLORS.error,
    marginBottom: 12,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: { color: COLORS.textSecondary },
  link: { color: COLORS.primaryLight, fontWeight: '600' },
});
