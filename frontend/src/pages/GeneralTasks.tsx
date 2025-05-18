import { useState, useEffect, CSSProperties } from 'react';
import axios from 'axios';

interface Task {
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

interface FormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
  priority: string;
  status: string;
}

const GeneralTasks = () => {
  // Theme object adapted from Dashboard.tsx
  const theme = {
    bg: '#121212',
    bgLight: '#1E1E1E',
    cardBg: 'rgba(30, 30, 30, 0.85)', // Slightly more opaque for better readability
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    glassShine: 'rgba(255, 255, 255, 0.05)',
    primary: '#BB86FC',
    primaryVariant: '#3700B3', // Can be used for darker shades of primary
    secondary: '#03DAC6',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    textHighlight: '#FFFFFF',
    errorText: '#CF6679',
    success: '#66BB6A',
    pending: '#FFA726', // Used for 'warning' in SE
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    borderRadius: '16px',
    borderRadiusSm: '10px', // For smaller elements like buttons, input fields
    shadow: '0 8px 24px rgba(0,0,0,0.5)',
    shadowSm: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  // Category colors for badges/tags
  const categoryThemeColors: Record<string, {bg: string, text: string, border: string}> = {
    'Shopping': { bg: `${theme.primary}20`, text: theme.primary, border: `${theme.primary}80` },
    'Finance': { bg: `${theme.secondary}20`, text: theme.secondary, border: `${theme.secondary}80` },
    'Health': { bg: `${theme.pending}20`, text: theme.pending, border: `${theme.pending}80` },
    'Home': { bg: `${theme.errorText}20`, text: theme.errorText, border: `${theme.errorText}80` },
    'Travel': { bg: `#4DB6AC20`, text: '#4DB6AC', border: `#4DB6AC80` },
    'Career': { bg: `#BA68C820`, text: '#BA68C8', border: `#BA68C880` },
    'Automotive': { bg: `#FF8A6520`, text: '#FF8A65', border: `#FF8A6580` },
    'Fitness': { bg: `#64B5F620`, text: '#64B5F6', border: `#64B5F680` },
    'Personal': { bg: `#FFD54F20`, text: '#FFD54F', border: `#FFD54F80` },
    'Digital': { bg: `#9CCC6520`, text: '#9CCC65', border: `#9CCC6580` },
    'General': { bg: `${theme.textSecondary}20`, text: theme.textSecondary, border: `${theme.textSecondary}80` },
  };

  // Priority colors
  const priorityColors: Record<string, {bg: string, text: string, border: string}> = {
    'High': { bg: `${theme.errorText}20`, text: theme.errorText, border: `${theme.errorText}80` },
    'Medium': { bg: `${theme.pending}20`, text: theme.pending, border: `${theme.pending}80` },
    'Low': { bg: `${theme.success}20`, text: theme.success, border: `${theme.success}80` },
  };

  // Status colors
  const statusColors: Record<string, {bg: string, text: string, border: string}> = {
    'Not Started': { bg: `${theme.textSecondary}20`, text: theme.textSecondary, border: `${theme.textSecondary}80` },
    'In Progress': { bg: `${theme.pending}20`, text: theme.pending, border: `${theme.pending}80` },
    'Completed': { bg: `${theme.success}20`, text: theme.success, border: `${theme.success}80` },
  };

  const getCategoryThemeColor = (category: string) => {
    return categoryThemeColors[category] || categoryThemeColors['General'];
  };

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority] || priorityColors['Medium'];
  };

  const getStatusColor = (status: string) => {
    return statusColors[status] || statusColors['Not Started'];
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    category: 'General',
    priority: 'Medium',
    status: 'Not Started'
  });
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<{table: boolean, cards: boolean}>({table: true, cards: false});
  const [sortColumn, setSortColumn] = useState<keyof Task>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await axios.get('http://localhost:5000/api/general-tasks');
      // Sort by creation date initially, newest first
      const sortedTasks = response.data.sort((a: Task, b: Task) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTasks(sortedTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching general tasks:', err);
      setError('Failed to fetch general tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEditTask = (task: Task, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); 
    }
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      start_date: task.start_date ? task.start_date.split('T')[0] : '',
      end_date: task.end_date ? task.end_date.split('T')[0] : '',
      category: task.category || 'General',
      priority: task.priority || 'Medium',
      status: task.status || 'Not Started'
    });
    setIsEditing(true);
    setFormVisible(true);
    setSelectedTask(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTask(null);
    setFormVisible(false);
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      category: 'General',
      priority: 'Medium',
      status: 'Not Started'
    });
    setSubmitStatus({ type: null, message: '' });
  };
  
  const handleDeleteConfirm = (task: Task, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDeleteConfirmTask(task);
    setSelectedTask(null);
  };
  
  const handleCancelDelete = () => {
    setDeleteConfirmTask(null);
  };
  
  const handleDeleteTask = async () => {
    if (!deleteConfirmTask) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/general-tasks/${deleteConfirmTask.id}`);
      setTasks(tasks.filter(task => task.id !== deleteConfirmTask.id));
      setDeleteConfirmTask(null);
      setSubmitStatus({
        type: 'success',
        message: 'Task deleted successfully!'
      });
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' });
      }, 3000);
    } catch (err) {
      console.error('Error deleting task:', err);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to delete task. Please try again.'
      });
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' });
      }, 3000);
    }
  };
  
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask) return;
    
    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: '' });
      
      if (!formData.title) {
        setSubmitStatus({ 
          type: 'error', 
          message: 'Please provide a title for the task'
        });
        setIsSubmitting(false);
        return;
      }
      
      const response = await axios.put(`http://localhost:5000/api/general-tasks/${editingTask.id}`, formData);
      
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? response.data : task
      ));
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Task updated successfully!'
      });
      
      setTimeout(() => {
        setIsEditing(false);
        setEditingTask(null);
        setFormVisible(false);
        setFormData({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          category: 'General',
          priority: 'Medium',
          status: 'Not Started'
        });
        setSubmitStatus({ type: null, message: '' });
      }, 1500);
      
    } catch (err) {
      console.error('Error updating task:', err);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to update task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: '' });
      
      if (!formData.title) {
        setSubmitStatus({ 
          type: 'error', 
          message: 'Please provide a title for the task'
        });
        setIsSubmitting(false);
        return;
      }
      
      await axios.post('http://localhost:5000/api/general-tasks', formData);
      
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        category: 'General',
        priority: 'Medium',
        status: 'Not Started'
      });
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Task added successfully!'
      });
      
      setTimeout(() => {
        setFormVisible(false);
        setSubmitStatus({ type: null, message: ''});
      }, 1500);
      
      fetchTasks();
      
    } catch (err) {
      console.error('Error creating task:', err);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to create task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setFormVisible(false);
    setEditingTask(null);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
  };

  const toggleRowExpansion = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setExpandedRows(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getFilteredTasks = () => {
    const filtered = tasks.filter(task => {
      if (!searchTerm) return true;
      
      const searchTermLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchTermLower) ||
        (task.description && task.description.toLowerCase().includes(searchTermLower)) ||
        (task.category && task.category.toLowerCase().includes(searchTermLower)) ||
        (task.priority && task.priority.toLowerCase().includes(searchTermLower)) ||
        (task.status && task.status.toLowerCase().includes(searchTermLower))
      );
    });
    
    return filtered.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  const handleSort = (column: keyof Task) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredTasks = getFilteredTasks();

  // Base styles from Dashboard
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

  const inputStyle: CSSProperties = {
    fontFamily: theme.fontFamily,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: theme.borderRadiusSm,
    padding: '10px 14px',
    fontSize: '14px',
    transition: theme.transition,
    backgroundColor: theme.bgLight,
    color: theme.text,
    width: '100%',
    boxSizing: 'border-box',
  };
  
  // Styles for buttons
  const baseButtonStyle: CSSProperties = {
    fontFamily: theme.fontFamily,
    fontWeight: 500,
    transition: theme.transition,
    border: 'none',
    cursor: 'pointer',
    boxShadow: theme.shadowSm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 18px',
    borderRadius: theme.borderRadiusSm,
    outline: 'none',
    letterSpacing: '0.5px',
  };

  const primaryButtonStyle: CSSProperties = {
    ...baseButtonStyle,
    background: theme.primary,
    color: theme.textHighlight,
    boxShadow: `0 2px 8px ${theme.primary}50, ${theme.shadowSm}`,
  };
  
  const secondaryButtonStyle: CSSProperties = {
    ...baseButtonStyle,
    background: theme.bgLight,
    color: theme.textSecondary,
    border: `1px solid ${theme.cardBorder}`,
  };
  
  const dangerButtonStyle: CSSProperties = {
    ...baseButtonStyle,
    background: theme.errorText,
    color: theme.textHighlight,
    boxShadow: `0 2px 8px ${theme.errorText}50, ${theme.shadowSm}`,
  };

  const warningButtonStyle: CSSProperties = {
    ...baseButtonStyle,
    background: theme.pending,
    color: theme.textHighlight,
    boxShadow: `0 2px 8px ${theme.pending}50, ${theme.shadowSm}`,
  };

  return (
    <div className="animate-fadeInPage" style={{ fontFamily: theme.fontFamily, background: theme.bg, color: theme.text, padding: '30px 40px', minHeight: '100vh' }}>
      <style>
        {`
        /* Import Inter font if not already global */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeInPage {
            animation: fadeIn 0.6s ${theme.transition} forwards;
        }
        
        .table-hover-row {
          transition: background-color 0.2s ease-in-out;
        }
        
        .table-hover-row:hover td {
          background-color: ${theme.primary}2A !important; 
        }
        .table-hover-row:hover td:first-child {
            color: ${theme.secondary} !important;
        }

        .card-hover-lift {
          transition: transform 0.25s ${theme.transition}, box-shadow 0.25s ${theme.transition};
        }
        
        .card-hover-lift:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 12px 28px rgba(0,0,0,0.4);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Global input, select, textarea styles */
        input, select, textarea {
          font-family: ${theme.fontFamily};
          border: 1px solid ${theme.cardBorder};
          border-radius: ${theme.borderRadiusSm};
          padding: 10px 14px;
          font-size: 14px;
          background-color: ${theme.bgLight};
          color: ${theme.text};
          transition: ${theme.transition};
          box-sizing: border-box;
          width: 100%;
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 3px ${theme.primary}40;
          outline: none;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }
        
        .modal-content {
          background-color: ${theme.cardBg};
          border-radius: ${theme.borderRadius};
          box-shadow: ${theme.shadow};
          max-height: 90vh;
          overflow-y: auto;
          padding: 28px;
          position: relative;
          animation: fadeIn 0.3s ease, slideUp 0.3s ease;
          border: 1px solid ${theme.cardBorder};
        }

        /* Custom Scrollbar for dark theme */
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
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: `1px solid ${theme.cardBorder}`,
      }}>
        <h1 style={{ 
          margin: 0, 
          fontWeight: 700,
          fontSize: '2.5rem',
          background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>General Tasks</h1>
        <button 
          onClick={() => {
            setFormVisible(!formVisible);
            if (isEditing) handleCancelEdit();
            else if (selectedTask) setSelectedTask(null);
           }}
          style={{
            ...primaryButtonStyle,
            background: formVisible ? theme.textSecondary : theme.primary,
            color: theme.textHighlight,
            gap: '8px',
          }}
        >
          {formVisible ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span>Close Form</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add New Task</span>
            </>
          )}
        </button>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        gap: '20px',
      }}>
        <div style={{ 
          position: 'relative',
          flexGrow: 1,
          maxWidth: '400px', 
        }}>
          <input
            type="text"
            placeholder="Search tasks by title, category, priority, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
                ...inputStyle,
                paddingLeft: '42px',
                height: '42px',
            }}
          />
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '14px',
            transform: 'translateY(-50%)',
            color: theme.textSecondary,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          background: theme.bgLight,
          padding: '6px',
          borderRadius: theme.borderRadiusSm,
          boxShadow: `inset 0 1px 2px rgba(0,0,0,0.2), ${theme.shadowSm}`,
        }}>
          <button
            onClick={() => setViewMode(prev => ({...prev, table: !prev.table}))}
            style={{
              ...baseButtonStyle,
              background: viewMode.table ? theme.primary : 'transparent',
              color: viewMode.table ? theme.textHighlight : theme.textSecondary,
              boxShadow: viewMode.table ? `0 1px 5px ${theme.primary}40` : 'none',
              padding: '8px 14px',
              gap: '6px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode(prev => ({...prev, cards: !prev.cards}))}
            style={{
                ...baseButtonStyle,
                background: viewMode.cards ? theme.primary : 'transparent',
                color: viewMode.cards ? theme.textHighlight : theme.textSecondary,
                boxShadow: viewMode.cards ? `0 1px 5px ${theme.primary}40` : 'none',
                padding: '8px 14px',
                gap: '6px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span>Cards</span>
          </button>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: formVisible ? '1.2fr 0.8fr' : '1fr',
        gap: '30px',
        transition: 'grid-template-columns 0.4s ease-in-out'
      }}>
        <div style={{...cardBaseStyle, padding:'30px'}}> {/* Task List Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom:'15px', borderBottom: `1px solid ${theme.cardBorder}` }}>
            <h2 style={{ margin:0, fontSize: '1.5rem', fontWeight: 600, color: theme.textHighlight }}>
              Current Tasks
            </h2>
            <span style={{
              backgroundColor: theme.primary,
              color: theme.textHighlight,
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: `0 0 10px ${theme.primary}70`
            }}>
              {filteredTasks.length}
            </span>
          </div>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 0', flexDirection: 'column' }}>
              <div style={{
                width: '50px', height: '50px', border: `4px solid ${theme.secondary}50`,
                borderTopColor: theme.secondary, borderRadius: '50%', animation: 'spin 1s linear infinite'
              }} />
              <p style={{marginTop: '15px', color: theme.textSecondary}}>Loading Tasks...</p>
            </div>
          ) : error ? (
            <div style={{
              padding: '20px', borderRadius: theme.borderRadiusSm, backgroundColor: `${theme.errorText}20`,
              color: theme.errorText, border: `1px solid ${theme.errorText}80`, textAlign: 'center'
            }}>
              Error: {error}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div style={{
              padding: '40px', textAlign: 'center', backgroundColor: theme.bgLight,
              borderRadius: theme.borderRadius, border: `2px dashed ${theme.cardBorder}`
            }}>
              <p style={{ margin: '0 0 20px', color: theme.textSecondary, fontSize: '1.1rem' }}>No tasks found.</p>
              <button onClick={() => setFormVisible(true)} style={{...primaryButtonStyle, gap: '8px'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Your First Task
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {viewMode.table && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px',
                  }}>
                    <thead>
                      <tr style={{ 
                        borderBottom: `2px solid ${theme.cardBorder}`
                      }}>
                        <th style={{ width: '40px', padding: '12px 10px', textAlign: 'center' }}></th> {/* Expander */}
                        {['title', 'category', 'priority', 'status', 'start_date', 'end_date'].map(col => (
                           <th 
                            key={col}
                            onClick={() => handleSort(col as keyof Task)}
                            style={{ 
                              padding: '15px', textAlign: 'left', cursor: 'pointer',
                              fontWeight: 600, color: theme.textSecondary, fontSize: '0.85rem',
                              textTransform: 'uppercase', letterSpacing: '0.5px',
                              userSelect: 'none', borderBottom: `1px solid ${theme.cardBorder}`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {col.replace('_', ' ')}
                              {sortColumn === col && (
                                <span style={{ marginLeft: '8px', display:'flex', alignItems:'center' }}>
                                  {sortDirection === 'asc' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                  }
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: 600, color: theme.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${theme.cardBorder}`}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => (
                        <>
                          <tr 
                            key={`row-${task.id}`}
                            style={{ 
                              transition: theme.transition, cursor: 'pointer',
                              background: theme.bgLight,
                            }}
                            className="table-hover-row"
                          >
                            <td 
                              style={{ padding: '12px 10px', textAlign: 'center', borderTopLeftRadius: theme.borderRadiusSm, borderBottomLeftRadius: theme.borderRadiusSm, borderBottom: `1px solid ${theme.cardBorder}` }}
                              onClick={(e) => toggleRowExpansion(task.id, e)}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary, transition: 'transform 0.2s ease', transform: expandedRows.includes(task.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </span>
                            </td>
                            <td style={{ padding: '15px', fontSize: '14px', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: theme.text, fontWeight: 500, borderBottom: `1px solid ${theme.cardBorder}` }} onClick={() => handleViewTask(task)}>
                              {task.title}
                            </td>
                            <td style={{ padding: '15px', fontSize: '14px', borderBottom: `1px solid ${theme.cardBorder}` }} onClick={() => handleViewTask(task)}>
                              <div style={{
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                padding: '5px 12px',
                                borderRadius: '15px', 
                                fontSize: '12px', 
                                fontWeight: '500',
                                background: getCategoryThemeColor(task.category).bg,
                                color: getCategoryThemeColor(task.category).text,
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: getCategoryThemeColor(task.category).border,
                                gap: '6px'
                              }}>
                                {task.category || 'General'}
                              </div>
                            </td>
                            <td style={{ padding: '15px', fontSize: '14px', borderBottom: `1px solid ${theme.cardBorder}` }} onClick={() => handleViewTask(task)}>
                              <div style={{
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                padding: '5px 12px',
                                borderRadius: '15px', 
                                fontSize: '12px', 
                                fontWeight: '500',
                                background: getPriorityColor(task.priority).bg,
                                color: getPriorityColor(task.priority).text,
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: getPriorityColor(task.priority).border,
                                gap: '6px'
                              }}>
                                {task.priority || 'Medium'}
                              </div>
                            </td>
                            <td style={{ padding: '15px', fontSize: '14px', borderBottom: `1px solid ${theme.cardBorder}` }} onClick={() => handleViewTask(task)}>
                              <div style={{
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                padding: '5px 12px',
                                borderRadius: '15px', 
                                fontSize: '12px', 
                                fontWeight: '500',
                                background: getStatusColor(task.status).bg,
                                color: getStatusColor(task.status).text,
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: getStatusColor(task.status).border,
                                gap: '6px'
                              }}>
                                {task.status || 'Not Started'}
                              </div>
                            </td>
                            <td style={{ padding: '15px', fontSize: '14px', color: theme.textSecondary, borderBottom: `1px solid ${theme.cardBorder}` }} onClick={() => handleViewTask(task)}>
                              {task.start_date ? new Date(task.start_date).toLocaleDateString() : '-'}
                            </td>
                            <td style={{ padding: '15px', fontSize: '14px', color: theme.textSecondary, borderBottom: `1px solid ${theme.cardBorder}` }} onClick={() => handleViewTask(task)}>
                              {task.end_date ? new Date(task.end_date).toLocaleDateString() : '-'}
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center', borderTopRightRadius: theme.borderRadiusSm, borderBottomRightRadius: theme.borderRadiusSm, borderBottom: `1px solid ${theme.cardBorder}` }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button onClick={(e) => { e.stopPropagation(); handleViewTask(task); }} style={{...secondaryButtonStyle, padding: '6px 10px', fontSize: '12px', gap: '4px'}} title="View Task">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> View
                                </button>
                                <button onClick={(e) => handleEditTask(task, e)} style={{...warningButtonStyle, padding: '6px 10px', fontSize: '12px', gap: '4px'}} title="Edit Task">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit
                                </button>
                                <button onClick={(e) => handleDeleteConfirm(task, e)} style={{...dangerButtonStyle, padding: '6px 10px', fontSize: '12px', gap: '4px'}} title="Delete Task">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRows.includes(task.id) && (
                            <tr key={`expanded-${task.id}`} style={{ background: theme.bgLight }}>
                              <td colSpan={8} style={{ padding: '10px 25px 20px 55px', animation: 'fadeIn 0.3s ease', borderBottom: `1px solid ${theme.cardBorder}`}}>
                                <div style={{ background: theme.bg, borderRadius: theme.borderRadiusSm, padding: '18px', marginTop: '5px', boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3)` }}>
                                  <h4 style={{ margin: '0 0 12px', color: theme.secondary, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                    Description
                                  </h4>
                                  <p style={{ margin: '0 0 16px', color: task.description ? theme.text : theme.textSecondary, lineHeight: '1.7', fontSize: '14px' }}>
                                    {task.description || 'No description provided.'}
                                  </p>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '15px', alignItems: 'center' }}>
                                    <div style={{ fontSize: '12px', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                      Created: {new Date(task.created_at).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {viewMode.cards && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {filteredTasks.map((task) => {
                    const catColor = getCategoryThemeColor(task.category);
                    return (
                      <div 
                        key={task.id}
                        onClick={() => handleViewTask(task)}
                        style={{
                          ...cardBaseStyle,
                          padding: '20px',
                          borderLeft: `5px solid ${catColor.text}`,
                          cursor: 'pointer',
                        }}
                        className="card-hover-lift"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.1rem', fontWeight: 600, color: theme.textHighlight, maxWidth: '80%' }}>
                            {task.title}
                          </h3>
                          <div style={{
                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500',
                            background: catColor.bg, color: catColor.text, borderWidth: '1px', borderStyle: 'solid', borderColor: catColor.border, whiteSpace: 'nowrap'
                          }}>
                            {task.category || 'General'}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                          <div style={{
                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500',
                            background: getPriorityColor(task.priority).bg, 
                            color: getPriorityColor(task.priority).text, 
                            borderWidth: '1px', borderStyle: 'solid', borderColor: getPriorityColor(task.priority).border,
                            whiteSpace: 'nowrap'
                          }}>
                            {task.priority}
                          </div>
                          <div style={{
                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500',
                            background: getStatusColor(task.status).bg, 
                            color: getStatusColor(task.status).text, 
                            borderWidth: '1px', borderStyle: 'solid', borderColor: getStatusColor(task.status).border,
                            whiteSpace: 'nowrap'
                          }}>
                            {task.status}
                          </div>
                        </div>
                        
                        {task.description && (
                          <p style={{ 
                            margin: '0 0 15px', color: theme.textSecondary, fontSize: '14px', lineHeight: '1.6',
                            display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical',
                            overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '3.2em',
                          }}>
                            {task.description}
                          </p>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: `1px solid ${theme.cardBorder}` }}>
                            <div style={{display: 'flex', gap: '15px'}}>
                                {task.start_date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: theme.textSecondary }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        {new Date(task.start_date).toLocaleDateString()}
                                    </div>
                                )}
                                {task.end_date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: theme.textSecondary }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        {new Date(task.end_date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: task.description ? '0' : '10px' }}>
                             <button onClick={(e) => handleEditTask(task, e)} style={{...warningButtonStyle, padding: '5px 8px', fontSize: '11px', gap: '4px'}} title="Edit Task">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit
                            </button>
                            <button onClick={(e) => handleDeleteConfirm(task, e)} style={{...dangerButtonStyle, padding: '5px 8px', fontSize: '11px', gap: '4px'}} title="Delete Task">
                               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        
        {formVisible && (
          <div style={{...cardBaseStyle, animation: 'fadeIn 0.4s ease, slideUp 0.4s ease', padding:'30px'}}> {/* Add/Edit Task Form Section */}
            <h2 style={{ marginTop: 0, marginBottom:'25px', color: theme.textHighlight, borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom:'15px' }}>
                {isEditing ? 'Edit Task' : 'Add New Task'}
            </h2>
            
            {submitStatus.type && (
              <div style={{
                padding: '12px 18px', borderRadius: theme.borderRadiusSm, marginBottom: '20px',
                backgroundColor: submitStatus.type === 'success' ? `${theme.success}25` : `${theme.errorText}25`,
                color: submitStatus.type === 'success' ? theme.success : theme.errorText,
                border: `1px solid ${submitStatus.type === 'success' ? theme.success : theme.errorText}`,
                animation: 'fadeIn 0.3s ease', fontWeight: 500,
              }}>
                {submitStatus.message}
              </div>
            )}
            
            <form onSubmit={isEditing ? handleUpdateTask : handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>
                  Title <span style={{ color: theme.errorText }}>*</span>
                </label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Enter task title" />
                {submitStatus.type === 'error' && !formData.title && (
                  <div style={{ color: theme.errorText, fontSize: '13px', marginTop: '6px' }}>Title is required</div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the task details..." style={{ minHeight: '120px', resize: 'vertical' }} />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="category" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange}>
                  <option value="General">General</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Finance">Finance</option>
                  <option value="Health">Health</option>
                  <option value="Home">Home</option>
                  <option value="Travel">Travel</option>
                  <option value="Career">Career</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Personal">Personal</option>
                  <option value="Digital">Digital</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label htmlFor="priority" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>Priority</label>
                  <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>Status</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                <div>
                  <label htmlFor="start_date" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>Start Date</label>
                  <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} />
                </div>
                <div>
                  <label htmlFor="end_date" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>End Date</label>
                  <input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleChange} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '25px', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '25px' }}>
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} style={{...secondaryButtonStyle, flexGrow:1}}>
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} style={{...primaryButtonStyle, flexGrow: isEditing ? 2 : 1, position: 'relative', overflow: 'hidden'}}>
                  {isSubmitting ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div style={{ width: '18px', height: '18px', border: `2px solid ${theme.textHighlight}80`, borderTopColor: theme.textHighlight, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
                    </div>
                  ) : isEditing ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {selectedTask && (
        <div className="modal-overlay" onClick={handleCloseTaskDetails}>
          <div className="modal-content" style={{ width: '90%', maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCloseTaskDetails} style={{
                position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none',
                borderRadius: '50%', fontSize: '22px', cursor: 'pointer', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary,
                transition: theme.transition, boxShadow:'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}20`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '16px',
                fontSize: '13px', fontWeight: '500', marginBottom: '15px',
                background: getCategoryThemeColor(selectedTask.category).bg,
                color: getCategoryThemeColor(selectedTask.category).text,
                borderWidth: '1px', borderStyle: 'solid', borderColor: getCategoryThemeColor(selectedTask.category).border,
                gap: '6px'
              }}>
                {selectedTask.category || 'General'}
              </div>
              <h2 style={{ margin: '0 0 20px', color: theme.textHighlight, fontWeight: 600, fontSize: '1.8rem' }}>{selectedTask.title}</h2>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '4px 12px', borderRadius: '14px', fontSize: '13px', fontWeight: '500',
                  background: getPriorityColor(selectedTask.priority).bg, 
                  color: getPriorityColor(selectedTask.priority).text, 
                  borderWidth: '1px', borderStyle: 'solid', borderColor: getPriorityColor(selectedTask.priority).border,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Priority: {selectedTask.priority}
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: '14px', fontSize: '13px', fontWeight: '500',
                  background: getStatusColor(selectedTask.status).bg, 
                  color: getStatusColor(selectedTask.status).text, 
                  borderWidth: '1px', borderStyle: 'solid', borderColor: getStatusColor(selectedTask.status).border,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Status: {selectedTask.status}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '25px', marginBottom: '25px', flexWrap: 'wrap' }}>
                {selectedTask.start_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: theme.bgLight, borderRadius: theme.borderRadiusSm }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span style={{ fontSize: '13px', color: theme.textSecondary }}>Start:</span>
                    <span style={{ fontWeight: '500', color: theme.text }}>{new Date(selectedTask.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedTask.end_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: theme.bgLight, borderRadius: theme.borderRadiusSm }}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span style={{ fontSize: '13px', color: theme.textSecondary }}>End:</span>
                    <span style={{ fontWeight: '500', color: theme.text }}>{new Date(selectedTask.end_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '12px', color: theme.secondary, fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Description Details
              </h3>
              <div style={{ background: theme.bgLight, borderRadius: theme.borderRadiusSm, padding: '20px', border: `1px solid ${theme.cardBorder}` }}>
                <p style={{ margin: 0, lineHeight: 1.7, color: selectedTask.description ? theme.text : theme.textSecondary, fontSize: '14px' }}>
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '30px', fontSize: '13px', color: theme.textSecondary, textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={(e) => handleEditTask(selectedTask, e)} style={{...warningButtonStyle, gap: '8px'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Edit Task
                </button>
                <button onClick={(e) => handleDeleteConfirm(selectedTask, e)} style={{...dangerButtonStyle, gap: '8px'}}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Delete Task
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Created: {new Date(selectedTask.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmTask && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" style={{ width: '90%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
             <button onClick={handleCancelDelete} style={{
                position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none',
                borderRadius: '50%', fontSize: '22px', cursor: 'pointer', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary,
                transition: theme.transition, boxShadow:'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}20`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 style={{ marginBottom: '20px', color:theme.textHighlight, borderBottom:`1px solid ${theme.cardBorder}`, paddingBottom:'15px' }}>Confirm Deletion</h2>
            <p style={{ marginBottom: '30px', color: theme.text, fontSize: '1.05rem' }}>
              Are you sure you want to permanently delete the task: <strong style={{color:theme.secondary}}>{deleteConfirmTask.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={handleCancelDelete} style={{...secondaryButtonStyle}}>
                Cancel
              </button>
              <button onClick={handleDeleteTask} style={{...dangerButtonStyle}}>
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralTasks; 