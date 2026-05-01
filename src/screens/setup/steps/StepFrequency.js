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

const FREQUENCY_OPTIONS = [
  {
    value: 1,
    label: '1 day',
    sublabel: 'per week',
    description: 'Light schedule',
    emoji: '😌',
    recommended: false
  },
  {
    value: 2,
    label: '2 days',
    sublabel: 'per week',
    description: 'Minimum effective',
    emoji: '🚶',
    recommended: false
  },
  {
    value: 3,
    label: '3 days',
    sublabel: 'per week',
    description: 'Great for beginners',
    emoji: '⚡',
    recommended: true
  },
  {
    value: 4,
    label: '4 days',
    sublabel: 'per week',
    description: 'Optimal for most',
    emoji: '💪',
    recommended: true
  },
  {
    value: 5,
    label: '5 days',
    sublabel: 'per week',
    description: 'High frequency',
    emoji: '🔥',
    recommended: false
  },
  {
    value: 6,
    label: '6 days',
    sublabel: 'per week',
    description: 'Advanced athletes',
    emoji: '🏆',
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

export default function StepFrequency({ data, onUpdate, onNext, onBack }) {
  const [error, setError] = React.useState('');

  const toggleDay = (dayId) => {
    const currentDays = data.preferred_workout_days || [];
    const isSelected = currentDays.includes(dayId);

    if (isSelected) {
      onUpdate({
        preferred_workout_days: currentDays.filter(d => d !== dayId)
      });
    } else {
      onUpdate({
        preferred_workout_days: [...currentDays, dayId]
      });
    }
  };

  const handleNext = () => {
    if (!data.workout_frequency) {
      setError('Please select workout frequency');
      return;
    }
    if (!data.session_duration_minutes) {
      setError('Please select session duration');
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

      {/* Frequency Selection */}
      <Text style={styles.sectionLabel}>
        How many days per week?
      </Text>

      <View style={styles.frequencyGrid}>
        {FREQUENCY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.frequencyCard,
              data.workout_frequency === option.value && styles.frequencyCardSelected
            ]}
            onPress={() => {
              onUpdate({ workout_frequency: option.value });
              setError('');
            }}
            activeOpacity={0.8}
          >
            {option.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>⭐</Text>
              </View>
            )}
            <Text style={styles.frequencyEmoji}>{option.emoji}</Text>
            <Text style={[
              styles.frequencyLabel,
              data.workout_frequency === option.value && styles.frequencyLabelSelected
            ]}>
              {option.label}
            </Text>
            <Text style={styles.frequencySublabel}>{option.sublabel}</Text>
            <Text style={styles.frequencyDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Duration Selection */}
      <Text style={styles.sectionLabel}>
        How long per session?
      </Text>

      <View style={styles.durationGrid}>
        {DURATION_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.durationCard,
              data.session_duration_minutes === option.value && styles.durationCardSelected
            ]}
            onPress={() => {
              onUpdate({ session_duration_minutes: option.value });
              setError('');
            }}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.durationLabel,
              data.session_duration_minutes === option.value && styles.durationLabelSelected
            ]}>
              {option.label}
            </Text>
            <Text style={styles.durationDescription}>
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preferred Days */}
      <Text style={styles.sectionLabel}>
        Preferred workout days (optional)
      </Text>
      <Text style={styles.sectionSubLabel}>
        We'll try to schedule your workouts on these days
      </Text>

      <View style={styles.daysRow}>
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = data.preferred_workout_days?.includes(day.id);
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

      {/* Summary */}
      {data.workout_frequency && data.session_duration_minutes && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            📅 {data.workout_frequency} days/week × {data.session_duration_minutes} min
            {' = '}
            <Text style={styles.summaryHighlight}>
              {data.workout_frequency * data.session_duration_minutes} min/week
            </Text>
          </Text>
        </View>
      )}

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
  recommendedBadge: {
    position: 'absolute',
    top: 6,
    right: 6
  },
  recommendedText: {
    fontSize: 10
  },
  frequencyEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  frequencyLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  frequencyLabelSelected: {
    color: Colors.primary
  },
  frequencySublabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2
  },
  frequencyDescription: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center'
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
  durationLabelSelected: {
    color: Colors.primary
  },
  durationDescription: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
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
  dayLabelSelected: {
    color: '#ffffff'
  },
  summary: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center'
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  summaryHighlight: {
    color: Colors.primary,
    fontWeight: 'bold'
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