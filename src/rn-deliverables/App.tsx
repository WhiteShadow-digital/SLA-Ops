import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { DashboardScreen } from './screens/DashboardScreen';
import { QRScannerScreen } from './screens/QRScannerScreen';
import { InventoryListScreen } from './screens/InventoryListScreen';
import { AuthScreen } from './screens/AuthScreen';
import { supabase } from './lib/supabase';
import { Profile } from './types/database';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'scanner' | 'inventory' | 'auth'>('dashboard');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    // Check active session on startup
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser(profile as Profile);
        }
      }
    };
    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Screen Content */}
      <View style={styles.content}>
        {currentTab === 'dashboard' && (
          <DashboardScreen
            onScanPress={() => setCurrentTab('scanner')}
            onInventoryPress={() => setCurrentTab('inventory')}
          />
        )}
        {currentTab === 'scanner' && <QRScannerScreen />}
        {currentTab === 'inventory' && (
          <InventoryListScreen onScanPress={() => setCurrentTab('scanner')} />
        )}
        {currentTab === 'auth' && (
          <AuthScreen
            onLoginSuccess={(profile) => {
              setCurrentUser(profile);
              setCurrentTab('dashboard');
            }}
          />
        )}
      </View>

      {/* Watermark */}
      <View style={styles.watermarkBar}>
        <Text style={styles.watermarkText}>
          Author: <Text style={styles.watermarkBold}>Ethan Krewu</Text> • IT Asset Tracker
        </Text>
      </View>

      {/* Bottom Navigation Bar */}
      <SafeAreaView style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'dashboard' && styles.navItemActive]}
          onPress={() => setCurrentTab('dashboard')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[styles.navLabel, currentTab === 'dashboard' && styles.navLabelActive]}>
            Metrics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'inventory' && styles.navItemActive]}
          onPress={() => setCurrentTab('inventory')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={[styles.navLabel, currentTab === 'inventory' && styles.navLabelActive]}>
            Inventory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'scanner' && styles.navItemActive]}
          onPress={() => setCurrentTab('scanner')}
        >
          <Text style={styles.navIcon}>📷</Text>
          <Text style={[styles.navLabel, currentTab === 'scanner' && styles.navLabelActive]}>
            QR Scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'auth' && styles.navItemActive]}
          onPress={() => setCurrentTab('auth')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, currentTab === 'auth' && styles.navLabelActive]}>
            {currentUser ? currentUser.full_name.split(' ')[0] : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0B0F19',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navItemActive: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  navLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  watermarkBar: {
    backgroundColor: '#090D16',
    paddingVertical: 4,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  watermarkText: {
    fontSize: 10,
    color: '#64748B',
  },
  watermarkBold: {
    color: '#94A3B8',
    fontWeight: '700',
  },
});
