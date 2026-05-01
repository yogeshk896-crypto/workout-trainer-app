import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Card({
  children,
  variant = 'default',
  style
}) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8
  },
  default: {
    backgroundColor: '#16213e'
  },
  elevated: {
    backgroundColor: '#16213e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  highlight: {
    backgroundColor: '#0f3460',
    borderWidth: 1,
    borderColor: '#6c63ff'
  },
  danger: {
    backgroundColor: '#2d1b1b',
    borderWidth: 1,
    borderColor: '#ff6b6b'
  },
  success: {
    backgroundColor: '#1b2d1e',
    borderWidth: 1,
    borderColor: '#51cf66'
  }
});