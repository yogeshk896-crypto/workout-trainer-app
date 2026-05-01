import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { formatDate, formatDuration } from '../../utils/formatters';
import useUserStore from '../../state/useUserStore';
import useWorkoutStore from '../../state/useWorkoutStore';
import useProgressStore from '../../state/useProgressStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { generateWorkoutPlan, checkActivePlan } from '../../engine';
import { getPlanStatistics } from '../../engine';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  // Stores
  const userProfile = useUserStore(state => state.userProfile);
  const userPreferences = useUserStore(state => state.userPreferences);
  const activePlan = useWorkoutStore(state => state.activePlan);
  const todaysWorkout = useWorkoutStore(state => state.todaysWorkout);
  const loadActivePlan = useWorkoutStore(state => state.loadActivePlan);
  const loadTodaysWorkout = useWorkoutStore(state => state.loadTodaysWorkout);
  const weeklyStats = useProgressStore(state => state.weeklyStats);
  const overallStats = useProgressStore(state => state.overallStats);
  const calculateWeeklyStats = useProgressStore(state => state.calculateWeeklyStats);
  const calculateOverallStats = useProgressStore(state => state.calculateOverallStats);

  // Load data on mount
  useEffect(() => {
    if (userProfile?.id) {
      loadData();
    }
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile?.id) return;
    await loadActivePlan(userProfile.id);
    await calculateWeeklyStats(userProfile.id);
    await calculateOverallStats(userProfile.id);
  };

  useEffect(() => {
    if (activePlan?.id) {
      loadTodaysWorkout(activePlan.id);
    }
  }, [activePlan?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  const [generating, setGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    if (!userProfile?.id) return;
    setGenerating(true);
    try {
      console.log('🏗️ Generating workout plan...');
      const planId = await generateWorkoutPlan(userProfile.id);
      if (planId) {
        console.log('✅ Plan generated:', planId);
        await loadData();
      } else {
        console.error('❌ Plan generation failed');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
    setGenerating(false);
  };
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get today's day name
  const today = new Date().getDay();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >

        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{userProfile?.name || 'Athlete'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>
              {overallStats?.currentStreak || 0}
            </Text>
            <Text style={styles.streakLabel}>streak</Text>
          </View>
        </View>

        {/* ── Weekly Calendar Strip ───────────────────────── */}
        <View style={styles.calendarStrip}>
          {DAYS.map((day, index) => {
            const isToday = index === today;
            return (
              <View
                key={day}
                style={[
                  styles.dayItem,
                  isToday && styles.dayItemToday
                ]}
              >
                <Text style={[
                  styles.dayName,
                  isToday && styles.dayNameToday
                ]}>
                  {day}
                </Text>
                <View style={[
                  styles.dayDot,
                  isToday && styles.dayDotToday
                ]} />
              </View>
            );
          })}
        </View>

        {/* ── Today's Workout Card ────────────────────────── */}
        <Text style={styles.sectionTitle}>Today's Workout</Text>

        {activePlan ? (
          <Card variant="elevated" style={styles.workoutCard}>
            {todaysWorkout ? (
              <>
                <View style={styles.workoutHeader}>
                  <View>
                    <Text style={styles.workoutName}>
                      {todaysWorkout.day_name}
                    </Text>
                    <Text style={styles.workoutSubtitle}>
                      {formatDate(new Date().toISOString())}
                    </Text>
                  </View>
                  <Badge label="Today" variant="primary" />
                </View>

                <View style={styles.workoutStats}>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatValue}>
                      {userPreferences?.session_duration_minutes || 45}
                    </Text>
                    <Text style={styles.workoutStatLabel}>minutes</Text>
                  </View>
                  <View style={styles.workoutStatDivider} />
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatValue}>
                      {userPreferences?.workout_frequency || 3}
                    </Text>
                    <Text style={styles.workoutStatLabel}>days/week</Text>
                  </View>
                  <View style={styles.workoutStatDivider} />
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatValue}>
                      {userProfile?.fitness_level?.charAt(0).toUpperCase() +
                        userProfile?.fitness_level?.slice(1) || 'Beginner'}
                    </Text>
                    <Text style={styles.workoutStatLabel}>level</Text>
                  </View>
                </View>

                <Button
                  title="💪 Start Workout"
                  onPress={() => {}}
                  variant="primary"
                  size="large"
                  style={styles.startBtn}
                />
              </>
            ) : (
              <View style={styles.restDayContainer}>
                <Text style={styles.restDayEmoji}>😴</Text>
                <Text style={styles.restDayTitle}>Rest Day</Text>
                <Text style={styles.restDaySubtitle}>
                  Recovery is part of the process. See you tomorrow!
                </Text>
              </View>
            )}
          </Card>
        ) : (
          <Card variant="highlight" style={styles.noPlanCard}>
            <Text style={styles.noPlanEmoji}>📋</Text>
            <Text style={styles.noPlanTitle}>No Plan Yet</Text>
            <Text style={styles.noPlanSubtitle}>
              Your workout plan is being generated. Check back soon!
            </Text>
            <Button
              title={generating ? 'Generating...' : 'Generate My Plan'}
              onPress={handleGeneratePlan}
              variant="primary"
              size="medium"
              loading={generating}
              disabled={generating}
              style={{ marginTop: 16 }}
            />
          </Card>
        )}

        {/* ── Weekly Stats ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>This Week</Text>

        <View style={styles.statsGrid}>
          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statEmoji}>🏋️</Text>
            <Text style={styles.statValue}>
              {weeklyStats?.totalSessions || 0}
            </Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </Card>

          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>
              {weeklyStats?.totalDuration || 0}
            </Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </Card>

          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statEmoji}>💪</Text>
            <Text style={styles.statValue}>
              {weeklyStats?.totalExercises || 0}
            </Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </Card>
        </View>

        {/* ── Feedback Breakdown ──────────────────────────── */}
        {weeklyStats && (
          weeklyStats.easyCount > 0 ||
          weeklyStats.normalCount > 0 ||
          weeklyStats.hardCount > 0
        ) ? (
          <>
            <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
            <Card variant="default" style={styles.feedbackCard}>
              <View style={styles.feedbackRow}>
                <View style={styles.feedbackItem}>
                  <Text style={styles.feedbackEmoji}>😊</Text>
                  <Text style={[styles.feedbackCount, { color: Colors.easy }]}>
                    {weeklyStats?.easyCount || 0}
                  </Text>
                  <Text style={styles.feedbackLabel}>Easy</Text>
                </View>
                <View style={styles.feedbackItem}>
                  <Text style={styles.feedbackEmoji}>💪</Text>
                  <Text style={[styles.feedbackCount, { color: Colors.normal }]}>
                    {weeklyStats?.normalCount || 0}
                  </Text>
                  <Text style={styles.feedbackLabel}>Normal</Text>
                </View>
                <View style={styles.feedbackItem}>
                  <Text style={styles.feedbackEmoji}>😤</Text>
                  <Text style={[styles.feedbackCount, { color: Colors.hard }]}>
                    {weeklyStats?.hardCount || 0}
                  </Text>
                  <Text style={styles.feedbackLabel}>Hard</Text>
                </View>
              </View>
            </Card>
          </>
        ) : null}

        {/* ── Overall Stats ───────────────────────────────── */}
        <Text style={styles.sectionTitle}>All Time</Text>

        <Card variant="default" style={styles.overallCard}>
          <View style={styles.overallRow}>
            <View style={styles.overallItem}>
              <Text style={styles.overallEmoji}>🏆</Text>
              <Text style={styles.overallValue}>
                {overallStats?.totalSessions || 0}
              </Text>
              <Text style={styles.overallLabel}>Total Workouts</Text>
            </View>
            <View style={styles.overallItem}>
              <Text style={styles.overallEmoji}>⏰</Text>
              <Text style={styles.overallValue}>
                {overallStats?.totalHours || 0}h
              </Text>
              <Text style={styles.overallLabel}>Total Hours</Text>
            </View>
            <View style={styles.overallItem}>
              <Text style={styles.overallEmoji}>🎯</Text>
              <Text style={styles.overallValue}>
                {overallStats?.totalExercises || 0}
              </Text>
              <Text style={styles.overallLabel}>Exercises Done</Text>
            </View>
          </View>
        </Card>

        {/* ── Quick Profile Summary ───────────────────────── */}
        <Text style={styles.sectionTitle}>My Profile</Text>
        <Card variant="default" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Goal</Text>
              <Text style={styles.profileValue}>
                {userProfile?.fitness_level || '—'}
              </Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Weight</Text>
              <Text style={styles.profileValue}>
                {userProfile?.weight_kg ? `${userProfile.weight_kg} kg` : '—'}
              </Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Height</Text>
              <Text style={styles.profileValue}>
                {userProfile?.height_cm ? `${userProfile.height_cm} cm` : '—'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 20
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greeting: {
    fontSize: 14,
    color: Colors.textMuted
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  streakBadge: {
    backgroundColor: '#2d1b00',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff8c00'
  },
  streakEmoji: {
    fontSize: 20
  },
  streakCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff8c00'
  },
  streakLabel: {
    fontSize: 10,
    color: '#ff8c00'
  },
  // Calendar
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border
  },
  dayItem: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
    minWidth: 36
  },
  dayItemToday: {
    backgroundColor: Colors.primary
  },
  dayName: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4
  },
  dayNameToday: {
    color: '#ffffff'
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border
  },
  dayDotToday: {
    backgroundColor: '#ffffff'
  },
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  // Workout card
  workoutCard: {
    marginBottom: 24
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  workoutSubtitle: {
    fontSize: 13,
    color: Colors.textMuted
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  workoutStat: {
    alignItems: 'center'
  },
  workoutStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2
  },
  workoutStatLabel: {
    fontSize: 11,
    color: Colors.textMuted
  },
  workoutStatDivider: {
    width: 1,
    backgroundColor: Colors.border
  },
  startBtn: {
    marginTop: 4
  },
  // Rest day
  restDayContainer: {
    alignItems: 'center',
    padding: 16
  },
  restDayEmoji: {
    fontSize: 48,
    marginBottom: 8
  },
  restDayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  restDaySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  // No plan
  noPlanCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24
  },
  noPlanEmoji: {
    fontSize: 48,
    marginBottom: 8
  },
  noPlanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  noPlanSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 6
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted
  },
  // Feedback
  feedbackCard: {
    marginBottom: 24
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  feedbackItem: {
    alignItems: 'center'
  },
  feedbackEmoji: {
    fontSize: 28,
    marginBottom: 4
  },
  feedbackCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2
  },
  feedbackLabel: {
    fontSize: 12,
    color: Colors.textMuted
  },
  // Overall stats
  overallCard: {
    marginBottom: 24
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  overallItem: {
    alignItems: 'center'
  },
  overallEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  overallValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  overallLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center'
  },
  // Profile card
  profileCard: {
    marginBottom: 8
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  profileItem: {
    alignItems: 'center'
  },
  profileLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4
  },
  profileValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'capitalize'
  }
});