import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Badge({ label, variant = 'default', style }) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  default: { backgroundColor: '#2a2a4a' },
  primary: { backgroundColor: '#6c63ff' },
  success: { backgroundColor: '#1b2d1e', borderWidth: 1, borderColor: '#51cf66' },
  warning: { backgroundColor: '#2d2a1b', borderWidth: 1, borderColor: '#ffd43b' },
  danger: { backgroundColor: '#2d1b1b', borderWidth: 1, borderColor: '#ff6b6b' },
  easy: { backgroundColor: '#1b2d1e', borderWidth: 1, borderColor: '#51cf66' },
  normal: { backgroundColor: '#1b2040', borderWidth: 1, borderColor: '#6c63ff' },
  hard: { backgroundColor: '#2d1b1b', borderWidth: 1, borderColor: '#ff6b6b' },
  beginner: { backgroundColor: '#1b2d1e', borderWidth: 1, borderColor: '#51cf66' },
  intermediate: { backgroundColor: '#2d2a1b', borderWidth: 1, borderColor: '#ffd43b' },
  advanced: { backgroundColor: '#2d1b1b', borderWidth: 1, borderColor: '#ff6b6b' },
  text: { fontSize: 12, fontWeight: '600', color: '#ffffff' },
  defaultText: { color: '#a0a0b0' },
  primaryText: { color: '#ffffff' },
  successText: { color: '#51cf66' },
  warningText: { color: '#ffd43b' },
  dangerText: { color: '#ff6b6b' },
  easyText: { color: '#51cf66' },
  normalText: { color: '#6c63ff' },
  hardText: { color: '#ff6b6b' },
  beginnerText: { color: '#51cf66' },
  intermediateText: { color: '#ffd43b' },
  advancedText: { color: '#ff6b6b' }
});