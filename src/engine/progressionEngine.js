import { getDatabase } from '../database/database';
import { analyzeExerciseFeedback, updateExerciseProgressionState } from './feedbackAnalyzer';

// ─── Progression Actions ──────────────────────────────────────────────────────
const PROGRESSION_ACTIONS = {
  INCREASE_REPS: 'increase_reps',
  DECREASE_REPS: 'decrease_reps',
  INCREASE_SETS: 'increase_sets',
  DECREASE_SETS: 'decrease_sets',
  INCREASE_DIFFICULTY: 'increase_difficulty',
  DECREASE_DIFFICULTY: 'decrease_difficulty',
  INCREASE_REST: 'increase_rest',
  DECREASE_REST: 'decrease_rest',
  SUBSTITUTE: 'substitute',
  MAINTAIN: 'maintain'
};

// ─── Difficulty Level Map ─────────────────────────────────────────────────────
const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'];

function getNextDifficulty(current) {
  const index = DIFFICULTY_ORDER.indexOf(current);
  return index < DIFFICULTY_ORDER.length - 1
    ? DIFFICULTY_ORDER[index + 1]
    : current;
}

function getPreviousDifficulty(current) {
  const index = DIFFICULTY_ORDER.indexOf(current);
  return index > 0
    ? DIFFICULTY_ORDER[index - 1]
    : current;
}

// ─── Calculate New Prescription ───────────────────────────────────────────────
export function calculateNewPrescription(
  currentPrescription,
  action,
  goal = 'general_fitness'
) {
  const current = { ...currentPrescription };
  let currentReps = parseInt(current.reps) || 10;
  let currentSets = parseInt(current.sets) || 3;
  let currentRest = parseInt(current.restSeconds) || 60;

  switch (action) {
    case PROGRESSION_ACTIONS.INCREASE_REPS:
      const repIncrease = goal === 'endurance' ? 3 : 2;
      const maxReps = goal === 'strength' ? 8 :
                      goal === 'endurance' ? 25 : 15;
      currentReps = Math.min(currentReps + repIncrease, maxReps);
      break;

    case PROGRESSION_ACTIONS.DECREASE_REPS:
      const minReps = goal === 'strength' ? 3 : 5;
      currentReps = Math.max(currentReps - 2, minReps);
      break;

    case PROGRESSION_ACTIONS.INCREASE_SETS:
      currentSets = Math.min(currentSets + 1, 5);
      break;

    case PROGRESSION_ACTIONS.DECREASE_SETS:
      currentSets = Math.max(currentSets - 1, 2);
      break;

    case PROGRESSION_ACTIONS.DECREASE_REST:
      currentRest = Math.max(currentRest - 15, 30);
      break;

    case PROGRESSION_ACTIONS.INCREASE_REST:
      currentRest = Math.min(currentRest + 30, 300);
      break;

    default:
      break;
  }

  return {
    ...current,
    sets: currentSets,
    reps: currentReps.toString(),
    restSeconds: currentRest
  };
}

// ─── Apply Progression Rule ───────────────────────────────────────────────────
export async function applyProgressionRule(
  userId,
  workoutExerciseId,
  exerciseId,
  exerciseName,
  feedbackData,
  currentPrescription,
  goal = 'general_fitness'
) {
  try {
    const db = await getDatabase();

    // Update progression state
    await updateExerciseProgressionState(
      userId,
      exerciseId,
      exerciseName,
      feedbackData,
      currentPrescription
    );

    // Analyze feedback history
    const analysis = await analyzeExerciseFeedback(userId, exerciseId);

    let action = PROGRESSION_ACTIONS.MAINTAIN;
    let newPrescription = { ...currentPrescription };
    let message = '';

    // Apply rules based on analysis
    if (analysis.painReported) {
      action = PROGRESSION_ACTIONS.SUBSTITUTE;
      message = '⚠️ Pain reported — exercise flagged for substitution';
    } else if (analysis.recommendation === 'progress') {
      // Check if we should increase reps or sets
      const currentReps = parseInt(currentPrescription.reps) || 10;
      const maxRepsForGoal = goal === 'strength' ? 6 :
                             goal === 'endurance' ? 20 : 15;

      if (currentReps >= maxRepsForGoal) {
        // At max reps — increase sets instead
        action = PROGRESSION_ACTIONS.INCREASE_SETS;
        message = '📈 Great work! Adding one more set';
      } else {
        action = PROGRESSION_ACTIONS.INCREASE_REPS;
        message = '📈 Looking strong! Increasing reps';
      }

      newPrescription = calculateNewPrescription(
        currentPrescription,
        action,
        goal
      );

    } else if (analysis.recommendation === 'reduce_reps') {
      action = PROGRESSION_ACTIONS.DECREASE_REPS;
      newPrescription = calculateNewPrescription(
        currentPrescription,
        action,
        goal
      );
      message = '📉 Reducing reps to ensure good form';

    } else if (analysis.recommendation === 'regress') {
      action = PROGRESSION_ACTIONS.DECREASE_SETS;
      newPrescription = calculateNewPrescription(
        currentPrescription,
        action,
        goal
      );
      message = '📉 Adjusting volume for better recovery';

    } else {
      message = '✅ Keep up the good work — maintaining current level';
    }

    // Update future workout exercises with new prescription
    if (action !== PROGRESSION_ACTIONS.MAINTAIN &&
        action !== PROGRESSION_ACTIONS.SUBSTITUTE) {
      await updateFutureExercises(
        db,
        userId,
        exerciseId,
        newPrescription
      );
    }

    // Flag exercise if pain reported
    if (action === PROGRESSION_ACTIONS.SUBSTITUTE) {
      await db.runAsync(
        `UPDATE exercise_progression
         SET pain_flag = 1, progression_blocked = 1
         WHERE user_id = ? AND exercise_id = ?`,
        [userId, exerciseId]
      );
    }

    // Log progression event
    if (action !== PROGRESSION_ACTIONS.MAINTAIN) {
      console.log(`🔄 Progression applied for ${exerciseName}:`);
      console.log(`   Action: ${action}`);
      console.log(`   Message: ${message}`);
      console.log(`   New prescription:`, newPrescription);
    }

    return {
      action,
      newPrescription,
      message,
      analysis
    };

  } catch (error) {
    console.error('❌ Progression rule failed:', error);
    return {
      action: PROGRESSION_ACTIONS.MAINTAIN,
      newPrescription: currentPrescription,
      message: 'Maintaining current level',
      error: error.message
    };
  }
}

// ─── Update Future Exercises ──────────────────────────────────────────────────
async function updateFutureExercises(
  db,
  userId,
  exerciseId,
  newPrescription
) {
  try {
    const today = new Date().toISOString().split('T')[0];

    await db.runAsync(
      `UPDATE workout_exercise
       SET prescribed_sets = ?,
           prescribed_reps = ?,
           prescribed_rest_seconds = ?
       WHERE exercise_id = ?
       AND workout_day_id IN (
         SELECT wd.id FROM workout_day wd
         JOIN workout_plan wp ON wd.plan_id = wp.id
         WHERE wp.user_id = ?
         AND wd.scheduled_date > ?
         AND wd.is_completed = 0
       )`,
      [
        newPrescription.sets,
        newPrescription.reps,
        newPrescription.restSeconds,
        exerciseId,
        userId,
        today
      ]
    );

    console.log(`✅ Future exercises updated for: ${exerciseId}`);

  } catch (error) {
    console.error('❌ Failed to update future exercises:', error);
  }
}

// ─── Process All Session Feedback ────────────────────────────────────────────
export async function processSessionFeedback(
  userId,
  sessionExercises,
  feedbackList,
  goal = 'general_fitness'
) {
  try {
    console.log('🔄 Processing session feedback...');

    const results = [];

    for (const feedback of feedbackList) {
      const exercise = sessionExercises.find(
        ex => ex.id === feedback.workout_exercise_id
      );

      if (!exercise) continue;

      const currentPrescription = {
        sets: exercise.prescribed_sets,
        reps: exercise.prescribed_reps,
        restSeconds: exercise.prescribed_rest_seconds,
        difficulty: exercise.difficulty_level
      };

      const result = await applyProgressionRule(
        userId,
        exercise.id,
        exercise.exercise_id,
        exercise.exercise_name,
        feedback,
        currentPrescription,
        goal
      );

      results.push({
        exerciseId: exercise.exercise_id,
        exerciseName: exercise.exercise_name,
        ...result
      });
    }

    console.log(`✅ Processed ${results.length} exercise progressions`);
    return results;

  } catch (error) {
    console.error('❌ Session feedback processing failed:', error);
    return [];
  }
}

// ─── Get Weekly Progression Summary ──────────────────────────────────────────
export async function getWeeklyProgressionSummary(userId) {
  try {
    const db = await getDatabase();

    const progressions = await db.getAllAsync(
      `SELECT * FROM exercise_progression
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 10`,
      [userId]
    );

    const progressing = progressions.filter(
      p => p.consecutive_easy_sessions >= 2
    ).length;

    const struggling = progressions.filter(
      p => p.consecutive_hard_sessions >= 2
    ).length;

    const painFlagged = progressions.filter(
      p => p.pain_flag === 1
    ).length;

    return {
      totalTracked: progressions.length,
      progressing,
      struggling,
      painFlagged,
      progressions
    };

  } catch (error) {
    console.error('❌ Failed to get progression summary:', error);
    return null;
  }
}

// ─── Deload Week Check ────────────────────────────────────────────────────────
export async function checkDeloadNeeded(userId) {
  try {
    const db = await getDatabase();

    // Check last 4 weeks of sessions
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const dateStr = fourWeeksAgo.toISOString();

    const recentFeedback = await db.getAllAsync(
      `SELECT difficulty_rating, COUNT(*) as count
       FROM exercise_feedback
       WHERE user_id = ? AND recorded_at > ?
       GROUP BY difficulty_rating`,
      [userId, dateStr]
    );

    let hardCount = 0;
    let totalCount = 0;

    recentFeedback.forEach(fb => {
      totalCount += fb.count;
      if (fb.difficulty_rating === 'hard') hardCount += fb.count;
    });

    const hardPercentage = totalCount > 0
      ? (hardCount / totalCount) * 100
      : 0;

    const deloadNeeded = hardPercentage > 60 && totalCount >= 10;

    if (deloadNeeded) {
      console.log('⚠️ Deload week recommended:', hardPercentage.toFixed(0), '% hard exercises');
    }

    return {
      deloadNeeded,
      hardPercentage: Math.round(hardPercentage),
      totalFeedback: totalCount,
      reason: deloadNeeded
        ? `${Math.round(hardPercentage)}% of exercises marked hard — recovery week recommended`
        : 'Training load is manageable'
    };

  } catch (error) {
    console.error('❌ Deload check failed:', error);
    return { deloadNeeded: false };
  }
}