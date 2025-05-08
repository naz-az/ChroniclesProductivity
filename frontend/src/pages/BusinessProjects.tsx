import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react'; // Fixed: Type-only import
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string;
  client: string;
  start_date: string;
  end_date: string;
  status: string; // e.g., 'Planned', 'In Progress', 'On Hold', 'Completed', 'Cancelled'
  budget: number;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  image_url: string;
  client: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
}

const BusinessProjects = () => {
  const navigate = useNavigate();

  // Theme object (consistent with previous examples)
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

  // Status colors for badges/tags
  const statusThemeColors: Record<string, {bg: string, text: string, border: string}> = {
    'Completed': { bg: `${theme.success}20`, text: theme.success, border: `${theme.success}80` },
    'In Progress': { bg: `${theme.primary}20`, text: theme.primary, border: `${theme.primary}80` },
    'On Hold': { bg: `${theme.pending}20`, text: theme.pending, border: `${theme.pending}80` },
    'Cancelled': { bg: `${theme.errorText}20`, text: theme.errorText, border: `${theme.errorText}80` },
    'Planned': { bg: `${theme.textSecondary}20`, text: theme.textSecondary, border: `${theme.textSecondary}80` },
    'Default': { bg: `${theme.textSecondary}20`, text: theme.textSecondary, border: `${theme.textSecondary}80` },
  };

  const getStatusThemeColor = (status: string) => {
    return statusThemeColors[status] || statusThemeColors['Default'];
  };

  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<{table: boolean, cards: boolean}>({table: false, cards: true}); // Default to cards view
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // For Modal View (if implemented)
  const [sortColumn, setSortColumn] = useState<keyof Project>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_url: '',
    client: '',
    start_date: '',
    end_date: '',
    status: 'Planned',
    budget: 0
  });
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      const response = await axios.get('http://localhost:5000/api/projects');
      const sortedProjects = response.data.sort((a: Project, b: Project) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setProjects(sortedProjects);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- Event Handlers (Functionality remains unchanged) ---

   const handleEditProject = (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      image_url: project.image_url || '',
      client: project.client || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '', // Format for date input
      end_date: project.end_date ? project.end_date.split('T')[0] : '', // Format for date input
      status: project.status || 'Planned',
      budget: project.budget || 0
    });
    setIsEditing(true);
    setFormVisible(true); // Open form in edit mode
    setSelectedProject(null); // Close details modal if open
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProject(null);
    setFormVisible(false); // Close form
    setFormData({ // Reset form
        title: '', description: '', image_url: '', client: '',
        start_date: '', end_date: '', status: 'Planned', budget: 0
    });
     setSubmitStatus({ type: null, message: '' }); // Clear form messages
  };

  const handleDeleteConfirm = (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDeleteConfirmProject(project);
    setSelectedProject(null); // Close details modal if open
  };

  const handleCancelDelete = () => {
    setDeleteConfirmProject(null);
  };

  const handleDeleteProject = async () => {
    if (!deleteConfirmProject) return;

    try {
      await axios.delete(`http://localhost:5000/api/projects/${deleteConfirmProject.id}`);
      setProjects(projects.filter(project => project.id !== deleteConfirmProject.id));
      setDeleteConfirmProject(null);
      console.log("Project deleted successfully");
       setSubmitStatus({ // Show temporary status in form area if visible, or handle differently
            type: 'success',
            message: 'Project deleted successfully!'
        });
        setTimeout(() => {
            setSubmitStatus({ type: null, message: '' });
        }, 3000);
    } catch (err) {
      console.error('Error deleting project:', err);
       setSubmitStatus({
            type: 'error',
            message: 'Failed to delete project. Please try again.'
        });
        setTimeout(() => { // Also auto-hide error
            setSubmitStatus({ type: null, message: '' });
        }, 3000);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: '' });

      if (!formData.title) {
        setSubmitStatus({ type: 'error', message: 'Project Title is required' });
        setIsSubmitting(false);
        return;
      }

      const response = await axios.put(`http://localhost:5000/api/projects/${editingProject.id}`, formData);
      setProjects(projects.map(p => p.id === editingProject.id ? response.data : p));

      setSubmitStatus({ type: 'success', message: 'Project updated successfully!' });
      setTimeout(() => {
        handleCancelEdit(); // Use cancel function to reset state and close form
      }, 1500);

    } catch (err) {
      console.error('Error updating project:', err);
      setSubmitStatus({ type: 'error', message: 'Failed to update project.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'budget') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getFilteredProjects = () => {
    const filtered = projects.filter(project => {
      if (!searchTerm) return true;
      const searchTermLower = searchTerm.toLowerCase();
      return (
        project.title.toLowerCase().includes(searchTermLower) ||
        (project.description && project.description.toLowerCase().includes(searchTermLower)) ||
        (project.client && project.client.toLowerCase().includes(searchTermLower)) ||
        (project.status && project.status.toLowerCase().includes(searchTermLower))
      );
    });

    return filtered.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        // Convert budget to number for comparison if sorting by budget
        if (sortColumn === 'budget') {
             aValue = Number(aValue);
             bValue = Number(bValue);
        }

        // Handle potential null/undefined/empty strings, especially for dates
        if (aValue === null || aValue === undefined || aValue === '') aValue = sortDirection === 'asc' ? Infinity : -Infinity; // push empty values to the end/start
        if (bValue === null || bValue === undefined || bValue === '') bValue = sortDirection === 'asc' ? Infinity : -Infinity;


        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
        });
  };

  const handleSort = (column: keyof Project) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: '' });

      if (!formData.title) {
        setSubmitStatus({ type: 'error', message: 'Project Title is required' });
        setIsSubmitting(false);
        return;
      }

      await axios.post('http://localhost:5000/api/projects', formData);
      setSubmitStatus({ type: 'success', message: 'Project added successfully!' });
      fetchProjects(); // Refresh list

      setTimeout(() => {
        setFormVisible(false); // Close form
        setFormData({ // Reset form
            title: '', description: '', image_url: '', client: '',
            start_date: '', end_date: '', status: 'Planned', budget: 0
        });
        setSubmitStatus({type: null, message: ''}); // Clear message
      }, 1500);

    } catch (err) {
      console.error('Error creating project:', err);
      setSubmitStatus({ type: 'error', message: 'Failed to create project.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to detail page when clicking card/row
   const handleViewProjectDetails = (projectId: number, e?: React.MouseEvent) => {
    if (e) {
      // Check if the click target or its parent is a button to prevent navigation
      let targetElement = e.target as HTMLElement;
      while (targetElement && targetElement !== e.currentTarget) {
          // Check if the click target or its parent is a button or an icon inside a button
          if (targetElement.tagName === 'BUTTON' || targetElement.closest('button')) {
              return; // Don't navigate if a button inside the card/row was clicked
          }
          targetElement = targetElement.parentNode as HTMLElement;
      }
    }
     navigate(`/business-projects/${projectId}`);
  };

   // Close project details modal (if used)
  const handleCloseProjectDetails = () => {
    setSelectedProject(null);
  };

  const filteredProjects = getFilteredProjects();

  // --- Themed Styles ---
   const cardBaseStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '25px', // Standard padding
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    position: 'relative',
    overflow: 'hidden', // Changed to hidden
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
    color: '#000000', // Dark text for better contrast on yellow
    boxShadow: `0 2px 8px ${theme.pending}50, ${theme.shadowSm}`,
  };

  // Specific styles for icon-only buttons
  const iconButtonStyle: CSSProperties = {
    ...baseButtonStyle,
    padding: '0', // Remove padding for icon buttons
    width: '34px',
    height: '34px',
    borderRadius: '50%', // Make them circular
    background: 'transparent', // Make background transparent
    color: theme.textSecondary, // Default icon color
    boxShadow: 'none', // Subtle shadow or none
    border: 'none', // Remove border for cleaner look
  };


  return (
    <div className="animate-fadeInPage" style={{ fontFamily: theme.fontFamily, background: theme.bg, color: theme.text, padding: '30px 40px', minHeight: '100vh' }}>
      <style>
        {`
        /* Import Inter font if not already global */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .animate-fadeInPage { animation: fadeIn 0.6s ${theme.transition} forwards; }

        .table-hover-row { transition: background-color 0.2s ease-in-out; }
        .table-hover-row:hover td { background-color: ${theme.primary}2A !important; }
        .table-hover-row:hover td:first-child { color: ${theme.secondary} !important; }

        .card-hover-lift { transition: transform 0.25s ${theme.transition}, box-shadow 0.25s ${theme.transition}; }
        .card-hover-lift:hover { transform: translateY(-6px); box-shadow: 0 12px 28px rgba(0,0,0,0.4); }

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
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus {
          border: 1px solid ${theme.primary};
          -webkit-text-fill-color: ${theme.text};
          -webkit-box-shadow: 0 0 0px 1000px ${theme.bgLight} inset;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: ${theme.text}; /* Ensure cursor is visible */
        }
        input:focus, select:focus, textarea:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 3px ${theme.primary}40;
          outline: none;
        }
        /* Adjust date input text color */
        input[type="date"]::-webkit-calendar-picker-indicator {
           filter: invert(0.8); /* Invert icon color for dark mode */
        }
         input[type="date"] {
           color-scheme: dark; /* Helps browser style date picker for dark mode */
           color: ${theme.textSecondary}; /* Dim color until selected */
         }
         input[type="date"]:focus, input[type="date"]:valid {
            color: ${theme.text}; /* Full color on focus or valid input */
         }


        /* Modal Styles */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.75); /* Slightly darker overlay */
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; animation: fadeIn 0.3s ease;
          padding: 20px; /* Add padding for smaller screens */
        }
        .modal-content {
          background-color: ${theme.cardBg};
          border-radius: ${theme.borderRadius};
          box-shadow: ${theme.shadow};
          max-height: 90vh; overflow-y: auto;
          /* padding: 28px; /* Adjusted in style prop where needed */
          position: relative;
          animation: fadeIn 0.35s ease, slideUp 0.35s ease;
          border: 1px solid ${theme.cardBorder};
          color: ${theme.text}; /* Ensure modal text color is set */
        }

         /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${theme.bgLight}50; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: ${theme.primary}70; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.primary}; }

        /* Project Card Specific */
         .project-card {
            background: ${theme.cardBg};
            border-radius: ${theme.borderRadius};
            border: 1px solid ${theme.cardBorder};
            box-shadow: ${theme.shadowSm}; /* Use smaller shadow for cards */
            overflow: hidden;
            transition: ${theme.transition};
            height: 100%;
            display: flex;
            flex-direction: column;
            cursor: pointer;
        }
         .project-card:hover {
            transform: translateY(-6px);
            box-shadow: ${theme.shadow}; /* Larger shadow on hover */
            border-color: ${theme.primary}80;
         }
        .project-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            object-position: center;
             border-bottom: 1px solid ${theme.cardBorder}; /* Separator */
             display: block; /* Ensure no extra space below image */
        }
        .status-badge {
          display: inline-flex; align-items: center;
          padding: 5px 12px; border-radius: 15px;
          font-size: 12px; font-weight: 500; gap: 6px;
          text-transform: capitalize; /* Ensure consistent casing */
        }
        /* Icon Button Hover Effects */
        .icon-button { /* Add this class to icon buttons */
             transition: background-color 0.2s ease, color 0.2s ease;
         }
         .icon-button:hover {
             background-color: ${theme.primary}20;
             color: ${theme.primary}; /* Highlight color on hover */
         }
         .icon-button.delete:hover {
             background-color: ${theme.errorText}20;
             color: ${theme.errorText};
         }
          .icon-button.edit:hover {
             background-color: ${theme.pending}20;
             color: ${theme.pending};
         }

        `}
      </style>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '40px', paddingBottom: '20px', borderBottom: `1px solid ${theme.cardBorder}`,
      }}>
        <h1 style={{
          margin: 0, fontWeight: 700, fontSize: '2.5rem',
          background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Business Projects</h1>
        <button
          onClick={() => { setFormVisible(true); setIsEditing(false); setEditingProject(null); setFormData({ title: '', description: '', image_url: '', client: '', start_date: '', end_date: '', status: 'Planned', budget: 0 }); setSubmitStatus({ type: null, message: '' }); }}
          style={{ ...primaryButtonStyle, gap: '8px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Add New Project</span>
        </button>
      </div>

      {/* Search and View Toggle */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '30px', gap: '20px', flexWrap: 'wrap' // Allow wrap on smaller screens
      }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '250px', maxWidth: '450px' }}> {/* Adjusted max width */}
          <input type="text" placeholder="Search projects (title, client, status...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '42px', height: '42px' }}
          />
          <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: theme.textSecondary, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
        <div style={{
          display: 'flex', gap: '8px', background: theme.bgLight, padding: '6px', borderRadius: theme.borderRadiusSm, boxShadow: `inset 0 1px 2px rgba(0,0,0,0.2), ${theme.shadowSm}`,
        }}>
          <button onClick={() => setViewMode(prev => ({...prev, table: !prev.table}))} style={{ ...baseButtonStyle, background: viewMode.table ? theme.primary : 'transparent', color: viewMode.table ? theme.textHighlight : theme.textSecondary, boxShadow: viewMode.table ? `0 1px 5px ${theme.primary}40` : 'none', padding: '8px 14px', gap: '6px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <span>Table</span>
          </button>
          <button onClick={() => setViewMode(prev => ({...prev, cards: !prev.cards}))} style={{ ...baseButtonStyle, background: viewMode.cards ? theme.primary : 'transparent', color: viewMode.cards ? theme.textHighlight : theme.textSecondary, boxShadow: viewMode.cards ? `0 1px 5px ${theme.primary}40` : 'none', padding: '8px 14px', gap: '6px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {formVisible && (
        <div className="modal-overlay" onClick={handleCancelEdit /* Use cancel on overlay click */}>
          <div className="modal-content" style={{ width: '600px', maxWidth: '95%' }} onClick={(e) => e.stopPropagation()}>
             <button onClick={handleCancelEdit} style={{
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
            <h2 style={{ marginTop: 0, marginBottom:'25px', color: theme.textHighlight, borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom:'15px' }}>
              {isEditing ? 'Edit Project Details' : 'Add New Business Project'}
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

            <form onSubmit={isEditing ? handleUpdateProject : handleSubmit}>
               <div style={{ marginBottom: '20px' }}>
                <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.textSecondary }}>Title <span style={{color: theme.errorText}}>*</span></label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Project Title"/>
                 {submitStatus.type === 'error' && !formData.title && ( // Added specific error for title
                     <div style={{ color: theme.errorText, fontSize: '13px', marginTop: '6px' }}>Title is required</div>
                 )}
              </div>
              <div style={{ marginBottom: '20px' }}>
                 <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.textSecondary }}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Project Description" style={{resize: 'vertical'}}/>
              </div>
               <div style={{ marginBottom: '20px' }}>
                <label htmlFor="image_url" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.textSecondary }}>Image URL</label>
                <input type="url" id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg"/>
               </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="client" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.textSecondary }}>Client</label>
                    <input type="text" id="client" name="client" value={formData.client} onChange={handleChange} placeholder="Client Name"/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label htmlFor="start_date" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.textSecondary }}>Start Date</label>
                        <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="end_date" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.textSecondary }}>End Date</label>
                        <input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleChange} />
                    </div>
                </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                   <div>
                        <label htmlFor="status" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.textSecondary }}>Status <span style={{color: theme.errorText}}>*</span></label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} required>
                            <option value="Planned">Planned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="budget" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.textSecondary }}>Budget ($)</label>
                        <input type="number" id="budget" name="budget" value={formData.budget} onChange={handleChange} min="0" step="1000" placeholder="e.g., 50000"/>
                    </div>
                 </div>

              {/* Form Actions */}
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '20px' }}>
                  <button type="button" onClick={handleCancelEdit} style={secondaryButtonStyle}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{...primaryButtonStyle, minWidth: '120px'}}>
                    {isSubmitting ? (
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <div style={{ width: '18px', height: '18px', border: `2px solid ${theme.textHighlight}80`, borderTopColor: theme.textHighlight, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <span>Saving...</span>
                        </div>
                    ) : isEditing ? 'Update Project' : 'Create Project'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Views Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Table View */}
        {viewMode.table && (
          <div style={{ ...cardBaseStyle, padding: '0', marginBottom: viewMode.cards ? '30px' : '0', overflow:'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.cardBorder}` }}>
                     {['title', 'client', 'status', 'budget', 'start_date'].map(col => (
                         <th key={col} onClick={() => handleSort(col as keyof Project)}
                              style={{ padding: '15px 20px', textAlign: col === 'budget' ? 'right' : 'left', cursor: 'pointer', fontWeight: 600, color: theme.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', userSelect: 'none', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: col === 'budget' ? 'flex-end' : 'flex-start' }}>
                                  {col.replace('_', ' ')}
                                  {sortColumn === col && (
                                      <span style={{ display:'flex', alignItems:'center' }}>
                                      {sortDirection === 'asc' ?
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> :
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                      }
                                      </span>
                                  )}
                              </div>
                         </th>
                     ))}
                     <th style={{ padding: '15px 20px', width: '120px', textAlign: 'center', fontWeight: 600, color: theme.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Fixed Conditional Rendering */}
                  {loading ? (
                      <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center' }}>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: theme.textSecondary }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `3px solid ${theme.secondary}50`, borderTopColor: theme.secondary, animation: 'spin 1s linear infinite' }} />
                                Loading projects...
                           </div>
                      </td></tr>
                  ) : error ? (
                      <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: theme.errorText }}>{error}</td></tr>
                  ) : filteredProjects.length === 0 ? (
                       <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: theme.textSecondary }}>
                            {searchTerm ? 'No projects match search' : 'No projects found.'}
                        </td></tr>
                  ) : (
                    filteredProjects.map(project => { // Map function starts here
                      const statusColor = getStatusThemeColor(project.status); // Define statusColor here
                      return (
                        <tr key={project.id} className="table-hover-row" style={{ borderBottom: `1px solid ${theme.cardBorder}`, cursor: 'pointer' }} onClick={(e) => handleViewProjectDetails(project.id, e)}>
                          <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                             <div style={{ fontWeight: 500, color: theme.textHighlight, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.title}</div>
                          </td>
                          <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>{project.client}</td>
                          <td style={{ padding: '16px 20px' }}>
                             <span className="status-badge" style={{ background: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.border}` }}>
                               {project.status}
                             </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'monospace', color: theme.success }}>${project.budget.toLocaleString()}</td>
                           <td style={{ padding: '16px 20px', color: theme.textSecondary }}>{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</td>
                          <td style={{ padding: '16px 20px' }}>
                             <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                               {/* Edit Button */}
                               <button onClick={(e) => handleEditProject(project, e)} className="icon-button edit" style={{ ...iconButtonStyle }} title="Edit Project">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                               </button>
                               {/* Delete Button */}
                               <button onClick={(e) => handleDeleteConfirm(project, e)} className="icon-button delete" style={{ ...iconButtonStyle }} title="Delete Project">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                               </button>
                             </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cards View */}
        {viewMode.cards && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
            {/* Fixed Conditional Rendering */}
             {loading ? (
                 <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: theme.textSecondary }}>
                           <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `3px solid ${theme.secondary}50`, borderTopColor: theme.secondary, animation: 'spin 1s linear infinite' }} />
                           Loading projects...
                      </div>
                 </div>
             ) : error ? (
                 <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', color: theme.errorText }}>{error}</div>
             ) : filteredProjects.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', color: theme.textSecondary }}>
                       {searchTerm ? 'No projects match search' : 'No projects found.'}
                   </div>
             ) : (
              filteredProjects.map(project => { // Map starts here
                  const statusColor = getStatusThemeColor(project.status); // Define statusColor here
                  return (
                      <div key={project.id} className="project-card card-hover-lift" onClick={(e) => handleViewProjectDetails(project.id, e)}>
                          <img src={project.image_url || `https://source.unsplash.com/random/400x200?business,office,${project.id}`} alt={project.title} className="project-image"/>
                          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: theme.textHighlight, flexGrow: 1, marginRight: '10px' }}>{project.title}</h3>
                                  <span className="status-badge" style={{ background: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.border}` }}>
                                      {project.status}
                                  </span>
                              </div>
                              <p style={{ margin: '0 0 16px', fontSize: '14px', color: theme.textSecondary, lineHeight: 1.5, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {project.description || 'No description available.'}
                              </p>
                              <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '8px' }}> {/* Reduced bottom margin */}
                                  Client: <span style={{ fontWeight: 500, color: theme.text }}>{project.client || '-'}</span>
                              </div>
                               <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px' }}>
                                  Budget: <span style={{ fontWeight: 500, color: theme.success }}>${project.budget.toLocaleString()}</span>
                              </div>
                              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '15px' }}>
                                  <button onClick={(e) => handleEditProject(project, e)} className="icon-button edit" style={{ ...iconButtonStyle }} title="Edit Project">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  </button>
                                  <button onClick={(e) => handleDeleteConfirm(project, e)} className="icon-button delete" style={{ ...iconButtonStyle }} title="Delete Project">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                  </button>
                              </div>
                          </div>
                      </div>
                  )
              })
             )}
          </div>
        )}
      </div>

      {/* Project Details Modal (Styling for reference if uncommented) */}
      {selectedProject && (
        <div className="modal-overlay" onClick={handleCloseProjectDetails}>
          <div className="modal-content" style={{ width: '800px', maxWidth: '95%', padding: '0' /* Remove padding for full-width image */ }} onClick={(e) => e.stopPropagation()}>
             <button onClick={handleCloseProjectDetails} style={{
                position: 'absolute', top: '18px', right: '18px', background: 'rgba(0,0,0,0.5)', border: 'none',
                borderRadius: '50%', fontSize: '22px', cursor: 'pointer', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textHighlight,
                transition: theme.transition, boxShadow: theme.shadowSm, zIndex: 10 /* Ensure it's above image */ }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div style={{ position: 'relative' }}>
              <img src={selectedProject.image_url || `https://source.unsplash.com/random/800x300?business,workspace,${selectedProject.id}`} alt={selectedProject.title}
                style={{ width: '100%', height: '300px', objectFit: 'cover', borderTopLeftRadius: theme.borderRadius, borderTopRightRadius: theme.borderRadius, display: 'block' }}/>
            </div>
            <div style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: theme.textHighlight, fontWeight: 600 }}>{selectedProject.title}</h2>
                    <span className="status-badge" style={{ background: getStatusThemeColor(selectedProject.status).bg, color: getStatusThemeColor(selectedProject.status).text, border: `1px solid ${getStatusThemeColor(selectedProject.status).border}` }}>
                        {selectedProject.status}
                    </span>
                </div>
                <p style={{ margin: '0 0 25px', fontSize: '1rem', lineHeight: 1.7, color: theme.text }}>
                    {selectedProject.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '30px', borderTop: `1px solid ${theme.cardBorder}`, paddingTop:'25px' }}>
                     <div>
                        <h4 style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: '0.9rem', fontWeight: 500, textTransform:'uppercase', letterSpacing: '0.5px' }}>Client</h4>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: theme.text }}>{selectedProject.client}</p>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: '0.9rem', fontWeight: 500, textTransform:'uppercase', letterSpacing: '0.5px' }}>Budget</h4>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: theme.success }}>${selectedProject.budget.toLocaleString()}</p>
                    </div>
                     <div>
                        <h4 style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: '0.9rem', fontWeight: 500, textTransform:'uppercase', letterSpacing: '0.5px' }}>Start Date</h4>
                        <p style={{ margin: 0, fontSize: '1rem', color: theme.text }}>{selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'Not set'}</p>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: '0.9rem', fontWeight: 500, textTransform:'uppercase', letterSpacing: '0.5px' }}>End Date</h4>
                        <p style={{ margin: 0, fontSize: '1rem', color: theme.text }}>{selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : 'Not set'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '20px' }}>
                    <button onClick={(e) => handleEditProject(selectedProject, e)} style={{ ...warningButtonStyle, gap: '8px' }}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit Project
                    </button>
                    <button onClick={(e) => handleDeleteConfirm(selectedProject, e)} style={{ ...dangerButtonStyle, gap: '8px' }}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete Project
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProject && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" style={{ width: '450px', maxWidth: '90%', textAlign: 'center', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
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
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: `${theme.errorText}20`, color: theme.errorText, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            <h3 style={{ margin: '0 0 10px', color: theme.textHighlight }}>Delete Project</h3>
            <p style={{ margin: '0 0 25px', color: theme.textSecondary, fontSize: '1rem' }}>
              Are you sure you want to delete <strong style={{color: theme.secondary}}>{deleteConfirmProject.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={handleCancelDelete} style={secondaryButtonStyle}>Cancel</button>
              <button onClick={handleDeleteProject} style={dangerButtonStyle}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProjects;