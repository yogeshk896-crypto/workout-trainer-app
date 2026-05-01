import { getDatabase } from './database';

// Import all reference data
const exercisesData = require('../data/exercises.json');
const equipmentData = require('../data/equipment.json');
const muscleGroupsData = require('../data/muscle-groups.json');
const movementPatternsData = require('../data/movement-patterns.json');
const goalProfilesData = require('../data/goal-profiles.json');
const workoutSplitsData = require('../data/workout-splits.json');
const progressionRulesData = require('../data/progression-rules.json');

// ─── Create Reference Tables ──────────────────────────────────────────────────

async function createReferenceTables(db) {
  // Exercises reference table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ref_exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      aliases TEXT,
      movement_pattern TEXT,
      category TEXT,
      difficulty_level TEXT,
      primary_muscles TEXT,
      secondary_muscles TEXT,
      required_equipment TEXT,
      optional_equipment TEXT,
      is_unilateral INTEGER DEFAULT 0,
      is_time_based INTEGER DEFAULT 0,
      goals_supported TEXT,
      estimated_duration_seconds INTEGER,
      default_prescription TEXT,
      coaching_cues TEXT,
      common_mistakes TEXT,
      setup_instructions TEXT,
      execution_steps TEXT,
      contraindications TEXT,
      substitution_tags TEXT,
      regression_id TEXT,
      progression_id TEXT,
      related_exercises TEXT,
      warmup_compatible INTEGER DEFAULT 0,
      cooldown_compatible INTEGER DEFAULT 0,
      main_lift_compatible INTEGER DEFAULT 0,
      animation TEXT
    );
  `);

  // Equipment reference table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ref_equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      fallback_alternatives TEXT
    );
  `);

  // Muscle groups reference table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ref_muscle_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT,
      display_color TEXT,
      description TEXT
    );
  `);

  // Movement patterns reference table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ref_movement_patterns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      muscle_groups TEXT,
      example TEXT
    );
  `);

  // Goal profiles reference table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ref_goal_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      aliases TEXT,
      description TEXT,
      difficulty TEXT,
      primary_metrics TEXT,
      frequency_range TEXT,
      session_duration_range TEXT,
      training_parameters TEXT,
      exercise_selection_rules TEXT,
      progression_strategy TEXT,
      feedback_adjustment TEXT,
      contraindications TEXT,
      estimated_duration TEXT,
      notes TEXT
    );
  `);

  // Workout splits reference table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ref_workout_splits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      aliases TEXT,
      description TEXT,
      frequency INTEGER,
      training_age TEXT,
      primary_goals TEXT,
      day_structure TEXT,
      weekly_schedule TEXT,
      muscle_group_coverage TEXT,
      suitable_goals TEXT,
      equipment_requirements TEXT,
      estimated_session_duration TEXT,
      weekly_volume TEXT,
      pros TEXT,
      cons TEXT,
      suitable_experience_levels TEXT,
      notes TEXT
    );
  `);

  // Progression rules reference table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ref_progression_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      rule_type TEXT,
      trigger_condition TEXT,
      exercise_state TEXT,
      action TEXT,
      conditions TEXT,
      global_modifiers TEXT
    );
  `);

  console.log('✅ Reference tables created');
}

// ─── Seed Exercises ───────────────────────────────────────────────────────────

async function seedExercises(db) {
  const existing = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM ref_exercises`
  );

  if (existing?.count > 0) {
    console.log('ℹ️ Exercises already seeded:', existing.count);
    return;
  }

  const exercises = exercisesData.exercises || [];

  for (const exercise of exercises) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ref_exercises (
        id, name, aliases, movement_pattern, category,
        difficulty_level, primary_muscles, secondary_muscles,
        required_equipment, optional_equipment, is_unilateral,
        is_time_based, goals_supported, estimated_duration_seconds,
        default_prescription, coaching_cues, common_mistakes,
        setup_instructions, execution_steps, contraindications,
        substitution_tags, regression_id, progression_id,
        related_exercises, warmup_compatible, cooldown_compatible,
        main_lift_compatible, animation
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        exercise.id,
        exercise.name,
        JSON.stringify(exercise.aliases || []),
        exercise.movementPattern,
        exercise.category,
        exercise.difficultyLevel,
        JSON.stringify(exercise.primaryMuscles || []),
        JSON.stringify(exercise.secondaryMuscles || []),
        JSON.stringify(exercise.requiredEquipment || []),
        JSON.stringify(exercise.optionalEquipment || []),
        exercise.isUnilateral ? 1 : 0,
        exercise.isTimeBased ? 1 : 0,
        JSON.stringify(exercise.goalsSupported || []),
        exercise.estimatedDurationSeconds || 60,
        JSON.stringify(exercise.defaultPrescription || {}),
        JSON.stringify(exercise.coachingCues || []),
        JSON.stringify(exercise.commonMistakes || []),
        JSON.stringify(exercise.setupInstructions || []),
        JSON.stringify(exercise.executionSteps || []),
        JSON.stringify(exercise.contraindications || {}),
        JSON.stringify(exercise.substitutionTags || []),
        exercise.regressionId || null,
        exercise.progressionId || null,
        JSON.stringify(exercise.relatedExercises || []),
        exercise.warmupCompatible ? 1 : 0,
        exercise.cooldownCompatible ? 1 : 0,
        exercise.mainLiftCompatible ? 1 : 0,
        JSON.stringify(exercise.animation || {})
      ]
    );
  }

  console.log('✅ Exercises seeded:', exercises.length);
}

// ─── Seed Equipment ───────────────────────────────────────────────────────────

async function seedEquipment(db) {
  const existing = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM ref_equipment`
  );

  if (existing?.count > 0) {
    console.log('ℹ️ Equipment already seeded:', existing.count);
    return;
  }

  const equipmentList = equipmentData.equipment || [];

  for (const equipment of equipmentList) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ref_equipment
        (id, name, category, description, fallback_alternatives)
      VALUES (?, ?, ?, ?, ?)`,
      [
        equipment.id,
        equipment.name,
        equipment.category,
        equipment.description,
        JSON.stringify(equipment.fallbackAlternatives || [])
      ]
    );
  }

  console.log('✅ Equipment seeded:', equipmentList.length);
}

// ─── Seed Muscle Groups ───────────────────────────────────────────────────────

async function seedMuscleGroups(db) {
  const existing = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM ref_muscle_groups`
  );

  if (existing?.count > 0) {
    console.log('ℹ️ Muscle groups already seeded:', existing.count);
    return;
  }

  const muscleGroups = muscleGroupsData.muscleGroups || [];

  for (const muscle of muscleGroups) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ref_muscle_groups
        (id, name, region, display_color, description)
      VALUES (?, ?, ?, ?, ?)`,
      [
        muscle.id,
        muscle.name,
        muscle.region,
        muscle.displayColor,
        muscle.description
      ]
    );
  }

  console.log('✅ Muscle groups seeded:', muscleGroups.length);
}

// ─── Seed Movement Patterns ───────────────────────────────────────────────────

async function seedMovementPatterns(db) {
  const existing = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM ref_movement_patterns`
  );

  if (existing?.count > 0) {
    console.log('ℹ️ Movement patterns already seeded:', existing.count);
    return;
  }

  const patterns = movementPatternsData.movementPatterns || [];

  for (const pattern of patterns) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ref_movement_patterns
        (id, name, category, description, muscle_groups, example)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        pattern.id,
        pattern.name,
        pattern.category,
        pattern.description,
        JSON.stringify(pattern.muscleGroups || []),
        pattern.example
      ]
    );
  }

  console.log('✅ Movement patterns seeded:', patterns.length);
}

// ─── Seed Goal Profiles ───────────────────────────────────────────────────────

async function seedGoalProfiles(db) {
  const existing = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM ref_goal_profiles`
  );

  if (existing?.count > 0) {
    console.log('ℹ️ Goal profiles already seeded:', existing.count);
    return;
  }

  const goals = goalProfilesData.goalProfiles || [];

  for (const goal of goals) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ref_goal_profiles (
        id, name, aliases, description, difficulty,
        primary_metrics, frequency_range, session_duration_range,
        training_parameters, exercise_selection_rules,
        progression_strategy, feedback_adjustment,
        contraindications, estimated_duration, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.goalId,
        goal.name,
        JSON.stringify(goal.aliases || []),
        goal.description,
        goal.difficulty,
        JSON.stringify(goal.primaryMetrics || []),
        JSON.stringify(goal.frequencyRange || {}),
        JSON.stringify(goal.sessionDurationRange || {}),
        JSON.stringify(goal.trainingParameters || {}),
        JSON.stringify(goal.exerciseSelectionRules || {}),
        JSON.stringify(goal.progressionStrategy || {}),
        JSON.stringify(goal.feedbackAdjustment || {}),
        JSON.stringify(goal.contraindications || []),
        JSON.stringify(goal.estimatedDuration || {}),
        goal.notes || ''
      ]
    );
  }

  console.log('✅ Goal profiles seeded:', goals.length);
}

// ─── Seed Workout Splits ──────────────────────────────────────────────────────

async function seedWorkoutSplits(db) {
  const existing = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM ref_workout_splits`
  );

  if (existing?.count > 0) {
    console.log('ℹ️ Workout splits already seeded:', existing.count);
    return;
  }

  const splits = workoutSplitsData.workoutSplits || [];

  for (const split of splits) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ref_workout_splits (
        id, name, aliases, description, frequency,
        training_age, primary_goals, day_structure,
        weekly_schedule, muscle_group_coverage,
        suitable_goals, equipment_requirements,
        estimated_session_duration, weekly_volume,
        pros, cons, suitable_experience_levels, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        split.splitId,
        split.name,
        JSON.stringify(split.aliases || []),
        split.description,
        split.frequency,
        split.trainingAge,
        JSON.stringify(split.primaryGoals || []),
        JSON.stringify(split.dayStructure || {}),
        JSON.stringify(split.weeklySchedule || {}),
        JSON.stringify(split.muscleGroupCoverage || {}),
        JSON.stringify(split.suitableGoals || []),
        JSON.stringify(split.equipmentRequirements || []),
        JSON.stringify(split.estimatedSessionDuration || {}),
        JSON.stringify(split.weeklyVolume || {}),
        JSON.stringify(split.pros || []),
        JSON.stringify(split.cons || []),
        JSON.stringify(split.suitableExperienceLevels || []),
        split.notes || ''
      ]
    );
  }

  console.log('✅ Workout splits seeded:', splits.length);
}

// ─── Seed Progression Rules ───────────────────────────────────────────────────

async function seedProgressionRules(db) {
  const existing = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM ref_progression_rules`
  );

  if (existing?.count > 0) {
    console.log('ℹ️ Progression rules already seeded:', existing.count);
    return;
  }

  const rules = progressionRulesData.progressionRules || [];

  for (const rule of rules) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ref_progression_rules (
        id, name, description, rule_type,
        trigger_condition, exercise_state,
        action, conditions, global_modifiers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rule.ruleId,
        rule.name,
        rule.description,
        rule.ruleType,
        JSON.stringify(rule.triggerCondition || {}),
        JSON.stringify(rule.exerciseState || {}),
        JSON.stringify(rule.action || {}),
        JSON.stringify(rule.conditions || {}),
        JSON.stringify(rule.globalModifiers || {})
      ]
    );
  }

  console.log('✅ Progression rules seeded:', rules.length);
}

    // ─── Main Seed Function ───────────────────────────────────────────────────────

export async function seedReferenceData() {
  try {
    console.log('🌱 Starting reference data seeding...');

    const db = await getDatabase();

    // Step 1: Create all reference tables
    await createReferenceTables(db);

    // Step 2: Seed all reference data
    await seedExercises(db);
    await seedEquipment(db);
    await seedMuscleGroups(db);
    await seedMovementPatterns(db);
    await seedGoalProfiles(db);
    await seedWorkoutSplits(db);
    await seedProgressionRules(db);

    console.log('✅ All reference data seeded successfully');
    return true;

  } catch (error) {
    console.error('❌ Seed data failed:', error);
    return false;
  }
}

export async function clearReferenceData() {
  try {
    const db = await getDatabase();
    await db.execAsync(`DROP TABLE IF EXISTS ref_exercises;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_equipment;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_muscle_groups;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_movement_patterns;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_goal_profiles;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_workout_splits;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_progression_rules;`);
    console.log('✅ Reference data cleared');
    return true;
  } catch (error) {
    console.error('❌ Clear reference data failed:', error);
    return false;
  }
}