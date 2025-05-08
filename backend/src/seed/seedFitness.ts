import { 
  createFitnessTables, 
  createWorkout, 
  createExercise, 
  createNutrition, 
  createMeasurement, 
  createFitnessGoal,
  Workout,
  Exercise,
  NutritionEntry,
  BodyMeasurement,
  FitnessGoal
} from '../models/fitness';

const seedFitnessData = async () => {
  console.log('Creating fitness tables...');
  await createFitnessTables();
  
  console.log('Seeding workout data...');
  const workouts: Workout[] = [
    {
      name: 'Morning Cardio',
      date: '2023-11-01',
      duration: 45,
      calories_burned: 350,
      notes: 'Felt great! Increased pace for the last 10 minutes.'
    },
    {
      name: 'Full Body Strength',
      date: '2023-11-03',
      duration: 60,
      calories_burned: 420,
      notes: 'Focused on increasing weights for upper body exercises.'
    },
    {
      name: 'Yoga Session',
      date: '2023-11-05',
      duration: 75,
      calories_burned: 280,
      notes: 'Worked on flexibility and balance poses.'
    },
    {
      name: 'HIIT Workout',
      date: '2023-11-07',
      duration: 30,
      calories_burned: 380,
      notes: 'Intense but short session. 30 seconds on, 15 seconds rest.'
    },
    {
      name: 'Leg Day',
      date: '2023-11-09',
      duration: 50,
      calories_burned: 450,
      notes: 'Focused on squats and deadlifts.'
    },
    {
      name: 'Swimming',
      date: '2023-11-12',
      duration: 40,
      calories_burned: 320,
      notes: 'Mixed strokes: freestyle, breaststroke, and backstroke.'
    }
  ];

  const workoutIds: number[] = [];
  for (const workout of workouts) {
    const result = await createWorkout(workout);
    if (result.id) workoutIds.push(result.id);
  }

  console.log('Seeding exercise data...');
  const exercises: Exercise[] = [
    // Exercises for Morning Cardio
    {
      workout_id: workoutIds[0],
      name: 'Treadmill Run',
      duration: 30,
      distance: 5.2,
      notes: 'Maintained 6.0 mph pace'
    },
    {
      workout_id: workoutIds[0],
      name: 'Jump Rope',
      duration: 15,
      notes: 'Alternated between 30 seconds fast and 30 seconds slow'
    },
    
    // Exercises for Full Body Strength
    {
      workout_id: workoutIds[1],
      name: 'Bench Press',
      sets: 4,
      reps: 8,
      weight: 70,
      notes: 'Increased weight from last week'
    },
    {
      workout_id: workoutIds[1],
      name: 'Squats',
      sets: 3,
      reps: 12,
      weight: 100,
      notes: 'Focused on depth and form'
    },
    {
      workout_id: workoutIds[1],
      name: 'Pull-ups',
      sets: 3,
      reps: 10,
      notes: 'Used assistance bands for the last set'
    },
    {
      workout_id: workoutIds[1],
      name: 'Shoulder Press',
      sets: 3,
      reps: 10,
      weight: 45,
      notes: 'Slight discomfort in right shoulder'
    },
    
    // Exercises for Yoga Session
    {
      workout_id: workoutIds[2],
      name: 'Sun Salutations',
      duration: 20,
      notes: 'Completed 10 full cycles'
    },
    {
      workout_id: workoutIds[2],
      name: 'Warrior Poses',
      duration: 15,
      notes: 'Held each pose for 45 seconds'
    },
    {
      workout_id: workoutIds[2],
      name: 'Balance Series',
      duration: 20,
      notes: 'Tree pose, dancer pose, and eagle pose'
    },
    
    // Exercises for HIIT Workout
    {
      workout_id: workoutIds[3],
      name: 'Burpees',
      sets: 4,
      reps: 15,
      notes: 'Minimal rest between sets'
    },
    {
      workout_id: workoutIds[3],
      name: 'Mountain Climbers',
      sets: 4,
      reps: 30,
      notes: '30 seconds per set'
    },
    {
      workout_id: workoutIds[3],
      name: 'Jump Squats',
      sets: 4,
      reps: 20,
      notes: 'Kept good form despite fatigue'
    },
    
    // Exercises for Leg Day
    {
      workout_id: workoutIds[4],
      name: 'Back Squats',
      sets: 5,
      reps: 8,
      weight: 120,
      notes: 'New personal best'
    },
    {
      workout_id: workoutIds[4],
      name: 'Deadlifts',
      sets: 4,
      reps: 6,
      weight: 150,
      notes: 'Used mixed grip for heavier sets'
    },
    {
      workout_id: workoutIds[4],
      name: 'Leg Press',
      sets: 3,
      reps: 12,
      weight: 180,
      notes: 'Focused on slow negative movement'
    },
    {
      workout_id: workoutIds[4],
      name: 'Calf Raises',
      sets: 3,
      reps: 20,
      weight: 60,
      notes: 'Used seated calf raise machine'
    },
    
    // Exercises for Swimming
    {
      workout_id: workoutIds[5],
      name: 'Freestyle',
      duration: 15,
      distance: 0.75,
      notes: '500m total, broken into 5x100m sets'
    },
    {
      workout_id: workoutIds[5],
      name: 'Breaststroke',
      duration: 15,
      distance: 0.6,
      notes: '400m total, focused on technique'
    },
    {
      workout_id: workoutIds[5],
      name: 'Backstroke',
      duration: 10,
      distance: 0.45,
      notes: '300m total, worked on rotation'
    }
  ];

  for (const exercise of exercises) {
    await createExercise(exercise);
  }

  console.log('Seeding nutrition data...');
  const nutritionEntries: NutritionEntry[] = [
    // Day 1
    {
      date: '2023-11-09',
      meal_type: 'breakfast',
      food_name: 'Oatmeal with Berries',
      calories: 320,
      protein: 12,
      carbs: 58,
      fat: 6
    },
    {
      date: '2023-11-09',
      meal_type: 'lunch',
      food_name: 'Grilled Chicken Salad',
      calories: 450,
      protein: 35,
      carbs: 15,
      fat: 30
    },
    {
      date: '2023-11-09',
      meal_type: 'snack',
      food_name: 'Greek Yogurt',
      calories: 150,
      protein: 15,
      carbs: 10,
      fat: 5
    },
    {
      date: '2023-11-09',
      meal_type: 'dinner',
      food_name: 'Salmon with Roasted Vegetables',
      calories: 520,
      protein: 40,
      carbs: 25,
      fat: 28
    },
    
    // Day 2
    {
      date: '2023-11-10',
      meal_type: 'breakfast',
      food_name: 'Protein Smoothie',
      calories: 380,
      protein: 30,
      carbs: 45,
      fat: 8
    },
    {
      date: '2023-11-10',
      meal_type: 'lunch',
      food_name: 'Quinoa Bowl with Tofu',
      calories: 420,
      protein: 20,
      carbs: 65,
      fat: 12
    },
    {
      date: '2023-11-10',
      meal_type: 'snack',
      food_name: 'Apple with Almond Butter',
      calories: 210,
      protein: 5,
      carbs: 30,
      fat: 10
    },
    {
      date: '2023-11-10',
      meal_type: 'dinner',
      food_name: 'Turkey Chili',
      calories: 480,
      protein: 35,
      carbs: 40,
      fat: 20
    },
    
    // Day 3
    {
      date: '2023-11-11',
      meal_type: 'breakfast',
      food_name: 'Eggs and Whole Grain Toast',
      calories: 350,
      protein: 22,
      carbs: 30,
      fat: 16
    },
    {
      date: '2023-11-11',
      meal_type: 'lunch',
      food_name: 'Tuna Wrap',
      calories: 420,
      protein: 30,
      carbs: 40,
      fat: 15
    },
    {
      date: '2023-11-11',
      meal_type: 'snack',
      food_name: 'Protein Bar',
      calories: 220,
      protein: 20,
      carbs: 25,
      fat: 7
    },
    {
      date: '2023-11-11',
      meal_type: 'dinner',
      food_name: 'Stir-Fry with Brown Rice',
      calories: 520,
      protein: 30,
      carbs: 65,
      fat: 15
    }
  ];

  for (const entry of nutritionEntries) {
    await createNutrition(entry);
  }

  console.log('Seeding body measurements data...');
  const measurements: BodyMeasurement[] = [
    {
      date: '2023-10-15',
      weight: 82.5,
      height: 178,
      body_fat_percentage: 18.5,
      chest: 100,
      waist: 86,
      hips: 102,
      arms: 36,
      thighs: 60
    },
    {
      date: '2023-10-29',
      weight: 81.8,
      body_fat_percentage: 18.2,
      chest: 99.5,
      waist: 85.5,
      hips: 101.5,
      arms: 36.2,
      thighs: 60
    },
    {
      date: '2023-11-12',
      weight: 81.2,
      body_fat_percentage: 17.8,
      chest: 99,
      waist: 84.8,
      hips: 101,
      arms: 36.5,
      thighs: 59.5
    }
  ];

  for (const measurement of measurements) {
    await createMeasurement(measurement);
  }

  console.log('Seeding fitness goals data...');
  const fitnessGoals: FitnessGoal[] = [
    {
      name: 'Lose Weight',
      target_value: 78,
      current_value: 81.2,
      goal_type: 'weight',
      measurement_unit: 'kg',
      target_date: '2024-01-30',
      status: 'in_progress'
    },
    {
      name: 'Bench Press PR',
      target_value: 90,
      current_value: 70,
      goal_type: 'strength',
      measurement_unit: 'kg',
      target_date: '2024-02-15',
      status: 'in_progress'
    },
    {
      name: '10K Run',
      target_value: 50,
      current_value: 35,
      goal_type: 'endurance',
      measurement_unit: 'minutes',
      target_date: '2024-03-01',
      status: 'in_progress'
    },
    {
      name: 'Reduce Body Fat',
      target_value: 15,
      current_value: 17.8,
      goal_type: 'other',
      measurement_unit: 'percentage',
      target_date: '2024-02-28',
      status: 'in_progress'
    }
  ];

  for (const goal of fitnessGoals) {
    await createFitnessGoal(goal);
  }

  console.log('Fitness data seeded successfully!');
};

// Execute the seed function if this file is run directly
if (require.main === module) {
  seedFitnessData()
    .then(() => {
      console.log('Finished seeding fitness data');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding fitness data:', error);
      process.exit(1);
    });
}

export default seedFitnessData; 