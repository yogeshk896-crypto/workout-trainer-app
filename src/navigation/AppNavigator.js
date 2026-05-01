import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../state/useUserStore';

import HomeScreen from '../screens/home/HomeScreen';
import WorkoutScreen from '../screens/workout/WorkoutScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SetupWizard from '../screens/setup/SetupWizard';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const isProfileComplete = useUserStore(state => state.isProfileComplete);
  const loadUserProfile = useUserStore(state => state.loadUserProfile);

  // Show setup wizard if profile not complete
  if (!isProfileComplete) {
    return (
      <NavigationContainer>
        <SetupWizard onComplete={() => loadUserProfile()} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = 'home-outline';
            if (route.name === 'Home') iconName = 'home-outline';
            if (route.name === 'Workout') iconName = 'barbell-outline';
            if (route.name === 'Progress') iconName = 'stats-chart-outline';
            if (route.name === 'Settings') iconName = 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6c63ff',
          tabBarInactiveTintColor: '#888888',
          tabBarStyle: { backgroundColor: '#16213e' },
          headerStyle: { backgroundColor: '#16213e' },
          headerTintColor: '#ffffff'
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workout" component={WorkoutScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}