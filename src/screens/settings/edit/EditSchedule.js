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

const FREQUENCY_OPTIONS = [
  {
    value: 1,
    label: '1 day',
    sublabel: 'per week',
    emoji: '😌',
    description: 'Light schedule',
    recommended: false
  },
  {
    value: 2,
    label: '2 days',
    sublabel: 'per week',
    emoji: '🚶',
    description: 'Minimum effective',
    recommended: false
  },
  {
    value: 3,
    label: '3 days',
    sublabel: 'per week',
    emoji: '⚡',
    description: 'Great for beginners',
    recommended: true
  },
  {
    value: 4,
    label: '4 days',
    sublabel: 'per week',
    emoji: '💪',
    description: 'Optimal for most',
    recommended: true
  },
  {
    value: 5,
    label: '5 days',
    sublabel: 'per week',
    emoji: '🔥',
    description: 'High frequency',
    recommended: false
  },
  {
    value: 6,
    label: '6 days',
    sublabel: 'per week',
    emoji: '🏆',
    description: 'Advanced athletes',
    recommended: false
  }
];

const DURATION_OPTIONS = [
  { value: 20, label: '20 min', description: 'Quick session' },
  { value: 30, label: '30 min', description: 'Short & effective' },
  { value: 45, label: '45 min', description: 'Standard session' },
  { value: 60, label: '60 min', description: 'Full session' },
  { value: 75, label: '75 min', description: 'Extended session' },
  { value: 90, label: '90 min', description: 'Long session' }
];

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' }
];

const SPLIT_OPTIONS = [
  { id: 'full_body_3day', label: 'Full Body 3 Day', frequency: 3 },
  { id: 'full_body_2day', label: 'Full Body 2 Day', frequency: 2 },
  { id: 'upper_lower_4day', label: 'Upper/Lower 4 Day', frequency: 4 },
  { id: 'upper_lower_5day', label: 'Upper/Lower 5 Day', frequency: 5 },
  { id: 'push_pull_legs_5day', label: 'Push/Pull/Legs 5 Day', frequency: 5 },
  { id: 'push_pull_legs_6day', label: 'Push/Pull/Legs 6 Day', frequency: 6 },
  { id: 'body_part_4day', label: 'Body Part 4 Day', frequency: 4 },
  { id: 'body_part_5day', label: 'Body Part 5 Day', frequency: 5 }
];

export default function EditSchedule({ onBack }) {
  const userProfile = useUserStore(state => state.userProfile);
  const userPreferences = useUserStore(state => state.userPreferences);
  const saveUserPreferences = useUserStore(state => state.saveUserPreferences);

  const [frequency, setFrequency] = useState(
    userPreferences?.workout_frequency || 3
  );
  const [duration, setDuration] = useState(
    userPreferences?.session_duration_minutes || 45
  );
  const [splitId, setSplitId] = useState(
    userPreferences?.preferred_split_id || 'full_body_3day'
  );
  const [preferredDays, setPreferredDays] = useState(
    userPreferences?.preferred_workout_days
      ? userPreferences.preferred_workout_days.split(',').filter(d => d)
      : []
  );
  const [saving, setSaving] = useState(false);

  const toggleDay = (dayId) => {
    const isSelected = preferredDays.includes(dayId);
    if (isSelected) {
      setPreferredDays(prev => prev.filter(d => d !== dayId));
    } else {
      setPreferredDays(prev => [...prev, dayId]);
    }
  };

  // Get compatible splits for selected frequency
  const getCompatibleSplits = () => {
    return SPLIT_OPTIONS.filter(s =>
      Math.abs(s.frequency - frequency) <= 1
    );
  };

  const handleSave = async () => {
    Alert.alert(
      '📅 Update Schedule',
      'Updating your schedule will require regenerating your workout plan. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save & Update',
          onPress: async () => {
            setSaving(true);
            try {
              await saveUserPreferences(
                userProfile.id,
                {
                  workout_frequency: frequency,
                  session_duration_minutes: duration,
                  preferred_split_id: splitId,
                  preferred_workout_days: preferredDays.join(','),
                  units: userPreferences?.units || 'metric'
                }
              );

              Alert.alert(
                '✅ Saved!',
                'Schedule updated. Please regenerate your workout plan from Settings to apply changes.',
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

  const weeklyMinutes = frequency * duration;

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
          <Text style={styles.headerTitle}>Schedule</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Weekly Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{frequency}</Text>
            <Text style={styles.summaryLabel}>Days/Week</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{duration}</Text>
            <Text style={styles.summaryLabel}>Min/Session</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>
              {weeklyMinutes}
            </Text>
            <Text style={styles.summaryLabel}>Min/Week</Text>
          </View>
        </View>

        {/* Frequency */}
        <Text style={styles.sectionLabel}>Workout Frequency</Text>
        <View style={styles.frequencyGrid}>
          {FREQUENCY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.frequencyCard,
                frequency === option.value && styles.frequencyCardSelected
              ]}
              onPress={() => {
                setFrequency(option.value);
                // Auto-select compatible split
                const compatible = SPLIT_OPTIONS.filter(
                  s => Math.abs(s.frequency - option.value) <= 1
                );
                if (compatible.length > 0) {
                  setSplitId(compatible[0].id);
                }
              }}
              activeOpacity={0.8}
            >
              {option.recommended && (
                <Text style={styles.recommendedStar}>⭐</Text>
              )}
              <Text style={styles.frequencyEmoji}>{option.emoji}</Text>
              <Text style={[
                styles.frequencyLabel,
                frequency === option.value && styles.frequencyLabelSelected
              ]}>
                {option.label}
              </Text>
              <Text style={styles.frequencySublabel}>
                {option.sublabel}
              </Text>
              <Text style={styles.frequencyDescription}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Duration */}
        <Text style={styles.sectionLabel}>Session Duration</Text>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.durationCard,
                duration === option.value && styles.durationCardSelected
              ]}
              onPress={() => setDuration(option.value)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.durationLabel,
                duration === option.value && styles.durationLabelSelected
              ]}>
                {option.label}
              </Text>
              <Text style={styles.durationDescription}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workout Split */}
        <Text style={styles.sectionLabel}>Workout Split</Text>
        <Text style={styles.sectionSubLabel}>
          Compatible splits for {frequency} days/week
        </Text>
        <View style={styles.splitList}>
          {getCompatibleSplits().map((split) => (
            <TouchableOpacity
              key={split.id}
              style={[
                styles.splitOption,
                splitId === split.id && styles.splitOptionSelected
              ]}
              onPress={() => setSplitId(split.id)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.splitLabel,
                splitId === split.id && styles.splitLabelSelected
              ]}>
                {split.label}
              </Text>
              <Text style={styles.splitFrequency}>
                {split.frequency} days/week
              </Text>
              {splitId === split.id && (
                <Text style={styles.splitCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferred Days */}
        <Text style={styles.sectionLabel}>Preferred Days (Optional)</Text>
        <Text style={styles.sectionSubLabel}>
          We'll try to schedule on these days
        </Text>
        <View style={styles.daysRow}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = preferredDays.includes(day.id);
            return (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonSelected
                ]}
                onPress={() => toggleDay(day.id)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected
                ]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Values */}
        <View style={styles.currentValues}>
          <Text style={styles.currentValuesTitle}>Current Schedule</Text>
          <View style={styles.currentValueRow}>
            <Text style={styles.currentValueLabel}>Frequency</Text>
            <Text style={styles.currentValueValue}>
              {userPreferences?.workout_frequency || 3} days/week
            </Text>
          </View>
          <View style={styles.currentValueRow}>
            <Text style={styles.currentValueLabel}>Duration</Text>
            <Text style={styles.currentValueValue}>
              {userPreferences?.session_duration_minutes || 45} min
            </Text>
          </View>
          <View style={styles.currentValueRow}>
            <Text style={styles.currentValueLabel}>Split</Text>
            <Text style={styles.currentValueValue}>
              {userPreferences?.preferred_split_id
                ?.replace(/_/g, ' ')
                ?.replace(/\b\w/g, l => l.toUpperCase()) || '—'}
            </Text>
          </View>
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  summaryLabel: { fontSize: 11, color: Colors.textMuted },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 8
  },
  sectionSubLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24
  },
  frequencyCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    position: 'relative'
  },
  frequencyCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1e1b4b'
  },
  recommendedStar: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 10
  },
  frequencyEmoji: { fontSize: 24, marginBottom: 4 },
  frequencyLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  frequencyLabelSelected: { color: Colors.primary },
  frequencySublabel: { fontSize: 10, color: Colors.textMuted },
  frequencyDescription: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24
  },
  durationCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center'
  },
  durationCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1e1b4b'
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  durationLabelSelected: { color: Colors.primary },
  durationDescription: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  splitList: { gap: 8, marginBottom: 24 },
  splitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.border
  },
  splitOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1e1b4b'
  },
  splitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1
  },
  splitLabelSelected: { color: Colors.primary },
  splitFrequency: { fontSize: 12, color: Colors.textMuted },
  splitCheck: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 8
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
    flexWrap: 'wrap'
  },
  dayButton: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: Colors.border
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted
  },
  dayLabelSelected: { color: '#ffffff' },
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
  currentValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  currentValueLabel: { fontSize: 14, color: Colors.textMuted },
  currentValueValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  saveBtn: { marginBottom: 10 },
  cancelBtn: { marginBottom: 10 }
});