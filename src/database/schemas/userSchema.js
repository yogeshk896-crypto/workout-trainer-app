import { getDatabase } from '../database';

export async function createUserTables() {
  const db = await getDatabase();

  // User Profile Table — stores body metrics and personal info
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'User',
      age INTEGER,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')),
      height_cm REAL,
      weight_kg REAL,
      fitness_level TEXT CHECK(fitness_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
      training_age_months INTEGER DEFAULT 0,
      setup_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // User Equipment Table — stores what equipment user has
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      equipment_id TEXT NOT NULL,
      equipment_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
    );
  `);

  // User Goals Table — stores user fitness goals
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_id TEXT NOT NULL,
      goal_name TEXT NOT NULL,
      is_primary INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
    );
  `);

  // User Injuries Table — stores user injury flags
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_injuries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      injury_type TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('avoid', 'modify', 'caution')) DEFAULT 'avoid',
      notes TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
    );
  `);

  // User Preferences Table — stores workout frequency and duration
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      workout_frequency INTEGER DEFAULT 3,
      session_duration_minutes INTEGER DEFAULT 45,
      preferred_split_id TEXT DEFAULT 'full_body_3day',
      preferred_workout_days TEXT DEFAULT 'mon,wed,fri',
      notifications_enabled INTEGER DEFAULT 1,
      units TEXT CHECK(units IN ('metric', 'imperial')) DEFAULT 'metric',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
    );
  `);

  // Body Metrics History Table — tracks weight/height changes over time
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS body_metrics_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight_kg REAL,
      height_cm REAL,
      body_fat_percentage REAL,
      notes TEXT,
      recorded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ User tables created successfully');
}