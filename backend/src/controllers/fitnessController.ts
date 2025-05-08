import { Request, Response } from 'express';
import {
  getWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout,
  getExercisesByWorkout, getExerciseById, createExercise, updateExercise, deleteExercise,
  getNutrition, getNutritionByDate, getNutritionById, createNutrition, updateNutrition, deleteNutrition,
  getMeasurements, getMeasurementById, getLatestMeasurement, createMeasurement, updateMeasurement, deleteMeasurement,
  getFitnessGoals, getFitnessGoalById, createFitnessGoal, updateFitnessGoal, deleteFitnessGoal,
  getWorkoutStats, getWorkoutsByWeek, getNutritionStats, getWeightProgress,
  Workout, Exercise, NutritionEntry, BodyMeasurement, FitnessGoal
} from '../models/fitness';

// Workout Controllers
export const getAllWorkouts = async (req: Request, res: Response) => {
  try {
    const workouts = await getWorkouts();
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
};

export const getWorkout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workout = await getWorkoutById(parseInt(id));
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
};

export const addWorkout = async (req: Request, res: Response) => {
  try {
    const workoutData: Workout = req.body;
    
    // Validate required fields
    if (!workoutData.name || !workoutData.date || !workoutData.duration) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const newWorkout = await createWorkout(workoutData);
    res.status(201).json(newWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
};

export const editWorkout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workoutData: Workout = req.body;
    
    // Validate required fields
    if (!workoutData.name || !workoutData.date || !workoutData.duration) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const updatedWorkout = await updateWorkout(parseInt(id), workoutData);
    
    if (!updatedWorkout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
};

export const removeWorkout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteWorkout(parseInt(id));
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
};

// Exercise Controllers
export const getWorkoutExercises = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;
    const exercises = await getExercisesByWorkout(parseInt(workoutId));
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
};

export const getExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exercise = await getExerciseById(parseInt(id));
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
};

export const addExercise = async (req: Request, res: Response) => {
  try {
    const exerciseData: Exercise = req.body;
    
    // Validate required fields
    if (!exerciseData.workout_id || !exerciseData.name) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const newExercise = await createExercise(exerciseData);
    res.status(201).json(newExercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
};

export const editExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exerciseData: Exercise = req.body;
    
    // Validate required fields
    if (!exerciseData.workout_id || !exerciseData.name) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const updatedExercise = await updateExercise(parseInt(id), exerciseData);
    
    if (!updatedExercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    res.json(updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
};

export const removeExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteExercise(parseInt(id));
    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
};

// Nutrition Controllers
export const getAllNutrition = async (req: Request, res: Response) => {
  try {
    const nutrition = await getNutrition();
    res.json(nutrition);
  } catch (error) {
    console.error('Error fetching nutrition entries:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition entries' });
  }
};

export const getNutritionByDateRange = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const nutrition = await getNutritionByDate(date);
    res.json(nutrition);
  } catch (error) {
    console.error('Error fetching nutrition entries by date:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition entries by date' });
  }
};

export const getNutritionEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nutrition = await getNutritionById(parseInt(id));
    
    if (!nutrition) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }
    
    res.json(nutrition);
  } catch (error) {
    console.error('Error fetching nutrition entry:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition entry' });
  }
};

export const addNutritionEntry = async (req: Request, res: Response) => {
  try {
    const nutritionData: NutritionEntry = req.body;
    
    // Validate required fields
    if (!nutritionData.date || !nutritionData.meal_type || !nutritionData.food_name || !nutritionData.calories) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const newNutrition = await createNutrition(nutritionData);
    res.status(201).json(newNutrition);
  } catch (error) {
    console.error('Error creating nutrition entry:', error);
    res.status(500).json({ error: 'Failed to create nutrition entry' });
  }
};

export const editNutritionEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nutritionData: NutritionEntry = req.body;
    
    // Validate required fields
    if (!nutritionData.date || !nutritionData.meal_type || !nutritionData.food_name || !nutritionData.calories) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const updatedNutrition = await updateNutrition(parseInt(id), nutritionData);
    
    if (!updatedNutrition) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }
    
    res.json(updatedNutrition);
  } catch (error) {
    console.error('Error updating nutrition entry:', error);
    res.status(500).json({ error: 'Failed to update nutrition entry' });
  }
};

export const removeNutritionEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteNutrition(parseInt(id));
    res.json({ message: 'Nutrition entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting nutrition entry:', error);
    res.status(500).json({ error: 'Failed to delete nutrition entry' });
  }
};

// Body Measurement Controllers
export const getAllMeasurements = async (req: Request, res: Response) => {
  try {
    const measurements = await getMeasurements();
    res.json(measurements);
  } catch (error) {
    console.error('Error fetching body measurements:', error);
    res.status(500).json({ error: 'Failed to fetch body measurements' });
  }
};

export const getMeasurement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const measurement = await getMeasurementById(parseInt(id));
    
    if (!measurement) {
      return res.status(404).json({ error: 'Body measurement not found' });
    }
    
    res.json(measurement);
  } catch (error) {
    console.error('Error fetching body measurement:', error);
    res.status(500).json({ error: 'Failed to fetch body measurement' });
  }
};

export const getLatest = async (req: Request, res: Response) => {
  try {
    const measurement = await getLatestMeasurement();
    
    if (!measurement) {
      return res.status(404).json({ error: 'No body measurements found' });
    }
    
    res.json(measurement);
  } catch (error) {
    console.error('Error fetching latest body measurement:', error);
    res.status(500).json({ error: 'Failed to fetch latest body measurement' });
  }
};

export const addMeasurement = async (req: Request, res: Response) => {
  try {
    const measurementData: BodyMeasurement = req.body;
    
    // Validate required fields
    if (!measurementData.date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const newMeasurement = await createMeasurement(measurementData);
    res.status(201).json(newMeasurement);
  } catch (error) {
    console.error('Error creating body measurement:', error);
    res.status(500).json({ error: 'Failed to create body measurement' });
  }
};

export const editMeasurement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const measurementData: BodyMeasurement = req.body;
    
    // Validate required fields
    if (!measurementData.date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const updatedMeasurement = await updateMeasurement(parseInt(id), measurementData);
    
    if (!updatedMeasurement) {
      return res.status(404).json({ error: 'Body measurement not found' });
    }
    
    res.json(updatedMeasurement);
  } catch (error) {
    console.error('Error updating body measurement:', error);
    res.status(500).json({ error: 'Failed to update body measurement' });
  }
};

export const removeMeasurement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteMeasurement(parseInt(id));
    res.json({ message: 'Body measurement deleted successfully' });
  } catch (error) {
    console.error('Error deleting body measurement:', error);
    res.status(500).json({ error: 'Failed to delete body measurement' });
  }
};

// Fitness Goal Controllers
export const getAllFitnessGoals = async (req: Request, res: Response) => {
  try {
    const goals = await getFitnessGoals();
    res.json(goals);
  } catch (error) {
    console.error('Error fetching fitness goals:', error);
    res.status(500).json({ error: 'Failed to fetch fitness goals' });
  }
};

export const getFitnessGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = await getFitnessGoalById(parseInt(id));
    
    if (!goal) {
      return res.status(404).json({ error: 'Fitness goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Error fetching fitness goal:', error);
    res.status(500).json({ error: 'Failed to fetch fitness goal' });
  }
};

export const addFitnessGoal = async (req: Request, res: Response) => {
  try {
    const goalData: FitnessGoal = req.body;
    
    // Validate required fields
    if (!goalData.name || !goalData.target_value || !goalData.current_value || !goalData.goal_type || !goalData.measurement_unit || !goalData.target_date || !goalData.status) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const newGoal = await createFitnessGoal(goalData);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating fitness goal:', error);
    res.status(500).json({ error: 'Failed to create fitness goal' });
  }
};

export const editFitnessGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goalData: FitnessGoal = req.body;
    
    // Validate required fields
    if (!goalData.name || !goalData.target_value || !goalData.current_value || !goalData.goal_type || !goalData.measurement_unit || !goalData.target_date || !goalData.status) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const updatedGoal = await updateFitnessGoal(parseInt(id), goalData);
    
    if (!updatedGoal) {
      return res.status(404).json({ error: 'Fitness goal not found' });
    }
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    res.status(500).json({ error: 'Failed to update fitness goal' });
  }
};

export const removeFitnessGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteFitnessGoal(parseInt(id));
    res.json({ message: 'Fitness goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting fitness goal:', error);
    res.status(500).json({ error: 'Failed to delete fitness goal' });
  }
};

// Analytics Controllers
export const getWorkoutStatistics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const stats = await getWorkoutStats(startDate as string, endDate as string);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching workout statistics:', error);
    res.status(500).json({ error: 'Failed to fetch workout statistics' });
  }
};

export const getWeeklyWorkouts = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const weeklyWorkouts = await getWorkoutsByWeek(startDate as string, endDate as string);
    res.json(weeklyWorkouts);
  } catch (error) {
    console.error('Error fetching weekly workouts:', error);
    res.status(500).json({ error: 'Failed to fetch weekly workouts' });
  }
};

export const getDailyNutrition = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const nutritionStats = await getNutritionStats(date as string);
    res.json(nutritionStats);
  } catch (error) {
    console.error('Error fetching daily nutrition stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily nutrition stats' });
  }
};

export const getWeightProgressData = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const weightProgress = await getWeightProgress(startDate as string, endDate as string);
    res.json(weightProgress);
  } catch (error) {
    console.error('Error fetching weight progress:', error);
    res.status(500).json({ error: 'Failed to fetch weight progress' });
  }
}; 