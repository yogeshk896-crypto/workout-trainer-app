import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Colors } from '../../../utils/colors';
import Button from '../../../components/ui/Button';

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male', emoji: '👨' },
  { id: 'female', label: 'Female', emoji: '👩' },
  { id: 'other', label: 'Other', emoji: '🧑' }
];

export default function StepPersonalInfo({ data, onUpdate, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!data.name.trim()) newErrors.name = 'Name is required';
    if (!data.age || isNaN(data.age) || data.age < 10 || data.age > 100) {
      newErrors.age = 'Please enter a valid age (10-100)';
    }
    if (!data.gender) newErrors.gender = 'Please select your gender';
    if (!data.height_cm || isNaN(data.height_cm) || data.height_cm < 100 || data.height_cm > 250) {
      newErrors.height_cm = 'Please enter a valid height (100-250 cm)';
    }
    if (!data.weight_kg || isNaN(data.weight_kg) || data.weight_kg < 30 || data.weight_kg > 300) {
      newErrors.weight_kg = 'Please enter a valid weight (30-300 kg)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textMuted}
            value={data.name}
            onChangeText={(text) => onUpdate({ name: text })}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        {/* Age */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={[styles.input, errors.age && styles.inputError]}
            placeholder="Your age"
            placeholderTextColor={Colors.textMuted}
            value={data.age.toString()}
            onChangeText={(text) => onUpdate({ age: text })}
            keyboardType="numeric"
            maxLength={3}
          />
          {errors.age && <Text style={styles.error}>{errors.age}</Text>}
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
                  data.gender === option.id && styles.optionButtonSelected
                ]}
                onPress={() => onUpdate({ gender: option.id })}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  data.gender === option.id && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}
        </View>

        {/* Height */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={[styles.input, errors.height_cm && styles.inputError]}
            placeholder="e.g. 175"
            placeholderTextColor={Colors.textMuted}
            value={data.height_cm.toString()}
            onChangeText={(text) => onUpdate({ height_cm: text })}
            keyboardType="numeric"
            maxLength={3}
          />
          {errors.height_cm && <Text style={styles.error}>{errors.height_cm}</Text>}
        </View>

        {/* Weight */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, errors.weight_kg && styles.inputError]}
            placeholder="e.g. 70"
            placeholderTextColor={Colors.textMuted}
            value={data.weight_kg.toString()}
            onChangeText={(text) => onUpdate({ weight_kg: text })}
            keyboardType="numeric"
            maxLength={5}
          />
          {errors.weight_kg && <Text style={styles.error}>{errors.weight_kg}</Text>}
        </View>

        {/* Next Button */}
        <Button
          title="Continue →"
          onPress={handleNext}
          variant="primary"
          size="large"
          style={styles.nextButton}
        />

      </ScrollView>
    </KeyboardAvoidingView>
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
  error: {
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
    borderWidth: 1,
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
  nextButton: {
    marginTop: 10
  }
});