import { getExercisesForPattern } from './exerciseFilter';

// ─── Movement Pattern Templates by Split Day ──────────────────────────────────

const DAY_TEMPLATES = {
  // Full Body Templates
  full_body_A: {
    name: 'Full Body A',
    patterns: [
      { pattern: 'squat', count: 1, required: true },
      { pattern: 'push_horizontal', count: 1, required: true },
      { pattern: 'pull_horizontal', count: 1, required: true },
      { pattern: 'hinge', count: 1, required: false },
      { pattern: 'core_anti_extension', count: 1, required: false }
    ]
  },
  full_body_B: {
    name: 'Full Body B',
    patterns: [
      { pattern: 'hinge', count: 1, required: true },
      { pattern: 'push_vertical', count: 1, required: true },
      { pattern: 'pull_vertical', count: 1, required: false },
      { pattern: 'lunge', count: 1, required: false },
      { pattern: 'core_flexion', count: 1, required: false }
    ]
  },
  full_body_C: {
    name: 'Full Body C',
    patterns: [
      { pattern: 'squat', count: 1, required: true },
      { pattern: 'push_horizontal', count: 1, required: true },
      { pattern: 'pull_horizontal', count: 1, required: true },
      { pattern: 'conditioning', count: 1, required: false },
      { pattern: 'mobility', count: 1, required: false }
    ]
  },

  // Upper Body Templates
  upper_A: {
    name: 'Upper Body A',
    patterns: [
      { pattern: 'push_horizontal', count: 2, required: true },
      { pattern: 'pull_horizontal', count: 2, required: true },
      { pattern: 'push_vertical', count: 1, required: false },
      { pattern: 'isolation', count: 1, required: false }
    ]
  },
  upper_B: {
    name: 'Upper Body B',
    patterns: [
      { pattern: 'pull_vertical', count: 2, required: true },
      { pattern: 'push_vertical', count: 2, required: true },
      { pattern: 'pull_horizontal', count: 1, required: false },
      { pattern: 'isolation', count: 1, required: false }
    ]
  },

  // Lower Body Templates
  lower_A: {
    name: 'Lower Body A',
    patterns: [
      { pattern: 'squat', count: 2, required: true },
      { pattern: 'hinge', count: 1, required: true },
      { pattern: 'lunge', count: 1, required: false },
      { pattern: 'core_anti_extension', count: 1, required: false }
    ]
  },
  lower_B: {
    name: 'Lower Body B',
    patterns: [
      { pattern: 'hinge', count: 2, required: true },
      { pattern: 'lunge', count: 1, required: true },
      { pattern: 'squat', count: 1, required: false },
      { pattern: 'core_flexion', count: 1, required: false }
    ]
  },

  // Push Template
  push: {
    name: 'Push Day',
    patterns: [
      { pattern: 'push_horizontal', count: 2, required: true },
      { pattern: 'push_vertical', count: 2, required: true },
      { pattern: 'isolation', count: 2, required: false }
    ]
  },

  // Pull Template
  pull: {
    name: 'Pull Day',
    patterns: [
      { pattern: 'pull_horizontal', count: 2, required: true },
      { pattern: 'pull_vertical', count: 2, required: true },
      { pattern: 'isolation', count: 2, required: false }
    ]
  },

  // Legs Template
  legs: {
    name: 'Leg Day',
    patterns: [
      { pattern: 'squat', count: 2, required: true },
      { pattern: 'hinge', count: 2, required: true },
      { pattern: 'lunge', count: 1, required: false },
      { pattern: 'core_anti_extension', count: 1, required: false }
    ]
  },

  // Conditioning Template
  conditioning: {
    name: 'Conditioning',
    patterns: [
      { pattern: 'conditioning', count: 3, required: true },
      { pattern: 'core_flexion', count: 2, required: false },
      { pattern: 'mobility', count: 1, required: false }
    ]
  }
};

// ─── Get Prescription Based on Goal and Difficulty ───────────────────────────
function getPrescription(exercise, fitnessLevel, primaryGoal) {
  const prescription = exercise.defaultPrescription || {};
  const levelPrescription = prescription[fitnessLevel] || prescription['beginner'] || {
    sets: 3,
    reps: 10,
    restSeconds: 60,
    tempo: '2-1-2-1'
  };

  // Adjust based on goal
  let sets = levelPrescription.sets || 3;
  let reps = levelPrescription.reps || 10;
  let restSeconds = levelPrescription.restSeconds || 60;

  switch (primaryGoal) {
    case 'strength':
      sets = Math.min(sets + 1, 5);
      reps = typeof reps === 'number' ? Math.max(reps - 3, 3) : reps;
      restSeconds = Math.max(restSeconds + 60, 180);
      break;
    case 'endurance':
      sets = Math.max(sets - 1, 2);
      reps = typeof reps === 'number' ? Math.min(reps + 5, 20) : reps;
      restSeconds = Math.max(restSeconds - 15, 30);
      break;
    case 'fat_loss':
      restSeconds = Math.max(restSeconds - 15, 30);
      break;
    case 'muscle_gain':
      sets = Math.min(sets + 1, 4);
      reps = typeof reps === 'number' ? Math.min(reps + 2, 15) : reps;
      break;
    default:
      break;
  }

  return {
    sets,
    reps: reps.toString(),
    restSeconds,
    tempo: levelPrescription.tempo || '2-1-2-1'
  };
}

// ─── Build Single Session ─────────────────────────────────────────────────────
export function buildSession(
  availableExercises,
  templateKey,
  fitnessLevel,
  primaryGoal,
  sessionDurationMinutes
) {
  const template = DAY_TEMPLATES[templateKey];
  if (!template) {
    console.error('❌ Unknown template:', templateKey);
    return null;
  }

  const selectedExercises = [];
  const usedExerciseIds = new Set();

  // Calculate max exercises based on duration
  // Average exercise takes ~8-10 minutes including rest
  const maxExercises = Math.floor(sessionDurationMinutes / 8);
  const targetExercises = Math.min(maxExercises, 6);

  // Build exercises from template patterns
  for (const slot of template.patterns) {
    if (selectedExercises.length >= targetExercises) break;

    const patternExercises = availableExercises.filter(ex =>
      ex.movement_pattern === slot.pattern &&
      !usedExerciseIds.has(ex.id)
    );

    if (patternExercises.length === 0) {
      if (slot.required) {
        console.log(`⚠️ No exercises found for required pattern: ${slot.pattern}`);
      }
      continue;
    }

    // Shuffle for variety
    const shuffled = patternExercises.sort(() => Math.random() - 0.5);
    const count = Math.min(slot.count, shuffled.length, targetExercises - selectedExercises.length);

    for (let i = 0; i < count; i++) {
      const exercise = shuffled[i];
      const prescription = getPrescription(exercise, fitnessLevel, primaryGoal);

      selectedExercises.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        movementPattern: exercise.movement_pattern,
        difficultyLevel: exercise.difficulty_level,
        primaryMuscles: exercise.primaryMuscles,
        prescribedSets: prescription.sets,
        prescribedReps: prescription.reps,
        prescribedRestSeconds: prescription.restSeconds,
        prescribedTempo: prescription.tempo,
        orderIndex: selectedExercises.length
      });

      usedExerciseIds.add(exercise.id);
    }
  }

  // Add warmup and cooldown if time allows
  if (selectedExercises.length < targetExercises) {
    // Add mobility/warmup exercise
    const mobilityExercises = availableExercises.filter(ex =>
      (ex.movement_pattern === 'mobility' || ex.warmup_compatible === 1) &&
      !usedExerciseIds.has(ex.id)
    );

    if (mobilityExercises.length > 0) {
      const warmup = mobilityExercises[Math.floor(Math.random() * mobilityExercises.length)];
      const prescription = getPrescription(warmup, fitnessLevel, primaryGoal);

      selectedExercises.unshift({
        exerciseId: warmup.id,
        exerciseName: warmup.name,
        movementPattern: warmup.movement_pattern,
        difficultyLevel: warmup.difficulty_level,
        primaryMuscles: warmup.primaryMuscles,
        prescribedSets: 2,
        prescribedReps: prescription.reps,
        prescribedRestSeconds: 30,
        prescribedTempo: 'slow',
        orderIndex: 0
      });

      usedExerciseIds.add(warmup.id);
    }
  }

  // Re-index order
  selectedExercises.forEach((ex, index) => {
    ex.orderIndex = index;
  });

  console.log(`✅ Session built: ${template.name} — ${selectedExercises.length} exercises`);

  return {
    name: template.name,
    templateKey,
    exercises: selectedExercises,
    estimatedDuration: selectedExercises.length * 8
  };
}

// ─── Get Split Templates for Frequency ───────────────────────────────────────
export function getSplitTemplatesForFrequency(frequency, splitId) {
  const splitTemplates = {
    // Full Body Splits
    full_body_1day: ['full_body_A'],
    full_body_2day: ['full_body_A', 'full_body_B'],
    full_body_3day: ['full_body_A', 'full_body_B', 'full_body_C'],

    // Upper Lower Splits
    upper_lower_4day: ['upper_A', 'lower_A', 'upper_B', 'lower_B'],
    upper_lower_5day: ['upper_A', 'lower_A', 'upper_B', 'lower_B', 'conditioning'],

    // PPL Splits
    push_pull_legs_5day: ['push', 'pull', 'legs', 'push', 'pull'],
    push_pull_legs_6day: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],

    // Body Part Splits
    body_part_4day: ['push', 'legs', 'pull', 'conditioning'],
    body_part_5day: ['push', 'pull', 'legs', 'upper_A', 'lower_A'],
    body_part_6day: ['push', 'pull', 'legs', 'upper_B', 'lower_B', 'conditioning']
  };

  // Get templates for split
  const templates = splitTemplates[splitId];
  if (templates) return templates;

  // Fallback based on frequency
  const fallbacks = {
    1: ['full_body_A'],
    2: ['full_body_A', 'full_body_B'],
    3: ['full_body_A', 'full_body_B', 'full_body_C'],
    4: ['upper_A', 'lower_A', 'upper_B', 'lower_B'],
    5: ['push', 'pull', 'legs', 'upper_A', 'lower_A'],
    6: ['push', 'pull', 'legs', 'push', 'pull', 'legs']
  };

  return fallbacks[frequency] || fallbacks[3];
}

// ─── Build Weekly Session Plan ────────────────────────────────────────────────
export function buildWeeklySessionPlan(
  availableExercises,
  frequency,
  splitId,
  fitnessLevel,
  primaryGoal,
  sessionDurationMinutes
) {
  const templates = getSplitTemplatesForFrequency(frequency, splitId);
  const sessions = [];

  for (let i = 0; i < frequency; i++) {
    const templateKey = templates[i % templates.length];
    const session = buildSession(
      availableExercises,
      templateKey,
      fitnessLevel,
      primaryGoal,
      sessionDurationMinutes
    );

    if (session) {
      sessions.push({
        dayNumber: i + 1,
        ...session
      });
    }
  }

  console.log(`✅ Weekly plan built: ${sessions.length} sessions`);
  return sessions;
}