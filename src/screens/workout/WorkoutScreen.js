import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import useUserStore from '../../state/useUserStore';
import useWorkoutStore from '../../state/useWorkoutStore';
import ExerciseCard from './components/ExerciseCard';
import RestTimer from './components/RestTimer';
import FeedbackButtons from './components/FeedbackButtons';
import Button from '../../components/ui/Button';
import {
  applyProgressionRule,
  processSessionFeedback,
  trackSessionVolume,
  saveWeeklySnapshot,
  findSafeSubstitute,
  applySubstitutionToWorkout
} from '../../engine';
import {
  scheduleSessionCompleteNotification
} from '../../utils/notificationService';

const SESSION_STATES = {
  NOT_STARTED: 'not_started',
  EXERCISING: 'exercising',
  RESTING: 'resting',
  FEEDBACK: 'feedback',
  COMPLETED: 'completed'
};

export default function WorkoutScreen() {
  const [sessionState, setSessionState] = useState(SESSION_STATES.NOT_STARTED);
  const [currentSet, setCurrentSet] = useState(1);

  // Stores
  const userProfile = useUserStore(state => state.userProfile);
  const activePlan = useWorkoutStore(state => state.activePlan);
  const todaysWorkout = useWorkoutStore(state => state.todaysWorkout);
  const exercises = useWorkoutStore(state => state.exercises);
  const currentExercise = useWorkoutStore(state => state.currentExercise);
  const currentExerciseIndex = useWorkoutStore(state => state.currentExerciseIndex);
  const sessionActive = useWorkoutStore(state => state.sessionActive);
  const completedExercises = useWorkoutStore(state => state.completedExercises);
  const loadActivePlan = useWorkoutStore(state => state.loadActivePlan);
  const loadTodaysWorkout = useWorkoutStore(state => state.loadTodaysWorkout);
  const startSession = useWorkoutStore(state => state.startSession);
  const nextExercise = useWorkoutStore(state => state.nextExercise);
  const submitFeedback = useWorkoutStore(state => state.submitFeedback);
  const skipExercise = useWorkoutStore(state => state.skipExercise);
  const completeSession = useWorkoutStore(state => state.completeSession);

  // Load data on mount
  useEffect(() => {
    if (userProfile?.id) {
      loadData();
    }
  }, [userProfile]);

  useEffect(() => {
    if (activePlan?.id) {
      loadTodaysWorkout(activePlan.id);
    }
  }, [activePlan?.id]);

  const loadData = async () => {
    if (!userProfile?.id) return;
    await loadActivePlan(userProfile.id);
  };

  // Start the session
  const handleStartSession = () => {
    startSession();
    setCurrentSet(1);
    setSessionState(SESSION_STATES.EXERCISING);
  };

  // Set completed — show feedback
  const handleSetComplete = () => {
    setSessionState(SESSION_STATES.FEEDBACK);
  };

  // Feedback submitted — start rest or next exercise
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      // Save feedback via store
      await submitFeedback({
        ...feedbackData,
        userId: userProfile.id
      });

      // Apply progression rule based on feedback
      if (currentExercise) {
        const currentPrescription = {
          sets: currentExercise.prescribed_sets,
          reps: currentExercise.prescribed_reps,
          restSeconds: currentExercise.prescribed_rest_seconds,
          difficulty: currentExercise.difficulty_level
        };

        const result = await applyProgressionRule(
          userProfile.id,
          currentExercise.id,
          currentExercise.exercise_id,
          currentExercise.exercise_name,
          feedbackData,
          currentPrescription,
          activePlan?.goal_id || 'general_fitness'
        );

        if (result.message) {
          console.log('🔄 Progression:', result.message);
        }

        // Handle pain — auto substitute
        if (feedbackData.pain_reported && activePlan) {
          const userEquipmentData = [];
          const userInjuriesData = [];

          const substitute = await findSafeSubstitute(
            currentExercise.exercise_id,
            'pain',
            userEquipmentData,
            userInjuriesData
          );

          if (substitute) {
            await applySubstitutionToWorkout(
              currentExercise.id,
              substitute
            );
            console.log('🔄 Pain substitute applied:', substitute.substituteName);
          }
        }
      }

      const totalSets = currentExercise?.prescribed_sets || 3;

      if (currentSet < totalSets) {
        setCurrentSet(prev => prev + 1);
        setSessionState(SESSION_STATES.RESTING);
      } else {
        handleNextExercise();
      }

    } catch (error) {
      console.error('❌ Feedback submit error:', error);
      handleNextExercise();
    }
  };
  // Rest complete — back to exercising
  const handleRestComplete = () => {
    setSessionState(SESSION_STATES.EXERCISING);
  };

  // Skip rest
  const handleSkipRest = () => {
    setSessionState(SESSION_STATES.EXERCISING);
  };

  // Next exercise
  const handleNextExercise = () => {
    const isLastExercise = currentExerciseIndex >= exercises.length - 1;

    if (isLastExercise) {
      setSessionState(SESSION_STATES.COMPLETED);
    } else {
      nextExercise();
      setCurrentSet(1);
      setSessionState(SESSION_STATES.EXERCISING);
    }
  };

  // Skip exercise
  const handleSkipExercise = () => {
    Alert.alert(
      'Skip Exercise',
      `Skip ${currentExercise?.exercise_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            await skipExercise();
            handleNextExercise();
          }
        }
      ]
    );
  };

  // Complete session
  const handleCompleteSession = async () => {
    try {
      await completeSession(userProfile.id);

      // Send completion notification
      await scheduleSessionCompleteNotification(
        completedExercises.length,
        Math.round(
          (new Date() - new Date(useWorkoutStore.getState().sessionStartTime)) / 60000
        )
      );

      // Track volume and personal records
      if (exercises.length > 0 && feedbackList.length > 0) {
        const volumeResult = await trackSessionVolume(
          userProfile.id,
          exercises,
          feedbackList
        );

        if (volumeResult.personalRecords?.length > 0) {
          console.log('🏆 Personal records this session:',
            volumeResult.personalRecords.map(pr => pr.exerciseName).join(', ')
          );
        }
      }

      // Save weekly snapshot
      if (activePlan?.id) {
        await saveWeeklySnapshot(userProfile.id, activePlan.id);
      }

      setSessionState(SESSION_STATES.NOT_STARTED);
      await loadData();

    } catch (error) {
      console.error('❌ Complete session error:', error);
      setSessionState(SESSION_STATES.NOT_STARTED);
    }
  };
  // ── NO PLAN STATE ─────────────────────────────────────────
  if (!activePlan) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No Workout Plan</Text>
          <Text style={styles.emptySubtitle}>
            Complete your profile setup to generate a personalized workout plan.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── NO WORKOUT TODAY ──────────────────────────────────────
  if (!todaysWorkout) {
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>
            {isWeekend ? '🏖️' : '😴'}
          </Text>
          <Text style={styles.emptyTitle}>
            {isWeekend ? 'Weekend Rest' : 'Rest Day'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isWeekend
              ? 'Enjoy your weekend! Your next workout starts Monday.'
              : 'Today is a rest day. Recovery is just as important as training!'}
          </Text>
          <View style={styles.restTips}>
            <Text style={styles.restTipsTitle}>
              {isWeekend ? '🏖️ Weekend Tips:' : '💤 Recovery Tips:'}
            </Text>
            {isWeekend ? (
              <>
                <Text style={styles.restTip}>• Enjoy light activity like walking 🚶</Text>
                <Text style={styles.restTip}>• Stay hydrated 💧</Text>
                <Text style={styles.restTip}>• Prep your meals for the week 🥗</Text>
                <Text style={styles.restTip}>• Get good sleep tonight 😴</Text>
                <Text style={styles.restTip}>• Review your progress 📊</Text>
              </>
            ) : (
              <>
                <Text style={styles.restTip}>• Stay hydrated 💧</Text>
                <Text style={styles.restTip}>• Get 7-9 hours of sleep 😴</Text>
                <Text style={styles.restTip}>• Light stretching or walk 🚶</Text>
                <Text style={styles.restTip}>• Eat nutritious food 🥗</Text>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── SESSION NOT STARTED ───────────────────────────────────
  if (sessionState === SESSION_STATES.NOT_STARTED) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>
              {todaysWorkout.day_name}
            </Text>
            <Text style={styles.sessionSubtitle}>
              {exercises.length} exercises • Ready to go?
            </Text>
          </View>

          {/* Exercise Preview List */}
          <Text style={styles.sectionTitle}>Today's Exercises</Text>
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exercisePreviewItem}>
              <View style={styles.exercisePreviewNumber}>
                <Text style={styles.exercisePreviewNumberText}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.exercisePreviewInfo}>
                <Text style={styles.exercisePreviewName}>
                  {exercise.exercise_name}
                </Text>
                <Text style={styles.exercisePreviewSets}>
                  {exercise.prescribed_sets} sets × {exercise.prescribed_reps} reps
                </Text>
              </View>
              <Text style={styles.exercisePreviewRest}>
                {exercise.prescribed_rest_seconds}s rest
              </Text>
            </View>
          ))}

          {/* Start Button */}
          <Button
            title="💪 Start Workout"
            onPress={handleStartSession}
            variant="primary"
            size="large"
            style={styles.startBtn}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SESSION COMPLETED ─────────────────────────────────────
  if (sessionState === SESSION_STATES.COMPLETED) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>Workout Complete!</Text>
          <Text style={styles.completedSubtitle}>
            Amazing work! You completed {completedExercises.length} exercises.
          </Text>

          <View style={styles.completedStats}>
            <View style={styles.completedStat}>
              <Text style={styles.completedStatValue}>
                {completedExercises.length}
              </Text>
              <Text style={styles.completedStatLabel}>Exercises</Text>
            </View>
            <View style={styles.completedStat}>
              <Text style={styles.completedStatValue}>
                {completedExercises.reduce(
                  (sum, ex) => sum + (ex.prescribed_sets || 0), 0
                )}
              </Text>
              <Text style={styles.completedStatLabel}>Total Sets</Text>
            </View>
          </View>

          <Button
            title="✅ Save & Finish"
            onPress={handleCompleteSession}
            variant="primary"
            size="large"
            style={styles.finishBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── ACTIVE SESSION ────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >

        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              {
                width: `${((currentExerciseIndex) / exercises.length) * 100}%`
              }
            ]} />
          </View>
          <TouchableOpacity
            style={styles.skipExerciseBtn}
            onPress={handleSkipExercise}
          >
            <Text style={styles.skipExerciseBtnText}>Skip ⏭️</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Card */}
        {sessionState === SESSION_STATES.EXERCISING && currentExercise && (
          <>
            <ExerciseCard
              exercise={currentExercise}
              currentSet={currentSet}
              totalSets={currentExercise.prescribed_sets || 3}
              isResting={false}
              onShowAnimation={() => {}}
            />

            {/* Done Set Button */}
            <Button
              title={`✅ Done Set ${currentSet}`}
              onPress={handleSetComplete}
              variant="success"
              size="large"
              style={styles.doneSetBtn}
            />
          </>
        )}

        {/* Rest Timer */}
        {sessionState === SESSION_STATES.RESTING && (
          <RestTimer
            duration={currentExercise?.prescribed_rest_seconds || 60}
            onComplete={handleRestComplete}
            onSkip={handleSkipRest}
          />
        )}

        {/* Feedback */}
        {sessionState === SESSION_STATES.FEEDBACK && currentExercise && (
          <FeedbackButtons
            exerciseName={currentExercise.exercise_name}
            prescribedReps={currentExercise.prescribed_reps}
            prescribedSets={currentExercise.prescribed_sets}
            onSubmit={handleFeedbackSubmit}
          />
        )}

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
    padding: 20,
    paddingBottom: 40
  },
  // Empty states
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22
  },
  restTips: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border
  },
  restTipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  restTip: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8
  },
  // Session header
  sessionHeader: {
    marginBottom: 24
  },
  sessionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  sessionSubtitle: {
    fontSize: 15,
    color: Colors.textMuted
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  // Exercise preview
  exercisePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12
  },
  exercisePreviewNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  exercisePreviewNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  exercisePreviewInfo: {
    flex: 1
  },
  exercisePreviewName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  exercisePreviewSets: {
    fontSize: 13,
    color: Colors.textMuted
  },
  exercisePreviewRest: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600'
  },
  startBtn: {
    marginTop: 20
  },
  // Progress header
  progressHeader: {
    marginBottom: 20
  },
  progressText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 8
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3
  },
  skipExerciseBtn: {
    alignSelf: 'flex-end'
  },
  skipExerciseBtnText: {
    fontSize: 13,
    color: Colors.textMuted
  },
  // Buttons
  doneSetBtn: {
    marginTop: 16
  },
  // Completed
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  completedEmoji: {
    fontSize: 80,
    marginBottom: 16
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center'
  },
  completedSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24
  },
  completedStats: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 32
  },
  completedStat: {
    alignItems: 'center'
  },
  completedStatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4
  },
  completedStatLabel: {
    fontSize: 14,
    color: Colors.textMuted
  },
  finishBtn: {
    width: '100%'
  }
});