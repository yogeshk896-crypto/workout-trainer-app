import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../utils/colors';
import Button from '../../../components/ui/Button';
import useUserStore from '../../../state/useUserStore';
import { getDatabase } from '../../../database/database';

export default function EditBodyMetrics({ onBack }) {
  const userProfile = useUserStore(state => state.userProfile);
  const saveUserProfile = useUserStore(state => state.saveUserProfile);
  const loadUserProfile = useUserStore(state => state.loadUserProfile);

  const [heightCm, setHeightCm] = useState(
    userProfile?.height_cm?.toString() || ''
  );
  const [weightKg, setWeightKg] = useState(
    userProfile?.weight_kg?.toString() || ''
  );
  const [units, setUnits] = useState('metric');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // BMI Calculator
  const calculateBMI = () => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!h || !w || isNaN(h) || isNaN(w)) return null;
    return (w / Math.pow(h / 100, 2)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return { label: '—', color: Colors.textMuted };
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: 'Underweight', color: '#74c0fc' };
    if (b < 25) return { label: 'Normal', color: Colors.easy };
    if (b < 30) return { label: 'Overweight', color: Colors.warning };
    return { label: 'Obese', color: Colors.danger };
  };

  // Convert imperial to metric
  const convertToMetric = (value, type) => {
    if (type === 'height') {
      // inches to cm
      return (parseFloat(value) * 2.54).toFixed(1);
    } else {
      // lbs to kg
      return (parseFloat(value) * 0.453592).toFixed(1);
    }
  };

  const validate = () => {
    const newErrors = {};
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);

    if (!heightCm || isNaN(h) || h < 100 || h > 250) {
      newErrors.height = 'Please enter valid height (100-250 cm)';
    }
    if (!weightKg || isNaN(w) || w < 30 || w > 300) {
      newErrors.weight = 'Please enter valid weight (30-300 kg)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const db = await getDatabase();

      // Save body metrics history entry
      await db.runAsync(
        `INSERT INTO body_metrics_history
          (user_id, weight_kg, height_cm, notes)
         VALUES (?, ?, ?, ?)`,
        [
          userProfile.id,
          parseFloat(weightKg),
          parseFloat(heightCm),
          'Manual update from settings'
        ]
      );

      // Update user profile
      await saveUserProfile({
        ...userProfile,
        height_cm: parseFloat(heightCm),
        weight_kg: parseFloat(weightKg),
        setup_completed: true
      });

      Alert.alert(
        '✅ Saved!',
        'Body metrics updated successfully.',
        [{ text: 'OK', onPress: onBack }]
      );

    } catch (error) {
      console.error('❌ Save failed:', error);
      Alert.alert('❌ Error', 'Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Body Metrics</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Units Toggle */}
          <View style={styles.unitsToggle}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                units === 'metric' && styles.unitButtonActive
              ]}
              onPress={() => setUnits('metric')}
            >
              <Text style={[
                styles.unitButtonText,
                units === 'metric' && styles.unitButtonTextActive
              ]}>
                Metric (kg/cm)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                units === 'imperial' && styles.unitButtonActive
              ]}
              onPress={() => setUnits('imperial')}
            >
              <Text style={[
                styles.unitButtonText,
                units === 'imperial' && styles.unitButtonTextActive
              ]}>
                Imperial (lbs/in)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Height */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Height ({units === 'metric' ? 'cm' : 'inches'})
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputFlex,
                  errors.height && styles.inputError
                ]}
                placeholder={units === 'metric' ? 'e.g. 175' : 'e.g. 69'}
                placeholderTextColor={Colors.textMuted}
                value={heightCm}
                onChangeText={(val) => {
                  if (units === 'imperial') {
                    setHeightCm(convertToMetric(val, 'height'));
                  } else {
                    setHeightCm(val);
                  }
                }}
                keyboardType="numeric"
                maxLength={5}
              />
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>
                  {units === 'metric' ? 'cm' : 'in'}
                </Text>
              </View>
            </View>
            {errors.height && (
              <Text style={styles.errorText}>{errors.height}</Text>
            )}
          </View>

          {/* Weight */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Weight ({units === 'metric' ? 'kg' : 'lbs'})
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputFlex,
                  errors.weight && styles.inputError
                ]}
                placeholder={units === 'metric' ? 'e.g. 70' : 'e.g. 154'}
                placeholderTextColor={Colors.textMuted}
                value={weightKg}
                onChangeText={(val) => {
                  if (units === 'imperial') {
                    setWeightKg(convertToMetric(val, 'weight'));
                  } else {
                    setWeightKg(val);
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
              />
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>
                  {units === 'metric' ? 'kg' : 'lbs'}
                </Text>
              </View>
            </View>
            {errors.weight && (
              <Text style={styles.errorText}>{errors.weight}</Text>
            )}
          </View>

          {/* Live BMI Calculator */}
          <View style={styles.bmiCard}>
            <Text style={styles.bmiCardTitle}>📊 Live BMI Calculator</Text>
            <View style={styles.bmiRow}>
              <View style={styles.bmiItem}>
                <Text style={[styles.bmiValue, { color: bmiCategory.color }]}>
                  {bmi || '—'}
                </Text>
                <Text style={styles.bmiLabel}>BMI</Text>
              </View>
              <View style={styles.bmiDivider} />
              <View style={styles.bmiItem}>
                <Text style={[styles.bmiCategory, { color: bmiCategory.color }]}>
                  {bmiCategory.label}
                </Text>
                <Text style={styles.bmiLabel}>Category</Text>
              </View>
              <View style={styles.bmiDivider} />
              <View style={styles.bmiItem}>
                <Text style={styles.bmiIdealValue}>
                  {heightCm
                    ? `${(18.5 * Math.pow(parseFloat(heightCm) / 100, 2)).toFixed(0)}-${(24.9 * Math.pow(parseFloat(heightCm) / 100, 2)).toFixed(0)} kg`
                    : '—'}
                </Text>
                <Text style={styles.bmiLabel}>Ideal Weight</Text>
              </View>
            </View>

            {/* BMI Scale */}
            <View style={styles.bmiScale}>
              <View style={[styles.bmiScaleSegment, { backgroundColor: '#74c0fc', flex: 185 }]} />
              <View style={[styles.bmiScaleSegment, { backgroundColor: Colors.easy, flex: 65 }]} />
              <View style={[styles.bmiScaleSegment, { backgroundColor: Colors.warning, flex: 50 }]} />
              <View style={[styles.bmiScaleSegment, { backgroundColor: Colors.danger, flex: 100 }]} />
            </View>
            <View style={styles.bmiScaleLabels}>
              <Text style={styles.bmiScaleLabel}>{'<18.5'}</Text>
              <Text style={styles.bmiScaleLabel}>18.5</Text>
              <Text style={styles.bmiScaleLabel}>25</Text>
              <Text style={styles.bmiScaleLabel}>30+</Text>
            </View>
          </View>

          {/* Current Values */}
          <View style={styles.currentValues}>
            <Text style={styles.currentValuesTitle}>Current Values</Text>
            <View style={styles.currentValueRow}>
              <Text style={styles.currentValueLabel}>Height</Text>
              <Text style={styles.currentValueValue}>
                {userProfile?.height_cm
                  ? `${userProfile.height_cm} cm`
                  : '—'}
              </Text>
            </View>
            <View style={styles.currentValueRow}>
              <Text style={styles.currentValueLabel}>Weight</Text>
              <Text style={styles.currentValueValue}>
                {userProfile?.weight_kg
                  ? `${userProfile.weight_kg} kg`
                  : '—'}
              </Text>
            </View>
            <View style={styles.currentValueRow}>
              <Text style={styles.currentValueLabel}>BMI</Text>
              <Text style={styles.currentValueValue}>
                {userProfile?.weight_kg && userProfile?.height_cm
                  ? (userProfile.weight_kg /
                    Math.pow(userProfile.height_cm / 100, 2)
                  ).toFixed(1)
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
      </KeyboardAvoidingView>
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
  unitsToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10
  },
  unitButtonActive: { backgroundColor: Colors.primary },
  unitButtonText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  unitButtonTextActive: { color: '#ffffff' },
  fieldContainer: { marginBottom: 20 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8
  },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border
  },
  inputFlex: { flex: 1 },
  inputError: { borderColor: Colors.danger },
  unitBadge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 56,
    alignItems: 'center'
  },
  unitBadgeText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 4 },
  bmiCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border
  },
  bmiCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16
  },
  bmiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  bmiItem: { alignItems: 'center' },
  bmiValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  bmiCategory: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  bmiIdealValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center'
  },
  bmiLabel: { fontSize: 11, color: Colors.textMuted },
  bmiDivider: { width: 1, backgroundColor: Colors.border },
  bmiScale: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
    gap: 2
  },
  bmiScaleSegment: { height: '100%', borderRadius: 2 },
  bmiScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  bmiScaleLabel: { fontSize: 10, color: Colors.textMuted },
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