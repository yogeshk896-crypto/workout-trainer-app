import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Colors } from '../../../utils/colors';
import Badge from '../../../components/ui/Badge';

export default function ExerciseCard({
  exercise,
  currentSet,
  totalSets,
  isResting,
  onShowAnimation
}) {
  if (!exercise) return null;

  const difficultyVariant =
    exercise.difficulty_level === 'beginner' ? 'beginner' :
    exercise.difficulty_level === 'intermediate' ? 'intermediate' :
    'advanced';

  return (
    <View style={styles.container}>

      {/* Exercise Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
          <Badge
            label={exercise.difficulty_level || 'beginner'}
            variant={difficultyVariant}
          />
        </View>
        <TouchableOpacity
          style={styles.animationButton}
          onPress={onShowAnimation}
          activeOpacity={0.8}
        >
          <Text style={styles.animationButtonText}>▶️</Text>
          <Text style={styles.animationButtonLabel}>Watch</Text>
        </TouchableOpacity>
      </View>

      {/* Sets Progress */}
      <View style={styles.setsContainer}>
        <Text style={styles.setsLabel}>Set Progress</Text>
        <View style={styles.setsRow}>
          {Array.from({ length: totalSets }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.setDot,
                index < currentSet - 1 && styles.setDotCompleted,
                index === currentSet - 1 && styles.setDotCurrent
              ]}
            >
              {index < currentSet - 1 && (
                <Text style={styles.setDotCheck}>✓</Text>
              )}
              {index === currentSet - 1 && (
                <Text style={styles.setDotNumber}>{currentSet}</Text>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.setsText}>
          Set {currentSet} of {totalSets}
        </Text>
      </View>

      {/* Prescription */}
      <View style={styles.prescriptionRow}>
        <View style={styles.prescriptionItem}>
          <Text style={styles.prescriptionValue}>
            {exercise.prescribed_reps}
          </Text>
          <Text style={styles.prescriptionLabel}>
            {exercise.prescribed_reps?.toString().includes('sec') ? 'Duration' : 'Reps'}
          </Text>
        </View>
        <View style={styles.prescriptionDivider} />
        <View style={styles.prescriptionItem}>
          <Text style={styles.prescriptionValue}>
            {exercise.prescribed_sets}
          </Text>
          <Text style={styles.prescriptionLabel}>Sets</Text>
        </View>
        <View style={styles.prescriptionDivider} />
        <View style={styles.prescriptionItem}>
          <Text style={styles.prescriptionValue}>
            {exercise.prescribed_rest_seconds}s
          </Text>
          <Text style={styles.prescriptionLabel}>Rest</Text>
        </View>
      </View>

      {/* Status */}
      {isResting && (
        <View style={styles.restingBanner}>
          <Text style={styles.restingText}>
            😮‍💨 Rest time — breathe and recover
          </Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  headerLeft: {
    flex: 1,
    gap: 8
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flexWrap: 'wrap'
  },
  animationButton: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    minWidth: 56,
    borderWidth: 1,
    borderColor: Colors.border
  },
  animationButtonText: {
    fontSize: 20
  },
  animationButtonLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2
  },
  setsContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  setsLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 10,
    fontWeight: '600'
  },
  setsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8
  },
  setDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border
  },
  setDotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success
  },
  setDotCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  setDotCheck: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14
  },
  setDotNumber: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14
  },
  setsText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  prescriptionRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  prescriptionItem: {
    alignItems: 'center'
  },
  prescriptionValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2
  },
  prescriptionLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  prescriptionDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border
  },
  restingBanner: {
    backgroundColor: '#1b2d1e',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success
  },
  restingText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600'
  }
});