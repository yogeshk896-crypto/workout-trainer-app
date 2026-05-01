import { getDatabase } from '../database/database';

// ─── Analyze Exercise Feedback History ───────────────────────────────────────
export async function analyzeExerciseFeedback(userId, exerciseId) {
  try {
    const db = await getDatabase();

    // Get last 5 feedback entries for this exercise
    const feedbackHistory = await db.getAllAsync(
      `SELECT ef.*, we.prescribed_sets, we.prescribed_reps,
              we.prescribed_rest_seconds, we.difficulty_level
       FROM exercise_feedback ef
       JOIN workout_exercise we ON ef.workout_exercise_id = we.id
       WHERE ef.user_id = ? AND we.exercise_id = ?
       ORDER BY ef.recorded_at DESC
       LIMIT 5`,
      [userId, exerciseId]
    );

    if (!feedbackHistory || feedbackHistory.length === 0) {
      return {
        exerciseId,
        hasHistory: false,
        recommendation: 'maintain',
        confidence: 0
      };
    }

    // Count feedback types
    const counts = { easy: 0, normal: 0, hard: 0 };
    let painReported = false;
    let incompleteSessions = 0;

    feedbackHistory.forEach(fb => {
      counts[fb.difficulty_rating] = (counts[fb.difficulty_rating] || 0) + 1;
      if (fb.pain_reported) painReported = true;
      if (!fb.completed_as_prescribed) incompleteSessions++;
    });

    const total = feedbackHistory.length;
    const recentTwo = feedbackHistory.slice(0, 2);
    const consecutiveEasy = recentTwo.every(fb => fb.difficulty_rating === 'easy');
    const consecutiveHard = recentTwo.every(fb => fb.difficulty_rating === 'hard');
    const consecutiveIncomplete = recentTwo.every(fb => !fb.completed_as_prescribed);

    // Determine recommendation
    let recommendation = 'maintain';
    let reason = 'Performance is stable';

    if (painReported) {
      recommendation = 'substitute';
      reason = 'Pain reported — switching to safer alternative';
    } else if (consecutiveIncomplete && consecutiveHard) {
      recommendation = 'regress';
      reason = 'Exercise too difficult — reducing difficulty';
    } else if (consecutiveHard) {
      recommendation = 'reduce_reps';
      reason = 'Exercise is hard — reducing reps slightly';
    } else if (consecutiveEasy && incompleteSessions === 0) {
      recommendation = 'progress';
      reason = 'Exercise is easy — increasing difficulty';
    } else if (counts.easy >= 3 && total >= 3) {
      recommendation = 'progress';
      reason = 'Consistently easy — time to progress';
    } else if (counts.hard >= 3 && incompleteSessions >= 2) {
      recommendation = 'regress';
      reason = 'Consistently hard — reducing difficulty';
    }

    return {
      exerciseId,
      hasHistory: true,
      totalSessions: total,
      counts,
      consecutiveEasy,
      consecutiveHard,
      painReported,
      incompleteSessions,
      recommendation,
      reason,
      confidence: Math.min(total / 3, 1),
      lastFeedback: feedbackHistory[0]
    };

  } catch (error) {
    console.error('❌ Feedback analysis failed:', error);
    return {
      exerciseId,
      hasHistory: false,
      recommendation: 'maintain',
      confidence: 0
    };
  }
}

// ─── Analyze Full Session Feedback ───────────────────────────────────────────
export async function analyzeSessionFeedback(sessionLogId) {
  try {
    const db = await getDatabase();

    const feedbacks = await db.getAllAsync(
      `SELECT ef.*, we.exercise_id, we.exercise_name
       FROM exercise_feedback ef
       JOIN workout_exercise we ON ef.workout_exercise_id = we.id
       JOIN workout_day wd ON we.workout_day_id = wd.id
       JOIN session_log sl ON sl.workout_day_id = wd.id
       WHERE sl.id = ?`,
      [sessionLogId]
    );

    if (!feedbacks || feedbacks.length === 0) {
      return null;
    }

    const counts = { easy: 0, normal: 0, hard: 0 };
    let painCount = 0;
    let incompleteCount = 0;

    feedbacks.forEach(fb => {
      counts[fb.difficulty_rating] = (counts[fb.difficulty_rating] || 0) + 1;
      if (fb.pain_reported) painCount++;
      if (!fb.completed_as_prescribed) incompleteCount++;
    });

    const total = feedbacks.length;
    const dominantDifficulty = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      sessionLogId,
      totalExercises: total,
      counts,
      dominantDifficulty,
      painCount,
      incompleteCount,
      completionRate: total > 0
        ? Math.round(((total - incompleteCount) / total) * 100)
        : 0,
      overallRating: dominantDifficulty
    };

  } catch (error) {
    console.error('❌ Session analysis failed:', error);
    return null;
  }
}

// ─── Get Exercise Progression State ──────────────────────────────────────────
export async function getExerciseProgressionState(userId, exerciseId) {
  try {
    const db = await getDatabase();

    const progression = await db.getFirstAsync(
      `SELECT * FROM exercise_progression
       WHERE user_id = ? AND exercise_id = ?`,
      [userId, exerciseId]
    );

    return progression || null;

  } catch (error) {
    console.error('❌ Failed to get progression state:', error);
    return null;
  }
}

// ─── Update Exercise Progression State ───────────────────────────────────────
export async function updateExerciseProgressionState(
  userId,
  exerciseId,
  exerciseName,
  feedbackData,
  currentPrescription
) {
  try {
    const db = await getDatabase();

    const existing = await db.getFirstAsync(
      `SELECT * FROM exercise_progression
       WHERE user_id = ? AND exercise_id = ?`,
      [userId, exerciseId]
    );

    const isEasy = feedbackData.difficulty_rating === 'easy';
    const isHard = feedbackData.difficulty_rating === 'hard';
    const isCompleted = feedbackData.completed_as_prescribed;
    const hasPain = feedbackData.pain_reported;

    if (existing) {
      // Update existing progression
      const newEasyCount = isEasy
        ? existing.consecutive_easy_sessions + 1
        : 0;
      const newHardCount = isHard
        ? existing.consecutive_hard_sessions + 1
        : 0;

      await db.runAsync(
        `UPDATE exercise_progression SET
          consecutive_easy_sessions = ?,
          consecutive_hard_sessions = ?,
          total_sessions_completed = total_sessions_completed + 1,
          pain_flag = ?,
          updated_at = datetime('now')
        WHERE user_id = ? AND exercise_id = ?`,
        [
          newEasyCount,
          newHardCount,
          hasPain ? 1 : 0,
          userId,
          exerciseId
        ]
      );
    } else {
      // Create new progression record
      await db.runAsync(
        `INSERT INTO exercise_progression (
          user_id, exercise_id, exercise_name,
          current_sets, current_reps, current_difficulty,
          consecutive_easy_sessions, consecutive_hard_sessions,
          total_sessions_completed, pain_flag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          userId,
          exerciseId,
          exerciseName,
          currentPrescription.sets || 3,
          currentPrescription.reps?.toString() || '10',
          currentPrescription.difficulty || 'beginner',
          isEasy ? 1 : 0,
          isHard ? 1 : 0,
          hasPain ? 1 : 0
        ]
      );
    }

    console.log(`✅ Progression updated for: ${exerciseName}`);

  } catch (error) {
    console.error('❌ Failed to update progression:', error);
  }
}