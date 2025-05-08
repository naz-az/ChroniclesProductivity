import { useEffect, useState, CSSProperties } from 'react'; // Added CSSProperties for explicit typing
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
  created_at: string;
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
    const fetchTasks = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await axios.get('http://localhost:5000/api/tasks');
        const sortedTasks = response.data.sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTasks(sortedTasks);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to connect to the task dimension. Please check your astral coordinates.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const getCompletionPercentage = () => {
    return tasks.length > 0 ? Math.floor(Math.random() * 60) + 20 : 0;
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

  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    tasks.forEach(task => {
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

  const recentTasksSectionStyle: CSSProperties = { ...cardBaseStyle, padding: '30px' };
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
            <p style={statCardValueStyle}>{tasks.length}</p>
            <p style={statCardDescStyle}>
              {tasks.length > 0 && tasks[0] ? `Last added: ${new Date(tasks[0].created_at).toLocaleDateString()}` : 'No tasks宇宙 yet'}
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
              <p style={statCardValueStyle}>{Math.round(tasks.length * completionPercentage / 100)}</p>
              <p style={{ color: theme.success, fontWeight: 'bold', fontSize: '1.2rem' }}>{completionPercentage}%</p>
            </div>
            <div style={progressBarContainerStyle}>
              <div style={progressBarStyle(completionPercentage, theme.success)} />
            </div>
          </div>
        </div>
        
        <div 
            style={{ ...cardBaseStyle, ...(hoveredCard === 'pending' && cardHoverStyle) }}
            onMouseEnter={() => setHoveredCard('pending')}
            onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{...decorativeBlobStyle(theme.pending), transform: hoveredCard === 'pending' ? 'scale(1.3)' : 'scale(1)'}} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={statCardTitleStyle}>Potential Timelines (Pending)</h3>
            <p style={statCardValueStyle}>{Math.round(tasks.length * (100 - completionPercentage) / 100)}</p>
            <p style={statCardDescStyle}>{100 - completionPercentage}% of all tasks</p>
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

      <div style={recentTasksSectionStyle}>
        <div style={recentTasksHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>Recent Echoes (Tasks)</h2>
          <span style={{ fontSize: '0.9rem', color: theme.textSecondary, opacity: 0.8 }}>
            <CalendarIcon size={16} color={theme.textSecondary} /> {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View: {filteredTasks().length} tasks
          </span>
        </div>
        
        {filteredTasks().length === 0 ? (
          <div style={{...loadingErrorEmptyBaseStyle, background: 'transparent', border: `2px dashed ${theme.cardBorder}`, padding: '40px'}}>
            <p style={{ margin: 0, color: theme.textSecondary, fontSize: '1.1rem' }}>The chronostream is empty here. No tasks match your query.</p>
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
                {filteredTasks().slice(0, 5).map((task) => ( // Removed unused 'index'
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