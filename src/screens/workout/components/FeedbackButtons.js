import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Colors } from '../../../utils/colors';

const FEEDBACK_OPTIONS = [
  {
    id: 'easy',
    label: 'Too Easy',
    emoji: '😊',
    description: 'Could do more reps',
    color: Colors.easy,
    backgroundColor: '#1b2d1e',
    borderColor: Colors.easy
  },
  {
    id: 'normal',
    label: 'Just Right',
    emoji: '💪',
    description: 'Good challenge',
    color: Colors.normal,
    backgroundColor: '#1e1b4b',
    borderColor: Colors.normal
  },
  {
    id: 'hard',
    label: 'Too Hard',
    emoji: '😤',
    description: 'Struggled to finish',
    color: Colors.hard,
    backgroundColor: '#2d1b1b',
    borderColor: Colors.hard
  }
];

export default function FeedbackButtons({
  onSubmit,
  exerciseName,
  prescribedReps,
  prescribedSets
}) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [completedAsPresribed, setCompletedAsPrescribed] = useState(true);
  const [painReported, setPainReported] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedFeedback) return;

    setSubmitted(true);
    onSubmit({
      difficulty_rating: selectedFeedback,
      completed_as_prescribed: completedAsPresribed,
      actual_sets_completed: prescribedSets,
      actual_reps_completed: prescribedReps?.toString(),
      pain_reported: painReported,
      form_rating: 'good'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How was that set?</Text>
      <Text style={styles.subtitle}>{exerciseName}</Text>

      {/* Feedback Options */}
      <View style={styles.feedbackRow}>
        {FEEDBACK_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.feedbackButton,
              selectedFeedback === option.id && {
                backgroundColor: option.backgroundColor,
                borderColor: option.borderColor
              }
            ]}
            onPress={() => setSelectedFeedback(option.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.feedbackEmoji}>{option.emoji}</Text>
            <Text style={[
              styles.feedbackLabel,
              selectedFeedback === option.id && { color: option.color }
            ]}>
              {option.label}
            </Text>
            <Text style={styles.feedbackDescription}>
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Completed as prescribed */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          completedAsPresribed && styles.toggleButtonActive
        ]}
        onPress={() => setCompletedAsPrescribed(prev => !prev)}
      >
        <Text style={styles.toggleIcon}>
          {completedAsPresribed ? '✅' : '❌'}
        </Text>
        <Text style={[
          styles.toggleLabel,
          completedAsPresribed && styles.toggleLabelActive
        ]}>
          Completed all {prescribedReps} reps × {prescribedSets} sets
        </Text>
      </TouchableOpacity>

      {/* Pain report */}
      <TouchableOpacity
        style={[
          styles.painButton,
          painReported && styles.painButtonActive
        ]}
        onPress={() => setPainReported(prev => !prev)}
      >
        <Text style={styles.toggleIcon}>
          {painReported ? '⚠️' : '✅'}
        </Text>
        <Text style={[
          styles.toggleLabel,
          painReported && { color: Colors.danger }
        ]}>
          {painReported ? 'Pain reported — exercise will be reviewed' : 'No pain or discomfort'}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          !selectedFeedback && styles.submitButtonDisabled,
          submitted && styles.submitButtonSubmitted
        ]}
        onPress={handleSubmit}
        disabled={!selectedFeedback || submitted}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {submitted ? '✅ Saved!' : 'Save & Continue →'}
        </Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 16
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border
  },
  feedbackEmoji: {
    fontSize: 28,
    marginBottom: 6
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center'
  },
  feedbackDescription: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border
  },
  toggleButtonActive: {
    borderColor: Colors.success,
    backgroundColor: '#1b2d1e'
  },
  toggleIcon: {
    fontSize: 18
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1
  },
  toggleLabelActive: {
    color: Colors.success
  },
  painButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  painButtonActive: {
    borderColor: Colors.danger,
    backgroundColor: '#2d1b1b'
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    opacity: 0.4
  },
  submitButtonSubmitted: {
    backgroundColor: Colors.success
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  }
});