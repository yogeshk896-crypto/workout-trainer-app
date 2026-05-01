import { create } from 'zustand';
import { getDatabase } from '../database/database';

const useProgressStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────
  progressSnapshots: [],
  sessionLogs: [],
  exerciseProgressions: [],
  weeklyStats: null,
  overallStats: null,
  isLoading: false,
  error: null,

  // ─── Load Progress Snapshots ──────────────────────────────
  loadProgressSnapshots: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();

      const snapshots = await db.getAllAsync(
        `SELECT * FROM progress_snapshot
        WHERE user_id = ?
        ORDER BY week_number DESC
        LIMIT 12`,
        [userId]
      );

      set({
        progressSnapshots: snapshots || [],
        isLoading: false
      });

      console.log('✅ Progress snapshots loaded:', snapshots?.length);

    } catch (error) {
      console.error('❌ Failed to load progress snapshots:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ─── Load Session Logs ────────────────────────────────────
  loadSessionLogs: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();

      const logs = await db.getAllAsync(
        `SELECT * FROM session_log
        WHERE user_id = ?
        ORDER BY started_at DESC
        LIMIT 30`,
        [userId]
      );

      set({
        sessionLogs: logs || [],
        isLoading: false
      });

      console.log('✅ Session logs loaded:', logs?.length);

    } catch (error) {
      console.error('❌ Failed to load session logs:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ─── Load Exercise Progressions ───────────────────────────
  loadExerciseProgressions: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();

      const progressions = await db.getAllAsync(
        `SELECT * FROM exercise_progression
        WHERE user_id = ?
        ORDER BY updated_at DESC`,
        [userId]
      );

      set({
        exerciseProgressions: progressions || [],
        isLoading: false
      });

      console.log('✅ Exercise progressions loaded:', progressions?.length);

    } catch (error) {
      console.error('❌ Failed to load exercise progressions:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ─── Calculate Weekly Stats ───────────────────────────────
  calculateWeeklyStats: async (userId) => {
    try {
      const db = await getDatabase();

      // Get current week dates
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const startStr = startOfWeek.toISOString();
      const endStr = endOfWeek.toISOString();

      // Get sessions this week
      const weeklySessions = await db.getAllAsync(
        `SELECT * FROM session_log
        WHERE user_id = ?
        AND started_at BETWEEN ? AND ?`,
        [userId, startStr, endStr]
      );

      // Get feedback this week
      const weeklyFeedback = await db.getAllAsync(
        `SELECT ef.difficulty_rating, COUNT(*) as count
        FROM exercise_feedback ef
        WHERE ef.user_id = ?
        AND ef.recorded_at BETWEEN ? AND ?
        GROUP BY ef.difficulty_rating`,
        [userId, startStr, endStr]
      );

      // Calculate stats
      const totalSessions = weeklySessions?.length || 0;
      const totalDuration = weeklySessions?.reduce(
        (sum, s) => sum + (s.duration_minutes || 0), 0
      ) || 0;
      const totalExercises = weeklySessions?.reduce(
        (sum, s) => sum + (s.exercises_completed || 0), 0
      ) || 0;

      let easyCount = 0;
      let normalCount = 0;
      let hardCount = 0;

      weeklyFeedback?.forEach(f => {
        if (f.difficulty_rating === 'easy') easyCount = f.count;
        if (f.difficulty_rating === 'normal') normalCount = f.count;
        if (f.difficulty_rating === 'hard') hardCount = f.count;
      });

      const weeklyStats = {
        totalSessions,
        totalDuration,
        totalExercises,
        easyCount,
        normalCount,
        hardCount,
        averageSessionDuration: totalSessions > 0
          ? Math.round(totalDuration / totalSessions)
          : 0
      };

      set({ weeklyStats });
      console.log('✅ Weekly stats calculated:', weeklyStats);

    } catch (error) {
      console.error('❌ Failed to calculate weekly stats:', error);
      set({ error: error.message });
    }
  },

  // ─── Calculate Overall Stats ──────────────────────────────
  calculateOverallStats: async (userId) => {
    try {
      const db = await getDatabase();

      // Total sessions ever
      const totalSessionsResult = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM session_log WHERE user_id = ?`,
        [userId]
      );

      // Total exercises ever
      const totalExercisesResult = await db.getFirstAsync(
        `SELECT SUM(exercises_completed) as total
        FROM session_log WHERE user_id = ?`,
        [userId]
      );

      // Total duration ever
      const totalDurationResult = await db.getFirstAsync(
        `SELECT SUM(duration_minutes) as total
        FROM session_log WHERE user_id = ?`,
        [userId]
      );

      // Feedback breakdown
      const feedbackResult = await db.getAllAsync(
        `SELECT difficulty_rating, COUNT(*) as count
        FROM exercise_feedback
        WHERE user_id = ?
        GROUP BY difficulty_rating`,
        [userId]
      );

      // Streak calculation
      const recentSessions = await db.getAllAsync(
        `SELECT DATE(started_at) as session_date
        FROM session_log
        WHERE user_id = ?
        ORDER BY started_at DESC
        LIMIT 30`,
        [userId]
      );

      let currentStreak = 0;
      if (recentSessions?.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        let checkDate = today;
        for (const session of recentSessions) {
          if (session.session_date === checkDate) {
            currentStreak++;
            const d = new Date(checkDate);
            d.setDate(d.getDate() - 1);
            checkDate = d.toISOString().split('T')[0];
          } else {
            break;
          }
        }
      }

      let easyCount = 0;
      let normalCount = 0;
      let hardCount = 0;

      feedbackResult?.forEach(f => {
        if (f.difficulty_rating === 'easy') easyCount = f.count;
        if (f.difficulty_rating === 'normal') normalCount = f.count;
        if (f.difficulty_rating === 'hard') hardCount = f.count;
      });

      const overallStats = {
        totalSessions: totalSessionsResult?.count || 0,
        totalExercises: totalExercisesResult?.total || 0,
        totalMinutes: totalDurationResult?.total || 0,
        totalHours: Math.round((totalDurationResult?.total || 0) / 60),
        currentStreak,
        easyCount,
        normalCount,
        hardCount
      };

      set({ overallStats });
      console.log('✅ Overall stats calculated:', overallStats);

    } catch (error) {
      console.error('❌ Failed to calculate overall stats:', error);
      set({ error: error.message });
    }
  },

  // ─── Save Progress Snapshot ───────────────────────────────
  saveProgressSnapshot: async (userId, planId, weekNumber) => {
    try {
      const db = await getDatabase();
      const { weeklyStats } = get();

      if (!weeklyStats) return;

      const adherence = weeklyStats.totalSessions > 0
        ? Math.round((weeklyStats.totalSessions / 3) * 100)
        : 0;

      await db.runAsync(
        `INSERT OR REPLACE INTO progress_snapshot (
          user_id,
          week_number,
          plan_id,
          workouts_completed,
          total_exercises_completed,
          easy_feedback_count,
          normal_feedback_count,
          hard_feedback_count,
          adherence_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          weekNumber,
          planId,
          weeklyStats.totalSessions,
          weeklyStats.totalExercises,
          weeklyStats.easyCount,
          weeklyStats.normalCount,
          weeklyStats.hardCount,
          adherence
        ]
      );

      console.log('✅ Progress snapshot saved for week:', weekNumber);

    } catch (error) {
      console.error('❌ Failed to save progress snapshot:', error);
      set({ error: error.message });
    }
  },

  // ─── Clear Progress State ─────────────────────────────────
  clearProgressState: () => {
    set({
      progressSnapshots: [],
      sessionLogs: [],
      exerciseProgressions: [],
      weeklyStats: null,
      overallStats: null,
      isLoading: false,
      error: null
    });
  }
}));

export default useProgressStore;