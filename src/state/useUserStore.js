import { create } from 'zustand';
import { getDatabase } from '../database/database';

const useUserStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────
  userProfile: null,
  userEquipment: [],
  userGoals: [],
  userInjuries: [],
  userPreferences: null,
  isProfileComplete: false,
  isLoading: false,
  error: null,

  // ─── Load User Profile from Database ─────────────────────
  loadUserProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();

      // Load profile
      const profile = await db.getFirstAsync(
        `SELECT * FROM user_profile ORDER BY id DESC LIMIT 1`
      );

      if (!profile) {
        set({ userProfile: null, isProfileComplete: false, isLoading: false });
        return;
      }

      // Load equipment
      const equipment = await db.getAllAsync(
        `SELECT * FROM user_equipment WHERE user_id = ?`,
        [profile.id]
      );

      // Load goals
      const goals = await db.getAllAsync(
        `SELECT * FROM user_goals WHERE user_id = ?`,
        [profile.id]
      );

      // Load injuries
      const injuries = await db.getAllAsync(
        `SELECT * FROM user_injuries WHERE user_id = ? AND active = 1`,
        [profile.id]
      );

      // Load preferences
      const preferences = await db.getFirstAsync(
        `SELECT * FROM user_preferences WHERE user_id = ?`,
        [profile.id]
      );

      set({
        userProfile: profile,
        userEquipment: equipment || [],
        userGoals: goals || [],
        userInjuries: injuries || [],
        userPreferences: preferences || null,
        isProfileComplete: profile.setup_completed === 1,
        isLoading: false,
        error: null
      });

      console.log('✅ User profile loaded:', profile.name);

    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ─── Save User Profile ────────────────────────────────────
  saveUserProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();

      const existing = await db.getFirstAsync(
        `SELECT id FROM user_profile LIMIT 1`
      );

      let userId;

      if (existing) {
        // Update existing profile
        await db.runAsync(
          `UPDATE user_profile SET
            name = ?, age = ?, gender = ?,
            height_cm = ?, weight_kg = ?,
            fitness_level = ?, training_age_months = ?,
            setup_completed = ?, updated_at = datetime('now')
          WHERE id = ?`,
          [
            profileData.name,
            profileData.age,
            profileData.gender,
            profileData.height_cm,
            profileData.weight_kg,
            profileData.fitness_level,
            profileData.training_age_months,
            profileData.setup_completed ? 1 : 0,
            existing.id
          ]
        );
        userId = existing.id;
      } else {
        // Insert new profile
        const result = await db.runAsync(
          `INSERT INTO user_profile
            (name, age, gender, height_cm, weight_kg, fitness_level, training_age_months, setup_completed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            profileData.name,
            profileData.age,
            profileData.gender,
            profileData.height_cm,
            profileData.weight_kg,
            profileData.fitness_level,
            profileData.training_age_months || 0,
            profileData.setup_completed ? 1 : 0
          ]
        );
        userId = result.lastInsertRowId;
      }

      // Reload profile after save
      await get().loadUserProfile();
      console.log('✅ User profile saved successfully');
      return userId;

    } catch (error) {
      console.error('❌ Failed to save user profile:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // ─── Save User Equipment ──────────────────────────────────
  saveUserEquipment: async (userId, equipmentList) => {
    try {
      const db = await getDatabase();

      // Clear existing equipment
      await db.runAsync(
        `DELETE FROM user_equipment WHERE user_id = ?`,
        [userId]
      );

      // Insert new equipment
      for (const equipment of equipmentList) {
        await db.runAsync(
          `INSERT INTO user_equipment (user_id, equipment_id, equipment_name)
          VALUES (?, ?, ?)`,
          [userId, equipment.id, equipment.name]
        );
      }

      set({ userEquipment: equipmentList });
      console.log('✅ Equipment saved:', equipmentList.length, 'items');

    } catch (error) {
      console.error('❌ Failed to save equipment:', error);
      set({ error: error.message });
    }
  },

  // ─── Save User Goals ──────────────────────────────────────
  saveUserGoals: async (userId, goalsList) => {
    try {
      const db = await getDatabase();

      // Clear existing goals
      await db.runAsync(
        `DELETE FROM user_goals WHERE user_id = ?`,
        [userId]
      );

      // Insert new goals
      for (const goal of goalsList) {
        await db.runAsync(
          `INSERT INTO user_goals (user_id, goal_id, goal_name, is_primary)
          VALUES (?, ?, ?, ?)`,
          [userId, goal.id, goal.name, goal.isPrimary ? 1 : 0]
        );
      }

      set({ userGoals: goalsList });
      console.log('✅ Goals saved:', goalsList.length, 'items');

    } catch (error) {
      console.error('❌ Failed to save goals:', error);
      set({ error: error.message });
    }
  },

  // ─── Save User Injuries ───────────────────────────────────
  saveUserInjuries: async (userId, injuriesList) => {
    try {
      const db = await getDatabase();

      // Clear existing injuries
      await db.runAsync(
        `DELETE FROM user_injuries WHERE user_id = ?`,
        [userId]
      );

      // Insert new injuries
      for (const injury of injuriesList) {
        await db.runAsync(
          `INSERT INTO user_injuries (user_id, injury_type, severity, notes, active)
          VALUES (?, ?, ?, ?, 1)`,
          [userId, injury.type, injury.severity, injury.notes || '']
        );
      }

      set({ userInjuries: injuriesList });
      console.log('✅ Injuries saved:', injuriesList.length, 'items');

    } catch (error) {
      console.error('❌ Failed to save injuries:', error);
      set({ error: error.message });
    }
  },

  // ─── Save User Preferences ────────────────────────────────
  saveUserPreferences: async (userId, preferencesData) => {
    try {
      const db = await getDatabase();

      const existing = await db.getFirstAsync(
        `SELECT id FROM user_preferences WHERE user_id = ?`,
        [userId]
      );

      if (existing) {
        await db.runAsync(
          `UPDATE user_preferences SET
            workout_frequency = ?,
            session_duration_minutes = ?,
            preferred_split_id = ?,
            preferred_workout_days = ?,
            units = ?,
            updated_at = datetime('now')
          WHERE user_id = ?`,
          [
            preferencesData.workout_frequency,
            preferencesData.session_duration_minutes,
            preferencesData.preferred_split_id,
            preferencesData.preferred_workout_days,
            preferencesData.units || 'metric',
            userId
          ]
        );
      } else {
        await db.runAsync(
          `INSERT INTO user_preferences
            (user_id, workout_frequency, session_duration_minutes, preferred_split_id, preferred_workout_days, units)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            preferencesData.workout_frequency,
            preferencesData.session_duration_minutes,
            preferencesData.preferred_split_id,
            preferencesData.preferred_workout_days,
            preferencesData.units || 'metric'
          ]
        );
      }

      set({ userPreferences: preferencesData });
      console.log('✅ Preferences saved successfully');

    } catch (error) {
      console.error('❌ Failed to save preferences:', error);
      set({ error: error.message });
    }
  },

  // ─── Clear User State ─────────────────────────────────────
  clearUserState: () => {
    set({
      userProfile: null,
      userEquipment: [],
      userGoals: [],
      userInjuries: [],
      userPreferences: null,
      isProfileComplete: false,
      isLoading: false,
      error: null
    });
  }
}));

export default useUserStore;