import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { Colors } from '../../../utils/colors';

export default function RestTimer({
  duration,
  onComplete,
  onSkip
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(true);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: duration * 1000,
      useNativeDriver: false
    }).start();
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
    return `${secs}s`;
  };

  const percentage = Math.round((timeLeft / duration) * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>😮‍💨 Rest Time</Text>

      {/* Timer Circle */}
      <View style={styles.timerCircle}>
        <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
        <Text style={styles.timerLabel}>remaining</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
      </View>

      <Text style={styles.percentageText}>{percentage}% remaining</Text>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={() => setIsRunning(prev => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.pauseButtonText}>
            {isRunning ? '⏸️ Pause' : '▶️ Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Skip Rest ⏭️</Text>
        </TouchableOpacity>
      </View>

      {/* Add time buttons */}
      <View style={styles.addTimeRow}>
        <Text style={styles.addTimeLabel}>Add time:</Text>
        {[15, 30, 60].map((seconds) => (
          <TouchableOpacity
            key={seconds}
            style={styles.addTimeButton}
            onPress={() => setTimeLeft(prev => prev + seconds)}
          >
            <Text style={styles.addTimeText}>+{seconds}s</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 4,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  timerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.success
  },
  timerLabel: {
    fontSize: 12,
    color: Colors.textMuted
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4
  },
  percentageText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 20
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16
  },
  pauseButton: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border
  },
  pauseButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600'
  },
  skipButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  skipButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600'
  },
  addTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  addTimeLabel: {
    fontSize: 12,
    color: Colors.textMuted
  },
  addTimeButton: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border
  },
  addTimeText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600'
  }
});