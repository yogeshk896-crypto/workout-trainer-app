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

const GOALS_LIST = [
  {
    id: 'fat_loss',
    name: 'Fat Loss',
    emoji: '🔥',
    description: 'Burn fat and get lean',
    details: 'High frequency training with cardio emphasis'
  },
  {
    id: 'muscle_gain',
    name: 'Muscle Gain',
    emoji: '💪',
    description: 'Build muscle size and definition',
    details: 'Progressive resistance with hypertrophy focus'
  },
  {
    id: 'strength',
    name: 'Strength',
    emoji: '🏋️',
    description: 'Get stronger on big lifts',
    details: 'Heavy compound movements with low reps'
  },
  {
    id: 'endurance',
    name: 'Endurance',
    emoji: '🏃',
    description: 'Improve stamina and cardio',
    details: 'High rep training with short rest periods'
  },
  {
    id: 'mobility',
    name: 'Mobility',
    emoji: '🧘',
    description: 'Improve flexibility and movement',
    details: 'Stretching and controlled movement work'
  },
  {
    id: 'general_fitness',
    name: 'General Fitness',
    emoji: '⚡',
    description: 'Overall health and wellness',
    details: 'Balanced training across all components'
  },
  {
    id: 'rehab_safe',
    name: 'Rehab Safe',
    emoji: '🩺',
    description: 'Safe training after injury',
    details: 'Light load with strict form'
  },
  {
    id: 'athletic_performance',
    name: 'Athletic Performance',
    emoji: '🏅',
    description: 'Improve sports performance',
    details: 'Power, speed and explosive training'
  }
];

export default function EditGoals({ onBack }) {
  const userProfile = useUserStore(state => state.userProfile);
  const userGoals = useUserStore(state => state.userGoals);
  const saveUserGoals = useUserStore(state => state.saveUserGoals);

  const [selectedGoals, setSelectedGoals] = useState(
    userGoals?.map(g => ({
      id: g.goal_id,
      name: g.goal_name
    })) || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isSelected = (goalId) => {
    return selectedGoals.some(g => g.id === goalId);
  };

  const toggleGoal = (goal) => {
    const isCurrentlySelected = isSelected(goal.id);

    if (isCurrentlySelected) {
      setSelectedGoals(prev => prev.filter(g => g.id !== goal.id));
    } else {
      if (selectedGoals.length >= 3) {
        setError('Maximum 3 goals allowed. Remove one to add another.');
        return;
      }
      setSelectedGoals(prev => [...prev, { id: goal.id, name: goal.name }]);
    }
    setError('');
  };

  const handleSave = async () => {
    if (selectedGoals.length === 0) {
      setError('Please select at least one goal');
      return;
    }

    setSaving(true);
    try {
      await saveUserGoals(
        userProfile.id,
        selectedGoals.map((g, index) => ({
          id: g.id,
          name: g.name,
          isPrimary: index === 0
        }))
      );

      Alert.alert(
        '✅ Saved!',
        'Goals updated successfully. Consider regenerating your workout plan to reflect your new goals.',
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
          <Text style={styles.headerTitle}>My Goals</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            🎯 Select up to 3 goals. Your first selection is your primary goal. Consider regenerating your plan after saving.
          </Text>
        </View>

        {/* Goals List */}
        {GOALS_LIST.map((goal) => {
          const selected = isSelected(goal.id);
          const selectionIndex = selectedGoals.findIndex(g => g.id === goal.id);

          return (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selected && styles.goalCardSelected
              ]}
              onPress={() => toggleGoal(goal)}
              activeOpacity={0.8}
            >
              {selected && (
                <View style={styles.numberBadge}>
                  <Text style={styles.numberBadgeText}>
                    {selectionIndex + 1}
                  </Text>
                </View>
              )}
              <View style={styles.goalLeft}>
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <View style={styles.goalInfo}>
                  <Text style={[
                    styles.goalName,
                    selected && styles.goalNameSelected
                  ]}>
                    {goal.name}
                  </Text>
                  <Text style={styles.goalDescription}>
                    {goal.description}
                  </Text>
                  {selected && (
                    <Text style={styles.goalDetails}>
                      {goal.details}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Selection Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {selectedGoals.length}/3 goals selected
          </Text>
          {selectedGoals.length > 0 && (
            <Text style={styles.summaryGoals}>
              {selectedGoals.map(g => g.name).join(' → ')}
            </Text>
          )}
        </View>

        {/* Current Goals */}
        <View style={styles.currentValues}>
          <Text style={styles.currentValuesTitle}>Current Goals</Text>
          {userGoals?.length > 0 ? (
            userGoals.map((goal, index) => (
              <View key={goal.id} style={styles.currentValueRow}>
                <Text style={styles.currentValueLabel}>
                  {index === 0 ? 'Primary' : `Goal ${index + 1}`}
                </Text>
                <Text style={styles.currentValueValue}>
                  {goal.goal_name}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noGoalsText}>No goals set</Text>
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative'
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1e1b4b'
  },
  numberBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  numberBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  goalEmoji: { fontSize: 28 },
  goalInfo: { flex: 1 },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  goalNameSelected: { color: Colors.primary },
  goalDescription: { fontSize: 13, color: Colors.textMuted },
  goalDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    fontStyle: 'italic'
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  summaryTitle: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4
  },
  summaryGoals: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center'
  },
  currentValues: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  noGoalsText: { fontSize: 14, color: Colors.textMuted },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center'
  },
  saveBtn: { marginBottom: 10 },
  cancelBtn: { marginBottom: 10 }
});