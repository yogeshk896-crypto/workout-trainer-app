import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/database/initDatabase';
import useUserStore from './src/state/useUserStore';
import {
  initializeNotifications,
  setupNotificationListeners
} from './src/utils/notificationService';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);
  const loadUserProfile = useUserStore(state => state.loadUserProfile);
  const userPreferences = useUserStore(state => state.userPreferences);

  useEffect(() => {
    async function setupApp() {
      try {
        // Step 1: Initialize database
        const success = await initializeDatabase();
        if (!success) {
          setDbError('Database failed to initialize');
          return;
        }

        // Step 2: Load user profile
        await loadUserProfile();

        // Step 3: App is ready
        setDbReady(true);

      } catch (error) {
        setDbError(error.message);
      }
    }
    setupApp();
  }, []);

  // Step 4: Initialize notifications after profile loads
  useEffect(() => {
    if (dbReady && userPreferences) {
      initializeNotifications(userPreferences)
        .then(success => {
          if (success) {
            console.log('✅ Notifications initialized');
          }
        })
        .catch(err => {
          console.log('ℹ️ Notifications not available:', err.message);
        });
    }
  }, [dbReady, userPreferences]);

  // Step 5: Setup notification listeners
  useEffect(() => {
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('📬 Notification received:', notification.request.content.title);
      },
      (response) => {
        console.log('👆 Notification tapped:', response.notification.request.content.data);
      }
    );
    return cleanup;
  }, []);

  // Loading screen
  if (!dbReady && !dbError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>💪</Text>
        <Text style={styles.loadingText}>Workout Trainer</Text>
        <ActivityIndicator
          size="large"
          color="#6c63ff"
          style={styles.spinner}
        />
        <Text style={styles.loadingSubtext}>Setting up your app...</Text>
      </View>
    );
  }

  // Error screen
  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>❌</Text>
        <Text style={styles.errorText}>Setup Error</Text>
        <Text style={styles.errorSubtext}>{dbError}</Text>
      </View>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e'
  },
  loadingEmoji: { fontSize: 60, marginBottom: 16 },
  loadingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24
  },
  spinner: { marginBottom: 16 },
  loadingSubtext: { fontSize: 14, color: '#a0a0b0' },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e'
  },
  errorEmoji: { fontSize: 60, marginBottom: 16 },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10
  },
  errorSubtext: {
    fontSize: 14,
    color: '#a0a0b0',
    textAlign: 'center',
    paddingHorizontal: 30
  }
});