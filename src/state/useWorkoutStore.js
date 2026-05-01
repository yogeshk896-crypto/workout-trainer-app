import { create } from 'zustand';
import { getDatabase } from '../database/database';

const useWorkoutStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────
  activePlan: null,
  todaysWorkout: null,
  currentExercise: null,
  currentExerciseIndex: 0,
  sessionActive: false,
  sessionStartTime: null,
  exercises: [],
  completedExercises: [],
  skippedExercises: [],
  feedbackList: [],
  isLoading: false,
  error: null,

  // ─── Load Active Plan ─────────────────────────────────────
  loadActivePlan: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();

      const plan = await db.getFirstAsync(
        `SELECT * FROM workout_plan
        WHERE user_id = ? AND is_active = 1
        ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      if (!plan) {
        set({ activePlan: null, isLoading: false });
        console.log('ℹ️ No active plan found');
        return;
      }

      set({ activePlan: plan, isLoading: false });
      console.log('✅ Active plan loaded:', plan.plan_name);

    } catch (error) {
      console.error('❌ Failed to load active plan:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ─── Load Today's Workout ─────────────────────────────────
  loadTodaysWorkout: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();

      const today = new Date().toISOString().split('T')[0];

      // Find today's workout day
      const workoutDay = await db.getFirstAsync(
        `SELECT * FROM workout_day
        WHERE plan_id = ?
        AND scheduled_date = ?
        AND is_rest_day = 0
        AND is_completed = 0
        ORDER BY day_number ASC LIMIT 1`,
        [planId, today]
      );

      if (!workoutDay) {
        set({ todaysWorkout: null, exercises: [], isLoading: false });
        console.log('ℹ️ No workout scheduled for today');
        return;
      }

      // Load exercises for today
      const exercises = await db.getAllAsync(
        `SELECT * FROM workout_exercise
        WHERE workout_day_id = ?
        ORDER BY order_index ASC`,
        [workoutDay.id]
      );

      set({
        todaysWorkout: workoutDay,
        exercises: exercises || [],
        currentExerciseIndex: 0,
        currentExercise: exercises?.[0] || null,
        isLoading: false
      });

      console.log('✅ Today workout loaded:', exercises?.length, 'exercises');

    } catch (error) {
      console.error('❌ Failed to load today workout:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ─── Start Session ────────────────────────────────────────
  startSession: () => {
    set({
      sessionActive: true,
      sessionStartTime: new Date().toISOString(),
      completedExercises: [],
      skippedExercises: [],
      feedbackList: [],
      currentExerciseIndex: 0
    });
    console.log('✅ Session started');
  },

  // ─── Move to Next Exercise ────────────────────────────────
  nextExercise: () => {
    const { exercises, currentExerciseIndex } = get();
    const nextIndex = currentExerciseIndex + 1;

    if (nextIndex < exercises.length) {
      set({
        currentExerciseIndex: nextIndex,
        currentExercise: exercises[nextIndex]
      });
      console.log('➡️ Next exercise:', exercises[nextIndex]?.exercise_name);
    } else {
      console.log('🏁 All exercises completed');
      set({ currentExercise: null });
    }
  },

  // ─── Move to Previous Exercise ────────────────────────────
  previousExercise: () => {
    const { exercises, currentExerciseIndex } = get();
    const prevIndex = currentExerciseIndex - 1;

    if (prevIndex >= 0) {
      set({
        currentExerciseIndex: prevIndex,
        currentExercise: exercises[prevIndex]
      });
    }
  },

  // ─── Submit Exercise Feedback ─────────────────────────────
  submitFeedback: async (feedbackData) => {
    try {
      const db = await getDatabase();
      const { currentExercise, feedbackList } = get();

      if (!currentExercise) return;

      // Save feedback to database
      await db.runAsync(
        `INSERT INTO exercise_feedback (
          workout_exercise_id,
          user_id,
          difficulty_rating,
          completed_as_prescribed,
          actual_sets_completed,
          actual_reps_completed,
          pain_reported,
          pain_location,
          pain_severity,
          form_rating,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          currentExercise.id,
          feedbackData.userId,
          feedbackData.difficulty_rating,
          feedbackData.completed_as_prescribed ? 1 : 0,
          feedbackData.actual_sets_completed,
          feedbackData.actual_reps_completed,
          feedbackData.pain_reported ? 1 : 0,
          feedbackData.pain_location || null,
          feedbackData.pain_severity || null,
          feedbackData.form_rating || 'good',
          feedbackData.notes || null
        ]
      );

      // Update exercise as completed
      await db.runAsync(
        `UPDATE workout_exercise SET is_completed = 1 WHERE id = ?`,
        [currentExercise.id]
      );

      // Add to completed list
      const updatedFeedback = [...feedbackList, {
        exerciseId: currentExercise.id,
        exerciseName: currentExercise.exercise_name,
        ...feedbackData
      }];

      const updatedCompleted = [...get().completedExercises, currentExercise];

      set({
        feedbackList: updatedFeedback,
        completedExercises: updatedCompleted
      });

      console.log('✅ Feedback saved for:', currentExercise.exercise_name);

    } catch (error) {
      console.error('❌ Failed to save feedback:', error);
      set({ error: error.message });
    }
  },

  // ─── Skip Exercise ────────────────────────────────────────
  skipExercise: async () => {
    try {
      const db = await getDatabase();
      const { currentExercise, skippedExercises } = get();

      if (!currentExercise) return;

      await db.runAsync(
        `UPDATE workout_exercise SET is_skipped = 1 WHERE id = ?`,
        [currentExercise.id]
      );

      set({
        skippedExercises: [...skippedExercises, currentExercise]
      });

      console.log('⏭️ Exercise skipped:', currentExercise.exercise_name);

    } catch (error) {
      console.error('❌ Failed to skip exercise:', error);
    }
  },

  // ─── Complete Session ─────────────────────────────────────
  completeSession: async (userId) => {
    try {
      const db = await getDatabase();
      const {
        todaysWorkout,
        activePlan,
        sessionStartTime,
        completedExercises,
        skippedExercises
      } = get();

      if (!todaysWorkout || !activePlan) return;

      const completedAt = new Date().toISOString();
      const startTime = new Date(sessionStartTime);
      const endTime = new Date(completedAt);
      const durationMinutes = Math.round(
        (endTime - startTime) / 60000
      );

      // Log the session
      await db.runAsync(
        `INSERT INTO session_log (
          user_id,
          workout_day_id,
          plan_id,
          started_at,
          completed_at,
          duration_minutes,
          total_exercises,
          exercises_completed,
          exercises_skipped
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          todaysWorkout.id,
          activePlan.id,
          sessionStartTime,
          completedAt,
          durationMinutes,
          completedExercises.length + skippedExercises.length,
          completedExercises.length,
          skippedExercises.length
        ]
      );

      // Mark workout day as completed
      await db.runAsync(
        `UPDATE workout_day SET
          is_completed = 1,
          completed_at = ?
        WHERE id = ?`,
        [completedAt, todaysWorkout.id]
      );

      set({
        sessionActive: false,
        sessionStartTime: null
      });

      console.log('🎉 Session completed! Duration:', durationMinutes, 'minutes');

    } catch (error) {
      console.error('❌ Failed to complete session:', error);
      set({ error: error.message });
    }
  },

  // ─── Clear Workout State ──────────────────────────────────
  clearWorkoutState: () => {
    set({
      activePlan: null,
      todaysWorkout: null,
      currentExercise: null,
      currentExerciseIndex: 0,
      sessionActive: false,
      sessionStartTime: null,
      exercises: [],
      completedExercises: [],
      skippedExercises: [],
      feedbackList: [],
      isLoading: false,
      error: null
    });
  }
}));

export default useWorkoutStore;