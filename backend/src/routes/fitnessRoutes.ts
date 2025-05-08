import express from 'express';
import {
  getAllWorkouts, getWorkout, addWorkout, editWorkout, removeWorkout,
  getWorkoutExercises, getExercise, addExercise, editExercise, removeExercise,
  getAllNutrition, getNutritionByDateRange, getNutritionEntry, addNutritionEntry, editNutritionEntry, removeNutritionEntry,
  getAllMeasurements, getMeasurement, getLatest, addMeasurement, editMeasurement, removeMeasurement,
  getAllFitnessGoals, getFitnessGoal, addFitnessGoal, editFitnessGoal, removeFitnessGoal,
  getWorkoutStatistics, getWeeklyWorkouts, getDailyNutrition, getWeightProgressData
} from '../controllers/fitnessController';

const router = express.Router();

// Workout routes
router.get('/workouts', getAllWorkouts);
router.get('/workouts/:id', getWorkout);
router.post('/workouts', addWorkout);
router.put('/workouts/:id', editWorkout);
router.delete('/workouts/:id', removeWorkout);

// Exercise routes
router.get('/workouts/:workoutId/exercises', getWorkoutExercises);
router.get('/exercises/:id', getExercise);
router.post('/exercises', addExercise);
router.put('/exercises/:id', editExercise);
router.delete('/exercises/:id', removeExercise);

// Nutrition routes
router.get('/nutrition', getAllNutrition);
router.get('/nutrition/date/:date', getNutritionByDateRange);
router.get('/nutrition/:id', getNutritionEntry);
router.post('/nutrition', addNutritionEntry);
router.put('/nutrition/:id', editNutritionEntry);
router.delete('/nutrition/:id', removeNutritionEntry);

// Body measurement routes
router.get('/measurements', getAllMeasurements);
router.get('/measurements/latest', getLatest);
router.get('/measurements/:id', getMeasurement);
router.post('/measurements', addMeasurement);
router.put('/measurements/:id', editMeasurement);
router.delete('/measurements/:id', removeMeasurement);

// Fitness goal routes
router.get('/goals', getAllFitnessGoals);
router.get('/goals/:id', getFitnessGoal);
router.post('/goals', addFitnessGoal);
router.put('/goals/:id', editFitnessGoal);
router.delete('/goals/:id', removeFitnessGoal);

// Analytics routes
router.get('/analytics/workout-stats', getWorkoutStatistics);
router.get('/analytics/weekly-workouts', getWeeklyWorkouts);
router.get('/analytics/daily-nutrition', getDailyNutrition);
router.get('/analytics/weight-progress', getWeightProgressData);

export default router; 