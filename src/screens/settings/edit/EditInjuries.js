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
    description: 'Hypertension requiring modifications'
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
    description: 'Skip exercises affecting this area',
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
    color: Colors.info || '#74c0fc'
  }
];

export default function EditInjuries({ onBack }) {
  const userProfile = useUserStore(state => state.userProfile);
  const userInjuries = useUserStore(state => state.userInjuries);
  const saveUserInjuries = useUserStore(state => state.saveUserInjuries);

  // Initialize from existing injuries
  const [selectedInjuries, setSelectedInjuries] = useState(
    userInjuries?.map(i => ({
      id: i.injury_type,
      name: INJURY_LIST.find(il => il.id === i.injury_type)?.name || i.injury_type,
      severity: i.severity || 'avoid'
    })) || []
  );
  const [saving, setSaving] = useState(false);

  const isSelected = (injuryId) => {
    return selectedInjuries.some(i => i.id === injuryId);
  };

  const getInjury = (injuryId) => {
    return selectedInjuries.find(i => i.id === injuryId);
  };

  const toggleInjury = (injury) => {
    const isCurrentlySelected = isSelected(injury.id);

    if (isCurrentlySelected) {
      setSelectedInjuries(prev =>
        prev.filter(i => i.id !== injury.id)
      );
    } else {
      setSelectedInjuries(prev => [
        ...prev,
        { id: injury.id, name: injury.name, severity: 'avoid' }
      ]);
    }
  };

  const updateSeverity = (injuryId, severity) => {
    setSelectedInjuries(prev =>
      prev.map(i => i.id === injuryId ? { ...i, severity } : i)
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      '✅ Clear All Limitations',
      'Remove all injury limitations?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          onPress: () => setSelectedInjuries([])
        }
      ]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveUserInjuries(
        userProfile.id,
        selectedInjuries.map(i => ({
          type: i.id,
          severity: i.severity,
          notes: ''
        }))
      );

      Alert.alert(
        '✅ Saved!',
        selectedInjuries.length > 0
          ? `${selectedInjuries.length} limitation(s) saved. Unsafe exercises will be automatically substituted.`
          : 'No limitations saved. All exercises are available.',
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
          <Text style={styles.headerTitle}>Limitations</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            🩺 Select any injuries or limitations. Unsafe exercises will be automatically substituted with safer alternatives.
          </Text>
        </View>

        {/* No Injuries Option */}
        <TouchableOpacity
          style={[
            styles.noInjuryCard,
            selectedInjuries.length === 0 && styles.noInjuryCardSelected
          ]}
          onPress={() => setSelectedInjuries([])}
          activeOpacity={0.8}
        >
          <Text style={styles.noInjuryEmoji}>✅</Text>
          <View>
            <Text style={[
              styles.noInjuryLabel,
              selectedInjuries.length === 0 && styles.noInjuryLabelSelected
            ]}>
              No injuries or limitations
            </Text>
            <Text style={styles.noInjurySubLabel}>
              I can train without restrictions
            </Text>
          </View>
          {selectedInjuries.length === 0 && (
            <Text style={styles.noInjuryCheck}>✓</Text>
          )}
        </TouchableOpacity>

        {/* Injury List */}
        <Text style={styles.sectionLabel}>
          Select your limitations:
        </Text>

        {INJURY_LIST.map((injury) => {
          const selected = isSelected(injury.id);
          const injuryData = getInjury(injury.id);

          return (
            <View key={injury.id} style={styles.injuryWrapper}>
              {/* Injury Card */}
              <TouchableOpacity
                style={[
                  styles.injuryCard,
                  selected && styles.injuryCardSelected
                ]}
                onPress={() => toggleInjury(injury)}
                activeOpacity={0.8}
              >
                <Text style={styles.injuryEmoji}>{injury.emoji}</Text>
                <View style={styles.injuryInfo}>
                  <Text style={[
                    styles.injuryName,
                    selected && styles.injuryNameSelected
                  ]}>
                    {injury.name}
                  </Text>
                  <Text style={styles.injuryDescription}>
                    {injury.description}
                  </Text>
                </View>
                {selected && (
                  <View style={[
                    styles.severityBadge,
                    {
                      backgroundColor:
                        injuryData?.severity === 'avoid'
                          ? Colors.danger
                          : injuryData?.severity === 'modify'
                          ? Colors.warning
                          : '#74c0fc'
                    }
                  ]}>
                    <Text style={styles.severityBadgeText}>
                      {injuryData?.severity?.toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Severity Selector */}
              {selected && (
                <View style={styles.severityContainer}>
                  <Text style={styles.severityTitle}>
                    How should we handle this?
                  </Text>
                  <View style={styles.severityRow}>
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
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.severityOptionLabel,
                          injuryData?.severity === option.id && {
                            color: option.color
                          }
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={styles.severityOptionDesc}>
                          {option.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Summary */}
        {selectedInjuries.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              ⚠️ {selectedInjuries.length} limitation
              {selectedInjuries.length !== 1 ? 's' : ''} selected
            </Text>
            {selectedInjuries.map(injury => (
              <View key={injury.id} style={styles.summaryRow}>
                <Text style={styles.summaryName}>{injury.name}</Text>
                <Text style={[
                  styles.summarySeverity,
                  {
                    color:
                      injury.severity === 'avoid'
                        ? Colors.danger
                        : injury.severity === 'modify'
                        ? Colors.warning
                        : '#74c0fc'
                  }
                ]}>
                  {injury.severity?.toUpperCase()}
                </Text>
              </View>
            ))}
            <Text style={styles.summaryNote}>
              Unsafe exercises will be automatically substituted in your workouts.
            </Text>
          </View>
        )}

        {/* Current Injuries */}
        <View style={styles.currentValues}>
          <Text style={styles.currentValuesTitle}>
            Current Limitations
          </Text>
          {userInjuries?.length > 0 ? (
            userInjuries.map((injury) => (
              <View key={injury.id} style={styles.currentValueRow}>
                <Text style={styles.currentValueLabel}>
                  {INJURY_LIST.find(
                    il => il.id === injury.injury_type
                  )?.name || injury.injury_type}
                </Text>
                <Text style={[
                  styles.currentValueValue,
                  {
                    color:
                      injury.severity === 'avoid'
                        ? Colors.danger
                        : injury.severity === 'modify'
                        ? Colors.warning
                        : '#74c0fc'
                  }
                ]}>
                  {injury.severity?.toUpperCase()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noInjuriesText}>
              ✅ No limitations currently set
            </Text>
          )}
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
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  clearButton: { padding: 8 },
  clearButtonText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '600'
  },
  infoBanner: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary
  },
  infoBannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20
  },
  noInjuryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 12
  },
  noInjuryCardSelected: {
    borderColor: Colors.success,
    backgroundColor: '#1b2d1e'
  },
  noInjuryEmoji: { fontSize: 28 },
  noInjuryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  noInjuryLabelSelected: { color: Colors.success },
  noInjurySubLabel: { fontSize: 12, color: Colors.textMuted },
  noInjuryCheck: {
    fontSize: 20,
    color: Colors.success,
    fontWeight: 'bold',
    marginLeft: 'auto'
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  injuryWrapper: { marginBottom: 8 },
  injuryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12
  },
  injuryCardSelected: {
    borderColor: Colors.danger,
    backgroundColor: '#2d1b1b'
  },
  injuryEmoji: { fontSize: 24 },
  injuryInfo: { flex: 1 },
  injuryName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  injuryNameSelected: { color: Colors.danger },
  injuryDescription: { fontSize: 12, color: Colors.textMuted },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  severityContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border
  },
  severityTitle: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 10
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8
  },
  severityOption: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center'
  },
  severityOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  severityOptionDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  summaryCard: {
    backgroundColor: '#2d2a1b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  summaryName: { fontSize: 13, color: Colors.textSecondary },
  summarySeverity: { fontSize: 13, fontWeight: '700' },
  summaryNote: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic'
  },
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
  currentValueValue: { fontSize: 14, fontWeight: '600' },
  noInjuriesText: { fontSize: 14, color: Colors.textMuted },
  saveBtn: { marginBottom: 10 },
  cancelBtn: { marginBottom: 10 }
});