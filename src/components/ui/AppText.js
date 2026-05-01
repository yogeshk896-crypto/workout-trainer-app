import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function AppText({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines
}) {
  return (
    <Text
      style={[styles.base, styles[variant], color && { color }, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: '#ffffff'
  },
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff'
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff'
  },
  body: {
    fontSize: 16,
    color: '#e0e0e0'
  },
  bodySmall: {
    fontSize: 14,
    color: '#a0a0b0'
  },
  caption: {
    fontSize: 12,
    color: '#a0a0b0'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  accent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c63ff'
  }
});