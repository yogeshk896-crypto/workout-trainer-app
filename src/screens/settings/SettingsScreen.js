import { generateWorkoutPlan } from '../../engine';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { formatDate } from '../../utils/formatters';
import useUserStore from '../../state/useUserStore';
import useWorkoutStore from '../../state/useWorkoutStore';
import useProgressStore from '../../state/useProgressStore';
import Card from '../../components/ui/Card';
import Divider from '../../components/ui/Divider';
import Badge from '../../components/ui/Badge';

// ─── Settings Item Component ──────────────────────────────────────────────────
function SettingsItem({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
  rightElement
}) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingsItemLeft}>
        <Text style={styles.settingsItemIcon}>{icon}</Text>
        <View>
          <Text style={[
            styles.settingsItemLabel,
            danger && styles.settingsItemLabelDanger
          ]}>
            {label}
          </Text>
          {value ? (
            <Text style={styles.settingsItemValue}>{value}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
        {showArrow && onPress && (
          <Text style={styles.settingsItemArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Section Header Component ─────────────────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}

// ─── Main Settings Screen ─────────────────────────────────────────────────────
export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const userProfile = useUserStore(state => state.userProfile);
  const userEquipment = useUserStore(state => state.userEquipment);
  const userGoals = useUserStore(state => state.userGoals);
  const userPreferences = useUserStore(state => state.userPreferences);
  const userInjuries = useUserStore(state => state.userInjuries);
  const clearUserState = useUserStore(state => state.clearUserState);
  const clearWorkoutState = useWorkoutStore(state => state.clearWorkoutState);
  const clearProgressState = useProgressStore(state => state.clearProgressState);

  // Handle reset app
  const handleResetApp = () => {
    Alert.alert(
      '⚠️ Reset App Data',
      'This will delete ALL your data including workout history, progress, and profile. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              clearUserState();
              clearWorkoutState();
              clearProgressState();
              console.log('✅ App data reset');
            } catch (error) {
              console.error('❌ Reset failed:', error);
            }
          }
        }
      ]
    );
  };

  // Handle regenerate plan
    const handleRegeneratePlan = async () => {
    Alert.alert(
      '🔄 Regenerate Plan',
      'Generate a new workout plan based on your current profile and goals?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              console.log('🔄 Regenerating plan...');
              const planId = await generateWorkoutPlan(userProfile.id);
              if (planId) {
                Alert.alert('✅ Success!', 'Your new workout plan has been generated!');
                console.log('✅ Plan regenerated:', planId);
              } else {
                Alert.alert('❌ Error', 'Plan generation failed. Please try again.');
              }
            } catch (error) {
              console.error('❌ Regenerate failed:', error);
              Alert.alert('❌ Error', 'Something went wrong. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⚙️</Text>
          <Text style={styles.emptyTitle}>No Profile Found</Text>
          <Text style={styles.emptySubtitle}>
            Complete the setup wizard to access settings.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >

        {/* ── Profile Card ──────────────────────────────── */}
        <Card variant="highlight" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {userProfile.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileSub}>
                {userProfile.age} years •{' '}
                {userProfile.gender?.charAt(0).toUpperCase() + userProfile.gender?.slice(1)}
              </Text>
              <Badge
                label={userProfile.fitness_level || 'beginner'}
                variant={userProfile.fitness_level || 'beginner'}
              />
            </View>
          </View>

          <Divider />

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {userProfile.weight_kg} kg
              </Text>
              <Text style={styles.profileStatLabel}>Weight</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {userProfile.height_cm} cm
              </Text>
              <Text style={styles.profileStatLabel}>Height</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {userPreferences?.workout_frequency || 3}x
              </Text>
              <Text style={styles.profileStatLabel}>Per Week</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {userPreferences?.session_duration_minutes || 45}m
              </Text>
              <Text style={styles.profileStatLabel}>Duration</Text>
            </View>
          </View>
        </Card>

        {/* ── Profile Settings ──────────────────────────── */}
        <SectionHeader title="👤 PROFILE" />
        <Card variant="default" style={styles.settingsCard}>
          <SettingsItem
            icon="📝"
            label="Personal Info"
            value={`${userProfile.name} • ${userProfile.age} years`}
            onPress={() => Alert.alert('Coming Soon', 'Edit profile coming in next update!')}
          />
          <Divider />
          <SettingsItem
            icon="⚖️"
            label="Body Metrics"
            value={`${userProfile.weight_kg} kg • ${userProfile.height_cm} cm`}
            onPress={() => Alert.alert('Coming Soon', 'Edit metrics coming in next update!')}
          />
          <Divider />
          <SettingsItem
            icon="🏋️"
            label="Fitness Level"
            value={userProfile.fitness_level?.charAt(0).toUpperCase() + userProfile.fitness_level?.slice(1)}
            onPress={() => Alert.alert('Coming Soon', 'Edit fitness level coming in next update!')}
          />
        </Card>

        {/* ── Goals Settings ────────────────────────────── */}
        <SectionHeader title="🎯 GOALS" />
        <Card variant="default" style={styles.settingsCard}>
          <SettingsItem
            icon="🎯"
            label="Current Goals"
            value={userGoals?.length > 0
              ? userGoals.map(g => g.goal_name).join(', ')
              : 'No goals set'
            }
            onPress={() => Alert.alert('Coming Soon', 'Edit goals coming in next update!')}
          />
          <Divider />
          <SettingsItem
            icon="🔄"
            label="Regenerate Workout Plan"
            value="Create a new plan based on your profile"
            onPress={handleRegeneratePlan}
          />
        </Card>

        {/* ── Equipment Settings ────────────────────────── */}
        <SectionHeader title="🔧 EQUIPMENT" />
        <Card variant="default" style={styles.settingsCard}>
          <SettingsItem
            icon="🏋️"
            label="My Equipment"
            value={userEquipment?.length > 0
              ? `${userEquipment.length} types selected`
              : 'Bodyweight only'
            }
            onPress={() => Alert.alert('Coming Soon', 'Edit equipment coming in next update!')}
          />
          {userEquipment?.length > 0 && (
            <View style={styles.equipmentTags}>
              {userEquipment.map((eq) => (
                <View key={eq.id} style={styles.equipmentTag}>
                  <Text style={styles.equipmentTagText}>{eq.equipment_name}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* ── Schedule Settings ─────────────────────────── */}
        <SectionHeader title="📅 SCHEDULE" />
        <Card variant="default" style={styles.settingsCard}>
          <SettingsItem
            icon="📅"
            label="Workout Frequency"
            value={`${userPreferences?.workout_frequency || 3} days per week`}
            onPress={() => Alert.alert('Coming Soon', 'Edit frequency coming in next update!')}
          />
          <Divider />
          <SettingsItem
            icon="⏱️"
            label="Session Duration"
            value={`${userPreferences?.session_duration_minutes || 45} minutes`}
            onPress={() => Alert.alert('Coming Soon', 'Edit duration coming in next update!')}
          />
          <Divider />
          <SettingsItem
            icon="🗓️"
            label="Preferred Split"
            value={userPreferences?.preferred_split_id?.replace(/_/g, ' ') || 'Full Body 3 Day'}
            onPress={() => Alert.alert('Coming Soon', 'Edit split coming in next update!')}
          />
        </Card>

        {/* ── Limitations Settings ──────────────────────── */}
        <SectionHeader title="🩺 LIMITATIONS" />
        <Card variant="default" style={styles.settingsCard}>
          <SettingsItem
            icon="🩺"
            label="Injuries & Limitations"
            value={userInjuries?.length > 0
              ? `${userInjuries.length} limitation(s) noted`
              : '✅ No limitations'
            }
            onPress={() => Alert.alert('Coming Soon', 'Edit limitations coming in next update!')}
          />
        </Card>

        {/* ── Preferences ───────────────────────────────── */}
        <SectionHeader title="⚙️ PREFERENCES" />
        <Card variant="default" style={styles.settingsCard}>
          <SettingsItem
            icon="🔔"
            label="Notifications"
            value="Workout reminders and updates"
            showArrow={false}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: Colors.border,
                  true: Colors.primary
                }}
                thumbColor="#ffffff"
              />
            }
          />
          <Divider />
          <SettingsItem
            icon="📏"
            label="Units"
            value="Metric (kg, cm)"
            onPress={() => Alert.alert('Coming Soon', 'Unit preference coming in next update!')}
          />
        </Card>

        {/* ── App Info ──────────────────────────────────── */}
        <SectionHeader title="ℹ️ APP INFO" />
        <Card variant="default" style={styles.settingsCard}>
          <SettingsItem
            icon="📱"
            label="App Version"
            value="1.0.0"
            showArrow={false}
          />
          <Divider />
          <SettingsItem
            icon="📊"
            label="Database Version"
            value="v3"
            showArrow={false}
          />
          <Divider />
          <SettingsItem
            icon="📅"
            label="Profile Created"
            value={userProfile?.created_at
              ? formatDate(userProfile.created_at)
              : '—'
            }
            showArrow={false}
          />
          <Divider />
          <SettingsItem
            icon="💪"
            label="Exercise Library"
            value="76 exercises loaded"
            showArrow={false}
          />
        </Card>

        {/* ── Danger Zone ───────────────────────────────── */}
        <SectionHeader title="⚠️ DANGER ZONE" />
        <Card variant="danger" style={styles.settingsCard}>
          <SettingsItem
            icon="🗑️"
            label="Reset All App Data"
            value="Delete profile, history and progress"
            onPress={handleResetApp}
            danger={true}
          />
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💪 Workout Trainer v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Offline-first • No cloud required
          </Text>
        </View>

        <View style={{ height: 20 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  // Profile card
  profileCard: { marginBottom: 24 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  profileSub: { fontSize: 14, color: Colors.textMuted },
  profileStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  profileStat: { alignItems: 'center' },
  profileStatValue: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 },
  profileStatLabel: { fontSize: 11, color: Colors.textMuted },
  // Section headers
  sectionHeader: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, marginBottom: 8, marginTop: 16, paddingHorizontal: 4, letterSpacing: 1 },
  // Settings card
  settingsCard: { marginBottom: 4, padding: 0, overflow: 'hidden' },
  // Settings item
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  settingsItemIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  settingsItemLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  settingsItemLabelDanger: { color: Colors.danger },
  settingsItemValue: { fontSize: 12, color: Colors.textMuted, maxWidth: 200 },
  settingsItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsItemArrow: { fontSize: 22, color: Colors.textMuted, fontWeight: '300' },
  // Equipment tags
  equipmentTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 14 },
  equipmentTag: { backgroundColor: '#1e1b4b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.primary },
  equipmentTagText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  // Footer
  footer: { alignItems: 'center', marginTop: 24, marginBottom: 8 },
  footerText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  footerSubtext: { fontSize: 12, color: Colors.border, marginTop: 4 }
});