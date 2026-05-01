import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style
}) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  ];

  const textStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#6c63ff'}
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  // Variants
  primary: {
    backgroundColor: '#6c63ff'
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6c63ff'
  },
  danger: {
    backgroundColor: '#ff6b6b'
  },
  success: {
    backgroundColor: '#51cf66'
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32
  },
  // Disabled
  disabled: {
    opacity: 0.5
  },
  // Text styles
  baseText: {
    fontWeight: '700'
  },
  primaryText: {
    color: '#ffffff'
  },
  secondaryText: {
    color: '#6c63ff'
  },
  dangerText: {
    color: '#ffffff'
  },
  successText: {
    color: '#ffffff'
  },
  ghostText: {
    color: '#6c63ff'
  },
  disabledText: {
    color: '#888888'
  },
  // Text sizes
  smallText: {
    fontSize: 13
  },
  mediumText: {
    fontSize: 16
  },
  largeText: {
    fontSize: 18
  }
});