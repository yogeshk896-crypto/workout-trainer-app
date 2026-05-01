import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';

// Import all steps
import StepPersonalInfo from './steps/StepPersonalInfo';
import StepFitnessLevel from './steps/StepFitnessLevel';
import StepEquipment from './steps/StepEquipment';
import StepGoals from './steps/StepGoals';
import StepFrequency from './steps/StepFrequency';
import StepInjuries from './steps/StepInjuries';
import StepReview from './steps/StepReview';

const STEPS = [
  { id: 1, title: 'Personal Info', subtitle: 'Tell us about yourself' },
  { id: 2, title: 'Fitness Level', subtitle: 'Your experience level' },
  { id: 3, title: 'Equipment', subtitle: 'What you have available' },
  { id: 4, title: 'Your Goals', subtitle: 'What you want to achieve' },
  { id: 5, title: 'Schedule', subtitle: 'Frequency and duration' },
  { id: 6, title: 'Limitations', subtitle: 'Injuries or restrictions' },
  { id: 7, title: 'Review', subtitle: 'Confirm your setup' }
];

export default function SetupWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState({
    // Step 1 — Personal Info
    name: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',

    // Step 2 — Fitness Level
    fitness_level: '',
    training_age_months: 0,

    // Step 3 — Equipment
    equipment: [],

    // Step 4 — Goals
    goals: [],

    // Step 5 — Schedule
    workout_frequency: 3,
    session_duration_minutes: 45,
    preferred_workout_days: [],

    // Step 6 — Injuries
    injuries: []
  });

  // Update setup data from any step
  const updateSetupData = (newData) => {
    setSetupData(prev => ({ ...prev, ...newData }));
  };

  // Go to next step
  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Render current step
  const renderStep = () => {
    const props = {
      data: setupData,
      onUpdate: updateSetupData,
      onNext: nextStep,
      onBack: prevStep
    };

    switch (currentStep) {
      case 1: return <StepPersonalInfo {...props} />;
      case 2: return <StepFitnessLevel {...props} />;
      case 3: return <StepEquipment {...props} />;
      case 4: return <StepGoals {...props} />;
      case 5: return <StepFrequency {...props} />;
      case 6: return <StepInjuries {...props} />;
      case 7: return <StepReview {...props} onComplete={onComplete} />;
      default: return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;
  const stepInfo = STEPS[currentStep - 1];

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>💪 Workout Trainer</Text>
        <Text style={styles.stepCounter}>
          Step {currentStep} of {STEPS.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Step Title */}
      <View style={styles.stepTitleContainer}>
        <Text style={styles.stepTitle}>{stepInfo.title}</Text>
        <Text style={styles.stepSubtitle}>{stepInfo.subtitle}</Text>
      </View>

      {/* Step Dots */}
      <View style={styles.dotsContainer}>
        {STEPS.map((step) => (
          <View
            key={step.id}
            style={[
              styles.dot,
              currentStep === step.id && styles.dotActive,
              currentStep > step.id && styles.dotCompleted
            ]}
          />
        ))}
      </View>

      {/* Step Content */}
      <View style={styles.content}>
        {renderStep()}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  stepCounter: {
    fontSize: 14,
    color: Colors.textMuted
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 16
  },
  progressBackground: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3
  },
  stepTitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 8
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.textMuted
  },
  dotsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20
  },
  dotCompleted: {
    backgroundColor: Colors.primary
  },
  content: {
    flex: 1
  }
});