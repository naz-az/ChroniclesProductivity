import { useState, useEffect } from 'react'; 
import type { CSSProperties } from 'react';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
  created_at: string;
  order?: number; // Added for tracking display order
  completed?: boolean; // Added for tracking completion status
}

interface FormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
}

const SoftwareEngineering = () => {
  // Theme object adapted from Dashboard.tsx
  const theme = {
    bg: '#121212',
    bgLight: '#1E1E1E',
    cardBg: 'rgba(30, 30, 30, 0.85)', // Slightly more opaque for better readability on SE page
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

  // Category colors for badges/tags, similar to Dashboard
  const categoryThemeColors: Record<string, {bg: string, text: string, border: string}> = {
    'Development': { bg: `${theme.primary}20`, text: theme.primary, border: `${theme.primary}80` },
    'Design': { bg: `${theme.secondary}20`, text: theme.secondary, border: `${theme.secondary}80` },
    'Testing': { bg: `${theme.pending}20`, text: theme.pending, border: `${theme.pending}80` },
    'Bug Fix': { bg: `${theme.errorText}20`, text: theme.errorText, border: `${theme.errorText}80` },
    'Documentation': { bg: `#4DB6AC20`, text: '#4DB6AC', border: `#4DB6AC80` },
    'Other': { bg: `${theme.textSecondary}20`, text: theme.textSecondary, border: `${theme.textSecondary}80` },
    'General': { bg: `${theme.textSecondary}20`, text: theme.textSecondary, border: `${theme.textSecondary}80` },
  };

  const getCategoryThemeColor = (category: string) => {
    return categoryThemeColors[category] || categoryThemeColors['General'];
  };


  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    category: 'Development'
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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Simulating network delay like in dashboard
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await axios.get('http://localhost:5000/api/tasks');
      // Sort by creation date initially, newest first if desired, or keep as is
      const sortedTasks = response.data.sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Add order property to each task based on its current position
      const tasksWithOrder = sortedTasks.map((task: Task, index: number) => ({
        ...task,
        order: index
      }));
      
      setTasks(tasksWithOrder);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again later.');
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
      start_date: task.start_date ? task.start_date.split('T')[0] : '', // Format for date input
      end_date: task.end_date ? task.end_date.split('T')[0] : '', // Format for date input
      category: task.category || 'Development'
    });
    setIsEditing(true);
    setFormVisible(true); // Show form if editing from table/card action
    setSelectedTask(null); // Close details modal if open
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTask(null);
    setFormVisible(false); // Hide form on cancel
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      category: 'Development'
    });
     setSubmitStatus({ type: null, message: '' }); // Clear any form messages
  };
  
  const handleDeleteConfirm = (task: Task, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDeleteConfirmTask(task);
    setSelectedTask(null); // Close details modal if open
  };
  
  const handleCancelDelete = () => {
    setDeleteConfirmTask(null);
  };
  
  const handleDeleteTask = async () => {
    if (!deleteConfirmTask) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${deleteConfirmTask.id}`);
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
       setTimeout(() => { // Also auto-hide error for delete modal
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
      
      const response = await axios.put(`http://localhost:5000/api/tasks/${editingTask.id}`, formData);
      
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
        setFormVisible(false); // Hide form after update
         setFormData({ // Reset form
            title: '', description: '', start_date: '', end_date: '', category: 'Development'
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

  const handleDragStart = (e: React.DragEvent<HTMLElement>, task: Task) => {
    setDraggedTask(task);
    setIsDragging(true);
    
    // Set drag image/ghost element appearance
    if (e.dataTransfer && e.currentTarget) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id.toString());
      
      // Optional: Create a custom drag image
      const dragPreview = document.createElement('div');
      dragPreview.style.padding = '10px 15px';
      dragPreview.style.background = theme.primary;
      dragPreview.style.color = theme.textHighlight;
      dragPreview.style.borderRadius = '8px';
      dragPreview.style.boxShadow = theme.shadow;
      dragPreview.style.opacity = '0.9';
      dragPreview.style.fontWeight = 'bold';
      dragPreview.textContent = task.title;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 20, 20);
      
      // Clean up the temporary element after a short delay
      setTimeout(() => {
        document.body.removeChild(dragPreview);
      }, 100);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, targetTask: Task) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedTask || draggedTask.id === targetTask.id) {
      return;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, targetTask: Task) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask || draggedTask.id === targetTask.id) {
      setIsDragging(false);
      setDraggedTask(null);
      return;
    }

    // Reorder the tasks
    const updatedTasks = [...tasks].sort((a, b) => 
      (a.order !== undefined && b.order !== undefined) ? a.order - b.order : 0
    );
    
    const draggedIndex = updatedTasks.findIndex(task => task.id === draggedTask.id);
    const targetIndex = updatedTasks.findIndex(task => task.id === targetTask.id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove the dragged task
      const [movedTask] = updatedTasks.splice(draggedIndex, 1);
      
      // Insert at the target position
      updatedTasks.splice(targetIndex, 0, movedTask);
      
      // Update order values
      const reorderedTasks = updatedTasks.map((task, index) => ({
        ...task,
        order: index
      }));
      
      setTasks(reorderedTasks);
      
      // Optional: Save order to backend
      // This could be implemented as a bulk update or individual task updates
      // saveTaskOrder(reorderedTasks);
    }
    
    setIsDragging(false);
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedTask(null);
  };

  // Optional: Function to save the task order to the backend
  // Uncomment and implement if you want to persist the order
  /*
  const saveTaskOrder = async (reorderedTasks: Task[]) => {
    try {
      // Example implementation - update each task with its new order
      // const updatePromises = reorderedTasks.map(task => 
      //   axios.put(`http://localhost:5000/api/tasks/${task.id}`, { order: task.order })
      // );
      // await Promise.all(updatePromises);
      
      // Or implement a bulk update endpoint on the backend
      // await axios.post('http://localhost:5000/api/tasks/reorder', { tasks: reorderedTasks });
      
      console.log('Task order saved successfully');
    } catch (err) {
      console.error('Error saving task order:', err);
    }
  };
  */

  const getFilteredTasks = () => {
    const filtered = tasks.filter(task => {
      if (!searchTerm) return true;
      
      const searchTermLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchTermLower) ||
        (task.description && task.description.toLowerCase().includes(searchTermLower)) ||
        (task.category && task.category.toLowerCase().includes(searchTermLower))
      );
    });
    
    // First sort by order if not using another sort column
    if (sortColumn === 'order') {
      return filtered.sort((a, b) => {
        if (a.order === undefined || b.order === undefined) return 0;
        return sortDirection === 'asc' ? a.order - b.order : b.order - a.order;
      });
    }
    
    // Otherwise sort by the selected column
    return filtered.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue === null || aValue === undefined) aValue = ''; // Treat null/undefined as empty string for sorting
      if (bValue === null || bValue === undefined) bValue = '';

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Update the handleSort function to include 'order' as a possible sort column
  const handleSort = (column: keyof Task) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Add useEffect to initialize 'order' as the default sort column when first loading
  useEffect(() => {
    if (tasks.length > 0 && tasks[0].order !== undefined) {
      setSortColumn('order');
      setSortDirection('asc');
    }
  }, [tasks]);

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
      
      await axios.post('http://localhost:5000/api/tasks', formData);
      
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        category: 'Development'
      });
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Task added successfully!'
      });
      
      setTimeout(() => {
        setFormVisible(false); // Auto-hide form after success
        setSubmitStatus({ type: null, message: ''}); // Clear message
      }, 1500);
      
      fetchTasks(); // Refresh tasks list
      
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
    setFormVisible(false); // Hide form if open
    setEditingTask(null); // Ensure not in edit mode
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
    overflow: 'hidden', // Changed from 'visible' to 'hidden' for consistency with dashboard
    transition: theme.transition,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const inputStyle: CSSProperties = {
    fontFamily: theme.fontFamily,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: theme.borderRadiusSm,
    padding: '10px 14px', // Increased padding
    fontSize: '14px',
    transition: theme.transition,
    backgroundColor: theme.bgLight,
    color: theme.text,
    width: '100%', // Ensure inputs take full width of their container
    boxSizing: 'border-box',
  };

  const inputFocusStyle: CSSProperties = { // To be used with a class or direct state
    borderColor: theme.primary,
    boxShadow: `0 0 0 3px ${theme.primary}40`, // Adjusted shadow for dark theme
    outline: 'none',
  };
  
  // Styles for buttons, adapted from dashboard's tabButtonStyle or general button principles
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
    padding: '10px 18px', // Standardized padding
    borderRadius: theme.borderRadiusSm,
    outline: 'none',
    letterSpacing: '0.5px',
  };

  const primaryButtonStyle: CSSProperties = {
    ...baseButtonStyle,
    background: theme.primary,
    color: theme.textHighlight, // Ensuring contrast
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
    color: theme.textHighlight, // Use black or dark text if pending is too light
    boxShadow: `0 2px 8px ${theme.pending}50, ${theme.shadowSm}`,
  };

  // Function to toggle task completion - simplified
  const handleToggleComplete = (taskId: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
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

        .animate-fadeInPage { /* Renamed to avoid conflict with dashboard's .animate-fadeIn */
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
        
        /* Global input, select, textarea styles (can be fine-tuned) */
        input, select, textarea {
          font-family: ${theme.fontFamily};
          border: 1px solid ${theme.cardBorder};
          border-radius: ${theme.borderRadiusSm};
          padding: 10px 14px;
          font-size: 14px;
          background-color: ${theme.bgLight};
          color: ${theme.text};
          transition: ${theme.transition};
          box-sizing: border-box; /* Added for better layout control */
          width: 100%; /* Default to full width */
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
          background-color: rgba(0, 0, 0, 0.7); /* Darker overlay */
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }
        
        .modal-content {
          background-color: ${theme.cardBg}; /* Use cardBg for modal */
          border-radius: ${theme.borderRadius};
          box-shadow: ${theme.shadow};
          max-height: 90vh;
          overflow-y: auto; /* Changed from 'auto' to 'overflow-y: auto' for clarity */
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

        /* Drag and drop styles */
        [draggable=true] {
          cursor: grab;
        }
        
        [draggable=true]:active {
          cursor: grabbing;
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
          fontSize: '2.5rem', // Slightly adjusted from dashboard for page context
          background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>Software Engineering Tasks</h1>
        <button 
          onClick={() => {
            setFormVisible(!formVisible);
            if (isEditing) handleCancelEdit(); // If editing, cancel and toggle form
            else if (selectedTask) setSelectedTask(null); // Close details modal if opening form
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
        marginBottom: '30px', // Increased margin
        gap: '20px', // Added gap
      }}>
        <div style={{ 
          position: 'relative',
          flexGrow: 1, // Allow search to take more space
          maxWidth: '400px', 
        }}>
          <input
            type="text"
            placeholder="Search tasks by title, description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
                ...inputStyle, // Applied themed input style
                paddingLeft: '42px', // Space for icon
                height: '42px',
            }}
          />
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '14px', // Adjusted for padding
            transform: 'translateY(-50%)',
            color: theme.textSecondary, // Themed icon color
            pointerEvents: 'none',
            display: 'flex', // For centering icon
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
            onClick={() => setViewMode(prev => ({...prev, table: !prev.table}))} // Toggle table view
            style={{
              ...baseButtonStyle,
              background: viewMode.table ? theme.primary : 'transparent',
              color: viewMode.table ? theme.textHighlight : theme.textSecondary,
              boxShadow: viewMode.table ? `0 1px 5px ${theme.primary}40` : 'none',
              padding: '8px 14px', // Slightly adjusted padding
              gap: '6px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode(prev => ({...prev, cards: !prev.cards}))} // Toggle cards view
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
        gridTemplateColumns: formVisible ? '1.2fr 0.8fr' : '1fr', // Keep this dynamic layout
        gap: '30px',
        transition: 'grid-template-columns 0.4s ease-in-out' // Smoother transition
      }}>
        <div style={{...cardBaseStyle, padding:'30px'}}> {/* Task List Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom:'15px', borderBottom: `1px solid ${theme.cardBorder}` }}>
            <h2 style={{ margin:0, fontSize: '1.5rem', fontWeight: 600, color: theme.textHighlight }}>
              Current Tasks
              {isDragging && (
                <span style={{ marginLeft: '12px', fontSize: '0.9rem', color: theme.secondary, fontWeight: 'normal' }}>
                  Drag to reorder
                </span>
              )}
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
              fontSize: '1rem', // Larger font for count
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
              <p style={{ margin: '0 0 20px', color: theme.textSecondary, fontSize: '1.1rem' }}>No tasks warp signature detected.</p>
              <button onClick={() => setFormVisible(true)} style={{...primaryButtonStyle, gap: '8px'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Your First Task
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}> {/* Container for Table and/or Cards */}
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
                        {['title', 'category', 'start_date', 'end_date'].map(col => (
                           <th 
                            key={col}
                            onClick={() => handleSort(col as keyof Task)}
                            style={{ 
                              padding: '15px', textAlign: 'left', cursor: 'pointer',
                              fontWeight: 600, color: theme.textSecondary, fontSize: '0.85rem',
                              textTransform: 'uppercase', letterSpacing: '0.5px',
                              userSelect: 'none', borderBottom: `1px solid ${theme.cardBorder}`
                            }}
                            className="table-header-hover" // Add class for specific hover if needed
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
                              transition: theme.transition, 
                              cursor: 'grab',
                              background: draggedTask?.id === task.id ? `${theme.primary}15` : theme.bgLight,
                            }}
                            className="table-hover-row" // Apply dashboard-like hover
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragOver={(e) => handleDragOver(e, task)}
                            onDrop={(e) => handleDrop(e, task)}
                            onDragEnd={handleDragEnd}
                          >
                            <td 
                              style={{ padding: '12px 10px', textAlign: 'center', borderTopLeftRadius: theme.borderRadiusSm, borderBottomLeftRadius: theme.borderRadiusSm, borderBottom: `1px solid ${theme.cardBorder}` }}
                              onClick={(e) => toggleRowExpansion(task.id, e)}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary, transition: 'transform 0.2s ease', transform: expandedRows.includes(task.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </span>
                            </td>
                            <td 
                              style={{ 
                                padding: '15px 5px 15px 15px', 
                                width: '40px', 
                                textAlign: 'center',
                                borderBottom: `1px solid ${theme.cardBorder}`
                              }}
                              onClick={(e) => e.stopPropagation()} // Prevent row selection
                            >
                              <input 
                                type="checkbox"
                                checked={task.completed || false}
                                onChange={() => handleToggleComplete(task.id)}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                  accentColor: theme.primary,
                                }}
                              />
                            </td>
                            <td style={{ 
                              padding: '15px 15px 15px 5px', 
                              fontSize: '14px', 
                              maxWidth: '250px', 
                              textOverflow: 'ellipsis', 
                              overflow: 'hidden', 
                              whiteSpace: 'nowrap', 
                              color: theme.text, 
                              fontWeight: 500, 
                              borderBottom: `1px solid ${theme.cardBorder}`,
                              textDecoration: task.completed ? 'line-through' : 'none',
                              opacity: task.completed ? 0.7 : 1
                            }} onClick={() => handleViewTask(task)}>
                              {task.title}
                              <span style={{ marginLeft: '8px', color: theme.textSecondary, fontSize: '12px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                  <line x1="8" y1="6" x2="16" y2="6"></line>
                                  <line x1="8" y1="12" x2="16" y2="12"></line>
                                  <line x1="8" y1="18" x2="16" y2="18"></line>
                                </svg>
                              </span>
                            </td>
                            <td style={{ padding: '15px', fontSize: '14px', borderBottom: `1px solid ${theme.cardBorder}` }} onClick={() => handleViewTask(task)}>
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', padding: '5px 12px',
                                borderRadius: '15px', fontSize: '12px', fontWeight: '500',
                                background: getCategoryThemeColor(task.category).bg,
                                color: getCategoryThemeColor(task.category).text,
                                border: `1px solid ${getCategoryThemeColor(task.category).border}`,
                                gap: '6px'
                              }}>
                                {/* Category Icon (Optional - add if you have specific icons) */}
                                {task.category || 'General'}
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
                              <td colSpan={6} style={{ padding: '10px 25px 20px 55px', animation: 'fadeIn 0.3s ease', borderBottom: `1px solid ${theme.cardBorder}`}}>
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
                          ...cardBaseStyle, // Use the themed card style
                          padding: '20px',
                          borderLeft: `5px solid ${task.completed ? '#4A4A4A' : catColor.text}`, // Dimmed color for completed tasks
                          cursor: isDragging ? 'grabbing' : 'grab',
                          opacity: task.completed ? 0.85 : (draggedTask?.id === task.id ? 0.6 : 1),
                          transform: draggedTask?.id === task.id ? 'scale(0.98)' : 'scale(1)',
                          backgroundColor: task.completed ? '#2A2A2A' : theme.cardBg, // Much darker background for completed tasks
                          borderTop: task.completed ? `1px dashed ${theme.cardBorder}` : `1px solid ${theme.cardBorder}`,
                          borderRight: task.completed ? `1px dashed ${theme.cardBorder}` : `1px solid ${theme.cardBorder}`,
                          borderBottom: task.completed ? `1px dashed ${theme.cardBorder}` : `1px solid ${theme.cardBorder}`,
                        }}
                        className={task.completed ? "" : "card-hover-lift"} // Remove hover effect for completed tasks
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragOver={(e) => handleDragOver(e, task)}
                        onDrop={(e) => handleDrop(e, task)}
                        onDragEnd={handleDragEnd}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '80%' }}>
                            <input 
                              type="checkbox"
                              checked={task.completed || false}
                              onChange={() => handleToggleComplete(task.id)}
                              onClick={(e) => e.stopPropagation()} // Prevent card selection
                              style={{
                                width: '20px',
                                height: '20px', 
                                cursor: 'pointer',
                                accentColor: theme.primary,
                                flexShrink: 0,
                                marginTop: '2px'
                              }}
                            />
                            <h3 style={{ 
                              marginTop: 0, 
                              marginBottom: '8px', 
                              fontSize: '1.1rem', 
                              fontWeight: 600, 
                              color: theme.textHighlight, 
                              textDecoration: task.completed ? 'line-through' : 'none',
                              opacity: task.completed ? 0.7 : 1
                            }}>
                              {task.title}
                              <span style={{ 
                                display: 'inline-block',
                                marginLeft: '8px', 
                                color: theme.textSecondary,
                                fontSize: '11px',
                                padding: '2px 6px',
                                background: `${theme.cardBorder}50`,
                                borderRadius: '4px',
                                verticalAlign: 'middle'
                              }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                  <line x1="8" y1="6" x2="16" y2="6"></line>
                                  <line x1="8" y1="12" x2="16" y2="12"></line>
                                  <line x1="8" y1="18" x2="16" y2="18"></line>
                                </svg>
                              </span>
                            </h3>
                          </div>
                          <div style={{
                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500',
                            background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}`, whiteSpace: 'nowrap'
                          }}>
                            {task.category || 'General'}
                          </div>
                        </div>
                        
                        {task.description && (
                          <p style={{ 
                            margin: '0 0 15px', color: theme.textSecondary, fontSize: '14px', lineHeight: '1.6',
                            display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical',
                            overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '3.2em', // Approx 2 lines
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
                {isEditing ? 'Edit Task Chronicle' : 'Add New Task to Timeline'}
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
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Testing">Testing</option>
                  <option value="Bug Fix">Bug Fix</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Other">Other</option>
                </select>
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
                border: `1px solid ${getCategoryThemeColor(selectedTask.category).border}`,
                gap: '6px'
              }}>
                {/* Category Icon (Optional) */}
                {selectedTask.category || 'General'}
              </div>
              <h2 style={{ margin: '0 0 20px', color: theme.textHighlight, fontWeight: 600, fontSize: '1.8rem' }}>{selectedTask.title}</h2>
              
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

      {/* Edit Task Modal - Integrated with Form Section, this specific modal is redundant if formVisible handles edit */}
      {/* This section can be removed if the main form handles editing when `isEditing` is true */}

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

export default SoftwareEngineering;