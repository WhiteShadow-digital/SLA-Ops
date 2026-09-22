import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

interface AuthScreenProps {
  onLoginSuccess: (profile: Profile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your work email and password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate with Supabase Auth (tokens persisted in SecureStore)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Query user profile to verify role permissions
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.warn('Profile fetch warning:', profileError);
          // Fallback profile if user exists in Auth but not in public.profiles yet
          const fallbackProfile: Profile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'IT Staff Member',
            role: 'it_staff',
            department: 'IT Operations',
          };
          onLoginSuccess(fallbackProfile);
          return;
        }

        if (profile) {
          onLoginSuccess(profile as Profile);
        }
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      Alert.alert('Authentication Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper for testing IT Staff or Employee credentials
  const fillDemoAccount = (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    setPassword('DemoPass2026!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.headerBox}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>📦</Text>
          </View>
          <Text style={styles.title}>IT Hardware Asset Tracker</Text>
          <Text style={styles.subtitle}>Inventory Management & QR Scanning</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Staff Sign In</Text>

          <Text style={styles.label}>Work Email</Text>
          <TextInput
            style={styles.input}
            placeholder="it.admin@company.internal"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In & Verify Session</Text>
            )}
          </TouchableOpacity>

          {/* Demo quick fills */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Quick Demo Credentials</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => fillDemoAccount('it.admin@company.com', 'it_staff')}
              >
                <Text style={styles.demoButtonText}>IT Staff</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => fillDemoAccount('sarah.chen@company.com', 'employee')}
              >
                <Text style={styles.demoButtonText}>Employee</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#F1F5F9',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  demoTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  demoButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
});
