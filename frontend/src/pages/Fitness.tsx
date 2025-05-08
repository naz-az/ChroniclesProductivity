import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import './Fitness.css';

// Types for fitness data
interface Workout {
  id: number;
  name: string;
  date: string;
  duration: number;
  calories_burned?: number;
  notes?: string;
}

interface Exercise {
  id: number;
  workout_id: number;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
}

interface NutritionEntry {
  id: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface BodyMeasurement {
  id: number;
  date: string;
  weight?: number;
  height?: number;
  body_fat_percentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

interface FitnessGoal {
  id: number;
  name: string;
  target_value: number;
  current_value: number;
  goal_type: 'weight' | 'strength' | 'endurance' | 'other';
  measurement_unit: string;
  target_date: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

// Theme hook
const useFitnessTheme = () => {
  return {
    bg: '#121212',
    bgLight: '#1E1E1E',
    cardBg: 'rgba(30, 30, 30, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    glassShine: 'rgba(255, 255, 255, 0.05)',
    primary: '#BB86FC',
    primaryVariant: '#3700B3',
    secondary: '#03DAC6',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    textHighlight: '#FFFFFF',
    errorText: '#CF6679',
    success: '#66BB6A',
    pending: '#FFA726',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    borderRadius: '16px',
    borderRadiusSm: '10px',
    shadow: '0 8px 24px rgba(0,0,0,0.5)',
    shadowSm: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };
};

// Custom ProgressBar component
const ProgressBar: React.FC<{ value: number, className?: string, status?: string }> = ({ value, className, status }) => {
  const theme = useFitnessTheme();
  
  let barColor = theme.primary;
  if (status === 'completed') barColor = theme.success;
  if (status === 'abandoned') barColor = theme.errorText;

  const progressBarContainerStyle: CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    marginTop: '15px',
    overflow: 'hidden',
  };
  
  const progressBarStyle: CSSProperties = {
    width: `${Math.min(value, 100)}%`,
    height: '100%',
    backgroundColor: barColor,
    borderRadius: '4px',
    transition: 'width 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: `0 0 10px ${barColor}90`,
  };

  return (
    <div style={progressBarContainerStyle} className={className}>
      <div style={progressBarStyle}></div>
    </div>
  );
};

// Tab Panel component
function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fitness-tabpanel-${index}`}
      aria-labelledby={`fitness-tab-${index}`}
      {...other}
    >
      {value === index && <div style={{ padding: '20px' }}>{children}</div>}
    </div>
  );
}

// Main Fitness component
const Fitness: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Record<number, Exercise[]>>({});
  const [nutrition, setNutrition] = useState<NutritionEntry[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState({
    workouts: true,
    nutrition: true,
    measurements: true,
    fitnessGoals: true,
  });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const theme = useFitnessTheme();

  // Handle tab change
  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fitness/workouts');
        const data = await response.json();
        setWorkouts(data);
        
        // Fetch exercises for each workout
        const exercisesData: Record<number, Exercise[]> = {};
        for (const workout of data) {
          const exercisesResponse = await fetch(`http://localhost:5000/api/fitness/workouts/${workout.id}/exercises`);
          const exercisesResult = await exercisesResponse.json();
          exercisesData[workout.id] = exercisesResult;
        }
        setExercises(exercisesData);
        
        setLoading(prev => ({ ...prev, workouts: false }));
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setLoading(prev => ({ ...prev, workouts: false }));
      }
    };

    const fetchNutrition = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fitness/nutrition');
        const data = await response.json();
        setNutrition(data);
        setLoading(prev => ({ ...prev, nutrition: false }));
      } catch (error) {
        console.error('Error fetching nutrition entries:', error);
        setLoading(prev => ({ ...prev, nutrition: false }));
      }
    };

    const fetchMeasurements = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fitness/measurements');
        const data = await response.json();
        setMeasurements(data);
        setLoading(prev => ({ ...prev, measurements: false }));
      } catch (error) {
        console.error('Error fetching body measurements:', error);
        setLoading(prev => ({ ...prev, measurements: false }));
      }
    };

    const fetchFitnessGoals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fitness/goals');
        const data = await response.json();
        setFitnessGoals(data);
        setLoading(prev => ({ ...prev, fitnessGoals: false }));
      } catch (error) {
        console.error('Error fetching fitness goals:', error);
        setLoading(prev => ({ ...prev, fitnessGoals: false }));
      }
    };

    fetchWorkouts();
    fetchNutrition();
    fetchMeasurements();
    fetchFitnessGoals();
  }, []);

  // Helper function to format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };

  // Style definitions
  const pageStyle: CSSProperties = {
    background: theme.bg,
    color: theme.text,
    fontFamily: theme.fontFamily,
    padding: '30px 40px',
    minHeight: '100vh',
    transition: theme.transition,
  };

  const headerContainerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.cardBorder}`,
  };

  const mainTitleStyle: CSSProperties = {
    margin: 0,
    fontSize: '2.8rem',
    fontWeight: 700,
    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: `0 0 15px ${theme.primary}30`,
  };

  const tabContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    background: theme.bgLight,
    padding: '6px',
    borderRadius: theme.borderRadiusSm,
    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3), ${theme.shadowSm}`,
  };

  const tabButtonStyle = (isActive: boolean): CSSProperties => ({
    background: isActive ? theme.primary : 'transparent',
    color: isActive ? '#FFFFFF' : theme.textSecondary,
    fontWeight: isActive ? 600 : 500,
    boxShadow: isActive ? `0 2px 8px ${theme.primary}50` : 'none',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: theme.transition,
    outline: 'none',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const tabIconStyle: CSSProperties = {
    marginRight: '8px',
    fontSize: '1.2rem',
  };

  const sectionStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '30px',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    marginBottom: '30px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const cardStyle = (id: string): CSSProperties => ({
    background: theme.cardBg,
    color: theme.text,
    padding: '25px',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: hoveredCard === id ? `0 12px 28px rgba(0,0,0,0.6)` : theme.shadow,
    position: 'relative',
    overflow: 'hidden',
    transition: theme.transition,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transform: hoveredCard === id ? 'translateY(-5px)' : 'none',
    borderColor: hoveredCard === id ? theme.primary : theme.cardBorder,
  });

  const workoutCardStyle = (id: string): CSSProperties => ({
    ...cardStyle(id),
    padding: '0',
    marginBottom: '20px'
  });

  const cardContentStyle: CSSProperties = {
    padding: '20px'
  };

  const gridContainerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px',
    marginBottom: '30px',
  };

  const sectionHeaderStyle: CSSProperties = {
    margin: '0 0 20px 0',
    fontSize: '1.6rem',
    fontWeight: 600,
    color: theme.text,
  };

  const itemTitleStyle: CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: theme.text,
  };

  const itemSubtitleStyle: CSSProperties = {
    fontSize: '0.9rem',
    color: theme.textSecondary,
    margin: '0 0 4px 0',
  };

  const flexBetweenStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const badgeStyle = (type: string): CSSProperties => {
    const colors = {
      primary: theme.primary,
      success: theme.success,
      warning: theme.pending,
      error: theme.errorText,
    };
    const color = colors[type as keyof typeof colors] || theme.primary;
    
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      color: 'white',
      backgroundColor: color,
      fontWeight: 500,
    };
  };

  const headerButtonStyle: CSSProperties = {
    background: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: theme.transition,
    boxShadow: `0 2px 8px ${theme.primary}50`,
  };

  const listItemStyle: CSSProperties = {
    padding: '16px',
    marginBottom: '16px',
    borderRadius: theme.borderRadiusSm,
    background: theme.bgLight,
    border: `1px solid ${theme.cardBorder}`,
    transition: theme.transition,
  };

  const loadingTextStyle: CSSProperties = {
    padding: '20px',
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: '1rem',
  };

  const emptyStateStyle: CSSProperties = {
    padding: '30px',
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: '1rem',
    background: `${theme.bgLight}80`,
    borderRadius: theme.borderRadiusSm,
    border: `1px dashed ${theme.cardBorder}`,
  };

  const dividerStyle: CSSProperties = {
    height: '1px',
    background: theme.cardBorder,
    margin: '16px 0',
  };

  const chartPlaceholderStyle: CSSProperties = {
    width: '100%',
    height: '300px',
    backgroundColor: `${theme.bgLight}80`,
    border: `1px dashed ${theme.cardBorder}`,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px',
  };

  const placeholderNoteStyle: CSSProperties = {
    color: theme.textSecondary,
    fontSize: '0.8rem',
    marginTop: '10px',
  };

  // Workouts Tab
  const WorkoutsTab = () => (
    <div>
      <div style={flexBetweenStyle}>
        <h2 style={sectionHeaderStyle}>Workouts</h2>
        <button 
          style={headerButtonStyle}
          onClick={() => console.log('Add new workout')}
        >
          <span style={{ marginRight: '8px' }}>+</span>
          Add Workout
        </button>
      </div>

      {loading.workouts ? (
        <p style={loadingTextStyle}>Loading workouts...</p>
      ) : workouts.length === 0 ? (
        <div style={emptyStateStyle}>No workouts found. Start logging your fitness activities!</div>
      ) : (
        <div style={gridContainerStyle}>
          {workouts.map((workout) => (
            <div key={workout.id}>
              <div 
                style={workoutCardStyle(`workout-${workout.id}`)}
                onMouseEnter={() => setHoveredCard(`workout-${workout.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={cardContentStyle}>
                  <div style={flexBetweenStyle}>
                    <h3 style={itemTitleStyle}>{workout.name}</h3>
                    <span style={badgeStyle('primary')}>
                      <span style={{ marginRight: '5px' }}>🏋️</span>
                      {formatDuration(workout.duration)}
                    </span>
                  </div>
                  
                  <p style={itemSubtitleStyle}>
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                  
                  {workout.calories_burned && (
                    <p style={{ fontSize: '0.9rem', margin: '0 0 8px 0' }}>
                      <strong>Calories burned:</strong> {workout.calories_burned}
                    </p>
                  )}
                  
                  {workout.notes && (
                    <p style={{ fontSize: '0.9rem', margin: '0 0 8px 0' }}>
                      <strong>Notes:</strong> {workout.notes}
                    </p>
                  )}
                  
                  {exercises[workout.id] && exercises[workout.id].length > 0 && (
                    <>
                      <div style={dividerStyle}></div>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        margin: '12px 0 8px 0' 
                      }}>
                        Exercises:
                      </h4>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: 0 
                      }}>
                        {exercises[workout.id].map((exercise) => (
                          <li key={exercise.id} style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '8px 0' 
                          }}>
                            <span style={{ 
                              marginRight: '12px', 
                              fontSize: '1.1rem' 
                            }}>🏃</span>
                            <div style={{ flex: 1 }}>
                              <span style={{ 
                                fontWeight: 500, 
                                display: 'block',
                                marginBottom: '4px' 
                              }}>{exercise.name}</span>
                              <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '8px', 
                                marginTop: '5px' 
                              }}>
                                {exercise.sets && exercise.reps && (
                                  <span style={{ 
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '12px',
                                    backgroundColor: `${theme.bgLight}90`
                                  }}>
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </span>
                                )}
                                {exercise.weight && (
                                  <span style={{ 
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '12px',
                                    backgroundColor: `${theme.bgLight}90`
                                  }}>
                                    {exercise.weight} kg
                                  </span>
                                )}
                                {exercise.duration && (
                                  <span style={{ 
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '12px',
                                    backgroundColor: `${theme.bgLight}90`
                                  }}>
                                    {exercise.duration} min
                                  </span>
                                )}
                                {exercise.distance && (
                                  <span style={{ 
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '12px',
                                    backgroundColor: `${theme.bgLight}90`
                                  }}>
                                    {exercise.distance} km
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Keep the nutrition data processing logic
  const groupedNutrition = nutrition.reduce<Record<string, Record<string, NutritionEntry[]>>>((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString();
    
    if (!acc[date]) {
      acc[date] = {};
    }
    
    if (!acc[date][entry.meal_type]) {
      acc[date][entry.meal_type] = [];
    }
    
    acc[date][entry.meal_type].push(entry);
    return acc;
  }, {});

  // Calculate daily nutrition totals
  const dailyNutritionTotals = Object.keys(groupedNutrition).map(date => {
    const entries = Object.values(groupedNutrition[date]).flat();
    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
    const totalProtein = entries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
    const totalCarbs = entries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
    const totalFat = entries.reduce((sum, entry) => sum + (entry.fat || 0), 0);
    
    return {
      date,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    };
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedNutrition).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Get meal type display name
  const getMealTypeDisplay = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snack': return 'Snack';
      default: return mealType;
    }
  };

  // Nutrition Tab
  const NutritionTab = () => (
    <div>
      <div style={flexBetweenStyle}>
        <h2 style={sectionHeaderStyle}>Nutrition Tracking</h2>
        <button 
          style={headerButtonStyle}
          onClick={() => console.log('Add new nutrition entry')}
        >
          <span style={{ marginRight: '8px' }}>+</span>
          Add Food Entry
        </button>
      </div>

      {loading.nutrition ? (
        <p style={loadingTextStyle}>Loading nutrition data...</p>
      ) : nutrition.length === 0 ? (
        <div style={emptyStateStyle}>No nutrition entries found. Start tracking your diet!</div>
      ) : (
        <>
          <div style={{ 
            ...sectionStyle, 
            marginBottom: '32px'
          }}>
            <h3 style={itemTitleStyle}>Nutrition Summary</h3>
            <div style={chartPlaceholderStyle}>
              <p>Nutrition chart will be displayed here</p>
              <p style={placeholderNoteStyle}>Chart removed due to type compatibility issues with recharts</p>
            </div>
          </div>

          {sortedDates.map(date => (
            <div key={date} style={sectionStyle}>
              <h3 style={itemTitleStyle}>{date}</h3>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px',
                marginBottom: '16px'
              }}>
                <span style={{
                  ...badgeStyle('primary'),
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '5px' }}>🍽️</span>
                  {dailyNutritionTotals.find(d => d.date === date)?.calories} calories
                </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: theme.bgLight,
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  {dailyNutritionTotals.find(d => d.date === date)?.protein?.toFixed(1)}g protein
                </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: theme.bgLight,
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  {dailyNutritionTotals.find(d => d.date === date)?.carbs?.toFixed(1)}g carbs
                </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: theme.bgLight,
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  {dailyNutritionTotals.find(d => d.date === date)?.fat?.toFixed(1)}g fat
                </span>
              </div>
              
              <div style={dividerStyle}></div>
              
              {Object.keys(groupedNutrition[date]).map(mealType => (
                <div key={mealType} style={{ marginBottom: '24px' }}>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: '12px'
                  }}>
                    {getMealTypeDisplay(mealType)}
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {groupedNutrition[date][mealType].map(entry => (
                      <div 
                        key={entry.id} 
                        style={{
                          padding: '16px',
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: theme.borderRadiusSm,
                          backgroundColor: theme.bgLight
                        }}
                        onMouseEnter={() => setHoveredCard(`food-${entry.id}`)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div style={flexBetweenStyle}>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            margin: 0
                          }}>{entry.food_name}</h4>
                          <span style={{
                            fontSize: '0.9rem'
                          }}>{entry.calories} cal</span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          marginTop: '8px'
                        }}>
                          {entry.protein && (
                            <span style={{
                              fontSize: '0.8rem',
                              color: theme.textSecondary
                            }}>
                              Protein: {entry.protein}g
                            </span>
                          )}
                          {entry.carbs && (
                            <span style={{
                              fontSize: '0.8rem',
                              color: theme.textSecondary
                            }}>
                              Carbs: {entry.carbs}g
                            </span>
                          )}
                          {entry.fat && (
                            <span style={{
                              fontSize: '0.8rem',
                              color: theme.textSecondary
                            }}>
                              Fat: {entry.fat}g
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );

  // Prepare body measurement chart data - keep this for future chart implementation
  const measurementChartData = measurements
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: new Date(m.date).toLocaleDateString(),
      weight: m.weight,
      bodyFat: m.body_fat_percentage,
    }));

  // Body Measurements Tab
  const MeasurementsTab = () => (
    <div>
      <div style={flexBetweenStyle}>
        <h2 style={sectionHeaderStyle}>Body Measurements</h2>
        <button 
          style={headerButtonStyle}
          onClick={() => console.log('Add new measurement')}
        >
          <span style={{ marginRight: '8px' }}>+</span>
          Add Measurement
        </button>
      </div>

      {loading.measurements ? (
        <p style={loadingTextStyle}>Loading body measurements...</p>
      ) : measurements.length === 0 ? (
        <div style={emptyStateStyle}>No body measurements found. Start tracking your progress!</div>
      ) : (
        <>
          <div style={{ 
            ...sectionStyle, 
            marginBottom: '32px'
          }}>
            <h3 style={itemTitleStyle}>Weight & Body Fat Progress</h3>
            <div style={chartPlaceholderStyle}>
              <p>Body measurements chart will be displayed here</p>
              <p style={placeholderNoteStyle}>Chart removed due to type compatibility issues with recharts</p>
            </div>
          </div>

          <div style={gridContainerStyle}>
            {measurements
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(measurement => (
                <div 
                  key={measurement.id}
                  style={cardStyle(`measurement-${measurement.id}`)}
                  onMouseEnter={() => setHoveredCard(`measurement-${measurement.id}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={flexBetweenStyle}>
                    <h3 style={itemTitleStyle}>
                      Measurements on {new Date(measurement.date).toLocaleDateString()}
                    </h3>
                    <div style={{
                      backgroundColor: theme.primary,
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>⚖️</span>
                    </div>
                  </div>
                  
                  <div style={dividerStyle}></div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '16px'
                  }}>
                    {measurement.weight && (
                      <div>
                        <p style={itemSubtitleStyle}>Weight</p>
                        <p style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          margin: '4px 0 0 0'
                        }}>{measurement.weight} kg</p>
                      </div>
                    )}
                    
                    {measurement.height && (
                      <div>
                        <p style={itemSubtitleStyle}>Height</p>
                        <p style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          margin: '4px 0 0 0'
                        }}>{measurement.height} cm</p>
                      </div>
                    )}
                    
                    {measurement.body_fat_percentage && (
                      <div>
                        <p style={itemSubtitleStyle}>Body Fat %</p>
                        <p style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          margin: '4px 0 0 0'
                        }}>{measurement.body_fat_percentage}%</p>
                      </div>
                    )}
                    
                    {measurement.chest && (
                      <div>
                        <p style={itemSubtitleStyle}>Chest</p>
                        <p style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          margin: '4px 0 0 0'
                        }}>{measurement.chest} cm</p>
                      </div>
                    )}
                    
                    {measurement.waist && (
                      <div>
                        <p style={itemSubtitleStyle}>Waist</p>
                        <p style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          margin: '4px 0 0 0'
                        }}>{measurement.waist} cm</p>
                      </div>
                    )}
                    
                    {measurement.hips && (
                      <div>
                        <p style={itemSubtitleStyle}>Hips</p>
                        <p style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          margin: '4px 0 0 0'
                        }}>{measurement.hips} cm</p>
                      </div>
                    )}
                    
                    {measurement.arms && (
                      <div>
                        <p style={itemSubtitleStyle}>Arms</p>
                        <p style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          margin: '4px 0 0 0'
                        }}>{measurement.arms} cm</p>
                      </div>
                    )}
                    
                    {measurement.thighs && (
                      <div>
                        <p style={itemSubtitleStyle}>Thighs</p>
                        <p style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          margin: '4px 0 0 0'
                        }}>{measurement.thighs} cm</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );

  // Fitness Goals Tab
  const FitnessGoalsTab = () => (
    <div>
      <div style={flexBetweenStyle}>
        <h2 style={sectionHeaderStyle}>Fitness Goals</h2>
        <button 
          style={headerButtonStyle}
          onClick={() => console.log('Add new fitness goal')}
        >
          <span style={{ marginRight: '8px' }}>+</span>
          Add Goal
        </button>
      </div>

      {loading.fitnessGoals ? (
        <p style={loadingTextStyle}>Loading fitness goals...</p>
      ) : fitnessGoals.length === 0 ? (
        <div style={emptyStateStyle}>No fitness goals found. Set your first goal!</div>
      ) : (
        <div style={gridContainerStyle}>
          {fitnessGoals.map((goal) => {
            const percentage = (goal.current_value / goal.target_value) * 100;
            const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            let statusColor = theme.primary;
            if (goal.status === 'completed') statusColor = theme.success;
            if (goal.status === 'abandoned') statusColor = theme.errorText;
            
            return (
              <div 
                key={goal.id}
                style={cardStyle(`goal-${goal.id}`)}
                onMouseEnter={() => setHoveredCard(`goal-${goal.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={flexBetweenStyle}>
                  <h3 style={itemTitleStyle}>{goal.name}</h3>
                  <span style={{
                    ...badgeStyle(goal.status === 'completed' ? 'success' : 
                                 goal.status === 'abandoned' ? 'error' : 'primary')
                  }}>
                    <span style={{ marginRight: '5px' }}>🏆</span>
                    {goal.goal_type}
                  </span>
                </div>
                
                <div style={flexBetweenStyle}>
                  <p style={{
                    fontSize: '1rem',
                    margin: 0
                  }}>
                    {goal.current_value} / {goal.target_value} {goal.measurement_unit}
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    margin: 0,
                    color: daysLeft < 7 ? theme.errorText : theme.textSecondary
                  }}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Past due date'}
                  </p>
                </div>
                
                <ProgressBar value={percentage} status={goal.status} />
                
                <div style={{
                  ...flexBetweenStyle,
                  marginTop: '12px'
                }}>
                  <p style={itemSubtitleStyle}>
                    {percentage.toFixed(1)}% complete
                  </p>
                  <p style={itemSubtitleStyle}>
                    Target Date: {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={pageStyle} className="animate-fadeIn">
      <div style={headerContainerStyle}>
        <h1 style={mainTitleStyle}>Health & Fitness</h1>
        
        <div style={tabContainerStyle}>
          <button 
            style={tabButtonStyle(tabValue === 0)}
            onClick={() => handleTabChange(0)}
          >
            <span style={tabIconStyle}>🏋️</span>
            Workouts
          </button>
          <button 
            style={tabButtonStyle(tabValue === 1)}
            onClick={() => handleTabChange(1)}
          >
            <span style={tabIconStyle}>🍽️</span>
            Nutrition
          </button>
          <button 
            style={tabButtonStyle(tabValue === 2)}
            onClick={() => handleTabChange(2)}
          >
            <span style={tabIconStyle}>⚖️</span>
            Measurements
          </button>
          <button 
            style={tabButtonStyle(tabValue === 3)}
            onClick={() => handleTabChange(3)}
          >
            <span style={tabIconStyle}>🏆</span>
            Goals
          </button>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <TabPanel value={tabValue} index={0}>
          <WorkoutsTab />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <NutritionTab />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <MeasurementsTab />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <FitnessGoalsTab />
        </TabPanel>
      </div>

      <style>
        {`
          @keyframes animate-fadeIn { 
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
             animation: animate-fadeIn 0.6s ease-out forwards;
          }
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: ${theme.bgLight};
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: ${theme.primary}90;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${theme.primary};
          }
        `}
      </style>
    </div>
  );
};

export default Fitness; 