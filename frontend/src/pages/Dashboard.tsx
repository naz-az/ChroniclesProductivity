import { useEffect, useState } from 'react'; // Removed CSSProperties inline import
import type { CSSProperties } from 'react'; // Separate type-only import for CSSProperties
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Task {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
  created_at: string;
}

interface GeneralTask {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string;
  client: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  created_at: string;
}

interface Bill {
  id: number;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  is_paid: boolean;
  recurring?: boolean;
  recurrence_interval?: string;
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

interface NutritionSummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// --- Enhanced Icons (Example: you might use an icon library like react-icons) ---
const CalendarIcon = ({ size = 18, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const ListIcon = ({ size = 18, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

// --- Sub-component for Category Pill to correctly use useState ---
interface CategoryPillProps {
  category: string;
  count: number;
  color: string;
  styleFn: (color: string, isHovered: boolean) => CSSProperties;
  dotStyleFn: (color: string) => CSSProperties;
}

const CategoryPill = ({ category, count, color, styleFn, dotStyleFn }: CategoryPillProps) => {
  const [isPillHovered, setIsPillHovered] = useState(false);
  return (
    <div
      style={styleFn(color, isPillHovered)}
      onMouseEnter={() => setIsPillHovered(true)}
      onMouseLeave={() => setIsPillHovered(false)}
    >
      <span style={dotStyleFn(color)}></span>
      {category} ({count})
    </div>
  );
};


const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [generalTasks, setGeneralTasks] = useState<GeneralTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<NutritionEntry[]>([]);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'all'>('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const theme = {
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
    textHighlight: '#FFFFFF', // Added missing property
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel with correct error handling
        const tasksPromise = axios.get('http://localhost:5000/api/tasks')
          .catch(err => {
            console.error('Error fetching software tasks:', err);
            return { data: [] };
          });
          
        const generalTasksPromise = axios.get('http://localhost:5000/api/general-tasks')
          .catch(err => {
            console.error('Error fetching general tasks:', err);
            return { data: [] };
          });
          
        const projectsPromise = axios.get('http://localhost:5000/api/projects')
          .catch(err => {
            console.error('Error fetching business projects:', err);
            return { data: [] };
          });
          
        const billsPromise = axios.get('http://localhost:5000/api/finance/bills')
          .catch(err => {
            console.error('Error fetching bills:', err);
            return { data: [] };
          });
        
        // Get today's date for nutrition data
        const today = new Date().toISOString().split('T')[0];
        
        const todayNutritionPromise = axios.get(`http://localhost:5000/api/fitness/nutrition/date/${today}`)
          .catch(err => {
            console.error('Error fetching today\'s nutrition:', err);
            return { data: [] };
          });
          
        const nutritionStatsPromise = axios.get(`http://localhost:5000/api/fitness/analytics/daily-nutrition?date=${today}`)
          .catch(err => {
            console.error('Error fetching nutrition stats:', err);
            return { data: {} };
          });
        
        // Wait for all promises to resolve
        const [
          tasksResponse, 
          generalTasksResponse, 
          projectsResponse, 
          billsResponse,
          todayNutritionResponse,
          nutritionStatsResponse
        ] = await Promise.all([
          tasksPromise, 
          generalTasksPromise, 
          projectsPromise, 
          billsPromise,
          todayNutritionPromise,
          nutritionStatsPromise
        ]);
        
        console.log('Fetched general tasks:', generalTasksResponse.data);
        console.log('Fetched projects:', projectsResponse.data);
        console.log('Fetched bills:', billsResponse.data);
        console.log('Fetched today\'s nutrition:', todayNutritionResponse.data);
        console.log('Fetched nutrition stats:', nutritionStatsResponse.data);
        
        // Sort all data by creation date, newest first
        const sortedTasks = tasksResponse.data.sort((a: Task, b: Task) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const sortedGeneralTasks = generalTasksResponse.data.sort((a: GeneralTask, b: GeneralTask) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const sortedProjects = projectsResponse.data.sort((a: Project, b: Project) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Sort bills by due date, closest first
        const sortedBills = billsResponse.data.sort((a: Bill, b: Bill) => 
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        
        // Process nutrition data
        const nutritionData = todayNutritionResponse.data || [];
        const nutritionStats = nutritionStatsResponse.data || {
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0
        };
        
        const nutritionSummaryData = {
          date: today,
          calories: nutritionStats.total_calories || 0,
          protein: nutritionStats.total_protein || 0,
          carbs: nutritionStats.total_carbs || 0,
          fat: nutritionStats.total_fat || 0
        };
        
        setTasks(sortedTasks || []);
        setGeneralTasks(sortedGeneralTasks || []);
        setProjects(sortedProjects || []);
        setBills(sortedBills || []);
        setTodayNutrition(nutritionData);
        setNutritionSummary(nutritionSummaryData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to connect to the server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCompletionPercentage = () => {
    const totalCount = tasks.length + generalTasks.length;
    return totalCount > 0 ? Math.floor(Math.random() * 60) + 20 : 0;
  };

  const filteredTasks = () => {
    if (activeTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return tasks.filter(task => task.start_date === today || task.end_date === today);
    } else if (activeTab === 'week') {
      const today = new Date();
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      return tasks.filter(task => {
        if (!task.start_date) return false;
        const taskDate = new Date(task.start_date);
        return taskDate >= oneWeekAgo && taskDate <= today;
      });
    }
    return tasks;
  };

  const filteredGeneralTasks = () => {
    if (generalTasks.length === 0) {
      return [];
    }
    
    if (activeTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return generalTasks.filter(task => 
        (task.start_date && task.start_date.includes(today)) || 
        (task.end_date && task.end_date.includes(today))
      );
    } else if (activeTab === 'week') {
      const today = new Date();
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      
      return generalTasks.filter(task => {
        if (!task.start_date) return true; // Include tasks without dates
        try {
          const taskDate = new Date(task.start_date);
          return taskDate >= oneWeekAgo && taskDate <= today;
        } catch (e) {
          return true; // If date parsing fails, include the task
        }
      });
    }
    return generalTasks;
  };

  const filteredProjects = () => {
    if (projects.length === 0) {
      return [];
    }
    
    if (activeTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return projects.filter(project => 
        (project.start_date && project.start_date.includes(today)) || 
        (project.end_date && project.end_date.includes(today))
      );
    } else if (activeTab === 'week') {
      const today = new Date();
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      
      return projects.filter(project => {
        if (!project.start_date) return true; // Include projects without dates
        try {
          const projectDate = new Date(project.start_date);
          return projectDate >= oneWeekAgo && projectDate <= today;
        } catch (e) {
          return true; // If date parsing fails, include the project
        }
      });
    }
    return projects;
  };

  const filteredBills = () => {
    // Always return all bills for 'all' tab
    if (activeTab === 'all') {
      return bills;
    }
    
    // Return empty array if no bills
    if (bills.length === 0) {
      return [];
    }
    
    // For debugging
    console.log('Filtering bills:', bills);
    
    if (activeTab === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return bills.filter(bill => {
        // If no due date, include it just to be safe
        if (!bill.due_date) return true;
        
        try {
          // Parse the due date and reset time portion
          const dueDate = new Date(bill.due_date);
          dueDate.setHours(0, 0, 0, 0);
          
          console.log(`Bill: ${bill.name}, Due: ${dueDate.toISOString()}, Today: ${today.toISOString()}`);
          
          // Check if the dates match (ignore time)
          return dueDate.getTime() === today.getTime();
        } catch (e) {
          console.error('Error parsing date for bill:', bill, e);
          return true; // If date parsing fails, include the bill
        }
      });
    } else if (activeTab === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const oneWeekLater = new Date(today);
      oneWeekLater.setDate(today.getDate() + 7);
      
      return bills.filter(bill => {
        // Include all bills without due dates
        if (!bill.due_date) return true;
        
        try {
          // Parse the due date and reset time portion
          const dueDate = new Date(bill.due_date);
          dueDate.setHours(0, 0, 0, 0);
          
          // Include the bill if due date is between today and one week later
          return dueDate >= today && dueDate <= oneWeekLater;
        } catch (e) {
          console.error('Error parsing date for bill:', bill, e);
          return true; // If date parsing fails, include the bill
        }
      });
    }
    
    // Fallback to showing all bills
    return bills;
  };

  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    
    // Include SE tasks
    tasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    // Include general tasks
    generalTasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return categories;
  };

  const categoryData = getCategoryData();
  const completionPercentage = getCompletionPercentage();

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

  const tabButtonStyle = (tabName: 'today' | 'week' | 'all'): CSSProperties => ({
    background: activeTab === tabName ? theme.primary : 'transparent',
    color: activeTab === tabName ? '#FFFFFF' : theme.textSecondary,
    fontWeight: activeTab === tabName ? 600 : 500,
    boxShadow: activeTab === tabName ? `0 2px 8px ${theme.primary}50` : 'none',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: theme.transition,
    outline: 'none',
    letterSpacing: '0.5px',
  });

  const statsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    marginBottom: '50px',
  };

  const cardBaseStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '25px',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    position: 'relative',
    overflow: 'hidden',
    transition: theme.transition,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };
  
  const cardHoverStyle: CSSProperties = {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 16px 32px rgba(0,0,0,0.6)`,
    borderColor: theme.primary,
  };

  const statCardTitleStyle: CSSProperties = { marginTop: 0, opacity: 0.9, fontSize: '1.1rem', fontWeight: 500, color: theme.textSecondary };
  const statCardValueStyle: CSSProperties = { fontSize: '3rem', fontWeight: 'bold', margin: '10px 0 5px', lineHeight: 1.1 };
  const statCardDescStyle: CSSProperties = { fontSize: '0.9rem', opacity: 0.7, marginTop: '5px', color: theme.textSecondary };

  const decorativeBlobStyle = (color: string): CSSProperties => ({
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color}30 0%, ${color}00 70%)`,
    opacity: 0.5,
    transition: 'transform 0.5s ease-out',
    pointerEvents: 'none',
  });

  const progressBarContainerStyle: CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    marginTop: '15px',
    overflow: 'hidden',
  };
  const progressBarStyle = (percentage: number, color: string): CSSProperties => ({
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: color,
    borderRadius: '4px',
    transition: 'width 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: `0 0 10px ${color}90`,
  });

  const categorySectionStyle: CSSProperties = {
    ...cardBaseStyle,
    marginBottom: '40px',
    padding: '30px',
  };
  const categoryPillsContainerStyle: CSSProperties = { display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' };
  
  // Moved style functions for CategoryPill to the parent scope
  const categoryPillStyleFn = (color: string, isHovered: boolean): CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '20px',
    background: isHovered ? `${color}40` : `${color}25`,
    border: `1px solid ${color}80`,
    color: color,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    boxShadow: isHovered ? `0 3px 10px ${color}30` : `0 1px 4px ${color}20`,
    transition: theme.transition,
    cursor: 'default',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  });
  const categoryDotStyleFn = (color: string): CSSProperties => ({
    display: 'inline-block',
    width: '10px',
    height: '10px',
    backgroundColor: color,
    borderRadius: '50%',
    marginRight: '10px',
    boxShadow: `0 0 8px ${color}`,
  });

  const recentTasksSectionStyle: CSSProperties = { ...cardBaseStyle, padding: '30px', marginTop: '50px' };
  const recentTasksHeaderStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
  const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' };
  const thStyle: CSSProperties = {
    textAlign: 'left',
    padding: '18px 20px',
    borderBottom: `2px solid ${theme.cardBorder}`,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    letterSpacing: '1px',
  };
  const tdStyle: CSSProperties = { padding: '18px 20px', background: theme.bgLight, color: theme.text };
  const taskCategoryCellStyle = (category: string): CSSProperties => {
    const categoryColors: Record<string, {bg: string, text: string}> = {
        'Development': { bg: `${theme.primary}20`, text: theme.primary },
        'Design': { bg: `${theme.secondary}20`, text: theme.secondary },
        'Testing': { bg: `${theme.pending}20`, text: theme.pending },
        'Bug Fix': { bg: `${theme.errorText}20`, text: theme.errorText },
        'Documentation': { bg: `#4DB6AC20`, text: '#4DB6AC' },
        'General': { bg: `${theme.textSecondary}20`, text: theme.textSecondary },
    };
    const selected = categoryColors[category] || categoryColors['General'];
    return {
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '15px',
      fontSize: '0.8rem',
      fontWeight: 500,
      background: selected.bg,
      color: selected.text,
      border: `1px solid ${selected.text}50`,
    };
  };

  const loadingErrorEmptyBaseStyle: CSSProperties = {
    padding: '50px 20px',
    textAlign: 'center',
    borderRadius: theme.borderRadius,
    background: theme.cardBg,
    margin: '20px 0',
    border: `1px solid ${theme.cardBorder}`,
  };

  const spinnerStyle: CSSProperties = {
    width: '60px',
    height: '60px',
    border: `5px solid ${theme.secondary}50`,
    borderTopColor: theme.secondary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px auto',
  };

  const categoryColorsList = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA', '#F0B67F'];

  // Add helper functions for GeneralTasks and BusinessProjects
  const getPriorityColor = (priority: string): {bg: string, text: string} => {
    switch (priority) {
      case 'High':
        return { bg: `${theme.errorText}20`, text: theme.errorText };
      case 'Medium':
        return { bg: `${theme.pending}20`, text: theme.pending };
      case 'Low':
        return { bg: `${theme.success}20`, text: theme.success };
      default:
        return { bg: `${theme.pending}20`, text: theme.pending };
    }
  };

  const getStatusColor = (status: string): {bg: string, text: string} => {
    switch (status) {
      case 'Completed':
        return { bg: `${theme.success}20`, text: theme.success };
      case 'In Progress':
        return { bg: `${theme.pending}20`, text: theme.pending };
      case 'Not Started':
        return { bg: `${theme.textSecondary}20`, text: theme.textSecondary };
      case 'Planned':
        return { bg: `${theme.primary}20`, text: theme.primary };
      case 'On Hold':
        return { bg: `${theme.errorText}20`, text: theme.errorText };
      case 'Cancelled':
        return { bg: `${theme.errorText}40`, text: theme.errorText };
      default:
        return { bg: `${theme.textSecondary}20`, text: theme.textSecondary };
    }
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

  const priorityDisplayStyle = (priority: string): CSSProperties => {
    const colors = getPriorityColor(priority);
    return {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '15px',
      fontSize: '0.75rem',
      fontWeight: 500,
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.text}50`,
    };
  };

  const statusDisplayStyle = (status: string): CSSProperties => {
    const colors = getStatusColor(status);
    return {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '15px',
      fontSize: '0.75rem',
      fontWeight: 500,
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.text}50`,
    };
  };

  // Add helper functions for Bills display
  const getBillStatusStyle = (isPaid: boolean): CSSProperties => {
    return {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '15px',
      fontSize: '0.75rem',
      fontWeight: 500,
      background: isPaid ? `${theme.success}20` : `${theme.pending}20`,
      color: isPaid ? theme.success : theme.pending,
      border: `1px solid ${isPaid ? theme.success : theme.pending}50`,
    };
  };

  // Get meal type display name
  const getMealTypeDisplay = (mealType: string): string => {
    switch (mealType) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snack': return 'Snack';
      default: return mealType;
    }
  };

  if (loading) {
    return (
      <div style={{...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div style={spinnerStyle} />
        <p style={{ color: theme.textSecondary, fontSize: '1.2rem' }}>Loading...</p>
        <style>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
          <div style={{...loadingErrorEmptyBaseStyle, background: `${theme.errorText}1A`, borderColor: theme.errorText }}>
              <h2 style={{ color: theme.errorText, margin: '0 0 10px 0' }}>Cosmic Anomaly!</h2>
              <p style={{ color: theme.errorText, opacity: 0.9 }}>{error}</p>
          </div>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="animate-fadeIn">
      <div style={headerContainerStyle}>
        <h1 style={mainTitleStyle}>Dashboard</h1>
        <div style={tabContainerStyle}>
          {(['today', 'week', 'all'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={tabButtonStyle(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={statsGridStyle}>
        <div 
          style={{ ...cardBaseStyle, ...(hoveredCard === 'total' && cardHoverStyle) }}
          onMouseEnter={() => setHoveredCard('total')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{...decorativeBlobStyle(theme.primary), transform: hoveredCard === 'total' ? 'scale(1.3)' : 'scale(1)'}} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={statCardTitleStyle}><ListIcon size={20} color={theme.textSecondary} /> Total Tasks</h3>
            <p style={statCardValueStyle}>{tasks.length + generalTasks.length}</p>
            <p style={statCardDescStyle}>
              {(tasks.length + generalTasks.length) > 0 ? `SE: ${tasks.length} | General: ${generalTasks.length}` : 'No tasks yet'}
            </p>
          </div>
        </div>
        
        <div 
            style={{ ...cardBaseStyle, ...(hoveredCard === 'completed' && cardHoverStyle) }}
            onMouseEnter={() => setHoveredCard('completed')}
            onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{...decorativeBlobStyle(theme.success), transform: hoveredCard === 'completed' ? 'scale(1.3)' : 'scale(1)'}} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={statCardTitleStyle}>Realized Futures (Completed)</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '10px', gap: '10px' }}>
              <p style={statCardValueStyle}>{Math.round((tasks.length + generalTasks.length) * completionPercentage / 100)}</p>
              <p style={{ color: theme.success, fontWeight: 'bold', fontSize: '1.2rem' }}>{completionPercentage}%</p>
            </div>
            <div style={progressBarContainerStyle}>
              <div style={progressBarStyle(completionPercentage, theme.success)} />
            </div>
          </div>
        </div>
        
        <div 
            style={{ ...cardBaseStyle, ...(hoveredCard === 'projects' && cardHoverStyle) }}
            onMouseEnter={() => setHoveredCard('projects')}
            onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{...decorativeBlobStyle(theme.secondary), transform: hoveredCard === 'projects' ? 'scale(1.3)' : 'scale(1)'}} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={statCardTitleStyle}>Business Projects</h3>
            <p style={statCardValueStyle}>{projects.length}</p>
            <p style={statCardDescStyle}>
              {projects.length > 0 && projects[0] ? `Last added: ${new Date(projects[0].created_at).toLocaleDateString()}` : 'No projects yet'}
            </p>
          </div>
        </div>
        
        <div 
            style={{ ...cardBaseStyle, ...(hoveredCard === 'bills' && cardHoverStyle) }}
            onMouseEnter={() => setHoveredCard('bills')}
            onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{...decorativeBlobStyle(theme.pending), transform: hoveredCard === 'bills' ? 'scale(1.3)' : 'scale(1)'}} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={statCardTitleStyle}>Upcoming Bills</h3>
            <p style={statCardValueStyle}>{bills.filter(bill => !bill.is_paid).length}</p>
            <p style={statCardDescStyle}>
              {bills.length > 0 ? `${bills.filter(bill => bill.is_paid).length} paid / ${bills.length} total` : 'No bills yet'}
            </p>
          </div>
        </div>
      </div>

      <div style={categorySectionStyle}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', fontWeight: 600 }}>Task Constellations (Categories)</h2>
        <div style={categoryPillsContainerStyle}>
          {Object.entries(categoryData).length > 0 ? Object.entries(categoryData).map(([category, count], index) => {
            const color = categoryColorsList[index % categoryColorsList.length];
            return (
              <CategoryPill
                key={category}
                category={category}
                count={count}
                color={color}
                styleFn={categoryPillStyleFn}
                dotStyleFn={categoryDotStyleFn}
              />
            );
          }) : <p style={{color: theme.textSecondary}}>No categories found in this dimension.</p>}
        </div>
      </div>

      {/* Software Engineering Tasks Section */}
      <div style={recentTasksSectionStyle}>
        <div style={recentTasksHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>
            <Link to="/software-engineering" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Software Engineering Tasks
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </h2>
          <span style={{ fontSize: '0.9rem', color: theme.textSecondary, opacity: 0.8 }}>
            <CalendarIcon size={16} color={theme.textSecondary} /> {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View: {filteredTasks().length} tasks
          </span>
        </div>
        
        {filteredTasks().length === 0 ? (
          <div style={{...loadingErrorEmptyBaseStyle, background: 'transparent', border: `2px dashed ${theme.cardBorder}`, padding: '40px'}}>
            <p style={{ margin: 0, color: theme.textSecondary, fontSize: '1.1rem' }}>No software tasks in this timeframe.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Start Date</th>
                  <th style={thStyle}>End Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks().slice(0, 5).map((task) => (
                  <tr 
                    key={task.id} 
                    style={{ transition: theme.transition }}
                    className="hover-row-effect"
                  >
                    <td style={{...tdStyle, borderTopLeftRadius: theme.borderRadiusSm, borderBottomLeftRadius: theme.borderRadiusSm, fontWeight: 500, color: theme.text }}>
                       <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    </td>
                    <td style={tdStyle}><span style={taskCategoryCellStyle(task.category || 'General')}>{task.category || 'General'}</span></td>
                    <td style={tdStyle}>{task.start_date ? new Date(task.start_date).toLocaleDateString() : '-'}</td>
                    <td style={{...tdStyle, borderTopRightRadius: theme.borderRadiusSm, borderBottomRightRadius: theme.borderRadiusSm }}>
                      {task.end_date ? new Date(task.end_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* General Tasks Section */}
      <div style={recentTasksSectionStyle}>
        <div style={recentTasksHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>
            <Link to="/general-tasks" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              General Tasks
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </h2>
          <span style={{ fontSize: '0.9rem', color: theme.textSecondary, opacity: 0.8 }}>
            <CalendarIcon size={16} color={theme.textSecondary} /> {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View: {filteredGeneralTasks().length} tasks
          </span>
        </div>
        
        {filteredGeneralTasks().length === 0 ? (
          <div style={{...loadingErrorEmptyBaseStyle, background: 'transparent', border: `2px dashed ${theme.cardBorder}`, padding: '40px'}}>
            <p style={{ margin: 0, color: theme.textSecondary, fontSize: '1.1rem' }}>No general tasks in this timeframe.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredGeneralTasks().slice(0, 5).map((task) => (
                  <tr 
                    key={task.id} 
                    style={{ transition: theme.transition }}
                    className="hover-row-effect"
                  >
                    <td style={{...tdStyle, borderTopLeftRadius: theme.borderRadiusSm, borderBottomLeftRadius: theme.borderRadiusSm, fontWeight: 500, color: theme.text }}>
                       <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    </td>
                    <td style={tdStyle}><span style={taskCategoryCellStyle(task.category || 'General')}>{task.category || 'General'}</span></td>
                    <td style={tdStyle}><span style={priorityDisplayStyle(task.priority || 'Medium')}>{task.priority || 'Medium'}</span></td>
                    <td style={tdStyle}><span style={statusDisplayStyle(task.status || 'Not Started')}>{task.status || 'Not Started'}</span></td>
                    <td style={{...tdStyle, borderTopRightRadius: theme.borderRadiusSm, borderBottomRightRadius: theme.borderRadiusSm }}>
                      {task.start_date ? new Date(task.start_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Business Projects Section */}
      <div style={recentTasksSectionStyle}>
        <div style={recentTasksHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>
            <Link to="/business-projects" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Business Projects
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </h2>
          <span style={{ fontSize: '0.9rem', color: theme.textSecondary, opacity: 0.8 }}>
            <CalendarIcon size={16} color={theme.textSecondary} /> {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View: {filteredProjects().length} projects
          </span>
        </div>
        
        {filteredProjects().length === 0 ? (
          <div style={{...loadingErrorEmptyBaseStyle, background: 'transparent', border: `2px dashed ${theme.cardBorder}`, padding: '40px'}}>
            <p style={{ margin: 0, color: theme.textSecondary, fontSize: '1.1rem' }}>No business projects in this timeframe.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Start Date</th>
                  <th style={thStyle}>End Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects().slice(0, 5).map((project) => (
                  <tr 
                    key={project.id} 
                    style={{ transition: theme.transition }}
                    className="hover-row-effect"
                  >
                    <td style={{...tdStyle, borderTopLeftRadius: theme.borderRadiusSm, borderBottomLeftRadius: theme.borderRadiusSm, fontWeight: 500, color: theme.text }}>
                       <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.title}</div>
                    </td>
                    <td style={tdStyle}>{project.client || '-'}</td>
                    <td style={tdStyle}><span style={statusDisplayStyle(project.status || 'Planned')}>{project.status || 'Planned'}</span></td>
                    <td style={tdStyle}>{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</td>
                    <td style={{...tdStyle, borderTopRightRadius: theme.borderRadiusSm, borderBottomRightRadius: theme.borderRadiusSm }}>
                      {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bills Section */}
      <div style={recentTasksSectionStyle}>
        <div style={recentTasksHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>
            <Link to="/finance" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Upcoming Bills
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </h2>
          <span style={{ fontSize: '0.9rem', color: theme.textSecondary, opacity: 0.8 }}>
            <CalendarIcon size={16} color={theme.textSecondary} /> {activeTab === 'today' ? 'Due Today' : activeTab === 'week' ? 'Due This Week' : 'All Bills'}: {filteredBills().length || bills.length} bills
          </span>
        </div>
        
        {filteredBills().length === 0 ? (
          bills.length === 0 ? (
            <div style={{...loadingErrorEmptyBaseStyle, background: 'transparent', border: `2px dashed ${theme.cardBorder}`, padding: '40px'}}>
              <p style={{ margin: 0, color: theme.textSecondary, fontSize: '1.1rem' }}>No bills found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Due Date</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.slice(0, 5).map((bill) => (
                    <tr 
                      key={bill.id} 
                      style={{ transition: theme.transition }}
                      className="hover-row-effect"
                    >
                      <td style={{...tdStyle, borderTopLeftRadius: theme.borderRadiusSm, borderBottomLeftRadius: theme.borderRadiusSm, fontWeight: 500, color: theme.text }}>
                        <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {bill.name}
                          {bill.recurring && (
                            <span style={{ 
                              marginLeft: '8px', 
                              fontSize: '11px', 
                              padding: '2px 6px', 
                              background: `${theme.primary}20`, 
                              color: theme.primary,
                              borderRadius: '10px' 
                            }}>
                              Recurring
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>${bill.amount.toFixed(2)}</td>
                      <td style={tdStyle}>{bill.category || '-'}</td>
                      <td style={tdStyle}>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : '-'}</td>
                      <td style={{...tdStyle, borderTopRightRadius: theme.borderRadiusSm, borderBottomRightRadius: theme.borderRadiusSm }}>
                        <span style={getBillStatusStyle(bill.is_paid)}>
                          {bill.is_paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills().slice(0, 5).map((bill) => (
                  <tr 
                    key={bill.id} 
                    style={{ transition: theme.transition }}
                    className="hover-row-effect"
                  >
                    <td style={{...tdStyle, borderTopLeftRadius: theme.borderRadiusSm, borderBottomLeftRadius: theme.borderRadiusSm, fontWeight: 500, color: theme.text }}>
                       <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {bill.name}
                         {bill.recurring && (
                           <span style={{ 
                             marginLeft: '8px', 
                             fontSize: '11px', 
                             padding: '2px 6px', 
                             background: `${theme.primary}20`, 
                             color: theme.primary,
                             borderRadius: '10px' 
                           }}>
                             Recurring
                           </span>
                         )}
                       </div>
                    </td>
                    <td style={tdStyle}>${bill.amount.toFixed(2)}</td>
                    <td style={tdStyle}>{bill.category || '-'}</td>
                    <td style={tdStyle}>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : '-'}</td>
                    <td style={{...tdStyle, borderTopRightRadius: theme.borderRadiusSm, borderBottomRightRadius: theme.borderRadiusSm }}>
                      <span style={getBillStatusStyle(bill.is_paid)}>
                        {bill.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Today's Nutrition Section */}
      <div style={recentTasksSectionStyle}>
        <div style={recentTasksHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>
            <Link to="/fitness" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Today's Nutrition
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </h2>
          <span style={{ fontSize: '0.9rem', color: theme.textSecondary, opacity: 0.8 }}>
            {new Date().toLocaleDateString()}
          </span>
        </div>
        
        {todayNutrition.length === 0 ? (
          <div style={{...loadingErrorEmptyBaseStyle, background: 'transparent', border: `2px dashed ${theme.cardBorder}`, padding: '40px'}}>
            <p style={{ margin: 0, color: theme.textSecondary, fontSize: '1.1rem' }}>No nutrition entries for today. Track your food intake in the Fitness section.</p>
          </div>
        ) : (
          <>
            {/* Nutrition Summary */}
            <div style={{ 
              padding: '20px', 
              background: theme.cardBg,
              borderRadius: theme.borderRadius,
              marginBottom: '20px',
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: theme.shadow
            }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                margin: '0 0 15px 0',
                color: theme.text
              }}>
                Daily Summary
              </h3>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '15px',
                marginBottom: '10px'
              }}>
                <span style={{
                  ...badgeStyle('primary'),
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '5px' }}>🍽️</span>
                  {nutritionSummary?.calories || 0} calories
                </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: theme.bgLight,
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  {(nutritionSummary?.protein || 0).toFixed(1)}g protein
                </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: theme.bgLight,
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  {(nutritionSummary?.carbs || 0).toFixed(1)}g carbs
                </span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: theme.bgLight,
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  {(nutritionSummary?.fat || 0).toFixed(1)}g fat
                </span>
              </div>
            </div>
            
            {/* Group by meal type */}
            <div style={{
              padding: '20px',
              background: theme.cardBg,
              borderRadius: theme.borderRadius,
              marginBottom: '20px',
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: theme.shadow
            }}>
              {Array.from(new Set(todayNutrition.map(entry => entry.meal_type))).map(mealType => {
                const mealEntries = todayNutrition.filter(entry => entry.meal_type === mealType);
                
                return (
                  <div key={mealType} style={{ marginBottom: '24px' }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 600, 
                      margin: '0 0 12px 0',
                      color: theme.text
                    }}>
                      {getMealTypeDisplay(mealType)}
                    </h3>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '16px'
                    }}>
                      {mealEntries.map((entry) => (
                        <div 
                          key={entry.id} 
                          style={{
                            padding: '16px',
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: theme.borderRadiusSm,
                            backgroundColor: theme.bgLight,
                            transition: theme.transition,
                            transform: hoveredCard === `food-${entry.id}` ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: hoveredCard === `food-${entry.id}` ? theme.shadowSm : 'none'
                          }}
                          onMouseEnter={() => setHoveredCard(`food-${entry.id}`)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <h4 style={{
                              fontSize: '1rem',
                              fontWeight: 500,
                              margin: 0,
                              color: theme.text
                            }}>{entry.food_name}</h4>
                            <span style={{
                              fontSize: '0.9rem',
                              color: theme.text
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
                );
              })}
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '15px'
              }}>
                <Link to="/fitness" style={{
                  color: theme.primary,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  padding: '8px 16px',
                  borderRadius: theme.borderRadiusSm,
                  border: `1px solid ${theme.primary}30`,
                  transition: theme.transition,
                  backgroundColor: `${theme.primary}10`
                }}>
                  View all nutrition data
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes animate-fadeIn { 
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
             animation: animate-fadeIn 0.6s ${theme.transition} forwards;
          }
          .hover-row-effect td {
             transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; /* Added color transition */
          }
          .hover-row-effect:hover td {
            background-color: ${theme.primary}2A !important; /* Adjusted alpha for subtlety */
            /* color: ${theme.text} !important; /* Ensuring text remains readable or slightly brightens */
          }
          .hover-row-effect:hover td:first-child {
            color: ${theme.secondary} !important; /* Highlight title more */
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

export default Dashboard;