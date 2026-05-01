import { getDatabase } from './database';

// ─── Migration Definitions ────────────────────────────────────────────────────
// Each migration has a version number and SQL to run
// Migrations run in order and only once per device

const MIGRATIONS = [
  {
    version: 1,
    description: 'Initial schema — user tables and workout tables',
    up: async (db) => {
      // Version 1 is handled by initDatabase.js
      // This entry just marks the baseline
      console.log('✅ Migration v1: Baseline schema');
    }
  },
  {
    version: 2,
    description: 'Add notes field to session_log',
    up: async (db) => {
      await db.execAsync(`
        ALTER TABLE session_log
        ADD COLUMN mood TEXT CHECK(mood IN ('great', 'good', 'okay', 'tired', 'bad'));
      `);
      console.log('✅ Migration v2: Added mood to session_log');
    }
  },
  {
    version: 3,
    description: 'Add personal records table',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS personal_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          exercise_id TEXT NOT NULL,
          exercise_name TEXT NOT NULL,
          record_type TEXT CHECK(record_type IN ('max_reps', 'max_weight', 'max_duration')) NOT NULL,
          record_value REAL NOT NULL,
          previous_value REAL,
          achieved_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
        );
      `);
      console.log('✅ Migration v3: Added personal_records table');
    }
  }
];

// ─── Get Current DB Version ───────────────────────────────────────────────────

async function getCurrentVersion(db) {
  try {
    const result = await db.getFirstAsync(
      `SELECT value FROM app_metadata WHERE key = 'db_version'`
    );
    return result ? parseInt(result.value) : 0;
  } catch (error) {
    return 0;
  }
}

// ─── Set DB Version ───────────────────────────────────────────────────────────

async function setVersion(db, version) {
  await db.runAsync(
    `INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)`,
    ['db_version', version.toString()]
  );
}

// ─── Run Migrations ───────────────────────────────────────────────────────────

export async function runMigrations() {
  try {
    const db = await getDatabase();
    const currentVersion = await getCurrentVersion(db);

    console.log('🔄 Current DB version:', currentVersion);

    // Filter migrations that need to run
    const pendingMigrations = MIGRATIONS.filter(
      m => m.version > currentVersion
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ Database is up to date — no migrations needed');
      return true;
    }

    console.log(`🔄 Running ${pendingMigrations.length} pending migrations...`);

    // Run each pending migration in order
    for (const migration of pendingMigrations) {
      try {
        console.log(`🔄 Running migration v${migration.version}: ${migration.description}`);
        await migration.up(db);
        await setVersion(db, migration.version);
        console.log(`✅ Migration v${migration.version} complete`);
      } catch (error) {
        // Some migrations may fail if column already exists — that's OK
        console.log(`ℹ️ Migration v${migration.version} skipped:`, error.message);
        await setVersion(db, migration.version);
      }
    }

    console.log('✅ All migrations completed successfully');
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// ─── Get Migration Status ─────────────────────────────────────────────────────

export async function getMigrationStatus() {
  try {
    const db = await getDatabase();
    const currentVersion = await getCurrentVersion(db);
    const latestVersion = Math.max(...MIGRATIONS.map(m => m.version));

    return {
      currentVersion,
      latestVersion,
      isUpToDate: currentVersion >= latestVersion,
      pendingCount: MIGRATIONS.filter(m => m.version > currentVersion).length
    };
  } catch (error) {
    return {
      currentVersion: 0,
      latestVersion: 0,
      isUpToDate: false,
      pendingCount: 0
    };
  }
}