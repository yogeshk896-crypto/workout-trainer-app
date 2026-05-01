import * as SQLite from 'expo-sqlite';

// Database name — all app data stored here offline
const DATABASE_NAME = 'workout_trainer.db';

// Single database instance shared across the app
let db = null;

export async function getDatabase() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export default getDatabase;