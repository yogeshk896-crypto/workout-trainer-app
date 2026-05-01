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

const INJURY_LIST = [
  {
    id: 'shoulder_injury',
    name: 'Shoulder Injury',
    emoji: '🦾',
    description: 'Pain or limitation in shoulder area'
  },
  {
    id: 'elbow_injury',
    name: 'Elbow Injury',
    emoji: '💪',
    description: 'Tennis elbow, golfer elbow or joint pain'
  },
  {
    id: 'wrist_pain',
    name: 'Wrist Pain',
    emoji: '✋',
    description: 'Wrist discomfort during pressing movements'
  },
  {
    id: 'lower_back_pain',
    name: 'Lower Back Pain',
    emoji: '🔙',
    description: 'Lumbar pain or disc issues'
  },
  {
    id: 'knee_injury',
    name: 'Knee Injury',
    emoji: '🦵',
    description: 'Knee pain during squats or lunges'
  },
  {
    id: 'hip_injury',
    name: 'Hip Injury',
    emoji: '🦴',
    description: 'Hip flexor or joint pain'
  },
  {
    id: 'ankle_sprain',
    name: 'Ankle Sprain',
    emoji: '🦶',
    description: 'Ankle instability or sprain'
  },
  {
    id: 'neck_issues',
    name: 'Neck Issues',
    emoji: '🦒',
    description: 'Cervical pain or neck stiffness'
  },
  {
    id: 'high_blood_pressure',
    name: 'High Blood Pressure',
    emoji: '❤️',
    description: 'Hypertension requiring exercise modifications'
  },
  {
    id: 'pregnant_postnatal',
    name: 'Pregnant / Post-Natal',
    emoji: '🤰',
    description: 'Currently pregnant or post-natal recovery'
  },
  {
    id: 'rotator_cuff_issues',
    name: 'Rotator Cuff',
    emoji: '🔄',
    description: 'Rotator cuff tear or impingement'
  },
  {
    id: 'spinal_injury',
    name: 'Spinal Injury',
    emoji: '🦴',
    description: 'Disc herniation or spinal stenosis'
  }
];

const SEVERITY_OPTIONS = [
  {
    id: 'avoid',
    label: 'Avoid',
    description: 'Skip exercises that affect this area',
    color: Colors.danger
  },
  {
    id: 'modify',
    label: 'Modify',
    description: 'Use safer alternatives when possible',
    color: Colors.warning
  },
  {
    id: 'caution',
    label: 'Caution',
    description: 'Proceed carefully, stop if pain occurs',
    color: Colors.info
  }
];

export default function StepInjuries({ data, onUpdate, onNext, onBack }) {
  const [selectedInjury, setSelectedInjury] = React.useState(null);

  const isSelected = (injuryId) => {
    return data.injuries?.some(i => i.id === injuryId);
  };

  const getInjury = (injuryId) => {
    return data.injuries?.find(i => i.id === injuryId);
  };

  const toggleInjury = (injury) => {
    const currentInjuries = data.injuries || [];
    const isCurrentlySelected = isSelected(injury.id);

    if (isCurrentlySelected) {
      // Remove it
      onUpdate({
        injuries: currentInjuries.filter(i => i.id !== injury.id)
      });
      if (selectedInjury?.id === injury.id) {
        setSelectedInjury(null);
      }
    } else {
      // Add with default severity
      const newInjury = {
        id: injury.id,
        name: injury.name,
        severity: 'avoid'
      };
      onUpdate({
        injuries: [...currentInjuries, newInjury]
      });
      setSelectedInjury(newInjury);
    }
  };

  const updateSeverity = (injuryId, severity) => {
    const currentInjuries = data.injuries || [];
    onUpdate({
      injuries: currentInjuries.map(i =>
        i.id === injuryId ? { ...i, severity } : i
      )
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.instruction}>
        Select any injuries or limitations you have. We'll automatically substitute unsafe exercises for you.
      </Text>

      {/* No Injuries Option */}
      <TouchableOpacity
        style={[
          styles.noInjuryCard,
          (!data.injuries || data.injuries.length === 0) && styles.noInjuryCardSelected
        ]}
        onPress={() => onUpdate({ injuries: [] })}
        activeOpacity={0.8}
      >
        <Text style={styles.noInjuryEmoji}>✅</Text>
        <View>
          <Text style={[
            styles.noInjuryLabel,
            (!data.injuries || data.injuries.length === 0) && styles.noInjuryLabelSelected
          ]}>
            No injuries or limitations
          </Text>
          <Text style={styles.noInjurySubLabel}>
            I can train without restrictions
          </Text>
        </View>
      </TouchableOpacity>

      {/* Injury List */}
      <Text style={styles.sectionLabel}>Or select your limitations:</Text>

      <View style={styles.injuryGrid}>
        {INJURY_LIST.map((injury) => {
          const selected = isSelected(injury.id);
          const injuryData = getInjury(injury.id);

          return (
            <View key={injury.id} style={styles.injuryWrapper}>
              <TouchableOpacity
                style={[
                  styles.injuryCard,
                  selected && styles.injuryCardSelected
                ]}
                onPress={() => toggleInjury(injury)}
                activeOpacity={0.8}
              >
                <Text style={styles.injuryEmoji}>{injury.emoji}</Text>
                <Text style={[
                  styles.injuryName,
                  selected && styles.injuryNameSelected
                ]}>
                  {injury.name}
                </Text>
                <Text style={styles.injuryDescription}>
                  {injury.description}
                </Text>
                {selected && (
                  <View style={[
                    styles.severityIndicator,
                    {
                      backgroundColor:
                        injuryData?.severity === 'avoid' ? Colors.danger :
                        injuryData?.severity === 'modify' ? Colors.warning :
                        Colors.info
                    }
                  ]}>
                    <Text style={styles.severityIndicatorText}>
                      {injuryData?.severity?.toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Severity Selector */}
              {selected && (
                <View style={styles.severityContainer}>
                  <Text style={styles.severityLabel}>How should we handle this?</Text>
                  {SEVERITY_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.severityOption,
                        injuryData?.severity === option.id && {
                          borderColor: option.color,
                          backgroundColor: `${option.color}20`
                        }
                      ]}
                      onPress={() => updateSeverity(injury.id, option.id)}
                    >
                      <Text style={[
                        styles.severityOptionLabel,
                        injuryData?.severity === option.id && { color: option.color }
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.severityOptionDescription}>
                        {option.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Summary */}
      {data.injuries?.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            ⚠️ {data.injuries.length} limitation{data.injuries.length !== 1 ? 's' : ''} noted
          </Text>
          <Text style={styles.summaryText}>
            We'll automatically substitute unsafe exercises based on your limitations.
          </Text>
        </View>
      )}

      {/* Buttons */}
      <Button
        title="Continue →"
        onPress={onNext}
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
  noInjuryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  noInjuryCardSelected: {
    borderColor: Colors.success,
    backgroundColor: '#1b2d1e'
  },
  noInjuryEmoji: {
    fontSize: 28
  },
  noInjuryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  noInjuryLabelSelected: {
    color: Colors.success
  },
  noInjurySubLabel: {
    fontSize: 12,
    color: Colors.textMuted
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  injuryGrid: {
    gap: 8,
    marginBottom: 16
  },
  injuryWrapper: {
    gap: 4
  },
  injuryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  injuryCardSelected: {
    borderColor: Colors.danger,
    backgroundColor: '#2d1b1b'
  },
  injuryEmoji: {
    fontSize: 24
  },
  injuryName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1
  },
  injuryNameSelected: {
    color: Colors.danger
  },
  injuryDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    width: '100%',
    paddingLeft: 36
  },
  severityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  severityIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  severityContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4
  },
  severityLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    fontWeight: '600'
  },
  severityOption: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6
  },
  severityOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  severityOptionDescription: {
    fontSize: 11,
    color: Colors.textMuted
  },
  summary: {
    backgroundColor: '#2d2a1b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 4
  },
  summaryText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18
  },
  btn: {
    marginBottom: 10
  }
});