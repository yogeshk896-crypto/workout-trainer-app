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

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male', emoji: '👨' },
  { id: 'female', label: 'Female', emoji: '👩' },
  { id: 'other', label: 'Other', emoji: '🧑' }
];

export default function EditPersonalInfo({ onBack }) {
  const userProfile = useUserStore(state => state.userProfile);
  const saveUserProfile = useUserStore(state => state.saveUserProfile);

  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age?.toString() || '');
  const [gender, setGender] = useState(userProfile?.gender || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!age || isNaN(age) || age < 10 || age > 100) {
      newErrors.age = 'Please enter a valid age (10-100)';
    }
    if (!gender) newErrors.gender = 'Please select your gender';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await saveUserProfile({
        ...userProfile,
        name: name.trim(),
        age: parseInt(age),
        gender,
        setup_completed: true
      });
      Alert.alert(
        '✅ Saved!',
        'Personal info updated successfully.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save. Please try again.');
    }
    setSaving(false);
  };

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
            <Text style={styles.headerTitle}>Personal Info</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Age */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              placeholder="Your age"
              placeholderTextColor={Colors.textMuted}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
            />
            {errors.age && (
              <Text style={styles.errorText}>{errors.age}</Text>
            )}
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.optionsRow}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    gender === option.id && styles.optionButtonSelected
                  ]}
                  onPress={() => setGender(option.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.optionLabel,
                    gender === option.id && styles.optionLabelSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
          </View>

          {/* Current Values */}
          <View style={styles.currentValues}>
            <Text style={styles.currentValuesTitle}>
              Current Values
            </Text>
            <View style={styles.currentValueRow}>
              <Text style={styles.currentValueLabel}>Name</Text>
              <Text style={styles.currentValueValue}>
                {userProfile?.name || '—'}
              </Text>
            </View>
            <View style={styles.currentValueRow}>
              <Text style={styles.currentValueLabel}>Age</Text>
              <Text style={styles.currentValueValue}>
                {userProfile?.age || '—'}
              </Text>
            </View>
            <View style={styles.currentValueRow}>
              <Text style={styles.currentValueLabel}>Gender</Text>
              <Text style={styles.currentValueValue}>
                {userProfile?.gender
                  ? userProfile.gender.charAt(0).toUpperCase() +
                    userProfile.gender.slice(1)
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
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  backButton: {
    padding: 8
  },
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
  fieldContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border
  },
  inputError: {
    borderColor: Colors.danger
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10
  },
  optionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1e1b4b'
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  optionLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  optionLabelSelected: {
    color: Colors.primary
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
  currentValueLabel: {
    fontSize: 14,
    color: Colors.textMuted
  },
  currentValueValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  saveBtn: {
    marginBottom: 10
  },
  cancelBtn: {
    marginBottom: 10
  }
});