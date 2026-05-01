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

const FITNESS_LEVELS = [
  {
    id: 'beginner',
    name: 'Beginner',
    emoji: '🌱',
    description: 'New to exercise or returning after a long break',
    details: [
      'Less than 6 months of training',
      'Learning basic movements',
      'Building consistency'
    ]
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    emoji: '⚡',
    description: '6 months to 2 years of consistent training',
    details: [
      'Comfortable with basic exercises',
      'Ready to increase intensity',
      'Building strength progressively'
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    emoji: '🔥',
    description: '2+ years of consistent training experience',
    details: [
      'Strong foundation in all movements',
      'High intensity training ready',
      'Experienced with progressive overload'
    ]
  }
];

const TRAINING_AGE_OPTIONS = [
  { label: 'Just starting', value: 0 },
  { label: '1-3 months', value: 2 },
  { label: '3-6 months', value: 4 },
  { label: '6-12 months', value: 9 },
  { label: '1-2 years', value: 18 },
  { label: '2-3 years', value: 30 },
  { label: '3+ years', value: 42 }
];

export default function StepFitnessLevel({ data, onUpdate, onNext, onBack }) {
  const [error, setError] = React.useState('');

  const handleNext = () => {
    if (!data.fitness_level) {
      setError('Please select your fitness level');
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

      {/* Fitness Level Selection */}
      <Text style={styles.sectionLabel}>Select Your Level</Text>

      {FITNESS_LEVELS.map((level) => (
        <TouchableOpacity
          key={level.id}
          style={[
            styles.levelCard,
            data.fitness_level === level.id && styles.levelCardSelected
          ]}
          onPress={() => {
            onUpdate({ fitness_level: level.id });
            setError('');
          }}
          activeOpacity={0.8}
        >
          {/* Left: Emoji + Name */}
          <View style={styles.levelLeft}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <View>
              <Text style={[
                styles.levelName,
                data.fitness_level === level.id && styles.levelNameSelected
              ]}>
                {level.name}
              </Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
            </View>
          </View>

          {/* Right: Checkmark */}
          {data.fitness_level === level.id && (
            <Text style={styles.checkmark}>✓</Text>
          )}

          {/* Details */}
          {data.fitness_level === level.id && (
            <View style={styles.detailsContainer}>
              {level.details.map((detail, index) => (
                <Text key={index} style={styles.detailItem}>
                  • {detail}
                </Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Training Age */}
      <Text style={styles.sectionLabel}>How long have you been training?</Text>
      <View style={styles.trainingAgeGrid}>
        {TRAINING_AGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.trainingAgeButton,
              data.training_age_months === option.value && styles.trainingAgeSelected
            ]}
            onPress={() => onUpdate({ training_age_months: option.value })}
          >
            <Text style={[
              styles.trainingAgeLabel,
              data.training_age_months === option.value && styles.trainingAgeLabelSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
    marginBottom: 12,
    marginTop: 8
  },
  levelCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    flexWrap: 'wrap'
  },
  levelCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1e1b4b'
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12
  },
  levelEmoji: {
    fontSize: 32
  },
  levelName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  levelNameSelected: {
    color: Colors.primary
  },
  levelDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    flexWrap: 'wrap',
    width: '85%'
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
    position: 'absolute',
    right: 16,
    top: 16
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%'
  },
  detailItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 12
  },
  trainingAgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24
  },
  trainingAgeButton: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border
  },
  trainingAgeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  trainingAgeLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  trainingAgeLabelSelected: {
    color: '#ffffff'
  },
  btn: {
    marginBottom: 10
  }
});