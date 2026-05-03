import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ─── Configure Notification Handler ──────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

// ─── Request Permissions ──────────────────────────────────────────────────────
export async function requestNotificationPermissions() {
  try {
    if (!Device.isDevice) {
      console.log('ℹ️ Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permission denied');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('workout', {
        name: 'Workout Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6c63ff',
        sound: true
      });
    }

    console.log('✅ Notification permissions granted');
    return true;

  } catch (error) {
    console.error('❌ Permission request failed:', error);
    return false;
  }
}

// ─── Schedule Daily Workout Reminder ─────────────────────────────────────────
export async function scheduleDailyWorkoutReminder(
  hour = 8,
  minute = 0,
  workoutDays = ['mon', 'tue', 'wed', 'thu', 'fri']
) {
  try {
    // Cancel existing reminders first
    await cancelAllWorkoutReminders();

    const dayMap = {
      sun: 1, mon: 2, tue: 3, wed: 4,
      thu: 5, fri: 6, sat: 7
    };

    const scheduledIds = [];

    for (const day of workoutDays) {
      const weekday = dayMap[day];
      if (!weekday) continue;

const id = await Notifications.scheduleNotificationAsync({
  content: {
    title: '💪 Time to Work Out!',
    body: getRandomMotivationalMessage(),
    data: { type: 'workout_reminder', day },
    sound: true,
    color: '#6c63ff'
  },
  trigger: {
    type: 'weekly',
    weekday,
    hour,
    minute,
    repeats: true
  }
});

      scheduledIds.push(id);
      console.log(`✅ Reminder scheduled for ${day} at ${hour}:${minute.toString().padStart(2, '0')}`);
    }

    console.log(`✅ ${scheduledIds.length} workout reminders scheduled`);
    return scheduledIds;

  } catch (error) {
    console.error('❌ Failed to schedule reminders:', error);
    return [];
  }
}

// ─── Schedule Session Start Notification ─────────────────────────────────────
export async function scheduleSessionStartNotification(
  exerciseCount,
  workoutName
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏋️ ${workoutName} Ready!`,
        body: `${exerciseCount} exercises waiting for you. Let's go!`,
        data: { type: 'session_start' },
        sound: true,
        color: '#6c63ff'
      },
      trigger: null // Show immediately
    });

    console.log('✅ Session start notification sent');

  } catch (error) {
    console.error('❌ Session notification failed:', error);
  }
}

// ─── Schedule Session Complete Notification ───────────────────────────────────
export async function scheduleSessionCompleteNotification(
  exercisesCompleted,
  durationMinutes
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Workout Complete!',
        body: `Amazing work! ${exercisesCompleted} exercises in ${durationMinutes} minutes.`,
        data: { type: 'session_complete' },
        sound: true,
        color: '#51cf66'
      },
      trigger: null // Show immediately
    });

    console.log('✅ Session complete notification sent');

  } catch (error) {
    console.error('❌ Session complete notification failed:', error);
  }
}

// ─── Schedule Rest Day Reminder ───────────────────────────────────────────────
export async function scheduleRestDayReminder() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '😴 Rest Day — Recovery Time',
        body: 'Stay hydrated, eat well, and get good sleep tonight!',
        data: { type: 'rest_day' },
        sound: false,
        color: '#a0a0b0'
      },
      trigger: {
        type: 'daily',
        hour: 10,
        minute: 0,
        repeats: false
    }
    });

  } catch (error) {
    console.error('❌ Rest day notification failed:', error);
  }
}

// ─── Schedule Streak Warning ──────────────────────────────────────────────────
export async function scheduleStreakWarning(currentStreak) {
  if (currentStreak < 2) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔥 Don't Break Your ${currentStreak}-Day Streak!`,
        body: "You're on a roll! Complete today's workout to keep it going.",
        data: { type: 'streak_warning' },
        sound: true,
        color: '#ff8c00'
      },
      trigger: {
        type: 'daily',
        hour: 18,
        minute: 0,
        repeats: false
    }
    });

    console.log('✅ Streak warning scheduled');

  } catch (error) {
    console.error('❌ Streak warning failed:', error);
  }
}

// ─── Schedule Weekly Summary ──────────────────────────────────────────────────
export async function scheduleWeeklySummary(
  workoutsCompleted,
  totalMinutes
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Weekly Summary',
        body: `This week: ${workoutsCompleted} workouts, ${totalMinutes} minutes. Keep it up!`,
        data: { type: 'weekly_summary' },
        sound: true,
        color: '#6c63ff'
      },
      trigger: {
  type: 'weekly',
  weekday: 7,
  hour: 19,
  minute: 0,
  repeats: true
}
    });

    console.log('✅ Weekly summary notification scheduled');

  } catch (error) {
    console.error('❌ Weekly summary failed:', error);
  }
}

// ─── Cancel All Workout Reminders ─────────────────────────────────────────────
export async function cancelAllWorkoutReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All reminders cancelled');
  } catch (error) {
    console.error('❌ Cancel reminders failed:', error);
  }
}

// ─── Get Scheduled Notifications ─────────────────────────────────────────────
export async function getScheduledNotifications() {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('❌ Get notifications failed:', error);
    return [];
  }
}

// ─── Send Immediate Notification ─────────────────────────────────────────────
export async function sendImmediateNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true
      },
      trigger: null
    });
  } catch (error) {
    console.error('❌ Immediate notification failed:', error);
  }
}

// ─── Setup Notification Listeners ────────────────────────────────────────────
export function setupNotificationListeners(
  onNotificationReceived,
  onNotificationResponse
) {
  const receivedListener =
    Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );

  return () => {
    receivedListener.remove();
    responseListener.remove();
  };
}

// ─── Initialize Notifications ─────────────────────────────────────────────────
export async function initializeNotifications(userPreferences) {
  try {
    const hasPermission = await requestNotificationPermissions();

    if (!hasPermission) return false;

    if (!userPreferences) return true;

    const workoutDays = userPreferences.preferred_workout_days
      ? userPreferences.preferred_workout_days
          .split(',')
          .filter(d => d)
      : ['mon', 'tue', 'wed', 'thu', 'fri'];

    await scheduleDailyWorkoutReminder(8, 0, workoutDays);
    await scheduleWeeklySummary(0, 0);

    console.log('✅ Notifications initialized');
    return true;

  } catch (error) {
    console.error('❌ Notification init failed:', error);
    return false;
  }
}

// ─── Motivational Messages ────────────────────────────────────────────────────
function getRandomMotivationalMessage() {
  const messages = [
    "Your workout is waiting! Let's crush it today 💪",
    "Time to get stronger! Your future self will thank you 🏆",
    "Every rep counts. Let's make today count! 🔥",
    "You showed up yesterday. Show up again today! ⚡",
    "Progress happens one workout at a time. Let's go! 🚀",
    "Your body can do it. It's your mind you need to convince! 💪",
    "Consistency beats perfection. Just start! ✅",
    "Today's workout is tomorrow's strength! 🏋️"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}