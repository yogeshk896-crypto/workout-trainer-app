import { getDatabase } from '../database/database';

// ─── Load All Exercises from Database ─────────────────────────────────────────
export async function loadAllExercises() {
  try {
    const db = await getDatabase();
    const exercises = await db.getAllAsync(
      `SELECT * FROM ref_exercises ORDER BY id`
    );

    return exercises.map(ex => ({
      ...ex,
      aliases: JSON.parse(ex.aliases || '[]'),
      primaryMuscles: JSON.parse(ex.primary_muscles || '[]'),
      secondaryMuscles: JSON.parse(ex.secondary_muscles || '[]'),
      requiredEquipment: JSON.parse(ex.required_equipment || '[]'),
      optionalEquipment: JSON.parse(ex.optional_equipment || '[]'),
      goalsSupported: JSON.parse(ex.goals_supported || '[]'),
      defaultPrescription: JSON.parse(ex.default_prescription || '{}'),
      coachingCues: JSON.parse(ex.coaching_cues || '[]'),
      commonMistakes: JSON.parse(ex.common_mistakes || '[]'),
      contraindications: JSON.parse(ex.contraindications || '{}'),
      substitutionTags: JSON.parse(ex.substitution_tags || '[]'),
      animation: JSON.parse(ex.animation || '{}')
    }));

  } catch (error) {
    console.error('❌ Failed to load exercises:', error);
    return [];
  }
}

// ─── Filter by Equipment ──────────────────────────────────────────────────────
export function filterByEquipment(exercises, userEquipment) {
  const equipmentIds = userEquipment.map(e => e.equipment_id || e.id);

  // Always include bodyweight
  if (!equipmentIds.includes('bodyweight')) {
    equipmentIds.push('bodyweight');
  }

  return exercises.filter(exercise => {
    const required = exercise.requiredEquipment || [];

    // If no equipment required (bodyweight) always include
    if (required.length === 0) return true;
    if (required.includes('bodyweight')) return true;

    // Check if user has all required equipment
    return required.every(eq => equipmentIds.includes(eq));
  });
}

// ─── Filter by Injuries ───────────────────────────────────────────────────────
export function filterByInjuries(exercises, userInjuries) {
  if (!userInjuries || userInjuries.length === 0) return exercises;

  const injuryMap = {};
  userInjuries.forEach(injury => {
    injuryMap[injury.injury_type] = injury.severity;
  });

  return exercises.filter(exercise => {
    const contraindications = exercise.contraindications || {};

    for (const [injuryType, injuryData] of Object.entries(contraindications)) {
      if (injuryMap[injuryType]) {
        const userSeverity = injuryMap[injuryType];
        const exerciseSeverity = injuryData.severity;

        // If user has this injury and exercise says avoid — skip it
        if (userSeverity === 'avoid' && exerciseSeverity === 'avoid') {
          return false;
        }
      }
    }
    return true;
  });
}

// ─── Filter by Goals ──────────────────────────────────────────────────────────
export function filterByGoals(exercises, userGoals) {
  if (!userGoals || userGoals.length === 0) return exercises;

  const goalIds = userGoals.map(g => g.goal_id || g.id);

  return exercises.filter(exercise => {
    const supported = exercise.goalsSupported || [];
    if (supported.length === 0) return true;

    // Include if exercise supports any of the user's goals
    return supported.some(goal => goalIds.includes(goal));
  });
}

// ─── Filter by Difficulty ─────────────────────────────────────────────────────
export function filterByDifficulty(exercises, fitnessLevel) {
  const difficultyMap = {
    beginner: ['beginner'],
    intermediate: ['beginner', 'intermediate'],
    advanced: ['beginner', 'intermediate', 'advanced']
  };

  const allowedLevels = difficultyMap[fitnessLevel] || ['beginner'];

  return exercises.filter(exercise =>
    allowedLevels.includes(exercise.difficulty_level)
  );
}

// ─── Filter by Movement Pattern ───────────────────────────────────────────────
export function filterByMovementPattern(exercises, patterns) {
  if (!patterns || patterns.length === 0) return exercises;

  return exercises.filter(exercise =>
    patterns.includes(exercise.movement_pattern)
  );
}

// ─── Get Exercises for Movement Pattern ──────────────────────────────────────
export function getExercisesForPattern(exercises, pattern, count = 2) {
  const filtered = exercises.filter(ex =>
    ex.movement_pattern === pattern
  );

  // Shuffle and take count
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Apply All Filters ────────────────────────────────────────────────────────
export function applyAllFilters(exercises, {
  userEquipment,
  userInjuries,
  userGoals,
  fitnessLevel
}) {
  let filtered = [...exercises];

  // Apply equipment filter
  filtered = filterByEquipment(filtered, userEquipment || []);
  console.log(`📊 After equipment filter: ${filtered.length} exercises`);

  // Apply injury filter
  filtered = filterByInjuries(filtered, userInjuries || []);
  console.log(`📊 After injury filter: ${filtered.length} exercises`);

  // Apply goal filter
  filtered = filterByGoals(filtered, userGoals || []);
  console.log(`📊 After goal filter: ${filtered.length} exercises`);

  // Apply difficulty filter
  filtered = filterByDifficulty(filtered, fitnessLevel || 'beginner');
  console.log(`📊 After difficulty filter: ${filtered.length} exercises`);

  return filtered;
}