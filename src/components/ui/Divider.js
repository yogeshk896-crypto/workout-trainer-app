import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#2a2a4a',
    marginVertical: 12
  }
});