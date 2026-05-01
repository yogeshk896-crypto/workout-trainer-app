import { getDatabase } from '../database';

export async function createWorkoutTables() {
  const db = await getDatabase();

  // Workout Plan Table — stores the generated workout plan
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_name TEXT DEFAULT 'My Workout Plan',
      split_id TEXT NOT NULL,
      goal_id TEXT NOT NULL,
      fitness_level TEXT NOT NULL,
      frequency INTEGER NOT NULL,
      session_duration_minutes INTEGER NOT NULL,
      total_weeks INTEGER DEFAULT 12,
      current_week INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
    );
  `);

  // Workout Day Table — stores each day in the plan
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_day (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      day_name TEXT NOT NULL,
      day_label TEXT,
      scheduled_date TEXT,
      is_rest_day INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (plan_id) REFERENCES workout_plan(id) ON DELETE CASCADE
    );
  `);

  // Workout Exercise Table — stores exercises for each day
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_exercise (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_day_id INTEGER NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      prescribed_sets INTEGER NOT NULL,
      prescribed_reps TEXT NOT NULL,
      prescribed_rest_seconds INTEGER NOT NULL,
      prescribed_tempo TEXT,
      difficulty_level TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      is_skipped INTEGER DEFAULT 0,
      substituted_from TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (workout_day_id) REFERENCES workout_day(id) ON DELETE CASCADE
    );
  `);

  // Exercise Feedback Table — stores user feedback per exercise
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercise_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_exercise_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      difficulty_rating TEXT CHECK(difficulty_rating IN ('easy', 'normal', 'hard')) NOT NULL,
      completed_as_prescribed INTEGER DEFAULT 1,
      actual_sets_completed INTEGER,
      actual_reps_completed TEXT,
      pain_reported INTEGER DEFAULT 0,
      pain_location TEXT,
      pain_severity TEXT CHECK(pain_severity IN ('mild', 'moderate', 'severe')),
      form_rating TEXT CHECK(form_rating IN ('poor', 'fair', 'good', 'excellent')),
      notes TEXT,
      recorded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercise(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
    );
  `);

  // Progress Snapshot Table — weekly summary of user progress
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS progress_snapshot (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      week_number INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      workouts_completed INTEGER DEFAULT 0,
      workouts_scheduled INTEGER DEFAULT 0,
      total_exercises_completed INTEGER DEFAULT 0,
      total_sets_completed INTEGER DEFAULT 0,
      easy_feedback_count INTEGER DEFAULT 0,
      normal_feedback_count INTEGER DEFAULT 0,
      hard_feedback_count INTEGER DEFAULT 0,
      pain_reports_count INTEGER DEFAULT 0,
      adherence_percentage REAL DEFAULT 0,
      difficulty_trend TEXT CHECK(difficulty_trend IN ('improving', 'stable', 'declining')) DEFAULT 'stable',
      weight_kg REAL,
      notes TEXT,
      snapshot_date TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES workout_plan(id) ON DELETE CASCADE
    );
  `);

  // Exercise Progression Table — tracks progression per exercise over time
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercise_progression (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      current_sets INTEGER NOT NULL,
      current_reps TEXT NOT NULL,
      current_weight_kg REAL,
      current_rest_seconds INTEGER,
      current_difficulty TEXT NOT NULL,
      consecutive_easy_sessions INTEGER DEFAULT 0,
      consecutive_hard_sessions INTEGER DEFAULT 0,
      total_sessions_completed INTEGER DEFAULT 0,
      last_progression_date TEXT,
      last_regression_date TEXT,
      progression_blocked INTEGER DEFAULT 0,
      pain_flag INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
    );
  `);

  // Session Log Table — logs each completed workout session
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS session_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      workout_day_id INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      duration_minutes INTEGER,
      total_exercises INTEGER DEFAULT 0,
      exercises_completed INTEGER DEFAULT 0,
      exercises_skipped INTEGER DEFAULT 0,
      overall_difficulty TEXT CHECK(overall_difficulty IN ('easy', 'normal', 'hard')),
      overall_rating INTEGER CHECK(overall_rating BETWEEN 1 AND 5),
      calories_estimated INTEGER,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE,
      FOREIGN KEY (workout_day_id) REFERENCES workout_day(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES workout_plan(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Workout tables created successfully');
}