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
import useProgressStore from '../../state/useProgressStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Divider from '../../components/ui/Divider';
import {
  generateProgressReport,
  getMuscleGroupVolume,
  getPersonalRecords
} from '../../engine';

function BarChart({ data, maxValue, color, label }) {
  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.label}>{label}</Text>
      <View style={chartStyles.barsContainer}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <View key={index} style={chartStyles.barWrapper}>
              <Text style={chartStyles.barValue}>
                {item.value > 0 ? item.value : ''}
              </Text>
              <View style={chartStyles.barBackground}>
                <View
                  style={[
                    chartStyles.barFill,
                    {
                      height: `${Math.max(percentage, 2)}%`,
                      backgroundColor: color
                    }
                  ]}
                />
              </View>
              <Text style={chartStyles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { marginBottom: 8 },
  label: { fontSize: 13, color: Colors.textMuted, marginBottom: 12, fontWeight: '600' },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 },
  barWrapper: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValue: { fontSize: 10, color: Colors.textMuted, marginBottom: 4 },
  barBackground: { width: '100%', height: '85%', backgroundColor: Colors.border, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 6, textAlign: 'center' }
});

function DifficultyRing({ easy, normal, hard }) {
  const total = easy + normal + hard;
  const easyPct = total > 0 ? Math.round((easy / total) * 100) : 0;
  const normalPct = total > 0 ? Math.round((normal / total) * 100) : 0;
  const hardPct = total > 0 ? Math.round((hard / total) * 100) : 0;

  return (
    <View style={ringStyles.container}>
      <View style={ringStyles.legend}>
        <View style={ringStyles.legendItem}>
          <View style={[ringStyles.dot, { backgroundColor: Colors.easy }]} />
          <Text style={ringStyles.legendLabel}>Easy</Text>
          <Text style={[ringStyles.legendValue, { color: Colors.easy }]}>{easyPct}%</Text>
        </View>
        <View style={ringStyles.legendItem}>
          <View style={[ringStyles.dot, { backgroundColor: Colors.normal }]} />
          <Text style={ringStyles.legendLabel}>Normal</Text>
          <Text style={[ringStyles.legendValue, { color: Colors.normal }]}>{normalPct}%</Text>
        </View>
        <View style={ringStyles.legendItem}>
          <View style={[ringStyles.dot, { backgroundColor: Colors.hard }]} />
          <Text style={ringStyles.legendLabel}>Hard</Text>
          <Text style={[ringStyles.legendValue, { color: Colors.hard }]}>{hardPct}%</Text>
        </View>
      </View>
      <View style={ringStyles.barContainer}>
        {easyPct > 0 && <View style={[ringStyles.segment, { flex: easyPct, backgroundColor: Colors.easy }]} />}
        {normalPct > 0 && <View style={[ringStyles.segment, { flex: normalPct, backgroundColor: Colors.normal }]} />}
        {hardPct > 0 && <View style={[ringStyles.segment, { flex: hardPct, backgroundColor: Colors.hard }]} />}
        {total === 0 && <View style={[ringStyles.segment, { flex: 1, backgroundColor: Colors.border }]} />}
      </View>
      <Text style={ringStyles.totalText}>{total} total exercises rated</Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: { gap: 12 },
  legend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { alignItems: 'center', gap: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 12, color: Colors.textMuted },
  legendValue: { fontSize: 16, fontWeight: 'bold' },
  barContainer: { flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', gap: 2 },
  segment: { height: '100%', borderRadius: 4 },
  totalText: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' }
});

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const userProfile = useUserStore(state => state.userProfile);
  const progressSnapshots = useProgressStore(state => state.progressSnapshots);
  const sessionLogs = useProgressStore(state => state.sessionLogs);
  const weeklyStats = useProgressStore(state => state.weeklyStats);
  const overallStats = useProgressStore(state => state.overallStats);
  const loadProgressSnapshots = useProgressStore(state => state.loadProgressSnapshots);
  const loadSessionLogs = useProgressStore(state => state.loadSessionLogs);
  const calculateWeeklyStats = useProgressStore(state => state.calculateWeeklyStats);
  const calculateOverallStats = useProgressStore(state => state.calculateOverallStats);

  useEffect(() => {
    if (userProfile?.id) {
      loadAllData();
    }
  }, [userProfile]);

  const loadAllData = async () => {
    if (!userProfile?.id) return;
    await Promise.all([
      loadProgressSnapshots(userProfile.id),
      loadSessionLogs(userProfile.id),
      calculateWeeklyStats(userProfile.id),
      calculateOverallStats(userProfile.id)
    ]);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const buildWeeklyChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const sessionsOnDay = sessionLogs.filter(log =>
        log.started_at?.split('T')[0] === dateStr
      ).length;
      data.push({ label: days[dayIndex], value: sessionsOnDay, date: dateStr });
    }
    return data;
  };

  const weeklyChartData = buildWeeklyChartData();
  const maxWeeklyValue = Math.max(...weeklyChartData.map(d => d.value), 1);
  const TABS = ['overview', 'history', 'body'];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {activeTab === 'overview' && (
          <>
            <Text style={styles.sectionTitle}>📊 Overall Stats</Text>
            <View style={styles.statsGrid}>
              <Card variant="default" style={styles.statCard}>
                <Text style={styles.statEmoji}>🏋️</Text>
                <Text style={styles.statValue}>{overallStats?.totalSessions || 0}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </Card>
              <Card variant="default" style={styles.statCard}>
                <Text style={styles.statEmoji}>⏰</Text>
                <Text style={styles.statValue}>{overallStats?.totalHours || 0}h</Text>
                <Text style={styles.statLabel}>Total Hours</Text>
              </Card>
              <Card variant="default" style={styles.statCard}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statValue}>{overallStats?.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </Card>
            </View>

            <Text style={styles.sectionTitle}>📅 This Week's Activity</Text>
            <Card variant="default">
              <BarChart
                data={weeklyChartData}
                maxValue={maxWeeklyValue}
                color={Colors.primary}
                label="Workouts per day"
              />
            </Card>

            <Text style={styles.sectionTitle}>💪 Difficulty Breakdown</Text>
            <Card variant="default">
              <DifficultyRing
                easy={overallStats?.easyCount || 0}
                normal={overallStats?.normalCount || 0}
                hard={overallStats?.hardCount || 0}
              />
            </Card>

            <Text style={styles.sectionTitle}>📈 This Week Summary</Text>
            <Card variant="default">
              <View style={styles.weekSummaryRow}>
                <View style={styles.weekSummaryItem}>
                  <Text style={styles.weekSummaryValue}>{weeklyStats?.totalSessions || 0}</Text>
                  <Text style={styles.weekSummaryLabel}>Sessions</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.weekSummaryItem}>
                  <Text style={styles.weekSummaryValue}>{weeklyStats?.totalDuration || 0}</Text>
                  <Text style={styles.weekSummaryLabel}>Minutes</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.weekSummaryItem}>
                  <Text style={styles.weekSummaryValue}>{weeklyStats?.totalExercises || 0}</Text>
                  <Text style={styles.weekSummaryLabel}>Exercises</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.weekSummaryItem}>
                  <Text style={styles.weekSummaryValue}>{weeklyStats?.averageSessionDuration || 0}</Text>
                  <Text style={styles.weekSummaryLabel}>Avg Min</Text>
                </View>
              </View>
            </Card>
          </>
        )}

        {activeTab === 'history' && (
          <>
            <Text style={styles.sectionTitle}>🗓️ Session History ({sessionLogs.length})</Text>
            {sessionLogs.length === 0 ? (
              <Card variant="default" style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>No Sessions Yet</Text>
                <Text style={styles.emptySubtitle}>Complete your first workout to see history here!</Text>
              </Card>
            ) : (
              sessionLogs.map((log) => (
                <Card key={log.id} variant="default" style={styles.sessionCard}>
                  <View style={styles.sessionCardHeader}>
                    <View>
                      <Text style={styles.sessionCardDate}>{formatDate(log.started_at)}</Text>
                      <Text style={styles.sessionCardDuration}>⏱️ {formatDuration(log.duration_minutes)}</Text>
                    </View>
                    <Badge label={log.overall_difficulty || 'normal'} variant={log.overall_difficulty || 'normal'} />
                  </View>
                  <Divider />
                  <View style={styles.sessionCardStats}>
                    <View style={styles.sessionCardStat}>
                      <Text style={styles.sessionCardStatValue}>{log.exercises_completed || 0}</Text>
                      <Text style={styles.sessionCardStatLabel}>Completed</Text>
                    </View>
                    <View style={styles.sessionCardStat}>
                      <Text style={styles.sessionCardStatValue}>{log.exercises_skipped || 0}</Text>
                      <Text style={styles.sessionCardStatLabel}>Skipped</Text>
                    </View>
                    <View style={styles.sessionCardStat}>
                      <Text style={styles.sessionCardStatValue}>{log.total_exercises || 0}</Text>
                      <Text style={styles.sessionCardStatLabel}>Total</Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {activeTab === 'body' && (
          <>
            <Text style={styles.sectionTitle}>⚖️ Body Metrics</Text>
            <Card variant="default" style={styles.bodyCard}>
              <Text style={styles.bodyCardTitle}>Current Measurements</Text>
              <Divider />
              <View style={styles.bodyRow}>
                <View style={styles.bodyItem}>
                  <Text style={styles.bodyEmoji}>⚖️</Text>
                  <Text style={styles.bodyValue}>{userProfile?.weight_kg || '—'} kg</Text>
                  <Text style={styles.bodyLabel}>Weight</Text>
                </View>
                <View style={styles.bodyItem}>
                  <Text style={styles.bodyEmoji}>📏</Text>
                  <Text style={styles.bodyValue}>{userProfile?.height_cm || '—'} cm</Text>
                  <Text style={styles.bodyLabel}>Height</Text>
                </View>
                <View style={styles.bodyItem}>
                  <Text style={styles.bodyEmoji}>🏃</Text>
                  <Text style={styles.bodyValue}>
                    {userProfile?.weight_kg && userProfile?.height_cm
                      ? (userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2)).toFixed(1)
                      : '—'}
                  </Text>
                  <Text style={styles.bodyLabel}>BMI</Text>
                </View>
              </View>
            </Card>

            <Card variant="default" style={styles.bodyCard}>
              <Text style={styles.bodyCardTitle}>Training Profile</Text>
              <Divider />
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Fitness Level</Text>
                <Text style={styles.profileDetailValue}>
                  {userProfile?.fitness_level
                    ? userProfile.fitness_level.charAt(0).toUpperCase() + userProfile.fitness_level.slice(1)
                    : '—'}
                </Text>
              </View>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Age</Text>
                <Text style={styles.profileDetailValue}>{userProfile?.age ? `${userProfile.age} years` : '—'}</Text>
              </View>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Gender</Text>
                <Text style={styles.profileDetailValue}>
                  {userProfile?.gender
                    ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)
                    : '—'}
                </Text>
              </View>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Member Since</Text>
                <Text style={styles.profileDetailValue}>
                  {userProfile?.created_at ? formatDate(userProfile.created_at) : '—'}
                </Text>
              </View>
            </Card>

            <Card variant="default">
              <Text style={styles.bodyCardTitle}>BMI Guide</Text>
              <Divider />
              <View style={styles.bmiRow}>
                <View style={styles.bmiItem}>
                  <View style={[styles.bmiDot, { backgroundColor: '#74c0fc' }]} />
                  <Text style={styles.bmiLabel}>{'< 18.5'}</Text>
                  <Text style={styles.bmiCategory}>Underweight</Text>
                </View>
                <View style={styles.bmiItem}>
                  <View style={[styles.bmiDot, { backgroundColor: Colors.easy }]} />
                  <Text style={styles.bmiLabel}>18.5-24.9</Text>
                  <Text style={styles.bmiCategory}>Normal</Text>
                </View>
                <View style={styles.bmiItem}>
                  <View style={[styles.bmiDot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.bmiLabel}>25-29.9</Text>
                  <Text style={styles.bmiCategory}>Overweight</Text>
                </View>
                <View style={styles.bmiItem}>
                  <View style={[styles.bmiDot, { backgroundColor: Colors.danger }]} />
                  <Text style={styles.bmiLabel}>{'>= 30'}</Text>
                  <Text style={styles.bmiCategory}>Obese</Text>
                </View>
              </View>
            </Card>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabContainer: { flexDirection: 'row', backgroundColor: Colors.surface, margin: 16, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: '#ffffff' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10, marginTop: 8 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  weekSummaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  weekSummaryItem: { alignItems: 'center', flex: 1 },
  weekSummaryValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  weekSummaryLabel: { fontSize: 11, color: Colors.textMuted },
  verticalDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  emptyCard: { alignItems: 'center', padding: 30 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  sessionCard: { marginBottom: 10 },
  sessionCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessionCardDate: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  sessionCardDuration: { fontSize: 13, color: Colors.textMuted },
  sessionCardStats: { flexDirection: 'row', justifyContent: 'space-around' },
  sessionCardStat: { alignItems: 'center' },
  sessionCardStatValue: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 2 },
  sessionCardStatLabel: { fontSize: 11, color: Colors.textMuted },
  bodyCard: { marginBottom: 12 },
  bodyCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  bodyRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  bodyItem: { alignItems: 'center', gap: 4 },
  bodyEmoji: { fontSize: 28 },
  bodyValue: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  bodyLabel: { fontSize: 12, color: Colors.textMuted },
  profileDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  profileDetailLabel: { fontSize: 14, color: Colors.textMuted },
  profileDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  bmiRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  bmiItem: { alignItems: 'center', gap: 4 },
  bmiDot: { width: 14, height: 14, borderRadius: 7 },
  bmiLabel: { fontSize: 10, color: Colors.textMuted },
  bmiCategory: { fontSize: 10, color: Colors.textPrimary, fontWeight: '600' }
});