import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Colors } from '../../../utils/colors';
import Button from '../../../components/ui/Button';
import useUserStore from '../../../state/useUserStore';

export default function StepReview({ data, onBack, onComplete }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const saveUserProfile = useUserStore(state => state.saveUserProfile);
  const saveUserEquipment = useUserStore(state => state.saveUserEquipment);
  const saveUserGoals = useUserStore(state => state.saveUserGoals);
  const saveUserInjuries = useUserStore(state => state.saveUserInjuries);
  const saveUserPreferences = useUserStore(state => state.saveUserPreferences);

  const handleComplete = async () => {
    setSaving(true);
    setError('');

    try {
      // Step 1: Save user profile
      const userId = await saveUserProfile({
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender,
        height_cm: parseFloat(data.height_cm),
        weight_kg: parseFloat(data.weight_kg),
        fitness_level: data.fitness_level,
        training_age_months: data.training_age_months || 0,
        setup_completed: true
      });

      if (!userId) {
        setError('Failed to save profile. Please try again.');
        setSaving(false);
        return;
      }

      // Step 2: Save equipment
      await saveUserEquipment(userId, data.equipment || []);

      // Step 3: Save goals
      await saveUserGoals(userId, data.goals?.map((g, index) => ({
        ...g,
        isPrimary: index === 0
      })) || []);

      // Step 4: Save injuries
      await saveUserInjuries(userId, data.injuries?.map(i => ({
        type: i.id,
        severity: i.severity,
        notes: ''
      })) || []);

      // Step 5: Save preferences
      await saveUserPreferences(userId, {
        workout_frequency: data.workout_frequency,
        session_duration_minutes: data.session_duration_minutes,
        preferred_split_id: getSuggestedSplit(data),
        preferred_workout_days: data.preferred_workout_days?.join(',') || '',
        units: 'metric'
      });

      console.log('✅ Setup completed for user:', userId);

      // Complete setup
      onComplete();

    } catch (err) {
      console.error('❌ Setup save failed:', err);
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  // Suggest a workout split based on user data
  const getSuggestedSplit = (data) => {
    const freq = data.workout_frequency;
    if (freq <= 2) return 'full_body_2day';
    if (freq === 3) return 'full_body_3day';
    if (freq === 4) return 'upper_lower_4day';
    if (freq === 5) return 'push_pull_legs_5day';
    return 'push_pull_legs_6day';
  };

  const ReviewSection = ({ title, emoji, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{emoji} {title}</Text>
      {children}
    </View>
  );

  const ReviewItem = ({ label, value }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || '—'}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <Text style={styles.instruction}>
        Everything look correct? Tap "Start My Journey" to save and begin!
      </Text>

      {/* Personal Info */}
      <ReviewSection title="Personal Info" emoji="👤">
        <ReviewItem label="Name" value={data.name} />
        <ReviewItem label="Age" value={data.age ? `${data.age} years` : '—'} />
        <ReviewItem label="Gender" value={
          data.gender === 'male' ? '👨 Male' :
          data.gender === 'female' ? '👩 Female' :
          data.gender === 'other' ? '🧑 Other' : '—'
        } />
        <ReviewItem
          label="Height"
          value={data.height_cm ? `${data.height_cm} cm` : '—'}
        />
        <ReviewItem
          label="Weight"
          value={data.weight_kg ? `${data.weight_kg} kg` : '—'}
        />
      </ReviewSection>

      {/* Fitness Level */}
      <ReviewSection title="Fitness Level" emoji="🏋️">
        <ReviewItem label="Level" value={
          data.fitness_level === 'beginner' ? '🌱 Beginner' :
          data.fitness_level === 'intermediate' ? '⚡ Intermediate' :
          data.fitness_level === 'advanced' ? '🔥 Advanced' : '—'
        } />
        <ReviewItem
          label="Training Age"
          value={
            data.training_age_months === 0 ? 'Just starting' :
            data.training_age_months <= 3 ? '1-3 months' :
            data.training_age_months <= 6 ? '3-6 months' :
            data.training_age_months <= 12 ? '6-12 months' :
            data.training_age_months <= 24 ? '1-2 years' :
            '2+ years'
          }
        />
      </ReviewSection>

      {/* Equipment */}
      <ReviewSection title="Equipment" emoji="🔧">
        {data.equipment?.length > 0 ? (
          <View style={styles.tagContainer}>
            {data.equipment.map((e) => (
              <View key={e.id} style={styles.tag}>
                <Text style={styles.tagText}>{e.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <ReviewItem label="Equipment" value="Bodyweight only" />
        )}
      </ReviewSection>

      {/* Goals */}
      <ReviewSection title="Goals" emoji="🎯">
        {data.goals?.length > 0 ? (
          data.goals.map((goal, index) => (
            <ReviewItem
              key={goal.id}
              label={index === 0 ? 'Primary Goal' : `Goal ${index + 1}`}
              value={goal.name}
            />
          ))
        ) : (
          <ReviewItem label="Goals" value="Not selected" />
        )}
      </ReviewSection>

      {/* Schedule */}
      <ReviewSection title="Schedule" emoji="📅">
        <ReviewItem
          label="Frequency"
          value={`${data.workout_frequency} days/week`}
        />
        <ReviewItem
          label="Duration"
          value={`${data.session_duration_minutes} min/session`}
        />
        <ReviewItem
          label="Weekly Total"
          value={`${data.workout_frequency * data.session_duration_minutes} min`}
        />
        <ReviewItem
          label="Suggested Split"
          value={getSuggestedSplit(data).replace(/_/g, ' ')}
        />
        {data.preferred_workout_days?.length > 0 && (
          <ReviewItem
            label="Preferred Days"
            value={data.preferred_workout_days.map(d =>
              d.charAt(0).toUpperCase() + d.slice(1)
            ).join(', ')}
          />
        )}
      </ReviewSection>

      {/* Injuries */}
      <ReviewSection title="Limitations" emoji="🩺">
        {data.injuries?.length > 0 ? (
          data.injuries.map((injury) => (
            <ReviewItem
              key={injury.id}
              label={injury.name}
              value={injury.severity?.toUpperCase()}
            />
          ))
        ) : (
          <ReviewItem label="Limitations" value="✅ None reported" />
        )}
      </ReviewSection>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      ) : null}

      {/* Start Button */}
      <Button
        title={saving ? 'Saving...' : '🚀 Start My Journey!'}
        onPress={handleComplete}
        variant="primary"
        size="large"
        loading={saving}
        disabled={saving}
        style={styles.startBtn}
      />
      <Button
        title="← Go Back"
        onPress={onBack}
        variant="secondary"
        size="medium"
        disabled={saving}
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
    lineHeight: 20,
    textAlign: 'center'
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1
  },
  reviewValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right'
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  tag: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600'
  },
  errorContainer: {
    backgroundColor: '#2d1b1b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.danger
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    textAlign: 'center'
  },
  startBtn: {
    marginBottom: 10
  },
  btn: {
    marginBottom: 10
  }
});