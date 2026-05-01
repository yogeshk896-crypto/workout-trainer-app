import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Colors } from '../../../utils/colors';
import Button from '../../../components/ui/Button';

const EQUIPMENT_LIST = [
  {
    id: 'bodyweight',
    name: 'Bodyweight',
    emoji: '🧍',
    description: 'No equipment needed',
    alwaysSelected: true
  },
  {
    id: 'dumbbell',
    name: 'Dumbbells',
    emoji: '🏋️',
    description: 'Free weights for versatile training'
  },
  {
    id: 'barbell',
    name: 'Barbell',
    emoji: '⚖️',
    description: 'Heavy lifting compound movements'
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell',
    emoji: '🔔',
    description: 'Dynamic and ballistic movements'
  },
  {
    id: 'resistance_band',
    name: 'Resistance Bands',
    emoji: '〰️',
    description: 'Portable elastic resistance'
  },
  {
    id: 'pull_up_bar',
    name: 'Pull-Up Bar',
    emoji: '🔝',
    description: 'Upper body pulling movements'
  },
  {
    id: 'bench',
    name: 'Weight Bench',
    emoji: '🪑',
    description: 'Pressing and supported exercises'
  },
  {
    id: 'yoga_mat',
    name: 'Yoga Mat',
    emoji: '🧘',
    description: 'Floor exercises and stretching'
  }
];

export default function StepEquipment({ data, onUpdate, onNext, onBack }) {
  const [error, setError] = React.useState('');

  // Initialize with bodyweight always selected
  React.useEffect(() => {
    if (data.equipment.length === 0) {
      onUpdate({
        equipment: [{ id: 'bodyweight', name: 'Bodyweight' }]
      });
    }
  }, []);

  const isSelected = (equipmentId) => {
    return data.equipment.some(e => e.id === equipmentId);
  };

  const toggleEquipment = (equipment) => {
    // Bodyweight always stays selected
    if (equipment.id === 'bodyweight') return;

    const currentEquipment = data.equipment || [];
    const isCurrentlySelected = isSelected(equipment.id);

    if (isCurrentlySelected) {
      // Remove it
      onUpdate({
        equipment: currentEquipment.filter(e => e.id !== equipment.id)
      });
    } else {
      // Add it
      onUpdate({
        equipment: [...currentEquipment, { id: equipment.id, name: equipment.name }]
      });
    }
    setError('');
  };

  const handleNext = () => {
    if (!data.equipment || data.equipment.length === 0) {
      setError('Please select at least one equipment type');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <Text style={styles.instruction}>
        Select all equipment you have access to. This helps us build the perfect workout plan for you.
      </Text>

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
                <View style={styles.checkmarkBadge}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}

              <Text style={styles.equipmentEmoji}>{equipment.emoji}</Text>
              <Text style={[
                styles.equipmentName,
                selected && styles.equipmentNameSelected
              ]}>
                {equipment.name}
              </Text>
              <Text style={styles.equipmentDescription}>
                {equipment.description}
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
          {data.equipment?.length || 0} equipment type{data.equipment?.length !== 1 ? 's' : ''} selected
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Buttons */}
      <Button
        title="Continue →"
        onPress={handleNext}
        variant="primary"
        size="large"
        style={styles.btn}
      />
      <Button
        title="← Back"
        onPress={onBack}
        variant="secondary"
        size="medium"
        style={styles.btn}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  instruction: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
    lineHeight: 20
  },
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
  checkmarkBadge: {
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
  checkmarkText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  equipmentEmoji: {
    fontSize: 32,
    marginBottom: 8
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4
  },
  equipmentNameSelected: {
    color: Colors.primary
  },
  equipmentDescription: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 15
  },
  alwaysTag: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 4
  },
  selectedCount: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  selectedCountText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center'
  },
  btn: {
    marginBottom: 10
  }
});