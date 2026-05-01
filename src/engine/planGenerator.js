import { getDatabase } from '../database/database';
import { loadAllExercises, applyAllFilters } from './exerciseFilter';
import { buildWeeklySessionPlan } from './sessionBuilder';

// ─── Generate Workout Plan ────────────────────────────────────────────────────
export async function generateWorkoutPlan(userId) {
  try {
    console.log('🏗️ Starting plan generation for user:', userId);

    const db = await getDatabase();

    // Step 1: Load user data
    const userProfile = await db.getFirstAsync(
      `SELECT * FROM user_profile WHERE id = ?`,
      [userId]
    );

    if (!userProfile) {
      console.error('❌ User profile not found');
      return null;
    }

    const userEquipment = await db.getAllAsync(
      `SELECT * FROM user_equipment WHERE user_id = ?`,
      [userId]
    );

    const userGoals = await db.getAllAsync(
      `SELECT * FROM user_goals WHERE user_id = ?`,
      [userId]
    );

    const userInjuries = await db.getAllAsync(
      `SELECT * FROM user_injuries WHERE user_id = ? AND active = 1`,
      [userId]
    );

    const userPreferences = await db.getFirstAsync(
      `SELECT * FROM user_preferences WHERE user_id = ?`,
      [userId]
    );

    console.log('✅ User data loaded');
    console.log('📊 Equipment:', userEquipment.length, 'items');
    console.log('🎯 Goals:', userGoals.length, 'goals');
    console.log('🩺 Injuries:', userInjuries.length, 'limitations');

    // Step 2: Load and filter exercises
    const allExercises = await loadAllExercises();
    console.log('📚 Total exercises loaded:', allExercises.length);

    const filteredExercises = applyAllFilters(allExercises, {
      userEquipment,
      userInjuries,
      userGoals,
      fitnessLevel: userProfile.fitness_level || 'beginner'
    });

    console.log('✅ Filtered exercises:', filteredExercises.length);

    if (filteredExercises.length < 5) {
      console.error('❌ Not enough exercises after filtering');
      return null;
    }

    // Step 3: Get plan parameters
    const frequency = userPreferences?.workout_frequency || 3;
    const sessionDuration = userPreferences?.session_duration_minutes || 45;
    const splitId = userPreferences?.preferred_split_id || 'full_body_3day';
    const primaryGoal = userGoals[0]?.goal_id || 'general_fitness';
    const fitnessLevel = userProfile.fitness_level || 'beginner';

    console.log('📋 Plan parameters:');
    console.log('  Frequency:', frequency, 'days/week');
    console.log('  Duration:', sessionDuration, 'min');
    console.log('  Split:', splitId);
    console.log('  Goal:', primaryGoal);
    console.log('  Level:', fitnessLevel);

    // Step 4: Build weekly sessions
    const weeklySessions = buildWeeklySessionPlan(
      filteredExercises,
      frequency,
      splitId,
      fitnessLevel,
      primaryGoal,
      sessionDuration
    );

    if (!weeklySessions || weeklySessions.length === 0) {
      console.error('❌ Failed to build weekly sessions');
      return null;
    }

    // Step 5: Deactivate existing plans
    await db.runAsync(
      `UPDATE workout_plan SET is_active = 0 WHERE user_id = ?`,
      [userId]
    );

    // Step 6: Save new plan
    const planResult = await db.runAsync(
      `INSERT INTO workout_plan (
        user_id, plan_name, split_id, goal_id,
        fitness_level, frequency, session_duration_minutes,
        total_weeks, current_week, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        userId,
        `${primaryGoal.replace(/_/g, ' ')} Plan`.replace(/\b\w/g, l => l.toUpperCase()),
        splitId,
        primaryGoal,
        fitnessLevel,
        frequency,
        sessionDuration,
        12,
        1
      ]
    );

    const planId = planResult.lastInsertRowId;
    console.log('✅ Plan saved with ID:', planId);

    // Step 7: Generate 4 weeks of workout days
    const totalWeeks = 4;
    const today = new Date();

    for (let week = 0; week < totalWeeks; week++) {
      let workoutDayIndex = 0;

      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const date = new Date(today);
        date.setDate(today.getDate() + (week * 7) + dayOfWeek);
        const dateStr = date.toISOString().split('T')[0];

        // Determine if this is a workout day
        const isWorkoutDay = workoutDayIndex < weeklySessions.length &&
          shouldWorkoutOnDay(dayOfWeek, frequency);

        if (isWorkoutDay && workoutDayIndex < weeklySessions.length) {
          const session = weeklySessions[workoutDayIndex];

          // Save workout day
          const dayResult = await db.runAsync(
            `INSERT INTO workout_day (
              plan_id, day_number, day_name, day_label,
              scheduled_date, is_rest_day, is_completed
            ) VALUES (?, ?, ?, ?, ?, 0, 0)`,
            [
              planId,
              (week * 7) + dayOfWeek + 1,
              session.name,
              `Week ${week + 1} - Day ${workoutDayIndex + 1}`,
              dateStr
            ]
          );

          const workoutDayId = dayResult.lastInsertRowId;

          // Save exercises for this day
          for (const exercise of session.exercises) {
            await db.runAsync(
              `INSERT INTO workout_exercise (
                workout_day_id, exercise_id, exercise_name,
                order_index, prescribed_sets, prescribed_reps,
                prescribed_rest_seconds, prescribed_tempo,
                difficulty_level, is_completed, is_skipped
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
              [
                workoutDayId,
                exercise.exerciseId,
                exercise.exerciseName,
                exercise.orderIndex,
                exercise.prescribedSets,
                exercise.prescribedReps,
                exercise.prescribedRestSeconds,
                exercise.prescribedTempo,
                exercise.difficultyLevel
              ]
            );
          }

          workoutDayIndex++;
        } else {
          // Rest day
          await db.runAsync(
            `INSERT INTO workout_day (
              plan_id, day_number, day_name, day_label,
              scheduled_date, is_rest_day, is_completed
            ) VALUES (?, ?, ?, ?, ?, 1, 0)`,
            [
              planId,
              (week * 7) + dayOfWeek + 1,
              'Rest Day',
              `Week ${week + 1} - Rest`,
              dateStr
            ]
          );
        }
      }
    }

    console.log('✅ Plan generation complete!');
    console.log('📊 Plan ID:', planId);
    console.log('📅 Weeks generated:', totalWeeks);
    console.log('💪 Sessions per week:', weeklySessions.length);

    return planId;

  } catch (error) {
    console.error('❌ Plan generation failed:', error);
    return null;
  }
}

// ─── Helper: Should Workout on Day ───────────────────────────────────────────
function shouldWorkoutOnDay(dayOfWeek, frequency) {
  // dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const schedules = {
    1: [1],
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 6]
  };
  const schedule = schedules[frequency] || schedules[3];
  return schedule.includes(dayOfWeek);
}

// ─── Check if Plan Exists ─────────────────────────────────────────────────────
export async function checkActivePlan(userId) {
  try {
    const db = await getDatabase();
    const plan = await db.getFirstAsync(
      `SELECT * FROM workout_plan WHERE user_id = ? AND is_active = 1`,
      [userId]
    );
    return plan || null;
  } catch (error) {
    console.error('❌ Failed to check active plan:', error);
    return null;
  }
}

// ─── Get Today's Workout ──────────────────────────────────────────────────────
export async function getTodaysWorkout(planId) {
  try {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];

    const workoutDay = await db.getFirstAsync(
      `SELECT * FROM workout_day
      WHERE plan_id = ? AND scheduled_date = ? AND is_rest_day = 0
      ORDER BY day_number ASC LIMIT 1`,
      [planId, today]
    );

    if (!workoutDay) return null;

    const exercises = await db.getAllAsync(
      `SELECT * FROM workout_exercise
      WHERE workout_day_id = ?
      ORDER BY order_index ASC`,
      [workoutDay.id]
    );

    return {
      ...workoutDay,
      exercises: exercises || []
    };

  } catch (error) {
    console.error('❌ Failed to get today workout:', error);
    return null;
  }
}

// ─── Get Plan Statistics ──────────────────────────────────────────────────────
export async function getPlanStatistics(planId) {
  try {
    const db = await getDatabase();

    const totalDays = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM workout_day WHERE plan_id = ?`,
      [planId]
    );

    const workoutDays = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM workout_day
      WHERE plan_id = ? AND is_rest_day = 0`,
      [planId]
    );

    const completedDays = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM workout_day
      WHERE plan_id = ? AND is_completed = 1`,
      [planId]
    );

    const totalExercises = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM workout_exercise we
      JOIN workout_day wd ON we.workout_day_id = wd.id
      WHERE wd.plan_id = ?`,
      [planId]
    );

    return {
      totalDays: totalDays?.count || 0,
      workoutDays: workoutDays?.count || 0,
      completedDays: completedDays?.count || 0,
      totalExercises: totalExercises?.count || 0,
      adherencePercentage: workoutDays?.count > 0
        ? Math.round((completedDays?.count / workoutDays?.count) * 100)
        : 0
    };

  } catch (error) {
    console.error('❌ Failed to get plan statistics:', error);
    return null;
  }
}