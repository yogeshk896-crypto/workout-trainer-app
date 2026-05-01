import { generateWorkoutPlan, checkActivePlan } from './planGenerator';
import { autoSubstitutePainExercises } from './substitutionEngine';
import { saveWeeklySnapshot, generateProgressReport } from './progressionTracker';
import { checkDeloadNeeded } from './progressionEngine';
import { getDatabase } from '../database/database';

// ─── Initialize App State ─────────────────────────────────────────────────────
export async function initializeAppState(userId) {
  try {
    console.log('🚀 Initializing app state for user:', userId);

    // Check for active plan
    const activePlan = await checkActivePlan(userId);

    if (!activePlan) {
      console.log('ℹ️ No active plan — generating new plan');
      const planId = await generateWorkoutPlan(userId);

      if (planId) {
        console.log('✅ Plan auto-generated:', planId);
        return { planGenerated: true, planId };
      }
    } else {
      console.log('✅ Active plan found:', activePlan.plan_name);

      // Check if deload needed
      const deloadCheck = await checkDeloadNeeded(userId);
      if (deloadCheck.deloadNeeded) {
        console.log('⚠️ Deload recommended:', deloadCheck.reason);
      }

      // Auto substitute pain exercises
      if (activePlan.id) {
        const db = await getDatabase();
        const userEquipment = await db.getAllAsync(
          `SELECT * FROM user_equipment WHERE user_id = ?`,
          [userId]
        );
        const userInjuries = await db.getAllAsync(
          `SELECT * FROM user_injuries WHERE user_id = ? AND active = 1`,
          [userId]
        );

        const substitutions = await autoSubstitutePainExercises(
          userId,
          activePlan.id,
          userEquipment,
          userInjuries
        );

        if (substitutions.length > 0) {
          console.log('🔄 Auto-substituted exercises:', substitutions.length);
        }
      }

      return {
        planGenerated: false,
        activePlan,
        deloadCheck
      };
    }

    return { planGenerated: false };

  } catch (error) {
    console.error('❌ App state initialization failed:', error);
    return { error: error.message };
  }
}

// ─── End of Week Processing ───────────────────────────────────────────────────
export async function processEndOfWeek(userId, planId) {
  try {
    console.log('📅 Processing end of week...');

    // Save weekly snapshot
    const weekNumber = await saveWeeklySnapshot(userId, planId);

    // Generate progress report
    const report = await generateProgressReport(userId);

    // Check deload
    const deloadCheck = await checkDeloadNeeded(userId);

    console.log('✅ End of week processing complete');

    return {
      weekNumber,
      report,
      deloadCheck
    };

  } catch (error) {
    console.error('❌ End of week processing failed:', error);
    return null;
  }
}

// ─── Get App Health Status ────────────────────────────────────────────────────
export async function getAppHealthStatus(userId) {
  try {
    const db = await getDatabase();

    const profile = await db.getFirstAsync(
      `SELECT * FROM user_profile WHERE id = ?`,
      [userId]
    );

    const activePlan = await checkActivePlan(userId);

    const totalSessions = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM session_log WHERE user_id = ?`,
      [userId]
    );

    const pendingWorkouts = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM workout_day wd
       JOIN workout_plan wp ON wd.plan_id = wp.id
       WHERE wp.user_id = ? AND wp.is_active = 1
       AND wd.scheduled_date <= date('now')
       AND wd.is_completed = 0
       AND wd.is_rest_day = 0`,
      [userId]
    );

    return {
      hasProfile: !!profile,
      hasActivePlan: !!activePlan,
      totalSessions: totalSessions?.count || 0,
      pendingWorkouts: pendingWorkouts?.count || 0,
      planName: activePlan?.plan_name || null,
      fitnessLevel: profile?.fitness_level || null
    };

  } catch (error) {
    console.error('❌ Health check failed:', error);
    return null;
  }
}