import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Asset, Profile, AssetAssignment } from '../types/database';

interface AssetWithDetails extends Asset {
  asset_assignments?: (AssetAssignment & {
    profiles?: Profile | null;
  })[];
}

interface AssetCheckoutModalProps {
  visible: boolean;
  asset: AssetWithDetails | null;
  onClose: () => void;
  onSuccess: (updatedAsset: AssetWithDetails) => void;
}

export const AssetCheckoutModal: React.FC<AssetCheckoutModalProps> = ({
  visible,
  asset,
  onClose,
  onSuccess,
}) => {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingEmployees, setFetchingEmployees] = useState<boolean>(false);
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);

  // Fetch employees list when modal opens for checkout
  useEffect(() => {
    if (visible && asset?.status === 'available') {
      fetchEmployees();
    }
    if (visible) {
      getCurrentUser();
    }
  }, [visible, asset]);

  const getCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentStaffId(user.id);
      }
    } catch (err) {
      console.warn('Unable to get authenticated user', err);
    }
  };

  const fetchEmployees = async () => {
    setFetchingEmployees(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      if (data) {
        setEmployees(data);
        if (data.length > 0 && !selectedEmployeeId) {
          setSelectedEmployeeId(data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching employee profiles:', err.message);
      Alert.alert('Database Warning', 'Could not load employee directory: ' + err.message);
    } finally {
      setFetchingEmployees(false);
    }
  };

  // Hardware Checkout Flow (IT Staff)
  const handleCheckout = async () => {
    if (!asset) return;
    if (!selectedEmployeeId) {
      Alert.alert('Selection Required', 'Please select an employee to assign this hardware to.');
      return;
    }

    setLoading(true);
    try {
      // 1. Update asset status to 'checked_out'
      const { error: assetError } = await supabase
        .from('assets')
        .update({ status: 'checked_out' })
        .eq('id', asset.id);

      if (assetError) throw assetError;

      // 2. Insert new row into asset_assignments
      const now = new Date().toISOString();
      const staffId = currentStaffId || selectedEmployeeId;

      const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .insert({
          asset_id: asset.id,
          assigned_to: selectedEmployeeId,
          checked_out_by: staffId,
          check_out_date: now,
          check_in_date: null,
          notes: notes.trim() || null,
        });

      if (assignmentError) throw assignmentError;

      // Find assigned employee profile for UI update
      const assignedEmployee = employees.find((e) => e.id === selectedEmployeeId);

      Alert.alert('Success', `Asset ${asset.name} successfully checked out!`);

      // Construct updated asset record with joined profile
      const updatedAsset: AssetWithDetails = {
        ...asset,
        status: 'checked_out',
        asset_assignments: [
          {
            id: 'temp-' + Date.now(),
            asset_id: asset.id,
            assigned_to: selectedEmployeeId,
            checked_out_by: staffId,
            check_out_date: now,
            check_in_date: null,
            notes: notes.trim() || null,
            profiles: assignedEmployee || null,
          },
        ],
      };

      setNotes('');
      onSuccess(updatedAsset);
    } catch (err: any) {
      console.error('Checkout error:', err);
      Alert.alert('Checkout Failed', err.message || 'Could not complete hardware checkout.');
    } finally {
      setLoading(false);
    }
  };

  // Hardware Return Flow
  const handleCheckIn = async () => {
    if (!asset) return;

    setLoading(true);
    try {
      // 1. Update asset status to 'available'
      const { error: assetError } = await supabase
        .from('assets')
        .update({ status: 'available' })
        .eq('id', asset.id);

      if (assetError) throw assetError;

      // 2. Update the active assignment with check_in_date
      const now = new Date().toISOString();
      const activeAssignment = asset.asset_assignments?.find((a) => !a.check_in_date);

      if (activeAssignment?.id) {
        await supabase
          .from('asset_assignments')
          .update({ check_in_date: now })
          .eq('id', activeAssignment.id);
      }

      Alert.alert('Asset Returned', `${asset.name} is now available in IT inventory.`);

      const updatedAsset: AssetWithDetails = {
        ...asset,
        status: 'available',
      };

      onSuccess(updatedAsset);
    } catch (err: any) {
      console.error('Check-in error:', err);
      Alert.alert('Return Failed', err.message || 'Could not check in hardware.');
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'checked_out':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'in_repair':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
      case 'retired':
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
      default:
        return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
    }
  };

  const statusStyle = getStatusColor(asset.status);
  const activeAssignment = asset.asset_assignments?.[0];
  const assignedPerson = activeAssignment?.profiles;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Asset Details</Text>
              <Text style={styles.headerSubtitle}>Tag ID: {asset.qr_code_id}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Pill & Hardware Name */}
            <View style={styles.nameSection}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                ]}
              >
                <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                  {asset.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Spec / Info Grid */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{asset.category || 'Hardware'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Serial Number</Text>
                <Text style={[styles.infoValue, styles.monospace]}>{asset.serial_number}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location / Room</Text>
                <Text style={styles.infoValue}>{asset.location}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Warranty Expiration</Text>
                <Text style={styles.infoValue}>{asset.warranty_expiration || 'N/A'}</Text>
              </View>
            </View>

            {/* Current Assignment Details if Checked Out */}
            {asset.status === 'checked_out' && (
              <View style={styles.assignmentCard}>
                <Text style={styles.assignmentTitle}>Currently Assigned To</Text>
                <Text style={styles.assignedName}>
                  {assignedPerson?.full_name || 'Assigned Employee'}
                </Text>
                <Text style={styles.assignedDept}>
                  {assignedPerson?.department || 'Department N/A'} • {assignedPerson?.email || ''}
                </Text>
                {activeAssignment?.check_out_date && (
                  <Text style={styles.assignedDate}>
                    Checked out:{' '}
                    {new Date(activeAssignment.check_out_date).toLocaleDateString()}
                  </Text>
                )}
                {activeAssignment?.notes && (
                  <Text style={styles.assignedNotes}>
                    Notes: "{activeAssignment.notes}"
                  </Text>
                )}
              </View>
            )}

            {/* Checkout Form if Available */}
            {asset.status === 'available' && (
              <View style={styles.checkoutForm}>
                <Text style={styles.formSectionTitle}>Check Out Hardware</Text>
                <Text style={styles.inputLabel}>Assign To Employee *</Text>

                {fetchingEmployees ? (
                  <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 12 }} />
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.employeeScroll}
                  >
                    {employees.map((emp) => (
                      <TouchableOpacity
                        key={emp.id}
                        onPress={() => setSelectedEmployeeId(emp.id)}
                        style={[
                          styles.employeeChip,
                          selectedEmployeeId === emp.id && styles.employeeChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.employeeChipText,
                            selectedEmployeeId === emp.id && styles.employeeChipTextSelected,
                          ]}
                        >
                          {emp.full_name}
                        </Text>
                        <Text
                          style={[
                            styles.employeeDeptText,
                            selectedEmployeeId === emp.id && styles.employeeDeptTextSelected,
                          ]}
                        >
                          {emp.department}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <Text style={styles.inputLabel}>Assignment Notes (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Remote setup, project work, peripheral included"
                  placeholderTextColor="#9CA3AF"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              {asset.status === 'available' && (
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Confirm Check Out</Text>
                  )}
                </TouchableOpacity>
              )}

              {asset.status === 'checked_out' && (
                <TouchableOpacity
                  style={[styles.successButton, loading && styles.buttonDisabled]}
                  onPress={handleCheckIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.successButtonText}>Check In Hardware</Text>
                  )}
                </TouchableOpacity>
              )}

              {asset.status !== 'available' && asset.status !== 'checked_out' && (
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeText}>
                    This item is currently flagged as {asset.status}. IT maintenance authorization required.
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  nameSection: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assetName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  monospace: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  assignmentCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 16,
  },
  assignmentTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  assignedName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#78350F',
  },
  assignedDept: {
    fontSize: 13,
    color: '#92400E',
    marginTop: 2,
  },
  assignedDate: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 6,
  },
  assignedNotes: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 6,
    fontStyle: 'italic',
  },
  checkoutForm: {
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  employeeScroll: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  employeeChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 130,
  },
  employeeChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  employeeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  employeeChipTextSelected: {
    color: '#1D4ED8',
  },
  employeeDeptText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  employeeDeptTextSelected: {
    color: '#3B82F6',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successButton: {
    backgroundColor: '#059669',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  noticeBox: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  noticeText: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },
});
