import { runMigrations } from './migrations';
import { getDatabase } from './database';
import { createUserTables } from './schemas/userSchema';
import { createWorkoutTables } from './schemas/workoutSchema';
import { seedReferenceData } from './seedData';

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');

    const db = await getDatabase();

    // Step 1: Create user tables
    await createUserTables();

    // Step 2: Create workout tables
    await createWorkoutTables();

    // Step 3: Create app metadata table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Step 4: Check if first launch
    const result = await db.getFirstAsync(
      `SELECT value FROM app_metadata WHERE key = 'db_initialized'`
    );

    if (!result) {
      // First launch — seed all reference data
      await seedReferenceData();

      // Save metadata
         await db.runAsync(
      `INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)`,
      ['db_initialized', 'true']
    );
    await db.runAsync(
      `INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)`,
      ['db_version', '1.0']
    );
    await db.runAsync(
      `INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)`,
      ['app_version', '1.0.0']
    );
      console.log('✅ First launch — reference data seeded');
    } else {
      console.log('ℹ️ Database already initialized — skipping seed');
    }
    // Step 5: Run any pending migrations
    await runMigrations();
    console.log('✅ Database initialized successfully');
    return true;

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

export async function getDatabaseStatus() {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      `SELECT value FROM app_metadata WHERE key = 'db_initialized'`
    );
    return result ? true : false;
  } catch (error) {
    return false;
  }
}

export async function clearDatabase() {
  try {
    const db = await getDatabase();
    await db.execAsync(`DROP TABLE IF EXISTS exercise_feedback;`);
    await db.execAsync(`DROP TABLE IF EXISTS workout_exercise;`);
    await db.execAsync(`DROP TABLE IF EXISTS workout_day;`);
    await db.execAsync(`DROP TABLE IF EXISTS workout_plan;`);
    await db.execAsync(`DROP TABLE IF EXISTS progress_snapshot;`);
    await db.execAsync(`DROP TABLE IF EXISTS exercise_progression;`);
    await db.execAsync(`DROP TABLE IF EXISTS session_log;`);
    await db.execAsync(`DROP TABLE IF EXISTS body_metrics_history;`);
    await db.execAsync(`DROP TABLE IF EXISTS user_preferences;`);
    await db.execAsync(`DROP TABLE IF EXISTS user_injuries;`);
    await db.execAsync(`DROP TABLE IF EXISTS user_goals;`);
    await db.execAsync(`DROP TABLE IF EXISTS user_equipment;`);
    await db.execAsync(`DROP TABLE IF EXISTS user_profile;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_exercises;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_equipment;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_muscle_groups;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_movement_patterns;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_goal_profiles;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_workout_splits;`);
    await db.execAsync(`DROP TABLE IF EXISTS ref_progression_rules;`);
    await db.execAsync(`DROP TABLE IF EXISTS app_metadata;`);
    console.log('✅ Database cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Database clear failed:', error);
    return false;
  }
}