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
    details: 'Balanced training across all fitness components'
  },
  {
    id: 'rehab_safe',
    name: 'Rehab Safe',
    emoji: '🩺',
    description: 'Safe training after injury',
    details: 'Light load with strict form and pain-free movement'
  },
  {
    id: 'athletic_performance',
    name: 'Athletic Performance',
    emoji: '🏅',
    description: 'Improve sports performance',
    details: 'Power, speed and explosive training'
  }
];

export default function StepGoals({ data, onUpdate, onNext, onBack }) {
  const [error, setError] = React.useState('');

  const isSelected = (goalId) => {
    return data.goals.some(g => g.id === goalId);
  };

  const toggleGoal = (goal) => {
    const currentGoals = data.goals || [];
    const isCurrentlySelected = isSelected(goal.id);

    if (isCurrentlySelected) {
      // Remove it
      onUpdate({
        goals: currentGoals.filter(g => g.id !== goal.id)
      });
    } else {
      // Max 3 goals
      if (currentGoals.length >= 3) {
        setError('Maximum 3 goals allowed. Remove one to add another.');
        return;
      }
      onUpdate({
        goals: [...currentGoals, { id: goal.id, name: goal.name }]
      });
    }
    setError('');
  };

  const handleNext = () => {
    if (!data.goals || data.goals.length === 0) {
      setError('Please select at least one goal');
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
        Select up to 3 goals. Your primary goal should be first.
      </Text>

      {/* Goals List */}
      {GOALS_LIST.map((goal) => {
        const selected = isSelected(goal.id);
        const selectionIndex = data.goals.findIndex(g => g.id === goal.id);

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
            {/* Selection Number Badge */}
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

      {/* Selected Count */}
      <View style={styles.selectedCount}>
        <Text style={styles.selectedCountText}>
          {data.goals?.length || 0}/3 goals selected
        </Text>
        {data.goals?.length > 0 && (
          <Text style={styles.selectedGoalNames}>
            {data.goals.map(g => g.name).join(' → ')}
          </Text>
        )}
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
    marginBottom: 16,
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
  goalEmoji: {
    fontSize: 28
  },
  goalInfo: {
    flex: 1
  },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  goalNameSelected: {
    color: Colors.primary
  },
  goalDescription: {
    fontSize: 13,
    color: Colors.textMuted
  },
  goalDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    fontStyle: 'italic'
  },
  selectedCount: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border
  },
  selectedCountText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4
  },
  selectedGoalNames: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center'
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