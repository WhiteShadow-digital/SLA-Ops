import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Asset } from '../types/database';

interface DashboardScreenProps {
  onScanPress: () => void;
  onInventoryPress: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onScanPress,
  onInventoryPress,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*');

      if (!error && data) {
        setAssets(data as Asset[]);
      }
    } catch (e) {
      console.warn('Metrics error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const total = assets.length;
  const available = assets.filter((a) => a.status === 'available').length;
  const checkedOut = assets.filter((a) => a.status === 'checked_out').length;
  const inRepair = assets.filter((a) => a.status === 'in_repair').length;
  const utilization = total > 0 ? Math.round((checkedOut / total) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Fleet Performance Metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchMetrics();
          }}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hardware Intelligence</Text>
        <Text style={styles.subtitle}>Fleet Analytics &amp; Inventory Metrics</Text>
      </View>

      {/* KPI 4-Card Grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TOTAL FLEET</Text>
          <Text style={styles.kpiValue}>{total}</Text>
          <Text style={styles.kpiSub}>Tracked Units</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>UTILIZATION</Text>
          <Text style={[styles.kpiValue, { color: '#10B981' }]}>{utilization}%</Text>
          <Text style={styles.kpiSub}>In Active Use</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>AVAILABLE</Text>
          <Text style={[styles.kpiValue, { color: '#60A5FA' }]}>{available}</Text>
          <Text style={styles.kpiSub}>In Stock</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>IN REPAIR</Text>
          <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>{inRepair}</Text>
          <Text style={styles.kpiSub}>Maintenance</Text>
        </View>
      </View>

      {/* Scanner Action Banner (Scanner as an option) */}
      <View style={styles.scannerBanner}>
        <Text style={styles.bannerTag}>ON-DEMAND TOOL</Text>
        <Text style={styles.bannerTitle}>1D &amp; 2D Optical Scanner</Text>
        <Text style={styles.bannerDesc}>
          Scan manufacturer stickers (Dell Service Tags, Apple Serials) or QR tags. Direct matching against the Supabase serial_number column.
        </Text>
        <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
          <Text style={styles.scanButtonText}>📷 Open Barcode &amp; QR Scanner</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.linkButton} onPress={onInventoryPress}>
          <Text style={styles.linkButtonText}>📋 View Full Equipment Directory ({total})</Text>
        </TouchableOpacity>
      </View>

      {/* Watermark */}
      <View style={styles.watermarkContainer}>
        <Text style={styles.watermarkText}>
          Designed &amp; Developed by <Text style={styles.watermarkAuthor}>Ethan Krewu</Text>
        </Text>
        <Text style={styles.watermarkSub}>IT Hardware Asset Tracker • Supabase + Expo</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: '#64748B',
  },
  scannerBanner: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  bannerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerDesc: {
    fontSize: 12,
    color: '#DBEAFE',
    lineHeight: 18,
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 14,
  },
  quickLinks: {
    marginBottom: 24,
  },
  linkButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  linkButtonText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 13,
  },
  watermarkContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
  },
  watermarkText: {
    fontSize: 12,
    color: '#64748B',
  },
  watermarkAuthor: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  watermarkSub: {
    fontSize: 10,
    color: '#475569',
    marginTop: 4,
  },
});
