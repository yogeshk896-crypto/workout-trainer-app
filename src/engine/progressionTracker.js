import { getDatabase } from '../database/database';
import { analyzeExerciseFeedback } from './feedbackAnalyzer';
import { getWeeklyProgressionSummary, checkDeloadNeeded } from './progressionEngine';

// ─── Track Personal Record ────────────────────────────────────────────────────
export async function checkAndSavePersonalRecord(
  userId,
  exerciseId,
  exerciseName,
  recordType,
  recordValue
) {
  try {
    const db = await getDatabase();

    // Get existing record
    const existing = await db.getFirstAsync(
      `SELECT * FROM personal_records
       WHERE user_id = ? AND exercise_id = ? AND record_type = ?
       ORDER BY record_value DESC LIMIT 1`,
      [userId, exerciseId, recordType]
    );

    if (!existing || recordValue > existing.record_value) {
      // New personal record!
      await db.runAsync(
        `INSERT INTO personal_records (
          user_id, exercise_id, exercise_name,
          record_type, record_value, previous_value
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          exerciseId,
          exerciseName,
          recordType,
          recordValue,
          existing?.record_value || null
        ]
      );

      console.log(`🏆 New Personal Record! ${exerciseName}: ${recordValue}`);

      return {
        isNewRecord: true,
        recordType,
        newValue: recordValue,
        previousValue: existing?.record_value || null,
        improvement: existing
          ? recordValue - existing.record_value
          : recordValue
      };
    }

    return { isNewRecord: false };

  } catch (error) {
    console.error('❌ Failed to check personal record:', error);
    return { isNewRecord: false };
  }
}

// ─── Get Personal Records ─────────────────────────────────────────────────────
export async function getPersonalRecords(userId) {
  try {
    const db = await getDatabase();

    const records = await db.getAllAsync(
      `SELECT * FROM personal_records
       WHERE user_id = ?
       ORDER BY achieved_at DESC`,
      [userId]
    );

    return records || [];

  } catch (error) {
    console.error('❌ Failed to get personal records:', error);
    return [];
  }
}

// ─── Calculate Volume Load ────────────────────────────────────────────────────
export function calculateVolumeLoad(sets, reps, weightKg = 0) {
  const repsNum = parseInt(reps) || 0;
  if (weightKg > 0) {
    return sets * repsNum * weightKg;
  }
  // Bodyweight estimation using body weight proxy
  return sets * repsNum;
}

// ─── Track Session Volume ─────────────────────────────────────────────────────
export async function trackSessionVolume(
  userId,
  sessionExercises,
  feedbackList
) {
  try {
    const volumeData = [];
    const personalRecords = [];

    for (const exercise of sessionExercises) {
      const feedback = feedbackList.find(
        fb => fb.workout_exercise_id === exercise.id
      );

      const actualSets = feedback?.actual_sets_completed ||
        exercise.prescribed_sets;
      const actualReps = feedback?.actual_reps_completed ||
        exercise.prescribed_reps;

      const volume = calculateVolumeLoad(
        actualSets,
        actualReps,
        0 // bodyweight for now
      );

      volumeData.push({
        exerciseId: exercise.exercise_id,
        exerciseName: exercise.exercise_name,
        sets: actualSets,
        reps: actualReps,
        volume
      });

      // Check for rep personal record
      if (feedback?.completed_as_prescribed) {
        const repsNum = parseInt(actualReps) || 0;
        const prResult = await checkAndSavePersonalRecord(
          userId,
          exercise.exercise_id,
          exercise.exercise_name,
          'max_reps',
          repsNum * actualSets
        );

        if (prResult.isNewRecord) {
          personalRecords.push({
            exerciseName: exercise.exercise_name,
            ...prResult
          });
        }
      }
    }

    const totalVolume = volumeData.reduce(
      (sum, ex) => sum + ex.volume, 0
    );

    console.log(`✅ Session volume tracked: ${totalVolume} total reps`);

    return {
      exercises: volumeData,
      totalVolume,
      personalRecords
    };

  } catch (error) {
    console.error('❌ Volume tracking failed:', error);
    return { exercises: [], totalVolume: 0, personalRecords: [] };
  }
}

// ─── Generate Progress Report ─────────────────────────────────────────────────
export async function generateProgressReport(userId) {
  try {
    const db = await getDatabase();

    // Get overall stats
    const totalSessions = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM session_log WHERE user_id = ?`,
      [userId]
    );

    const totalExercises = await db.getFirstAsync(
      `SELECT SUM(exercises_completed) as total
       FROM session_log WHERE user_id = ?`,
      [userId]
    );

    const totalMinutes = await db.getFirstAsync(
      `SELECT SUM(duration_minutes) as total
       FROM session_log WHERE user_id = ?`,
      [userId]
    );

    // Get weekly breakdown
    const weeklyData = await db.getAllAsync(
      `SELECT
        strftime('%W', started_at) as week,
        COUNT(*) as sessions,
        SUM(duration_minutes) as minutes,
        SUM(exercises_completed) as exercises
       FROM session_log
       WHERE user_id = ?
       GROUP BY strftime('%W', started_at)
       ORDER BY week DESC
       LIMIT 8`,
      [userId]
    );

    // Get feedback trend
    const feedbackTrend = await db.getAllAsync(
      `SELECT
        difficulty_rating,
        COUNT(*) as count,
        strftime('%W', recorded_at) as week
       FROM exercise_feedback
       WHERE user_id = ?
       GROUP BY difficulty_rating, strftime('%W', recorded_at)
       ORDER BY week DESC
       LIMIT 24`,
      [userId]
    );

    // Get progression summary
    const progressionSummary = await getWeeklyProgressionSummary(userId);

    // Check deload
    const deloadCheck = await checkDeloadNeeded(userId);

    // Get personal records
    const records = await getPersonalRecords(userId);

    // Calculate adherence
    const planData = await db.getFirstAsync(
      `SELECT
        COUNT(*) as total_days,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_days
       FROM workout_day wd
       JOIN workout_plan wp ON wd.plan_id = wp.id
       WHERE wp.user_id = ? AND wp.is_active = 1
       AND wd.is_rest_day = 0`,
      [userId]
    );

    const adherence = planData?.total_days > 0
      ? Math.round((planData.completed_days / planData.total_days) * 100)
      : 0;

    const report = {
      overview: {
        totalSessions: totalSessions?.count || 0,
        totalExercises: totalExercises?.total || 0,
        totalMinutes: totalMinutes?.total || 0,
        totalHours: Math.round((totalMinutes?.total || 0) / 60),
        adherencePercentage: adherence
      },
      weeklyData: weeklyData || [],
      feedbackTrend: feedbackTrend || [],
      progression: progressionSummary,
      deloadRecommendation: deloadCheck,
      personalRecords: records,
      generatedAt: new Date().toISOString()
    };

    console.log('✅ Progress report generated');
    return report;

  } catch (error) {
    console.error('❌ Progress report failed:', error);
    return null;
  }
}

// ─── Get Muscle Group Volume ──────────────────────────────────────────────────
export async function getMuscleGroupVolume(userId, weeks = 4) {
  try {
    const db = await getDatabase();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));
    const startStr = startDate.toISOString();

    const completedExercises = await db.getAllAsync(
      `SELECT we.exercise_id, we.exercise_name,
              we.prescribed_sets, we.prescribed_reps
       FROM workout_exercise we
       JOIN workout_day wd ON we.workout_day_id = wd.id
       JOIN workout_plan wp ON wd.plan_id = wp.id
       WHERE wp.user_id = ?
       AND wd.is_completed = 1
       AND wd.completed_at > ?
       AND we.is_completed = 1`,
      [userId, startStr]
    );

    // Group by muscle using exercise reference
    const muscleVolume = {};

    for (const exercise of completedExercises) {
      const exerciseData = await db.getFirstAsync(
        `SELECT primary_muscles FROM ref_exercises WHERE id = ?`,
        [exercise.exercise_id]
      );

      if (!exerciseData) continue;

      const muscles = JSON.parse(exerciseData.primary_muscles || '[]');
      const sets = parseInt(exercise.prescribed_sets) || 0;

      muscles.forEach(muscle => {
        muscleVolume[muscle] = (muscleVolume[muscle] || 0) + sets;
      });
    }

    return muscleVolume;

  } catch (error) {
    console.error('❌ Failed to get muscle volume:', error);
    return {};
  }
}

// ─── Get Strength Trend ───────────────────────────────────────────────────────
export async function getStrengthTrend(userId, exerciseId) {
  try {
    const db = await getDatabase();

    const history = await db.getAllAsync(
      `SELECT
        ep.current_reps,
        ep.current_sets,
        ep.current_weight_kg,
        ep.updated_at,
        ep.total_sessions_completed
       FROM exercise_progression ep
       WHERE ep.user_id = ? AND ep.exercise_id = ?
       ORDER BY ep.updated_at DESC
       LIMIT 12`,
      [userId, exerciseId]
    );

    return history || [];

  } catch (error) {
    console.error('❌ Failed to get strength trend:', error);
    return [];
  }
}

// ─── Save Weekly Snapshot ─────────────────────────────────────────────────────
export async function saveWeeklySnapshot(userId, planId) {
  try {
    const db = await getDatabase();

    // Get current week number
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
    );

    // Check if snapshot exists for this week
    const existing = await db.getFirstAsync(
      `SELECT id FROM progress_snapshot
       WHERE user_id = ? AND week_number = ?`,
      [userId, weekNumber]
    );

    if (existing) {
      console.log('ℹ️ Snapshot already exists for week:', weekNumber);
      return;
    }

    // Calculate this week's stats
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startStr = startOfWeek.toISOString();

    const weekSessions = await db.getAllAsync(
      `SELECT * FROM session_log
       WHERE user_id = ? AND started_at > ?`,
      [userId, startStr]
    );

    const weekFeedback = await db.getAllAsync(
      `SELECT difficulty_rating, COUNT(*) as count
       FROM exercise_feedback
       WHERE user_id = ? AND recorded_at > ?
       GROUP BY difficulty_rating`,
      [userId, startStr]
    );

    let easyCount = 0;
    let normalCount = 0;
    let hardCount = 0;

    weekFeedback.forEach(fb => {
      if (fb.difficulty_rating === 'easy') easyCount = fb.count;
      if (fb.difficulty_rating === 'normal') normalCount = fb.count;
      if (fb.difficulty_rating === 'hard') hardCount = fb.count;
    });

    const workoutsCompleted = weekSessions.length;
    const totalExercises = weekSessions.reduce(
      (sum, s) => sum + (s.exercises_completed || 0), 0
    );
    const totalSets = weekSessions.reduce(
      (sum, s) => sum + (s.exercises_completed || 0) * 3, 0
    );

    // Get scheduled workouts this week
    const scheduledCount = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM workout_day wd
       JOIN workout_plan wp ON wd.plan_id = wp.id
       WHERE wp.user_id = ?
       AND wd.scheduled_date >= ?
       AND wd.is_rest_day = 0`,
      [userId, startStr.split('T')[0]]
    );

    const adherence = scheduledCount?.count > 0
      ? Math.round((workoutsCompleted / scheduledCount.count) * 100)
      : 0;

    // Determine difficulty trend
    const totalFeedback = easyCount + normalCount + hardCount;
    let difficultyTrend = 'stable';

    if (totalFeedback > 0) {
      const easyPct = (easyCount / totalFeedback) * 100;
      const hardPct = (hardCount / totalFeedback) * 100;

      if (easyPct > 50) difficultyTrend = 'improving';
      else if (hardPct > 50) difficultyTrend = 'declining';
      else difficultyTrend = 'stable';
    }

    // Get current weight
    const currentProfile = await db.getFirstAsync(
      `SELECT weight_kg FROM user_profile WHERE id = ?`,
      [userId]
    );

    // Save snapshot
    await db.runAsync(
      `INSERT INTO progress_snapshot (
        user_id, week_number, plan_id,
        workouts_completed, workouts_scheduled,
        total_exercises_completed, total_sets_completed,
        easy_feedback_count, normal_feedback_count, hard_feedback_count,
        adherence_percentage, difficulty_trend, weight_kg
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        weekNumber,
        planId,
        workoutsCompleted,
        scheduledCount?.count || 0,
        totalExercises,
        totalSets,
        easyCount,
        normalCount,
        hardCount,
        adherence,
        difficultyTrend,
        currentProfile?.weight_kg || null
      ]
    );

    console.log(`✅ Weekly snapshot saved for week ${weekNumber}`);
    return weekNumber;

  } catch (error) {
    console.error('❌ Failed to save weekly snapshot:', error);
    return null;
  }
}