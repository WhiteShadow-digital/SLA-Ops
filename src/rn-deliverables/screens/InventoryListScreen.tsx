import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Asset, AssetStatus } from '../types/database';
import { AssetCheckoutModal } from '../components/AssetCheckoutModal';

interface InventoryListScreenProps {
  onScanPress?: () => void;
}

export const InventoryListScreen: React.FC<InventoryListScreenProps> = ({ onScanPress }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          asset_assignments (
            *,
            profiles (*)
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) {
        setAssets(data as any);
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Filter assets by search query and status filter
  useEffect(() => {
    let result = [...assets];

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.serial_number.toLowerCase().includes(q) ||
          a.qr_code_id.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    setFilteredAssets(result);
  }, [assets, searchQuery, statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssets();
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'available':
        return { label: 'AVAILABLE', bg: '#DCFCE7', text: '#15803D' };
      case 'checked_out':
        return { label: 'CHECKED OUT', bg: '#FEF3C7', text: '#B45309' };
      case 'in_repair':
        return { label: 'IN REPAIR', bg: '#FEE2E2', text: '#B91C1C' };
      case 'retired':
        return { label: 'RETIRED', bg: '#F3F4F6', text: '#4B5563' };
      default:
        return { label: status, bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const badge = getStatusBadge(item.status);
    const assignment = item.asset_assignments?.[0];
    const assignedName = assignment?.profiles?.full_name;

    return (
      <TouchableOpacity
        style={styles.assetCard}
        onPress={() => {
          setSelectedAsset(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.assetName}>{item.name}</Text>
            <Text style={styles.categoryText}>{item.category} • {item.location}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.tagChip}>
            <Text style={styles.tagText}>TAG: {item.qr_code_id}</Text>
          </View>
          <Text style={styles.serialText}>S/N: {item.serial_number}</Text>
        </View>

        {item.status === 'checked_out' && assignedName && (
          <View style={styles.assignedBanner}>
            <Text style={styles.assignedBannerText}>Assigned to {assignedName}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hardware Inventory</Text>
          <Text style={styles.countSubtitle}>
            {filteredAssets.length} of {assets.length} items listed
          </Text>
        </View>
        {onScanPress && (
          <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
            <Text style={styles.scanButtonText}>📷 Scan</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, serial number, or QR tag..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Status Filter Chips */}
      <View style={styles.chipsContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'available', label: 'Available' },
          { key: 'checked_out', label: 'Checked Out' },
          { key: 'in_repair', label: 'In Repair' },
        ].map((chip) => {
          const isSelected = statusFilter === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              onPress={() => setStatusFilter(chip.key)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Asset List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading inventory from Supabase...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAssets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Assets Found</Text>
              <Text style={styles.emptyText}>
                No hardware matches your current search or status filter.
              </Text>
            </View>
          }
        />
      )}

      {/* Asset Checkout / Check-In Modal */}
      <AssetCheckoutModal
        visible={modalVisible}
        asset={selectedAsset}
        onClose={() => setModalVisible(false)}
        onSuccess={(updated) => {
          setAssets((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
          setSelectedAsset(updated);
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  countSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  assetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderInfo: {
    flex: 1,
    marginRight: 10,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tagChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  serialText: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  assignedBanner: {
    backgroundColor: '#FEF3C7',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  assignedBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
});
