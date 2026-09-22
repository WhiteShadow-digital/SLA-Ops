import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { supabase } from '../lib/supabase';
import { AssetCheckoutModal } from '../components/AssetCheckoutModal';
import { AssetWithRelations } from '../types/database';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.72;

export const QRScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [scannedAsset, setScannedAsset] = useState<AssetWithRelations | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  // Animated laser line for scanner viewfinder
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: SCAN_AREA_SIZE - 4,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanLineAnim]);

  // Handle Barcode Scanned Event
  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    const qrString = result.data.trim();

    // Prevent immediate duplicate scans
    if (!isScanningActive || loading || qrString === lastScannedCode) {
      return;
    }

    setIsScanningActive(false);
    setLastScannedCode(qrString);
    await fetchAssetDetails(qrString);
  };

  // Query Supabase for the Scanned Asset
  const fetchAssetDetails = async (scannedId: string) => {
    setLoading(true);
    try {
      // First try matching against serial_number (for Dell Service Tags, Apple Serial Numbers, etc.)
      const { data: serialData, error: serialError } = await supabase
        .from('assets')
        .select(`
          *,
          asset_assignments (
            *,
            profiles (*)
          )
        `)
        .ilike('serial_number', scannedId.trim())
        .order('check_out_date', {
          foreignTable: 'asset_assignments',
          ascending: false,
        })
        .maybeSingle();

      if (!serialError && serialData) {
        setScannedAsset(serialData as AssetWithRelations);
        setIsModalVisible(true);
        return;
      }

      // If no match by serial_number, match against qr_code_id
      const { data: qrData, error: qrError } = await supabase
        .from('assets')
        .select(`
          *,
          asset_assignments (
            *,
            profiles (*)
          )
        `)
        .ilike('qr_code_id', scannedId.trim())
        .order('check_out_date', {
          foreignTable: 'asset_assignments',
          ascending: false,
        })
        .maybeSingle();

      if (!qrError && qrData) {
        setScannedAsset(qrData as AssetWithRelations);
        setIsModalVisible(true);
        return;
      }

      // If no row found with matching serial_number or qr_code_id
      Alert.alert(
        'Hardware Not Found',
        `No asset found matching Serial Number or Tag ID: "${scannedId}".\n\nChecked serial_number and qr_code_id in Supabase.`,
        [
          {
            text: 'Scan Again',
            onPress: () => {
              setLastScannedCode(null);
              setIsScanningActive(true);
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Supabase Query Error:', err);
      Alert.alert('Database Query Error', err.message || 'Failed to fetch asset info from Supabase', [
        {
          text: 'OK',
          onPress: () => {
            setLastScannedCode(null);
            setIsScanningActive(true);
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Test Barcode Helper for Expo Go & Simulators
  const triggerManualTestScan = (testQrCode: string) => {
    setIsScanningActive(false);
    setLastScannedCode(testQrCode);
    fetchAssetDetails(testQrCode);
  };

  // Handle Successful Checkout or Return
  const handleCheckoutSuccess = (updatedAsset: AssetWithRelations) => {
    setScannedAsset(updatedAsset);
    // Keep modal open or close after brief confirmation
    setTimeout(() => {
      setIsModalVisible(false);
      setLastScannedCode(null);
      setIsScanningActive(true);
    }, 800);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setLastScannedCode(null);
    setIsScanningActive(true);
  };

  // Camera Permission Pending
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // Camera Permission Denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.deniedCard}>
          <Text style={styles.deniedTitle}>Camera Access Required</Text>
          <Text style={styles.deniedMessage}>
            IT Hardware Asset Tracker needs camera permission to scan physical QR codes and barcode tags
            on laptops, monitors, and networking devices.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Expo Camera View with Barcode Scanner */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchEnabled}
        barcodeScannerSettings={{
          barcodeTypes: [
            // 2D formats
            'qr',
            'datamatrix',
            'pdf417',
            'aztec',
            // 1D formats (Manufacturer serial barcodes, UPC, EAN, Code 128/39)
            'code128',
            'code39',
            'code93',
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'itf14',
            'codabar',
          ],
        }}
        onBarcodeScanned={isScanningActive && !loading ? handleBarcodeScanned : undefined}
      />

      {/* Viewfinder Dark Overlay Frame */}
      <SafeAreaView style={styles.overlayContainer}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.appTitle}>1D &amp; 2D Hardware Scanner</Text>
            <Text style={styles.appSubtitle}>Align manufacturer serial barcode or QR tag</Text>
          </View>

          <TouchableOpacity
            style={[styles.torchButton, torchEnabled && styles.torchButtonActive]}
            onPress={() => setTorchEnabled(!torchEnabled)}
          >
            <Text style={styles.torchButtonText}>{torchEnabled ? '🔦 ON' : '💡 OFF'}</Text>
          </TouchableOpacity>
        </View>

        {/* Viewfinder Center Box */}
        <View style={styles.viewfinderWrapper}>
          <View style={styles.viewfinderBox}>
            {/* 4 Corner Markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated Laser Scanning Line */}
            {isScanningActive && !loading && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineAnim }],
                  },
                ]}
              />
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#60A5FA" />
                <Text style={styles.loadingText}>Fetching Supabase Asset...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Bar: Instructions & Quick Simulator Test Buttons */}
        <View style={styles.bottomBar}>
          <Text style={styles.instructionText}>
            {isScanningActive
              ? 'Scan Dell Service Tag, Apple Serial, or QR code'
              : 'Processing asset barcode...'}
          </Text>

          {/* Quick simulator test tags (1D Serial Numbers & 2D Tags) */}
          <View style={styles.simulatorRow}>
            <Text style={styles.simLabel}>Dev Simulator Serials:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.simScroll}>
              {[
                { label: 'Dell 32"', code: 'CN078X-74261-2A' },
                { label: 'MacBook Pro', code: 'C02G9988MD6R' },
                { label: 'ThinkPad', code: 'PF388271-X1' },
                { label: 'Cisco SW', code: 'FOC2441S09G' },
                { label: 'Tag 001', code: 'AST-2026-001' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={styles.simTag}
                  onPress={() => triggerManualTestScan(item.code)}
                >
                  <Text style={styles.simTagText}>{item.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {!isScanningActive && !loading && !isModalVisible && (
            <TouchableOpacity
              style={styles.resumeScanButton}
              onPress={() => {
                setLastScannedCode(null);
                setIsScanningActive(true);
              }}
            >
              <Text style={styles.resumeScanText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Asset Checkout & Check-In Action Modal */}
      <AssetCheckoutModal
        visible={isModalVisible}
        asset={scannedAsset}
        onClose={handleModalClose}
        onSuccess={handleCheckoutSuccess}
      />
    </View>
  );
};

// React Native ScrollView import fallback
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#E2E8F0',
    fontSize: 16,
    marginTop: 14,
    fontWeight: '500',
  },
  deniedCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    maxWidth: 360,
  },
  deniedTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  deniedMessage: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  appSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  torchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  torchButtonActive: {
    backgroundColor: '#EAB308',
    borderColor: '#FACC15',
  },
  torchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  viewfinderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderBox: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#3B82F6',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  scanLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: '#60A5FA',
    borderRadius: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  loadingText: {
    color: '#E2E8F0',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  instructionText: {
    color: '#E2E8F0',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12,
  },
  simulatorRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  simLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  simScroll: {
    flexDirection: 'row',
  },
  simTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  simTagText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resumeScanButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  resumeScanText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
