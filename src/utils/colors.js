export const Colors = {
  // Background
  background: '#1a1a2e',
  surface: '#16213e',
  surfaceAlt: '#0f3460',

  // Brand
  primary: '#6c63ff',
  primaryLight: '#8b85ff',
  primaryDark: '#4a44cc',

  // Feedback
  easy: '#51cf66',
  normal: '#6c63ff',
  hard: '#ff6b6b',

  // Status
  success: '#51cf66',
  warning: '#ffd43b',
  danger: '#ff6b6b',
  info: '#74c0fc',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#e0e0e0',
  textMuted: '#a0a0b0',
  textDisabled: '#555577',

  // Difficulty
  beginner: '#51cf66',
  intermediate: '#ffd43b',
  advanced: '#ff6b6b',

  // Border
  border: '#2a2a4a',
  borderLight: '#3a3a6a',

  // Overlay
  overlay: 'rgba(0,0,0,0.7)'
};

export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case 'beginner': return Colors.beginner;
    case 'intermediate': return Colors.intermediate;
    case 'advanced': return Colors.advanced;
    default: return Colors.textMuted;
  }
}

export function getFeedbackColor(rating) {
  switch (rating) {
    case 'easy': return Colors.easy;
    case 'normal': return Colors.normal;
    case 'hard': return Colors.hard;
    default: return Colors.textMuted;
  }
}