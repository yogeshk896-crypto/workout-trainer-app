import { getDatabase } from '../database/database';

// ─── Find Safe Substitute ─────────────────────────────────────────────────────
export async function findSafeSubstitute(
  exerciseId,
  reason,
  userEquipment,
  userInjuries
) {
  try {
    const db = await getDatabase();

    // Load original exercise
    const original = await db.getFirstAsync(
      `SELECT * FROM ref_exercises WHERE id = ?`,
      [exerciseId]
    );

    if (!original) {
      console.error('❌ Original exercise not found:', exerciseId);
      return null;
    }

    const primaryMuscles = JSON.parse(original.primary_muscles || '[]');
    const movementPattern = original.movement_pattern;
    const requiredEquipment = JSON.parse(original.required_equipment || '[]');
    const substitutionTags = JSON.parse(original.substitution_tags || '[]');
    const regressionId = original.regression_id;

    console.log(`🔄 Finding substitute for: ${original.name}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Movement: ${movementPattern}`);
    console.log(`   Tags: ${substitutionTags.join(', ')}`);

    const equipmentIds = userEquipment.map(e => e.equipment_id || e.id);
    if (!equipmentIds.includes('bodyweight')) {
      equipmentIds.push('bodyweight');
    }

    const injuryTypes = userInjuries.map(i => i.injury_type);

    // Strategy 1: Use regression exercise if available
    if (regressionId && reason !== 'pain') {
      const regression = await db.getFirstAsync(
        `SELECT * FROM ref_exercises WHERE id = ?`,
        [regressionId]
      );

      if (regression) {
        const isSafe = await checkExerciseSafety(regression, injuryTypes);
        const isAvailable = checkEquipmentAvailability(regression, equipmentIds);

        if (isSafe && isAvailable) {
          console.log(`✅ Regression found: ${regression.name}`);
          return formatSubstitute(regression, 'regression', reason);
        }
      }
    }

    // Strategy 2: Same movement pattern same equipment
    const samePatterSameEquip = await findByPatternAndEquipment(
      db,
      movementPattern,
      equipmentIds,
      injuryTypes,
      exerciseId
    );

    if (samePatterSameEquip) {
      console.log(`✅ Same pattern substitute: ${samePatterSameEquip.name}`);
      return formatSubstitute(samePatterSameEquip, 'same_pattern', reason);
    }

    // Strategy 3: Same primary muscles different movement
    const sameMuscles = await findByMuscleGroup(
      db,
      primaryMuscles,
      equipmentIds,
      injuryTypes,
      exerciseId
    );

    if (sameMuscles) {
      console.log(`✅ Same muscle substitute: ${sameMuscles.name}`);
      return formatSubstitute(sameMuscles, 'same_muscle', reason);
    }

    // Strategy 4: Matching substitution tags
    const tagMatch = await findBySubstitutionTags(
      db,
      substitutionTags,
      equipmentIds,
      injuryTypes,
      exerciseId
    );

    if (tagMatch) {
      console.log(`✅ Tag match substitute: ${tagMatch.name}`);
      return formatSubstitute(tagMatch, 'tag_match', reason);
    }

    // Strategy 5: Fallback — safe bodyweight exercise
    const fallback = await findSafeFallback(
      db,
      movementPattern,
      injuryTypes
    );

    if (fallback) {
      console.log(`✅ Fallback substitute: ${fallback.name}`);
      return formatSubstitute(fallback, 'fallback', reason);
    }

    console.log('⚠️ No substitute found for:', original.name);
    return null;

  } catch (error) {
    console.error('❌ Substitution failed:', error);
    return null;
  }
}

// ─── Find by Pattern and Equipment ───────────────────────────────────────────
async function findByPatternAndEquipment(
  db,
  pattern,
  equipmentIds,
  injuryTypes,
  excludeId
) {
  const candidates = await db.getAllAsync(
    `SELECT * FROM ref_exercises
     WHERE movement_pattern = ?
     AND id != ?
     AND difficulty_level = 'beginner'
     ORDER BY RANDOM()
     LIMIT 10`,
    [pattern, excludeId]
  );

  for (const candidate of candidates) {
    const required = JSON.parse(candidate.required_equipment || '[]');
    const hasEquipment = required.length === 0 ||
      required.includes('bodyweight') ||
      required.every(eq => equipmentIds.includes(eq));

    const isSafe = await checkExerciseSafety(candidate, injuryTypes);

    if (hasEquipment && isSafe) {
      return candidate;
    }
  }
  return null;
}

// ─── Find by Muscle Group ─────────────────────────────────────────────────────
async function findByMuscleGroup(
  db,
  primaryMuscles,
  equipmentIds,
  injuryTypes,
  excludeId
) {
  if (!primaryMuscles || primaryMuscles.length === 0) return null;

  const muscle = primaryMuscles[0];

  const candidates = await db.getAllAsync(
    `SELECT * FROM ref_exercises
     WHERE primary_muscles LIKE ?
     AND id != ?
     AND difficulty_level = 'beginner'
     ORDER BY RANDOM()
     LIMIT 10`,
    [`%${muscle}%`, excludeId]
  );

  for (const candidate of candidates) {
    const required = JSON.parse(candidate.required_equipment || '[]');
    const hasEquipment = required.length === 0 ||
      required.includes('bodyweight') ||
      required.every(eq => equipmentIds.includes(eq));

    const isSafe = await checkExerciseSafety(candidate, injuryTypes);

    if (hasEquipment && isSafe) {
      return candidate;
    }
  }
  return null;
}

// ─── Find by Substitution Tags ────────────────────────────────────────────────
async function findBySubstitutionTags(
  db,
  tags,
  equipmentIds,
  injuryTypes,
  excludeId
) {
  if (!tags || tags.length === 0) return null;

  for (const tag of tags) {
    const candidates = await db.getAllAsync(
      `SELECT * FROM ref_exercises
       WHERE substitution_tags LIKE ?
       AND id != ?
       AND difficulty_level = 'beginner'
       ORDER BY RANDOM()
       LIMIT 5`,
      [`%${tag}%`, excludeId]
    );

    for (const candidate of candidates) {
      const required = JSON.parse(candidate.required_equipment || '[]');
      const hasEquipment = required.length === 0 ||
        required.includes('bodyweight') ||
        required.every(eq => equipmentIds.includes(eq));

      const isSafe = await checkExerciseSafety(candidate, injuryTypes);

      if (hasEquipment && isSafe) {
        return candidate;
      }
    }
  }
  return null;
}

// ─── Find Safe Fallback ───────────────────────────────────────────────────────
async function findSafeFallback(db, pattern, injuryTypes) {
  // Map patterns to safe fallback patterns
  const fallbackPatterns = {
    squat: 'mobility',
    lunge: 'mobility',
    hinge: 'core_anti_extension',
    push_horizontal: 'core_anti_extension',
    push_vertical: 'core_anti_extension',
    pull_horizontal: 'core_anti_rotation',
    pull_vertical: 'core_anti_rotation',
    isolation: 'mobility',
    conditioning: 'mobility',
    plyometric: 'mobility'
  };

  const fallbackPattern = fallbackPatterns[pattern] || 'mobility';

  const candidates = await db.getAllAsync(
    `SELECT * FROM ref_exercises
     WHERE movement_pattern = ?
     AND category = 'bodyweight'
     AND difficulty_level = 'beginner'
     ORDER BY RANDOM()
     LIMIT 5`,
    [fallbackPattern]
  );

  for (const candidate of candidates) {
    const isSafe = await checkExerciseSafety(candidate, injuryTypes);
    if (isSafe) return candidate;
  }

  return null;
}

// ─── Check Exercise Safety ────────────────────────────────────────────────────
async function checkExerciseSafety(exercise, injuryTypes) {
  if (!injuryTypes || injuryTypes.length === 0) return true;

  const contraindications = JSON.parse(
    exercise.contraindications || '{}'
  );

  for (const injuryType of injuryTypes) {
    if (contraindications[injuryType]) {
      const severity = contraindications[injuryType].severity;
      if (severity === 'avoid') return false;
    }
  }

  return true;
}

// ─── Check Equipment Availability ────────────────────────────────────────────
function checkEquipmentAvailability(exercise, equipmentIds) {
  const required = JSON.parse(exercise.required_equipment || '[]');

  if (required.length === 0) return true;
  if (required.includes('bodyweight')) return true;

  return required.every(eq => equipmentIds.includes(eq));
}

// ─── Format Substitute Result ─────────────────────────────────────────────────
function formatSubstitute(exercise, strategy, reason) {
  const prescription = JSON.parse(exercise.default_prescription || '{}');
  const beginnerPrescription = prescription.beginner || {
    sets: 3, reps: 10, restSeconds: 60
  };

  return {
    originalExerciseId: null,
    substituteExerciseId: exercise.id,
    substituteName: exercise.name,
    substituteCategory: exercise.category,
    substituteMovementPattern: exercise.movement_pattern,
    substituteDifficulty: exercise.difficulty_level,
    substitutePrescription: {
      sets: beginnerPrescription.sets || 3,
      reps: (beginnerPrescription.reps || 10).toString(),
      restSeconds: beginnerPrescription.restSeconds || 60
    },
    strategy,
    reason,
    coachingCues: JSON.parse(exercise.coaching_cues || '[]'),
    animation: JSON.parse(exercise.animation || '{}')
  };
}

// ─── Apply Substitution to Workout ───────────────────────────────────────────
export async function applySubstitutionToWorkout(
  workoutExerciseId,
  substitute
) {
  try {
    const db = await getDatabase();

    await db.runAsync(
      `UPDATE workout_exercise SET
        exercise_id = ?,
        exercise_name = ?,
        prescribed_sets = ?,
        prescribed_reps = ?,
        prescribed_rest_seconds = ?,
        substituted_from = (
          SELECT exercise_id FROM workout_exercise WHERE id = ?
        )
       WHERE id = ?`,
      [
        substitute.substituteExerciseId,
        substitute.substituteName,
        substitute.substitutePrescription.sets,
        substitute.substitutePrescription.reps,
        substitute.substitutePrescription.restSeconds,
        workoutExerciseId,
        workoutExerciseId
      ]
    );

    console.log(`✅ Substitution applied: ${substitute.substituteName}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to apply substitution:', error);
    return false;
  }
}

// ─── Auto Substitute Pain Exercises ──────────────────────────────────────────
export async function autoSubstitutePainExercises(
  userId,
  planId,
  userEquipment,
  userInjuries
) {
  try {
    const db = await getDatabase();

    // Find all pain-flagged exercises in future workouts
    const painExercises = await db.getAllAsync(
      `SELECT DISTINCT we.exercise_id, we.exercise_name
       FROM workout_exercise we
       JOIN workout_day wd ON we.workout_day_id = wd.id
       JOIN exercise_progression ep ON ep.exercise_id = we.exercise_id
       WHERE wd.plan_id = ?
       AND ep.user_id = ?
       AND ep.pain_flag = 1
       AND wd.is_completed = 0`,
      [planId, userId]
    );

    if (painExercises.length === 0) {
      console.log('✅ No pain-flagged exercises found');
      return [];
    }

    console.log(`⚠️ Found ${painExercises.length} pain-flagged exercises`);

    const substitutions = [];

    for (const exercise of painExercises) {
      const substitute = await findSafeSubstitute(
        exercise.exercise_id,
        'pain',
        userEquipment,
        userInjuries
      );

      if (substitute) {
        // Apply to all future unfinished workout days
        await db.runAsync(
          `UPDATE workout_exercise SET
            exercise_id = ?,
            exercise_name = ?,
            prescribed_sets = ?,
            prescribed_reps = ?,
            prescribed_rest_seconds = ?,
            substituted_from = ?
           WHERE exercise_id = ?
           AND workout_day_id IN (
             SELECT id FROM workout_day
             WHERE plan_id = ? AND is_completed = 0
           )`,
          [
            substitute.substituteExerciseId,
            substitute.substituteName,
            substitute.substitutePrescription.sets,
            substitute.substitutePrescription.reps,
            substitute.substitutePrescription.restSeconds,
            exercise.exercise_id,
            exercise.exercise_id,
            planId
          ]
        );

        substitutions.push({
          original: exercise.exercise_name,
          substitute: substitute.substituteName,
          strategy: substitute.strategy
        });

        console.log(`✅ Auto-substituted: ${exercise.exercise_name} → ${substitute.substituteName}`);
      }
    }

    return substitutions;

  } catch (error) {
    console.error('❌ Auto substitution failed:', error);
    return [];
  }
}

// ─── Get Substitution History ─────────────────────────────────────────────────
export async function getSubstitutionHistory(userId) {
  try {
    const db = await getDatabase();

    const history = await db.getAllAsync(
      `SELECT we.exercise_name, we.substituted_from,
              wd.scheduled_date
       FROM workout_exercise we
       JOIN workout_day wd ON we.workout_day_id = wd.id
       JOIN workout_plan wp ON wd.plan_id = wp.id
       WHERE wp.user_id = ?
       AND we.substituted_from IS NOT NULL
       ORDER BY wd.scheduled_date DESC
       LIMIT 20`,
      [userId]
    );

    return history || [];

  } catch (error) {
    console.error('❌ Failed to get substitution history:', error);
    return [];
  }
}