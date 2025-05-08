import { Database } from 'sqlite3';
import sqlite3 from 'sqlite3';
import path from 'path';

// Create a database connection
const db = new sqlite3.Database(path.resolve(__dirname, '../../task.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database for fitness.');
  }
});

// Define interfaces
export interface Workout {
  id?: number;
  name: string;
  date: string;
  duration: number; // in minutes
  calories_burned?: number;
  notes?: string;
  user_id?: number;
  created_at?: string;
}

export interface Exercise {
  id?: number;
  workout_id: number;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // in minutes (for cardio exercises)
  distance?: number; // in kilometers/miles
  notes?: string;
  created_at?: string;
}

export interface NutritionEntry {
  id?: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein?: number; // in grams
  carbs?: number; // in grams
  fat?: number; // in grams
  user_id?: number;
  created_at?: string;
}

export interface BodyMeasurement {
  id?: number;
  date: string;
  weight?: number; // in kg/lbs
  height?: number; // in cm/inches
  body_fat_percentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  user_id?: number;
  created_at?: string;
}

export interface FitnessGoal {
  id?: number;
  name: string;
  target_value: number;
  current_value: number;
  goal_type: 'weight' | 'strength' | 'endurance' | 'other';
  measurement_unit: string;
  target_date: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  user_id?: number;
  created_at?: string;
}

// Create fitness tables
export const createFitnessTables = async (): Promise<void> => {
  try {
    // Workouts table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS fitness_workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          duration INTEGER NOT NULL,
          calories_burned INTEGER,
          notes TEXT,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Exercises table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS fitness_exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          sets INTEGER,
          reps INTEGER,
          weight REAL,
          duration INTEGER,
          distance REAL,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (workout_id) REFERENCES fitness_workouts (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Nutrition entries table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS fitness_nutrition (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          meal_type TEXT NOT NULL,
          food_name TEXT NOT NULL,
          calories INTEGER NOT NULL,
          protein REAL,
          carbs REAL,
          fat REAL,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Body measurements table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS fitness_measurements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          weight REAL,
          height REAL,
          body_fat_percentage REAL,
          chest REAL,
          waist REAL,
          hips REAL,
          arms REAL,
          thighs REAL,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Fitness goals table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS fitness_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          target_value REAL NOT NULL,
          current_value REAL NOT NULL,
          goal_type TEXT NOT NULL,
          measurement_unit TEXT NOT NULL,
          target_date TEXT NOT NULL,
          status TEXT NOT NULL,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Fitness tables created successfully');
  } catch (error) {
    console.error('Error creating fitness tables:', error);
    throw error;
  }
};

// Workout CRUD operations
export const getWorkouts = (): Promise<Workout[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM fitness_workouts ORDER BY date DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Workout[]);
      }
    });
  });
};

export const getWorkoutById = (id: number): Promise<Workout> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM fitness_workouts WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Workout);
      }
    });
  });
};

export const createWorkout = (workout: Workout): Promise<Workout> => {
  return new Promise((resolve, reject) => {
    const { name, date, duration, calories_burned, notes, user_id } = workout;
    db.run(
      `INSERT INTO fitness_workouts (name, date, duration, calories_burned, notes, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, date, duration, calories_burned, notes, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getWorkoutById(this.lastID)
            .then(newWorkout => resolve(newWorkout))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateWorkout = (id: number, workout: Workout): Promise<Workout> => {
  return new Promise((resolve, reject) => {
    const { name, date, duration, calories_burned, notes, user_id } = workout;
    db.run(
      `UPDATE fitness_workouts SET 
         name = ?, 
         date = ?, 
         duration = ?,
         calories_burned = ?,
         notes = ?, 
         user_id = ?
       WHERE id = ?`,
      [name, date, duration, calories_burned, notes, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getWorkoutById(id)
            .then(updatedWorkout => resolve(updatedWorkout))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteWorkout = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM fitness_workouts WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Exercise CRUD operations
export const getExercisesByWorkout = (workoutId: number): Promise<Exercise[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM fitness_exercises WHERE workout_id = ?', [workoutId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Exercise[]);
      }
    });
  });
};

export const getExerciseById = (id: number): Promise<Exercise> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM fitness_exercises WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Exercise);
      }
    });
  });
};

export const createExercise = (exercise: Exercise): Promise<Exercise> => {
  return new Promise((resolve, reject) => {
    const { workout_id, name, sets, reps, weight, duration, distance, notes } = exercise;
    db.run(
      `INSERT INTO fitness_exercises (workout_id, name, sets, reps, weight, duration, distance, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [workout_id, name, sets, reps, weight, duration, distance, notes],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getExerciseById(this.lastID)
            .then(newExercise => resolve(newExercise))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateExercise = (id: number, exercise: Exercise): Promise<Exercise> => {
  return new Promise((resolve, reject) => {
    const { workout_id, name, sets, reps, weight, duration, distance, notes } = exercise;
    db.run(
      `UPDATE fitness_exercises SET 
         workout_id = ?,
         name = ?, 
         sets = ?, 
         reps = ?,
         weight = ?,
         duration = ?, 
         distance = ?,
         notes = ?
       WHERE id = ?`,
      [workout_id, name, sets, reps, weight, duration, distance, notes, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getExerciseById(id)
            .then(updatedExercise => resolve(updatedExercise))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteExercise = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM fitness_exercises WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Nutrition CRUD operations
export const getNutrition = (): Promise<NutritionEntry[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM fitness_nutrition ORDER BY date DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as NutritionEntry[]);
      }
    });
  });
};

export const getNutritionByDate = (date: string): Promise<NutritionEntry[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM fitness_nutrition WHERE date = ? ORDER BY meal_type', [date], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as NutritionEntry[]);
      }
    });
  });
};

export const getNutritionById = (id: number): Promise<NutritionEntry> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM fitness_nutrition WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as NutritionEntry);
      }
    });
  });
};

export const createNutrition = (nutrition: NutritionEntry): Promise<NutritionEntry> => {
  return new Promise((resolve, reject) => {
    const { date, meal_type, food_name, calories, protein, carbs, fat, user_id } = nutrition;
    db.run(
      `INSERT INTO fitness_nutrition (date, meal_type, food_name, calories, protein, carbs, fat, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, meal_type, food_name, calories, protein, carbs, fat, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getNutritionById(this.lastID)
            .then(newNutrition => resolve(newNutrition))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateNutrition = (id: number, nutrition: NutritionEntry): Promise<NutritionEntry> => {
  return new Promise((resolve, reject) => {
    const { date, meal_type, food_name, calories, protein, carbs, fat, user_id } = nutrition;
    db.run(
      `UPDATE fitness_nutrition SET 
         date = ?,
         meal_type = ?, 
         food_name = ?, 
         calories = ?,
         protein = ?,
         carbs = ?, 
         fat = ?,
         user_id = ?
       WHERE id = ?`,
      [date, meal_type, food_name, calories, protein, carbs, fat, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getNutritionById(id)
            .then(updatedNutrition => resolve(updatedNutrition))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteNutrition = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM fitness_nutrition WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Body Measurement CRUD operations
export const getMeasurements = (): Promise<BodyMeasurement[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM fitness_measurements ORDER BY date DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as BodyMeasurement[]);
      }
    });
  });
};

export const getMeasurementById = (id: number): Promise<BodyMeasurement> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM fitness_measurements WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as BodyMeasurement);
      }
    });
  });
};

export const getLatestMeasurement = (): Promise<BodyMeasurement> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM fitness_measurements ORDER BY date DESC LIMIT 1', (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as BodyMeasurement);
      }
    });
  });
};

export const createMeasurement = (measurement: BodyMeasurement): Promise<BodyMeasurement> => {
  return new Promise((resolve, reject) => {
    const { date, weight, height, body_fat_percentage, chest, waist, hips, arms, thighs, user_id } = measurement;
    db.run(
      `INSERT INTO fitness_measurements (date, weight, height, body_fat_percentage, chest, waist, hips, arms, thighs, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, weight, height, body_fat_percentage, chest, waist, hips, arms, thighs, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getMeasurementById(this.lastID)
            .then(newMeasurement => resolve(newMeasurement))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateMeasurement = (id: number, measurement: BodyMeasurement): Promise<BodyMeasurement> => {
  return new Promise((resolve, reject) => {
    const { date, weight, height, body_fat_percentage, chest, waist, hips, arms, thighs, user_id } = measurement;
    db.run(
      `UPDATE fitness_measurements SET 
         date = ?,
         weight = ?, 
         height = ?, 
         body_fat_percentage = ?,
         chest = ?,
         waist = ?, 
         hips = ?,
         arms = ?,
         thighs = ?,
         user_id = ?
       WHERE id = ?`,
      [date, weight, height, body_fat_percentage, chest, waist, hips, arms, thighs, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getMeasurementById(id)
            .then(updatedMeasurement => resolve(updatedMeasurement))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteMeasurement = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM fitness_measurements WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Fitness Goal CRUD operations
export const getFitnessGoals = (): Promise<FitnessGoal[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM fitness_goals ORDER BY target_date ASC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as FitnessGoal[]);
      }
    });
  });
};

export const getFitnessGoalById = (id: number): Promise<FitnessGoal> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM fitness_goals WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as FitnessGoal);
      }
    });
  });
};

export const createFitnessGoal = (goal: FitnessGoal): Promise<FitnessGoal> => {
  return new Promise((resolve, reject) => {
    const { name, target_value, current_value, goal_type, measurement_unit, target_date, status, user_id } = goal;
    db.run(
      `INSERT INTO fitness_goals (name, target_value, current_value, goal_type, measurement_unit, target_date, status, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, target_value, current_value, goal_type, measurement_unit, target_date, status, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getFitnessGoalById(this.lastID)
            .then(newGoal => resolve(newGoal))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateFitnessGoal = (id: number, goal: FitnessGoal): Promise<FitnessGoal> => {
  return new Promise((resolve, reject) => {
    const { name, target_value, current_value, goal_type, measurement_unit, target_date, status, user_id } = goal;
    db.run(
      `UPDATE fitness_goals SET 
         name = ?,
         target_value = ?, 
         current_value = ?, 
         goal_type = ?,
         measurement_unit = ?,
         target_date = ?, 
         status = ?,
         user_id = ?
       WHERE id = ?`,
      [name, target_value, current_value, goal_type, measurement_unit, target_date, status, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getFitnessGoalById(id)
            .then(updatedGoal => resolve(updatedGoal))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteFitnessGoal = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM fitness_goals WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Analytics functions
export const getWorkoutStats = (startDate: string, endDate: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
         COUNT(*) as workout_count, 
         SUM(duration) as total_duration,
         SUM(calories_burned) as total_calories
       FROM fitness_workouts 
       WHERE date BETWEEN ? AND ?`,
      [startDate, endDate],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      }
    );
  });
};

export const getWorkoutsByWeek = (startDate: string, endDate: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
         strftime('%W', date) as week, 
         COUNT(*) as workout_count
       FROM fitness_workouts 
       WHERE date BETWEEN ? AND ?
       GROUP BY week
       ORDER BY week`,
      [startDate, endDate],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

export const getNutritionStats = (date: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
         SUM(calories) as total_calories,
         SUM(protein) as total_protein,
         SUM(carbs) as total_carbs,
         SUM(fat) as total_fat
       FROM fitness_nutrition 
       WHERE date = ?`,
      [date],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

export const getWeightProgress = (startDate: string, endDate: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT date, weight
       FROM fitness_measurements 
       WHERE date BETWEEN ? AND ?
       ORDER BY date`,
      [startDate, endDate],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

export { db }; 