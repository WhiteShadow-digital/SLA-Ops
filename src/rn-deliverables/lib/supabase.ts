import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

/**
 * Custom storage adapter for Supabase Auth using Expo SecureStore.
 * Ensures session tokens (access_token, refresh_token) are persisted
 * safely in the iOS Keychain and Android Keystore.
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('Error reading key from SecureStore:', key, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('Error setting key in SecureStore:', key, error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('Error deleting key from SecureStore:', key, error);
    }
  },
};

export const SUPABASE_URL = 'https://apjeyawbuvwjbxuvzlcz.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamV5YXdidXZ3amJ4dXZ6bGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNjM5MTEsImV4cCI6MjEwNTYzOTkxMX0.TypILF-XZcwwuVUFkmf9Z8CzfUMYuvnLA9ubrcidVu0';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
