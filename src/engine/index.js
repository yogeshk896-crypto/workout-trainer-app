export {
  generateWorkoutPlan,
  checkActivePlan,
  getTodaysWorkout,
  getPlanStatistics
} from './planGenerator';

export {
  loadAllExercises,
  applyAllFilters,
  filterByEquipment,
  filterByInjuries,
  filterByGoals,
  filterByDifficulty
} from './exerciseFilter';

export {
  buildWeeklySessionPlan,
  buildSession,
  getSplitTemplatesForFrequency
} from './sessionBuilder';

export {
  analyzeExerciseFeedback,
  analyzeSessionFeedback,
  getExerciseProgressionState,
  updateExerciseProgressionState
} from './feedbackAnalyzer';

export {
  applyProgressionRule,
  processSessionFeedback,
  calculateNewPrescription,
  getWeeklyProgressionSummary,
  checkDeloadNeeded
} from './progressionEngine';

export {
  findSafeSubstitute,
  applySubstitutionToWorkout,
  autoSubstitutePainExercises,
  getSubstitutionHistory
} from './substitutionEngine';

export {
  checkAndSavePersonalRecord,
  getPersonalRecords,
  trackSessionVolume,
  generateProgressReport,
  getMuscleGroupVolume,
  getStrengthTrend,
  saveWeeklySnapshot
} from './progressionTracker';

export {
  initializeAppState,
  processEndOfWeek,
  getAppHealthStatus
} from './appController';