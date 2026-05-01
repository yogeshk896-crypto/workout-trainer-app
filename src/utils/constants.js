// App-wide constants

export const APP_NAME = 'Workout Trainer';
export const APP_VERSION = '1.0.0';

// Workout feedback options
export const FEEDBACK_OPTIONS = [
  {
    id: 'easy',
    label: 'Easy',
    emoji: '😊',
    description: 'Too easy, I could do more'
  },
  {
    id: 'normal',
    label: 'Normal',
    emoji: '💪',
    description: 'Just right, good challenge'
  },
  {
    id: 'hard',
    label: 'Hard',
    emoji: '😤',
    description: 'Very challenging, struggled'
  }
];

// Equipment list
export const EQUIPMENT_LIST = [
  { id: 'bodyweight', name: 'Bodyweight', icon: '🧍', category: 'no_equipment' },
  { id: 'dumbbell', name: 'Dumbbells', icon: '🏋️', category: 'free_weights' },
  { id: 'barbell', name: 'Barbell', icon: '🏋️', category: 'free_weights' },
  { id: 'kettlebell', name: 'Kettlebell', icon: '🔔', category: 'free_weights' },
  { id: 'resistance_band', name: 'Resistance Bands', icon: '〰️', category: 'elastic' },
  { id: 'pull_up_bar', name: 'Pull-Up Bar', icon: '🔝', category: 'fixed' },
  { id: 'bench', name: 'Weight Bench', icon: '🪑', category: 'fixed' },
  { id: 'yoga_mat', name: 'Yoga Mat', icon: '🧘', category: 'support' }
];

// Goal list
export const GOAL_LIST = [
  {
    id: 'fat_loss',
    name: 'Fat Loss',
    emoji: '🔥',
    description: 'Burn fat and get lean'
  },
  {
    id: 'muscle_gain',
    name: 'Muscle Gain',
    emoji: '💪',
    description: 'Build muscle and size'
  },
  {
    id: 'strength',
    name: 'Strength',
    emoji: '🏋️',
    description: 'Get stronger on big lifts'
  },
  {
    id: 'endurance',
    name: 'Endurance',
    emoji: '🏃',
    description: 'Improve stamina and cardio'
  },
  {
    id: 'mobility',
    name: 'Mobility',
    emoji: '🧘',
    description: 'Improve flexibility and movement'
  },
  {
    id: 'general_fitness',
    name: 'General Fitness',
    emoji: '⚡',
    description: 'Overall health and wellness'
  },
  {
    id: 'rehab_safe',
    name: 'Rehab Safe',
    emoji: '🩺',
    description: 'Safe training after injury'
  },
  {
    id: 'athletic_performance',
    name: 'Athletic Performance',
    emoji: '🏅',
    description: 'Improve sports performance'
  }
];

// Injury types
export const INJURY_TYPES = [
  { id: 'shoulder_injury', name: 'Shoulder Injury', icon: '🦾' },
  { id: 'elbow_injury', name: 'Elbow Injury', icon: '💪' },
  { id: 'wrist_pain', name: 'Wrist Pain', icon: '✋' },
  { id: 'lower_back_pain', name: 'Lower Back Pain', icon: '🔙' },
  { id: 'knee_injury', name: 'Knee Injury', icon: '🦵' },
  { id: 'hip_injury', name: 'Hip Injury', icon: '🦴' },
  { id: 'ankle_sprain', name: 'Ankle Sprain', icon: '🦶' },
  { id: 'neck_issues', name: 'Neck Issues', icon: '🦒' },
  { id: 'high_blood_pressure', name: 'High Blood Pressure', icon: '❤️' },
  { id: 'pregnant_postnatal', name: 'Pregnant / Post-Natal', icon: '🤰' },
  { id: 'rotator_cuff_issues', name: 'Rotator Cuff Issues', icon: '🔄' },
  { id: 'spinal_injury', name: 'Spinal Injury', icon: '🦴' }
];

// Fitness levels
export const FITNESS_LEVELS = [
  {
    id: 'beginner',
    name: 'Beginner',
    emoji: '🌱',
    description: 'New to exercise or returning after long break'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    emoji: '⚡',
    description: '6+ months of consistent training'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    emoji: '🔥',
    description: '2+ years of consistent training'
  }
];

// Workout frequency options
export const FREQUENCY_OPTIONS = [
  { value: 1, label: '1 day/week', description: 'Light schedule' },
  { value: 2, label: '2 days/week', description: 'Minimum effective dose' },
  { value: 3, label: '3 days/week', description: 'Recommended for beginners' },
  { value: 4, label: '4 days/week', description: 'Optimal for most people' },
  { value: 5, label: '5 days/week', description: 'High frequency training' },
  { value: 6, label: '6 days/week', description: 'Advanced athletes only' }
];

// Session duration options
export const DURATION_OPTIONS = [
  { value: 20, label: '20 minutes', description: 'Quick session' },
  { value: 30, label: '30 minutes', description: 'Short and effective' },
  { value: 45, label: '45 minutes', description: 'Standard session' },
  { value: 60, label: '60 minutes', description: 'Full session' },
  { value: 75, label: '75 minutes', description: 'Extended session' },
  { value: 90, label: '90 minutes', description: 'Long session' }
];

// Navigation routes
export const ROUTES = {
  HOME: 'Home',
  WORKOUT: 'Workout',
  PROGRESS: 'Progress',
  SETTINGS: 'Settings'
};

// Database constants
export const DB_NAME = 'workout_trainer.db';
export const DB_VERSION = 1;