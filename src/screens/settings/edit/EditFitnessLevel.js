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

const FITNESS_LEVELS = [
  {
    id: 'beginner',
    name: 'Beginner',
    emoji: '🌱',
    color: Colors.easy,
    description: 'New to exercise or returning after a long break',
    details: [
      'Less than 6 months of training',
      'Learning basic movements',
      'Building consistency and habits',
      'Focus on form over intensity'
    ]
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    emoji: '⚡',
    color: Colors.warning,
    description: '6 months to 2 years of consistent training',
    details: [
      'Comfortable with basic exercises',
      'Ready to increase intensity',
      'Building strength progressively',
      'Can handle moderate volume'
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    emoji: '🔥',
    color: Colors.danger,
    description: '2+ years of consistent training experience',
    details: [
      'Strong foundation in all movements',
      'High intensity training ready',
      'Experienced with progressive overload',
      'Can handle high volume and frequency'
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

export default function EditFitnessLevel({ onBack }) {
  const userProfile = useUserStore(state => state.userProfile);
  const saveUserProfile = useUserStore(state => state.saveUserProfile);

  const [fitnessLevel, setFitnessLevel] = useState(
    userProfile?.fitness_level || 'beginner'
  );
  const [trainingAge, setTrainingAge] = useState(
    userProfile?.training_age_months || 0
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveUserProfile({
        ...userProfile,
        fitness_level: fitnessLevel,
        training_age_months: trainingAge,
        setup_completed: true
      });

      Alert.alert(
        '✅ Saved!',
        'Fitness level updated successfully. Consider regenerating your workout plan to reflect your new level.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      console.error('❌ Save failed:', error);
      Alert.alert('❌ Error', 'Failed to save. Please try again.');
    }
    setSaving(false);
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
          <Text style={styles.headerTitle}>Fitness Level</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            💡 Changing your fitness level will affect exercise difficulty and prescription. Consider regenerating your plan after saving.
          </Text>
        </View>

        {/* Fitness Level Selection */}
        <Text style={styles.sectionLabel}>Select Your Level</Text>

        {FITNESS_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelCard,
              fitnessLevel === level.id && {
                borderColor: level.color,
                backgroundColor: `${level.color}15`
              }
            ]}
            onPress={() => setFitnessLevel(level.id)}
            activeOpacity={0.8}
          >
            <View style={styles.levelHeader}>
              <View style={styles.levelLeft}>
                <Text style={styles.levelEmoji}>{level.emoji}</Text>
                <View>
                  <Text style={[
                    styles.levelName,
                    fitnessLevel === level.id && { color: level.color }
                  ]}>
                    {level.name}
                  </Text>
                  <Text style={styles.levelDescription}>
                    {level.description}
                  </Text>
                </View>
              </View>
              {fitnessLevel === level.id && (
                <View style={[
                  styles.checkBadge,
                  { backgroundColor: level.color }
                ]}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              )}
            </View>

            {fitnessLevel === level.id && (
              <View style={styles.levelDetails}>
                {level.details.map((detail, index) => (
                  <Text key={index} style={styles.levelDetail}>
                    • {detail}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Training Age */}
        <Text style={styles.sectionLabel}>
          How long have you been training?
        </Text>

        <View style={styles.trainingAgeGrid}>
          {TRAINING_AGE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.trainingAgeButton,
                trainingAge === option.value && styles.trainingAgeSelected
              ]}
              onPress={() => setTrainingAge(option.value)}
            >
              <Text style={[
                styles.trainingAgeLabel,
                trainingAge === option.value && styles.trainingAgeLabelSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Values */}
        <View style={styles.currentValues}>
          <Text style={styles.currentValuesTitle}>Current Values</Text>
          <View style={styles.currentValueRow}>
            <Text style={styles.currentValueLabel}>Fitness Level</Text>
            <Text style={styles.currentValueValue}>
              {userProfile?.fitness_level
                ? userProfile.fitness_level.charAt(0).toUpperCase() +
                  userProfile.fitness_level.slice(1)
                : '—'}
            </Text>
          </View>
          <View style={styles.currentValueRow}>
            <Text style={styles.currentValueLabel}>Training Age</Text>
            <Text style={styles.currentValueValue}>
              {userProfile?.training_age_months === 0
                ? 'Just starting'
                : userProfile?.training_age_months
                ? `${userProfile.training_age_months} months`
                : '—'}
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
  infoBanner: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary
  },
  infoBannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  levelCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1
  },
  levelEmoji: { fontSize: 32 },
  levelName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  levelDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    width: '85%'
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12
  },
  levelDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  levelDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4
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
  trainingAgeLabelSelected: { color: '#ffffff' },
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