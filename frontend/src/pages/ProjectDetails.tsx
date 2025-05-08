import React, { useState, useEffect, CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define extended Project interface with the new fields
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
  
  // Additional detailed fields
  tech_stack?: string; // JSON string of technologies used
  team_members?: string; // JSON string of team members
  milestones?: string; // JSON string of project milestones
  phases?: string; // JSON string of project phases
  risks?: string; // JSON string of identified risks
  documents?: string; // JSON string of project document links
  success_metrics?: string; // JSON string of KPIs and metrics
  client_feedback?: string; // Client feedback on project
  priority?: string; // Project priority (High, Medium, Low)
  payment_status?: string; // Current payment status
}

// Define TypeScript interfaces for the structured data
interface TeamMember {
  id: number;
  name: string;
  role: string;
  email?: string;
  avatarUrl?: string;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  completion_percentage: number;
}

interface Phase {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  description: string;
  tasks: PhaseTask[];
}

interface PhaseTask {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Blocked';
  assignee?: string;
  due_date?: string;
}

interface Risk {
  id: number;
  title: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: 'Low' | 'Medium' | 'High';
  mitigation_plan: string;
  status: 'Open' | 'Mitigated' | 'Closed';
}

interface Document {
  id: number;
  title: string;
  url: string;
  type: 'Specification' | 'Design' | 'Contract' | 'Report' | 'Other';
  uploaded_at: string;
}

interface Metric {
  id: number;
  name: string;
  target: string;
  current: string;
  unit: string;
  status: 'On Track' | 'At Risk' | 'Off Track';
}

// Theme hook
const useProjectTheme = () => {
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
    danger: '#e03131',
    warning: '#fab005',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    borderRadius: '16px',
    borderRadiusSm: '10px',
    shadow: '0 8px 24px rgba(0,0,0,0.5)',
    shadowSm: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };
};

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useProjectTheme();
  
  // State management
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [editMode, setEditMode] = useState<boolean>(false);
  
  // Parsed data states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(response.data);
        
        // Parse JSON strings into structured data
        if (response.data.team_members) {
          try {
            setTeamMembers(JSON.parse(response.data.team_members));
          } catch (e) {
            console.error('Error parsing team members:', e);
            setTeamMembers([]);
          }
        }
        
        if (response.data.milestones) {
          try {
            setMilestones(JSON.parse(response.data.milestones));
          } catch (e) {
            console.error('Error parsing milestones:', e);
            setMilestones([]);
          }
        }
        
        if (response.data.phases) {
          try {
            setPhases(JSON.parse(response.data.phases));
          } catch (e) {
            console.error('Error parsing phases:', e);
            setPhases([]);
          }
        }
        
        if (response.data.risks) {
          try {
            setRisks(JSON.parse(response.data.risks));
          } catch (e) {
            console.error('Error parsing risks:', e);
            setRisks([]);
          }
        }
        
        if (response.data.documents) {
          try {
            setDocuments(JSON.parse(response.data.documents));
          } catch (e) {
            console.error('Error parsing documents:', e);
            setDocuments([]);
          }
        }
        
        if (response.data.success_metrics) {
          try {
            setMetrics(JSON.parse(response.data.success_metrics));
          } catch (e) {
            console.error('Error parsing metrics:', e);
            setMetrics([]);
          }
        }
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [id]);
  
  // Function to render the status badge with appropriate styling
  const renderStatusBadge = (status: string) => {
    const theme = useProjectTheme();
    let backgroundColor, textColor;
    
    switch(status) {
      case 'Completed':
        backgroundColor = `${theme.success}30`;
        textColor = theme.success;
        break;
      case 'In Progress':
        backgroundColor = `${theme.primary}30`;
        textColor = theme.primary;
        break;
      case 'On Hold':
        backgroundColor = `${theme.pending}30`;
        textColor = theme.pending;
        break;
      case 'Cancelled':
        backgroundColor = `${theme.errorText}30`;
        textColor = theme.errorText;
        break;
      default:
        backgroundColor = 'rgba(255, 255, 255, 0.1)';
        textColor = theme.textSecondary;
    }
    
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 12px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 500,
          backgroundColor,
          color: textColor
        }}
      >
        {status}
      </span>
    );
  };
  
  // Function to format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleGoBack = () => {
    navigate('/business-projects');
  };
  
  // Helper methods for Overview tab
  const getOverallProgress = () => {
    // Calculate based on milestones or phases completion
    if (milestones.length > 0) {
      const completedMilestones = milestones.filter(
        m => m.status === 'Completed'
      ).length;
      return Math.round((completedMilestones / milestones.length) * 100);
    }
    
    // Fallback to timeline progress if no milestones
    return getTimelineProgress();
  };

  const getBudgetUsedPercentage = () => {
    // This would typically come from actual cost data
    // For now, let's generate a random value between 10-90%
    return Math.floor(Math.random() * 80) + 10;
  };

  const getTimelineProgress = () => {
    if (!project?.start_date || !project?.end_date) return 0;
    
    const startDate = new Date(project.start_date).getTime();
    const endDate = new Date(project.end_date).getTime();
    const today = new Date().getTime();
    
    if (today <= startDate) return 0;
    if (today >= endDate) return 100;
    
    const totalDuration = endDate - startDate;
    const elapsedDuration = today - startDate;
    
    return Math.round((elapsedDuration / totalDuration) * 100);
  };

  const renderTechStack = () => {
    if (!project?.tech_stack) {
      const defaultTech = ['React', 'TypeScript', 'Node.js', 'Express', 'SQLite'];
      
      return defaultTech.map((tech, index) => (
        <span 
          key={index}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            backgroundColor: `${theme.primary}${20 + index * 10}`,
            color: theme.textHighlight,
            fontWeight: 500,
            fontSize: '14px',
            border: `1px solid ${theme.primary}${30 + index * 10}`,
          }}
        >
          {tech}
        </span>
      ));
    }
    
    let techStack: string[] = [];
    try {
      techStack = JSON.parse(project.tech_stack);
    } catch (e) {
      // If parsing fails, try to split by comma
      techStack = project.tech_stack.split(',').map(item => item.trim());
    }
    
    return techStack.map((tech, index) => (
      <span 
        key={index}
        style={{
          padding: '6px 12px',
          borderRadius: '16px',
          backgroundColor: `${theme.primary}${20 + index * 10}`,
          color: theme.textHighlight,
          fontWeight: 500,
          fontSize: '14px',
          border: `1px solid ${theme.primary}${30 + index * 10}`,
        }}
      >
        {tech}
      </span>
    ));
  };

  const getNextMilestone = () => {
    if (milestones.length === 0) return null;
    
    const incompleteMilestones = milestones.filter(
      m => m.status !== 'Completed'
    );
    
    if (incompleteMilestones.length === 0) return null;
    
    return incompleteMilestones.sort((a, b) => {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })[0];
  };

  const getOpenRisksCount = () => {
    return risks.filter(risk => risk.status === 'Open').length;
  };

  const getRiskCountByImpact = (impact: string) => {
    return risks.filter(
      risk => risk.status === 'Open' && risk.impact === impact
    ).length;
  };
  
  // Additional helper functions for Phases tab
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isDatePast = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date < today;
  };

  const isDateInRange = (date: Date, startDateStr?: string, endDateStr?: string) => {
    if (!startDateStr || !endDateStr) return false;
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    return date >= startDate && date <= endDate;
  };

  const getDatePositionPercentage = (date: Date) => {
    if (!project?.start_date || !project?.end_date) return 0;
    
    const startDate = new Date(project.start_date).getTime();
    const endDate = new Date(project.end_date).getTime();
    const targetDate = date.getTime();
    
    if (targetDate <= startDate) return 0;
    if (targetDate >= endDate) return 100;
    
    const totalDuration = endDate - startDate;
    const elapsedDuration = targetDate - startDate;
    
    return (elapsedDuration / totalDuration) * 100;
  };

  const getPhaseWidthPercentage = (phase: Phase) => {
    if (!project?.start_date || !project?.end_date) return 0;
    
    const projectStartDate = new Date(project.start_date).getTime();
    const projectEndDate = new Date(project.end_date).getTime();
    const phaseStartDate = new Date(phase.start_date).getTime();
    const phaseEndDate = new Date(phase.end_date).getTime();
    
    const projectDuration = projectEndDate - projectStartDate;
    const phaseDuration = phaseEndDate - phaseStartDate;
    
    return (phaseDuration / projectDuration) * 100;
  };

  const getPhaseById = (id: number) => {
    return phases.find(phase => phase.id === id) || null;
  };
  
  // Custom ProgressBar component
  const ProgressBar: React.FC<{ value: number, isOverBudget?: boolean, className?: string }> = ({ value, isOverBudget, className }) => {
    const theme = useProjectTheme();

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
      backgroundColor: isOverBudget ? theme.errorText : theme.primary,
      borderRadius: '4px',
      transition: 'width 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
      boxShadow: `0 0 10px ${isOverBudget ? theme.errorText : theme.primary}90`,
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
    const theme = useProjectTheme();

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`project-tabpanel-${index}`}
        aria-labelledby={`project-tab-${index}`}
        {...other}
      >
        {value === index && <div style={{ padding: '20px' }}>{children}</div>}
      </div>
    );
  }
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '80vh',
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.fontFamily
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: theme.primary,
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginLeft: '15px' }}>Loading project details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: theme.errorText,
        background: theme.bg,
        fontFamily: theme.fontFamily,
        minHeight: '100vh'
      }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button
          onClick={handleGoBack}
          style={{
            padding: '10px 16px',
            background: theme.primary,
            color: theme.textHighlight,
            border: 'none',
            borderRadius: theme.borderRadiusSm,
            cursor: 'pointer',
            marginTop: '20px',
            boxShadow: theme.shadowSm
          }}
        >
          Go Back to Projects
        </button>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.fontFamily,
        minHeight: '100vh'
      }}>
        <h3>Project Not Found</h3>
        <p>The project you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={handleGoBack}
          style={{
            padding: '10px 16px',
            background: theme.primary,
            color: theme.textHighlight,
            border: 'none',
            borderRadius: theme.borderRadiusSm,
            cursor: 'pointer',
            marginTop: '20px',
            boxShadow: theme.shadowSm
          }}
        >
          Go Back to Projects
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ 
      fontFamily: theme.fontFamily,
      background: theme.bg,
      color: theme.text,
      padding: '30px 40px',
      minHeight: '100vh',
      transition: theme.transition
    }} className="animate-fadeIn">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .tab-button {
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-weight: 500;
          color: #A0A0A0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .tab-button:hover {
          color: #BB86FC;
        }
        
        .tab-button.active {
          color: #BB86FC;
          border-bottom: 2px solid #BB86FC;
        }
        
        .card {
          background: rgba(30, 30, 30, 0.85);
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          padding: 24px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .card:hover {
          box-shadow: 0 12px 28px rgba(0,0,0,0.6);
          border-color: rgba(187, 134, 252, 0.3);
        }
        
        .progress-bar {
          height: 8px;
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        
        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .hover-card {
          transition: transform 0.2s ease, border-color 0.3s ease;
        }
        
        .hover-card:hover {
          transform: translateY(-4px);
          border-color: #BB86FC;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1E1E1E;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(187, 134, 252, 0.5);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(187, 134, 252, 0.8);
        }
        `}
      </style>
      
      {/* Header section with navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <button
          onClick={handleGoBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            color: theme.textSecondary,
            padding: '8px 0',
            marginRight: '16px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: theme.transition
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span style={{ marginLeft: '8px' }}>Back to Projects</span>
        </button>
        
        <div style={{ flex: 1 }} />
        
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            background: editMode ? 'rgba(255, 255, 255, 0.1)' : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryVariant} 100%)`,
            color: editMode ? theme.textSecondary : theme.textHighlight,
            borderRadius: theme.borderRadiusSm,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            boxShadow: theme.shadowSm,
            marginRight: '12px',
            transition: theme.transition
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          {editMode ? 'Cancel Editing' : 'Edit Project'}
        </button>
      </div>
      
      {/* Project Title and Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2.8rem',
          fontWeight: 700,
          background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 0 15px ${theme.primary}30`
        }}>
          {project.title}
        </h1>
        {renderStatusBadge(project.status)}
      </div>
      
      {/* Project Hero Section */}
      <div style={{
        display: 'flex',
        marginBottom: '32px',
        gap: '24px',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row'
      }}>
        <div style={{ flex: '0 0 300px' }}>
          <img 
            src={project.image_url || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'} 
            alt={project.title} 
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover',
              borderRadius: theme.borderRadius,
              boxShadow: theme.shadow
            }}
          />
          
          <div style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: theme.cardBg,
            padding: '20px',
            borderRadius: theme.borderRadius,
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: theme.shadowSm,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
            <div>
              <p style={{ 
                margin: '0 0 4px', 
                color: theme.textSecondary,
                fontSize: '13px',
                fontWeight: 500
              }}>CLIENT</p>
              <p style={{ 
                margin: 0, 
                color: theme.text,
                fontWeight: 600
              }}>{project.client}</p>
            </div>
            
            <div>
              <p style={{ 
                margin: '0 0 4px', 
                color: theme.textSecondary,
                fontSize: '13px',
                fontWeight: 500
              }}>BUDGET</p>
              <p style={{ 
                margin: 0, 
                color: theme.text,
                fontWeight: 600
              }}>${project.budget?.toLocaleString() || 'Not set'}</p>
            </div>
            
            <div>
              <p style={{ 
                margin: '0 0 4px', 
                color: theme.textSecondary,
                fontSize: '13px',
                fontWeight: 500
              }}>START DATE</p>
              <p style={{ 
                margin: 0, 
                color: theme.text
              }}>{formatDate(project.start_date)}</p>
            </div>
            
            <div>
              <p style={{ 
                margin: '0 0 4px', 
                color: theme.textSecondary,
                fontSize: '13px',
                fontWeight: 500
              }}>END DATE</p>
              <p style={{ 
                margin: 0, 
                color: theme.text
              }}>{formatDate(project.end_date)}</p>
            </div>
            
            {project.priority && (
              <div>
                <p style={{ 
                  margin: '0 0 4px', 
                  color: theme.textSecondary,
                  fontSize: '13px',
                  fontWeight: 500
                }}>PRIORITY</p>
                <p style={{ 
                  margin: 0, 
                  color: 
                    project.priority === 'High' ? theme.errorText :
                    project.priority === 'Medium' ? theme.pending :
                    theme.success,
                  fontWeight: 600
                }}>{project.priority}</p>
              </div>
            )}
            
            {project.payment_status && (
              <div>
                <p style={{ 
                  margin: '0 0 4px', 
                  color: theme.textSecondary,
                  fontSize: '13px',
                  fontWeight: 500
                }}>PAYMENT</p>
                <p style={{ 
                  margin: 0, 
                  color: theme.text,
                  fontWeight: 500
                }}>{project.payment_status}</p>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ 
          flex: 1,
          background: theme.cardBg,
          padding: '24px',
          borderRadius: theme.borderRadius,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.shadow,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px',
            color: theme.text,
            fontSize: '1.4rem',
            fontWeight: 600
          }}>Project Description</h3>
          
          <p style={{ 
            margin: '0 0 24px', 
            color: theme.textSecondary,
            lineHeight: 1.6,
            fontSize: '15px'
          }}>
            {project.description}
          </p>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.cardBorder}`,
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span style={{ marginRight: '8px' }}>📊</span>
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'phases' ? 'active' : ''}`}
          onClick={() => setActiveTab('phases')}
        >
          <span style={{ marginRight: '8px' }}>🔄</span>
          Phases & Tasks
        </button>
        <button 
          className={`tab-button ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          <span style={{ marginRight: '8px' }}>🏁</span>
          Milestones
        </button>
        <button 
          className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <span style={{ marginRight: '8px' }}>👥</span>
          Team
        </button>
        <button 
          className={`tab-button ${activeTab === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          <span style={{ marginRight: '8px' }}>⚠️</span>
          Risks
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <span style={{ marginRight: '8px' }}>📄</span>
          Documents
        </button>
        <button 
          className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <span style={{ marginRight: '8px' }}>📈</span>
          Success Metrics
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div style={{ animation: 'fadeIn 0.3s ease' }}>
        {activeTab === 'overview' && (
          <div>
            {/* Project Progress Overview */}
            <div className="card">
              <h3 style={{ 
                margin: '0 0 20px',
                fontSize: '1.6rem',
                fontWeight: 600,
                color: theme.text
              }}>Project Progress</h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {/* Overall Progress */}
                <div style={{
                  padding: '16px',
                  borderRadius: theme.borderRadiusSm,
                  backgroundColor: `${theme.primary}15`,
                  border: `1px solid ${theme.primary}30`
                }}
                  onMouseEnter={() => setHoveredCard('overall-progress')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{ margin: 0, fontWeight: 600, color: theme.text }}>Overall Progress</h4>
                    <span style={{ fontWeight: 700, fontSize: '20px', color: theme.primary }}>
                      {getOverallProgress()}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${getOverallProgress()}%`,
                        background: `linear-gradient(90deg, ${theme.primary}, ${theme.primaryVariant})`,
                        boxShadow: `0 0 10px ${theme.primary}90`
                      }}
                    />
                  </div>
                </div>
                
                {/* Budget Used */}
                <div style={{
                  padding: '16px',
                  borderRadius: theme.borderRadiusSm,
                  backgroundColor: `${theme.success}15`,
                  border: `1px solid ${theme.success}30`
                }}
                  onMouseEnter={() => setHoveredCard('budget-used')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{ margin: 0, fontWeight: 600, color: theme.text }}>Budget Allocation</h4>
                    <span style={{ fontWeight: 700, fontSize: '20px', color: theme.success }}>
                      {getBudgetUsedPercentage()}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${getBudgetUsedPercentage()}%`,
                        background: `linear-gradient(90deg, ${theme.success}, ${theme.secondary})`,
                        boxShadow: `0 0 10px ${theme.success}90`
                      }}
                    />
                  </div>
                </div>
                
                {/* Timeline Progress */}
                <div style={{
                  padding: '16px',
                  borderRadius: theme.borderRadiusSm,
                  backgroundColor: `${theme.pending}15`,
                  border: `1px solid ${theme.pending}30`
                }}
                  onMouseEnter={() => setHoveredCard('timeline-progress')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{ margin: 0, fontWeight: 600, color: theme.text }}>Timeline</h4>
                    <span style={{ fontWeight: 700, fontSize: '20px', color: theme.pending }}>
                      {getTimelineProgress()}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${getTimelineProgress()}%`,
                        background: `linear-gradient(90deg, ${theme.pending}, ${theme.secondary})`,
                        boxShadow: `0 0 10px ${theme.pending}90`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tech Stack */}
            <div className="card">
              <h3 style={{ 
                margin: '0 0 20px',
                fontSize: '1.6rem',
                fontWeight: 600,
                color: theme.text
              }}>Technology Stack</h3>
              
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                {renderTechStack()}
              </div>
            </div>
            
            {/* Key Information */}
            <div className="card">
              <h3 style={{ 
                margin: '0 0 20px',
                fontSize: '1.6rem',
                fontWeight: 600,
                color: theme.text
              }}>Key Information</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {/* Next Milestone */}
                <div 
                  style={{
                    padding: '16px',
                    borderRadius: theme.borderRadiusSm,
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.cardBorder}`,
                    transition: theme.transition,
                    transform: hoveredCard === 'next-milestone' ? 'translateY(-5px)' : 'none',
                    borderColor: hoveredCard === 'next-milestone' ? theme.primary : theme.cardBorder
                  }}
                  onMouseEnter={() => setHoveredCard('next-milestone')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h4 style={{
                    margin: '0 0 10px',
                    color: theme.textSecondary,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600
                  }}>Next Milestone</h4>
                  
                  {getNextMilestone() ? (
                    <div>
                      <p style={{ 
                        margin: '0 0 5px',
                        fontWeight: 600,
                        fontSize: '16px',
                        color: theme.text
                      }}>
                        {getNextMilestone()?.title}
                      </p>
                      <p style={{ 
                        margin: '0 0 8px',
                        color: theme.textSecondary,
                        fontSize: '14px'
                      }}>
                        Due: {formatDate(getNextMilestone()?.due_date)}
                      </p>
                      {renderStatusBadge(getNextMilestone()?.status || '')}
                    </div>
                  ) : (
                    <p style={{ color: theme.textSecondary }}>No upcoming milestones</p>
                  )}
                </div>
                
                {/* Open Risks */}
                <div 
                  style={{
                    padding: '16px',
                    borderRadius: theme.borderRadiusSm,
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.cardBorder}`,
                    transition: theme.transition,
                    transform: hoveredCard === 'open-risks' ? 'translateY(-5px)' : 'none',
                    borderColor: hoveredCard === 'open-risks' ? theme.primary : theme.cardBorder
                  }}
                  onMouseEnter={() => setHoveredCard('open-risks')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h4 style={{
                    margin: '0 0 10px',
                    color: theme.textSecondary,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600
                  }}>Open Risks</h4>
                  
                  <div>
                    <p style={{ 
                      margin: '0 0 5px',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: theme.text
                    }}>
                      {getOpenRisksCount()} Open Risk{getOpenRisksCount() !== 1 ? 's' : ''}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '8px'
                    }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: `${theme.errorText}20`,
                        color: theme.errorText
                      }}>
                        {getRiskCountByImpact('Critical')} Critical
                      </span>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: `${theme.pending}20`,
                        color: theme.pending
                      }}>
                        {getRiskCountByImpact('High')} High
                      </span>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: `${theme.primary}20`,
                        color: theme.primary
                      }}>
                        {getRiskCountByImpact('Medium')} Medium
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Team Size */}
                <div 
                  style={{
                    padding: '16px',
                    borderRadius: theme.borderRadiusSm,
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.cardBorder}`,
                    transition: theme.transition,
                    transform: hoveredCard === 'team-size' ? 'translateY(-5px)' : 'none',
                    borderColor: hoveredCard === 'team-size' ? theme.primary : theme.cardBorder
                  }}
                  onMouseEnter={() => setHoveredCard('team-size')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h4 style={{
                    margin: '0 0 10px',
                    color: theme.textSecondary,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600
                  }}>Team Size</h4>
                  
                  <p style={{ 
                    margin: '0 0 5px',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: theme.text
                  }}>
                    {teamMembers.length} Team Member{teamMembers.length !== 1 ? 's' : ''}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    marginTop: '8px'
                  }}>
                    {teamMembers.slice(0, 5).map((member, index) => (
                      <div 
                        key={member.id}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: `${theme.primary}${50 + index * 10}`,
                          color: theme.textHighlight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '12px',
                          border: '2px solid rgba(30, 30, 30, 0.9)',
                          marginLeft: index > 0 ? '-8px' : '0',
                          position: 'relative',
                          zIndex: 5 - index,
                          backgroundImage: member.avatarUrl ? `url(${member.avatarUrl})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                        title={member.name}
                      >
                        {!member.avatarUrl && member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    
                    {teamMembers.length > 5 && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: theme.bgLight,
                        color: theme.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '12px',
                        border: '2px solid rgba(30, 30, 30, 0.9)',
                        marginLeft: '-8px'
                      }}>
                        +{teamMembers.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Client Feedback */}
            {project.client_feedback && (
              <div className="card">
                <h3 style={{ 
                  margin: '0 0 20px',
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  color: theme.text
                }}>Client Feedback</h3>
                
                <div style={{
                  padding: '16px',
                  backgroundColor: theme.bgLight,
                  borderRadius: theme.borderRadiusSm,
                  borderLeft: `4px solid ${theme.primary}`
                }}>
                  <p style={{ 
                    margin: 0,
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: theme.text
                  }}>
                    "{project.client_feedback}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'phases' && (
          <div>
            {phases.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h3 style={{ 
                  color: theme.text,
                  fontWeight: 600,
                  margin: '0 0 10px' 
                }}>No Phases Defined</h3>
                <p style={{ color: theme.textSecondary, margin: '0 0 20px' }}>
                  This project doesn't have any phases defined yet.
                </p>
                {editMode && (
                  <button
                    style={{
                      padding: '8px 16px',
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryVariant} 100%)`,
                      color: theme.textHighlight,
                      border: 'none',
                      borderRadius: theme.borderRadiusSm,
                      cursor: 'pointer',
                      boxShadow: theme.shadowSm
                    }}
                    onClick={() => {
                      // This would open phase creation form in real implementation
                      // For now, let's add a sample phase
                      setPhases([
                        {
                          id: 1,
                          name: 'Planning',
                          start_date: new Date().toISOString().split('T')[0],
                          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          status: 'In Progress',
                          description: 'Initial planning phase including requirements gathering and project scope definition.',
                          tasks: [
                            {
                              id: 1,
                              title: 'Gather requirements',
                              status: 'Done',
                              assignee: 'John Doe',
                              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                            },
                            {
                              id: 2,
                              title: 'Define project scope',
                              status: 'In Progress',
                              assignee: 'Jane Smith',
                              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                            }
                          ]
                        }
                      ]);
                    }}
                  >
                    Add First Phase
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Phases overview */}
                <div className="card">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{ 
                      margin: 0,
                      fontSize: '1.6rem',
                      fontWeight: 600,
                      color: theme.text
                    }}>Project Phases</h3>
                    
                    {editMode && (
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: theme.bgLight,
                          color: theme.textSecondary,
                          borderRadius: theme.borderRadiusSm,
                          border: `1px solid ${theme.cardBorder}`,
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: theme.transition
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Phase
                      </button>
                    )}
                  </div>
                  
                  {/* Phase timeline */}
                  <div style={{
                    marginBottom: '24px',
                    position: 'relative',
                    paddingTop: '30px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0 40px'
                    }}>
                      <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                        {formatDate(project.start_date)}
                      </span>
                      <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                        {formatDate(project.end_date)}
                      </span>
                    </div>
                    
                    <div style={{
                      height: '6px',
                      backgroundColor: theme.bgLight,
                      borderRadius: '3px',
                      position: 'relative'
                    }}>
                      {/* Today marker */}
                      {isDateInRange(new Date(), project.start_date, project.end_date) && (
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          left: `${getDatePositionPercentage(new Date())}%`,
                          width: '2px',
                          height: '14px',
                          backgroundColor: theme.pending,
                          zIndex: 2
                        }} />
                      )}
                      
                      {/* Phase segments */}
                      {phases.map((phase, index) => (
                        <div 
                          key={phase.id} 
                          style={{
                            position: 'absolute',
                            left: `${getDatePositionPercentage(new Date(phase.start_date))}%`,
                            width: `${getPhaseWidthPercentage(phase)}%`,
                            height: '6px',
                            backgroundColor: 
                              phase.status === 'Completed' ? theme.success :
                              phase.status === 'In Progress' ? theme.primary :
                              'rgba(255, 255, 255, 0.2)',
                            borderRadius: '3px',
                            zIndex: 1
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Phase cards */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {phases.map(phase => (
                      <div 
                        key={phase.id}
                        className="hover-card"
                        style={{
                          padding: '16px',
                          borderRadius: theme.borderRadiusSm,
                          border: `1px solid ${hoveredCard === `phase-${phase.id}` ? theme.primary : theme.cardBorder}`,
                          backgroundColor: theme.bgLight,
                          boxShadow: hoveredCard === `phase-${phase.id}` ? `0 12px 28px rgba(0,0,0,0.6)` : theme.shadowSm,
                          cursor: 'pointer',
                          transition: theme.transition,
                          transform: hoveredCard === `phase-${phase.id}` ? 'translateY(-5px)' : 'none'
                        }}
                        onClick={() => setActivePhase(phase.id === activePhase ? null : phase.id)}
                        onMouseEnter={() => setHoveredCard(`phase-${phase.id}`)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <h4 style={{ 
                            margin: 0,
                            fontWeight: 600,
                            color: theme.text
                          }}>
                            {phase.name}
                          </h4>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              backgroundColor: 
                                phase.status === 'Completed' ? `${theme.success}30` :
                                phase.status === 'In Progress' ? `${theme.primary}30` :
                                'rgba(255, 255, 255, 0.1)',
                              color:
                                phase.status === 'Completed' ? theme.success :
                                phase.status === 'In Progress' ? theme.primary :
                                theme.textSecondary
                            }}
                          >
                            {phase.status}
                          </span>
                        </div>
                        
                        <p style={{ 
                          margin: '0 0 12px',
                          fontSize: '14px',
                          color: theme.textSecondary,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {phase.description}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          color: theme.textSecondary
                        }}>
                          <span>{formatDateShort(phase.start_date)} - {formatDateShort(phase.end_date)}</span>
                          <span>{phase.tasks.length} tasks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Active phase detail */}
                {activePhase !== null && (
                  <div className="card" style={{ animation: 'slideIn 0.3s ease' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{ 
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: 600
                      }}>
                        {getPhaseById(activePhase)?.name} Tasks
                      </h3>
                      
                      {editMode && (
                        <button
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 12px',
                            backgroundColor: theme.grey[100],
                            color: theme.grey[700],
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Add Task
                        </button>
                      )}
                    </div>
                    
                    {/* Task list */}
                    <div>
                      {getPhaseById(activePhase)?.tasks.map(task => (
                        <div
                          key={task.id}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: theme.grey[50],
                            borderRadius: '6px',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              marginRight: '12px',
                              border: `2px solid ${
                                task.status === 'Done' ? theme.success.main :
                                task.status === 'In Progress' ? theme.primary.main :
                                task.status === 'Blocked' ? theme.danger.main :
                                theme.grey[400]
                              }`,
                              backgroundColor: task.status === 'Done' ? theme.success.main : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {task.status === 'Done' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            
                            <div>
                              <div style={{ 
                                fontWeight: 500,
                                textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                                color: task.status === 'Done' ? theme.grey[500] : theme.grey[900]
                              }}>
                                {task.title}
                              </div>
                              
                              {task.assignee && (
                                <div style={{ 
                                  fontSize: '13px',
                                  color: theme.grey[600],
                                  marginTop: '4px'
                                }}>
                                  Assigned to: {task.assignee}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {task.due_date && (
                              <div style={{
                                fontSize: '13px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: 
                                  isDatePast(task.due_date) && task.status !== 'Done' 
                                    ? theme.danger.light + '20'
                                    : theme.grey[200],
                                color: 
                                  isDatePast(task.due_date) && task.status !== 'Done'
                                    ? theme.danger.dark
                                    : theme.grey[700],
                                marginRight: '8px'
                              }}>
                                {formatDateShort(task.due_date)}
                              </div>
                            )}
                            
                            {editMode && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: theme.primary.main,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                
                                <button
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: theme.danger.main,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Other tab content will be added separately */}
      </div>
    </div>
  );
};

export default ProjectDetails; 