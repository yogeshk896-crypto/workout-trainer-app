import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../utils/colors';
import Button from '../../../components/ui/Button';
import useUserStore from '../../../state/useUserStore';

const EQUIPMENT_LIST = [
  {
    id: 'bodyweight',
    name: 'Bodyweight',
    emoji: '🧍',
    description: 'No equipment needed',
    alwaysSelected: true,
    exercises: 36
  },
  {
    id: 'dumbbell',
    name: 'Dumbbells',
    emoji: '🏋️',
    description: 'Free weights for versatile training',
    alwaysSelected: false,
    exercises: 20
  },
  {
    id: 'barbell',
    name: 'Barbell',
    emoji: '⚖️',
    description: 'Heavy lifting compound movements',
    alwaysSelected: false,
    exercises: 5
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell',
    emoji: '🔔',
    description: 'Dynamic and ballistic movements',
    alwaysSelected: false,
    exercises: 4
  },
  {
    id: 'resistance_band',
    name: 'Resistance Bands',
    emoji: '〰️',
    description: 'Portable elastic resistance',
    alwaysSelected: false,
    exercises: 7
  },
  {
    id: 'pull_up_bar',
    name: 'Pull-Up Bar',
    emoji: '🔝',
    description: 'Upper body pulling movements',
    alwaysSelected: false,
    exercises: 5
  },
  {
    id: 'bench',
    name: 'Weight Bench',
    emoji: '🪑',
    description: 'Pressing and supported exercises',
    alwaysSelected: false,
    exercises: 3
  },
  {
    id: 'yoga_mat',
    name: 'Yoga Mat',
    emoji: '🧘',
    description: 'Floor exercises and stretching',
    alwaysSelected: false,
    exercises: 8
  }
];

export default function EditEquipment({ onBack }) {
  const userProfile = useUserStore(state => state.userProfile);
  const userEquipment = useUserStore(state => state.userEquipment);
  const saveUserEquipment = useUserStore(state => state.saveUserEquipment);

  const [selectedEquipment, setSelectedEquipment] = useState(
    userEquipment?.length > 0
      ? userEquipment.map(e => ({
          id: e.equipment_id,
          name: e.equipment_name
        }))
      : [{ id: 'bodyweight', name: 'Bodyweight' }]
  );
  const [saving, setSaving] = useState(false);

  const isSelected = (equipmentId) => {
    return selectedEquipment.some(e => e.id === equipmentId);
  };

  const toggleEquipment = (equipment) => {
    if (equipment.alwaysSelected) return;

    const isCurrentlySelected = isSelected(equipment.id);

    if (isCurrentlySelected) {
      setSelectedEquipment(prev =>
        prev.filter(e => e.id !== equipment.id)
      );
    } else {
      setSelectedEquipment(prev => [
        ...prev,
        { id: equipment.id, name: equipment.name }
      ]);
    }
  };

  // Calculate total available exercises
  const getTotalExercises = () => {
    return EQUIPMENT_LIST.filter(eq =>
      isSelected(eq.id)
    ).reduce((sum, eq) => sum + eq.exercises, 0);
  };

  const handleSave = async () => {
    if (selectedEquipment.length === 0) {
      Alert.alert(
        '⚠️ Warning',
        'Please select at least Bodyweight equipment.'
      );
      return;
    }

    Alert.alert(
      '🔧 Update Equipment',
      'Updating equipment will affect your available exercises. Consider regenerating your workout plan after saving.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save & Update',
          onPress: async () => {
            setSaving(true);
            try {
              await saveUserEquipment(
                userProfile.id,
                selectedEquipment
              );
              Alert.alert(
                '✅ Saved!',
                'Equipment updated successfully. Consider regenerating your workout plan.',
                [{ text: 'OK', onPress: onBack }]
              );
            } catch (error) {
              console.error('❌ Save failed:', error);
              Alert.alert('❌ Error', 'Failed to save. Please try again.');
            }
            setSaving(false);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Equipment</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            🔧 Select all equipment you have access to. This determines which exercises are available in your workouts.
          </Text>
        </View>

        {/* Exercise Count Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>💪</Text>
          <View>
            <Text style={styles.summaryCount}>
              {getTotalExercises()} exercises available
            </Text>
            <Text style={styles.summarySubtext}>
              with your selected equipment
            </Text>
          </View>
        </View>

        {/* Equipment Grid */}
        <View style={styles.grid}>
          {EQUIPMENT_LIST.map((equipment) => {
            const selected = isSelected(equipment.id);

            return (
              <TouchableOpacity
                key={equipment.id}
                style={[
                  styles.equipmentCard,
                  selected && styles.equipmentCardSelected,
                  equipment.alwaysSelected && styles.equipmentCardAlways
                ]}
                onPress={() => toggleEquipment(equipment)}
                activeOpacity={equipment.alwaysSelected ? 1 : 0.8}
              >
                {/* Checkmark */}
                {selected && (
                  <View style={[
                    styles.checkBadge,
                    equipment.alwaysSelected && styles.checkBadgeAlways
                  ]}>
                    <Text style={styles.checkBadgeText}>✓</Text>
                  </View>
                )}

                <Text style={styles.equipmentEmoji}>
                  {equipment.emoji}
                </Text>
                <Text style={[
                  styles.equipmentName,
                  selected && styles.equipmentNameSelected
                ]}>
                  {equipment.name}
                </Text>
                <Text style={styles.equipmentDescription}>
                  {equipment.description}
                </Text>
                <Text style={[
                  styles.exerciseCount,
                  selected && styles.exerciseCountSelected
                ]}>
                  {equipment.exercises} exercises
                </Text>

                {equipment.alwaysSelected && (
                  <Text style={styles.alwaysTag}>Always included</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Count */}
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedEquipment.length} equipment type
            {selectedEquipment.length !== 1 ? 's' : ''} selected
          </Text>
          <Text style={styles.selectedEquipmentNames}>
            {selectedEquipment.map(e => e.name).join(', ')}
          </Text>
        </View>

        {/* Current Equipment */}
        <View style={styles.currentValues}>
          <Text style={styles.currentValuesTitle}>Current Equipment</Text>
          {userEquipment?.length > 0 ? (
            <View style={styles.currentEquipmentTags}>
              {userEquipment.map((eq) => (
                <View key={eq.id} style={styles.currentTag}>
                  <Text style={styles.currentTagText}>
                    {eq.equipment_name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noEquipmentText}>
              Bodyweight only
            </Text>
          )}
        </View>

        {/* Save Button */}
        <Button
          title={saving ? 'Saving...' : '💾 Save Changes'}
          onPress={handleSave}
          variant="primary"
          size="large"
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
        />
        <Button
          title="Cancel"
          onPress={onBack}
          variant="secondary"
          size="medium"
          disabled={saving}
          style={styles.cancelBtn}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  infoBanner: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary
  },
  infoBannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border
  },
  summaryEmoji: { fontSize: 32 },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary
  },
  summarySubtext: { fontSize: 12, color: Colors.textMuted },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  equipmentCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    position: 'relative'
  },
  equipmentCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1e1b4b'
  },
  equipmentCardAlways: {
    borderColor: Colors.success,
    backgroundColor: '#1b2d1e'
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBadgeAlways: {
    backgroundColor: Colors.success
  },
  checkBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  equipmentEmoji: { fontSize: 32, marginBottom: 8 },
  equipmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4
  },
  equipmentNameSelected: { color: Colors.primary },
  equipmentDescription: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 6
  },
  exerciseCount: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  exerciseCountSelected: { color: Colors.primary },
  alwaysTag: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 4
  },
  selectedCount: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  selectedEquipmentNames: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  currentValues: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border
  },
  currentValuesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  currentEquipmentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  currentTag: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary
  },
  currentTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600'
  },
  noEquipmentText: { fontSize: 14, color: Colors.textMuted },
  saveBtn: { marginBottom: 10 },
  cancelBtn: { marginBottom: 10 }
});